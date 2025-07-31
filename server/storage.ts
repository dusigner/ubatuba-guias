import {
  users,
  trails,
  beaches,
  boatTours,
  events,
  guides,
  itineraries,
  favorites,
  bookings,
  type User,
  type UpsertUser,
  type Trail,
  type Beach,
  type BoatTour,
  type Event,
  type Guide,
  type Itinerary,
  type InsertTrail,
  type InsertBeach,
  type InsertBoatTour,
  type InsertEvent,
  type InsertGuide,
  type InsertItinerary,
  type Favorite,
  type InsertFavorite,
  type Booking,
  type InsertBooking,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and } from "drizzle-orm";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUser(id: string, data: Partial<User>): Promise<User>;
  updateUserProfile(id: string, data: Partial<User>): Promise<User>;
  createLocalUser(userData: any): Promise<User>;
  authenticateUser(email: string, password: string): Promise<User | null>;
  getAllUsers(): Promise<User[]>;
  adminUpdateUser(id: string, data: Partial<User>): Promise<User>;
  
  // Trails
  getTrails(): Promise<Trail[]>;
  getTrail(id: string): Promise<Trail | undefined>;
  createTrail(trail: InsertTrail): Promise<Trail>;
  updateTrail(id: string, trail: Partial<InsertTrail>): Promise<Trail>;
  deleteTrail(id: string): Promise<void>;
  
  // Beaches  
  getBeaches(): Promise<Beach[]>;
  getBeach(id: string): Promise<Beach | undefined>;
  createBeach(beach: InsertBeach): Promise<Beach>;
  updateBeach(id: string, beach: Partial<InsertBeach>): Promise<Beach>;
  deleteBeach(id: string): Promise<void>;
  
  // Boat Tours
  getBoatTours(): Promise<BoatTour[]>;
  getBoatTour(id: string): Promise<BoatTour | undefined>;
  createBoatTour(tour: InsertBoatTour): Promise<BoatTour>;
  updateBoatTour(id: string, tour: Partial<InsertBoatTour>): Promise<BoatTour>;
  deleteBoatTour(id: string): Promise<void>;
  
  // Events
  getEvents(): Promise<Event[]>;
  getEventById(id: string): Promise<Event | undefined>;
  createEvent(event: InsertEvent): Promise<Event>;
  updateEvent(id: string, event: Partial<InsertEvent>): Promise<Event>;
  deleteEvent(id: string): Promise<void>;
  
  // Guides
  getGuides(): Promise<any[]>;
  getGuide(id: string): Promise<any | undefined>;
  getGuideByUserId(userId: string): Promise<any | undefined>;
  createGuide(userId: string, guideData: any): Promise<any>;
  updateGuide(id: string, guideData: any): Promise<any>;
  
  // Itineraries
  getUserItineraries(userId: string): Promise<Itinerary[]>;
  createItinerary(itinerary: InsertItinerary): Promise<Itinerary>;

  // Favorites
  getUserFavorites(userId: string): Promise<Favorite[]>;
  addFavorite(favorite: InsertFavorite): Promise<Favorite>;
  removeFavorite(userId: string, itemType: string, itemId: string): Promise<void>;
  isFavorite(userId: string, itemType: string, itemId: string): Promise<boolean>;

  // Bookings
  getUserBookings(userId: string): Promise<Booking[]>;
  createBooking(booking: InsertBooking): Promise<Booking>;
  getBooking(id: string): Promise<Booking | undefined>;
  updateBookingStatus(id: string, status: string): Promise<Booking>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    // Tentar inserir por ID primeiro, depois por email
    try {
      const [user] = await db
        .insert(users)
        .values({
          ...userData,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .onConflictDoUpdate({
          target: users.id,
          set: {
            ...userData,
            updatedAt: new Date(),
          },
        })
        .returning();
      return user;
    } catch (error) {
      // Se falhar por ID, tentar por email
      const [user] = await db
        .insert(users)
        .values({
          ...userData,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .onConflictDoUpdate({
          target: users.email,
          set: {
            ...userData,
            updatedAt: new Date(),
          },
        })
        .returning();
      return user;
    }
  }

  async updateUser(id: string, data: Partial<User>): Promise<User> {
    const [user] = await db
      .update(users)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async updateUserProfile(id: string, data: Partial<User>): Promise<User> {
    console.log('Atualizando perfil do usuário:', id, 'com dados:', data);
    
    try {
      // Verificar se o usuário existe primeiro
      const existingUser = await this.getUser(id);
      if (!existingUser) {
        throw new Error(`Usuário com ID ${id} não encontrado`);
      }

      const [user] = await db
        .update(users)
        .set({
          ...data,
          updatedAt: new Date(),
        })
        .where(eq(users.id, id))
        .returning();
      
      console.log('Perfil atualizado com sucesso:', user);
      return user;
    } catch (error) {
      console.error('Erro no updateUserProfile:', error);
      throw error;
    }
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createLocalUser(userData: any): Promise<User> {
    const [user] = await db
      .insert(users)
      .values({
        ...userData,
        id: `local-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();
    return user;
  }

  async authenticateUser(email: string, password: string): Promise<User | null> {
    const user = await this.getUserByEmail(email);
    if (!user || user.password !== password) {
      return null;
    }
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(desc(users.createdAt));
  }

  async getUsersByType(userType: string): Promise<User[]> {
    return await db.select().from(users).where(eq(users.userType, userType as any)).orderBy(desc(users.createdAt));
  }

  async adminUpdateUser(id: string, data: Partial<User>): Promise<User> {
    const [user] = await db
      .update(users)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  // Trails
  async getTrails(): Promise<Trail[]> {
    return await db.select().from(trails).orderBy(desc(trails.rating));
  }

  async getTrail(id: string): Promise<Trail | undefined> {
    const [trail] = await db.select().from(trails).where(eq(trails.id, id));
    return trail;
  }

  async createTrail(trail: InsertTrail): Promise<Trail> {
    const [newTrail] = await db.insert(trails).values(trail).returning();
    return newTrail;
  }

  async updateTrail(id: string, trail: Partial<InsertTrail>): Promise<Trail> {
    const [updatedTrail] = await db.update(trails)
      .set(trail)
      .where(eq(trails.id, id))
      .returning();
    return updatedTrail;
  }

  async deleteTrail(id: string): Promise<void> {
    await db.delete(trails).where(eq(trails.id, id));
  }

  // Beaches
  async getBeaches(): Promise<Beach[]> {
    return await db.select().from(beaches).orderBy(desc(beaches.rating));
  }

  async getBeach(id: string): Promise<Beach | undefined> {
    const [beach] = await db.select().from(beaches).where(eq(beaches.id, id));
    return beach;
  }

  async createBeach(beach: InsertBeach): Promise<Beach> {
    const [newBeach] = await db.insert(beaches).values(beach).returning();
    return newBeach;
  }

  async updateBeach(id: string, beach: Partial<InsertBeach>): Promise<Beach> {
    const [updatedBeach] = await db.update(beaches)
      .set(beach)
      .where(eq(beaches.id, id))
      .returning();
    return updatedBeach;
  }

  async deleteBeach(id: string): Promise<void> {
    await db.delete(beaches).where(eq(beaches.id, id));
  }

  // Boat Tours
  async getBoatTours(): Promise<BoatTour[]> {
    return await db.select().from(boatTours).orderBy(desc(boatTours.rating));
  }

  async getBoatTour(id: string): Promise<BoatTour | undefined> {
    const [tour] = await db.select().from(boatTours).where(eq(boatTours.id, id));
    return tour;
  }

  async createBoatTour(tour: InsertBoatTour): Promise<BoatTour> {
    const [newTour] = await db.insert(boatTours).values(tour).returning();
    return newTour;
  }

  async updateBoatTour(id: string, tour: Partial<InsertBoatTour>): Promise<BoatTour> {
    const [updatedTour] = await db.update(boatTours)
      .set(tour)
      .where(eq(boatTours.id, id))
      .returning();
    return updatedTour;
  }

  async deleteBoatTour(id: string): Promise<void> {
    await db.delete(boatTours).where(eq(boatTours.id, id));
  }

  // Events
  async getEvents(): Promise<Event[]> {
    return await db.select().from(events).orderBy(desc(events.startDate));
  }

  async getEventById(id: string): Promise<Event | undefined> {
    const [event] = await db.select().from(events).where(eq(events.id, id));
    return event;
  }

  async createEvent(event: InsertEvent): Promise<Event> {
    const [newEvent] = await db.insert(events).values(event).returning();
    return newEvent;
  }

  async updateEvent(id: string, event: Partial<InsertEvent>): Promise<Event> {
    const [updatedEvent] = await db.update(events)
      .set(event)
      .where(eq(events.id, id))
      .returning();
    return updatedEvent;
  }

  async deleteEvent(id: string): Promise<void> {
    await db.delete(events).where(eq(events.id, id));
  }

  // Guides
  // Guides  
  async getGuides(): Promise<any[]> {
    // Buscar guias usando os dados da tabela guides diretamente (que contém os dados originais)
    const result = await db.select().from(guides).orderBy(desc(guides.rating));
    
    // Mapear os dados para o formato esperado pelo frontend
    return result.map(guide => ({
      id: guide.id,
      name: guide.name || 'Nome não informado',
      bio: guide.bio,
      description: guide.description,
      specialties: guide.specialties,
      experience: guide.experience,
      languages: guide.languages,
      experienceYears: guide.experienceYears,
      toursCompleted: guide.toursCompleted,
      rating: guide.rating,
      imageUrl: guide.imageUrl,
      location: guide.location,
      certifications: guide.certifications,
      whatsapp: guide.whatsapp,
      instagram: guide.instagram,
      createdAt: guide.createdAt,
    }));
  }

  async getAllGuides(): Promise<Guide[]> {
    return await db.select().from(guides);
  }

  async getGuide(id: string): Promise<any | undefined> {
    // Buscar guia por ID com dados do usuário
    const [result] = await db
      .select({
        id: guides.id,
        userId: guides.userId,
        bio: guides.bio,
        specialties: guides.specialties,
        experience: guides.experience,
        languages: guides.languages,
        hourlyRate: guides.hourlyRate,
        rating: guides.rating,
        reviewCount: guides.reviewCount,
        toursCompleted: guides.toursCompleted,
        profileImageUrl: guides.profileImageUrl,
        whatsapp: guides.whatsapp,
        instagram: guides.instagram,
        createdAt: guides.createdAt,
        updatedAt: guides.updatedAt,
        // Dados do usuário
        firstName: users.firstName,
        lastName: users.lastName,
        email: users.email,
        phone: users.phone,
        location: users.location,
        userProfileImageUrl: users.profileImageUrl,
      })
      .from(guides)
      .leftJoin(users, eq(guides.userId, users.id))
      .where(eq(guides.id, id));
    return result;
  }

  async getGuideById(id: string): Promise<Guide | undefined> {
    const [guide] = await db.select().from(guides).where(eq(guides.id, id));
    return guide;
  }

  async createGuide(userId: string, guideData: any): Promise<any> {
    const [newGuide] = await db
      .insert(guides)
      .values({
        userId,
        ...guideData,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();
      
    // Retornar guia com dados do usuário
    return this.getGuide(newGuide.id);
  }

  async updateGuide(id: string, guideData: any): Promise<any> {
    const [updatedGuide] = await db
      .update(guides)
      .set({
        ...guideData,
        updatedAt: new Date(),
      })
      .where(eq(guides.id, id))
      .returning();
      
    // Retornar guia com dados do usuário
    return this.getGuide(updatedGuide.id);
  }

  async getTrailById(id: string): Promise<Trail | undefined> {
    const [trail] = await db.select().from(trails).where(eq(trails.id, id));
    return trail;
  }

  async getBeachById(id: string): Promise<Beach | undefined> {
    const [beach] = await db.select().from(beaches).where(eq(beaches.id, id));
    return beach;
  }

  async getBoatTourById(id: string): Promise<BoatTour | undefined> {
    const [tour] = await db.select().from(boatTours).where(eq(boatTours.id, id));
    return tour;
  }

  async getGuideByUserId(userId: string): Promise<any | undefined> {
    // Buscar guia por userId
    const [result] = await db
      .select({
        id: guides.id,
        userId: guides.userId,
        bio: guides.bio,
        specialties: guides.specialties,
        experience: guides.experience,
        languages: guides.languages,
        hourlyRate: guides.hourlyRate,
        rating: guides.rating,
        reviewCount: guides.reviewCount,
        toursCompleted: guides.toursCompleted,
        profileImageUrl: guides.profileImageUrl,
        whatsapp: guides.whatsapp,
        instagram: guides.instagram,
        createdAt: guides.createdAt,
        updatedAt: guides.updatedAt,
        // Dados do usuário
        firstName: users.firstName,
        lastName: users.lastName,
        email: users.email,
        phone: users.phone,
        location: users.location,
        userProfileImageUrl: users.profileImageUrl,
      })
      .from(guides)
      .leftJoin(users, eq(guides.userId, users.id))
      .where(eq(guides.userId, userId));
    return result;
  }



  async deleteGuide(id: string): Promise<void> {
    await db.delete(guides).where(eq(guides.id, id));
  }

  // Itineraries
  async getUserItineraries(userId: string): Promise<Itinerary[]> {
    return await db.select().from(itineraries)
      .where(eq(itineraries.userId, userId))
      .orderBy(desc(itineraries.createdAt));
  }

  async createItinerary(itinerary: InsertItinerary): Promise<Itinerary> {
    const [newItinerary] = await db.insert(itineraries).values(itinerary).returning();
    return newItinerary;
  }

  // Favorites
  async getUserFavorites(userId: string): Promise<Favorite[]> {
    return await db.select().from(favorites)
      .where(eq(favorites.userId, userId))
      .orderBy(desc(favorites.createdAt));
  }

  async addFavorite(favorite: InsertFavorite): Promise<Favorite> {
    const [newFavorite] = await db.insert(favorites).values(favorite).returning();
    return newFavorite;
  }

  async removeFavorite(userId: string, itemType: string, itemId: string): Promise<void> {
    await db.delete(favorites)
      .where(and(
        eq(favorites.userId, userId),
        eq(favorites.itemType, itemType),
        eq(favorites.itemId, itemId)
      ));
  }

  async isFavorite(userId: string, itemType: string, itemId: string): Promise<boolean> {
    const [favorite] = await db.select().from(favorites)
      .where(and(
        eq(favorites.userId, userId),
        eq(favorites.itemType, itemType),
        eq(favorites.itemId, itemId)
      ));
    return !!favorite;
  }

  // Bookings
  async getUserBookings(userId: string): Promise<Booking[]> {
    return await db.select().from(bookings)
      .where(eq(bookings.userId, userId))
      .orderBy(desc(bookings.createdAt));
  }

  async createBooking(booking: InsertBooking): Promise<Booking> {
    const [newBooking] = await db.insert(bookings).values(booking).returning();
    return newBooking;
  }

  async getBooking(id: string): Promise<Booking | undefined> {
    const [booking] = await db.select().from(bookings).where(eq(bookings.id, id));
    return booking;
  }

  async updateBookingStatus(id: string, status: string): Promise<Booking> {
    const [updatedBooking] = await db.update(bookings)
      .set({ status })
      .where(eq(bookings.id, id))
      .returning();
    return updatedBooking;
  }
}

export const storage = new DatabaseStorage();
