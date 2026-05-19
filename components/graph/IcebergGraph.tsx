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
import { createEdgeArrowProgram, createEdgeDoubleArrowProgram } from "sigma/rendering";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { GraphPayload, SerializedNode } from "@/lib/graph-data";
import { NodeDetailDrawer } from "./NodeDetailDrawer";
import { ColumnHeaders } from "./ColumnHeaders";

import type { Settings } from "sigma/settings";

function drawDarkLabel(
  context: CanvasRenderingContext2D,
  data: { label: string | null; x: number; y: number; size: number; color: string },
  settings: Settings
): void {
  if (!data.label) return;
  const label = data.label;
  const isDimmed = data.color === NODE_COLOR_DIMMED;

  const fontSize = settings.labelSize;
  const font = `${settings.labelWeight} ${fontSize}px ${settings.labelFont}`;

  context.font = font;

  const textWidth = context.measureText(label).width;
  const paddingX = 10;
  const paddingY = 6;
  const gap = 10;
  const boxWidth = textWidth + paddingX * 2;
  const boxHeight = fontSize + paddingY * 2;
  const boxX = data.x + data.size + gap;
  const boxY = data.y - boxHeight / 2;

  context.fillStyle = isDimmed ? "rgba(8, 8, 13, 0.22)" : "rgba(8, 8, 13, 0.85)";
  context.beginPath();
  context.roundRect(boxX, boxY, boxWidth, boxHeight, 4);
  context.fill();

  context.fillStyle = isDimmed ? "rgba(232, 232, 237, 0.15)" : "#e8e8ed";
  context.textBaseline = "middle";
  context.fillText(label, boxX + paddingX, data.y);
  context.textBaseline = "alphabetic";
}

function drawHoverLabel(
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
  const gap = 10;
  const boxWidth = textWidth + paddingX * 2;
  const boxHeight = fontSize + paddingY * 2;
  const boxX = data.x + data.size + gap;
  const boxY = data.y - boxHeight / 2;

  context.fillStyle = "rgba(8, 8, 13, 0.95)";
  context.beginPath();
  context.roundRect(boxX, boxY, boxWidth, boxHeight, 6);
  context.fill();

  context.strokeStyle = "rgba(255,255,255,0.1)";
  context.lineWidth = 1;
  context.stroke();

  context.fillStyle = "#ffffff";
  context.textBaseline = "middle";
  context.fillText(label, boxX + paddingX, data.y);
  context.textBaseline = "alphabetic";
}

const NODE_COLORS: Record<string, string> = {
  catalog: "#d4942a",
  engine: "#2da87a",
  platform: "#5a8fd4",
};

const NODE_COLOR_DIMMED = "rgba(100,100,120,0.10)";
const EDGE_COLOR_DEFAULT = "rgba(0,0,0,0)";

const EDGE_MODE_COLORS: Record<string, string> = {
  read_write: "#22916a",
  read: "#4a7ec0",
  write: "#b8891a",
};

const arrowOptions = { lengthToThicknessRatio: 2.5, widenessToThicknessRatio: 3 };
const CustomEdgeArrowProgram = createEdgeArrowProgram(arrowOptions);
const CustomEdgeDoubleArrowProgram = createEdgeDoubleArrowProgram(arrowOptions);
const NODE_SIZE_CATALOG = 26;
const NODE_SIZE_DEFAULT = 22;

function GraphLoader({ data }: { data: GraphPayload }) {
  const loadGraph = useLoadGraph();
  const sigma = useSigma();

  useEffect(() => {
    const graph = new Graph();

    const platforms = data.nodes.filter((n) => n.type === "platform");
    const catalogs = data.nodes.filter((n) => n.type === "catalog");
    const engines = data.nodes.filter((n) => n.type === "engine");

    const COL_X = { platform: -480, catalog: 0, engine: 480 };
    const VERTICAL_SPACING = 110;

    function placeColumn(nodes: typeof data.nodes, colX: number) {
      const totalHeight = (nodes.length - 1) * VERTICAL_SPACING;
      const startY = -totalHeight / 2;
      nodes.forEach((node, i) => {
        const isCatalog = node.type === "catalog";
        graph.addNode(node.id, {
          label: node.name,
          size: isCatalog ? NODE_SIZE_CATALOG : NODE_SIZE_DEFAULT,
          color: NODE_COLORS[node.type] || "#6b7280",
          type: "circle",
          x: colX,
          y: startY + i * VERTICAL_SPACING,
          nodeType: node.type,
        });
      });
    }

    // sort each group alphabetically for consistent ordering
    platforms.sort((a, b) => b.name.localeCompare(a.name));
    catalogs.sort((a, b) => b.name.localeCompare(a.name));
    engines.sort((a, b) => b.name.localeCompare(a.name));

    placeColumn(platforms, COL_X.platform);
    placeColumn(catalogs, COL_X.catalog);
    placeColumn(engines, COL_X.engine);

    for (const edge of data.edges) {
      if (graph.hasNode(edge.source) && graph.hasNode(edge.target)) {
        const key = `${edge.source}-${edge.target}`;
        if (!graph.hasEdge(key)) {
          const mode = edge.mode || "read_write";
          const sourceType = graph.getNodeAttribute(edge.source, "nodeType");
          const platformOrEngine = sourceType === "catalog" ? edge.target : edge.source;
          const catalog = sourceType === "catalog" ? edge.source : edge.target;

          if (mode === "read_write") {
            graph.addEdgeWithKey(key, platformOrEngine, catalog, {
              color: EDGE_COLOR_DEFAULT,
              size: 1.5,
              type: "double-arrow",
              mode,
            });
          } else if (mode === "write") {
            graph.addEdgeWithKey(key, platformOrEngine, catalog, {
              color: EDGE_COLOR_DEFAULT,
              size: 1.5,
              type: "arrow",
              mode,
            });
          } else {
            graph.addEdgeWithKey(key, catalog, platformOrEngine, {
              color: EDGE_COLOR_DEFAULT,
              size: 1.5,
              type: "arrow",
              mode,
            });
          }
        }
      }
    }

    loadGraph(graph);
  }, [loadGraph, sigma, data]);

  return null;
}

type GraphEventsHandle = {
  selectNode: (nodeId: string | null) => void;
};

function GraphEvents({
  onSelectNode,
  eventsRef,
  initialNodeId,
}: {
  onSelectNode: (nodeId: string | null) => void;
  eventsRef: React.RefObject<GraphEventsHandle | null>;
  initialNodeId?: string | null;
}) {
  const registerEvents = useRegisterEvents();
  const sigma = useSigma();
  const selectedNodeRef = useRef<string | null>(null);
  const labelHoverRef = useRef<string | null>(null);
  const isOverNodeRef = useRef(false);
  const initialSelectionDone = useRef(false);
  const handleNodeHighlight = useCallback(
    (activeNode: string | null) => {
      const graph = sigma.getGraph();

      if (!activeNode) {
        graph.forEachNode((node) => {
          graph.setNodeAttribute(
            node,
            "color",
            NODE_COLORS[graph.getNodeAttribute(node, "nodeType")] || "#6b7280"
          );
          graph.setNodeAttribute(node, "zIndex", 0);
          graph.setNodeAttribute(
            node,
            "size",
            graph.getNodeAttribute(node, "nodeType") === "catalog"
              ? NODE_SIZE_CATALOG
              : NODE_SIZE_DEFAULT
          );
          graph.setNodeAttribute(node, "dimmed", false);
        });
        graph.forEachEdge((edge) => {
          graph.setEdgeAttribute(edge, "color", EDGE_COLOR_DEFAULT);
          graph.setEdgeAttribute(edge, "size", 1.5);
        });
        sigma.refresh();
        return;
      }

      const neighbors = new Set(graph.neighbors(activeNode));
      neighbors.add(activeNode);

      graph.forEachNode((node) => {
        if (neighbors.has(node)) {
          graph.setNodeAttribute(
            node,
            "color",
            NODE_COLORS[graph.getNodeAttribute(node, "nodeType")] || "#6b7280"
          );
          graph.setNodeAttribute(node, "zIndex", 1);
          graph.setNodeAttribute(node, "dimmed", false);
          const baseSize =
            graph.getNodeAttribute(node, "nodeType") === "catalog"
              ? NODE_SIZE_CATALOG
              : NODE_SIZE_DEFAULT;
          graph.setNodeAttribute(
            node,
            "size",
            node === activeNode ? baseSize + 4 : baseSize
          );
        } else {
          graph.setNodeAttribute(node, "color", NODE_COLOR_DIMMED);
          graph.setNodeAttribute(node, "zIndex", 0);
          graph.setNodeAttribute(node, "dimmed", true);
          graph.setNodeAttribute(node, "size", NODE_SIZE_DEFAULT - 2);
        }
      });

      graph.forEachEdge((edge) => {
        const src = graph.source(edge);
        const tgt = graph.target(edge);
        if (src === activeNode || tgt === activeNode) {
          const mode = graph.getEdgeAttribute(edge, "mode") || "read_write";
          graph.setEdgeAttribute(edge, "color", EDGE_MODE_COLORS[mode] || EDGE_MODE_COLORS.read_write);
          graph.setEdgeAttribute(edge, "size", 3);
        } else {
          graph.setEdgeAttribute(edge, "color", "rgba(0,0,0,0)");
          graph.setEdgeAttribute(edge, "size", 0);
        }
      });

      sigma.refresh();
    },
    [sigma]
  );

  const selectNode = useCallback(
    (nodeId: string | null) => {
      const graph = sigma.getGraph();
      if (nodeId && selectedNodeRef.current === nodeId) {
        selectedNodeRef.current = null;
        onSelectNode(null);
        handleNodeHighlight(null);
        graph.setAttribute("hasSelection", false);
      } else if (nodeId) {
        selectedNodeRef.current = nodeId;
        onSelectNode(nodeId);
        handleNodeHighlight(nodeId);
        graph.setAttribute("hasSelection", true);
      } else {
        selectedNodeRef.current = null;
        onSelectNode(null);
        handleNodeHighlight(null);
        graph.setAttribute("hasSelection", false);
      }
    },
    [onSelectNode, handleNodeHighlight, sigma]
  );

  useEffect(() => {
    if (eventsRef) {
      (eventsRef as React.MutableRefObject<GraphEventsHandle | null>).current = { selectNode };
    }
  }, [eventsRef, selectNode]);

  const findNodeAtPosition = useCallback(
    (viewportX: number, viewportY: number): string | null => {
      const graph = sigma.getGraph();
      let closestNode: string | null = null;
      let closestDist = Infinity;

      graph.forEachNode((node) => {
        const nodePos = sigma.graphToViewport({
          x: graph.getNodeAttribute(node, "x"),
          y: graph.getNodeAttribute(node, "y"),
        });
        const label = graph.getNodeAttribute(node, "label") || "";
        const size = graph.getNodeAttribute(node, "size") || 14;

        const labelWidth = label.length * 8;
        const labelX = nodePos.x + size + 8;
        const labelY = nodePos.y;
        const hitPadding = 12;

        if (
          viewportX >= labelX - hitPadding &&
          viewportX <= labelX + labelWidth + hitPadding &&
          viewportY >= labelY - 16 &&
          viewportY <= labelY + 16
        ) {
          const dx = viewportX - labelX;
          const dy = viewportY - labelY;
          const dist = dx * dx + dy * dy;
          if (dist < closestDist) {
            closestDist = dist;
            closestNode = node;
          }
        }
      });

      return closestNode;
    },
    [sigma]
  );

  useEffect(() => {
    registerEvents({
      enterNode: (event) => {
        isOverNodeRef.current = true;
        labelHoverRef.current = null;
        if (!selectedNodeRef.current) {
          handleNodeHighlight(event.node);
        }
        sigma.getContainer().style.cursor = "pointer";
      },
      leaveNode: () => {
        isOverNodeRef.current = false;
        if (!selectedNodeRef.current) {
          handleNodeHighlight(null);
        }
        sigma.getContainer().style.cursor = "default";
      },
      clickNode: (event) => {
        selectNode(event.node);
      },
      clickStage: (event) => {
        const viewportX = event.event.x;
        const viewportY = event.event.y;
        const hitNode = findNodeAtPosition(viewportX, viewportY);

        if (hitNode) {
          selectNode(hitNode);
        } else {
          selectNode(null);
        }
      },
      mousemovebody: (event) => {
        if (isOverNodeRef.current) return;

        const hitNode = findNodeAtPosition(event.x, event.y);

        if (hitNode) {
          if (labelHoverRef.current !== hitNode) {
            labelHoverRef.current = hitNode;
            if (!selectedNodeRef.current) {
              handleNodeHighlight(hitNode);
            }
            sigma.getContainer().style.cursor = "pointer";
          }
        } else if (labelHoverRef.current) {
          labelHoverRef.current = null;
          if (!selectedNodeRef.current) {
            handleNodeHighlight(null);
          }
          sigma.getContainer().style.cursor = "default";
        }
      },
    });
  }, [registerEvents, sigma, handleNodeHighlight, selectNode, findNodeAtPosition]);

  useEffect(() => {
    if (initialNodeId && !initialSelectionDone.current && sigma.getGraph().order > 0) {
      initialSelectionDone.current = true;
      requestAnimationFrame(() => {
        selectNode(initialNodeId);
        sigma.refresh();
      });
    }
  }, [initialNodeId, selectNode, sigma]);

  return null;
}

export function IcebergGraph({
  data,
  allNodeData,
  initialNodeId,
}: {
  data: GraphPayload;
  allNodeData: Record<string, SerializedNode>;
  initialNodeId?: string | null;
}) {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const graphEventsRef = useRef<GraphEventsHandle | null>(null);

  const selectedNode = useMemo(
    () => (selectedNodeId ? allNodeData[selectedNodeId] : null),
    [selectedNodeId, allNodeData]
  );

  const connectedNodes = useMemo(() => {
    if (!selectedNodeId) return [];
    return data.edges
      .filter(
        (e) => e.source === selectedNodeId || e.target === selectedNodeId
      )
      .map((e) => ({
        nodeId: e.source === selectedNodeId ? e.target : e.source,
        nodeName:
          allNodeData[
            e.source === selectedNodeId ? e.target : e.source
          ]?.name || "",
        nodeType:
          allNodeData[
            e.source === selectedNodeId ? e.target : e.source
          ]?.type || "engine",
        mode: e.mode,
        docSource: e.docSource,
      }));
  }, [selectedNodeId, data.edges, allNodeData]);

  return (
      <div className="relative w-full h-full graph-container" style={{ display: "flex" }} role="region" aria-label="Interactive graph showing Apache Iceberg interoperability between platforms, catalogs, and engines">
        <div
          style={{
            flex: 1,
            height: "100%",
            transition: "all 0.3s ease",
          }}
        >
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
              defaultEdgeColor: EDGE_COLOR_DEFAULT,
              labelColor: { color: "#e8e8ed" },
              labelFont: "Inter, system-ui, -apple-system, sans-serif",
              labelSize: 15,
              labelWeight: "500",
              labelRenderedSizeThreshold: 0,
              labelDensity: 4,
              labelGridCellSize: 50,
              renderEdgeLabels: false,
              enableEdgeEvents: false,
              stagePadding: 60,
              defaultEdgeType: "arrow",
              edgeProgramClasses: {
                arrow: CustomEdgeArrowProgram,
                "double-arrow": CustomEdgeDoubleArrowProgram,
              },
              allowInvalidContainer: true,
              defaultDrawNodeLabel: drawDarkLabel,
              defaultDrawNodeHover: drawHoverLabel,
            }}
          >
            <GraphLoader data={data} />
            <GraphEvents onSelectNode={setSelectedNodeId} eventsRef={graphEventsRef} initialNodeId={initialNodeId} />
            <ColumnHeaders />
          </SigmaContainer>
        </div>

        {selectedNode && (
          <div
            style={{
              width: "440px",
              flexShrink: 0,
              height: "100%",
              position: "relative",
            }}
          >
            <NodeDetailDrawer
              node={selectedNode}
              connections={connectedNodes}
              onClose={() => setSelectedNodeId(null)}
              onClickNode={(nodeId) => graphEventsRef.current?.selectNode(nodeId)}
            />
          </div>
        )}
      </div>
  );
}
