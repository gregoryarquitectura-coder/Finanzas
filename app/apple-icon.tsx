import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "center",
          gap: 12,
          background: "#161513",
          padding: "0 0 34px 0",
        }}
      >
        <div style={{ width: 22, height: 46, background: "#a9814a", borderRadius: 6 }} />
        <div style={{ width: 22, height: 80, background: "#D1A25E", borderRadius: 6 }} />
        <div style={{ width: 22, height: 108, background: "#FFA641", borderRadius: 6 }} />
      </div>
    ),
    { ...size }
  );
}
