import type { ConditionSnapshot, TideInfo } from "@/lib/types";
import { compassDirection, namedWind, weatherCodeLabel } from "@/lib/weatherFormat";
import { formatHourLabel } from "@/lib/time";

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between py-1.5 border-b border-border/50 last:border-0">
      <span className="text-xs text-muted">{label}</span>
      <span className="text-sm font-medium tabular-nums text-right">{value}</span>
    </div>
  );
}

/**
 * Todos los parámetros que ya obtenemos de Open-Meteo pero que la cabecera
 * (ConditionsGrid) no muestra por simplicidad para quien no sabe leerlos —
 * aquí sí, para quien ya entiende de mar y quiere el dato exacto, no solo el
 * score. Nada de esto se inventa: son campos reales que ya llegan en el
 * snapshot (ver lib/types.ts ConditionSnapshot) y hasta ahora solo se usaban
 * internamente para calcular la puntuación.
 */
export function TechnicalDetails({ snapshot, tide }: { snapshot: ConditionSnapshot; tide?: TideInfo | null }) {
  const windDir = compassDirection(snapshot.windDirectionDeg);
  const waveDir = compassDirection(snapshot.waveDirectionDeg);
  const windName = namedWind(snapshot.windDirectionDeg);

  return (
    <div className="border-t-2 border-border pt-4">
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-sm font-semibold text-muted uppercase tracking-wide">Datos técnicos completos</h3>
        <span className="text-[10px] text-muted uppercase tracking-wide">Open-Meteo</span>
      </div>
      <p className="text-xs text-muted mb-2">Para quien ya sabe leer estos parámetros.</p>

      <div>
        <Row
          label="Viento"
          value={`${Math.round(snapshot.windSpeedKmh)} km/h${windDir ? ` · ${windDir} (${Math.round(snapshot.windDirectionDeg!)}º)` : ""}${windName ? ` · ${windName}` : ""}`}
        />
        <Row
          label="Oleaje"
          value={`${snapshot.waveHeightM.toFixed(1)} m${waveDir ? ` · ${waveDir} (${Math.round(snapshot.waveDirectionDeg!)}º)` : ""}`}
        />
        <Row label="Periodo de ola (combinado)" value={`${snapshot.wavePeriodS.toFixed(1)} s`} />
        {snapshot.swellWaveHeightM != null && (
          <Row label="Mar de fondo (swell)" value={`${snapshot.swellWaveHeightM.toFixed(1)} m`} />
        )}
        {snapshot.swellWavePeriodS != null && (
          <Row label="Periodo del swell" value={`${snapshot.swellWavePeriodS.toFixed(1)} s`} />
        )}
        {snapshot.windWaveHeightM != null && (
          <Row label="Mar de viento (chop)" value={`${snapshot.windWaveHeightM.toFixed(1)} m`} />
        )}
        <Row label="Temp. del agua" value={`${snapshot.waterTempC.toFixed(1)} ºC`} />
        <Row label="Temp. ambiente" value={`${snapshot.airTempC.toFixed(1)} ºC`} />
        <Row
          label="Precipitación"
          value={`${Math.round(snapshot.precipitationProbabilityPct)}% prob. · ${snapshot.precipitationMm.toFixed(1)} mm`}
        />
        <Row label="Cielo" value={weatherCodeLabel(snapshot.weatherCode)} />
        <Row label="Tormenta eléctrica" value={snapshot.isThunderstorm ? "Sí" : "No"} />
        {snapshot.visibilityM != null && (
          <Row label="Visibilidad atmosférica" value={`${(snapshot.visibilityM / 1000).toFixed(1)} km`} />
        )}
        {tide?.available ? (
          <div className="py-1.5">
            <div className="flex items-baseline justify-between">
              <span className="text-xs text-muted">
                Marea (estación {tide.stationName}, a {tide.distanceKm} km)
              </span>
            </div>
            <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1">
              {tide.events.map((e, i) => (
                <span key={i} className="text-sm font-medium tabular-nums">
                  {e.type === "pleamar" ? "▲" : "▼"} {formatHourLabel(e.time)} ({e.heightM.toFixed(1)} m)
                </span>
              ))}
            </div>
          </div>
        ) : (
          <Row label="Marea" value={tide?.reason ?? "No disponible en esta zona"} />
        )}
      </div>

      {tide?.available && (
        <p className="text-[11px] text-muted mt-2 leading-relaxed">
          Marea calculada a partir de constituyentes armónicos reales de la estación más cercana con licencia de
          uso comercial ({tide.source.name}) — no de la playa exacta. Verificado contra la predicción oficial de
          Puertos del Estado: coincide con un margen de 1-5 minutos. Ver README del proyecto.
        </p>
      )}

      <p className="text-[11px] text-muted mt-3 leading-relaxed">
        Datos de modelo (no medidos en el sitio). Verificado contra boyas reales de
        Puertos del Estado: en costa abierta el margen de error es de pocos puntos
        porcentuales, pero en bahías, rías o puertos muy resguardados el viento del
        modelo puede desviarse bastante más del real — la resolución del modelo no
        capta bien los efectos de viento muy locales de esa geografía. Ver README del
        proyecto para el detalle de la comparación.
      </p>
    </div>
  );
}
