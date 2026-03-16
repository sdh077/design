export type MerchantStatus = "ACTIVE" | "PENDING" | "INACTIVE";

export interface Merchant {
    id: string;
    name: string;
    owner_name: string;
    business_number: string;
    phone: string | null;
    email: string | null;
    status: MerchantStatus;
    created_at: string;
}