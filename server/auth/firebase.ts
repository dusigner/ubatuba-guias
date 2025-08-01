import { Request, Response, NextFunction, Express } from 'express';
import { db } from '../db.js';
import { users } from '../../shared/schema.js';
import { eq } from 'drizzle-orm';
import session from 'express-session';
import MemoryStore from 'memorystore';
import '../types.js';

const MemStore = MemoryStore(session);

export function setupFirebaseAuth(app: Express) {
  // Configure session middleware with memory storage
  const sessionConfig = {
    store: new MemStore({
      checkPeriod: 86400000 // prune expired entries every 24h
    }),
    secret: process.env.SESSION_SECRET || 'fallback-secret-key-for-replit',
    resave: false,
    saveUninitialized: false,
    name: 'sessionId', // Custom session name
    cookie: {
      secure: false, // Desabilitar para todos os ambientes por enquanto
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000 * 7, // 7 days
      sameSite: 'lax' as const, // Importante para funcionar em domínios Replit
    },
  };

  console.log('Configurando sessões para ambiente:', process.env.NODE_ENV);
  console.log('Domain:', process.env.REPLIT_DOMAINS);
  
  app.use(session(sessionConfig));

  console.log('✅ Firebase Auth e Sessions configurados com MemoryStore');
}

// Firebase Admin SDK would be ideal here, but for simplicity we'll validate tokens client-side
// and trust the frontend authentication state for this demo

interface FirebaseUser {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
}

export async function handleFirebaseLogin(req: Request, res: Response) {
  try {
    const { uid, email, displayName, photoURL } = req.body as FirebaseUser;

    if (!uid || !email) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if user exists
    let existingUser = await db.select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    let user;
    if (existingUser.length === 0) {
      // Create new user
      const [firstName, ...lastNameParts] = (displayName || 'Usuário').split(' ');
      const lastName = lastNameParts.join(' ') || '';

      const [newUser] = await db.insert(users)
        .values({
          id: uid,
          email: email,
          firstName: firstName,
          lastName: lastName,
          profileImageUrl: photoURL || null,
          userType: null, // No default type - force profile selection
          isProfileComplete: false
        })
        .returning();
      user = newUser;
    } else {
      user = existingUser[0];
      
      // Update user info if needed
      if (user.profileImageUrl !== photoURL) {
        await db.update(users)
          .set({ profileImageUrl: photoURL || null })
          .where(eq(users.id, user.id));
        user.profileImageUrl = photoURL || null;
      }
    }

    // Set session
    req.session.userId = user.id;
    req.session.user = user;

    console.log('✅ Firebase login realizado:', user.email);
    console.log('Session ID após login:', req.sessionID);
    console.log('Session User ID após login:', req.session.userId);
    
    // Force session save and only respond after save is complete
    req.session.save((err) => {
      if (err) {
        console.error('❌ Erro ao salvar session:', err);
        res.status(500).json({ error: 'Erro ao salvar sessão' });
      } else {
        console.log('✅ Session salva com sucesso');
        res.json(user);
      }
    });
  } catch (error) {
    console.error('❌ Erro no login Firebase:', error);
    res.status(500).json({ error: 'Erro no login' });
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  console.log('=== RequireAuth Debug ===');
  console.log('Session ID:', req.sessionID);
  console.log('Session User ID:', req.session.userId);
  console.log('Session exists:', !!req.session);
  console.log('Cookies:', req.headers.cookie);
  
  if (!req.session.userId) {
    console.log('❌ Unauthorized - No session userId');
    return res.status(401).json({ message: 'Unauthorized' });
  }
  console.log('✅ Auth passed');
  next();
}

export async function getCurrentUser(req: Request, res: Response) {
  if (!req.session.userId) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const user = await db.select()
      .from(users)
      .where(eq(users.id, req.session.userId))
      .limit(1);

    if (user.length === 0) {
      req.session.destroy(() => {});
      return res.status(401).json({ message: 'User not found' });
    }

    res.json(user[0]);
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