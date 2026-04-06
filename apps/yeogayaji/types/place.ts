export type Place = {
  id: string;
  user_id: string;
  tab_id: string | null;
  naver_map_link: string;
  naver_map_code: string | null;
  place_name: string | null;
  description: string | null;
  is_recommended: boolean;
  sort_order: number;
  created_at: string;
  lat: number | null;
  lng: number | null;
  kakao_map_link: string | null;
};