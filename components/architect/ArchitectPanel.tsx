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

import { useState } from "react";
import type { SerializedNode } from "@/lib/graph-data";
import type { Constraints } from "@/app/architect/ArchitectPage";

const SECTION_COLORS: Record<string, string> = {
  platforms: "#5a8fd4",
  catalogs: "#d4942a",
  engines: "#2da87a",
};

const SECTION_LABELS: Record<string, string> = {
  platforms: "Platforms",
  catalogs: "Catalogs",
  engines: "Engines",
};

function PillButton({
  node,
  color,
  onClick,
  disabled,
  placed,
}: {
  node: SerializedNode;
  color: string;
  onClick: () => void;
  disabled: boolean;
  placed: boolean;
}) {
  const bgDefault = placed
    ? `rgba(${parseInt(color.slice(1, 3), 16)},${parseInt(color.slice(3, 5), 16)},${parseInt(color.slice(5, 7), 16)},0.12)`
    : disabled
      ? "rgba(255,255,255,0.01)"
      : "rgba(255,255,255,0.02)";
  const borderDefault = placed
    ? `1px solid ${color}40`
    : "1px solid rgba(255,255,255,0.04)";

  return (
    <button
      onClick={disabled && !placed ? undefined : onClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "10px",
        width: "100%",
        padding: "10px 14px",
        borderRadius: "10px",
        backgroundColor: bgDefault,
        border: borderDefault,
        color: placed ? "#ffffff" : disabled ? "#3a3a50" : "#d0d0e0",
        fontSize: "14px",
        fontWeight: placed ? 600 : 500,
        cursor: disabled && !placed ? "not-allowed" : "pointer",
        textAlign: "left",
        transition: "all 0.15s",
        opacity: disabled && !placed ? 0.5 : 1,
      }}
      onMouseEnter={(e) => {
        if (!disabled || placed) {
          e.currentTarget.style.backgroundColor = placed
            ? `rgba(${parseInt(color.slice(1, 3), 16)},${parseInt(color.slice(3, 5), 16)},${parseInt(color.slice(5, 7), 16)},0.18)`
            : "rgba(255,255,255,0.06)";
          e.currentTarget.style.borderColor = placed ? `${color}60` : "rgba(255,255,255,0.1)";
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = bgDefault;
        e.currentTarget.style.borderColor = placed ? `${color}40` : "rgba(255,255,255,0.04)";
      }}
    >
      <span
        style={{
          width: "8px",
          height: "8px",
          borderRadius: "50%",
          backgroundColor: disabled && !placed ? "#3a3a50" : color,
          flexShrink: 0,
        }}
      />
      {node.name}
      {placed && (
        <span
          style={{
            marginLeft: "auto",
            fontSize: "11px",
            color: "#7878a0",
            fontWeight: 500,
          }}
        >
          ✓
        </span>
      )}
    </button>
  );
}

const SPEC_OPTIONS: { value: Constraints["minSpec"]; label: string }[] = [
  { value: "any", label: "Any" },
  { value: "v1", label: "v1+" },
  { value: "v2", label: "v2+" },
  { value: "v3", label: "v3+" },
];

function ConstraintsView({
  constraints,
  onConstraintsChange,
}: {
  constraints: Constraints;
  onConstraintsChange: (c: Constraints) => void;
}) {
  const hasAny =
    constraints.minSpec !== "any" ||
    constraints.writeRequired ||
    constraints.openSourceOnly;

  return (
    <div style={{ padding: "24px" }}>
      {hasAny && (
        <div style={{ marginBottom: "20px" }}>
          <button
            onClick={() =>
              onConstraintsChange({
                minSpec: "any",
                writeRequired: false,
                openSourceOnly: false,
              })
            }
            style={{
              padding: "7px 16px",
              borderRadius: "8px",
              fontSize: "12px",
              fontWeight: 600,
              cursor: "pointer",
              border: "1px solid rgba(255,255,255,0.08)",
              backgroundColor: "rgba(255,255,255,0.03)",
              color: "#9898b8",
              transition: "all 0.15s",
              width: "100%",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.06)";
              e.currentTarget.style.color = "#d0d0e0";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.03)";
              e.currentTarget.style.color = "#9898b8";
            }}
          >
            Clear all constraints
          </button>
        </div>
      )}
      {/* Spec Version */}
      <div style={{ marginBottom: "28px" }}>
        <h3
          style={{
            fontSize: "11px",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.16em",
            color: "#7878a0",
            marginBottom: "6px",
          }}
        >
          Minimum Spec Version
        </h3>
        <p
          style={{
            fontSize: "12px",
            color: "#7878a0",
            marginBottom: "12px",
            lineHeight: 1.5,
          }}
        >
          Filter components by minimum Iceberg spec version
        </p>
        <div style={{ display: "flex", gap: "6px" }}>
          {SPEC_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() =>
                onConstraintsChange({ ...constraints, minSpec: opt.value })
              }
              style={{
                padding: "7px 16px",
                borderRadius: "8px",
                fontSize: "13px",
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.15s",
                border:
                  constraints.minSpec === opt.value
                    ? "1px solid rgba(139,92,246,0.4)"
                    : "1px solid rgba(255,255,255,0.06)",
                backgroundColor:
                  constraints.minSpec === opt.value
                    ? "rgba(139,92,246,0.15)"
                    : "rgba(255,255,255,0.02)",
                color:
                  constraints.minSpec === opt.value ? "#a78bfa" : "#8888a8",
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Write Support */}
      <div style={{ marginBottom: "28px" }}>
        <h3
          style={{
            fontSize: "11px",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.16em",
            color: "#7878a0",
            marginBottom: "6px",
          }}
        >
          Write Support Required
        </h3>
        <p
          style={{
            fontSize: "12px",
            color: "#7878a0",
            marginBottom: "12px",
            lineHeight: 1.5,
          }}
        >
          Hide read-only integrations between components
        </p>
        <button
          onClick={() =>
            onConstraintsChange({
              ...constraints,
              writeRequired: !constraints.writeRequired,
            })
          }
          style={{
            padding: "7px 16px",
            borderRadius: "8px",
            fontSize: "13px",
            fontWeight: 600,
            cursor: "pointer",
            transition: "all 0.15s",
            border: constraints.writeRequired
              ? "1px solid rgba(139,92,246,0.4)"
              : "1px solid rgba(255,255,255,0.06)",
            backgroundColor: constraints.writeRequired
              ? "rgba(139,92,246,0.15)"
              : "rgba(255,255,255,0.02)",
            color: constraints.writeRequired ? "#a78bfa" : "#8888a8",
          }}
        >
          {constraints.writeRequired ? "On" : "Off"}
        </button>
      </div>

      {/* Open Source Only */}
      <div>
        <h3
          style={{
            fontSize: "11px",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.16em",
            color: "#7878a0",
            marginBottom: "6px",
          }}
        >
          Open Source Only
        </h3>
        <p
          style={{
            fontSize: "12px",
            color: "#7878a0",
            marginBottom: "12px",
            lineHeight: 1.5,
          }}
        >
          Show only open-source components
        </p>
        <button
          onClick={() =>
            onConstraintsChange({
              ...constraints,
              openSourceOnly: !constraints.openSourceOnly,
            })
          }
          style={{
            padding: "7px 16px",
            borderRadius: "8px",
            fontSize: "13px",
            fontWeight: 600,
            cursor: "pointer",
            transition: "all 0.15s",
            border: constraints.openSourceOnly
              ? "1px solid rgba(139,92,246,0.4)"
              : "1px solid rgba(255,255,255,0.06)",
            backgroundColor: constraints.openSourceOnly
              ? "rgba(139,92,246,0.15)"
              : "rgba(255,255,255,0.02)",
            color: constraints.openSourceOnly ? "#a78bfa" : "#8888a8",
          }}
        >
          {constraints.openSourceOnly ? "On" : "Off"}
        </button>
      </div>
    </div>
  );
}

export function ArchitectPanel({
  allNodes,
  placedNodeIds,
  onToggleNode,
  constraints,
  onConstraintsChange,
  activeConstraintCount,
  isNodeDisabled,
}: {
  allNodes: {
    platforms: SerializedNode[];
    catalogs: SerializedNode[];
    engines: SerializedNode[];
  };
  placedNodeIds: Set<string>;
  onToggleNode: (nodeId: string) => void;
  constraints: Constraints;
  onConstraintsChange: (c: Constraints) => void;
  activeConstraintCount: number;
  isNodeDisabled: (node: SerializedNode) => boolean;
}) {
  const [activeTab, setActiveTab] = useState<"components" | "constraints">(
    "components"
  );

  const sections = [
    { key: "platforms", nodes: allNodes.platforms },
    { key: "catalogs", nodes: allNodes.catalogs },
    { key: "engines", nodes: allNodes.engines },
  ] as const;

  return (
    <div
      style={{
        width: "340px",
        flexShrink: 0,
        height: "100%",
        backgroundColor: "rgba(14, 14, 22, 0.95)",
        backdropFilter: "blur(16px)",
        borderLeft: "1px solid rgba(255,255,255,0.06)",
        overflowY: "auto",
        boxShadow: "-20px 0 60px rgba(0,0,0,0.5)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Tabs */}
      <div
        style={{
          display: "flex",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          flexShrink: 0,
        }}
      >
        <button
          onClick={() => setActiveTab("components")}
          style={{
            flex: 1,
            padding: "14px 0",
            fontSize: "13px",
            fontWeight: 600,
            cursor: "pointer",
            border: "none",
            borderBottom:
              activeTab === "components"
                ? "2px solid #ffffff"
                : "2px solid transparent",
            backgroundColor: "transparent",
            color: activeTab === "components" ? "#ffffff" : "#7878a0",
            transition: "all 0.15s",
          }}
        >
          Components
        </button>
        <button
          onClick={() => setActiveTab("constraints")}
          style={{
            flex: 1,
            padding: "14px 0",
            fontSize: "13px",
            fontWeight: 600,
            cursor: "pointer",
            border: "none",
            borderBottom:
              activeTab === "constraints"
                ? "2px solid #ffffff"
                : "2px solid transparent",
            backgroundColor: "transparent",
            color: activeTab === "constraints" ? "#ffffff" : "#7878a0",
            transition: "all 0.15s",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
          }}
          title={
            activeConstraintCount > 0
              ? `${activeConstraintCount} constraint${activeConstraintCount > 1 ? "s" : ""} active`
              : undefined
          }
        >
          Constraints
          {activeConstraintCount > 0 && (
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: "20px",
                height: "20px",
                borderRadius: "50%",
                backgroundColor: "rgba(139,92,246,0.2)",
                color: "#a78bfa",
                fontSize: "11px",
                fontWeight: 700,
              }}
            >
              {activeConstraintCount}
            </span>
          )}
        </button>
      </div>

      {/* Tab Content */}
      <div style={{ flex: 1, overflowY: "auto" }}>
        {activeTab === "components" && (
          <>
            <div style={{ padding: "16px 24px 8px" }}>
              <p
                style={{
                  fontSize: "12px",
                  color: "#7878a0",
                  lineHeight: 1.5,
                }}
              >
                Click to start building your architecture
              </p>
            </div>

            {sections.map(({ key, nodes }) => (
              <div key={key} style={{ padding: "12px 24px" }}>
                <h3
                  style={{
                    fontSize: "11px",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.16em",
                    color: SECTION_COLORS[key],
                    marginBottom: "10px",
                  }}
                >
                  {SECTION_LABELS[key]}
                  <span style={{ color: "#7878a0", marginLeft: "6px" }}>
                    ({nodes.filter((n) => placedNodeIds.has(n.id)).length}/{nodes.length})
                  </span>
                </h3>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "6px",
                  }}
                >
                  {[...nodes]
                    .sort((a, b) => a.name.localeCompare(b.name))
                    .map((node) => (
                      <PillButton
                        key={node.id}
                        node={node}
                        color={SECTION_COLORS[key]}
                        onClick={() => onToggleNode(node.id)}
                        disabled={isNodeDisabled(node)}
                        placed={placedNodeIds.has(node.id)}
                      />
                    ))}
                </div>
              </div>
            ))}
          </>
        )}

        {activeTab === "constraints" && (
          <ConstraintsView
            constraints={constraints}
            onConstraintsChange={onConstraintsChange}
          />
        )}
      </div>
    </div>
  );
}
