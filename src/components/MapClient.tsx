"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import Link from "next/link";
import { BAND_HEX, BAND_META } from "@/lib/bandLabels";
import { MapLegend } from "@/components/MapLegend";
import type { ActivityId, ScoreBand, SkillLevel } from "@/lib/types";

const GOOD_BANDS = new Set<ScoreBand>(["ideal", "buena"]);

function makeScoredIcon(band: ScoreBand) {
  return L.divIcon({
    className: "",
    html: `<div style="
      width:20px;height:20px;border-radius:9999px;
      background:${BAND_HEX[band]};
      border:3px solid rgba(255,255,255,0.85);
      box-shadow:0 0 0 3px rgba(0,0,0,0.25);
    "></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });
}

// Playas sin puntuar todavía (no está calcular la puntuación real de las
// 3.600 de golpe): un punto neutro, más pequeño, que indica "playa real,
// aún sin condiciones calculadas" — sigue siendo seleccionable.
const NEUTRAL_ICON = L.divIcon({
  className: "",
  html: `<div style="
    width:11px;height:11px;border-radius:9999px;
    background:rgba(133,160,182,0.55);
    border:2px solid rgba(234,243,250,0.7);
  "></div>`,
  iconSize: [11, 11],
  iconAnchor: [5, 5],
});

export interface MapPoint {
  slug: string;
  name: string;
  lat: number;
  lon: number;
  score: number;
  band: ScoreBand;
}

interface LitePoint {
  slug: string;
  name: string;
  lat: number;
  lon: number;
  popular: boolean;
}

// No se dispara en el montaje: justo tras montar, el contenedor de Leaflet
// puede no tener aún su tamaño real y map.getBounds() devuelve un punto
// degenerado (min===max). El primer pintado ya usa initialPoints (del
// servidor); solo se refresca por bbox cuando el usuario mueve el mapa de
// verdad.
function BoundsWatcher({ onBoundsChange }: { onBoundsChange: (b: L.LatLngBounds) => void }) {
  useMapEvents({
    moveend: (e) => onBoundsChange(e.target.getBounds()),
  });
  return null;
}

export function MapClient({
  initialPoints,
  activity,
  level,
}: {
  initialPoints: MapPoint[];
  activity: ActivityId;
  level: SkillLevel;
}) {
  // Todas las playas de España (~3.630), sin puntuación — se cargan una vez
  // como archivo estático (public/beaches-lite.json), no desde ningún
  // componente que las meta en el bundle de JS. Así el mapa siempre muestra
  // TODAS las playas y se pueden seleccionar, aunque su condición real solo
  // se calcule para las que están en pantalla.
  const [allPoints, setAllPoints] = useState<LitePoint[]>([]);

  // `initialPoints` solo cambia si el padre remonta este componente (ver
  // key={activity+level} en mapa/page.tsx) — así el estado local no necesita
  // re-sincronizarse con la prop en un efecto.
  const [scoredBySlug, setScoredBySlug] = useState<Record<string, MapPoint>>(() =>
    Object.fromEntries(initialPoints.map((p) => [p.slug, p]))
  );
  const [loading, setLoading] = useState(false);
  const [onlyGood, setOnlyGood] = useState(false);
  const requestIdRef = useRef(0);

  useEffect(() => {
    fetch("/beaches-lite.json")
      .then((r) => r.json())
      .then((data: LitePoint[]) => setAllPoints(data))
      .catch(() => {});
  }, []);

  const fetchForBounds = useCallback(
    (bounds: L.LatLngBounds) => {
      const id = ++requestIdRef.current;
      setLoading(true);
      const params = new URLSearchParams({
        minLat: String(bounds.getSouth()),
        maxLat: String(bounds.getNorth()),
        minLon: String(bounds.getWest()),
        maxLon: String(bounds.getEast()),
        activity,
        level,
      });
      fetch(`/api/map-scores?${params.toString()}`)
        .then((r) => r.json())
        .then((data: { points?: MapPoint[] }) => {
          if (id === requestIdRef.current && data.points) {
            setScoredBySlug((prev) => {
              const next = { ...prev };
              for (const p of data.points!) next[p.slug] = p;
              return next;
            });
          }
          setLoading(false);
        })
        .catch(() => setLoading(false));
    },
    [activity, level]
  );

  return (
    <div className="absolute inset-0">
      <button
        type="button"
        onClick={() => setOnlyGood((v) => !v)}
        className={`absolute top-3 left-3 z-[1000] rounded-full border px-3 py-1.5 text-xs font-medium shadow-lg cursor-pointer transition-colors ${
          onlyGood
            ? "bg-score-green/20 border-score-green/50 text-score-green"
            : "bg-surface border-border text-muted hover:text-foreground"
        }`}
      >
        {onlyGood ? "✓ Solo buenas condiciones" : "Solo buenas condiciones"}
      </button>
      {loading && (
        <div className="absolute top-3 right-3 z-[1000] rounded-full bg-surface border border-border px-3 py-1.5 text-xs text-muted shadow-lg">
          Calculando condiciones...
        </div>
      )}
      <MapLegend />
      <MapContainer
        center={[40.2, -3.7]}
        zoom={6}
        scrollWheelZoom={true}
        style={{ position: "absolute", inset: 0, background: "#0f1c2c" }}
      >
        <BoundsWatcher onBoundsChange={fetchForBounds} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          className="map-tiles-dark"
        />
        <MarkerClusterGroup chunkedLoading spiderfyOnMaxZoom disableClusteringAtZoom={15} maxClusterRadius={50}>
          {allPoints.map((loc) => {
            const scored = scoredBySlug[loc.slug];
            if (onlyGood && scored && !GOOD_BANDS.has(scored.band)) return null;
            return (
              <Marker
                key={loc.slug}
                position={[loc.lat, loc.lon]}
                icon={scored ? makeScoredIcon(scored.band) : NEUTRAL_ICON}
              >
                <Popup className="sai-popup" minWidth={160}>
                  <div className="font-sans">
                    <p className="font-semibold text-[14px] mb-1 text-foreground">{loc.name}</p>
                    {scored ? (
                      <p className="text-[13px] mb-2">
                        {BAND_META[scored.band].emoji} <span className="font-semibold">{scored.score}</span>/100
                      </p>
                    ) : (
                      <p className="text-[13px] mb-2 text-muted">Condiciones aún sin calcular</p>
                    )}
                    <Link
                      href={`/resultado?activity=${activity}&location=${loc.slug}&level=${level}&when=now`}
                      className="text-[13px] text-accent hover:underline font-medium"
                    >
                      Ver recomendación →
                    </Link>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MarkerClusterGroup>
      </MapContainer>
    </div>
  );
}
