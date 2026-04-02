"use client";

import dynamic from "next/dynamic";
import type { GraphPayload, SerializedNode } from "@/lib/graph-data";

const IcebergGraph = dynamic(
  () =>
    import("@/components/graph/IcebergGraph").then((mod) => mod.IcebergGraph),
  { ssr: false }
);

export function GraphPage({
  data,
  allNodeData,
}: {
  data: GraphPayload;
  allNodeData: Record<string, SerializedNode>;
}) {
  return (
    <div style={{ height: "100vh", width: "100vw", display: "flex", flexDirection: "column", backgroundColor: "#08080d" }}>
      <header
        style={{
          flexShrink: 0,
          padding: "20px 36px",
          borderBottom: "1px solid rgba(255,255,255,0.04)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          backgroundColor: "rgba(8,8,13,0.8)",
          backdropFilter: "blur(8px)",
          zIndex: 10,
        }}
      >
        <div>
          <h1
            style={{
              fontSize: "22px",
              fontWeight: 700,
              color: "#ffffff",
              letterSpacing: "-0.02em",
              lineHeight: 1.2,
            }}
          >
            The State of Iceberg
          </h1>
          <p
            style={{
              fontSize: "14px",
              color: "#b0b0c8",
              marginTop: "6px",
              letterSpacing: "0.01em",
            }}
          >
            Apache Iceberg interoperability across the modern data ecosystem
          </p>
        </div>
      </header>

      <main style={{ flex: 1, position: "relative", overflow: "hidden" }}>
        <IcebergGraph data={data} allNodeData={allNodeData} />

        <div
          style={{
            position: "absolute",
            bottom: "24px",
            left: "36px",
            zIndex: 40,
            padding: "10px 18px",
            borderRadius: "12px",
            backgroundColor: "rgba(17,17,25,0.7)",
            backdropFilter: "blur(8px)",
            border: "1px solid rgba(255,255,255,0.04)",
          }}
        >
          <p
            style={{
            fontSize: "12px",
            color: "#b0b0c8",
              fontWeight: 500,
              letterSpacing: "0.02em",
            }}
          >
            Select a platform, catalog, or engine to explore
          </p>
        </div>
      </main>

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
          This is an independent community resource and is not affiliated with or endorsed by any vendor listed. Capabilities should be verified against official documentation before making architectural decisions.
        </p>
      </footer>
    </div>
  );
}
