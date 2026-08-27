// Genera src/data/fishOccurrences.json: observaciones REALES de especies de
// pesca cerca de la costa española, desde GBIF (Global Biodiversity
// Information Facility — agrega datos de iNaturalist y otras fuentes de
// ciencia ciudadana/museos, con coordenadas GPS reales). Esto es lo que
// permite acercarnos de verdad a "qué especie hay cerca de ESTA playa/
// espigón concreto" en vez de solo dar una lista general por región —
// sin inventar nada: si no hay observaciones reales cerca, no se muestra
// ninguna especie "de cerca" (se cae al conocimiento general por zona,
// ver lib/fishing.ts).
//
// Build-time, no en cada request — igual que playas/tiendas/espigones.
// API pública de GBIF, sin API key.
//
// Uso: node scripts/generate-fish-occurrences.mjs [--use-cache]
import { writeFileSync, existsSync, readFileSync, mkdirSync } from "node:fs";

// Mismo catálogo que src/lib/fishSpecies.ts (id + nombre científico) —
// duplicado aquí a propósito: este script es .mjs plano y no depende de
// poder importar TypeScript directamente, así se puede ejecutar en
// cualquier versión de Node sin sorpresas. Si se añade una especie a
// fishSpecies.ts, añadir aquí también su nombre científico.
const FISH_SPECIES = [
  { id: "lubina", scientificName: "Dicentrarchus labrax" },
  { id: "dorada", scientificName: "Sparus aurata" },
  { id: "sargo", scientificName: "Diplodus sargus" },
  { id: "corvina", scientificName: "Argyrosomus regius" },
  { id: "congrio", scientificName: "Conger conger" },
  { id: "mujol", scientificName: "Mugil cephalus" },
  { id: "choco", scientificName: "Sepia officinalis" },
  { id: "pulpo", scientificName: "Octopus vulgaris" },
  { id: "salema", scientificName: "Sarpa salpa" },
  { id: "vieja", scientificName: "Sparisoma cretense" },
  { id: "sama", scientificName: "Dentex dentex" },
  { id: "breca", scientificName: "Pagellus erythrinus" },
  { id: "chopa", scientificName: "Spondyliosoma cantharus" },
  { id: "lenguado", scientificName: "Solea solea" },
  { id: "bonito", scientificName: "Sarda sarda" },
  { id: "caballa", scientificName: "Scomber scombrus" },
  { id: "faneca", scientificName: "Trisopterus luscus" },
];

const CACHE_PATH = "scripts/tmp/fish_occurrences_raw.json";
const OUT_PATH = "src/data/fishOccurrences.json";
const PAGE_SIZE = 300;
const MAX_PAGES_PER_SPECIES = 3; // hasta 900 registros por especie

async function fetchSpeciesOccurrences(scientificName) {
  const all = [];
  for (let page = 0; page < MAX_PAGES_PER_SPECIES; page++) {
    const params = new URLSearchParams({
      scientificName,
      country: "ES",
      hasCoordinate: "true",
      hasGeospatialIssue: "false",
      limit: String(PAGE_SIZE),
      offset: String(page * PAGE_SIZE),
    });
    const url = `https://api.gbif.org/v1/occurrence/search?${params.toString()}`;
    let json;
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const res = await fetch(url, { headers: { "User-Agent": "SeaActivityIntelligence/1.0" } });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        json = await res.json();
        break;
      } catch (err) {
        console.warn(`  fallo (${scientificName}, página ${page}): ${err.message}`);
        await new Promise((r) => setTimeout(r, 3000));
      }
    }
    if (!json || !json.results) break;
    for (const r of json.results) {
      if (r.decimalLatitude == null || r.decimalLongitude == null) continue;
      all.push({ lat: r.decimalLatitude, lon: r.decimalLongitude });
    }
    if (json.results.length < PAGE_SIZE || json.endOfRecords) break;
  }
  return all;
}

async function main() {
  mkdirSync("scripts/tmp", { recursive: true });
  const useCache = process.argv.includes("--use-cache");

  let bySpecies;
  if (useCache && existsSync(CACHE_PATH)) {
    console.log("Usando caché local:", CACHE_PATH);
    bySpecies = JSON.parse(readFileSync(CACHE_PATH, "utf8"));
  } else {
    bySpecies = {};
    for (const species of FISH_SPECIES) {
      console.log(`Consultando GBIF: ${species.id} (${species.scientificName})...`);
      const points = await fetchSpeciesOccurrences(species.scientificName);
      console.log(`  ${points.length} observaciones con coordenadas`);
      bySpecies[species.id] = points;
      await new Promise((r) => setTimeout(r, 500)); // no machacar la API pública
    }
    writeFileSync(CACHE_PATH, JSON.stringify(bySpecies));
  }

  // Redondear a ~1km (3 decimales) y deduplicar — no necesitamos precisión de
  // metro a metro, solo "hay observaciones reales de esto cerca de aquí".
  const out = [];
  for (const [speciesId, points] of Object.entries(bySpecies)) {
    const seen = new Set();
    for (const p of points) {
      const lat = Math.round(p.lat * 1000) / 1000;
      const lon = Math.round(p.lon * 1000) / 1000;
      const key = `${lat},${lon}`;
      if (seen.has(key)) continue;
      seen.add(key);
      out.push({ speciesId, lat, lon });
    }
  }

  mkdirSync("src/data", { recursive: true });
  writeFileSync(OUT_PATH, JSON.stringify(out, null, 0));

  console.log(`\n${out.length} puntos de observación reales generados en ${OUT_PATH}`);
  const counts = {};
  for (const p of out) counts[p.speciesId] = (counts[p.speciesId] ?? 0) + 1;
  console.log(counts);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
