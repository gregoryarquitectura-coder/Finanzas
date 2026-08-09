import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 64, height: 64 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "center",
          gap: 4,
          background: "#161513",
          padding: "0 0 12px 0",
        }}
      >
        <div style={{ width: 8, height: 16, background: "#a9814a", borderRadius: 2 }} />
        <div style={{ width: 8, height: 28, background: "#D1A25E", borderRadius: 2 }} />
        <div style={{ width: 8, height: 38, background: "#FFA641", borderRadius: 2 }} />
      </div>
    ),
    { ...size }
  );
}
