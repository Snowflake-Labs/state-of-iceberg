import { getAllNodes, getGraphEdges } from "@/lib/data";
import { buildGraphPayload } from "@/lib/graph-data";
import type { SerializedNode } from "@/lib/graph-data";
import { GraphPage } from "./GraphPage";

export default function Home() {
  const allNodes = getAllNodes();
  const edges = getGraphEdges();
  const graphPayload = buildGraphPayload(allNodes, edges);

  const allNodeData: Record<string, SerializedNode> = {};
  for (const node of graphPayload.nodes) {
    allNodeData[node.id] = node;
  }

  return <GraphPage data={graphPayload} allNodeData={allNodeData} />;
}
