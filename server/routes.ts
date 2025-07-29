import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { generateItinerary } from "./openai";
import { insertEventSchema, insertGuideSchema, insertItinerarySchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
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

  app.post('/api/events', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user || user.userType !== 'event_producer') {
        return res.status(403).json({ message: "Apenas produtores de eventos podem criar eventos" });
      }

      const validatedData = insertEventSchema.parse({
        ...req.body,
        producerId: userId,
      });

      const event = await storage.createEvent(validatedData);
      res.json(event);
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

  app.post('/api/guides', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user || user.userType !== 'guide') {
        return res.status(403).json({ message: "Apenas guias podem criar perfis de guia" });
      }

      const validatedData = insertGuideSchema.parse({
        ...req.body,
        userId: userId,
      });

      const guide = await storage.createGuide(validatedData);
      res.json(guide);
    } catch (error) {
      console.error("Erro ao criar guia:", error);
      res.status(500).json({ message: "Falha ao criar guia" });
    }
  });

  // AI Itinerary routes
  app.post('/api/itinerary/generate', isAuthenticated, async (req: any, res) => {
    try {
      const preferences = req.body;
      const generatedItinerary = await generateItinerary(preferences);
      
      const userId = req.user.claims.sub;
      
      // Save to database
      const itinerary = await storage.createItinerary({
        userId,
        preferences,
        content: generatedItinerary,
        title: generatedItinerary.title,
        duration: generatedItinerary.totalDays,
      });

      res.json(generatedItinerary);
    } catch (error) {
      console.error("Erro ao gerar roteiro:", error);
      res.status(500).json({ message: "Falha ao gerar roteiro com IA" });
    }
  });

  app.get('/api/itineraries', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const itineraries = await storage.getUserItineraries(userId);
      res.json(itineraries);
    } catch (error) {
      console.error("Erro ao buscar roteiros:", error);
      res.status(500).json({ message: "Falha ao buscar roteiros" });
    }
  });

  // Update user type
  app.patch('/api/auth/user/type', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { userType } = req.body;
      
      if (!['tourist', 'guide', 'event_producer'].includes(userType)) {
        return res.status(400).json({ message: "Tipo de usuário inválido" });
      }

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "Usuário não encontrado" });
      }

      const updatedUser = await storage.upsertUser({
        ...user,
        userType,
      });

      res.json(updatedUser);
    } catch (error) {
      console.error("Erro ao atualizar tipo de usuário:", error);
      res.status(500).json({ message: "Falha ao atualizar tipo de usuário" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
