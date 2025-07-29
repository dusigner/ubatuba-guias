import {
  users,
  trails,
  beaches,
  boatTours,
  events,
  guides,
  itineraries,
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
} from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Trails
  getTrails(): Promise<Trail[]>;
  getTrail(id: string): Promise<Trail | undefined>;
  createTrail(trail: InsertTrail): Promise<Trail>;
  
  // Beaches
  getBeaches(): Promise<Beach[]>;
  getBeach(id: string): Promise<Beach | undefined>;
  
  // Boat Tours
  getBoatTours(): Promise<BoatTour[]>;
  getBoatTour(id: string): Promise<BoatTour | undefined>;
  
  // Events
  getEvents(): Promise<Event[]>;
  createEvent(event: InsertEvent): Promise<Event>;
  
  // Guides
  getGuides(): Promise<Guide[]>;
  createGuide(guide: InsertGuide): Promise<Guide>;
  
  // Itineraries
  getUserItineraries(userId: string): Promise<Itinerary[]>;
  createItinerary(itinerary: InsertItinerary): Promise<Itinerary>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
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

  // Beaches
  async getBeaches(): Promise<Beach[]> {
    return await db.select().from(beaches).orderBy(desc(beaches.rating));
  }

  async getBeach(id: string): Promise<Beach | undefined> {
    const [beach] = await db.select().from(beaches).where(eq(beaches.id, id));
    return beach;
  }

  // Boat Tours
  async getBoatTours(): Promise<BoatTour[]> {
    return await db.select().from(boatTours).orderBy(desc(boatTours.rating));
  }

  async getBoatTour(id: string): Promise<BoatTour | undefined> {
    const [tour] = await db.select().from(boatTours).where(eq(boatTours.id, id));
    return tour;
  }

  // Events
  async getEvents(): Promise<Event[]> {
    return await db.select().from(events).orderBy(desc(events.startDate));
  }

  async createEvent(event: InsertEvent): Promise<Event> {
    const [newEvent] = await db.insert(events).values(event).returning();
    return newEvent;
  }

  // Guides
  async getGuides(): Promise<Guide[]> {
    return await db.select().from(guides).orderBy(desc(guides.rating));
  }

  async createGuide(guide: InsertGuide): Promise<Guide> {
    const [newGuide] = await db.insert(guides).values(guide).returning();
    return newGuide;
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
}

export const storage = new DatabaseStorage();
