import { Request, Response, NextFunction, Express } from 'express';
import { db } from '../db.js'; 
import { users } from '../../shared/schema.js';
import { eq } from 'drizzle-orm';
import session from 'express-session';
import ConnectPgSimple from 'connect-pg-simple';
import { Pool } from 'pg';
import '../types.js';
import { getAuth, FirebaseAuthError } from 'firebase-admin/auth';

const PgStore = ConnectPgSimple(session);

const sessionPool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

export function setupFirebaseAuth(app: Express) {
  const isProduction = process.env.NODE_ENV === 'production';

  const sessionStore = isProduction
    ? new PgStore({
        pool: sessionPool,
        tableName: 'user_sessions',
        createTableIfMissing: false, 
      })
    : undefined; 

  const sessionConfig = {
    store: sessionStore,
    secret: process.env.SESSION_SECRET || 'fallback-secret-key-for-dev',
    resave: false,
    saveUninitialized: false,
    name: 'sessionId',
    cookie: {
      secure: isProduction, 
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000 * 14, // 14 days
      sameSite: isProduction ? ('none' as const) : ('lax' as const),
      // THE FINAL FIX: Explicitly set the domain for the production cookie.
      // This tells the browser exactly which domain the cookie belongs to,
      // resolving the cross-site cookie rejection issue.
      domain: isProduction ? 'ubatuba-guias.web.app' : undefined,
    },
  };

  app.use(session(sessionConfig));
}

// ... (o restante do arquivo permanece o mesmo) ...
interface FirebaseUserToken {
  idToken: string;
}

export async function handleFirebaseLogin(req: Request, res: Response) {
  try {
    const { idToken } = req.body as FirebaseUserToken;
    if (!idToken) return res.status(400).json({ error: 'Missing Firebase ID token' });

    const decodedToken = await getAuth().verifyIdToken(idToken);
    const { uid, email, name, picture } = decodedToken;
    if (!uid || !email) return res.status(400).json({ error: 'Invalid Firebase ID token' });

    let [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);

    if (!user) {
      const [firstName, ...lastNameParts] = (name || 'Usuário').split(' ');
      const lastName = lastNameParts.join(' ') || '';
      [user] = await db.insert(users).values({ id: uid, email, firstName, lastName, profileImageUrl: picture || null, userType: null, isProfileComplete: false }).returning();
    } else if (user.profileImageUrl !== (picture || null)) {
      [user] = await db.update(users).set({ profileImageUrl: picture || null }).where(eq(users.id, user.id)).returning();
    }

    req.session.userId = user.id;
    req.session.user = user;

    req.session.save((err) => {
      if (err) {
        console.error('❌ DATABASE SESSION SAVE ERROR:', err);
        if ('nativeError' in err) console.error('❌ NATIVE DB ERROR:', err.nativeError);
        res.status(500).json({ error: 'Erro ao salvar sessão' });
      } else {
        res.json(user);
      }
    });
  } catch (error) {
    console.error('❌ Erro no login Firebase:', error);
    if (error instanceof FirebaseAuthError) {
      if (error.code === 'auth/id-token-expired' || error.code === 'auth/invalid-id-token') {
        return res.status(401).json({ error: 'Token inválido ou expirado. Por favor, faça login novamente.' });
      }
    }
    res.status(500).json({ error: 'Erro no login' });
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.session.userId) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  next();
}

export async function getCurrentUser(req: Request, res: Response) {
  if (!req.session.userId) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  try {
    const [user] = await db.select().from(users).where(eq(users.id, req.session.userId)).limit(1);
    if (!user) {
      req.session.destroy(() => {});
      return res.status(401).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('❌ Erro ao buscar usuário:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
}

export function handleLogout(req: Request, res: Response) {
  req.session.destroy((err) => {
    if (err) {
      console.error('❌ Erro ao fazer logout:', err);
      return res.status(500).json({ error: 'Erro ao fazer logout' });
    }
    res.json({ message: 'Logout realizado com sucesso' });
  });
}
