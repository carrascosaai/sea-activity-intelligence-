// Genera src/data/piers.json: espigones y diques reales de España
// (OpenStreetMap, man_made=breakwater/groyne) — puntos reales donde se suele
// pescar desde tierra. Build-time, no en cada request (igual que playas y
// tiendas). man_made=pier se excluye a propósito: en Overpass la mayoría son
// pantalanes individuales de marinas deportivas (miles de segmentos de
// pocos metros cada uno), no espigones de pesca reales.
//
// Uso: node scripts/generate-piers.mjs [--use-cache]
import { writeFileSync, existsSync, readFileSync, mkdirSync } from "node:fs";
import { haversineKm } from "./provinces.mjs";
import beaches from "../src/data/beaches.json" with { type: "json" };

const CACHE_PATH = "scripts/tmp/piers_raw.json";
const OUT_PATH = "src/data/piers.json";

const OVERPASS_ENDPOINTS = ["https://overpass-api.de/api/interpreter", "https://overpass.kumi.systems/api/interpreter"];

const PIER_QUERY = `[out:json][timeout:100];
area["ISO3166-1"="ES"][admin_level=2]->.spain;
(
  way["man_made"="breakwater"](area.spain);
  way["man_made"="groyne"](area.spain);
  node["man_made"="groyne"](area.spain);
);
out center tags;`;

async function fetchOverpass(query, minElements) {
  for (const endpoint of OVERPASS_ENDPOINTS) {
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        console.log(`Overpass: ${endpoint} intento ${attempt}...`);
        const res = await fetch(endpoint, {
          method: "POST",
          body: "data=" + encodeURIComponent(query),
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "User-Agent": "SeaActivityIntelligence/1.0",
          },
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        if (!json.elements || json.elements.length < minElements) throw new Error("respuesta sospechosamente pequeña");
        return json;
      } catch (err) {
        console.warn(`  fallo: ${err.message}`);
        await new Promise((r) => setTimeout(r, 4000));
      }
    }
  }
  throw new Error("No se pudo obtener datos de Overpass tras varios intentos");
}

function slugify(str) {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function nearestBeachName(lat, lon, maxKm = 8) {
  let best = null;
  let bestDist = Infinity;
  for (const b of beaches) {
    const dist = haversineKm(lat, lon, b.lat, b.lon);
    if (dist < bestDist) {
      bestDist = dist;
      best = b;
    }
  }
  return best && bestDist <= maxKm ? best.name : null;
}

async function main() {
  mkdirSync("scripts/tmp", { recursive: true });
  const useCache = process.argv.includes("--use-cache");

  let raw;
  if (useCache && existsSync(CACHE_PATH)) {
    console.log("Usando caché local:", CACHE_PATH);
    raw = JSON.parse(readFileSync(CACHE_PATH, "utf8"));
  } else {
    raw = await fetchOverpass(PIER_QUERY, 200);
    writeFileSync(CACHE_PATH, JSON.stringify(raw));
  }

  const points = raw.elements
    .map((el) => {
      const lat = el.type === "node" ? el.lat : el.center?.lat;
      const lon = el.type === "node" ? el.lon : el.center?.lon;
      if (lat == null || lon == null) return null;
      const kind = el.tags?.man_made === "groyne" ? "groyne" : "breakwater";
      return { lat, lon, kind, name: el.tags?.name?.trim() || null };
    })
    .filter(Boolean);

  // Deduplicar puntos a menos de 150m entre sí (varios nodos del mismo dique).
  const deduped = [];
  for (const p of points) {
    const dup = deduped.find((d) => haversineKm(d.lat, d.lon, p.lat, p.lon) < 0.15);
    if (!dup) deduped.push(p);
  }

  const slugCounts = new Map();
  const piers = deduped.map((p) => {
    const nearBeach = nearestBeachName(p.lat, p.lon);
    const label = p.name ?? (p.kind === "groyne" ? "Espigón" : "Dique/Escollera") + (nearBeach ? ` cerca de ${nearBeach}` : "");
    let slug = slugify(label + "-" + p.lat.toFixed(3) + "-" + p.lon.toFixed(3));
    const count = slugCounts.get(slug) ?? 0;
    slugCounts.set(slug, count + 1);
    if (count > 0) slug = `${slug}-${count + 1}`;
    return {
      slug,
      name: label,
      kind: p.kind,
      lat: Math.round(p.lat * 10000) / 10000,
      lon: Math.round(p.lon * 10000) / 10000,
      hasRealName: p.name != null,
    };
  });

  mkdirSync("src/data", { recursive: true });
  writeFileSync(OUT_PATH, JSON.stringify(piers.map(({ hasRealName, ...rest }) => rest), null, 0));

  console.log(`\n${piers.length} espigones/diques generados en ${OUT_PATH}`);
  console.log(`Con nombre real en OSM: ${piers.filter((p) => p.hasRealName).length}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
