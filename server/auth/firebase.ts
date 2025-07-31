import { Request, Response, NextFunction } from 'express';
import { db } from '../db.js';
import { users } from '../../shared/schema.js';
import { eq } from 'drizzle-orm';

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
          userType: 'tourist', // Default type
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
    res.json({ user, message: 'Login realizado com sucesso' });
  } catch (error) {
    console.error('❌ Erro no login Firebase:', error);
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