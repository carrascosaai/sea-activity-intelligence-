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
          background: "linear-gradient(160deg, #101a18 0%, #0a120f 100%)",
        }}
      >
        <svg width="128" height="128" viewBox="0 0 64 64">
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
    { ...size }
  );
}
