import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";

// Iconos PNG para el manifest PWA (necesarios para empaquetar la app como
// APK con Bubblewrap/TWA — icon.svg solo no vale ahí). `maskable=1` añade
// margen interior para la "safe zone" que exige Android al recortar el
// icono en distintas formas (círculo, squircle...).
export async function GET(req: NextRequest) {
  const size = Number(req.nextUrl.searchParams.get("size") ?? "512");
  const maskable = req.nextUrl.searchParams.get("maskable") === "1";
  const emojiSize = maskable ? size * 0.5 : size * 0.62;

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
        <div style={{ fontSize: emojiSize, display: "flex" }}>🌊</div>
      </div>
    ),
    { width: size, height: size }
  );
}
