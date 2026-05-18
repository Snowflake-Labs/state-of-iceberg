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

import { useEffect, useState } from "react";
import type { SerializedNode } from "@/lib/graph-data";

type Connection = {
  nodeId: string;
  nodeName: string;
  nodeType: string;
  mode: "read" | "write" | "read_write";
};

const TYPE_BG: Record<string, string> = {
  catalog: "bg-amber-400/10 text-amber-400 border-amber-400/25",
  engine: "bg-emerald-400/10 text-emerald-400 border-emerald-400/25",
  platform: "bg-blue-400/10 text-blue-400 border-blue-400/25",
};

const MODE_LABELS: Record<string, string> = {
  read: "Read",
  write: "Write",
  read_write: "Read / Write",
};

const DOT_COLORS: Record<string, string> = {
  catalog: "#d4942a",
  engine: "#2da87a",
  platform: "#5a8fd4",
};

function SpecBadge({ v, label }: { v: boolean | "preview"; label: string }) {
  if (v === false) return null;
  const isPreview = v === "preview";
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        padding: "6px 14px",
        borderRadius: "8px",
        fontSize: "14px",
        fontWeight: 600,
        border: `1px solid ${isPreview ? "rgba(251,191,36,0.2)" : "rgba(52,211,153,0.2)"}`,
        backgroundColor: isPreview ? "rgba(251,191,36,0.08)" : "rgba(52,211,153,0.08)",
        color: isPreview ? "#fbbf24" : "#34d399",
      }}
    >
      {label}
      {isPreview && (
        <span style={{ fontSize: "11px", fontWeight: 400, opacity: 0.6 }}>
          preview
        </span>
      )}
    </div>
  );
}

function CopyLinkButton({ nodeId }: { nodeId: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const url = `${window.location.origin}/?node=${encodeURIComponent(nodeId)}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };

  return (
    <button
      onClick={handleCopy}
      style={{
        color: copied ? "#34d399" : "var(--text-muted)",
        padding: "8px",
        borderRadius: "8px",
        border: "none",
        background: "transparent",
        cursor: "pointer",
        transition: "color 0.15s",
      }}
      onMouseEnter={(e) => {
        if (!copied) {
          e.currentTarget.style.color = "var(--text-bright)";
          e.currentTarget.style.backgroundColor = "var(--bg-row-hover)";
        }
      }}
      onMouseLeave={(e) => {
        if (!copied) {
          e.currentTarget.style.color = "var(--text-muted)";
        }
        e.currentTarget.style.backgroundColor = "transparent";
      }}
      aria-label={copied ? "Link copied" : "Copy link"}
      title={copied ? "Copied!" : "Copy link"}
    >
      {copied ? (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      ) : (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
        </svg>
      )}
    </button>
  );
}

function ConnectionSection({
  title,
  subtitle,
  items,
  onClickNode,
}: {
  title: string;
  subtitle: string;
  items: Connection[];
  onClickNode?: (nodeId: string) => void;
}) {
  return (
    <div>
      <h3
        style={{
          fontSize: "11px",
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "0.16em",
          color: "var(--text-muted)",
          marginBottom: "6px",
        }}
      >
        {title}{" "}
        <span style={{ color: "var(--text-muted)", marginLeft: "4px" }}>
          ({items.length})
        </span>
      </h3>
      <p
        style={{
          fontSize: "13px",
          color: "var(--text-muted)",
          marginBottom: "14px",
          lineHeight: 1.5,
        }}
      >
        {subtitle}
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {[...items].sort((a, b) => a.nodeName.localeCompare(b.nodeName)).map((conn) => (
          <div
            key={conn.nodeId}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "14px 18px",
              borderRadius: "12px",
              backgroundColor: "var(--bg-row)",
              border: "1px solid var(--border-row)",
              transition: "background-color 0.15s, border-color 0.15s",
              cursor: onClickNode ? "pointer" : "default",
            }}
            onClick={() => onClickNode?.(conn.nodeId)}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "var(--bg-row-hover)";
              e.currentTarget.style.borderColor = "var(--border-row-hover)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "var(--bg-row)";
              e.currentTarget.style.borderColor = "var(--border-row)";
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <span
                style={{
                  width: "10px",
                  height: "10px",
                  borderRadius: "50%",
                  flexShrink: 0,
                  backgroundColor: DOT_COLORS[conn.nodeType] || "#6b7280",
                }}
              />
              <span
                style={{
                  fontSize: "15px",
                  fontWeight: 500,
                  color: "var(--text-node-name)",
                }}
              >
                {conn.nodeName}
              </span>
            </div>
            <span
              style={{
                fontSize: "10px",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                flexShrink: 0,
                marginLeft: "12px",
                padding: "4px 10px",
                borderRadius: "6px",
                ...(conn.mode === "read_write"
                  ? {
                      backgroundColor: "rgba(52,211,153,0.12)",
                      color: "#34d399",
                      border: "1px solid rgba(52,211,153,0.2)",
                    }
                  : conn.mode === "read"
                  ? {
                      backgroundColor: "rgba(96,165,250,0.12)",
                      color: "#60a5fa",
                      border: "1px solid rgba(96,165,250,0.2)",
                    }
                  : {
                      backgroundColor: "rgba(251,191,36,0.12)",
                      color: "#fbbf24",
                      border: "1px solid rgba(251,191,36,0.2)",
                    }),
              }}
            >
              {MODE_LABELS[conn.mode]}
            </span>
          </div>
        ))}
        {items.length === 0 && (
          <div
            style={{
              padding: "20px 18px",
              borderRadius: "12px",
              backgroundColor: "var(--bg-row)",
              border: "1px solid var(--border-row)",
              textAlign: "center",
            }}
          >
            <p style={{ fontSize: "14px", color: "var(--text-muted)" }}>None</p>
          </div>
        )}
      </div>
    </div>
  );
}

export function NodeDetailDrawer({
  node,
  connections,
  onClose,
  onClickNode,
}: {
  node: SerializedNode;
  connections: Connection[];
  onClose: () => void;
  onClickNode?: (nodeId: string) => void;
}) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const typeBg = TYPE_BG[node.type] || "bg-gray-400/10 text-gray-400 border-gray-400/20";

  const sortedConnections = [...connections].sort((a, b) => {
    const order: Record<string, number> = { catalog: 0, engine: 1, platform: 2 };
    return (order[a.nodeType] ?? 3) - (order[b.nodeType] ?? 3);
  });

  return (
    <aside
      aria-label={`${node.name} details`}
      style={{
        position: "absolute",
        right: 0,
        top: 0,
        height: "100%",
        width: "100%",
        backgroundColor: "var(--bg-surface)",
        backdropFilter: "blur(16px)",
        borderLeft: "1px solid var(--border-subtle)",
        overflowY: "auto",
        zIndex: 50,
        boxShadow: "-20px 0 60px var(--shadow)",
      }}
    >
      {/* Header */}
      <div
        style={{
          position: "sticky",
          top: 0,
          backgroundColor: "var(--bg-surface)",
          backdropFilter: "blur(16px)",
          borderBottom: "1px solid var(--border-subtle)",
          padding: "28px 32px",
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
            <span
              className={typeBg}
              style={{
                display: "inline-flex",
                alignItems: "center",
                padding: "4px 12px",
                borderRadius: "6px",
                fontSize: "10px",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.15em",
                borderWidth: "1px",
                borderStyle: "solid",
              }}
            >
              {node.type}
            </span>
            {node.open_source && (
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  padding: "4px 12px",
                  borderRadius: "6px",
                  fontSize: "10px",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.12em",
                  backgroundColor: "rgba(139,92,246,0.12)",
                  color: "var(--accent-text)",
                  border: "1px solid rgba(139,92,246,0.25)",
                }}
              >
                ✦ Open Source
              </span>
            )}
          </div>
          <h2
            style={{
              fontSize: "26px",
              fontWeight: 700,
              color: "var(--text-bright)",
              letterSpacing: "-0.02em",
              lineHeight: 1.2,
            }}
          >
            {node.name}
          </h2>
          {node.vendor && (
            <p style={{ fontSize: "14px", color: "var(--text-secondary)", marginTop: "6px" }}>
              {node.vendor}
            </p>
          )}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "4px", marginRight: "-4px", marginTop: "-4px" }}>
          <CopyLinkButton nodeId={node.id} />
          <button
            onClick={onClose}
            style={{
              color: "var(--text-muted)",
              padding: "8px",
              borderRadius: "8px",
              border: "none",
              background: "transparent",
              cursor: "pointer",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "var(--text-bright)";
              e.currentTarget.style.backgroundColor = "var(--bg-row-hover)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "var(--text-muted)";
              e.currentTarget.style.backgroundColor = "transparent";
            }}
            aria-label="Close"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: "32px" }}>
        {/* Description */}
        <p
          style={{
            fontSize: "15px",
            color: "var(--text-description)",
            lineHeight: 1.75,
            marginBottom: "32px",
          }}
        >
          {node.description}
        </p>

        {/* Spec Version */}
        {node.spec_support && (
          <div style={{ marginBottom: "32px" }}>
            <h3
              style={{
                fontSize: "11px",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.16em",
                color: "var(--text-muted)",
                marginBottom: "14px",
              }}
            >
              Spec Version Support
            </h3>
            <div style={{ display: "flex", gap: "10px" }}>
              <SpecBadge v={node.spec_support.v1} label="v1" />
              <SpecBadge v={node.spec_support.v2} label="v2" />
              <SpecBadge v={node.spec_support.v3} label="v3" />
            </div>
          </div>
        )}

        {/* Divider */}
        <div
          style={{
            height: "1px",
            backgroundColor: "var(--border-row)",
            marginBottom: "32px",
          }}
        />

        {/* Contextual connection sections */}
        {node.type === "platform" && (
          <ConnectionSection
            title="Supported Catalogs"
            subtitle="Catalogs this platform can integrate with for Iceberg interoperability"
            items={sortedConnections.filter((c) => c.nodeType === "catalog")}
            onClickNode={onClickNode}
          />
        )}

        {node.type === "engine" && (
          <ConnectionSection
            title="Supported Catalogs"
            subtitle="Catalogs this engine can connect to"
            items={sortedConnections.filter((c) => c.nodeType === "catalog")}
            onClickNode={onClickNode}
          />
        )}

        {node.type === "catalog" && (
          <>
            <ConnectionSection
              title="Platforms"
              subtitle="Platforms that integrate with this catalog"
              items={sortedConnections.filter((c) => c.nodeType === "platform")}
              onClickNode={onClickNode}
            />
            <div style={{ height: "28px" }} />
            <ConnectionSection
              title="Engines"
              subtitle="Engines that connect to this catalog"
              items={sortedConnections.filter((c) => c.nodeType === "engine")}
              onClickNode={onClickNode}
            />
          </>
        )}
      </div>
    </aside>
  );
}
