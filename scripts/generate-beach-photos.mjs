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
// Uso: node scripts/generate-beach-photos.mjs [--limit=N]
//   --limit=N   corta tras encontrar/procesar N playas nuevas (para probar
//               un lote pequeño antes de lanzar las ~3.500 completas).
import { writeFileSync, readFileSync, existsSync } from "node:fs";
import beaches from "../src/data/beaches.json" with { type: "json" };

const OUT_PATH = "src/data/beachPhotos.json";
const USER_AGENT = "SeaActivityIntelligence/1.0 (https://sea-activity-intelligence-deploy.vercel.app)";
const SEARCH_RADIUS_M = 400;
const ALLOWED_LICENSE_PREFIXES = ["cc0", "cc by", "public domain", "pd"];

// Mismas 22 provincias sin costa real que lib/locations.ts — no tiene
// sentido gastar peticiones a Commons en playas fluviales/de pantano que
// de todas formas nunca aparecen en el buscador de la web.
const LANDLOCKED_PROVINCES = new Set([
  "Albacete", "Badajoz", "Burgos", "Cuenca", "Cáceres", "Córdoba", "Guadalajara",
  "La Rioja", "León", "Lleida", "Madrid", "Navarra", "Ourense", "Palencia",
  "Salamanca", "Segovia", "Teruel", "Toledo", "Valladolid", "Zamora", "Zaragoza", "Ávila",
]);

// Todas las playas reales de España, no solo las destacadas — reanudable:
// si ya hay un resultado (con o sin foto) para una playa de una tanda
// anterior, no se vuelve a consultar Commons por ella.
const ALL_TARGETS = beaches.filter((b) => !LANDLOCKED_PROVINCES.has(b.province));

const limitArg = process.argv.find((a) => a.startsWith("--limit="));
const LIMIT = limitArg ? parseInt(limitArg.split("=")[1], 10) : Infinity;

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
//
// Solo se exige el NOMBRE PROPIO de la playa/cala en el título — nada de
// "genérico + municipio" como alternativa. Se probó esa regla y falla real
// a esta escala: un municipio con varias calas con nombre propio (Nerja,
// Almería...) hace que la foto de UNA cala pase el filtro para CUALQUIER
// OTRA cala del mismo municipio, solo por compartir "cala" + el municipio
// — comprobado en directo con "Cala de las Doncellas" emparejando con una
// foto de "Cala del Cañuelo" (misma zona, cala distinta de verdad). Mejor
// menos playas con foto que fotos de la cala de al lado.
function looksRelevant(title, location) {
  const titleWords = new Set(normalize(title).split(" "));
  const nameTokens = normalize(location.name)
    .split(" ")
    .filter((w) => w.length > 3 && !GENERIC_BEACH_WORDS.includes(w));
  return nameTokens.some((w) => titleWords.has(w));
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

const PROGRESS_PATH = "scripts/tmp/beach_photos_processed.json";

function loadJsonSafe(path, fallback) {
  if (!existsSync(path)) return fallback;
  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch {
    return fallback;
  }
}

async function main() {
  const results = loadJsonSafe(OUT_PATH, {});
  const processed = new Set(loadJsonSafe(PROGRESS_PATH, []));
  const pending = ALL_TARGETS.filter((l) => !processed.has(l.slug));

  console.log(
    `${ALL_TARGETS.length} playas en total, ${processed.size} ya procesadas en tandas anteriores, ${pending.length} pendientes.`
  );

  let foundThisRun = 0;
  let processedThisRun = 0;
  const startedAt = Date.now();

  for (const location of pending) {
    if (processedThisRun >= LIMIT) break;
    try {
      const photo = await findPhotoForLocation(location);
      if (photo) {
        results[location.slug] = photo;
        foundThisRun++;
        console.log(`OK    ${location.name} (${location.province}) — ${photo.sourceUrl} (${photo.distanceM}m, ${photo.license})`);
      } else {
        console.log(`sin foto  ${location.name} (${location.province})`);
      }
    } catch (err) {
      console.log(`error ${location.name}: ${err.message}`);
      // No se marca como procesada si fue un error de red/API — se reintenta
      // en la siguiente tanda en vez de darla por "sin foto" para siempre.
      await new Promise((r) => setTimeout(r, 250));
      continue;
    }
    processed.add(location.slug);
    processedThisRun++;

    // Checkpoint cada 25 playas — una tanda de miles de peticiones puede
    // interrumpirse (red, límite de tiempo...) y no hay motivo para perder
    // el trabajo ya hecho.
    if (processedThisRun % 25 === 0) {
      writeFileSync(OUT_PATH, JSON.stringify(results, null, 2) + "\n");
      writeFileSync(PROGRESS_PATH, JSON.stringify([...processed]));
      const elapsedMin = (Date.now() - startedAt) / 60000;
      const rate = processedThisRun / elapsedMin;
      const remaining = pending.length - processedThisRun;
      const etaMin = rate > 0 ? Math.round(remaining / rate) : "?";
      console.log(
        `  [checkpoint] ${processedThisRun}/${pending.length} de esta tanda · ${foundThisRun} con foto · ETA ~${etaMin} min`
      );
    }

    // Cortesía con la API pública de Commons — sin clave, sin cuota formal,
    // pero no hay motivo para machacarla en un lote de miles de peticiones.
    await new Promise((r) => setTimeout(r, 180));
  }

  writeFileSync(OUT_PATH, JSON.stringify(results, null, 2) + "\n");
  writeFileSync(PROGRESS_PATH, JSON.stringify([...processed]));

  const totalFound = Object.keys(results).length;
  console.log(
    `\nTanda terminada: ${processedThisRun} playas procesadas, ${foundThisRun} con foto nueva.` +
      ` Total acumulado: ${totalFound}/${ALL_TARGETS.length} playas con foto real. Escrito en ${OUT_PATH}.`
  );
  if (pending.length - processedThisRun > 0) {
    console.log(`Quedan ${pending.length - processedThisRun} playas sin procesar — vuelve a correr el script para seguir.`);
  }
}

main();
