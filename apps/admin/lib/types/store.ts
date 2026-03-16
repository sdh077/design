export type StoreStatus = "ACTIVE" | "PENDING" | "INACTIVE";

export interface Store {
    id: string;
    workspace_id: string | null;
    name: string;
    code: string | null;
    timezone: string;
    created_at: string;
    updated_at: string;
    merchant_id: string;
    address: string | null;
    phone: string | null;
    status: StoreStatus | null;
}