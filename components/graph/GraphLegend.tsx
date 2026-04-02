"use client";

const LEGEND_ITEMS = [
  { color: "#d4942a", label: "Catalog" },
  { color: "#2da87a", label: "Engine" },
  { color: "#5a8fd4", label: "Platform" },
];

export function GraphLegend() {
  return (
    <div className="absolute bottom-6 left-8 z-40 flex items-center gap-6 px-5 py-3 rounded-xl bg-[#111119]/70 backdrop-blur-sm border border-white/[0.04]">
      {LEGEND_ITEMS.map((item) => (
        <div key={item.label} className="flex items-center gap-2.5">
          <span style={{ width: "12px", height: "12px", borderRadius: "50%", backgroundColor: item.color }} />
          <span className="text-[13px] text-[#9898b8] font-medium tracking-wide">
            {item.label}
          </span>
        </div>
      ))}
    </div>
  );
}
