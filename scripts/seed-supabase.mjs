// Carga src/data/beaches.json (~3.600 playas) en la tabla `locations` de
// Supabase, en lotes. Requiere SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY
// (ver .env.example). No se ejecuta automáticamente — es un paso manual
// una vez el usuario conecta su propio proyecto Supabase (ver TODO.md P1).
//
// Uso: node scripts/seed-supabase.mjs
import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error("Faltan SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY en el entorno.");
  process.exit(1);
}

const supabase = createClient(url, key);
const beaches = JSON.parse(readFileSync("src/data/beaches.json", "utf8"));

const BATCH_SIZE = 500;

async function main() {
  console.log(`Cargando ${beaches.length} playas en Supabase...`);
  for (let i = 0; i < beaches.length; i += BATCH_SIZE) {
    const batch = beaches.slice(i, i + BATCH_SIZE).map((b) => ({
      slug: b.slug,
      name: b.name,
      municipality: b.municipality,
      province: b.province,
      region: b.region,
      lat: b.lat,
      lon: b.lon,
      popular: b.popular,
    }));
    const { error } = await supabase.from("locations").upsert(batch, { onConflict: "slug" });
    if (error) {
      console.error(`Error en lote ${i}-${i + batch.length}:`, error.message);
      process.exit(1);
    }
    console.log(`  ${Math.min(i + BATCH_SIZE, beaches.length)}/${beaches.length}`);
  }
  console.log("Listo.");
}

main();
