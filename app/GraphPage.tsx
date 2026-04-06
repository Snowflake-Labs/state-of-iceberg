"use client";

import dynamic from "next/dynamic";
import type { GraphPayload, SerializedNode } from "@/lib/graph-data";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

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
      <Header />

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

      <Footer />
    </div>
  );
}
