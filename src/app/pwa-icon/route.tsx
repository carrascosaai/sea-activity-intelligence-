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
          background: "linear-gradient(160deg, #0f2438 0%, #071019 100%)",
        }}
      >
        <svg width={logoSize} height={logoSize} viewBox="0 0 64 64">
          <path
            d="M8 40c4-5 10-5 14 0s10 5 14 0 10-5 14 0 10 5 14 0"
            fill="none"
            stroke="#21d6b8"
            strokeWidth="4.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M8 50c4-5 10-5 14 0s10 5 14 0 10-5 14 0 10 5 14 0"
            fill="none"
            stroke="#2f9de0"
            strokeWidth="4.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.85"
          />
          <circle cx="46" cy="16" r="6" fill="#f3ad3d" />
        </svg>
      </div>
    ),
    { width: size, height: size }
  );
}
