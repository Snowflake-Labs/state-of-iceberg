import type { PlatformData, CatalogData } from "./types";
import type { GraphEdge } from "./data";

export type SerializedNode = {
  id: string;
  name: string;
  type: "catalog" | "engine" | "platform";
  description: string;
  spec_support?: { v1: boolean; v2: boolean | "preview"; v3: boolean | "preview" };
  vendor?: string;
  open_source: boolean;
};

export type SerializedEdge = GraphEdge;

export type GraphPayload = {
  nodes: SerializedNode[];
  edges: SerializedEdge[];
};

export function buildGraphPayload(
  allNodes: (PlatformData | CatalogData)[],
  edges: GraphEdge[]
): GraphPayload {
  const nodes: SerializedNode[] = allNodes.map((n) => ({
    id: n.id,
    name: n.name,
    type: n.type as "catalog" | "engine" | "platform",
    description: n.description,
    spec_support: "spec_support" in n ? (n as PlatformData).spec_support : undefined,
    vendor: n.vendor,
    open_source: n.open_source,
  }));

  return { nodes, edges };
}
