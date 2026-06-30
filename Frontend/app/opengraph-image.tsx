import { ImageResponse } from "next/og";

export const alt = "Burning Heart – Pèlerins avec le Christ";
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
          alignItems: "center",
          justifyContent: "center",
          background:
            "linear-gradient(135deg, #8B1538 0%, #6d1029 60%, #4a0a1c 100%)",
          color: "#ffffff",
          fontFamily: "sans-serif",
          padding: "80px",
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontSize: 84,
            fontWeight: 700,
            letterSpacing: "-2px",
            lineHeight: 1.05,
          }}
        >
          Burning Heart
        </div>
        <div
          style={{
            marginTop: 24,
            fontSize: 38,
            opacity: 0.92,
          }}
        >
          Pèlerins avec le Christ
        </div>
        <div
          style={{
            marginTop: 48,
            fontSize: 26,
            opacity: 0.8,
            maxWidth: 820,
          }}
        >
          Apostolat de spiritualité ignatienne — blog, événements et
          accompagnement
        </div>
      </div>
    ),
    { ...size },
  );
}
