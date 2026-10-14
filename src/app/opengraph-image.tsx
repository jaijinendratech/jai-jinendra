import { ImageResponse } from "next/og";

export const alt = "Jai Jinendra Sweets & Namkeens — Rajasthani namkeens and mithai since 1984";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background: "#1c1410",
          color: "#fff8f1",
        }}
      >
        <div
          style={{
            fontSize: 28,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "#ef6113",
          }}
        >
          Kota · Since 1984
        </div>
        <div style={{ fontSize: 84, fontWeight: 700, marginTop: 24, lineHeight: 1.05 }}>
          Jai Jinendra
        </div>
        <div style={{ fontSize: 40, marginTop: 12, color: "#f3e6d8" }}>
          Sweets & Namkeens
        </div>
        <div style={{ fontSize: 28, marginTop: 36, maxWidth: 820, color: "#e7d5c4" }}>
          Authentic Rajasthani namkeens, mithai, and festive hampers. Freshly made and delivered pan-India.
        </div>
      </div>
    ),
    { ...size },
  );
}
