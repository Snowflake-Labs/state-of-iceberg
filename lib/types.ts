export type NodeType = "catalog" | "engine" | "platform";

export type SupportStatus = "full" | "partial" | "preview" | "none" | "unknown";

export type SpecSupport = {
  v1: boolean;
  v2: boolean | "preview";
  v3: boolean | "preview";
};

export type CatalogIntegration = {
  catalog: string;
  mode: "read" | "write" | "read_write";
  auth?: string;
  notes?: string;
};

export type DmlSupport = {
  insert: SupportStatus;
  update: SupportStatus;
  delete: SupportStatus;
  merge: SupportStatus;
  truncate: SupportStatus;
  bulk_load?: string;
};

export type Capabilities = {
  schema_evolution: SupportStatus;
  type_widening: SupportStatus;
  partition_evolution: SupportStatus;
  hidden_partitioning: SupportStatus;
  time_travel: SupportStatus;
  position_deletes: SupportStatus;
  equality_deletes: SupportStatus;
  merge_on_read: SupportStatus;
  copy_on_write: SupportStatus;
  branching_tagging: SupportStatus;
  iceberg_views: SupportStatus;
  streaming_write: SupportStatus;
};

export type Maintenance = {
  auto_compaction: SupportStatus;
  manual_compaction: SupportStatus;
  snapshot_expiry: SupportStatus;
  orphan_cleanup: SupportStatus;
  manifest_rewrite: SupportStatus;
};

export type FileFormats = {
  parquet: boolean;
  orc: boolean | "read_only" | "ingest_only";
  avro: boolean | "read_only" | "ingest_only";
};

export type PlatformData = {
  id: string;
  name: string;
  type: NodeType;
  vendor?: string;
  open_source: boolean;
  website?: string;
  description: string;
  spec_support: SpecSupport;
  file_formats: FileFormats;
  dml: DmlSupport;
  capabilities: Capabilities;
  maintenance: Maintenance;
  catalog_integrations: CatalogIntegration[];
  notes?: string;
  last_verified: string;
};

export type CatalogData = {
  id: string;
  name: string;
  type: "catalog";
  vendor?: string;
  open_source: boolean;
  license?: string;
  website?: string;
  description: string;
  rest_api: SupportStatus;
  vended_credentials: boolean;
  multi_cloud: string[];
  view_support: SupportStatus;
  multi_table_transactions: SupportStatus;
  version_control: boolean;
  catalog_federation: SupportStatus;
  multi_format: string[];
  notes?: string;
  last_verified: string;
};
