"use client";

export function Footer() {
  return (
    <footer
      style={{
        flexShrink: 0,
        padding: "12px 36px",
        borderTop: "1px solid rgba(255,255,255,0.04)",
        backgroundColor: "rgba(8,8,13,0.9)",
      }}
    >
      <p
        style={{
          fontSize: "11px",
          color: "#4a4a68",
          lineHeight: 1.6,
        }}
      >
        This is an independent community resource and is not affiliated with or
        endorsed by any vendor listed. Capabilities should be verified against
        official documentation before making architectural decisions.
      </p>
    </footer>
  );
}
