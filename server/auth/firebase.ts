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
const pgPool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: isProduction ? { rejectUnauthorized: false } : undefined,
});

pgPool.on('error', (err) => {
  console.error('[CRITICAL] PostgreSQL Pool Error:', err);
});

// Encerramento gracioso do pool (PM2, Docker, etc.)
['SIGINT', 'SIGTERM'].forEach((sig) => {
  process.on(sig as NodeJS.Signals, async () => {
    try {
      await pgPool.end();
      console.log('[INFO] PostgreSQL pool closed');
    } catch (e) {
      console.error('[ERROR] Closing PostgreSQL pool:', e);
    } finally {
      process.exit(0);
    }
  });
});

// ───────────────────────────────────────────────────────────
// Setup de sessão
// ───────────────────────────────────────────────────────────
type SetupSessionOptions = {
  /**
   * Caso esteja atrás de proxy/load balancer (Heroku, Render, Cloud Run, etc.)
   * ative para que cookies `secure` funcionem corretamente.
   */
  trustProxy?: boolean;
  /**
   * Renovar o cookie a cada request autenticada (default: true).
   */
  rolling?: boolean;
};

export function setupSession(app: express.Express, options: SetupSessionOptions = {}) {
  if (options.trustProxy ?? isProduction) {
    // Necessário quando `cookie.secure = true` atrás de proxy (X-Forwarded-Proto)
    app.set('trust proxy', 1);
  }

  const usePgStore = isProduction && !!process.env.DATABASE_URL;
  const store = usePgStore
    ? new PgSession({
        pool: pgPool,
        tableName: 'session', // garanta que a tabela exista; vide docs do connect-pg-simple
        // pruneSessionInterval: 60, // opcional
      })
    : new MemStore({ checkPeriod: 24 * 60 * 60 * 1000 });

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
      secure: isProduction,              // exige HTTPS em produção
      httpOnly: true,                    // não acessível via JS
      sameSite: isProduction ? 'none' : 'lax', // necessário para cross-site em produção (ex.: SPA em domínio distinto)
      maxAge: 14 * 24 * 60 * 60 * 1000,  // 14 dias
    },
  };

  app.use(session(sessionConfig));
}

// ───────────────────────────────────────────────────────────
// Helpers
// ───────────────────────────────────────────────────────────
function getSessionUserId(req: Request): string | undefined {
  return req.session?.userId;
}

async function findOrCreateUser(uid: string) {
  // Assumindo storage com getUser/upsertUser
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
    const decoded = await adminAuth.verifyIdToken(idToken);
    const uid = decoded.uid;

    // persiste o usuário na sessão
    req.session.userId = uid;

    const { user, isNewUser } = await findOrCreateUser(uid);

    // Salva sessão explicitamente antes de responder (evita race em ambientes serverless)
    req.session.save((err) => {
      if (err) {
        console.warn('[WARN] Session save failed, proceeding anyway:', err);
      }
      return res.status(isNewUser ? 201 : 200).json({ user, isNewUser });
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
    res.clearCookie('sessionId');
    return res.status(200).json({ message: 'Logged out successfully' });
  });
};

export const getCurrentUser = async (req: Request, res: Response) => {
  const userId = getSessionUserId(req);
  if (!userId) return res.status(401).json({ message: 'Not authenticated' });

  try {
    const user = await storage.getUser(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
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
