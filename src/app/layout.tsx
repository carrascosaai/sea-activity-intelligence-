import type { Metadata, Viewport } from "next";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import "./globals.css";

const SITE_DESCRIPTION =
  "Convierte el viento, el oleaje y el tiempo en una decisión clara: qué actividad acuática hacer, dónde y cuándo. 20 deportes, toda la costa de España.";

// Se resuelve solo al dominio real del despliegue (Vercel expone VERCEL_URL
// automáticamente) — así la imagen de vista previa social nunca queda
// apuntando a localhost, sin tener que tocar esto al desplegar.
const siteUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000";

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
  themeColor: "#070f19",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <Navbar />
        {children}
        <Footer />
      </body>
    </html>
  );
}
