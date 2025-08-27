import type { Express } from "express";
import { Router } from "express";
import { storage } from "./storage";
import { generateItinerary, analyzeUserPreferences } from "./gemini";
import { getWeatherForecast } from "./weather";
import {
  insertEventSchema,
  insertGuideSchema,
  insertItinerarySchema,
  insertTrailSchema,
  insertBeachSchema,
  insertBoatTourSchema,
} from "@shared/schema";
import { z } from "zod";
import { 
  validateZodSchema, 
  detectMaliciousInput,
  handleValidationErrors,
  validateUserId,
  validatePagination,
  validateSearchQuery
} from "./validation";
import { heavyOperationsLimiter } from "./security";

export async function createApiRouter(app: Express): Promise<Router> {
  const router = Router();

  console.log("Configurando autenticação: Firebase");
  console.log("NODE_ENV:", process.env.NODE_ENV);

  // Usar Firebase Auth - A configuração de middleware (sessão) ainda precisa do 'app'
  const { setupSession, requireAuth, getCurrentUser, handleLogout, handleFirebaseLogin } = await import("./auth/firebase");
  setupSession(app, { trustProxy: true });
  const authMiddleware = requireAuth;

  // Firebase Auth routes
  router.post("/auth/firebase-login", handleFirebaseLogin);
  router.get("/auth/user", getCurrentUser);
  router.post("/auth/logout", handleLogout);

  // User profile routes
  router.put("/auth/user", authMiddleware, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const updateData = req.body;
      const updatedUser = await storage.updateUser(userId, updateData);
      res.json(updatedUser);
    } catch (error) {
      console.error("Erro ao atualizar usuário:", error);
      res.status(500).json({ message: "Falha ao atualizar usuário" });
    }
  });

  // Profile completion route
  router.post("/profile", authMiddleware, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const profileData = req.body;
      let user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "Usuário não encontrado" });
      }
      const updatedUser = await storage.updateUserProfile(user.id, {
        ...profileData,
        isProfileComplete: true,
      });
      if (profileData.userType === "guide") {
        const existingGuide = await storage.getGuideByUserId(user.id);
        const guideData = {
          name: `${updatedUser.firstName} ${updatedUser.lastName}`,
          description: profileData.bio || "",
          bio: profileData.bio || "",
          specialties: profileData.specialties ? profileData.specialties.split(",").map((s: string) => s.trim()) : [],
          experience: profileData.experience || "",
          languages: profileData.languages ? profileData.languages.split(",").map((l: string) => l.trim()) : ["Português"],
          experienceYears: parseInt(profileData.experience?.match(/\d+/)?.[0] || "0"),
          location: profileData.location || updatedUser.location,
          whatsapp: updatedUser.phone,
          instagram: profileData.instagram || "",
          imageUrl: updatedUser.profileImageUrl,
        };
        if (!existingGuide) {
          await storage.createGuideFromProfile(user.id, { ...guideData, rating: 0, toursCompleted: 0, certifications: [] });
        } else {
          await storage.updateGuide(existingGuide.id, guideData);
        }
      }
      res.json(updatedUser);
    } catch (error) {
      console.error("Erro ao criar perfil:", error);
      res.status(500).json({ message: "Falha ao criar perfil" });
    }
  });

  // Reset profile (only in development)
  router.post("/profile/reset", authMiddleware, async (req: any, res) => {
    try {
      if (process.env.NODE_ENV === 'production') {
        return res.status(403).json({ message: 'Not allowed in production' });
      }
      const userId = req.session.userId;
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      const resetData = { userType: null, isProfileComplete: false, bio: null, location: null, interests: null, travelStyle: null, budget: null, companyName: null, eventTypes: null, boatTypes: null, capacity: null, licenses: null, experience: null };
      const updatedUser = await storage.updateUserProfile(userId, resetData);
      res.json(updatedUser);
    } catch (error) {
      console.error('Erro ao resetar perfil:', error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  });

  // Trails routes
  router.get("/trails", async (req, res) => {
    try {
      const trails = await storage.getTrails();
      res.json(trails);
    } catch (error) {
      console.error("Erro ao buscar trilhas:", error);
      res.status(500).json({ message: "Falha ao buscar trilhas" });
    }
  });

  router.get("/trails/:identifier", async (req, res) => {
    try {
      const trail = await storage.getTrailByIdOrSlug(req.params.identifier);
      if (!trail) {
        return res.status(404).json({ message: "Trilha não encontrada" });
      }
      res.json(trail);
    } catch (error) {
      console.error("Erro ao buscar trilha:", error);
      res.status(500).json({ message: "Falha ao buscar trilha" });
    }
  });

  router.post("/trails", authMiddleware, async (req, res) => {
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
  router.get("/beaches", async (req, res) => {
    try {
      const beaches = await storage.getBeaches();
      res.json(beaches);
    } catch (error) {
      console.error("Erro ao buscar praias:", error);
      res.status(500).json({ message: "Falha ao buscar praias" });
    }
  });

  router.get("/beaches/:identifier", async (req, res) => {
    try {
      const beach = await storage.getBeachByIdOrSlug(req.params.identifier);
      if (!beach) {
        return res.status(404).json({ message: "Praia não encontrada" });
      }
      res.json(beach);
    } catch (error) {
      console.error("Erro ao buscar praia:", error);
      res.status(500).json({ message: "Falha ao buscar praia" });
    }
  });

  router.post("/beaches", authMiddleware, async (req, res) => {
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
  router.get("/boat-tours", async (req, res) => {
    try {
      const tours = await storage.getBoatTours();
      res.json(tours);
    } catch (error) {
      console.error("Erro ao buscar passeios:", error);
      res.status(500).json({ message: "Falha ao buscar passeios" });
    }
  });

  router.get("/boat-tours/:identifier", async (req, res) => {
    try {
      const tour = await storage.getBoatTourByIdOrSlug(req.params.identifier);
      if (!tour) {
        return res.status(404).json({ message: "Passeio não encontrado" });
      }
      res.json(tour);
    } catch (error) {
      console.error("Erro ao buscar passeio:", error);
      res.status(500).json({ message: "Falha ao buscar passeio" });
    }
  });

  router.post("/boat-tours", authMiddleware, async (req, res) => {
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
  router.get("/events", async (req, res) => {
    try {
      const events = await storage.getEvents();
      res.json(events);
    } catch (error) {
      console.error("Erro ao buscar eventos:", error);
      res.status(500).json({ message: "Falha ao buscar eventos" });
    }
  });

  router.get("/events/:identifier", async (req, res) => {
    try {
      const event = await storage.getEventByIdOrSlug(req.params.identifier);
      if (!event) {
        return res.status(404).json({ message: "Evento não encontrado" });
      }
      res.json(event);
    } catch (error) {
      console.error("Erro ao buscar evento:", error);
      res.status(500).json({ message: "Falha ao buscar evento" });
    }
  });

  router.post("/events", authMiddleware, async (req, res) => {
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
  router.get("/guides", async (req, res) => {
    try {
      const guides = await storage.getGuides();
      res.json(guides);
    } catch (error) {
      console.error("Erro ao buscar guias:", error);
      res.status(500).json({ message: "Falha ao buscar guias" });
    }
  });

  router.get("/guides/featured", async (req, res) => {
    try {
      const featuredGuides = await storage.getFeaturedGuides();
      res.json(featuredGuides);
    } catch (error) {
      console.error("Erro ao buscar guias em destaque:", error);
      res.status(500).json({ message: "Falha ao buscar guias em destaque" });
    }
  });

  router.get("/guides/:identifier", async (req, res) => {
    try {
      const guide = await storage.getGuideByIdOrSlug(req.params.identifier);
      if (!guide) {
        return res.status(404).json({ message: "Guia não encontrado" });
      }
      res.json(guide);
    } catch (error) {
      console.error("Error fetching guide:", error);
      res.status(500).json({ message: "Falha ao buscar guia" });
    }
  });
  
  router.put("/guides/:id", authMiddleware, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const guideId = req.params.id;
      const currentUser = await storage.getUser(userId);
      if (!currentUser) {
        return res.status(404).json({ message: "Usuário não encontrado" });
      }
      const guide = await storage.getGuide(guideId);
      if (!guide) {
        return res.status(404).json({ message: "Guia não encontrado" });
      }
      if (guide.userId !== currentUser.id) {
        if (!currentUser?.isAdmin) {
          return res.status(403).json({ message: "Você só pode editar seu próprio perfil" });
        }
      }
      const processedData = { ...req.body };
      if (processedData.specialties && typeof processedData.specialties === 'string') {
        processedData.specialties = processedData.specialties.split(',').map((s: string) => s.trim());
      }
      if (processedData.languages && typeof processedData.languages === 'string') {
        processedData.languages = processedData.languages.split(',').map((l: string) => l.trim());
      }
      const validatedData = insertGuideSchema.partial().parse(processedData);
      const updatedGuide = await storage.updateGuide(guideId, validatedData);
      res.json(updatedGuide);
    } catch (error) {
      console.error("Error updating guide profile:", error);
      res.status(500).json({ message: "Falha ao atualizar perfil de guia" });
    }
  });

  // Admin routes
  router.put("/trails/:id", authMiddleware, async (req, res) => {
    try {
      const trailData = insertTrailSchema.partial().parse(req.body);
      const updatedTrail = await storage.updateTrail(req.params.id, trailData);
      res.json(updatedTrail);
    } catch (error) {
      console.error("Erro ao atualizar trilha:", error);
      res.status(500).json({ message: "Falha ao atualizar trilha" });
    }
  });

  router.delete("/trails/:id", authMiddleware, async (req, res) => {
    try {
      await storage.deleteTrail(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Erro ao deletar trilha:", error);
      res.status(500).json({ message: "Falha ao deletar trilha" });
    }
  });

  router.put("/beaches/:id", authMiddleware, async (req, res) => {
    try {
      const beachData = insertBeachSchema.partial().parse(req.body);
      const updatedBeach = await storage.updateBeach(req.params.id, beachData);
      res.json(updatedBeach);
    } catch (error) {
      console.error("Erro ao atualizar praia:", error);
      res.status(500).json({ message: "Falha ao atualizar praia" });
    }
  });

  router.delete("/beaches/:id", authMiddleware, async (req, res) => {
    try {
      await storage.deleteBeach(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Erro ao deletar praia:", error);
      res.status(500).json({ message: "Falha ao deletar praia" });
    }
  });

  router.put("/boat-tours/:id", authMiddleware, async (req: any, res) => {
    try {

      const userId = req.session.userId;
      const user = await storage.getUser(userId);
      const tour = await storage.getBoatTour(req.params.id);

      if (!user || !tour) {
        return res.status(404).json({ message: "Passeio não encontrado" });
      }

      // Only tour owner or admin can edit
      if (tour.operatorId !== user.id && !user.isAdmin) {
        return res
          .status(403)
          .json({ message: "Você só pode editar seus próprios passeios" });
      }

      const tourData = insertBoatTourSchema.partial().parse(req.body);
      const updatedTour = await storage.updateBoatTour(req.params.id, tourData);
      res.json(updatedTour);
    } catch (error) {
      console.error("Erro ao atualizar passeio:", error);
      res.status(500).json({ message: "Falha ao atualizar passeio" });
    }
  });

  router.delete("/boat-tours/:id", authMiddleware, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const user = await storage.getUser(userId);
      const tour = await storage.getBoatTour(req.params.id);

      if (!user || !tour) {
        return res.status(404).json({ message: "Passeio não encontrado" });
      }

      // Only tour owner or admin can delete
      if (tour.operatorId !== user.id && !user.isAdmin) {
        return res
          .status(403)
          .json({ message: "Você só pode excluir seus próprios passeios" });
      }

      await storage.deleteBoatTour(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Erro ao deletar passeio:", error);
      res.status(500).json({ message: "Falha ao deletar passeio" });
    }
  });

  router.put("/events/:id", authMiddleware, async (req: any, res) => {
    try {
      const eventId = req.params.id;

      // Get the event to check ownership
      const existingEvent = await storage.getEventById(eventId);
      if (!existingEvent) {
        return res.status(404).json({ message: "Evento não encontrado" });
      }
      
      // Get user to check if they are the producer
      const userId = req.session.userId;
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "Usuário não encontrado" });
      }

      // Check if user is event producer and owns this event
      if (user.userType !== "event_producer") {
        return res
          .status(403)
          .json({
            message: "Apenas produtores de eventos podem editar eventos",
          });
      }

      // Check if this user created this event
      const userFullName = `${user.firstName} ${user.lastName}`;
      if (
        existingEvent.producerName !== userFullName &&
        existingEvent.producerName !== user.email
      ) {
        return res
          .status(403)
          .json({ message: "Você só pode editar eventos que você criou" });
      }

      const eventData = insertEventSchema.partial().parse(req.body);
      const updatedEvent = await storage.updateEvent(eventId, eventData);
      res.json(updatedEvent);
    } catch (error) {
      console.error("Erro ao atualizar evento:", error);
      res.status(500).json({ message: "Falha ao atualizar evento" });
    }
  });

  router.delete("/events/:id", authMiddleware, async (req: any, res) => {
    try {
      const eventId = req.params.id;

      // Get the event to check ownership
      const existingEvent = await storage.getEventById(eventId);
      if (!existingEvent) {
        return res.status(404).json({ message: "Evento não encontrado" });
      }

      // Get user to check if they are the producer
      const userId = req.session.userId;
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "Usuário não encontrado" });
      }

      // Check if user is event producer and owns this event
      if (user.userType !== "event_producer") {
        return res
          .status(403)
          .json({
            message: "Apenas produtores de eventos podem excluir eventos",
          });
      }

      // Check if this user created this event
      const userFullName = `${user.firstName} ${user.lastName}`;
      if (
        existingEvent.producerName !== userFullName &&
        existingEvent.producerName !== user.email
      ) {
        return res
          .status(403)
          .json({ message: "Você só pode excluir eventos que você criou" });
      }

      await storage.deleteEvent(eventId);
      res.status(204).send();
    } catch (error) {
      console.error("Erro ao excluir evento:", error);
      res.status(500).json({ message: "Falha ao excluir evento" });
    }
  });

  router.delete("/guides/:id", authMiddleware, async (req, res) => {
    try {
      await storage.deleteGuide(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Erro ao deletar guia:", error);
      res.status(500).json({ message: "Falha ao deletar guia" });
    }
  });

  // Admin user management
  router.get("/admin/users", authMiddleware, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const user = await storage.getUser(userId);

      if (!user || !user.isAdmin) {
        return res.status(403).json({ message: "Acesso negado. Apenas administradores." });
      }

      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      console.error("Erro ao buscar usuários:", error);
      res.status(500).json({ message: "Falha ao buscar usuários" });
    }
  });

  router.put("/admin/users/:id", authMiddleware, async (req: any, res) => {
    try {
      const adminUserId = req.session.userId;
      const userToUpdateId = req.params.id;
      const updateData = req.body;

      const adminUser = await storage.getUser(adminUserId);
      if (!adminUser || !adminUser.isAdmin) {
        return res.status(403).json({ message: "Acesso negado. Apenas administradores." });
      }

      const updatedUser = await storage.adminUpdateUser(userToUpdateId, updateData);
      res.json(updatedUser);
    } catch (error) {
      console.error("Erro ao atualizar usuário:", error);
      res.status(500).json({ message: "Falha ao atualizar usuário" });
    }
  });

  // AI & Weather routes
  router.post("/itineraries/analyze", requireAuth, async (req: any, res) => {
    try {
      const { userInput } = req.body;

      if (!userInput) {
        return res
          .status(400)
          .json({ message: "Texto de entrada é obrigatório" });
      }

      const preferences = await analyzeUserPreferences(userInput);
      res.json(preferences);
    } catch (error) {
      console.error("Erro ao analisar preferências:", error);
      res.status(500).json({ message: "Falha ao analisar preferências" });
    }
  });

  router.get("/weather", async (req, res) => {
    try {
      const { date } = req.query;
      const weather = await getWeatherForecast(date as string);
      if (!weather) {
        return res.status(503).json({ message: "Serviço de clima temporariamente indisponível" });
      }
      res.json(weather);
    } catch (error) {
      console.error("Erro ao buscar clima:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  router.post("/itineraries/generate", requireAuth, detectMaliciousInput, async (req: any, res) => {
    try {
      const { preferences } = req.body;

      if (!preferences) {
        return res
          .status(400)
          .json({ message: "Preferências são obrigatórias" });
      }

      // Buscar usuário pela sessão
      const user = await storage.getUser(req.session.userId);
      if (!user) {
        return res.status(404).json({ message: "Usuário não encontrado" });
      }

      // Buscar dados reais do banco de dados
      const [trails, beaches, boatTours, events, guides] = await Promise.all([
        storage.getTrails(),
        storage.getBeaches(),
        storage.getBoatTours(),
        storage.getEvents(),
        storage.getGuides(),
      ]);

      const availableData = {
        trails,
        beaches,
        boatTours,
        events,
        guides,
      };
      // Gerar roteiro com dados reais
      const itinerary = await generateItinerary(preferences, availableData);

      // Criar título baseado nas preferências
      const title = `Roteiro ${preferences.duration} dias - ${preferences.interests?.slice(0, 2).join(", ") || "Ubatuba"}`;

      // Salvar roteiro no banco usando o ID correto do usuário
      const savedItinerary = await storage.createItinerary({
        userId: user.id,
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

  // Itineraries, Favorites, Bookings
  router.get("/itineraries", authMiddleware, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "Usuário não encontrado" });
      }

      const itineraries = await storage.getUserItineraries(user.id);
      res.json(itineraries);
    } catch (error) {
      console.error("Erro ao buscar roteiros:", error);
      res.status(500).json({ message: "Falha ao buscar roteiros" });
    }
  });

  router.get("/itineraries/:id", authMiddleware, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const { id } = req.params;
      const itinerary = await storage.getItineraryById(id);
      
      if (!itinerary) {
        return res.status(404).json({ message: "Roteiro não encontrado" });
      }

      // Verificar se o roteiro pertence ao usuário atual
      if (itinerary.userId !== userId) {
        return res.status(403).json({ message: "Acesso negado" });
      }

      res.json(itinerary);
    } catch (error) {
      console.error("Erro ao buscar roteiro:", error);
      res.status(500).json({ message: "Falha ao buscar roteiro" });
    }
  });

  router.get("/favorites", authMiddleware, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const favorites = await storage.getUserFavorites(userId);
      res.json(favorites);
    } catch (error) {
      console.error("Erro ao buscar favoritos:", error);
      res.status(500).json({ message: "Falha ao buscar favoritos" });
    }
  });

  router.post("/favorites", authMiddleware, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const favoriteData = { ...req.body, userId };
      const newFavorite = await storage.addFavorite(favoriteData);
      res.status(201).json(newFavorite);
    } catch (error) {
      console.error("Erro ao adicionar favorito:", error);
      res.status(500).json({ message: "Falha ao adicionar favorito" });
    }
  });

  router.delete("/favorites/:itemType/:itemId", authMiddleware, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const { itemType, itemId } = req.params;
      await storage.removeFavorite(userId, itemType, itemId);
      res.status(204).send();
    } catch (error) {
      console.error("Erro ao remover favorito:", error);
      res.status(500).json({ message: "Falha ao remover favorito" });
    }
  });

  router.get("/favorites/:itemType/:itemId", authMiddleware, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const { itemType, itemId } = req.params;
      const isFavorited = await storage.isFavorite(userId, itemType, itemId);
      res.json({ isFavorited });
    } catch (error) {
      console.error("Erro ao verificar favorito:", error);
      res.status(500).json({ message: "Falha ao verificar favorito" });
    }
  });

  router.get("/bookings", authMiddleware, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const bookings = await storage.getUserBookings(userId);
      res.json(bookings);
    } catch (error) {
      console.error("Erro ao buscar reservas:", error);
      res.status(500).json({ message: "Falha ao buscar reservas" });
    }
  });

  router.post("/bookings", authMiddleware, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const bookingData = { ...req.body, userId };
      const newBooking = await storage.createBooking(bookingData);
      res.status(201).json(newBooking);
    } catch (error) {
      console.error("Erro ao criar reserva:", error);
      res.status(500).json({ message: "Falha ao criar reserva" });
    }
  });

  router.get("/bookings/:id", authMiddleware, async (req, res) => {
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

  router.patch("/bookings/:id/status", authMiddleware, async (req, res) => {
    try {
      const { status } = req.body;
      const updatedBooking = await storage.updateBookingStatus(
        req.params.id,
        status,
      );
      res.json(updatedBooking);
    } catch (error) {
      console.error("Erro ao atualizar status da reserva:", error);
      res.status(500).json({ message: "Falha ao atualizar reserva" });
    }
  });

  return router;
}
