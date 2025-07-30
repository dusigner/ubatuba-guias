import { sql, relations } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  integer,
  decimal,
  boolean,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table (required for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table (required for Replit Auth)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  userType: varchar("user_type", { enum: ["tourist", "guide", "event_producer", "boat_tour_operator"] }).default("tourist"),
  phone: varchar("phone"),
  bio: text("bio"),
  isProfileComplete: boolean("is_profile_complete").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Trails table
export const trails = pgTable("trails", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  description: text("description").notNull(),
  difficulty: varchar("difficulty").notNull(), // easy, moderate, difficult
  distance: decimal("distance", { precision: 5, scale: 2 }).notNull(), // in km
  duration: integer("duration").notNull(), // in minutes
  elevation: integer("elevation").notNull(), // in meters
  rating: decimal("rating", { precision: 2, scale: 1 }).default("0"),
  reviewCount: integer("review_count").default(0),
  imageUrl: varchar("image_url"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Beaches table
export const beaches = pgTable("beaches", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  description: text("description").notNull(),
  features: text("features").array(), // parking, restaurants, lifeguard, etc.
  activities: text("activities").array(), // surf, diving, scenic, etc.
  rating: decimal("rating", { precision: 2, scale: 1 }).default("0"),
  reviewCount: integer("review_count").default(0),
  imageUrl: varchar("image_url"),
  isTopRated: boolean("is_top_rated").default(false),
  isPreserved: boolean("is_preserved").default(false),
  accessType: varchar("access_type").default("car"), // car, trail, boat
  createdAt: timestamp("created_at").defaultNow(),
});

// Boat tours table
export const boatTours = pgTable("boat_tours", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  description: text("description").notNull(),
  duration: integer("duration").notNull(), // in hours
  maxPeople: integer("max_people").notNull(),
  price: decimal("price", { precision: 8, scale: 2 }).notNull(),
  companyName: varchar("company_name").notNull(),
  rating: decimal("rating", { precision: 2, scale: 1 }).default("0"),
  reviewCount: integer("review_count").default(0),
  includes: text("includes").array(), // equipment, food, guide, etc.
  imageUrl: varchar("image_url"),
  isPopular: boolean("is_popular").default(false),
  isRomantic: boolean("is_romantic").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Events table
export const events = pgTable("events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title").notNull(),
  description: text("description").notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  location: varchar("location").notNull(),
  startTime: varchar("start_time").notNull(),
  endTime: varchar("end_time").notNull(),
  ticketPrice: varchar("ticket_price").notNull(),
  category: varchar("category").notNull(), // music, cultural, food, etc.
  producerId: varchar("producer_id").references(() => users.id),
  producerName: varchar("producer_name").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Guides table
export const guides = pgTable("guides", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  name: varchar("name").notNull(),
  description: text("description").notNull(),
  specialties: text("specialties").array(), // trails, diving, history, etc.
  languages: text("languages").array(),
  experienceYears: integer("experience_years").notNull(),
  toursCompleted: integer("tours_completed").default(0),
  rating: decimal("rating", { precision: 2, scale: 1 }).default("0"),
  imageUrl: varchar("image_url"),
  location: varchar("location").default("Ubatuba, SP"),
  certifications: text("certifications").array(),
  whatsapp: varchar("whatsapp"),
  instagram: varchar("instagram"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Itineraries table
export const itineraries = pgTable("itineraries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  preferences: jsonb("preferences").notNull(), // user preferences used to generate
  content: jsonb("content").notNull(), // AI generated itinerary
  title: varchar("title").notNull(),
  duration: integer("duration").notNull(), // in days
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  events: many(events),
  guides: many(guides),
  itineraries: many(itineraries),
}));

export const eventsRelations = relations(events, ({ one }) => ({
  producer: one(users, {
    fields: [events.producerId],
    references: [users.id],
  }),
}));

export const guidesRelations = relations(guides, ({ one }) => ({
  user: one(users, {
    fields: [guides.userId],
    references: [users.id],
  }),
}));

export const itinerariesRelations = relations(itineraries, ({ one }) => ({
  user: one(users, {
    fields: [itineraries.userId],
    references: [users.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  email: true,
  firstName: true,
  lastName: true,
  profileImageUrl: true,
  userType: true,
});

export const insertTrailSchema = createInsertSchema(trails).omit({
  id: true,
  createdAt: true,
});

export const insertBeachSchema = createInsertSchema(beaches).omit({
  id: true,
  createdAt: true,
});

export const insertBoatTourSchema = createInsertSchema(boatTours).omit({
  id: true,
  createdAt: true,
});

export const insertEventSchema = createInsertSchema(events).omit({
  id: true,
  createdAt: true,
});

export const insertGuideSchema = createInsertSchema(guides).omit({
  id: true,
  createdAt: true,
});

export const insertItinerarySchema = createInsertSchema(itineraries).omit({
  id: true,
  createdAt: true,
});

// Types
export type UpsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Trail = typeof trails.$inferSelect;
export type Beach = typeof beaches.$inferSelect;
export type BoatTour = typeof boatTours.$inferSelect;
export type Event = typeof events.$inferSelect;
export type Guide = typeof guides.$inferSelect;
export type Itinerary = typeof itineraries.$inferSelect;
export type InsertTrail = z.infer<typeof insertTrailSchema>;
export type InsertBeach = z.infer<typeof insertBeachSchema>;
export type InsertBoatTour = z.infer<typeof insertBoatTourSchema>;
export type InsertEvent = z.infer<typeof insertEventSchema>;
export type InsertGuide = z.infer<typeof insertGuideSchema>;
export type InsertItinerary = z.infer<typeof insertItinerarySchema>;

// Favorites table
export const favorites = pgTable("favorites", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  itemType: varchar("item_type").notNull(), // 'trail', 'beach', 'boat_tour', 'event', 'guide'
  itemId: varchar("item_id").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertFavoriteSchema = createInsertSchema(favorites).omit({
  id: true,
  createdAt: true,
});

export type Favorite = typeof favorites.$inferSelect;
export type InsertFavorite = z.infer<typeof insertFavoriteSchema>;

// Bookings table for tours and guides
export const bookings = pgTable("bookings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  itemType: varchar("item_type").notNull(), // 'boat_tour', 'guide'
  itemId: varchar("item_id").notNull(),
  bookingDate: timestamp("booking_date").notNull(),
  status: varchar("status").notNull().default("pending"), // 'pending', 'confirmed', 'cancelled'
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertBookingSchema = createInsertSchema(bookings).omit({
  id: true,
  createdAt: true,
  status: true,
});

export type Booking = typeof bookings.$inferSelect;
export type InsertBooking = z.infer<typeof insertBookingSchema>;
