"use client";

import { useState } from "react";
import { track } from "@/lib/analytics";

export interface NearbyShopView {
  slug: string;
  name: string;
  distanceKm: number;
  phone: string | null;
  website: string | null;
  openingHours: string | null;
  mapsUrl: string;
  ratingAvg: number | null;
  ratingCount: number;
}

function ShopRatingStars({ slug, initialAvg, initialCount }: { slug: string; initialAvg: number | null; initialCount: number }) {
  const [avg, setAvg] = useState(initialAvg);
  const [count, setCount] = useState(initialCount);
  const [voted, setVoted] = useState(false);
  const [hover, setHover] = useState(0);

  function vote(stars: number) {
    if (voted) return;
    setVoted(true);
    const newCount = count + 1;
    const newAvg = Math.round((((avg ?? 0) * count + stars) / newCount) * 10) / 10;
    setAvg(newAvg);
    setCount(newCount);
    track("shop_rated", { shop: slug, rating: stars });
    fetch("/api/shop-rating", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ shopSlug: slug, rating: stars }),
    }).catch(() => {});
  }

  if (voted) {
    return <p className="text-xs text-accent">Gracias por valorarla — ayuda a otros usuarios.</p>;
  }

  return (
    <div className="flex items-center gap-2">
      <div className="flex" onMouseLeave={() => setHover(0)}>
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => vote(n)}
            onMouseEnter={() => setHover(n)}
            aria-label={`Valorar con ${n} estrella${n === 1 ? "" : "s"}`}
            className="text-base leading-none px-0.5 cursor-pointer"
          >
            {(hover || 0) >= n ? "⭐" : "☆"}
          </button>
        ))}
      </div>
      <span className="text-[11px] text-muted">
        {count > 0 ? `${avg} · ${count} valoración${count === 1 ? "" : "es"} de usuarios` : "Sé el primero en valorarla"}
      </span>
    </div>
  );
}

export function NearbyShops({ shops, activityName }: { shops: NearbyShopView[]; activityName: string }) {
  if (shops.length === 0) {
    return (
      <div className="rounded-2xl bg-surface border border-border p-4">
        <h3 className="text-sm font-semibold text-muted uppercase tracking-wide mb-1">Tiendas cerca</h3>
        <p className="text-sm text-muted">
          No encontramos tiendas de {activityName.toLowerCase()} registradas cerca de esta playa en OpenStreetMap.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-surface border border-border p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-muted uppercase tracking-wide">Tiendas cerca</h3>
        <span className="text-[10px] text-muted uppercase tracking-wide">OpenStreetMap</span>
      </div>
      <div className="flex flex-col gap-3">
        {shops.map((shop) => (
          <div key={shop.slug} className="rounded-xl border border-border/70 bg-surface-2 p-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-sm font-semibold">{shop.name}</p>
                <p className="text-xs text-muted mt-0.5">
                  {shop.distanceKm < 1 ? `${Math.round(shop.distanceKm * 1000)} m` : `${shop.distanceKm.toFixed(1)} km`}
                  {shop.openingHours && ` · ${shop.openingHours}`}
                </p>
              </div>
              <a
                href={shop.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => track("shop_maps_clicked", { shop: shop.slug })}
                className="shrink-0 text-[11px] text-accent hover:underline whitespace-nowrap"
              >
                ⭐ Ver en Maps ↗
              </a>
            </div>

            <div className="flex items-center gap-3 mt-2 text-xs">
              {shop.phone && (
                <a href={`tel:${shop.phone.replace(/\s+/g, "")}`} className="text-accent hover:underline">
                  📞 Llamar
                </a>
              )}
              {shop.website && (
                <a href={shop.website} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">
                  🌐 Web
                </a>
              )}
            </div>

            <div className="mt-2.5 pt-2.5 border-t border-border/60">
              <ShopRatingStars slug={shop.slug} initialAvg={shop.ratingAvg} initialCount={shop.ratingCount} />
            </div>
          </div>
        ))}
      </div>
      <p className="text-[11px] text-muted mt-3 leading-relaxed">
        Ubicaciones de OpenStreetMap, pueden estar desactualizadas. Las estrellas con ⭐ enlazan a las valoraciones
        reales de Google Maps; las de abajo son de la comunidad de esta web.
      </p>
    </div>
  );
}
