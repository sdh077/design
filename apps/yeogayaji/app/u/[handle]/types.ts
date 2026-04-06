export type PublicPlace = {
    id: string;
    place_name: string | null;
    naver_map_link: string;
    description: string | null;
    sort_order: number;
    created_at: string;
    tab_id: string | null;
    lat: number | null;
    lng: number | null;
    kakao_map_link: string | null;
};

export type PlaceTab = {
    id: string;
    name: string;
    is_default: boolean;
};
