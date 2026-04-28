# The State of Iceberg — Agent Instructions

## What This Project Is

"The State of Iceberg" is an interactive web app that visualizes Apache Iceberg interoperability across the modern data ecosystem. The hero experience is a three-column graph (platforms → catalogs → engines) where users click nodes to explore connections and read detailed capability data in a slide-out drawer.

The project serves as a public, open-source reference tool for architects building lakehouse architectures. It aims to be vendor-neutral, factually accurate, and visually polished.

## Tech Stack

- **Framework:** Next.js (App Router) + TypeScript
- **Graph:** Sigma.js (`@react-sigma/core`) + Graphology for WebGL graph rendering
- **Styling:** Inline styles (Tailwind is installed but inline styles are used for reliable rendering on the dark theme)
- **Font:** Inter (via `next/font/google`)
- **Data:** YAML files in `data/` parsed at build time with the `yaml` npm package

## Project Structure

```
app/
  layout.tsx          — Root layout, Inter font, metadata
  globals.css         — CSS variables, dark theme, radial gradient background
  page.tsx            — Server component that loads YAML data and passes to GraphPage
  GraphPage.tsx       — Client component with header, graph container, hint, footer

components/graph/
  IcebergGraph.tsx    — Main graph component (Sigma container, event handlers, layout)
  NodeDetailDrawer.tsx — Slide-out drawer with streaming description, spec badges, contextual connection sections
  ColumnHeaders.tsx   — "PLATFORMS" / "CATALOGS" / "ENGINES" labels above each column

components/architect/
  ArchitectCanvas.tsx — Architect mode graph (Sigma container, edge labels, conflict indicators, dashed edges)
  ArchitectPanel.tsx  — Side panel with component pills, constraint filters, tabs

components/layout/
  Header.tsx          — Shared header with Explore/Architect navigation

app/architect/
  page.tsx            — Server component that loads data for architect mode
  ArchitectPage.tsx   — Client component with canvas, panel, toolbar

data/
  catalogs/           — One YAML per catalog (10 files)
  engines/            — One YAML per engine (12 files)
  platforms/          — One YAML per platform (9 files)

lib/
  types.ts            — TypeScript type definitions for all YAML schemas
  data.ts             — YAML file reader, node/edge builders, color helpers
  graph-data.ts       — Graph serialization for client-side rendering
```

## Key Design Principles

1. **Vendor neutrality is paramount.** No editorial language in descriptions (no "robust," "comprehensive," "deep," "strong," etc.). All descriptions are factual. All lists are alphabetically sorted. No node is visually larger or more prominent than others of the same type.

2. **Catalogs are the center of the interoperability story.** The graph layout places catalogs in the center column. The thesis: interoperability is fundamentally a catalog problem, not a platform problem. The tool teaches this through its structure.

3. **Progressive disclosure.** Edges are hidden by default — they appear only when a node is clicked. The drawer provides detail on demand. This reduces visual noise and makes each click a moment of discovery.

4. **Three categories only: Platforms, Catalogs, Engines.** No "streaming" or "library" categories. If something connects to catalogs and reads/writes Iceberg, it's an engine. The simplicity is intentional.

5. **Full dark theme.** Background uses a radial gradient (`#111125` center → `#050508` edges) for depth. All text uses carefully chosen contrast levels — never pure white for body text, never too muted to read.

6. **No red in the color system.** Support status uses green (full), amber (partial/preview), gray (not supported). Red implies something is broken; absence of a feature is not an error.

## Graph Behavior

- **Layout:** Three fixed columns — platforms (x=-480), catalogs (x=0), engines (x=480). Nodes are alphabetically sorted top-to-bottom within each column. Vertical spacing is 110 units.
- **Node sizes:** Uniform within type. Catalogs = 26px, engines/platforms = 22px. All nodes are the same size within their type — no size encoding.
- **Edges:** Invisible by default (`rgba(255,255,255,0)`). On node click, only that node's edges appear at 0.6 opacity. Non-connected edges stay invisible.
- **Floating animation:** Nodes gently drift vertically using a sine wave (0.4 rad/s, 3px amplitude). X positions are locked to column alignment. Animation uses `requestAnimationFrame` with real timestamps.
- **Deterministic layout:** Initial positions use a seeded PRNG (`seededRandom("state-of-iceberg-v1")`), but with the column layout this is less relevant since positions are fixed.
- **Zoom:** Disabled (camera ratio locked at 1:1). Panning is still enabled.
- **Click handling:** `clickNode` selects/deselects. `clickStage` checks for label hit testing (clicking on a label text = clicking the node) before deselecting. Label hit testing uses approximate bounding boxes.
- **Selection:** Managed via `selectedNodeRef` (ref for synchronous access in event handlers) in `GraphEvents`. The parent `IcebergGraph` component uses `selectedNodeId` state for React rendering. The `GraphEventsHandle` ref exposes `selectNode()` for the drawer to trigger graph selection when connection rows are clicked.

## Drawer Behavior

- **Position:** Flexbox sibling to the graph container (not an overlay). When open, the graph shrinks and recenters.
- **Width:** 440px.
- **Streaming text:** On first click of a node (per session), the description streams word-by-word (75ms per word, 300ms initial delay). Subsequent clicks show text instantly. Tracked via a module-level `Set<string>`.
- **Contextual sections:** Connection sections change based on node type:
  - Platform/Engine drawers show "Supported Catalogs"
  - Catalog drawers show "Platforms" + "Engines" (split into two sections)
- **Clickable connections:** Every connection row is clickable. Clicking navigates the graph to that node (updates graph highlighting + drawer content). Enables traversal chains: Snowflake → Polaris → Trino → HMS → Hive.
- **Mode badges:** READ (blue), READ / WRITE (green), WRITE (amber) — colored pill badges.
- **Open Source badge:** Purple treatment with ✦ symbol.

## Edge Existence Criteria

An edge (entry in `catalog_integrations`) should exist between an engine/platform and a catalog if **either** condition is met:

1. **Native/SDK connector** — The engine/platform has a purpose-built, vendor-specific connector for that catalog (e.g., Spark's `HiveCatalog`, Athena's native Glue integration, Fabric's native OneLake integration).

2. **REST interoperability** — The engine/platform documents a **generic Iceberg REST catalog client** AND the catalog documents an **Iceberg REST catalog endpoint**. If both sides implement the standard, the edge is valid.

The absence of a per-pairing integration guide is **not** a reason to omit an edge. The Iceberg REST Catalog specification exists so that any compliant client can talk to any compliant server. Nuances like authentication mechanisms (SigV4 vs OAuth2), preview status, or read-only limitations are **constraints on the edge** (expressed via `mode`, `auth`, or `notes`), not reasons to exclude it. Write-only engines (Kafka Connect, RisingWave) should not connect to read-only catalogs (OneLake) since the edge would be nonsensical.

## Data Model

All platform/engine YAML files follow the `PlatformData` type. All catalog YAML files follow the `CatalogData` type. See `lib/types.ts` for full schemas.

Key fields for graph rendering:
- `id` — unique identifier, used as graph node ID
- `name` — display label
- `type` — "catalog" | "engine" | "platform"
- `catalog_integrations` — array of `{ catalog: string, mode: "read" | "write" | "read_write" }` — these generate graph edges

When adding a new platform/engine/catalog:
1. Create a YAML file in the appropriate `data/` subdirectory
2. Follow the exact schema from `lib/types.ts`
3. Set `last_verified` to the current date
4. The node will automatically appear in the graph on next build
5. If adding a catalog, update relevant platform/engine YAML files to add catalog integrations

## What's Built (as of March 29, 2026)

- Data model + 31 YAML files (10 catalogs, 12 engines, 9 platforms)
- Three-column graph with Sigma.js
- Slide-out drawer with streaming descriptions, spec badges, contextual connection sections
- Column headers
- Edges hidden by default, shown on click
- Clickable connection rows for graph traversal
- Deterministic layout
- Zoom disabled
- Footer disclaimer

## What's Not Built Yet

Key remaining items:
- Platform detail pages (`/platform/[id]`)
- Side-by-side comparator (`/compare?p=...`)
- Filterable capability matrix (`/matrix`)
- URL state encoding for shareability
- Command palette (Cmd+K)
- SEO / open graph tags
- Open-source prep (CONTRIBUTING.md, LICENSE, GitHub Actions)

## Style Guidelines

- Use **inline styles** for all component styling (Tailwind classes were unreliable on the dark theme)
- Secondary text colors: `#b0b0c8` for readable muted text, `#7878a0` for section headers and subtitles (minimum WCAG AA floor at 4.5:1 on dark backgrounds)
- Node colors (desaturated for dark mode): catalog `#d4942a`, engine `#2da87a`, platform `#5a8fd4`
- Column header colors (brighter): `#7eaae0`, `#e0ad4a`, `#4dc9a0`
- Background: radial gradient defined in `globals.css` via `.graph-container`
- Font: Inter, loaded via `next/font/google` with `--font-inter` CSS variable

## Running Locally

```bash
npm install
npm run dev
```

Open http://localhost:3000 (or the next available port).
