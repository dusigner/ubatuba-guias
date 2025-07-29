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
  const isDevelopment = process.env.NODE_ENV === 'development' || !process.env.REPLIT_DOMAINS;
  
  console.log('Configurando autenticação:', isDevelopment ? 'Local' : 'Replit');
  
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
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Erro ao buscar usuário:", error);
      res.status(500).json({ message: "Falha ao buscar usuário" });
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
      const trail = await storage.getTrail(req.params.id);
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
      const beach = await storage.getBeach(req.params.id);
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
      const tour = await storage.getBoatTour(req.params.id);
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

  // Guides routes
  app.get('/api/guides', async (req, res) => {
    try {
      const guides = await storage.getGuides();
      res.json(guides);
    } catch (error) {
      console.error("Erro ao buscar guias:", error);
      res.status(500).json({ message: "Falha ao buscar guias" });
    }
  });

  app.post('/api/guides', authMiddleware, async (req, res) => {
    try {
      const guideData = insertGuideSchema.parse(req.body);
      const newGuide = await storage.createGuide(guideData);
      res.status(201).json(newGuide);
    } catch (error) {
      console.error("Erro ao criar guia:", error);
      res.status(500).json({ message: "Falha ao criar guia" });
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
      const userId = req.user.claims.sub;
      
      if (!preferences) {
        return res.status(400).json({ message: "Preferências são obrigatórias" });
      }

      const itinerary = await generateItinerary(preferences);
      
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
      const userId = req.user.claims.sub;
      const itineraries = await storage.getUserItineraries(userId);
      res.json(itineraries);
    } catch (error) {
      console.error("Erro ao buscar roteiros:", error);
      res.status(500).json({ message: "Falha ao buscar roteiros" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}