import { Database } from "bun:sqlite";
import { readFileSync } from "fs";

const db = new Database("./ventanas_corredizas.db");

// Limpiar todo
try { db.exec("DROP TABLE IF EXISTS dimensiones_ventana"); } catch(e) {}
try { db.exec("DROP TABLE IF EXISTS configuraciones"); } catch(e) {}
try { db.exec("DROP TABLE IF EXISTS rangos_panel"); } catch(e) {}
try { db.exec("DROP TABLE IF EXISTS vidrios"); } catch(e) {}
try { db.exec("DROP TABLE IF EXISTS acabados"); } catch(e) {}
try { db.exec("DROP TABLE IF EXISTS modelos"); } catch(e) {}
try { db.exec("DROP VIEW IF EXISTS v_configuraciones"); } catch(e) {}

// Dividir y ejecutar schema
const schema = readFileSync("./ventanas_corredizas_schema.sql", "utf8");
const lines = schema.split('\n');
const cleanLines = lines.map(line => line.trim().startsWith('--') ? '' : line);
const cleanSchema = cleanLines.join('\n');
const statements = cleanSchema.split(/;\s*\n/).map(s => s.trim()).filter(s => s.length > 0);

for (const stmt of statements) {
  try { db.exec(stmt); } catch (e) { /* ignore */ }
}

console.log("=== TODOS LOS SISTEMAS CORREDIZOS ===\n");

const results = db.query(`
  SELECT 
    codigo,
    configuracion,
    cantidad_fijos,
    cantidad_moviles,
    rieles,
    ancho_min_mm,
    ancho_max_mm,
    alto_min_mm,
    alto_max_mm
  FROM v_configuraciones
  ORDER BY codigo, configuracion
`).all();

for (const r of results) {
  console.log(`[${r.codigo}] ${r.configuracion} (${r.cantidad_fijos}F + ${r.cantidad_moviles}M) en ${r.rieles} rieles`);
  console.log(`   Ancho: ${r.ancho_min_mm} - ${r.ancho_max_mm} mm`);
  console.log(`   Alto:  ${r.alto_min_mm} - ${r.alto_max_mm} mm`);
  console.log("");
}

db.close();
