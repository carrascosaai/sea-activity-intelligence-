import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";

// Iconos PNG para el manifest PWA (necesarios para empaquetar la app como
// APK con Bubblewrap/TWA — icon.svg solo no vale ahí). `maskable=1` añade
// margen interior para la "safe zone" que exige Android al recortar el
// icono en distintas formas (círculo, squircle...). Mismo logotipo real
// que el favicon (antes era el emoji 🌊 suelto, inconsistente con él).
export async function GET(req: NextRequest) {
  const size = Number(req.nextUrl.searchParams.get("size") ?? "512");
  const maskable = req.nextUrl.searchParams.get("maskable") === "1";
  const logoSize = maskable ? size * 0.62 : size * 0.8;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(160deg, #101a18 0%, #0a120f 100%)",
        }}
      >
        <svg width={logoSize} height={logoSize} viewBox="0 0 64 64">
          <path
            d="M7 34h6l4-15 4 30 4-15h5"
            fill="none"
            stroke="#4a72c9"
            strokeWidth="4.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M30 34c5-11 11-11 16 0s11 11 16 0"
            fill="none"
            stroke="#2f9c8c"
            strokeWidth="4.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="19" cy="19" r="2.6" fill="#f3ad3d" />
        </svg>
      </div>
    ),
    { width: size, height: size }
  );
}
