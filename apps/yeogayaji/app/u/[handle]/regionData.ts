type Bounds = { minLat: number; maxLat: number; minLng: number; maxLng: number };

export type Zone = { id: string; name: string; bounds: Bounds };
export type Region = { id: string; name: string; bounds: Bounds; zones?: Zone[] };

export const REGIONS: Region[] = [
  {
    id: "seoul",
    name: "서울",
    bounds: { minLat: 37.42, maxLat: 37.71, minLng: 126.76, maxLng: 127.18 },
    zones: [
      { id: "seoul-1", name: "1권역 도심\n종로·중구·용산", bounds: { minLat: 37.52, maxLat: 37.60, minLng: 126.96, maxLng: 127.01 } },
      { id: "seoul-2", name: "2권역 서북\n은평·서대문·마포", bounds: { minLat: 37.55, maxLat: 37.65, minLng: 126.88, maxLng: 126.97 } },
      { id: "seoul-3", name: "3권역 동북\n강북·도봉·노원", bounds: { minLat: 37.62, maxLat: 37.71, minLng: 127.01, maxLng: 127.10 } },
      { id: "seoul-4", name: "4권역 동북\n성북·동대문·중랑", bounds: { minLat: 37.57, maxLat: 37.65, minLng: 127.02, maxLng: 127.13 } },
      { id: "seoul-5", name: "5권역 동부\n성동·광진", bounds: { minLat: 37.52, maxLat: 37.58, minLng: 127.03, maxLng: 127.13 } },
      { id: "seoul-6", name: "6권역 서부\n강서·양천", bounds: { minLat: 37.52, maxLat: 37.60, minLng: 126.80, maxLng: 126.90 } },
      { id: "seoul-7", name: "7권역 서남\n영등포·구로·금천", bounds: { minLat: 37.46, maxLat: 37.54, minLng: 126.85, maxLng: 126.93 } },
      { id: "seoul-8", name: "8권역 남부\n동작·관악·서초", bounds: { minLat: 37.46, maxLat: 37.52, minLng: 126.93, maxLng: 127.04 } },
      { id: "seoul-9", name: "9권역 동남\n강남·송파·강동", bounds: { minLat: 37.47, maxLat: 37.57, minLng: 127.04, maxLng: 127.18 } },
    ],
  },
  { id: "gyeonggi", name: "경기", bounds: { minLat: 36.90, maxLat: 38.30, minLng: 126.33, maxLng: 127.86 } },
  { id: "incheon", name: "인천", bounds: { minLat: 37.24, maxLat: 37.63, minLng: 126.26, maxLng: 126.78 } },
  { id: "gangwon", name: "강원", bounds: { minLat: 37.00, maxLat: 38.61, minLng: 127.49, maxLng: 129.35 } },
  { id: "chungbuk", name: "충북", bounds: { minLat: 36.14, maxLat: 37.19, minLng: 127.37, maxLng: 128.50 } },
  { id: "chungnam", name: "충남", bounds: { minLat: 35.89, maxLat: 37.00, minLng: 125.98, maxLng: 127.47 } },
  { id: "daejeon", name: "대전", bounds: { minLat: 36.19, maxLat: 36.48, minLng: 127.25, maxLng: 127.53 } },
  { id: "jeonbuk", name: "전북", bounds: { minLat: 35.39, maxLat: 36.20, minLng: 126.35, maxLng: 127.87 } },
  { id: "jeonnam", name: "전남", bounds: { minLat: 33.90, maxLat: 35.50, minLng: 125.90, maxLng: 127.70 } },
  { id: "gwangju", name: "광주", bounds: { minLat: 35.06, maxLat: 35.26, minLng: 126.73, maxLng: 126.98 } },
  { id: "gyeongbuk", name: "경북", bounds: { minLat: 35.57, maxLat: 37.19, minLng: 127.87, maxLng: 129.57 } },
  { id: "daegu", name: "대구", bounds: { minLat: 35.71, maxLat: 36.01, minLng: 128.39, maxLng: 128.75 } },
  { id: "gyeongnam", name: "경남", bounds: { minLat: 34.61, maxLat: 35.68, minLng: 127.55, maxLng: 129.22 } },
  { id: "busan", name: "부산", bounds: { minLat: 34.87, maxLat: 35.39, minLng: 128.74, maxLng: 129.31 } },
  { id: "ulsan", name: "울산", bounds: { minLat: 35.37, maxLat: 35.68, minLng: 129.01, maxLng: 129.45 } },
  { id: "jeju", name: "제주", bounds: { minLat: 33.10, maxLat: 33.60, minLng: 126.15, maxLng: 126.98 } },
];

export function inBounds(lat: number, lng: number, bounds: Bounds) {
  return lat >= bounds.minLat && lat <= bounds.maxLat && lng >= bounds.minLng && lng <= bounds.maxLng;
}
