// auth-and-session.ts
import express, { Request, Response, NextFunction } from 'express';
import session from 'express-session';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import MemoryStore from 'memorystore';
import PgSimple from 'connect-pg-simple';
import { Pool } from 'pg';
import { storage } from '../storage';

// ───────────────────────────────────────────────────────────
// Tipagem da sessão (remove necessidade de @ts-ignore)
// ───────────────────────────────────────────────────────────
declare module 'express-session' {
  interface SessionData {
    userId?: string;
  }
}

const MemStore = MemoryStore(session);
const PgSession = PgSimple(session);

const isProduction = process.env.NODE_ENV === 'production';

// ───────────────────────────────────────────────────────────
// Utils de env
// ───────────────────────────────────────────────────────────
function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Environment variable ${name} is required`);
  }
  return value;
}

function getOptionalJson<T = any>(raw?: string): T | undefined {
  if (!raw) return undefined;
  try {
    return JSON.parse(raw) as T;
  } catch (e) {
    console.error(`[CRITICAL] Invalid JSON for env variable:`, e);
    return undefined;
  }
}

// ───────────────────────────────────────────────────────────
// Firebase Admin init
// ───────────────────────────────────────────────────────────
if (getApps().length === 0) {
  if (isProduction) {
    // Em produção, usa ADC (GOOGLE_APPLICATION_CREDENTIALS) ou credenciais padrão do ambiente.
    initializeApp();
  } else {
    const serviceAccount = getOptionalJson<Record<string, any>>(process.env.FIREBASE_SERVICE_ACCOUNT);
    if (serviceAccount) {
      initializeApp({ credential: cert(serviceAccount) });
    } else {
      // Permite rodar localmente com emulador/ADC sem travar
      console.warn('[WARN] FIREBASE_SERVICE_ACCOUNT not provided for dev — initializing with default credentials.');
      initializeApp();
    }
  }
}

export const adminAuth = getAuth();

// ───────────────────────────────────────────────────────────
// Pool Postgres para sessões (produção)
// ───────────────────────────────────────────────────────────
let pgPool: Pool | null = null;

if (isProduction && process.env.DATABASE_URL) {
  pgPool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  pgPool.on('error', (err) => {
    console.error('[CRITICAL] PostgreSQL Pool Error:', err);
  });

  // Encerramento gracioso do pool (PM2, Docker, etc.)
  ['SIGINT', 'SIGTERM'].forEach((sig) => {
    process.on(sig as NodeJS.Signals, async () => {
      try {
        if (pgPool) {
          await pgPool.end();
          console.log('[INFO] PostgreSQL pool closed');
        }
      } catch (e) {
        console.error('[ERROR] Closing PostgreSQL pool:', e);
      } finally {
        process.exit(0);
      }
    });
  });
}

// ───────────────────────────────────────────────────────────
// Setup de sessão
// ───────────────────────────────────────────────────────────
type SetupSessionOptions = {
  trustProxy?: boolean;
  rolling?: boolean;
};

export function setupSession(app: express.Express, options: SetupSessionOptions = {}) {
  // IMPORTANTE: Configurar trust proxy APENAS uma vez aqui
  if (options.trustProxy ?? isProduction) {
    app.set('trust proxy', 1);
    console.log('✅ Trust proxy configurado para produção');
  }

  const usePgStore = isProduction && !!process.env.DATABASE_URL && pgPool !== null;
  
  const store = usePgStore && pgPool
    ? new PgSession({
        pool: pgPool,
        tableName: 'session',
        createTableIfMissing: true, // Importante: criar tabela se não existir
      })
    : new MemStore({ 
        checkPeriod: 24 * 60 * 60 * 1000,
        ttl: 14 * 24 * 60 * 60 * 1000 // 14 dias
      });

  if (typeof store.on === 'function') {
    // @ts-ignore
    store.on('error', (error: unknown) => {
      console.error('[CRITICAL] Session Store Error:', error);
    });
  }

  const sessionSecret = process.env.SESSION_SECRET ?? (() => {
    if (isProduction) {
      throw new Error('SESSION_SECRET is required in production');
    }
    console.warn('[WARN] Using an ephemeral development SESSION_SECRET');
    return Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
  })();

  const sessionConfig: session.SessionOptions = {
    store,
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    name: 'sessionId',
    rolling: options.rolling ?? true,
    cookie: {
      secure: isProduction,              
      httpOnly: true,                    
      sameSite: isProduction ? 'none' : 'lax', // IMPORTANTE para Firebase Hosting
      maxAge: 14 * 24 * 60 * 60 * 1000,  // 14 dias
      // domain: isProduction ? '.web.app' : undefined, // <<< REMOVIDO: Esta era a causa do problema
    },
  };

  console.log('📝 Configuração de sessão:', {
    store: usePgStore ? 'PostgreSQL' : 'Memory',
    secure: sessionConfig.cookie?.secure,
    sameSite: sessionConfig.cookie?.sameSite,
    domain: sessionConfig.cookie?.domain,
    isProduction
  });

  app.use(session(sessionConfig));
}

// ───────────────────────────────────────────────────────────
// Helpers
// ───────────────────────────────────────────────────────────
function getSessionUserId(req: Request): string | undefined {
  return req.session?.userId;
}

async function findOrCreateUser(uid: string) {
  let user = await storage.getUser(uid);
  if (user) return { user, isNewUser: false };

  const firebaseUser = await adminAuth.getUser(uid);
  const displayName = firebaseUser.displayName ?? '';
  const [firstName, ...rest] = displayName.split(' ').filter(Boolean);

  user = await storage.upsertUser({
    id: uid,
    email: firebaseUser.email ?? '',
    name: displayName,
    photoURL: firebaseUser.photoURL ?? '',
    firstName: firstName ?? '',
    lastName: rest.join(' ') ?? '',
  });

  return { user, isNewUser: true };
}

// ───────────────────────────────────────────────────────────
// Handlers de rota
// ───────────────────────────────────────────────────────────
export const handleFirebaseLogin = async (req: Request, res: Response) => {
  const { idToken } = req.body ?? {};
  if (!idToken || typeof idToken !== 'string') {
    return res.status(400).json({ message: 'idToken is required' });
  }

  try {
    console.log('🔐 Verificando token Firebase...');
    const decoded = await adminAuth.verifyIdToken(idToken);
    const uid = decoded.uid;
    
    console.log('✅ Token válido para usuário:', uid);

    // persiste o usuário na sessão
    req.session.userId = uid;

    const { user, isNewUser } = await findOrCreateUser(uid);

    // IMPORTANTE: Salvar sessão explicitamente e aguardar
    await new Promise<void>((resolve, reject) => {
      req.session.save((err) => {
        if (err) {
          console.error('❌ Erro ao salvar sessão:', err);
          reject(err);
        } else {
          console.log('✅ Sessão salva com sucesso para:', uid);
          resolve();
        }
      });
    });

    // Regenerar ID da sessão para segurança
    await new Promise<void>((resolve) => {
      req.session.regenerate((err) => {
        if (err) {
          console.warn('⚠️ Não foi possível regenerar sessão:', err);
        }
        req.session.userId = uid; // Re-atribuir após regeneração
        req.session.save(() => {
          resolve();
        });
      });
    });

    return res.status(isNewUser ? 201 : 200).json({ 
      user, 
      isNewUser,
      sessionId: req.sessionID // Para debug
    });
    
  } catch (error: any) {
    console.error('[CRITICAL] Error in handleFirebaseLogin:', error);
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

export const handleLogout = (req: Request, res: Response) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('[ERROR] Session destroy failed:', err);
      return res.status(500).json({ message: 'Could not log out, please try again.' });
    }
    // O domínio também deve ser removido daqui para garantir a limpeza correta
    res.clearCookie('sessionId', {
      path: '/',
    });
    return res.status(200).json({ message: 'Logged out successfully' });
  });
};

export const getCurrentUser = async (req: Request, res: Response) => {
  const userId = getSessionUserId(req);
  
  if (!userId) {
    // Adicionado log para clareza em caso de falha
    console.log('🔍 getCurrentUser - Falha: Nenhum userId na sessão. SessionID:', req.sessionID);
    console.log('🔍 getCurrentUser - Cookies recebidos:', req.cookies);
    return res.status(401).json({ message: 'Not authenticated' });
  }

  try {
    const user = await storage.getUser(userId);
    if (!user) {
      // Este caso pode acontecer se o usuário for deletado mas a sessão ainda existir
      console.warn('⚠️ getCurrentUser - Usuário da sessão não encontrado no DB:', userId);
      return res.status(404).json({ message: 'User not found' });
    }
    return res.json({ user });
  } catch (error) {
    console.error('[ERROR] Error fetching current user:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

// ───────────────────────────────────────────────────────────
// Middlewares
// ───────────────────────────────────────────────────────────
export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  const userId = getSessionUserId(req);
  
  if (userId) return next();

  console.log('🛡️ requireAuth - Falha: Acesso não autorizado. SessionID:', req.sessionID);
  console.log('🛡️ requireAuth - Cookies recebidos:', req.cookies);
  return res.status(401).json({ message: 'Unauthorized. Please log in.' });
};

export const requireAdmin = async (req: Request, res: Response, next: NextFunction) => {
  const userId = getSessionUserId(req);
  if (!userId) return res.status(401).json({ message: 'Unauthorized. Please log in.' });

  try {
    const user = await storage.getUser(userId);
    if (!user?.isAdmin) {
      return res.status(403).json({ message: 'Forbidden. Admin access required.' });
    }
    return next();
  } catch (error) {
    console.error('[ERROR] Error verifying admin role:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};
