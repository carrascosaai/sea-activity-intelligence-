// Genera src/data/beaches.json a partir de datos reales de OpenStreetMap
// (Overpass API, natural=beach en España). Se ejecuta en build-time / manualmente,
// NO en cada request — así la app no depende de Overpass para servir tráfico real
// (ver README, sección "Escalabilidad").
//
// Uso: node scripts/generate-beaches.mjs [--use-cache]
import { writeFileSync, existsSync, readFileSync, mkdirSync } from "node:fs";
import { nearestProvince, haversineKm } from "./provinces.mjs";
import { provinceFromIne } from "./ineProvinces.mjs";

const CACHE_PATH = "scripts/tmp/beaches_raw.json";
const PLACES_CACHE_PATH = "scripts/tmp/places_raw.json";
const OUT_PATH = "src/data/beaches.json";

const OVERPASS_ENDPOINTS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
];

const BEACH_QUERY = `[out:json][timeout:100];
area["ISO3166-1"="ES"][admin_level=2]->.spain;
(
  node["natural"="beach"](area.spain);
  way["natural"="beach"](area.spain);
);
out center tags;`;

const PLACES_QUERY = `[out:json][timeout:100];
area["ISO3166-1"="ES"][admin_level=2]->.spain;
(
  node["place"~"^(city|town)$"](area.spain);
);
out;`;

async function fetchOverpass(query, minElements) {
  for (const endpoint of OVERPASS_ENDPOINTS) {
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        console.log(`Overpass: ${endpoint} intento ${attempt}...`);
        const res = await fetch(endpoint, {
          method: "POST",
          body: "data=" + encodeURIComponent(query),
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
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

// Playas conocidas nacionalmente, para destacar en portada/mapa por defecto.
const POPULAR_NAME_HINTS = [
  "la concha",
  "malvarrosa",
  "barceloneta",
  "catedrales",
  "bolonia",
  "ses illetes",
  "es trenc",
  "del inglés",
  "las teresitas",
  "cofete",
  "patalavaca",
  "la barrosa",
  "zurriola",
  "somo",
  "san lorenzo",
  "cies",
  "carnota",
  "rodas",
  "valdevaqueros",
  "los lances",
];

async function main() {
  mkdirSync("scripts/tmp", { recursive: true });

  const useCache = process.argv.includes("--use-cache");

  let raw;
  if (useCache && existsSync(CACHE_PATH)) {
    console.log("Usando caché local:", CACHE_PATH);
    raw = JSON.parse(readFileSync(CACHE_PATH, "utf8"));
  } else {
    raw = await fetchOverpass(BEACH_QUERY, 100);
    writeFileSync(CACHE_PATH, JSON.stringify(raw));
  }

  let placesRaw;
  if (useCache && existsSync(PLACES_CACHE_PATH)) {
    console.log("Usando caché local:", PLACES_CACHE_PATH);
    placesRaw = JSON.parse(readFileSync(PLACES_CACHE_PATH, "utf8"));
  } else {
    placesRaw = await fetchOverpass(PLACES_QUERY, 100);
    writeFileSync(PLACES_CACHE_PATH, JSON.stringify(placesRaw));
  }

  const places = placesRaw.elements
    .filter((el) => el.tags?.name && el.lat != null)
    .map((el) => ({ name: el.tags.name, lat: el.lat, lon: el.lon }));

  function nearestPlace(lat, lon, maxKm = 12) {
    let best = null;
    let bestDist = Infinity;
    for (const place of places) {
      const dist = haversineKm(lat, lon, place.lat, place.lon);
      if (dist < bestDist) {
        bestDist = dist;
        best = place;
      }
    }
    return best && bestDist <= maxKm ? best.name : null;
  }

  // Provincia real (código INE oficial, no heurística de distancia) para
  // cada municipio que tenga el tag ref:ine. Se usa como conjunto de ~950
  // puntos de referencia para asignar provincia/CCAA a cada playa por el
  // municipio conocido más cercano — mucho más preciso que la distancia a
  // una única capital de provincia (ver provinces.mjs para el caso límite
  // de Ceuta/Melilla, que aquí ya no hace falta como parche porque Tarifa,
  // por ejemplo, es en sí misma un punto de referencia con su provincia
  // real (Cádiz) tomada de su código INE).
  const provinceAnchors = placesRaw.elements
    .map((el) => {
      const prov = provinceFromIne(el.tags?.["ref:ine"]);
      if (!prov || el.lat == null) return null;
      return { name: el.tags.name, lat: el.lat, lon: el.lon, province: prov.name, region: prov.region };
    })
    .filter(Boolean);

  console.log(`${provinceAnchors.length}/${placesRaw.elements.length} municipios con provincia oficial (ref:ine)`);

  function nearestProvinceAnchor(lat, lon, maxKm = 60) {
    let best = null;
    let bestDist = Infinity;
    for (const anchor of provinceAnchors) {
      const dist = haversineKm(lat, lon, anchor.lat, anchor.lon);
      if (dist < bestDist) {
        bestDist = dist;
        best = anchor;
      }
    }
    if (best && bestDist <= maxKm) return { name: best.province, region: best.region };
    return nearestProvince(lat, lon); // red de seguridad si no hay ancla cerca
  }

  const points = raw.elements
    .map((el) => {
      const lat = el.type === "node" ? el.lat : el.center?.lat;
      const lon = el.type === "node" ? el.lon : el.center?.lon;
      const name = el.tags?.name;
      if (lat == null || lon == null || !name) return null;
      return { name: name.trim(), lat, lon };
    })
    .filter(Boolean);

  // Deduplicar: mismo nombre normalizado a menos de 400m -> un solo punto.
  const deduped = [];
  for (const p of points) {
    const dup = deduped.find(
      (d) => d.name.toLowerCase() === p.name.toLowerCase() && haversineKm(d.lat, d.lon, p.lat, p.lon) < 0.4
    );
    if (!dup) deduped.push(p);
  }

  const slugCounts = new Map();
  const beaches = deduped.map((p) => {
    const province = nearestProvinceAnchor(p.lat, p.lon);
    const municipality = nearestPlace(p.lat, p.lon);
    let slug = slugify(`${p.name}-${municipality ?? province.name}`);
    const count = slugCounts.get(slug) ?? 0;
    slugCounts.set(slug, count + 1);
    if (count > 0) slug = `${slug}-${count + 1}`;

    const nameLower = p.name.toLowerCase();
    const popular = POPULAR_NAME_HINTS.some((hint) => nameLower.includes(hint));

    return {
      slug,
      name: p.name,
      municipality,
      province: province.name,
      region: province.region,
      lat: Math.round(p.lat * 10000) / 10000,
      lon: Math.round(p.lon * 10000) / 10000,
      popular,
    };
  });

  beaches.sort((a, b) => a.region.localeCompare(b.region) || a.name.localeCompare(b.name));

  mkdirSync("src/data", { recursive: true });
  writeFileSync(OUT_PATH, JSON.stringify(beaches, null, 0));

  // Versión ligera (sin provincia/región/municipio) servida como archivo
  // estático público — el mapa la usa para pintar TODAS las playas como
  // puntos seleccionables de golpe, sin pedir a ningún servidor calcular la
  // puntuación de las 3.600 a la vez (eso solo se hace para lo que está en
  // pantalla, ver /api/map-scores). Al ser un archivo estático en /public,
  // Vercel lo sirve por CDN sin gastar ninguna invocación de función.
  const lite = beaches.map((b) => ({ slug: b.slug, name: b.name, lat: b.lat, lon: b.lon, popular: b.popular }));
  mkdirSync("public", { recursive: true });
  writeFileSync("public/beaches-lite.json", JSON.stringify(lite, null, 0));

  const regions = new Set(beaches.map((b) => b.region));
  console.log(`\n${beaches.length} playas generadas en ${OUT_PATH}`);
  console.log(`${regions.size} comunidades/ciudades autónomas: ${[...regions].join(", ")}`);
  console.log(`${beaches.filter((b) => b.popular).length} marcadas como destacadas`);
  console.log(`Versión ligera para el mapa: public/beaches-lite.json`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
