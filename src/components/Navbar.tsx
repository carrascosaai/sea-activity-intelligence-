"use client";

import Link from "next/link";
import { MapPin, Trophy } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { useIsWidgetRoute } from "@/lib/useIsWidgetRoute";

export function Navbar() {
  if (useIsWidgetRoute()) return null;
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="max-w-5xl mx-auto px-5 py-3.5 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2 group shrink-0">
          <Logo size={26} />
          <span className="hidden sm:inline font-display font-semibold tracking-tight text-[16px] group-hover:text-accent transition-colors">
            Sea Activity Intelligence
          </span>
        </Link>
        <nav className="flex items-center gap-1.5 sm:gap-2 text-sm">
          <Link
            href="/cerca-de-mi"
            className="rounded-full px-3 py-1.5 bg-accent/15 text-accent font-medium hover:bg-accent/25 transition-colors whitespace-nowrap inline-flex items-center gap-1.5"
          >
            <MapPin className="w-4 h-4" strokeWidth={2.25} /> Cerca de mí
          </Link>
          <Link
            href="/hoy"
            className="rounded-full px-3 py-1.5 text-muted hover:text-foreground hover:bg-surface transition-colors whitespace-nowrap hidden sm:inline-block"
          >
            ¿Qué hacer hoy?
          </Link>
          <Link
            href="/mapa"
            className="rounded-full px-3 py-1.5 text-muted hover:text-foreground hover:bg-surface transition-colors whitespace-nowrap"
          >
            Mapa
          </Link>
          <Link
            href="/mejores-sitios"
            className="hidden sm:inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-muted hover:text-foreground hover:bg-surface transition-colors whitespace-nowrap"
          >
            <Trophy className="w-4 h-4" strokeWidth={2.25} /> Mejores sitios
          </Link>
        </nav>
      </div>
    </header>
  );
}
