import { BAND_BAR_CLASS } from "@/lib/bandLabels";
import type { ScoreBand } from "@/lib/types";

// Antes se usaba el emoji de círculo de color (🟢🟡🟠🔴) como indicador de
// banda — se renderiza de forma distinta (y a veces borrosa) según el
// sistema operativo. Un punto real en CSS es nítido en cualquier pantalla
// y es exactamente el mismo color que usa el resto de la app (mapa, barras).
export function BandDot({ band, className = "" }: { band: ScoreBand; className?: string }) {
  return (
    <span
      aria-hidden
      className={`inline-block w-2.5 h-2.5 rounded-full shrink-0 ${BAND_BAR_CLASS[band]} ${className}`}
    />
  );
}
