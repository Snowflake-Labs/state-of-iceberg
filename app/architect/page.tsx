import { Suspense } from "react";
import { getAllNodes, getGraphEdges } from "@/lib/data";
import { buildGraphPayload } from "@/lib/graph-data";
import type { SerializedNode } from "@/lib/graph-data";
import { ArchitectPage } from "./ArchitectPage";

function ArchitectContent() {
  const allNodes = getAllNodes();
  const edges = getGraphEdges();
  const graphPayload = buildGraphPayload(allNodes, edges);

  const allNodeData: Record<string, SerializedNode> = {};
  for (const node of graphPayload.nodes) {
    allNodeData[node.id] = node;
  }

  return <ArchitectPage data={graphPayload} allNodeData={allNodeData} />;
}

export default function Architect() {
  return (
    <Suspense>
      <ArchitectContent />
    </Suspense>
  );
}
