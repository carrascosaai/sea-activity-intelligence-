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
          background: "linear-gradient(160deg, #0f2438 0%, #071019 60%)",
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
          <div style={{ fontSize: 96, display: "flex" }}>🌊</div>
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
