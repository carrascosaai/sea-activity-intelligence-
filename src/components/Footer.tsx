import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-border/60 mt-auto">
      <div className="max-w-5xl mx-auto px-5 py-6 flex flex-col gap-3 text-xs text-muted">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
          <span className="flex items-center gap-1.5 font-medium text-foreground/70">
            <span>🌊</span> Sea Activity Intelligence
          </span>
          <Link href="/hoy" className="hover:text-foreground transition-colors">
            ¿Qué hacer hoy?
          </Link>
          <Link href="/mapa" className="hover:text-foreground transition-colors">
            Mapa
          </Link>
          <Link href="/mejores-sitios" className="hover:text-foreground transition-colors">
            Mejores sitios
          </Link>
          <Link href="/privacidad" className="hover:text-foreground transition-colors">
            Privacidad
          </Link>
        </div>
        <p className="leading-relaxed">
          Datos meteorológicos y de oleaje de{" "}
          <a href="https://open-meteo.com" target="_blank" rel="noopener noreferrer" className="hover:text-foreground underline decoration-border">
            Open-Meteo
          </a>
          . Playas de España a partir de{" "}
          <a
            href="https://www.openstreetmap.org/copyright"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground underline decoration-border"
          >
            OpenStreetMap
          </a>{" "}
          (ODbL). Claridad del agua estimada con{" "}
          <a
            href="https://coastwatch.pfeg.noaa.gov"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground underline decoration-border"
          >
            NOAA CoastWatch
          </a>
          . Mapa con{" "}
          <a href="https://leafletjs.com" target="_blank" rel="noopener noreferrer" className="hover:text-foreground underline decoration-border">
            Leaflet
          </a>
          .
        </p>
        <p>Este producto no sustituye las indicaciones de seguridad locales ni de socorristas.</p>
      </div>
    </footer>
  );
}
