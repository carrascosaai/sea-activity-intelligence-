// Comprueba que cada cámara de YouTube de src/lib/webcams.ts sigue en directo
// y permite insertarse. Una cámara puede morir o desactivar la inserción en
// cualquier momento (pasó con 4 de las 7 originales), y el reproductor solo
// muestra "vídeo no disponible" sin avisarnos. Uso:
//   npm run verify:webcams
// Sale con código 1 si alguna falla (útil en un cron / GitHub Action).
import fs from "node:fs";

const src = fs.readFileSync(new URL("../src/lib/webcams.ts", import.meta.url), "utf8");
const entries = [...src.matchAll(/"([a-z0-9-]+)":\s*\{\s*youtubeVideoId:\s*"([^"]+)",\s*source:\s*"([^"]+)"/g)].map((m) => ({
  slug: m[1],
  id: m[2],
  source: m[3],
}));

const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppData/1.0 Chrome/124 Safari/537.36";
let bad = 0;
for (const e of entries) {
  let verdict;
  try {
    const r = await fetch(`https://www.youtube.com/watch?v=${e.id}`, {
      headers: { "User-Agent": UA, "Accept-Language": "es-ES,es;q=0.9", Cookie: "CONSENT=YES+1; SOCS=CAI" },
      signal: AbortSignal.timeout(15000),
    });
    const h = await r.text();
    const live = /"isLiveNow":true/.test(h);
    const embeddable = /"playableInEmbed":true/.test(h);
    const status = (h.match(/"playabilityStatus":\{"status":"([A-Z_]+)"/) || [])[1];
    if (live && embeddable && status === "OK") verdict = "OK";
    else verdict = `ROTA — ${!live ? "no está en directo" : ""}${!live && !embeddable ? "; " : ""}${!embeddable ? "no permite insertarse" : ""} (estado: ${status ?? "?"})`;
  } catch (err) {
    verdict = `NO SE PUDO COMPROBAR (${err.message})`;
  }
  if (verdict !== "OK") bad++;
  console.log(`${verdict === "OK" ? "✅" : "❌"} ${e.slug.padEnd(48)} ${e.id}  ${verdict}`);
}
console.log(`\n${entries.length - bad}/${entries.length} cámaras correctas`);
process.exit(bad ? 1 : 0);
