"use client";

import { useSigma } from "@react-sigma/core";
import { useEffect, useState } from "react";

const COLUMNS = [
  { x: -480, label: "Platforms", color: "#7eaae0" },
  { x: 0, label: "Catalogs", color: "#e0ad4a" },
  { x: 480, label: "Engines", color: "#4dc9a0" },
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
