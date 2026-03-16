export type MerchantAccountRole = "OWNER" | "MANAGER" | "STAFF";
export type MerchantAccountStatus = "ACTIVE" | "PENDING" | "INACTIVE";

export interface MerchantAccount {
    id: string;
    merchant_id: string;
    name: string;
    email: string;
    role: MerchantAccountRole;
    status: MerchantAccountStatus;
    created_at: string;
}