// Copyright 2026 Snowflake Inc.
// SPDX-License-Identifier: Apache-2.0
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

"use client";

import {
  SigmaContainer,
  useLoadGraph,
  useRegisterEvents,
  useSigma,
} from "@react-sigma/core";
import "@react-sigma/core/lib/style.css";
import Graph from "graphology";
import { useCallback, useEffect, useRef, useState } from "react";
import type { SerializedNode, SerializedEdge } from "@/lib/graph-data";
import { createEdgeArrowProgram, createEdgeDoubleArrowProgram } from "sigma/rendering";
import { useTheme, CANVAS_THEMES, type CanvasTheme } from "@/lib/theme";

import type { Settings } from "sigma/settings";

let activeArchitectTheme: CanvasTheme = CANVAS_THEMES.dark;

const arrowOptions = { lengthToThicknessRatio: 2.5, widenessToThicknessRatio: 3 };
const CustomEdgeArrowProgram = createEdgeArrowProgram(arrowOptions);
const CustomEdgeDoubleArrowProgram = createEdgeDoubleArrowProgram(arrowOptions);

const NODE_COLORS: Record<string, string> = {
  catalog: "#d4942a",
  engine: "#2da87a",
  platform: "#5a8fd4",
};

const EDGE_MODE_COLORS: Record<string, string> = {
  read_write: "#22916a",
  read: "#4a7ec0",
  write: "#b8891a",
};

const NODE_SIZE = 22;
const COL_X = { platform: -200, catalog: 300, engine: 800 };
const VERTICAL_SPACING = 170;

function getNodeLabelPosition(
  data: { x: number; y: number; size: number },
  textWidth: number,
  paddingX: number,
  paddingY: number,
  fontSize: number,
  gap: number
) {
  const boxWidth = textWidth + paddingX * 2;
  const boxHeight = fontSize + paddingY * 2;

  // platforms (left side of canvas) → label on left
  // engines (right side of canvas) → label on right
  // catalogs (center) → label below
  // use graph x position stored in color trick — instead use canvas x
  const canvasWidth = 1500;
  const relX = data.x / canvasWidth;

  if (relX < 0.35) {
    // platform: label on left
    return {
      boxX: data.x - data.size - gap - boxWidth,
      boxY: data.y - boxHeight / 2,
      textX: data.x - data.size - gap - boxWidth + paddingX,
      textY: data.y,
      align: "start" as CanvasTextAlign,
    };
  } else if (relX > 0.6) {
    // engine: label on right
    return {
      boxX: data.x + data.size + gap,
      boxY: data.y - boxHeight / 2,
      textX: data.x + data.size + gap + paddingX,
      textY: data.y,
      align: "start" as CanvasTextAlign,
    };
  } else {
    return {
      boxX: data.x - boxWidth / 2,
      boxY: data.y + data.size + 10,
      textX: data.x,
      textY: data.y + data.size + 10 + boxHeight / 2,
      align: "center" as CanvasTextAlign,
    };
  }
}

function drawArchitectLabel(
  context: CanvasRenderingContext2D,
  data: { label: string | null; x: number; y: number; size: number; color: string },
  settings: Settings
): void {
  if (!data.label) return;
  const label = data.label;
  const fontSize = settings.labelSize;
  const font = `${settings.labelWeight} ${fontSize}px ${settings.labelFont}`;
  context.font = font;
  const textWidth = context.measureText(label).width;
  const paddingX = 10;
  const paddingY = 6;
  const gap = 12;
  const boxWidth = textWidth + paddingX * 2;
  const boxHeight = fontSize + paddingY * 2;

  const pos = getNodeLabelPosition(data, textWidth, paddingX, paddingY, fontSize, gap);

  context.fillStyle = activeArchitectTheme.labelBg;
  context.beginPath();
  context.roundRect(pos.boxX, pos.boxY, boxWidth, boxHeight, 4);
  context.fill();
  context.fillStyle = activeArchitectTheme.labelText;
  context.textBaseline = "middle";
  context.textAlign = pos.align;
  context.fillText(label, pos.align === "center" ? pos.textX : pos.textX, pos.textY);
  context.textBaseline = "alphabetic";
  context.textAlign = "start";
}

function drawArchitectHoverLabel(
  context: CanvasRenderingContext2D,
  data: { label: string | null; x: number; y: number; size: number; color: string },
  settings: Settings
): void {
  if (!data.label) return;
  const label = data.label;
  const fontSize = settings.labelSize + 1;
  const font = `600 ${fontSize}px ${settings.labelFont}`;
  context.font = font;
  const textWidth = context.measureText(label).width;
  const paddingX = 12;
  const paddingY = 8;
  const gap = 12;
  const boxWidth = textWidth + paddingX * 2;
  const boxHeight = fontSize + paddingY * 2;

  const pos = getNodeLabelPosition(data, textWidth, paddingX, paddingY, fontSize, gap);

  context.fillStyle = activeArchitectTheme.hoverBg;
  context.beginPath();
  context.roundRect(pos.boxX, pos.boxY, boxWidth, boxHeight, 6);
  context.fill();
  context.strokeStyle = activeArchitectTheme.hoverStroke;
  context.lineWidth = 1;
  context.stroke();
  context.fillStyle = activeArchitectTheme.hoverText;
  context.textBaseline = "middle";
  context.textAlign = pos.align;
  context.fillText(label, pos.textX, pos.textY);
  context.textBaseline = "alphabetic";
  context.textAlign = "start";
}

function CanvasGraph({
  nodes,
  edges,
  onRemoveNode,
  onHoverNode,
  conflictingNodeIds,
  missingEdges,
}: {
  nodes: SerializedNode[];
  edges: SerializedEdge[];
  onRemoveNode: (nodeId: string) => void;
  onHoverNode: (info: { nodeId: string; x: number; y: number } | null) => void;
  conflictingNodeIds: Record<string, string>;
  missingEdges: { source: string; target: string }[];
}) {
  const loadGraph = useLoadGraph();
  const sigma = useSigma();
  const registerEvents = useRegisterEvents();

  useEffect(() => {
    const graph = new Graph();

    // invisible anchor nodes to lock the viewport framing
    graph.addNode("__anchor_tl", {
      label: "",
      size: 0.5,
      color: "rgba(0,0,0,0)",
      x: -400,
      y: -500,
      hidden: true,
    });
    graph.addNode("__anchor_br", {
      label: "",
      size: 0.5,
      color: "rgba(0,0,0,0)",
      x: 1100,
      y: 500,
      hidden: true,
    });

    const byType: Record<string, SerializedNode[]> = {
      platform: [],
      catalog: [],
      engine: [],
    };

    for (const node of nodes) {
      if (byType[node.type]) {
        byType[node.type].push(node);
      }
    }

    for (const [type, group] of Object.entries(byType)) {
      const sorted = [...group].sort((a, b) => b.name.localeCompare(a.name));
      const colX = COL_X[type as keyof typeof COL_X] || 0;
      const totalHeight = (sorted.length - 1) * VERTICAL_SPACING;
      const startY = -totalHeight / 2;

      sorted.forEach((node, i) => {
        const isConflicting = node.id in conflictingNodeIds;
        graph.addNode(node.id, {
          label: node.name,
          size: NODE_SIZE,
          color: isConflicting
            ? "rgba(100,100,120,0.25)"
            : NODE_COLORS[node.type] || "#6b7280",
          type: "circle",
          x: colX,
          y: startY + i * VERTICAL_SPACING,
          nodeType: node.type,
        });
      });
    }

    for (const edge of edges) {
      if (graph.hasNode(edge.source) && graph.hasNode(edge.target)) {
        const key = `${edge.source}-${edge.target}`;
        if (!graph.hasEdge(key)) {
          const mode = edge.mode || "read_write";
          const sourceType = graph.getNodeAttribute(edge.source, "nodeType");


          // determine direction: platform/engine is source, catalog is target
          const platformOrEngine = sourceType === "catalog" ? edge.target : edge.source;
          const catalog = sourceType === "catalog" ? edge.source : edge.target;

          if (mode === "read_write") {
            graph.addEdgeWithKey(key, platformOrEngine, catalog, {
              color: EDGE_MODE_COLORS.read_write,
              size: 3,
              type: "double-arrow",
              mode,
            });
          } else if (mode === "write") {
            // arrow points from platform/engine → catalog
            graph.addEdgeWithKey(key, platformOrEngine, catalog, {
              color: EDGE_MODE_COLORS.write,
              size: 3,
              type: "arrow",
              mode,
            });
          } else {
            // read: arrow points from catalog → platform/engine
            graph.addEdgeWithKey(key, catalog, platformOrEngine, {
              color: EDGE_MODE_COLORS.read,
              size: 3,
              type: "arrow",
              mode,
            });
          }
        }
      }
    }

    loadGraph(graph);
  }, [loadGraph, nodes, edges, conflictingNodeIds]);

  useEffect(() => {
    registerEvents({
      enterNode: (event) => {
        const graph = sigma.getGraph();
        const pos = sigma.graphToViewport({
          x: graph.getNodeAttribute(event.node, "x"),
          y: graph.getNodeAttribute(event.node, "y"),
        });
        onHoverNode({ nodeId: event.node, x: pos.x, y: pos.y });
      },
      leaveNode: () => {
        onHoverNode(null);
      },
    });
  }, [registerEvents, sigma, onHoverNode]);

  return null;
}

const EDGE_LABEL_TEXT: Record<string, string> = {
  read_write: "Read / Write",
  read: "Read",
  write: "Write",
  none: "No integration",
};

const EDGE_LABEL_COLORS: Record<string, string> = {
  read_write: "#34d399",
  read: "#60a5fa",
  write: "#fbbf24",
  none: "#6b7280",
};

const EDGE_LABEL_BORDER: Record<string, string> = {
  read_write: "rgba(52,211,153,0.25)",
  read: "rgba(96,165,250,0.25)",
  write: "rgba(251,191,36,0.25)",
  none: "rgba(107,114,128,0.25)",
};

function EdgeLabels({
  edges,
  missingEdges = [],
  showIntegrationLabels = true,
}: {
  edges: SerializedEdge[];
  missingEdges?: { source: string; target: string }[];
  showIntegrationLabels?: boolean;
}) {
  const sigma = useSigma();
  const [labels, setLabels] = useState<
    { key: string; x: number; y: number; mode: string }[]
  >([]);

  useEffect(() => {
    const update = () => {
      const graph = sigma.getGraph();
      const items: typeof labels = [];
      for (const edge of edges) {
        if (!graph.hasNode(edge.source) || !graph.hasNode(edge.target)) continue;
        const srcPos = sigma.graphToViewport({
          x: graph.getNodeAttribute(edge.source, "x"),
          y: graph.getNodeAttribute(edge.source, "y"),
        });
        const tgtPos = sigma.graphToViewport({
          x: graph.getNodeAttribute(edge.target, "x"),
          y: graph.getNodeAttribute(edge.target, "y"),
        });
        items.push({
          key: `${edge.source}-${edge.target}`,
          x: (srcPos.x + tgtPos.x) / 2,
          y: (srcPos.y + tgtPos.y) / 2,
          mode: edge.mode || "read_write",
        });
      }
      for (const me of missingEdges) {
        if (!graph.hasNode(me.source) || !graph.hasNode(me.target)) continue;
        const srcPos = sigma.graphToViewport({
          x: graph.getNodeAttribute(me.source, "x"),
          y: graph.getNodeAttribute(me.source, "y"),
        });
        const tgtPos = sigma.graphToViewport({
          x: graph.getNodeAttribute(me.target, "x"),
          y: graph.getNodeAttribute(me.target, "y"),
        });
        items.push({
          key: `missing-${me.source}-${me.target}`,
          x: (srcPos.x + tgtPos.x) / 2,
          y: (srcPos.y + tgtPos.y) / 2,
          mode: "none",
        });
      }
      setLabels(items);
    };

    update();
    sigma.on("afterRender", update);
    return () => {
      sigma.off("afterRender", update);
    };
  }, [sigma, edges, missingEdges]);

  const visibleLabels = labels.filter(
    (l) => l.mode === "none" || showIntegrationLabels
  );

  if (visibleLabels.length === 0) return null;

  return (
    <>
      {visibleLabels.map((label) => (
        <div
          key={label.key}
          style={{
            position: "absolute",
            left: `${label.x}px`,
            top: `${label.y}px`,
            transform: "translate(-50%, -50%)",
            zIndex: 35,
            pointerEvents: "none",
            padding: "4px 10px",
            borderRadius: "5px",
            backgroundColor: "var(--bg-elevated)",
            border: `1px solid ${EDGE_LABEL_BORDER[label.mode] || EDGE_LABEL_BORDER.read_write}`,
            fontSize: "10px",
            fontWeight: 700,
            color: EDGE_LABEL_COLORS[label.mode] || EDGE_LABEL_COLORS.read_write,
            whiteSpace: "nowrap",
            textTransform: "uppercase",
            letterSpacing: "0.06em",
          }}
        >
          {EDGE_LABEL_TEXT[label.mode] || label.mode}
        </div>
      ))}
    </>
  );
}

function DashedEdges({
  missingEdges,
}: {
  missingEdges: { source: string; target: string }[];
}) {
  const sigma = useSigma();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const draw = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const container = sigma.getContainer();
      const rect = container.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;

      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, rect.width, rect.height);

      const graph = sigma.getGraph();

      for (const me of missingEdges) {
        if (!graph.hasNode(me.source) || !graph.hasNode(me.target)) continue;
        const srcPos = sigma.graphToViewport({
          x: graph.getNodeAttribute(me.source, "x"),
          y: graph.getNodeAttribute(me.source, "y"),
        });
        const tgtPos = sigma.graphToViewport({
          x: graph.getNodeAttribute(me.target, "x"),
          y: graph.getNodeAttribute(me.target, "y"),
        });

        ctx.beginPath();
        ctx.setLineDash([6, 5]);
        ctx.strokeStyle = activeArchitectTheme.dashedEdge;
        ctx.lineWidth = 1;
        ctx.moveTo(srcPos.x, srcPos.y);
        ctx.lineTo(tgtPos.x, tgtPos.y);
        ctx.stroke();
      }
    };

    draw();
    sigma.on("afterRender", draw);
    return () => {
      sigma.off("afterRender", draw);
    };
  }, [sigma, missingEdges]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 1,
      }}
    />
  );
}

function ConflictToast({
  x,
  y,
  reasons,
}: {
  x: number;
  y: number;
  reasons: string[];
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      style={{
        position: "absolute",
        left: `${x + 18}px`,
        top: `${y - 26}px`,
        zIndex: 45,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        style={{
          width: "20px",
          height: "20px",
          borderRadius: "50%",
          backgroundColor: "rgba(251,191,36,0.15)",
          border: "1.5px solid rgba(251,191,36,0.35)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "12px",
          fontWeight: 700,
          color: "#fbbf24",
          cursor: "default",
        }}
      >
        !
      </div>
      {hovered && (
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "28px",
            transform: "translateY(-50%)",
            padding: "10px 14px",
            borderRadius: "8px",
            backgroundColor: "var(--bg-surface)",
            border: "1px solid rgba(251,191,36,0.25)",
            backdropFilter: "blur(12px)",
            boxShadow: "0 4px 16px var(--shadow)",
            minWidth: "160px",
            zIndex: 50,
          }}
        >
          <ul
            style={{
              listStyle: "none",
              margin: 0,
              padding: 0,
              display: "flex",
              flexDirection: "column",
              gap: "6px",
            }}
          >
            {reasons.map((reason, i) => (
              <li
                key={i}
                style={{
                  fontSize: "12px",
                  color: "#fbbf24",
                  fontWeight: 500,
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                {reasons.length > 1 && (
                  <span
                    style={{
                      width: "4px",
                      height: "4px",
                      borderRadius: "50%",
                      backgroundColor: "#fbbf24",
                      flexShrink: 0,
                    }}
                  />
                )}
                {reason}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function ConflictIndicators({
  conflictingNodeIds,
}: {
  conflictingNodeIds: Record<string, string>;
}) {
  const sigma = useSigma();
  const [positions, setPositions] = useState<
    { nodeId: string; x: number; y: number; message: string }[]
  >([]);

  useEffect(() => {
    const update = () => {
      const graph = sigma.getGraph();
      const items: typeof positions = [];
      for (const [nodeId, message] of Object.entries(conflictingNodeIds)) {
        if (!graph.hasNode(nodeId)) continue;
        const pos = sigma.graphToViewport({
          x: graph.getNodeAttribute(nodeId, "x"),
          y: graph.getNodeAttribute(nodeId, "y"),
        });
        items.push({ nodeId, x: pos.x, y: pos.y, message });
      }
      setPositions(items);
    };

    update();
    sigma.on("afterRender", update);
    return () => {
      sigma.off("afterRender", update);
    };
  }, [sigma, conflictingNodeIds]);

  if (positions.length === 0) return null;

  return (
    <>
      {positions.map((item) => {
        const reasons = item.message.split("; ");

        return (
          <ConflictToast
            key={item.nodeId}
            x={item.x}
            y={item.y}
            reasons={reasons}
          />
        );
      })}
    </>
  );
}

function ArchitectThemeSync() {
  const { theme } = useTheme();
  const sigma = useSigma();

  useEffect(() => {
    activeArchitectTheme = CANVAS_THEMES[theme];
    sigma.setSetting("labelColor", { color: activeArchitectTheme.labelText });
    sigma.refresh();
  }, [theme, sigma]);

  return null;
}

export function ArchitectCanvas({
  nodes,
  edges,
  onRemoveNode,
  conflictingNodeIds = {},
  missingEdges = [],
  showEdgeLabels = true,
}: {
  nodes: SerializedNode[];
  edges: SerializedEdge[];
  onRemoveNode: (nodeId: string) => void;
  conflictingNodeIds?: Record<string, string>;
  missingEdges?: { source: string; target: string }[];
  showEdgeLabels?: boolean;
}) {
  const [removeButton, setRemoveButton] = useState<{
    nodeId: string;
    x: number;
    y: number;
  } | null>(null);
  const isOverButton = useRef(false);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleHoverNode = useCallback(
    (info: { nodeId: string; x: number; y: number } | null) => {
      if (hideTimer.current) {
        clearTimeout(hideTimer.current);
        hideTimer.current = null;
      }
      if (info) {
        setRemoveButton(info);
      } else {
        hideTimer.current = setTimeout(() => {
          if (!isOverButton.current) {
            setRemoveButton(null);
          }
        }, 150);
      }
    },
    []
  );


  return (
    <div style={{ width: "100%", height: "100%", position: "relative" }}>
      <SigmaContainer
        ref={(sigmaInstance) => {
          if (sigmaInstance) {
            const cam = sigmaInstance.getCamera();
            cam.minRatio = 1;
            cam.maxRatio = 1;
          }
        }}
        style={{ width: "100%", height: "100%" }}
        settings={{
          defaultNodeColor: "#6b7280",
          defaultEdgeColor: "rgba(0,0,0,0)",
          labelColor: { color: "#e8e8ed" },
          labelFont: "Inter, system-ui, -apple-system, sans-serif",
          labelSize: 15,
          labelWeight: "500",
          labelRenderedSizeThreshold: 0,
          labelDensity: 4,
          labelGridCellSize: 50,
          renderEdgeLabels: false,
          enableEdgeEvents: false,
          stagePadding: 120,
          defaultEdgeType: "arrow",
          edgeProgramClasses: {
            arrow: CustomEdgeArrowProgram,
            "double-arrow": CustomEdgeDoubleArrowProgram,
          },
          allowInvalidContainer: true,
          enableCameraZooming: false,
          enableCameraPanning: false,
          enableCameraRotation: false,
              defaultDrawNodeLabel: drawArchitectLabel,
              defaultDrawNodeHover: drawArchitectHoverLabel,
        }}
      >
        <CanvasGraph
          nodes={nodes}
          edges={edges}
          onRemoveNode={onRemoveNode}
          onHoverNode={handleHoverNode}
          conflictingNodeIds={conflictingNodeIds}
          missingEdges={missingEdges}
        />
        <ArchitectThemeSync />
        <DashedEdges missingEdges={missingEdges} />
        <ConflictIndicators conflictingNodeIds={conflictingNodeIds} />
        <EdgeLabels edges={edges} missingEdges={missingEdges} showIntegrationLabels={showEdgeLabels} />
      </SigmaContainer>

      {removeButton && (
        <button
          onClick={() => {
            onRemoveNode(removeButton.nodeId);
            setRemoveButton(null);
            isOverButton.current = false;
          }}
          onMouseEnter={() => {
            isOverButton.current = true;
          }}
          onMouseLeave={() => {
            isOverButton.current = false;
            setRemoveButton(null);
          }}
          style={{
            position: "absolute",
            left: `${removeButton.x - 8}px`,
            top: `${removeButton.y - 8}px`,
            transform: "translate(-100%, -100%)",
            zIndex: 50,
            width: "22px",
            height: "22px",
            borderRadius: "50%",
            backgroundColor: "transparent",
            border: "1.5px solid rgba(255,255,255,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "13px",
            fontWeight: 600,
            color: "rgba(255,255,255,0.75)",
            cursor: "pointer",
            padding: 0,
            lineHeight: 1,
            transition: "all 0.15s",
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.1)";
            e.currentTarget.style.borderColor = "rgba(255,255,255,0.4)";
            e.currentTarget.style.color = "rgba(255,255,255,0.9)";
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = "transparent";
            e.currentTarget.style.borderColor = "rgba(255,255,255,0.25)";
            e.currentTarget.style.color = "rgba(255,255,255,0.5)";
          }}
          aria-label="Remove node"
        >
          ×
        </button>
      )}

    </div>
  );
}
