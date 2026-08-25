"use client";

import { useEffect, useRef, useState } from "react";
import { Chip } from "@/components/ui/Chip";
import type { Location } from "@/lib/types";

function SkeletonRow() {
  return (
    <div className="rounded-2xl border border-border bg-surface px-5 py-4 animate-pulse">
      <div className="h-3.5 w-2/5 rounded bg-surface-2" />
      <div className="h-2.5 w-1/4 rounded bg-surface-2 mt-2" />
    </div>
  );
}

export function LocationSearch({
  onSelect,
  selectedSlug,
}: {
  onSelect: (location: Location) => void;
  selectedSlug?: string | null;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Location[]>([]);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const requestIdRef = useRef(0);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const id = ++requestIdRef.current;
      setLoading(true);
      fetch(`/api/locations/search?q=${encodeURIComponent(query)}&limit=25`)
        .then((r) => r.json())
        .then((data) => {
          if (id === requestIdRef.current) {
            setResults(data.results ?? []);
            setLoading(false);
          }
        })
        .catch(() => setLoading(false));
    }, 200);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  const showSkeleton = loading && results.length === 0;

  return (
    <div>
      <label htmlFor="location-search-input" className="sr-only">
        Buscar playa, pueblo o provincia
      </label>
      <input
        id="location-search-input"
        type="text"
        autoFocus
        placeholder="Busca tu playa, pueblo o provincia..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full rounded-xl border border-border bg-surface px-4 py-3 mb-3 text-sm outline-none focus:border-accent"
      />
      {!query && <p className="text-xs text-muted mb-2 uppercase tracking-wide">Playas destacadas</p>}
      <div
        role="status"
        aria-live="polite"
        className={`grid grid-cols-1 gap-2 transition-opacity ${loading && results.length > 0 ? "opacity-50" : "opacity-100"}`}
      >
        {showSkeleton
          ? Array.from({ length: 4 }).map((_, i) => <SkeletonRow key={i} />)
          : results.map((loc) => (
              <Chip key={loc.slug} selected={selectedSlug === loc.slug} onClick={() => onSelect(loc)}>
                <span className="font-medium">{loc.name}</span>
                <span className="text-muted text-xs ml-2">
                  {loc.municipality && loc.municipality !== loc.name ? `${loc.municipality} · ` : ""}
                  {loc.province}
                </span>
              </Chip>
            ))}
        {!loading && results.length === 0 && (
          <p className="text-sm text-muted py-4 text-center">Sin resultados. Prueba con otro nombre.</p>
        )}
      </div>
    </div>
  );
}
