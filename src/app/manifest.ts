import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Sea Activity Intelligence",
    short_name: "Sea Activity",
    description:
      "Decide qué actividad acuática hacer, dónde y cuándo — condiciones reales de toda la costa española.",
    start_url: "/",
    display: "standalone",
    background_color: "#070f19",
    theme_color: "#070f19",
    lang: "es",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
      { src: "/pwa-icon?size=192", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/pwa-icon?size=512", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/pwa-icon?size=512&maskable=1", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
