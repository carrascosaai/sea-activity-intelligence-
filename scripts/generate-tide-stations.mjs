// Genera src/data/tideStations.json a partir de @neaps/tide-database (TICON-4,
// GESLA-4 sea-level records — constituyentes armónicos reales, no astronomía
// genérica: las mismas fuerzas Sol-Luna dan mareas muy distintas según la
// costa, hace falta calibración local real). Se ejecuta en build-time /
// manualmente, no en cada request — @neaps/tide-database pesa ~56 MB y solo
// hace falta para generar este archivo, nunca se despliega (ver
// package.json, devDependency).
//
// SOLO estaciones con licencia que permite uso comercial (cc-by-4.0,
// license.commercial_use === true) — la base de datos también trae
// estaciones cc-by-nc-4.0 (no comercial) que legalmente no se pueden usar
// en un producto real, aunque hoy sea gratis. Se descartan sin excepción,
// aunque eso deje menos cobertura. Ver README, "Mareas".
//
// Uso: node scripts/generate-tide-stations.mjs
import { writeFileSync } from "node:fs";
import { allStations } from "@neaps/tide-database";

const OUT_PATH = "src/data/tideStations.json";

const spain = allStations.filter((s) => s.country === "Spain" && s.license?.commercial_use === true);

// La base de datos trae varias entradas casi idénticas para el mismo punto
// (distintas campañas/fuentes) — quedarse con una por coordenada (redondeada
// a ~1km) para no repetir estaciones.
const seen = new Map();
for (const s of spain) {
  const key = `${s.latitude.toFixed(2)},${s.longitude.toFixed(2)}`;
  // Prioriza la que tenga más constituyentes armónicos (predicción más precisa).
  const existing = seen.get(key);
  if (!existing || s.harmonic_constituents.length > existing.harmonic_constituents.length) {
    seen.set(key, s);
  }
}

const stations = [...seen.values()].map((s) => ({
  name: s.name,
  continent: s.continent,
  country: s.country,
  region: s.region ?? null,
  type: s.type,
  disclaimers: s.disclaimers,
  latitude: s.latitude,
  longitude: s.longitude,
  timezone: s.timezone,
  datums: s.datums,
  chart_datum: s.chart_datum,
  harmonic_constituents: s.harmonic_constituents,
  source: { name: s.source.name, id: s.source.id, url: s.source.url },
  license: { type: s.license.type, url: s.license.url },
}));

stations.sort((a, b) => a.name.localeCompare(b.name, "es"));

writeFileSync(OUT_PATH, JSON.stringify(stations, null, 2) + "\n");
console.log(`Escritas ${stations.length} estaciones de marea (licencia comercial) en ${OUT_PATH}`);
for (const s of stations) console.log(`  ${s.name} (${s.region ?? "?"}) — ${s.latitude}, ${s.longitude}`);
