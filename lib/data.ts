import fs from "fs";
import path from "path";
import yaml from "yaml";
import type { PlatformData, CatalogData, NodeType } from "./types";

const DATA_DIR = path.join(process.cwd(), "data");

function readYamlDir<T>(subdir: string): T[] {
  const dir = path.join(DATA_DIR, subdir);
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".yaml") || f.endsWith(".yml"))
    .map((f) => {
      const raw = fs.readFileSync(path.join(dir, f), "utf-8");
      return yaml.parse(raw) as T;
    });
}

export function getCatalogs(): CatalogData[] {
  return readYamlDir<CatalogData>("catalogs");
}

export function getEngines(): PlatformData[] {
  return readYamlDir<PlatformData>("engines");
}

export function getPlatforms(): PlatformData[] {
  return readYamlDir<PlatformData>("platforms");
}

export function getAllNodes(): (PlatformData | CatalogData)[] {
  return [...getCatalogs(), ...getEngines(), ...getPlatforms()];
}

export type GraphEdge = {
  source: string;
  target: string;
  mode: "read" | "write" | "read_write";
  auth?: string;
  notes?: string;
};

export function getGraphEdges(): GraphEdge[] {
  const edges: GraphEdge[] = [];
  const nodesWithCatalogs = [...getEngines(), ...getPlatforms()];

  for (const node of nodesWithCatalogs) {
    if (!node.catalog_integrations) continue;
    for (const integration of node.catalog_integrations) {
      edges.push({
        source: node.id,
        target: integration.catalog,
        mode: integration.mode,
        auth: integration.auth,
        notes: integration.notes,
      });
    }
  }

  return edges;
}

export function getNodeById(
  id: string
): PlatformData | CatalogData | undefined {
  return getAllNodes().find((n) => n.id === id);
}

export function getNodeColor(type: NodeType | "catalog"): string {
  switch (type) {
    case "catalog":
      return "#f59e0b";
    case "engine":
      return "#10b981";
    case "platform":
      return "#3b82f6";
    default:
      return "#6b7280";
  }
}

export function getNodeTypeLabel(type: NodeType | "catalog"): string {
  switch (type) {
    case "catalog":
      return "Catalog";
    case "engine":
      return "Engine";
    case "platform":
      return "Platform";
    default:
      return "Unknown";
  }
}
