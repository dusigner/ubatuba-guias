import type { Express, RequestHandler } from "express";
import session from "express-session";
import { storage } from "./storage";
import { db } from "./db";
import { users } from "../shared/schema";

// Sistema de autenticação local simples para desenvolvimento
export function setupLocalAuth(app: Express) {
  app.use(session({
    secret: process.env.SESSION_SECRET || 'local-dev-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false, // false para desenvolvimento local
      maxAge: 24 * 60 * 60 * 1000, // 24 horas
    },
  }));

  // Rota de login local - cria usuário de teste
  app.get('/api/login', async (req: any, res) => {
    try {
      // Criar/buscar usuário de teste
      const testUserId = 'local-test-user';
      let user = await storage.getUser(testUserId);
      
      if (!user) {
        // Criar usuário de teste diretamente no banco
        await db.insert(users).values({
          id: testUserId,
          email: 'teste@ubatuba.local',
          firstName: 'Usuário',
          lastName: 'Teste',
          profileImageUrl: 'https://via.placeholder.com/150',
          userType: 'admin',
          isAdmin: true,
          isProfileComplete: true, // Usuário de teste já tem perfil completo
        }).onConflictDoNothing();
        
        user = await storage.getUser(testUserId);
      }

      // Simular session do Replit Auth
      req.session.user = {
        claims: {
          sub: user.id,
          email: user.email,
          first_name: user.firstName,
          last_name: user.lastName,
          profile_image_url: user.profileImageUrl,
          exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60), // Expira em 24h
        },
        access_token: 'local-dev-token',
        expires_at: Math.floor(Date.now() / 1000) + (24 * 60 * 60),
      };

      res.redirect('/');
    } catch (error) {
      console.error('Erro no login local:', error);
      res.status(500).json({ message: 'Erro no login local' });
    }
  });

  // Rota de logout local
  app.get('/api/logout', (req: any, res) => {
    req.session.destroy(() => {
      res.redirect('/');
    });
  });
}

// Middleware de autenticação local
export const isAuthenticatedLocal: RequestHandler = async (req: any, res, next) => {
  if (!req.session?.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const user = req.session.user;
  const now = Math.floor(Date.now() / 1000);
  
  if (now > user.expires_at) {
    req.session.destroy(() => {
      res.status(401).json({ message: "Session expired" });
    });
    return;
  }

  // Adicionar user ao req como esperado pelas rotas
  req.user = user;
  req.isAuthenticated = () => true;
  
  next();
};