import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '@shared/schema';

// This is the connection URL from your NeonDB project.
const connectionString = process.env.DATABASE_URL!;

// Create the client and the database instance for Drizzle
const client = postgres(connectionString, { prepare: false });
export const db = drizzle(client, { schema });
