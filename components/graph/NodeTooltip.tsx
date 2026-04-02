"use client";

import { useRegisterEvents, useSigma } from "@react-sigma/core";
import { useEffect, useState } from "react";
import type { SerializedNode } from "@/lib/graph-data";

const TYPE_LABELS: Record<string, string> = {
  catalog: "Catalog",
  engine: "Engine",
  platform: "Platform",
};

const TYPE_DOT_COLORS: Record<string, string> = {
  catalog: "#d4942a",
  engine: "#2da87a",
  platform: "#5a8fd4",
};

export function NodeTooltip({
  allNodeData,
  edgeCounts,
}: {
  allNodeData: Record<string, SerializedNode>;
  edgeCounts: Record<string, number>;
}) {
  const sigma = useSigma();
  const registerEvents = useRegisterEvents();
  const [tooltip, setTooltip] = useState<{
    x: number;
    y: number;
    node: SerializedNode;
    connections: number;
  } | null>(null);

  useEffect(() => {
    registerEvents({
      enterNode: (event) => {
        const nodeData = allNodeData[event.node];
        if (!nodeData) return;
        const pos = sigma.graphToViewport({
          x: sigma.getGraph().getNodeAttribute(event.node, "x"),
          y: sigma.getGraph().getNodeAttribute(event.node, "y"),
        });
        setTooltip({
          x: pos.x,
          y: pos.y,
          node: nodeData,
          connections: edgeCounts[event.node] || 0,
        });
      },
      leaveNode: () => {
        setTooltip(null);
      },
      clickNode: () => {
        setTooltip(null);
      },
    });
  }, [registerEvents, sigma, allNodeData, edgeCounts]);

  if (!tooltip) return null;

  const spec = tooltip.node.spec_support;
  const specParts: string[] = [];
  if (spec) {
    if (spec.v1) specParts.push("v1");
    if (spec.v2 === true) specParts.push("v2");
    else if (spec.v2 === "preview") specParts.push("v2 preview");
    if (spec.v3 === true) specParts.push("v3");
    else if (spec.v3 === "preview") specParts.push("v3 preview");
  }

  return (
    <div
      style={{
        position: "absolute",
        left: `${tooltip.x}px`,
        top: `${tooltip.y - 14}px`,
        transform: "translateX(-50%) translateY(-100%)",
        zIndex: 60,
        pointerEvents: "none",
        backgroundColor: "rgba(14, 14, 22, 0.95)",
        backdropFilter: "blur(12px)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: "10px",
        padding: "12px 16px",
        minWidth: "180px",
        boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
        <span
          style={{
            width: "8px",
            height: "8px",
            borderRadius: "50%",
            backgroundColor: TYPE_DOT_COLORS[tooltip.node.type] || "#6b7280",
            flexShrink: 0,
          }}
        />
        <span
          style={{
            fontSize: "14px",
            fontWeight: 600,
            color: "#ffffff",
          }}
        >
          {tooltip.node.name}
        </span>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "4px",
          fontSize: "12px",
          color: "#9898b8",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span>Type</span>
          <span style={{ color: "#c4c4d8" }}>{TYPE_LABELS[tooltip.node.type]}</span>
        </div>
        {specParts.length > 0 && (
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span>Spec</span>
            <span style={{ color: "#c4c4d8" }}>{specParts.join(" · ")}</span>
          </div>
        )}
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span>Connections</span>
          <span style={{ color: "#c4c4d8" }}>{tooltip.connections}</span>
        </div>
        {tooltip.node.open_source && (
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span>License</span>
            <span style={{ color: "#c4c4d8" }}>Open Source</span>
          </div>
        )}
      </div>
    </div>
  );
}
