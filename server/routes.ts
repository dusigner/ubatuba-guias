import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { generateItinerary, analyzeUserPreferences } from "./gemini";
import { 
  insertEventSchema, 
  insertGuideSchema, 
  insertItinerarySchema,
  insertTrailSchema,
  insertBeachSchema,
  insertBoatTourSchema,
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Verificar se estamos em desenvolvimento local ou no Replit
  const isDevelopment = process.env.NODE_ENV === 'development' && !process.env.REPLIT_DOMAINS;
  
  console.log('Configurando autenticação:', isDevelopment ? 'Local' : 'Replit');
  console.log('NODE_ENV:', process.env.NODE_ENV);
  console.log('REPLIT_DOMAINS:', process.env.REPLIT_DOMAINS);
  
  let authMiddleware: any;
  
  if (isDevelopment) {
    // Usar autenticação local
    const { setupLocalAuth, isAuthenticatedLocal } = await import("./localAuth");
    setupLocalAuth(app);
    authMiddleware = isAuthenticatedLocal;
  } else {
    // Usar Replit Auth
    const { setupAuth, isAuthenticated } = await import("./replitAuth");
    await setupAuth(app);
    authMiddleware = isAuthenticated;
  }

  // Auth routes
  app.get('/api/auth/user', authMiddleware, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      let user = await storage.getUser(userId);
      
      // Se o usuário não existe no banco (primeiro login via Replit), criar
      if (!user && req.user.claims) {
        user = await storage.upsertUser({
          email: req.user.claims.email,
          firstName: req.user.claims.first_name,
          lastName: req.user.claims.last_name,
          profileImageUrl: req.user.claims.profile_image_url,
          userType: 'tourist',
          isProfileComplete: false
        });
      }
      
      res.json(user);
    } catch (error) {
      console.error("Erro ao buscar usuário:", error);
      res.status(500).json({ message: "Falha ao buscar usuário" });
    }
  });

  // User profile routes
  app.put('/api/auth/user', authMiddleware, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const updateData = req.body;
      const updatedUser = await storage.updateUser(userId, updateData);
      res.json(updatedUser);
    } catch (error) {
      console.error("Erro ao atualizar usuário:", error);
      res.status(500).json({ message: "Falha ao atualizar usuário" });
    }
  });

  // Profile completion route  
  app.post('/api/profile', authMiddleware, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const profileData = req.body;
      
      console.log('Criando perfil para usuário:', userId, 'com dados:', profileData);
      
      const updatedUser = await storage.updateUserProfile(userId, {
        ...profileData,
        isProfileComplete: true
      });
      
      res.json(updatedUser);
    } catch (error) {
      console.error("Erro ao criar perfil:", error);
      res.status(500).json({ message: "Falha ao criar perfil" });
    }
  });

  // Profile completion route (legacy)
  app.post('/api/profile/complete', authMiddleware, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const profileData = req.body;
      
      const updatedUser = await storage.updateUserProfile(userId, {
        ...profileData,
        isProfileComplete: true
      });
      
      res.json(updatedUser);
    } catch (error) {
      console.error("Erro ao completar perfil:", error);
      res.status(500).json({ message: "Falha ao completar perfil" });
    }
  });

  // Local authentication routes (for email/password)
  app.post('/api/auth/register', async (req, res) => {
    try {
      const { email, password, firstName, lastName } = req.body;
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: "Email já cadastrado" });
      }

      // Create new user
      const newUser = await storage.createLocalUser({
        email,
        password,
        firstName,
        lastName,
        userType: 'tourist',
        isProfileComplete: false
      });

      // Create session for the new user
      (req.session as any).user = {
        claims: {
          sub: newUser.id,
          email: newUser.email,
          first_name: newUser.firstName,
          last_name: newUser.lastName
        }
      };

      res.json({ success: true, user: newUser });
    } catch (error) {
      console.error("Erro ao registrar usuário:", error);
      res.status(500).json({ message: "Falha ao criar conta" });
    }
  });

  app.post('/api/auth/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      
      const user = await storage.authenticateUser(email, password);
      if (!user) {
        return res.status(401).json({ message: "Email ou senha incorretos" });
      }

      // Create session
      (req.session as any).user = {
        claims: {
          sub: user.id,
          email: user.email,
          first_name: user.firstName,
          last_name: user.lastName
        }
      };

      res.json({ success: true, user });
    } catch (error) {
      console.error("Erro ao fazer login:", error);
      res.status(500).json({ message: "Falha ao fazer login" });
    }
  });

  // Trails routes
  app.get('/api/trails', async (req, res) => {
    try {
      const trails = await storage.getTrails();
      res.json(trails);
    } catch (error) {
      console.error("Erro ao buscar trilhas:", error);
      res.status(500).json({ message: "Falha ao buscar trilhas" });
    }
  });

  app.get('/api/trails/:id', async (req, res) => {
    try {
      const trail = await storage.getTrailById(req.params.id);
      if (!trail) {
        return res.status(404).json({ message: "Trilha não encontrada" });
      }
      res.json(trail);
    } catch (error) {
      console.error("Erro ao buscar trilha:", error);
      res.status(500).json({ message: "Falha ao buscar trilha" });
    }
  });

  app.post('/api/trails', authMiddleware, async (req, res) => {
    try {
      const trailData = insertTrailSchema.parse(req.body);
      const newTrail = await storage.createTrail(trailData);
      res.status(201).json(newTrail);
    } catch (error) {
      console.error("Erro ao criar trilha:", error);
      res.status(500).json({ message: "Falha ao criar trilha" });
    }
  });

  // Beaches routes
  app.get('/api/beaches', async (req, res) => {
    try {
      const beaches = await storage.getBeaches();
      res.json(beaches);
    } catch (error) {
      console.error("Erro ao buscar praias:", error);
      res.status(500).json({ message: "Falha ao buscar praias" });
    }
  });

  app.get('/api/beaches/:id', async (req, res) => {
    try {
      const beach = await storage.getBeachById(req.params.id);
      if (!beach) {
        return res.status(404).json({ message: "Praia não encontrada" });
      }
      res.json(beach);
    } catch (error) {
      console.error("Erro ao buscar praia:", error);
      res.status(500).json({ message: "Falha ao buscar praia" });
    }
  });

  app.post('/api/beaches', authMiddleware, async (req, res) => {
    try {
      const beachData = insertBeachSchema.parse(req.body);
      const newBeach = await storage.createBeach(beachData);
      res.status(201).json(newBeach);
    } catch (error) {
      console.error("Erro ao criar praia:", error);
      res.status(500).json({ message: "Falha ao criar praia" });
    }
  });

  // Boat tours routes
  app.get('/api/boat-tours', async (req, res) => {
    try {
      const tours = await storage.getBoatTours();
      res.json(tours);
    } catch (error) {
      console.error("Erro ao buscar passeios:", error);
      res.status(500).json({ message: "Falha ao buscar passeios" });
    }
  });

  app.get('/api/boat-tours/:id', async (req, res) => {
    try {
      const tour = await storage.getBoatTourById(req.params.id);
      if (!tour) {
        return res.status(404).json({ message: "Passeio não encontrado" });
      }
      res.json(tour);
    } catch (error) {
      console.error("Erro ao buscar passeio:", error);
      res.status(500).json({ message: "Falha ao buscar passeio" });
    }
  });

  app.post('/api/boat-tours', authMiddleware, async (req, res) => {
    try {
      const tourData = insertBoatTourSchema.parse(req.body);
      const newTour = await storage.createBoatTour(tourData);
      res.status(201).json(newTour);
    } catch (error) {
      console.error("Erro ao criar passeio:", error);
      res.status(500).json({ message: "Falha ao criar passeio" });
    }
  });

  // Events routes
  app.get('/api/events', async (req, res) => {
    try {
      const events = await storage.getEvents();
      res.json(events);
    } catch (error) {
      console.error("Erro ao buscar eventos:", error);
      res.status(500).json({ message: "Falha ao buscar eventos" });
    }
  });

  app.get('/api/events/:id', async (req, res) => {
    try {
      const event = await storage.getEventById(req.params.id);
      if (!event) {
        return res.status(404).json({ message: "Evento não encontrado" });
      }
      res.json(event);
    } catch (error) {
      console.error("Erro ao buscar evento:", error);
      res.status(500).json({ message: "Falha ao buscar evento" });
    }
  });

  app.post('/api/events', authMiddleware, async (req, res) => {
    try {
      const eventData = insertEventSchema.parse(req.body);
      const newEvent = await storage.createEvent(eventData);
      res.status(201).json(newEvent);
    } catch (error) {
      console.error("Erro ao criar evento:", error);
      res.status(500).json({ message: "Falha ao criar evento" });
    }
  });

  // Guides routes - busca usuários que são guias
  app.get('/api/guides', async (req, res) => {
    try {
      const guides = await storage.getUsersByType('guide');
      res.json(guides);
    } catch (error) {
      console.error("Erro ao buscar guias:", error);
      res.status(500).json({ message: "Falha ao buscar guias" });
    }
  });

  app.get('/api/guides/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const guide = await storage.getGuide(id);
      if (!guide) {
        return res.status(404).json({ message: "Guia não encontrado" });
      }
      res.json(guide);
    } catch (error) {
      console.error("Error fetching guide:", error);
      res.status(500).json({ message: "Falha ao buscar guia" });
    }
  });

  // Criar perfil de guia (separado dos dados do usuário)
  app.post('/api/guides', authMiddleware, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      // Verificar se o usuário é do tipo guide
      const user = await storage.getUser(userId);
      if (!user || user.userType !== 'guide') {
        return res.status(403).json({ message: "Apenas usuários do tipo 'guide' podem criar perfis de guia" });
      }

      // Verificar se já tem perfil de guia
      const existingGuide = await storage.getGuideByUserId(userId);
      if (existingGuide) {
        return res.status(400).json({ message: "Usuário já possui perfil de guia" });
      }

      // Criar perfil de guia na tabela guides
      const newGuide = await storage.createGuide(userId, req.body);
      
      // Marcar perfil do usuário como completo
      await storage.updateUser(userId, { isProfileComplete: true });
      
      res.status(201).json(newGuide);
    } catch (error) {
      console.error("Error creating guide profile:", error);
      res.status(500).json({ message: "Falha ao criar perfil de guia" });
    }
  });

  // Editar perfil de guia (apenas o próprio usuário pode editar)
  app.put('/api/guides/:id', authMiddleware, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const guideId = req.params.id;
      
      // Buscar o guia para verificar se pertence ao usuário
      const guide = await storage.getGuide(guideId);
      if (!guide) {
        return res.status(404).json({ message: "Guia não encontrado" });
      }

      // Verificar se o usuário está editando seu próprio perfil
      if (guide.userId !== userId) {
        const currentUser = await storage.getUser(userId);
        if (!currentUser?.isAdmin) {
          return res.status(403).json({ message: "Você só pode editar seu próprio perfil" });
        }
      }

      // Atualizar dados do guia
      const updatedGuide = await storage.updateGuide(guideId, req.body);
      
      res.json(updatedGuide);
    } catch (error) {
      console.error("Error updating guide profile:", error);
      res.status(500).json({ message: "Falha ao atualizar perfil de guia" });
    }
  });

  // Admin routes for updating content
  app.put('/api/trails/:id', authMiddleware, async (req, res) => {
    try {
      const trailData = insertTrailSchema.partial().parse(req.body);
      const updatedTrail = await storage.updateTrail(req.params.id, trailData);
      res.json(updatedTrail);
    } catch (error) {
      console.error("Erro ao atualizar trilha:", error);
      res.status(500).json({ message: "Falha ao atualizar trilha" });
    }
  });

  app.delete('/api/trails/:id', authMiddleware, async (req, res) => {
    try {
      await storage.deleteTrail(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Erro ao deletar trilha:", error);
      res.status(500).json({ message: "Falha ao deletar trilha" });
    }
  });

  app.put('/api/beaches/:id', authMiddleware, async (req, res) => {
    try {
      const beachData = insertBeachSchema.partial().parse(req.body);
      const updatedBeach = await storage.updateBeach(req.params.id, beachData);
      res.json(updatedBeach);
    } catch (error) {
      console.error("Erro ao atualizar praia:", error);
      res.status(500).json({ message: "Falha ao atualizar praia" });
    }
  });

  app.delete('/api/beaches/:id', authMiddleware, async (req, res) => {
    try {
      await storage.deleteBeach(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Erro ao deletar praia:", error);
      res.status(500).json({ message: "Falha ao deletar praia" });
    }
  });

  app.put('/api/boat-tours/:id', authMiddleware, async (req, res) => {
    try {
      const tourData = insertBoatTourSchema.partial().parse(req.body);
      const updatedTour = await storage.updateBoatTour(req.params.id, tourData);
      res.json(updatedTour);
    } catch (error) {
      console.error("Erro ao atualizar passeio:", error);
      res.status(500).json({ message: "Falha ao atualizar passeio" });
    }
  });

  app.delete('/api/boat-tours/:id', authMiddleware, async (req, res) => {
    try {
      await storage.deleteBoatTour(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Erro ao deletar passeio:", error);
      res.status(500).json({ message: "Falha ao deletar passeio" });
    }
  });

  app.put('/api/events/:id', authMiddleware, async (req, res) => {
    try {
      const eventData = insertEventSchema.partial().parse(req.body);
      const updatedEvent = await storage.updateEvent(req.params.id, eventData);
      res.json(updatedEvent);
    } catch (error) {
      console.error("Erro ao atualizar evento:", error);
      res.status(500).json({ message: "Falha ao atualizar evento" });
    }
  });

  app.delete('/api/events/:id', authMiddleware, async (req, res) => {
    try {
      await storage.deleteEvent(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Erro ao deletar evento:", error);
      res.status(500).json({ message: "Falha ao deletar evento" });
    }
  });

  app.put('/api/guides/:id', authMiddleware, async (req, res) => {
    try {
      const guideData = insertGuideSchema.partial().parse(req.body);
      const updatedGuide = await storage.updateGuide(req.params.id, guideData);
      res.json(updatedGuide);
    } catch (error) {
      console.error("Erro ao atualizar guia:", error);
      res.status(500).json({ message: "Falha ao atualizar guia" });
    }
  });

  app.delete('/api/guides/:id', authMiddleware, async (req, res) => {
    try {
      await storage.deleteGuide(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Erro ao deletar guia:", error);
      res.status(500).json({ message: "Falha ao deletar guia" });
    }
  });

  // Admin user management routes
  app.get('/api/admin/users', authMiddleware, async (req: any, res) => {
    try {
      const currentUser = await storage.getUser(req.user.claims.sub);
      if (!currentUser || (currentUser.userType !== 'admin' && !currentUser.isAdmin)) {
        return res.status(403).json({ message: "Acesso negado. Apenas administradores podem acessar esta funcionalidade." });
      }
      
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      console.error("Erro ao buscar usuários:", error);
      res.status(500).json({ message: "Falha ao buscar usuários" });
    }
  });

  app.put('/api/admin/users/:id', authMiddleware, async (req: any, res) => {
    try {
      const currentUser = await storage.getUser(req.user.claims.sub);
      if (!currentUser || (currentUser.userType !== 'admin' && !currentUser.isAdmin)) {
        return res.status(403).json({ message: "Acesso negado. Apenas administradores podem acessar esta funcionalidade." });
      }
      
      const userData = req.body;
      const updatedUser = await storage.adminUpdateUser(req.params.id, userData);
      res.json(updatedUser);
    } catch (error) {
      console.error("Erro ao atualizar usuário:", error);
      res.status(500).json({ message: "Falha ao atualizar usuário" });
    }
  });

  // Profile creation route
  app.post('/api/profile', authMiddleware, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const profileData = req.body;
      
      const updatedUser = await storage.updateUserProfile(userId, {
        ...profileData,
        isProfileComplete: true,
        updatedAt: new Date(),
      });
      
      res.json(updatedUser);
    } catch (error) {
      console.error("Erro ao criar perfil:", error);
      res.status(500).json({ message: "Falha ao criar perfil" });
    }
  });

  // Analyze user preferences from text
  app.post('/api/itineraries/analyze', authMiddleware, async (req, res) => {
    try {
      const { userInput } = req.body;
      
      if (!userInput) {
        return res.status(400).json({ message: "Texto de entrada é obrigatório" });
      }

      const preferences = await analyzeUserPreferences(userInput);
      res.json(preferences);
    } catch (error) {
      console.error("Erro ao analisar preferências:", error);
      res.status(500).json({ message: "Falha ao analisar preferências" });
    }
  });

  // Itinerary generation route
  app.post('/api/itineraries/generate', authMiddleware, async (req, res) => {
    try {
      const { preferences } = req.body;
      const userId = (req.user as any)?.claims?.sub;
      
      if (!preferences) {
        return res.status(400).json({ message: "Preferências são obrigatórias" });
      }

      // Buscar dados reais do banco de dados
      const [trails, beaches, boatTours, events, guides] = await Promise.all([
        storage.getTrails(),
        storage.getBeaches(),
        storage.getBoatTours(),
        storage.getEvents(),
        storage.getGuides()
      ]);

      const availableData = {
        trails,
        beaches,
        boatTours,
        events,
        guides
      };

      // Gerar roteiro com dados reais
      const itinerary = await generateItinerary(preferences, availableData);
      
      // Criar título baseado nas preferências
      const title = `Roteiro ${preferences.duration} dias - ${preferences.interests?.slice(0, 2).join(', ') || 'Ubatuba'}`;
      
      // Salvar roteiro no banco
      const savedItinerary = await storage.createItinerary({
        userId,
        title,
        duration: preferences.duration,
        preferences,
        content: itinerary,
      });

      res.json(savedItinerary);
    } catch (error) {
      console.error("Erro ao gerar roteiro:", error);
      res.status(500).json({ message: "Falha ao gerar roteiro" });
    }
  });

  // Get user itineraries
  app.get('/api/itineraries', authMiddleware, async (req, res) => {
    try {
      const userId = (req.user as any)?.claims?.sub;
      const itineraries = await storage.getUserItineraries(userId);
      res.json(itineraries);
    } catch (error) {
      console.error("Erro ao buscar roteiros:", error);
      res.status(500).json({ message: "Falha ao buscar roteiros" });
    }
  });

  // Favorites routes
  app.get('/api/favorites', authMiddleware, async (req, res) => {
    try {
      const userId = (req.user as any)?.claims?.sub;
      const favorites = await storage.getUserFavorites(userId);
      res.json(favorites);
    } catch (error) {
      console.error("Erro ao buscar favoritos:", error);
      res.status(500).json({ message: "Falha ao buscar favoritos" });
    }
  });

  app.post('/api/favorites', authMiddleware, async (req, res) => {
    try {
      const userId = (req.user as any)?.claims?.sub;
      const favoriteData = { ...req.body, userId };
      const newFavorite = await storage.addFavorite(favoriteData);
      res.status(201).json(newFavorite);
    } catch (error) {
      console.error("Erro ao adicionar favorito:", error);
      res.status(500).json({ message: "Falha ao adicionar favorito" });
    }
  });

  app.delete('/api/favorites/:itemType/:itemId', authMiddleware, async (req, res) => {
    try {
      const userId = (req.user as any)?.claims?.sub;
      const { itemType, itemId } = req.params;
      await storage.removeFavorite(userId, itemType, itemId);
      res.status(204).send();
    } catch (error) {
      console.error("Erro ao remover favorito:", error);
      res.status(500).json({ message: "Falha ao remover favorito" });
    }
  });

  app.get('/api/favorites/:itemType/:itemId', authMiddleware, async (req, res) => {
    try {
      const userId = (req.user as any)?.claims?.sub;
      const { itemType, itemId } = req.params;
      const isFavorited = await storage.isFavorite(userId, itemType, itemId);
      res.json({ isFavorited });
    } catch (error) {
      console.error("Erro ao verificar favorito:", error);
      res.status(500).json({ message: "Falha ao verificar favorito" });
    }
  });

  // Bookings routes
  app.get('/api/bookings', authMiddleware, async (req, res) => {
    try {
      const userId = (req.user as any)?.claims?.sub;
      const bookings = await storage.getUserBookings(userId);
      res.json(bookings);
    } catch (error) {
      console.error("Erro ao buscar reservas:", error);
      res.status(500).json({ message: "Falha ao buscar reservas" });
    }
  });

  app.post('/api/bookings', authMiddleware, async (req, res) => {
    try {
      const userId = (req.user as any)?.claims?.sub;
      const bookingData = { ...req.body, userId };
      const newBooking = await storage.createBooking(bookingData);
      res.status(201).json(newBooking);
    } catch (error) {
      console.error("Erro ao criar reserva:", error);
      res.status(500).json({ message: "Falha ao criar reserva" });
    }
  });

  app.get('/api/bookings/:id', authMiddleware, async (req, res) => {
    try {
      const booking = await storage.getBooking(req.params.id);
      if (!booking) {
        return res.status(404).json({ message: "Reserva não encontrada" });
      }
      res.json(booking);
    } catch (error) {
      console.error("Erro ao buscar reserva:", error);
      res.status(500).json({ message: "Falha ao buscar reserva" });
    }
  });

  app.patch('/api/bookings/:id/status', authMiddleware, async (req, res) => {
    try {
      const { status } = req.body;
      const updatedBooking = await storage.updateBookingStatus(req.params.id, status);
      res.json(updatedBooking);
    } catch (error) {
      console.error("Erro ao atualizar status da reserva:", error);
      res.status(500).json({ message: "Falha ao atualizar reserva" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}