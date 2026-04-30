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

import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import type { GraphPayload, SerializedNode } from "@/lib/graph-data";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import dynamic from "next/dynamic";
import { ArchitectPanel } from "@/components/architect/ArchitectPanel";

const ArchitectCanvas = dynamic(
  () =>
    import("@/components/architect/ArchitectCanvas").then(
      (mod) => mod.ArchitectCanvas
    ),
  { ssr: false }
);

export type Constraints = {
  minSpec: "any" | "v1" | "v2" | "v3";
  writeRequired: boolean;
  openSourceOnly: boolean;
};

function nodePassesConstraints(
  node: SerializedNode,
  constraints: Constraints
): boolean {
  if (constraints.openSourceOnly && !node.open_source) return false;

  if (constraints.minSpec !== "any" && node.spec_support) {
    const spec = node.spec_support;
    if (constraints.minSpec === "v3" && !spec.v3) return false;
    if (constraints.minSpec === "v2" && !spec.v2 && !spec.v3) return false;
    if (constraints.minSpec === "v1" && !spec.v1 && !spec.v2 && !spec.v3) return false;
  }

  return true;
}

function CopyArchitectLink() {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };

  return (
    <button
      onClick={handleCopy}
      style={{
        padding: "10px 22px",
        borderRadius: "10px",
        backgroundColor: copied ? "rgba(52,211,153,0.12)" : "rgba(17,17,25,0.7)",
        backdropFilter: "blur(8px)",
        border: copied ? "1px solid rgba(52,211,153,0.3)" : "1px solid rgba(255,255,255,0.06)",
        fontSize: "13px",
        fontWeight: 600,
        color: copied ? "#34d399" : "#9898b8",
        cursor: "pointer",
        transition: "all 0.15s",
      }}
      onMouseEnter={(e) => {
        if (!copied) {
          e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.08)";
          e.currentTarget.style.color = "#d0d0e0";
        }
      }}
      onMouseLeave={(e) => {
        if (!copied) {
          e.currentTarget.style.backgroundColor = "rgba(17,17,25,0.7)";
          e.currentTarget.style.color = "#9898b8";
        }
      }}
    >
      <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
      {copied ? (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      ) : (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
        </svg>
      )}
      {copied ? "Copied!" : "Share URL"}
    </span>
    </button>
  );
}

export function ArchitectPage({
  data,
  allNodeData,
}: {
  data: GraphPayload;
  allNodeData: Record<string, SerializedNode>;
}) {
  const searchParams = useSearchParams();
  const router = useRouter();

  const initialNodes = useMemo(() => {
    const param = searchParams.get("nodes");
    if (!param) return new Set<string>();
    const ids = param
      .split(",")
      .filter((id) => data.nodes.some((n) => n.id === id));
    return new Set(ids);
  }, []);

  const [placedNodeIds, setPlacedNodeIds] = useState<Set<string>>(initialNodes);
  const [constraints, setConstraints] = useState<Constraints>({
    minSpec: "any",
    writeRequired: false,
    openSourceOnly: false,
  });

  useEffect(() => {
    if (placedNodeIds.size === 0) {
      router.replace("/architect", { scroll: false });
    } else {
      const ids = Array.from(placedNodeIds).sort().join(",");
      router.replace(`/architect?nodes=${ids}`, { scroll: false });
    }
  }, [placedNodeIds, router]);

  const removeNode = useCallback((nodeId: string) => {
    setPlacedNodeIds((prev) => {
      const next = new Set(prev);
      next.delete(nodeId);
      return next;
    });
  }, []);

  const clearCanvas = useCallback(() => {
    setPlacedNodeIds(new Set());
  }, []);

  const placedNodes = useMemo(
    () => data.nodes.filter((n) => placedNodeIds.has(n.id)),
    [data.nodes, placedNodeIds]
  );

  const placedEdges = useMemo(() => {
    let edges = data.edges.filter(
      (e) => placedNodeIds.has(e.source) && placedNodeIds.has(e.target)
    );
    if (constraints.writeRequired) {
      edges = edges.filter((e) => e.mode === "read_write" || e.mode === "write");
    }
    return edges;
  }, [data.edges, placedNodeIds, constraints.writeRequired]);

  const missingEdges = useMemo(() => {
    const missing: { source: string; target: string }[] = [];
    const placedCatalogs = placedNodes.filter((n) => n.type === "catalog");
    const placedNonCatalogs = placedNodes.filter((n) => n.type !== "catalog");
    const edgeSet = new Set(
      placedEdges.map((e) => `${e.source}-${e.target}`)
    );
    const allEdgeSet = new Set(
      data.edges.map((e) => `${e.source}-${e.target}`)
    );

    for (const nc of placedNonCatalogs) {
      for (const cat of placedCatalogs) {
        const hasEdge =
          edgeSet.has(`${nc.id}-${cat.id}`) ||
          edgeSet.has(`${cat.id}-${nc.id}`) ||
          allEdgeSet.has(`${nc.id}-${cat.id}`) ||
          allEdgeSet.has(`${cat.id}-${nc.id}`);
        if (!hasEdge) {
          missing.push({ source: nc.id, target: cat.id });
        }
      }
    }
    return missing;
  }, [placedNodes, placedEdges, data.edges]);

  const conflictingNodeIds = useMemo(() => {
    const conflicts: Record<string, string> = {};
    for (const nodeId of placedNodeIds) {
      const node = allNodeData[nodeId];
      if (!node) continue;
      if (!nodePassesConstraints(node, constraints)) {
        if (constraints.minSpec !== "any" && node.spec_support) {
          const spec = node.spec_support;
          if (constraints.minSpec === "v3" && !spec.v3) {
            conflicts[nodeId] = `Does not support v3`;
          } else if (constraints.minSpec === "v2" && !spec.v2 && !spec.v3) {
            conflicts[nodeId] = `Does not support v2`;
          }
        }
        if (constraints.openSourceOnly && !node.open_source) {
          conflicts[nodeId] = conflicts[nodeId]
            ? `${conflicts[nodeId]}; Not open source`
            : "Not open source";
        }
      }
    }
    return conflicts;
  }, [placedNodeIds, allNodeData, constraints]);

  const allNodesByType = useMemo(
    () => ({
      platforms: data.nodes.filter((n) => n.type === "platform"),
      catalogs: data.nodes.filter((n) => n.type === "catalog"),
      engines: data.nodes.filter((n) => n.type === "engine"),
    }),
    [data.nodes]
  );

  const toggleNode = useCallback((nodeId: string) => {
    setPlacedNodeIds((prev) => {
      const next = new Set(prev);
      if (next.has(nodeId)) {
        next.delete(nodeId);
      } else {
        next.add(nodeId);
      }
      return next;
    });
  }, []);

  const isNodeDisabled = useCallback(
    (node: SerializedNode) => !nodePassesConstraints(node, constraints),
    [constraints]
  );

  const [showEdgeLabels, setShowEdgeLabels] = useState(true);

  const activeConstraintCount = useMemo(() => {
    let count = 0;
    if (constraints.minSpec !== "any") count++;
    if (constraints.writeRequired) count++;
    if (constraints.openSourceOnly) count++;
    return count;
  }, [constraints]);

  return (
    <div
      style={{
        height: "100vh",
        width: "100vw",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#08080d",
      }}
    >
      <Header />

      <main style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        <div
          className="graph-container"
          style={{ flex: 1, position: "relative", overflow: "hidden" }}
        >
          <ArchitectCanvas
            nodes={placedNodes}
            edges={placedEdges}
            onRemoveNode={removeNode}
            conflictingNodeIds={conflictingNodeIds}
            missingEdges={missingEdges}
            showEdgeLabels={showEdgeLabels}
          />

          {placedNodeIds.size > 0 && (
            <div
              style={{
                position: "absolute",
                bottom: "24px",
                right: "24px",
                zIndex: 40,
                display: "flex",
                gap: "8px",
              }}
            >
              <button
                onClick={() => setShowEdgeLabels((v) => !v)}
                style={{
                  padding: "10px 22px",
                  borderRadius: "10px",
                  backgroundColor: showEdgeLabels
                    ? "rgba(139,92,246,0.12)"
                    : "rgba(17,17,25,0.7)",
                  backdropFilter: "blur(8px)",
                  border: showEdgeLabels
                    ? "1px solid rgba(139,92,246,0.3)"
                    : "1px solid rgba(255,255,255,0.06)",
                  fontSize: "13px",
                  fontWeight: 600,
                  color: showEdgeLabels ? "#a78bfa" : "#9898b8",
                  cursor: "pointer",
                  transition: "all 0.15s",
                }}
              >
                Labels: {showEdgeLabels ? "On" : "Off"}
              </button>
              <button
                onClick={clearCanvas}
                style={{
                  padding: "10px 22px",
                  borderRadius: "10px",
                  backgroundColor: "rgba(17,17,25,0.7)",
                  backdropFilter: "blur(8px)",
                  border: "1px solid rgba(255,255,255,0.06)",
                  fontSize: "13px",
                  fontWeight: 600,
                  color: "#9898b8",
                  cursor: "pointer",
                  transition: "all 0.15s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.08)";
                  e.currentTarget.style.color = "#d0d0e0";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "rgba(17,17,25,0.7)";
                  e.currentTarget.style.color = "#9898b8";
                }}
              >
                Clear canvas
              </button>
              <CopyArchitectLink />
            </div>
          )}

          {placedNodeIds.size === 0 && (
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                zIndex: 40,
                padding: "16px 28px",
                borderRadius: "12px",
                backgroundColor: "rgba(17,17,25,0.7)",
                backdropFilter: "blur(8px)",
                border: "1px solid rgba(255,255,255,0.04)",
                textAlign: "center",
              }}
            >
              <p
                style={{
                  fontSize: "14px",
                  color: "#b0b0c8",
                  fontWeight: 500,
                  letterSpacing: "0.01em",
                }}
              >
                Select a platform, catalog, or engine from the panel to start
                building your architecture
              </p>
            </div>
          )}
        </div>

        <ArchitectPanel
          allNodes={allNodesByType}
          placedNodeIds={placedNodeIds}
          onToggleNode={toggleNode}
          constraints={constraints}
          onConstraintsChange={setConstraints}
          activeConstraintCount={activeConstraintCount}
          isNodeDisabled={isNodeDisabled}
        />
      </main>

      <Footer />
    </div>
  );
}
