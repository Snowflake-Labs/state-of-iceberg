# The State of Iceberg

An interactive explorer of Apache Iceberg interoperability across the modern data ecosystem. Discover which platforms, engines, and catalogs can connect — and how.

## Mission

The Iceberg ecosystem is mired in complexity that doesn't benefit the builders adopting it. No single vendor should claim to know all capabilities across all platforms. It should be the entire ecosystem's responsibility to educate builders. This tool exists to make Iceberg interoperability understandable, and the open-source model ensures accuracy is a shared responsibility — every vendor is the authority on their own data.

## Run Locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project Structure

```
├── app/                    # Next.js App Router pages
├── components/graph/       # Sigma.js graph, drawer, legend
├── data/
│   ├── catalogs/           # One YAML file per catalog (10)
│   ├── engines/            # One YAML file per engine (12)
│   └── platforms/          # One YAML file per platform (9)
├── lib/
│   ├── types.ts            # TypeScript type definitions
│   ├── data.ts             # YAML data loader
│   └── graph-data.ts       # Graph serialization helpers
└── AGENT.MD                # Agent instructions for AI-assisted development
```

## How the Data Works

All platform, engine, and catalog data lives in YAML files under `data/`. Each file follows a structured schema defining:

- **Identity**: name, type (catalog / engine / platform), vendor, open source status
- **Spec support**: which Iceberg spec versions (v1, v2, v3) are supported
- **DML**: which SQL operations are supported (INSERT, UPDATE, DELETE, MERGE)
- **Capabilities**: schema evolution, partition evolution, time travel, row-level deletes, branching/tagging, views, streaming
- **Maintenance**: compaction, snapshot expiry, orphan cleanup
- **Catalog integrations**: which catalogs this platform/engine connects to, and in what mode (read, write, read_write)

The YAML files are read at build time and used to generate the interactive graph and all detail views.

## Nodes

**Catalogs (10):** Polaris, Nessie, AWS Glue, HMS, Unity Catalog, S3 Tables, Lakekeeper, Gravitino, BigLake Metastore, OneLake

**Engines (12):** Spark, Trino, Presto, Flink, Hive, Impala, DuckDB, StarRocks, ClickHouse, Doris, Kafka Connect, RisingWave

**Platforms (9):** Snowflake, Databricks, BigQuery, Athena, Redshift, Fabric, Dremio, Cloudera CDP, Oracle

## Contributing

To update a platform's capabilities:

1. Edit the relevant YAML file in `data/`
2. Update the `last_verified` date
3. Submit a pull request

## Tech Stack

- [Next.js](https://nextjs.org) (App Router, TypeScript)
- [Sigma.js](https://www.sigmajs.org) + [Graphology](https://graphology.github.io) (graph visualization)
- [Tailwind CSS](https://tailwindcss.com) (styling)

## License

MIT
