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
          <circle
            cx="32"
            cy="26"
            r="17"
            fill="none"
            stroke="#4a72c9"
            strokeWidth="3.2"
            strokeLinecap="round"
            strokeDasharray="80.1 26.7"
            transform="rotate(-90 32 26)"
          />
          <circle cx="32" cy="9" r="5.2" fill="none" stroke="#f3ad3d" strokeWidth="1.2" opacity="0.4" />
          <circle cx="32" cy="9" r="2.6" fill="#f3ad3d" />
          <path
            d="M6 46c6-7 12-7 18 0s12 7 18 0 12-7 18 0"
            fill="none"
            stroke="#2f9c8c"
            strokeWidth="4.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    ),
    { width: size, height: size }
  );
}
