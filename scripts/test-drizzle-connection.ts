import { sql } from "drizzle-orm";
import { db } from "../src/server/db/drizzle.js";

const testConnection = async () => {
  try {
    const result = await db.execute(
      sql`SELECT count(*) as total_tables FROM information_schema.tables WHERE table_schema = 'public'`
    );

    console.log("✅ Conexión exitosa a Drizzle");
    console.log(
      "📊 Tablas en schema public:",
      result.rows[0]?.total_tables ?? 0
    );

    // Listar todas las tablas
    const tables = await db.execute(
      sql`SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename`
    );

    console.log("\n📋 Tablas creadas:");
    for (const row of tables.rows) {
      console.log(`  - ${(row as { tablename: string }).tablename}`);
    }

    process.exit(0);
  } catch (error) {
    console.error("❌ Error de conexión:", error);
    process.exit(1);
  }
};

testConnection();
