// Genera src/data/shops.json a partir de datos reales de OpenStreetMap
// (Overpass API): tiendas de deportes acuáticos, centros de buceo y alquiler
// de material en España. Se ejecuta en build-time / manualmente, NO en cada
// request — mismo motivo que scripts/generate-beaches.mjs.
//
// Uso: node scripts/generate-shops.mjs [--use-cache]
import { writeFileSync, existsSync, readFileSync, mkdirSync } from "node:fs";
import { haversineKm } from "./provinces.mjs";

const CACHE_PATH = "scripts/tmp/shops_raw.json";
const OUT_PATH = "src/data/shops.json";

const OVERPASS_ENDPOINTS = ["https://overpass-api.de/api/interpreter", "https://overpass.kumi.systems/api/interpreter"];

const SHOP_QUERY = `[out:json][timeout:100];
area["ISO3166-1"="ES"][admin_level=2]->.spain;
(
  node["shop"="watersports"](area.spain);
  node["shop"="scuba_diving"](area.spain);
  node["shop"="surf"](area.spain);
  node["shop"="diving"](area.spain);
  node["amenity"="dive_centre"](area.spain);
  node["amenity"="boat_rental"](area.spain);
  node["leisure"="sports_centre"]["sport"~"surfing|windsurfing|kitesurfing|diving|scuba_diving|canoe|sailing|water_ski|wakeboard|wingfoil"](area.spain);
  node["club"="sport"]["sport"~"surfing|windsurfing|kitesurfing|diving|scuba_diving|canoe|sailing|water_ski|wakeboard|wingfoil"](area.spain);
  node["shop"="outdoor"]["sport"~"surfing|windsurfing|kitesurfing|diving"](area.spain);
);
out center tags;`;

// Tag "sport" de OSM (puede venir como lista separada por ";") -> IDs de
// actividad de la app (ver lib/activities.ts). Solo mapeamos a actividades
// que de verdad implican alquiler/clases de material, no a "baño" o "pesca".
const SPORT_TO_ACTIVITIES = {
  surfing: ["surf", "bodyboard"],
  surf: ["surf", "bodyboard"],
  bodyboard: ["bodyboard"],
  windsurfing: ["windsurf"],
  kitesurfing: ["kitesurf"],
  kite: ["kitesurf"],
  wingfoil: ["wingfoil"],
  wingfoiling: ["wingfoil"],
  canoe: ["kayak"],
  kayak: ["kayak"],
  canoeing: ["kayak"],
  stand_up_paddling: ["paddle-surf"],
  paddlesurfing: ["paddle-surf"],
  paddlesurf: ["paddle-surf"],
  sup: ["paddle-surf"],
  sailing: ["vela"],
  catamaran: ["vela"],
  scuba_diving: ["buceo", "snorkel", "apnea"],
  diving: ["buceo", "snorkel", "apnea"],
  apnea: ["apnea"],
  water_ski: ["esqui-acuatico"],
  waterski: ["esqui-acuatico"],
  wakeboard: ["wakeboard"],
  wakeboarding: ["wakeboard"],
  wakesurfing: ["wakeboard"],
  remo: ["remo"],
  multi: [],
};

function activitiesFromTags(tags) {
  const activities = new Set();
  for (const raw of (tags.sport ?? "").split(";")) {
    const s = raw.trim().toLowerCase();
    for (const a of SPORT_TO_ACTIVITIES[s] ?? []) activities.add(a);
  }
  if (tags.shop === "scuba_diving" || tags.shop === "diving" || tags.amenity === "dive_centre") {
    activities.add("buceo");
    activities.add("snorkel");
    activities.add("apnea");
  }
  if (tags.shop === "surf") {
    activities.add("surf");
    activities.add("bodyboard");
    activities.add("paddle-surf");
  }
  if (tags.shop === "watersports") {
    ["surf", "paddle-surf", "bodyboard", "kayak", "windsurf", "kitesurf"].forEach((a) => activities.add(a));
  }
  if (tags.amenity === "boat_rental") {
    ["kayak", "vela", "paddle-surf"].forEach((a) => activities.add(a));
  }
  return [...activities];
}

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

async function main() {
  mkdirSync("scripts/tmp", { recursive: true });
  const useCache = process.argv.includes("--use-cache");

  let raw;
  if (useCache && existsSync(CACHE_PATH)) {
    console.log("Usando caché local:", CACHE_PATH);
    raw = JSON.parse(readFileSync(CACHE_PATH, "utf8"));
  } else {
    raw = await fetchOverpass(SHOP_QUERY, 50);
    writeFileSync(CACHE_PATH, JSON.stringify(raw));
  }

  const points = raw.elements
    .map((el) => {
      const name = el.tags?.name?.trim();
      if (!name || el.lat == null || el.lon == null) return null;
      const activities = activitiesFromTags(el.tags);
      if (activities.length === 0) return null; // sin actividad reconocible, no es útil mostrarlo
      return {
        name,
        lat: el.lat,
        lon: el.lon,
        activities,
        phone: el.tags.phone ?? el.tags["contact:phone"] ?? null,
        website: el.tags.website ?? el.tags["contact:website"] ?? null,
        openingHours: el.tags.opening_hours ?? null,
      };
    })
    .filter(Boolean);

  // Deduplicar: mismo nombre normalizado a menos de 300m -> un solo punto
  // (evita duplicados de nodos con distintos tags para el mismo negocio).
  const deduped = [];
  for (const p of points) {
    const dup = deduped.find(
      (d) => d.name.toLowerCase() === p.name.toLowerCase() && haversineKm(d.lat, d.lon, p.lat, p.lon) < 0.3
    );
    if (dup) {
      dup.activities = [...new Set([...dup.activities, ...p.activities])];
      dup.phone = dup.phone ?? p.phone;
      dup.website = dup.website ?? p.website;
      dup.openingHours = dup.openingHours ?? p.openingHours;
    } else {
      deduped.push({ ...p });
    }
  }

  const slugCounts = new Map();
  const shops = deduped.map((p) => {
    let slug = slugify(p.name);
    const count = slugCounts.get(slug) ?? 0;
    slugCounts.set(slug, count + 1);
    if (count > 0) slug = `${slug}-${count + 1}`;
    return {
      slug,
      name: p.name,
      lat: Math.round(p.lat * 10000) / 10000,
      lon: Math.round(p.lon * 10000) / 10000,
      activities: p.activities,
      phone: p.phone,
      website: p.website,
      openingHours: p.openingHours,
    };
  });

  shops.sort((a, b) => a.name.localeCompare(b.name, "es"));

  mkdirSync("src/data", { recursive: true });
  writeFileSync(OUT_PATH, JSON.stringify(shops, null, 0));

  console.log(`\n${shops.length} tiendas/centros generados en ${OUT_PATH}`);
  console.log(`Con teléfono: ${shops.filter((s) => s.phone).length}, con web: ${shops.filter((s) => s.website).length}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
