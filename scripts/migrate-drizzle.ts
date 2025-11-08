import { config } from "dotenv";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import pkg from "pg";

const { Pool } = pkg;

// Load .env.local
config({ path: ".env.local" });

const runMigrations = async () => {
  const dbUrl = process.env.DIRECT_URL || process.env.DATABASE_URL;

  if (!dbUrl) {
    throw new Error("DATABASE_URL or DIRECT_URL not found in environment");
  }

  console.log("🔄 Running Drizzle migrations...");
  console.log(`📦 Database: ${dbUrl.split("@")[1]}`);

  const pool = new Pool({ connectionString: dbUrl });
  const db = drizzle({ client: pool });

  await migrate(db, {
    migrationsFolder: "./drizzle/migrations",
  });

  await pool.end();

  console.log("✅ Migrations completed successfully!");
  process.exit(0);
};

runMigrations().catch((error) => {
  console.error("❌ Migration failed:", error);
  process.exit(1);
});
