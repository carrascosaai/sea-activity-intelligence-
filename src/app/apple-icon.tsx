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
    { ...size }
  );
}
