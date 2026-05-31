import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(135deg, #1e40af 0%, #1d4ed8 50%, #2563eb 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            width: 100,
            height: 100,
            background: "rgba(255,255,255,0.15)",
            borderRadius: 24,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 32,
          }}
        >
          <span style={{ color: "white", fontSize: 48, fontWeight: 800 }}>CS</span>
        </div>
        <div style={{ color: "white", fontSize: 64, fontWeight: 800, letterSpacing: "-2px" }}>
          CSKU
        </div>
        <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 28, marginTop: 16, textAlign: "center", maxWidth: 700 }}>
          Computer Science Student Organization
        </div>
        <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 20, marginTop: 8 }}>
          Kasetsart University
        </div>
      </div>
    ),
    size
  );
}
