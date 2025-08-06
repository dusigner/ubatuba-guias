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
import { eq, desc, and, sql, or } from "drizzle-orm";

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
  getTrailById(id: string): Promise<Trail | undefined>;
  getTrailByIdOrSlug(identifier: string): Promise<Trail | undefined>;
  createTrail(trail: InsertTrail): Promise<Trail>;
  updateTrail(id: string, trail: Partial<InsertTrail>): Promise<Trail>;
  deleteTrail(id: string): Promise<void>;
  
  // Beaches  
  getBeaches(): Promise<Beach[]>;
  getBeach(id: string): Promise<Beach | undefined>;
  getBeachById(id: string): Promise<Beach | undefined>;
  getBeachByIdOrSlug(identifier: string): Promise<Beach | undefined>;
  createBeach(beach: InsertBeach): Promise<Beach>;
  updateBeach(id: string, beach: Partial<InsertBeach>): Promise<Beach>;
  deleteBeach(id: string): Promise<void>;
  
  // Boat Tours
  getBoatTours(): Promise<BoatTour[]>;
  getBoatTour(id: string): Promise<BoatTour | undefined>;
  getBoatTourById(id: string): Promise<BoatTour | undefined>;
  getBoatTourByIdOrSlug(identifier: string): Promise<BoatTour | undefined>;
  createBoatTour(tour: InsertBoatTour): Promise<BoatTour>;
  updateBoatTour(id: string, tour: Partial<InsertBoatTour>): Promise<BoatTour>;
  deleteBoatTour(id: string): Promise<void>;
  
  // Events
  getEvents(): Promise<Event[]>;
  getEventById(id: string): Promise<Event | undefined>;
  getEventByIdOrSlug(identifier: string): Promise<Event | undefined>;
  createEvent(event: InsertEvent): Promise<Event>;
  updateEvent(id: string, event: Partial<InsertEvent>): Promise<Event>;
  deleteEvent(id: string): Promise<void>;
  
  // Guides
  getGuides(): Promise<any[]>;
  getGuide(id: string): Promise<any | undefined>;
  getGuideByIdOrSlug(identifier: string): Promise<any | undefined>;
  getGuideByUserId(userId: string): Promise<any | undefined>;
  createGuide(userId: string, guideData: any): Promise<any>;
  updateGuide(id: string, guideData: any): Promise<any>;
  
  // Itineraries
  getUserItineraries(userId: string): Promise<Itinerary[]>;
  getItineraryById(id: string): Promise<Itinerary | undefined>;
  createItinerary(itinerary: InsertItinerary): Promise<Itinerary>;

  // Favorites
  getUserFavorites(userId: string): Promise<Favorite[]>;
  addFavorite(favorite: InsertFavorite): Promise<Favorite>;
  removeFavorite(userId: string, itemType: string, itemId: string): Promise<void>;
  isFavorite(userId: string, itemType: string, itemId: string): Promise<boolean>;

  // Admin methods
  getAllUsers(): Promise<User[]>;
  adminUpdateUser(userId: string, userData: Partial<UpsertUser>): Promise<User>;
  deleteUser(userId: string): Promise<void>;
  getFeaturedGuides(): Promise<any[]>;

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

  async getUsersByType(userType: string): Promise<User[]> {
    return await db.select().from(users).where(eq(users.userType, userType as any)).orderBy(desc(users.createdAt));
  }

  // Trails
  async getTrails(): Promise<Trail[]> {
    return await db.select().from(trails).orderBy(desc(trails.rating));
  }

  async getTrail(id: string): Promise<Trail | undefined> {
    const [trail] = await db.select().from(trails).where(eq(trails.id, id));
    return trail;
  }

  async getTrailById(id: string): Promise<Trail | undefined> {
    const [trail] = await db.select().from(trails).where(eq(trails.id, id));
    return trail;
  }

  async getTrailByIdOrSlug(identifier: string): Promise<Trail | undefined> {
    const [trail] = await db.select().from(trails).where(
      or(eq(trails.id, identifier), eq(trails.slug, identifier))
    );
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



  async getBeachByIdOrSlug(identifier: string): Promise<Beach | undefined> {
    const [beach] = await db.select().from(beaches).where(
      or(eq(beaches.id, identifier), eq(beaches.slug, identifier))
    );
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

  async getBoatTourById(id: string): Promise<BoatTour | undefined> {
    const [tour] = await db.select().from(boatTours).where(eq(boatTours.id, id));
    return tour;
  }

  async getBoatTourByIdOrSlug(identifier: string): Promise<BoatTour | undefined> {
    const [tour] = await db.select().from(boatTours).where(
      or(eq(boatTours.id, identifier), eq(boatTours.slug, identifier))
    );
    return tour;
  }

  async createBoatTour(tour: InsertBoatTour): Promise<BoatTour> {
    let baseSlug = tour.name?.toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // Remove accents
      .replace(/[^a-z0-9\s-]/g, '') // Remove special chars
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
    
    // Check if slug already exists and make it unique
    let uniqueSlug = baseSlug;
    let counter = 1;
    
    while (true) {
      const [existingTour] = await db.select().from(boatTours).where(eq(boatTours.slug, uniqueSlug));
      if (!existingTour) {
        break;
      }
      uniqueSlug = `${baseSlug}-${counter}`;
      counter++;
    }
    
    const tourWithSlug = { ...tour, slug: uniqueSlug };
    const [newTour] = await db.insert(boatTours).values(tourWithSlug).returning();
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

  async getEventByIdOrSlug(identifier: string): Promise<Event | undefined> {
    const [event] = await db.select().from(events).where(
      or(eq(events.id, identifier), eq(events.slug, identifier))
    );
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
    try {
      console.log('Iniciando busca de guias...');
      
      // Usar SQL direto para garantir que funciona
      const result = await db.execute(sql`
        SELECT id, user_id, name, description, specialties, languages, 
               experience_years, tours_completed, rating, image_url, 
               location, certifications, whatsapp, instagram, created_at, 
               bio, experience
        FROM guides 
        ORDER BY created_at DESC
      `);
      
      console.log('Guides encontrados na tabela:', result.rows.length);
      console.log('Dados dos primeiros guides:', result.rows.slice(0, 2));
      
      // Mapear os dados corretamente usando os nomes das colunas
      const formattedGuides = result.rows.map((guide: any) => ({
        id: guide.id,
        userId: guide.user_id,
        name: guide.name || 'Nome não informado',
        bio: guide.bio || guide.description || '',
        description: guide.description || '',
        specialties: Array.isArray(guide.specialties) ? guide.specialties : (guide.specialties ? [guide.specialties] : []),
        experience: guide.experience || '',
        languages: Array.isArray(guide.languages) ? guide.languages : (guide.languages ? [guide.languages] : ['Português']),
        experienceYears: guide.experience_years || 0,
        toursCompleted: guide.tours_completed || 0,
        rating: parseFloat(guide.rating) || 0,
        imageUrl: guide.image_url,
        location: guide.location || 'Ubatuba, SP',
        certifications: Array.isArray(guide.certifications) ? guide.certifications : (guide.certifications ? [guide.certifications] : []),
        whatsapp: guide.whatsapp,
        instagram: guide.instagram,
        createdAt: guide.created_at,
      }));
      
      console.log('Guides formatados e retornados:', formattedGuides.length);
      console.log('IDs dos guias:', formattedGuides.map(g => g.id));
      
      return formattedGuides;
      
    } catch (error) {
      console.error('Erro ao buscar guias:', error);
      return [];
    }
  }

  async getAllGuides(): Promise<Guide[]> {
    return await db.select().from(guides);
  }

  async getGuide(id: string): Promise<any | undefined> {
    try {
      // Buscar guia por ID simples
      const [guide] = await db.select().from(guides).where(eq(guides.id, id));
      if (!guide) return undefined;
      
      // Retornar dados simples do guia
      return guide;
    } catch (error) {
      console.error('Erro ao buscar guia:', error);
      return undefined;
    }
  }

  async getGuideByIdOrSlug(identifier: string): Promise<any | undefined> {
    try {
      // Buscar guia por ID ou slug usando SQL direto
      const result = await db.execute(sql`
        SELECT 
          id,
          user_id,
          name,
          slug,
          description,
          specialties,
          languages,
          experience_years,
          tours_completed,
          rating,
          image_url,
          location,
          certifications,
          whatsapp,
          instagram,
          created_at,
          bio,
          experience
        FROM guides 
        WHERE id = ${identifier} OR slug = ${identifier}
      `);
      
      if (result.rows.length === 0) {
        return undefined;
      }
      
      const guide = result.rows[0] as any;
      
      return {
        id: guide.id,
        userId: guide.user_id,
        name: guide.name,
        slug: guide.slug,
        description: guide.description,
        specialties: guide.specialties,
        languages: guide.languages,
        experienceYears: guide.experience_years || 0,
        toursCompleted: guide.tours_completed || 0,
        rating: parseFloat(guide.rating || "0"),
        imageUrl: guide.image_url,
        location: guide.location,
        certifications: guide.certifications || [],
        whatsapp: guide.whatsapp,
        instagram: guide.instagram,
        createdAt: guide.created_at,
        bio: guide.bio,
        experience: guide.experience,
      };
    } catch (error) {
      console.error('Erro ao buscar guia por ID ou slug:', error);
      return undefined;
    }
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
      })
      .returning();
      
    return newGuide;
  }

  async createGuideFromProfile(userId: string, guideData: any): Promise<any> {
    try {
      console.log('Criando guia na tabela guides para userId:', userId);
      
      const [newGuide] = await db
        .insert(guides)
        .values({
          id: sql`gen_random_uuid()`,
          userId,
          name: guideData.name,
          description: guideData.description,
          specialties: guideData.specialties,
          languages: guideData.languages,
          experienceYears: guideData.experienceYears,
          toursCompleted: guideData.toursCompleted || 0,
          rating: guideData.rating || '0',
          imageUrl: guideData.imageUrl,
          location: guideData.location,
          certifications: guideData.certifications,
          whatsapp: guideData.whatsapp,
          instagram: guideData.instagram,
          createdAt: new Date(),
          bio: guideData.bio,
          experience: guideData.experience,
        })
        .returning();
        
      console.log('Guia criado com sucesso:', newGuide.id);
      return newGuide;
    } catch (error) {
      console.error('Erro ao criar guia:', error);
      throw error;
    }
  }

  async updateGuide(id: string, guideData: any): Promise<any> {
    const [updatedGuide] = await db
      .update(guides)
      .set(guideData)
      .where(eq(guides.id, id))
      .returning();
      
    return updatedGuide;
  }

  async getBeachById(id: string): Promise<Beach | undefined> {
    const [beach] = await db.select().from(beaches).where(eq(beaches.id, id));
    return beach;
  }

  async getGuideByUserId(userId: string): Promise<any | undefined> {
    // Buscar guia por userId simples
    const [guide] = await db.select().from(guides).where(eq(guides.userId, userId));
    return guide;
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

  async getItineraryById(id: string): Promise<Itinerary | undefined> {
    const [itinerary] = await db.select().from(itineraries).where(eq(itineraries.id, id));
    return itinerary;
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

  // Admin methods for user management
  async getAllUsers(): Promise<User[]> {
    try {
      const allUsers = await db.select().from(users).orderBy(desc(users.createdAt));
      return allUsers;
    } catch (error) {
      console.error('Erro ao buscar todos os usuários:', error);
      throw error;
    }
  }

  // async getAllUsers(): Promise<User[]> {
  //   return await db.select().from(users).orderBy(desc(users.createdAt));
  // }

  async adminUpdateUser(userId: string, userData: Partial<UpsertUser>): Promise<User> {
    try {
      const [updatedUser] = await db.update(users)
        .set({
          ...userData,
          updatedAt: new Date()
        })
        .where(eq(users.id, userId))
        .returning();
      return updatedUser;
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      throw error;
    }
  }

  // async adminUpdateUser(id: string, data: Partial<User>): Promise<User> {
  //   const [user] = await db
  //     .update(users)
  //     .set({
  //       ...data,
  //       updatedAt: new Date(),
  //     })
  //     .where(eq(users.id, id))
  //     .returning();
  //   return user;
  // }

  async deleteUser(userId: string): Promise<void> {
    try {
      await db.delete(users).where(eq(users.id, userId));
    } catch (error) {
      console.error('Erro ao deletar usuário:', error);
      throw error;
    }
  }

  // Get featured guides for landing page
  async getFeaturedGuides(): Promise<any[]> {
    try {
      console.log('Buscando guias em destaque...');
      
      const result = await db.execute(sql`
        SELECT id, user_id, name, description, specialties, languages, 
               experience_years, tours_completed, rating, image_url, 
               location, certifications, whatsapp, instagram, featured, 
               created_at, bio, experience
        FROM guides 
        WHERE featured = true
        ORDER BY rating DESC, tours_completed DESC
        LIMIT 6
      `);
      
      console.log('Guias em destaque encontrados:', result.rows.length);
      
      const formattedGuides = result.rows.map((guide: any) => ({
        id: guide.id,
        userId: guide.user_id,
        name: guide.name || 'Nome não informado',
        bio: guide.bio || guide.description || '',
        description: guide.description || '',
        specialties: Array.isArray(guide.specialties) ? guide.specialties : (guide.specialties ? [guide.specialties] : []),
        experience: guide.experience || '',
        languages: Array.isArray(guide.languages) ? guide.languages : (guide.languages ? [guide.languages] : ['Português']),
        experienceYears: guide.experience_years || 0,
        toursCompleted: guide.tours_completed || 0,
        rating: parseFloat(guide.rating) || 0,
        imageUrl: guide.image_url,
        location: guide.location || 'Ubatuba, SP',
        certifications: Array.isArray(guide.certifications) ? guide.certifications : (guide.certifications ? [guide.certifications] : []),
        whatsapp: guide.whatsapp,
        instagram: guide.instagram,
        featured: guide.featured,
        createdAt: guide.created_at,
      }));
      
      return formattedGuides;
      
    } catch (error) {
      console.error('Erro ao buscar guias em destaque:', error);
      return [];
    }
  }
}

export const storage = new DatabaseStorage();
