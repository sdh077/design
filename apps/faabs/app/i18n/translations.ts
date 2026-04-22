export type Lang = "ko" | "en" | "zh";

export const t = {
  header: {
    philosophy: { ko: "철학", en: "Philosophy", zh: "理念" },
    products: { ko: "원두", en: "Beans", zh: "咖啡豆" },
    store: { ko: "매장", en: "Store", zh: "门店" },
    shop: { ko: "온라인 스토어", en: "Online Store", zh: "网上商店" },
    wholesale: { ko: "납품", en: "Wholesale", zh: "批发" },
  },
  hero: {
    sub: {
      ko: "since 2020",
      en: "since 2020",
      zh: "since 2020",
    },
    line1: {
      ko: "커피의 다양한 얼굴을",
      en: "The many faces of",
      zh: "咖啡的多种面貌",
    },
    line2: { ko: "표현하다", en: "Express.", zh: "表现" },
    cta1: { ko: "원두 보기", en: "View Beans", zh: "查看咖啡豆" },
    cta2: { ko: "온라인 구매", en: "Buy Online", zh: "网上购买" },
  },
  philosophy: {
    label: { ko: "우리의 철학", en: "Our Philosophy", zh: "我们的理念" },
    title1: { ko: "커피의", en: "Expressing", zh: "表达咖啡的" },
    title2: { ko: "다양한 얼굴을", en: "the many faces", zh: "多种面貌" },
    title3: { ko: "표현하다", en: "of coffee.", zh: "" },
    desc: {
      ko: "파브스 커피는 커피를 단순한 음료가 아닌 하나의 언어로 봅니다. 공학적 접근과 감각적 표현이 만나는 지점에서 우리만의 커피를 만들어갑니다.",
      en: "FAABS Coffee sees coffee not as a simple beverage, but as a language. At the intersection of engineering and sensory expression, we craft our own story of coffee.",
      zh: "FAABS咖啡将咖啡视为一种语言，而非单纯的饮品。在工程方法与感官表达的交汇点，我们创造属于自己的咖啡故事。",
    },
    pillars: [
      {
        number: "01",
        title: { ko: "공학적 로스팅", en: "Engineering Roasting", zh: "工程化烘焙" },
        desc: {
          ko: "데이터 기반의 정밀한 로스팅으로 일관된 품질을 추구합니다. 매 배치마다 동일한 결과를 만들어냅니다.",
          en: "Data-driven precision roasting for consistent quality. Every batch delivers the same results.",
          zh: "以数据驱动的精密烘焙追求稳定品质，每批次产出一致的结果。",
        },
      },
      {
        number: "02",
        title: { ko: "파트너 성장", en: "Partner Growth", zh: "合作伙伴成长" },
        desc: {
          ko: "파트너사와 함께 성장하는 도매 공급 시스템. 지속 가능한 커피 생태계를 만들어갑니다.",
          en: "A wholesale supply system that grows with our partners. Building a sustainable coffee ecosystem.",
          zh: "与合作伙伴共同成长的批发供应体系，构建可持续的咖啡生态圈。",
        },
      },
      {
        number: "03",
        title: { ko: "호스피탈리티", en: "Hospitality", zh: "款待文化" },
        desc: {
          ko: "팀 캘리브레이션 트레이닝과 바리스타 교육으로 서비스의 질을 높입니다.",
          en: "Elevating service quality through team calibration training and barista education.",
          zh: "通过团队校准培训和咖啡师教育提升服务质量。",
        },
      },
      {
        number: "04",
        title: { ko: "창업 컨설팅", en: "Startup Consulting", zh: "创业咨询" },
        desc: {
          ko: "장비 선택부터 바 워크플로우 설계까지, 커피 창업의 모든 과정을 함께합니다.",
          en: "From equipment selection to bar workflow design — guiding every step of your coffee business.",
          zh: "从设备选择到吧台流程设计，全程陪伴咖啡创业之路。",
        },
      },
    ],
    mascotLabel: { ko: "마스코트", en: "Mascot", zh: "吉祥物" },
    mascotTitle: { ko: "파파빈", en: "Papa Bean", zh: "帕帕豆" },
    mascotDesc: {
      ko: "파브스 커피의 마스코트 파파빈은 커피 그 자체를 살아있는 캐릭터로 표현합니다. 커피 한 잔에 담긴 이야기, 그 여정을 함께합니다.",
      en: "Papa Bean, the mascot of FAABS Coffee, brings coffee to life as a living character — sharing the story in every cup, every journey.",
      zh: "FAABS咖啡的吉祥物帕帕豆将咖啡本身化为鲜活的角色，与每一杯咖啡共同讲述其中的故事与旅程。",
    },
  },
  products: {
    label: { ko: "우리의 원두", en: "Our Beans", zh: "我们的咖啡豆" },
    viewAll: { ko: "전체 제품 보기 →", en: "View All Products →", zh: "查看全部产品 →" },
  },
  store: {
    label: { ko: "오시는 길", en: "Find Us", zh: "门店位置" },
    location: { ko: "위치", en: "Location", zh: "地址" },
    hours: { ko: "영업시간", en: "Hours", zh: "营业时间" },
    naverMap: { ko: "네이버 지도 →", en: "Naver Map →", zh: "Naver地图 →" },
    closed: { ko: "정기휴무", en: "Closed", zh: "定期休息" },
    followUs: { ko: "팔로우", en: "Follow Us", zh: "关注我们" },
    stores: [
      {
        name: { ko: "파브스커피", en: "FAABS Coffee", zh: "FAABS咖啡" },
        area: { ko: "서울 은평구", en: "Seoul, Eunpyeong-gu", zh: "首尔恩平区" },
        address: { ko: "증산로15가길 15, 1층", en: "15 Jeungsan-ro 15ga-gil, 1F", zh: "增山路15街路15号, 1层" },
        phone: null,
        hours: [
          {
            day: { ko: "월 – 금", en: "Mon – Fri", zh: "周一 – 周五" },
            time: "09:00 – 18:00",
            closed: false,
          },
          {
            day: { ko: "토", en: "Sat", zh: "周六" },
            time: "10:00 – 17:00",
            closed: false,
          },
          {
            day: { ko: "일 · 공휴일", en: "Sun · Holidays", zh: "周日 · 节假日" },
            time: { ko: "휴무", en: "Closed", zh: "休息" },
            closed: true,
          },
        ],
        mapUrl: "https://naver.me/xhzCYrK9",
        instagram: "https://instagram.com/faabs_coffee_roasters",
      },
      {
        name: { ko: "온선재 with 파브스 커피", en: "Onsunjae with FAABS Coffee", zh: "温仙斋 with FAABS咖啡" },
        area: { ko: "서울 중구", en: "Seoul, Jung-gu", zh: "首尔中区" },
        address: { ko: "서소문로9길 20, 1층", en: "20 Seosomun-ro 9-gil, 1F", zh: "西小门路9街路20号, 1层" },
        phone: "0507-1315-6164",
        hours: [
          {
            day: { ko: "월 – 금", en: "Mon – Fri", zh: "周一 – 周五" },
            time: "07:30 – 20:00",
            closed: false,
          },
          {
            day: { ko: "토 · 일", en: "Sat · Sun", zh: "周六 · 周日" },
            time: { ko: "정기휴무", en: "Closed", zh: "定期休息" },
            closed: true,
          },
        ],
        mapUrl: "https://naver.me/55PIGlD4",
        instagram: "https://www.instagram.com/onsunjae_with_faabs",
      },
    ],
  },
  footer: {
    address: {
      ko: "서울 은평구 증산로15가길 15",
      en: "15 Jeungsan-ro 15ga-gil, Eunpyeong-gu, Seoul",
      zh: "首尔恩平区增山路15街路15号",
    },
  },
} as const;
