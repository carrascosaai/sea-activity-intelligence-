import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          background: "linear-gradient(160deg, #101a18 0%, #0a120f 60%)",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 60,
            right: 90,
            width: 220,
            height: 220,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(243,173,61,0.55), transparent 70%)",
            display: "flex",
          }}
        />
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <svg width="96" height="96" viewBox="0 0 64 64">
            <rect width="64" height="64" rx="14" fill="#101a18" />
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
          <div style={{ fontSize: 68, fontWeight: 700, color: "#eaf3fa", display: "flex" }}>
            Sea Activity Intelligence
          </div>
        </div>
        <div style={{ fontSize: 32, color: "#85a0b6", marginTop: 22, display: "flex" }}>
          Decide donde y cuando hacer surf, kayak, buceo y 17 deportes mas
        </div>
        <div
          style={{
            display: "flex",
            gap: 16,
            marginTop: 46,
          }}
        >
          {[
            ["#2fd06a", "MUY BUENAS CONDICIONES"],
            ["#f3ad3d", "ACEPTABLES"],
            ["#f2564a", "NO RECOMENDADO"],
          ].map(([color, label]) => (
            <div
              key={label}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "10px 22px",
                borderRadius: 999,
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.12)",
              }}
            >
              <div style={{ width: 14, height: 14, borderRadius: "50%", background: color, display: "flex" }} />
              <div style={{ fontSize: 22, color: "#eaf3fa", display: "flex" }}>{label}</div>
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size }
  );
}
