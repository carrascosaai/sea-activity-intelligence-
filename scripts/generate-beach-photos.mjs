// Genera src/data/beachPhotos.json: una foto real por playa (de las que
// tienen una), sacada de Wikimedia Commons — nunca una foto de stock
// genérica ni generada por IA. Se ejecuta en build-time / manualmente, no
// en cada request (misma razón que el resto de scripts/generate-*.mjs:
// no depender de una API externa para servir tráfico real, y no arriesgarse
// a que una llamada lenta/caída tumbe la ficha de resultado).
//
// LO IMPORTANTE — por qué no es "coger la foto más cercana y ya está":
// buscar por proximidad geográfica sin más devuelve basura real (probado
// en directo): junto a fotos genuinas de una playa aparecen fotos de
// eventos, edificios o artículos históricos que solo están "cerca" en el
// mapa. Por eso se filtra por el NOMBRE del archivo — si no menciona la
// playa, el municipio, o una palabra genérica de playa en varios idiomas,
// se descarta. Mejor no tener foto que tener la equivocada.
//
// Licencia: solo se aceptan licencias de reutilización real (CC0, CC-BY,
// CC-BY-SA, dominio público) — se guarda el autor y el enlace a la fuente
// porque son obligatorios para casi todas ellas, nunca se quita la
// atribución.
//
// Uso: node scripts/generate-beach-photos.mjs
import { writeFileSync } from "node:fs";
import beaches from "../src/data/beaches.json" with { type: "json" };

const OUT_PATH = "src/data/beachPhotos.json";
const USER_AGENT = "SeaActivityIntelligence/1.0 (https://sea-activity-intelligence-deploy.vercel.app)";
const SEARCH_RADIUS_M = 400;
const ALLOWED_LICENSE_PREFIXES = ["cc0", "cc by", "public domain", "pd"];

// Por defecto, solo las playas destacadas — ampliar a más playas es tan
// simple como cambiar esta lista, pero cada una cuesta 2 peticiones a
// Commons y hay que revisar que el filtro de relevancia siga sin colarse
// fotos equivocadas a esa escala.
const popular = beaches.filter((b) => b.popular);
const TARGET_LOCATIONS = popular.length > 0 ? popular : beaches.slice(0, 20);

function normalize(str) {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

// "platja" (catalán) faltaba aquí — bug real encontrado en desarrollo: sin
// ella, "Platja del Somorrostro" colaba como coincidencia CUALQUIER foto
// catalana que dijera "platja" en el título (p. ej. una de fuegos
// artificiales en la Barceloneta, a la que ni siquiera correspondía).
const GENERIC_BEACH_WORDS = ["playa", "praia", "platja", "beach", "bahia", "plage", "strand", "cala", "cove", "hondartza"];

// Comprobación real hecha durante el desarrollo: "platja de la Barceloneta"
// coincidía por error como si fuera Barcelona porque .includes() encuentra
// "barcelona" como subcadena dentro de "barceloneta" — dos sitios reales
// distintos, uno de ellos con el nombre del otro dentro. Por eso se compara
// por PALABRA completa (Set de tokens), no por subcadena.
function looksRelevant(title, location) {
  const titleWords = new Set(normalize(title).split(" "));
  const nameTokens = normalize(location.name)
    .split(" ")
    .filter((w) => w.length > 3 && !GENERIC_BEACH_WORDS.includes(w));
  const muniTokens = location.municipality
    ? normalize(location.municipality)
        .split(" ")
        .filter((w) => w.length > 3)
    : [];
  const hasGeneric = GENERIC_BEACH_WORDS.some((w) => titleWords.has(w));
  const hasName = nameTokens.some((w) => titleWords.has(w));
  const hasMuni = muniTokens.some((w) => titleWords.has(w));
  // Exige nombre O (genérico + municipio) — un archivo solo "genérico" sin
  // ninguna otra pista (p. ej. "Beach (12345).jpg") no basta.
  return hasName || (hasGeneric && hasMuni);
}

function stripHtml(html) {
  if (!html) return null;
  return html
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .trim();
}

async function fetchJson(url) {
  const res = await fetch(url, { headers: { "User-Agent": USER_AGENT } });
  if (!res.ok) throw new Error(`HTTP ${res.status} en ${url}`);
  return res.json();
}

async function findPhotoForLocation(location) {
  const geoUrl =
    `https://commons.wikimedia.org/w/api.php?action=query&list=geosearch` +
    `&gscoord=${location.lat}|${location.lon}&gsradius=${SEARCH_RADIUS_M}&gsnamespace=6&gslimit=20&format=json`;
  const geoData = await fetchJson(geoUrl);
  const candidates = (geoData.query?.geosearch ?? []).filter((g) => looksRelevant(g.title, location));
  if (candidates.length === 0) return null;

  candidates.sort((a, b) => a.dist - b.dist);
  const best = candidates[0];

  const infoUrl =
    `https://commons.wikimedia.org/w/api.php?action=query&titles=${encodeURIComponent(best.title)}` +
    `&prop=imageinfo&iiprop=url|extmetadata|size&iiurlwidth=1280&format=json`;
  const infoData = await fetchJson(infoUrl);
  const page = Object.values(infoData.query?.pages ?? {})[0];
  const info = page?.imageinfo?.[0];
  if (!info) return null;

  const licenseShort = info.extmetadata?.LicenseShortName?.value ?? "";
  const licenseLower = licenseShort.toLowerCase();
  const licenseOk = ALLOWED_LICENSE_PREFIXES.some((p) => licenseLower.startsWith(p));
  if (!licenseOk) return null;

  return {
    thumbUrl: info.thumburl ?? info.url,
    width: info.thumbwidth ?? info.width,
    height: info.thumbheight ?? info.height,
    author: stripHtml(info.extmetadata?.Artist?.value) || "Autor desconocido",
    license: licenseShort,
    licenseUrl: info.extmetadata?.LicenseUrl?.value ?? null,
    sourceUrl: `https://commons.wikimedia.org/wiki/${encodeURIComponent(best.title)}`,
    distanceM: Math.round(best.dist),
  };
}

async function main() {
  const results = {};
  let found = 0;

  for (const location of TARGET_LOCATIONS) {
    try {
      const photo = await findPhotoForLocation(location);
      if (photo) {
        results[location.slug] = photo;
        found++;
        console.log(`OK    ${location.name} — ${photo.sourceUrl} (${photo.distanceM}m, ${photo.license})`);
      } else {
        console.log(`sin foto  ${location.name}`);
      }
    } catch (err) {
      console.log(`error ${location.name}: ${err.message}`);
    }
    // Cortesía con la API pública de Commons — sin clave, sin cuota formal,
    // pero no hay motivo para machacarla.
    await new Promise((r) => setTimeout(r, 250));
  }

  writeFileSync(OUT_PATH, JSON.stringify(results, null, 2) + "\n");
  console.log(`\n${found}/${TARGET_LOCATIONS.length} playas con foto real. Escrito en ${OUT_PATH}`);
}

main();
