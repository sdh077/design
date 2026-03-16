export type MerchantStatus = "ACTIVE" | "PENDING" | "INACTIVE";

export interface Merchant {
    id: string;
    name: string;
    ownerName: string;
    businessNumber: string;
    phone: string;
    status: MerchantStatus;
    createdAt: string;
}

export const merchants: Merchant[] = [
    {
        id: "m_001",
        name: "성수 브루 카페",
        ownerName: "김민수",
        businessNumber: "123-45-67890",
        phone: "010-1234-5678",
        status: "ACTIVE",
        createdAt: "2026-03-01T09:00:00.000Z",
    },
    {
        id: "m_002",
        name: "문래 로스터스",
        ownerName: "이서연",
        businessNumber: "234-56-78901",
        phone: "010-2345-6789",
        status: "PENDING",
        createdAt: "2026-03-05T09:00:00.000Z",
    },
    {
        id: "m_003",
        name: "해운대 커피랩",
        ownerName: "박지훈",
        businessNumber: "345-67-89012",
        phone: "010-3456-7890",
        status: "INACTIVE",
        createdAt: "2026-03-07T09:00:00.000Z",
    },
];