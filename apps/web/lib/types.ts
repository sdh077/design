export type StoreRow = {
  id: string;
  workspace_id: string;
  name: string;
  code: string | null;
  timezone: string;
  created_at: string;
};

export type PosConnectionRow = {
  id: string;
  store_id: string;
  provider: "TOSS_PLACE";
  merchant_id: string;
  access_key: string;
  secret_key: string;
  is_active: boolean;
  last_catalog_sync_at: string | null;
  last_order_sync_at: string | null;
  created_at: string;
};

export type ExternalCatalogItemRow = {
  id: string;
  store_id: string;
  provider: "TOSS_PLACE";
  external_item_id: string;
  title: string;
  code: string | null;
  description: string | null;
  image_url: string | null;
  raw_json: Record<string, unknown>;
  synced_at: string;
};

export type ExternalOrderRow = {
  id: string;
  store_id: string;
  provider: "TOSS_PLACE";
  external_order_id: string;
  order_state: string;
  ordered_at: string;
  completed_at: string | null;
  cancelled_at: string | null;
  total_amount: number | null;
  raw_json: Record<string, unknown>;
  synced_at: string;
};