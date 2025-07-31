// Local authentication configuration
import { Request, Response, NextFunction } from 'express';
import { db } from './db.local.js';
import { users } from '../shared/schema.js';
import { eq } from 'drizzle-orm';

// Mock user for local development
const LOCAL_TEST_USER = {
  id: 'local-test-user-id',
  email: 'admin@ubatuba.local',
  firstName: 'Admin',
  lastName: 'Local',
  profileImageUrl: null,
  userType: 'admin',
  isProfileComplete: true
};

// Local login endpoint
export async function handleLocalLogin(req: Request, res: Response) {
  try {
    // Check if user exists
    let existingUser = await db.select()
      .from(users)
      .where(eq(users.email, LOCAL_TEST_USER.email))
      .limit(1);

    let user;
    if (existingUser.length === 0) {
      // Create local test user
      const [newUser] = await db.insert(users)
        .values({
          id: LOCAL_TEST_USER.id,
          email: LOCAL_TEST_USER.email,
          firstName: LOCAL_TEST_USER.firstName,
          lastName: LOCAL_TEST_USER.lastName,
          profileImageUrl: LOCAL_TEST_USER.profileImageUrl,
          userType: LOCAL_TEST_USER.userType,
          isProfileComplete: LOCAL_TEST_USER.isProfileComplete
        })
        .returning();
      user = newUser;
    } else {
      user = existingUser[0];
    }

    // Set session
    req.session.userId = user.id;
    req.session.user = user;

    console.log('✅ Login local realizado com sucesso:', user.email);
    
    // Redirect to main app
    res.redirect('/');
  } catch (error) {
    console.error('❌ Erro no login local:', error);
    res.status(500).json({ error: 'Erro no login local' });
  }
}

// Middleware to check authentication
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.session.userId) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  next();
}

// Get current user
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

// Logout
export function handleLogout(req: Request, res: Response) {
  req.session.destroy((err) => {
    if (err) {
      console.error('❌ Erro ao fazer logout:', err);
      return res.status(500).json({ error: 'Erro ao fazer logout' });
    }
    res.json({ message: 'Logout realizado com sucesso' });
  });
}