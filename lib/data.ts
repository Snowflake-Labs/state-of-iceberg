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

import fs from "fs";
import path from "path";
import yaml from "yaml";
import type { PlatformData, CatalogData } from "./types";

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

function getCatalogs(): CatalogData[] {
  return readYamlDir<CatalogData>("catalogs");
}

function getEngines(): PlatformData[] {
  return readYamlDir<PlatformData>("engines");
}

function getPlatforms(): PlatformData[] {
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
  docSource?: string;
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
        docSource: integration.source,
      });
    }
  }

  return edges;
}

