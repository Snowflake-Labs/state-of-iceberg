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

import { useSigma } from "@react-sigma/core";
import { useEffect, useState } from "react";

const COLUMNS = [
  { x: -480, label: "Platforms", color: "var(--column-header-platform)" },
  { x: 0, label: "Catalogs", color: "var(--column-header-catalog)" },
  { x: 480, label: "Engines", color: "var(--column-header-engine)" },
];

export function ColumnHeaders() {
  const sigma = useSigma();
  const [positions, setPositions] = useState<{ x: number; label: string; color: string }[]>([]);

  useEffect(() => {
    const update = () => {
      const mapped = COLUMNS.map((col) => {
        const vp = sigma.graphToViewport({ x: col.x, y: 0 });
        return { x: vp.x, label: col.label, color: col.color };
      });
      setPositions(mapped);
    };

    update();
    sigma.on("afterRender", update);
    return () => {
      sigma.off("afterRender", update);
    };
  }, [sigma]);

  if (positions.length === 0) return null;

  return (
    <>
      {positions.map((pos) => (
        <div
          key={pos.label}
          style={{
            position: "absolute",
            left: `${pos.x}px`,
            top: "16px",
            transform: "translateX(-50%)",
            zIndex: 40,
            pointerEvents: "none",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "6px",
          }}
        >
          <span
            style={{
              fontSize: "12px",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.18em",
              color: pos.color,
              opacity: 1,
            }}
          >
            {pos.label}
          </span>
        </div>
      ))}
    </>
  );
}
