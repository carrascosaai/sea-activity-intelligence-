import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import Script from "next/script";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import "./globals.css";

// Opcional, igual que Supabase: si no está configurado (p. ej. en local),
// simplemente no se carga nada — no bloquea ni rompe el resto de la app.
const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

// Tipografía de titulares propia (autoalojada, sin depender de ninguna red en
// producción — el archivo va en el propio despliegue, igual de fiable que la
// fuente del sistema). Space Grotesk (OFL, ver src/fonts/SpaceGrotesk-OFL.txt)
// le da identidad visual real a los títulos en vez de la tipografía del
// sistema genérica que usa cualquier plantilla — el cuerpo de texto se queda
// en la fuente nativa por legibilidad en párrafos largos.
const displayFont = localFont({
  src: "../fonts/SpaceGrotesk-Variable.ttf",
  variable: "--font-display",
  display: "swap",
  weight: "300 700",
});

const SITE_DESCRIPTION =
  "Convierte el viento, el oleaje y el tiempo en una decisión clara: qué actividad acuática hacer, dónde y cuándo. 20 deportes, toda la costa de España.";

// VERCEL_PROJECT_PRODUCTION_URL es el dominio estable de producción (no cambia
// entre despliegues, a diferencia de VERCEL_URL que apunta al deploy concreto
// con hash aleatorio) — así la imagen de vista previa social y el sitemap
// nunca quedan apuntando a una URL de un deploy viejo o a localhost.
const siteUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Sea Activity Intelligence — ¿Qué puedo hacer ahora en el mar?",
    template: "%s · Sea Activity Intelligence",
  },
  description: SITE_DESCRIPTION,
  applicationName: "Sea Activity Intelligence",
  manifest: "/manifest.webmanifest",
  openGraph: {
    title: "Sea Activity Intelligence",
    description: SITE_DESCRIPTION,
    type: "website",
    locale: "es_ES",
  },
  twitter: {
    card: "summary_large_image",
    title: "Sea Activity Intelligence",
    description: SITE_DESCRIPTION,
  },
};

export const viewport: Viewport = {
  themeColor: "#0a120f",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className={`h-full antialiased ${displayFont.variable}`}>
      <body className="min-h-full flex flex-col">
        {GA_MEASUREMENT_ID && (
          <>
            <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`} strategy="afterInteractive" />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${GA_MEASUREMENT_ID}');
              `}
            </Script>
          </>
        )}
        <Navbar />
        {children}
        <Footer />
      </body>
    </html>
  );
}
