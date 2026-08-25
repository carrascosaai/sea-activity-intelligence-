"use client";

import dynamic from "next/dynamic";
import type { MapPoint } from "./MapClient";
import type { ActivityId, SkillLevel } from "@/lib/types";

const MapClient = dynamic(() => import("./MapClient").then((m) => m.MapClient), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 flex items-center justify-center text-sm text-muted">Cargando mapa...</div>
  ),
});

export function MapClientLoader(props: { initialPoints: MapPoint[]; activity: ActivityId; level: SkillLevel }) {
  return <MapClient {...props} />;
}
