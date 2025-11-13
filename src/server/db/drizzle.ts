import { config } from "dotenv";

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { env } from "@/env";

config({ path: ".env.local" });
const connectionString = env.DATABASE_URL;

// Supabase uses transaction pooling (port 6543) which requires prepare: false
// This is the recommended configuration for Drizzle + Supabase
export const client = postgres(connectionString, { prepare: false });
export const db = drizzle(client);
