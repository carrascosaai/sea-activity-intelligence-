import type { ConditionSnapshot } from "@/lib/types";
import { AirTempIcon, PeriodIcon, RainIcon, WaterTempIcon, WaveIcon, WindIcon } from "@/components/ui/WeatherIcons";
import { namedWind } from "@/lib/weatherFormat";

export function ConditionsGrid({ snapshot }: { snapshot: ConditionSnapshot }) {
  const wind = namedWind(snapshot.windDirectionDeg);
  const items = [
    {
      Icon: WindIcon,
      label: "Viento",
      value: `${Math.round(snapshot.windSpeedKmh)} km/h${wind ? ` · ${wind}` : ""}`,
    },
    { Icon: WaveIcon, label: "Oleaje", value: `${snapshot.waveHeightM.toFixed(1)} m` },
    { Icon: PeriodIcon, label: "Periodo", value: `${Math.round(snapshot.wavePeriodS)} s` },
    { Icon: WaterTempIcon, label: "Agua", value: `${Math.round(snapshot.waterTempC)} ºC` },
    { Icon: AirTempIcon, label: "Ambiente", value: `${Math.round(snapshot.airTempC)} ºC` },
    { Icon: RainIcon, label: "Lluvia", value: `${Math.round(snapshot.precipitationProbabilityPct)}%` },
  ];

  return (
    <div className="grid grid-cols-3 gap-3">
      {items.map((item) => (
        <div key={item.label} className="rounded-xl bg-surface-2 border border-border px-3 py-3 text-center">
          <item.Icon className="w-5 h-5 mx-auto text-accent" />
          <div className="text-[11px] text-muted mt-1.5">{item.label}</div>
          <div className="text-sm font-semibold mt-0.5 tabular-nums">{item.value}</div>
        </div>
      ))}
    </div>
  );
}
