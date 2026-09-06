import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

// Mismo logotipo real que el favicon (src/app/icon.svg) — antes usaba el
// emoji 🌊 suelto sobre un fondo, que además de desentonar con el favicon
// real, se renderiza de forma distinta según el sistema operativo.
export default function AppleIcon() {
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
        <svg width="128" height="128" viewBox="0 0 64 64">
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
    { ...size }
  );
}
