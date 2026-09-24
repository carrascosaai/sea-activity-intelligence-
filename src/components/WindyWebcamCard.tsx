import type { WindyWebcam } from "@/lib/providers/windyWebcams";

function freshnessLabel(iso: string | null): { text: string; stale: boolean } | null {
  if (!iso) return null;
  const mins = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (!Number.isFinite(mins) || mins < 0) return null;
  if (mins < 2) return { text: "Actualizada ahora mismo", stale: false };
  if (mins < 90) return { text: `Actualizada hace ${mins} min`, stale: false };
  const hours = Math.round(mins / 60);
  return { text: `Última imagen hace ${hours} h — puede no reflejar el momento actual`, stale: true };
}

/**
 * Imagen reciente de la webcam de Windy más cercana. No es una cámara
 * nuestra ni necesariamente "la" cámara de esta playa exacta: por eso se
 * muestra siempre a qué distancia está y quién la emite. La atribución a
 * Windy y el enlace de la imagen a su página son obligatorios en su plan
 * gratuito (ver lib/providers/windyWebcams.ts).
 */
export function WindyWebcamCard({ cam }: { cam: WindyWebcam }) {
  const fresh = freshnessLabel(cam.lastUpdatedOn);
  const dist = cam.distanceKm < 0.1 ? "junto a la playa" : `a ${cam.distanceKm.toString().replace(".", ",")} km de la playa`;

  return (
    <div className="rounded-xl bg-surface border border-border p-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-muted uppercase tracking-wide">Cámara cercana</h3>
        <span className="text-[10px] text-muted uppercase tracking-wide">Imagen reciente</span>
      </div>

      <a
        href={cam.pageUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="block relative rounded-xl overflow-hidden bg-black mx-auto"
        style={{ maxWidth: cam.width }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- URL con token de Windy (caduca a los 10 min), no apta para el optimizador */}
        <img src={cam.imageUrl} alt={`Imagen reciente de la webcam: ${cam.title}`} width={cam.width} height={cam.height} className="w-full h-auto block" />
        {fresh && (
          <span
            className={`absolute left-2 bottom-2 text-[10px] font-medium px-2 py-0.5 rounded-full backdrop-blur ${
              fresh.stale ? "bg-score-orange/80 text-black" : "bg-black/65 text-white"
            }`}
          >
            {fresh.text}
          </span>
        )}
      </a>

      <p className="text-xs text-muted mt-2.5 leading-relaxed">
        <span className="text-foreground/90">{cam.title}</span> — {dist}. Compara lo que ves con los datos de arriba: es la
        forma más honesta de comprobar si se ajustan a la realidad ahora mismo. No es una cámara nuestra y puede no
        enfocar exactamente esta playa.
      </p>
      <p className="text-[10px] text-muted mt-1.5">
        <a href="https://www.windy.com/" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">
          Webcams provided by windy.com
        </a>{" "}
        ·{" "}
        <a href="https://www.windy.com/webcams/add" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">
          add a webcam
        </a>
      </p>
    </div>
  );
}
