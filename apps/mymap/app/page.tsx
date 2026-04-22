"use client";

import { useState, useEffect, useCallback } from "react";

// ─────────────────────────────────────────────
// 국민연금 슬라이드
// ─────────────────────────────────────────────
const pensionSlides = [
  {
    id: 1,
    type: "title",
    title: "국민연금, 제대로 알기",
    subtitle: "물가 반영부터 수령액 계산까지",
    tag: "2026 발표자료",
    gradient: "from-blue-600 to-indigo-700",
  },
  {
    id: 2,
    type: "question",
    question: "지금 넣는 돈, 나중에 물가 반영돼서 받나요?",
    answer: "네, 반영됩니다.",
    detail:
      "국민연금은 단순히 낸 돈을 돌려주는 게 아닙니다.\n수령 시점의 물가(평균임금)에 맞게 '재평가'해서 지급합니다.",
  },
  {
    id: 3,
    type: "two-column",
    title: "물가 반영 두 가지 방식",
    columns: [
      {
        icon: "📮",
        label: "이미 받는 중",
        title: "매년 자동 인상",
        points: [
          "작년 물가상승률 그대로 반영",
          "매년 1월부터 적용",
          "2024년 → 3.6% 인상",
          "2025년 → 2.3% 인상",
        ],
        color: "blue",
      },
      {
        icon: "🔄",
        label: "새로 받기 시작",
        title: "재평가율 적용",
        points: [
          "과거 소득을 현재가치로 환산",
          "연도별 재평가 지수 사용",
          "1988년 100만원 → ×8.249",
          "= 824만 9천원으로 계산",
        ],
        color: "green",
      },
    ],
  },
  {
    id: 4,
    type: "formula",
    title: "수령액 계산 공식",
    formula: "기본연금액 = (A + B) ÷ 2 × 가입연수 × 1.2%",
    items: [
      {
        label: "A값",
        desc: "전체 가입자 최근 3년 평균소득월액",
        sub: "2026년 기준: 약 319만원 (매년 변동)",
        color: "purple",
      },
      {
        label: "B값",
        desc: "본인 가입기간 평균소득 (과거 소득을 현재가치로 재평가)",
        sub: "오래 전 소득일수록 재평가율 크게 적용",
        color: "orange",
      },
      {
        label: "1.2% × 가입연수",
        desc: "1년 가입할 때마다 소득의 1.2%씩 연금 적립",
        sub: "20년 = 24% / 30년 = 36% / 40년 = 48%",
        color: "teal",
      },
    ],
  },
  {
    id: 5,
    type: "table",
    title: "가입기간별 소득대체율",
    subtitle: "1년 가입할 때마다 평균소득의 1.2%씩 연금으로 받습니다",
    rows: [
      { period: "10년", rate: "12%", bar: 25 },
      { period: "20년", rate: "24%", bar: 50 },
      { period: "30년", rate: "36%", bar: 75 },
      { period: "40년", rate: "48%", bar: 100 },
    ],
  },
  {
    id: 6,
    type: "example",
    title: "실제 예시로 보면",
    cases: [
      {
        label: "케이스 A",
        condition: "소득 200만원 · 20년 가입",
        color: "blue",
        steps: [
          { label: "월 보험료", value: "18만원", sub: "200만 × 9%" },
          { label: "20년 총 납부", value: "4,320만원", sub: "18만 × 240개월" },
          { label: "A값", value: "319만원", sub: "전체 가입자 평균" },
          { label: "B값", value: "200만원", sub: "본인 평균소득 재평가" },
          { label: "(A+B)÷2", value: "259.5만원", sub: "두 값의 평균" },
          { label: "소득대체율", value: "× 24%", sub: "20년 × 1.2%" },
          { label: "기본연금액", value: "약 62만원", sub: "= 259.5 × 24%" },
        ],
        result: "월 약 62만원",
        highlight: "소득의 24%만 연금으로 적립",
      },
      {
        label: "케이스 B",
        condition: "소득 400만원 · 20년 가입",
        color: "green",
        steps: [
          { label: "월 보험료", value: "36만원", sub: "400만 × 9%" },
          { label: "20년 총 납부", value: "8,640만원", sub: "36만 × 240개월" },
          { label: "A값", value: "319만원", sub: "전체 가입자 평균" },
          { label: "B값", value: "400만원", sub: "본인 평균소득 재평가" },
          { label: "(A+B)÷2", value: "359.5만원", sub: "두 값의 평균" },
          { label: "소득대체율", value: "× 24%", sub: "20년 × 1.2%" },
          { label: "기본연금액", value: "약 86만원", sub: "= 359.5 × 24%" },
        ],
        result: "월 약 86만원",
        highlight: "소득이 2배여도 연금도 약 2배",
      },
      {
        label: "케이스 C",
        condition: "소득 400만원 · 30년 가입",
        color: "purple",
        steps: [
          { label: "월 보험료", value: "36만원", sub: "400만 × 9%" },
          { label: "30년 총 납부", value: "12,960만원", sub: "36만 × 360개월" },
          { label: "A값", value: "319만원", sub: "전체 가입자 평균" },
          { label: "B값", value: "400만원", sub: "본인 평균소득 재평가" },
          { label: "(A+B)÷2", value: "359.5만원", sub: "두 값의 평균" },
          { label: "소득대체율", value: "× 36%", sub: "30년 × 1.2%" },
          { label: "기본연금액", value: "약 130만원", sub: "= 359.5 × 36%" },
        ],
        result: "월 약 130만원",
        highlight: "10년 더 내면 月 44만원 추가",
      },
    ],
  },
  {
    id: 7,
    type: "career",
    title: "연봉이 오르면 연금도 달라진다",
    subtitle: "30년 직장인 시나리오 · 입사 시 연봉 3,000만원 → 퇴직 시 8,400만원",
    phases: [
      {
        period: "1~10년",
        label: "사회초년생",
        salary: "월 250만원",
        insurance: "월 22.5만원",
        total: "2,700만원",
        color: "blue",
      },
      {
        period: "11~20년",
        label: "중견 직장인",
        salary: "월 450만원",
        insurance: "월 40.5만원",
        total: "4,860만원",
        color: "green",
      },
      {
        period: "21~30년",
        label: "시니어",
        salary: "월 700만원",
        insurance: "월 53.1만원",
        total: "6,372만원",
        color: "purple",
        note: "* 700만원이어도 상한 590만원 기준 적용 (590×9%)",
      },
    ],
    summary: {
      totalPaid: "약 1억 3,932만원",
      avgB: "약 466만원",
      rate: "36% (30년×1.2%)",
      result: "월 약 141만원",
      highlight: "(319+466)÷2 × 36% = 141만원",
    },
  },
  {
    id: 8,
    type: "summary",
    title: "핵심 정리",
    points: [
      { icon: "💰", text: "많이 벌수록 더 받는다" },
      { icon: "📅", text: "오래 낼수록 소득대체율이 높아진다 (40년 = 48%)" },
      { icon: "📈", text: "물가가 오르면 연금도 함께 오른다" },
      { icon: "🔄", text: "과거에 낸 돈도 현재 물가로 재평가된다" },
    ],
    closing: '"많이 벌고 오래 낼수록 많이 받는다.\n그리고 그 금액도 매년 물가에 맞춰 올라간다."',
  },
];

// ─────────────────────────────────────────────
// 한은총재 슬라이드
// ─────────────────────────────────────────────
const bokSlides = [
  {
    id: 1,
    type: "title",
    title: "신임 한국은행 총재 신현송",
    subtitle: "세계 금융의 두뇌가 모국으로 돌아오다",
    tag: "2026 발표자료",
    gradient: "from-emerald-600 to-teal-700",
  },
  {
    id: 2,
    type: "question",
    question: "신현송은 어떤 사람인가요?",
    answer: "세계 금융의 두뇌, BIS 수석 경제고문.",
    detail:
      "한국에선 잘 알려지지 않았지만 세계 경제학자 영향력 순위 상위 10위.\nBIS 6인 핵심회의 보고서를 총괄하며 글로벌 금융정책 방향을 결정해온 인물입니다.",
  },
  {
    id: 3,
    type: "life-impact",
    title: "BIS란 무엇인가?",
    columns: [
      {
        icon: "🏛️",
        label: "탄생 배경",
        title: "1930년 설립",
        points: [
          "1차 세계대전 후 독일 전쟁배상금 결제 기구로 출발",
          "본부: 스위스 바젤 (중립국)",
          "초기엔 G10 중앙은행 협의체",
          "2008년 금융위기 후 63개국으로 확대",
          "전 세계 GDP의 95% 커버",
        ],
        color: "green",
      },
      {
        icon: "⚙️",
        label: "핵심 기능",
        title: "세계 금융 규칙 제정",
        points: [
          "바젤 협약: 전 세계 모든 은행이 지켜야 할 자본 규정",
          "연 6회 중앙은행 총재 비공개 회의 개최",
          "외환·금 보유, 국제결제 서비스 제공",
          "금융위기 조기경보 시스템 운영",
          "\"중앙은행들의 중앙은행\"",
        ],
        color: "teal",
      },
      {
        icon: "⚡",
        label: "왜 Fed보다 강한가?",
        title: "중장기 영향력",
        points: [
          "Fed는 미국 한 나라의 금리 결정",
          "BIS는 전 세계 63개국 금융 규칙 설계",
          "바젤 III 규정 하나가 수조 달러 이동",
          "비공개 → 정치 압력 없이 솔직한 논의",
          "잭슨홀보다 BIS 회의를 더 중시하는 이유",
        ],
        color: "blue",
      },
    ],
  },
  {
    id: 4,
    type: "two-column",
    title: "BIS 6인 핵심협의체 — 세계 금융의 밀실",
    columns: [
      {
        icon: "🔐",
        label: "구성",
        title: "단 6개국만 참여",
        points: [
          "🇺🇸 미국 (Fed 의장)",
          "🇪🇺 유럽연합 (ECB 총재)",
          "🇯🇵 일본 (BOJ 총재)",
          "🇬🇧 영국 (BOE 총재)",
          "🇨🇳 중국 (PBOC 총재)",
          "🇨🇭 스위스 (BIS 홈그라운드)",
        ],
        color: "purple",
      },
      {
        icon: "📋",
        label: "신현송의 역할",
        title: "이 회의의 두뇌",
        points: [
          "6인 회의 사전 보고서 총괄 작성",
          "의제 설정 및 분석 자료 제공",
          "각국 중앙은행 총재가 이 보고서로 논의",
          "비공개이지만 극도로 중요한 자리",
          "\"총재들이 무엇을 논의할지 결정하는 사람\"",
        ],
        color: "orange",
      },
    ],
  },
  {
    id: 5,
    type: "formula",
    title: "신현송의 경력 흐름",
    formula: "옥스퍼드 박사 → LSE·프린스턴 교수 → BIS 수석 → 한은 총재",
    items: [
      {
        label: "학계",
        desc: "옥스퍼드 대학원 박사 · LSE 금융학과 교수 · 프린스턴 교수",
        sub: "영란은행·뉴욕 연준 자문 병행",
        color: "blue",
      },
      {
        label: "BIS (2011~2026)",
        desc: "아시아인 최초 통화경제국장 → 수석 경제고문 겸 연구부장",
        sub: "2014년 한은 총재 1순위였으나 BIS 승진으로 고사",
        color: "purple",
      },
      {
        label: "한국은행 (2026~)",
        desc: "1959년생, BIS 은퇴 후 마지막 4년을 모국 금융 안정에 헌신",
        sub: "매파 성향 · 가계부채·전세를 '숨겨진 부채'로 경고",
        color: "orange",
      },
    ],
  },
  {
    id: 5,
    type: "table",
    title: "신현송의 국제적 위상",
    subtitle: "교수도 아닌 BIS 재직 중에 달성한 영향력",
    rows: [
      { period: "경제학자 영향력 순위", rate: "세계 상위 10위", bar: 95 },
      { period: "BIS 내 직위", rate: "수석 경제고문·연구부장", bar: 100 },
      { period: "아시아인 최초", rate: "BIS 통화경제국장 (2011)", bar: 80 },
      { period: "G20 서울 정상회의", rate: "대통령실 국제경제보좌관", bar: 70 },
      { period: "논문 피인용 수", rate: "글로벌 Top 10 수준", bar: 90 },
    ],
  },
  {
    id: 6,
    type: "example",
    title: "신현송이 보는 한국 경제 리스크",
    cases: [
      {
        label: "가계부채",
        condition: "전세제도 = 숨겨진 부채",
        color: "orange",
        steps: [
          { label: "문제 진단", value: "전세보증금", sub: "공식 부채 통계 밖" },
          { label: "규모 추정", value: "GDP 대비 과대", sub: "글로벌 최고 수준" },
          { label: "리스크", value: "역전세 충격", sub: "집값 하락 시 연쇄 부실" },
          { label: "정책 방향", value: "구조 개편 필요", sub: "장기 임대 전환 유도" },
        ],
        result: "긴축 기조 유지",
        highlight: "금리 인하에 보수적 입장",
      },
      {
        label: "통화정책",
        condition: "매파 성향의 배경",
        color: "blue",
        steps: [
          { label: "BIS 시각", value: "유동성 과잉 경계", sub: "글로벌 금융위기 교훈" },
          { label: "한국 상황", value: "부동산 버블 우려", sub: "저금리 시 재팽창 위험" },
          { label: "환율 고려", value: "원화 약세 압력", sub: "성급한 인하 시 자본 유출" },
          { label: "결론", value: "신중한 완화", sub: "데이터 기반 점진적 결정" },
        ],
        result: "금융 체질 강화",
        highlight: "단기 시장 호응보다 장기 안정",
      },
      {
        label: "국제 협력",
        condition: "BIS 네트워크 활용",
        color: "green",
        steps: [
          { label: "강점", value: "Fed·ECB 직통", sub: "6인 회의 인맥" },
          { label: "활용", value: "외환위기 방어", sub: "스왑라인 협상력" },
          { label: "글로벌 시각", value: "한국 발언권 ↑", sub: "총재 신뢰도 기반" },
          { label: "기대", value: "BIS 연결고리", sub: "글로벌 규제 선제 대응" },
        ],
        result: "외교적 자산",
        highlight: "역대 최고 수준의 국제 네트워크",
      },
    ],
  },
  {
    id: 7,
    type: "career",
    title: "신현송의 커리어 타임라인",
    subtitle: "1959년생 · 초등 5학년 영국 유학 · 옥스퍼드 박사 · BIS 15년",
    phases: [
      {
        period: "1990s~2010",
        label: "학계·자문기",
        salary: "LSE·프린스턴 교수",
        insurance: "영란은행·IMF·뉴욕연준 자문",
        total: "G20 대통령실 보좌관 (9개월)",
        color: "blue",
      },
      {
        period: "2011~2025",
        label: "BIS 시대",
        salary: "아시아인 최초 통화경제국장",
        insurance: "수석 경제고문·연구부장",
        total: "6인 핵심회의 보고서 총괄",
        color: "green",
      },
      {
        period: "2026~",
        label: "한은 총재",
        salary: "대통령 임명 (임기 4년)",
        insurance: "금통위 의장·금리 결정권",
        total: "BIS 경험 기반 금융 체질 강화",
        color: "purple",
      },
    ],
    summary: {
      totalPaid: "신현송 (1959년생)",
      avgB: "옥스퍼드 경제학 박사",
      rate: "매파 성향",
      result: "기준금리 2.50%",
      highlight: "한국에서 저평가, 세계에서 고평가",
    },
  },
  {
    id: 8,
    type: "life-impact",
    title: "신현송이 총재가 되면 우리 삶은?",
    columns: [
      {
        icon: "⚠️",
        label: "단기 영향",
        title: "불편해지는 것들",
        points: [
          "금리 인하 속도 둔화 → 대출이자 부담 지속",
          "주담대·전세대출 높은 수준 유지",
          "전세 규제 강화 압력",
          "저금리 기반 집값 재팽창 억제",
        ],
        color: "orange",
      },
      {
        icon: "✅",
        label: "장기 효과",
        title: "튼튼해지는 것들",
        points: [
          "BIS 인맥 → 외환위기 방어력 강화",
          "원화 신뢰도 및 국가 신용도 상승",
          "글로벌 금융 규제 선제 대응",
          "가계부채 구조 개선",
        ],
        color: "green",
      },
      {
        icon: "📈",
        label: "추천 섹터",
        title: "투자 전략",
        points: [
          "🏦 은행·보험주 (고금리 수혜)",
          "📡 통신·유틸리티 (방어주)",
          "💵 달러 자산·미국 채권 (환율 방어)",
          "⚠️ 건설·부동산은 주의",
        ],
        color: "blue",
      },
    ],
  },
  {
    id: 9,
    type: "summary",
    title: "핵심 정리",
    points: [
      { icon: "🌍", text: "BIS = Fed보다 중장기 영향력 · 전 세계 GDP 95% 커버" },
      { icon: "🧠", text: "신현송 = BIS 6인 핵심회의 두뇌 · 경제학자 세계 Top 10" },
      { icon: "⚠️", text: "전세제도를 '숨겨진 가계부채'로 경고 → 긴축 기조 예상" },
      { icon: "🤝", text: "역대 최강 국제 네트워크 → 외환·금융위기 방어력 강화" },
    ],
    closing: '"한국에선 잘 몰라도,\n세계 금융계는 이미 알고 있는 이름."',
  },
];

// ─────────────────────────────────────────────
// 섹터 슬라이드
// ─────────────────────────────────────────────
const sectorSlides = [
  {
    id: 1,
    type: "title",
    title: "지금 어디에 투자해야 할까?",
    subtitle: "오일쇼크 이후 수혜 섹터 · AI 시대 3단계 전략",
    tag: "2026 발표자료",
    gradient: "from-rose-600 to-orange-600",
  },
  {
    id: 2,
    type: "life-impact",
    title: "오일쇼크 이후 — 역사가 반복하는 5개 섹터",
    columns: [
      {
        icon: "⚡",
        label: "에너지 독립",
        title: "대체에너지",
        points: [
          "오일쇼크 후 에너지 자립 인식 급등",
          "1973년 쇼크 → 미국 원자력 투자 폭증",
          "태양광·풍력·원전 관련주 수혜",
          "에너지 안보 = 국가 전략 자산",
        ],
        color: "orange",
      },
      {
        icon: "✈️",
        label: "비용 절감",
        title: "항공·운송·소비재",
        points: [
          "연료비 = 항공사 비용의 20~30%",
          "유가 안정 시 수익성 급반등",
          "해운·물류도 동반 수혜",
          "소비심리 회복 → 소매 동반 상승",
        ],
        color: "blue",
      },
      {
        icon: "🚗",
        label: "연비 혁신",
        title: "자동차·모빌리티",
        points: [
          "1970s 쇼크 → 도요타·혼다 소형차 폭발",
          "2008년 쇼크 → 하이브리드·전기차 주목",
          "고유가 충격이 친환경차 전환 가속",
          "완성차보다 부품·배터리 수혜",
        ],
        color: "green",
      },
    ],
  },
  {
    id: 3,
    type: "two-column",
    title: "오일쇼크 이후 — 화학·소재 & 금융·소비",
    columns: [
      {
        icon: "🧪",
        label: "원가 절감",
        title: "화학·소재",
        points: [
          "원유 = 플라스틱·합성섬유의 원료",
          "유가 안정 시 원가 부담 급감",
          "정유·석유화학 마진 회복",
          "범용 소재주보다 고부가 화학주 유리",
          "소재·부품 국산화 테마와 겹침",
        ],
        color: "teal",
      },
      {
        icon: "🛒",
        label: "소비 회복",
        title: "금융·소비",
        points: [
          "고유가 → 소비심리 위축",
          "유가 해결 → 가처분소득 증가",
          "소매·외식·여행 소비 동반 회복",
          "카드·소비자금융 대출 증가",
          "경기민감 소비재 ETF 참고",
        ],
        color: "purple",
      },
    ],
  },
  {
    id: 4,
    type: "formula",
    title: "AI 시대 — 3단계 투자 전략",
    formula: "1단계 인프라 → 2단계 응용·확산 → 3단계 간접 수혜",
    items: [
      {
        label: "1단계 (이미 올랐지만 지속)",
        desc: "반도체·HBM, 전력 인프라·원전 — AI 수요 직접 수혜",
        sub: "엔비디아, SK하이닉스, 두산에너빌리티 등",
        color: "orange",
      },
      {
        label: "2단계 (지금 주목 타이밍)",
        desc: "사이버보안, 클라우드·소프트웨어 — 인프라→응용 전환",
        sub: "CrowdStrike, Palo Alto, Microsoft, Salesforce",
        color: "blue",
      },
      {
        label: "3단계 (아직 덜 오른 수혜)",
        desc: "헬스케어·바이오, 배터리·ESS — 간접 수혜 알파 기대",
        sub: "AI 신약 개발 + AI 데이터센터 전력 저장 수요",
        color: "purple",
      },
    ],
  },
  {
    id: 5,
    type: "example",
    title: "AI 3단계별 핵심 포인트",
    cases: [
      {
        label: "1단계 인프라",
        condition: "이미 올랐지만 계속 성장",
        color: "orange",
        steps: [
          { label: "반도체·HBM", value: "핵심 수혜", sub: "빅테크 설비투자 → HBM 수요" },
          { label: "전력 인프라", value: "그리드 투자", sub: "AI 전력 부족 → 설비 확대" },
          { label: "원전·SMR", value: "장기 기저", sub: "탄소 없는 대규모 전원" },
          { label: "리스크", value: "고밸류에이션", sub: "기대감 이미 주가에 반영" },
        ],
        result: "지속 보유 전략",
        highlight: "단, 추격 매수보다 조정 시 분할 매수",
      },
      {
        label: "2단계 응용",
        condition: "지금이 진입 타이밍",
        color: "blue",
        steps: [
          { label: "사이버보안", value: "플랫폼화", sub: "AI 보안 수요 폭증" },
          { label: "클라우드", value: "적용 단계", sub: "인프라→실제 비즈니스 전환" },
          { label: "SaaS", value: "AI 탑재", sub: "MS·세일즈포스 AI 기능 확장" },
          { label: "포인트", value: "전환점", sub: "인프라 다음은 소프트웨어" },
        ],
        result: "신규 진입 고려",
        highlight: "1단계보다 밸류에이션 부담 낮음",
      },
      {
        label: "3단계 간접",
        condition: "아직 덜 반영된 알파",
        color: "purple",
        steps: [
          { label: "헬스케어·바이오", value: "AI 신약", sub: "개발 기간·비용 혁신적 단축" },
          { label: "배터리·ESS", value: "EV→ESS", sub: "데이터센터 전력 저장 수요 급증" },
          { label: "유전자 편집", value: "기관 주목", sub: "포트폴리오 분산 수요" },
          { label: "기대", value: "초과수익", sub: "아직 주가에 덜 반영" },
        ],
        result: "분산 편입 전략",
        highlight: "가장 높은 알파 기대 구간",
      },
    ],
  },
  {
    id: 6,
    type: "table",
    title: "섹터별 투자 매력도 한눈에",
    subtitle: "오일쇼크 수혜 + AI 수혜 종합 정리",
    rows: [
      { period: "반도체·HBM", rate: "★★★★★", bar: 100 },
      { period: "전력·원전", rate: "★★★★★", bar: 95 },
      { period: "사이버보안", rate: "★★★★☆", bar: 80 },
      { period: "클라우드·SaaS", rate: "★★★★☆", bar: 78 },
      { period: "대체에너지", rate: "★★★★☆", bar: 75 },
      { period: "항공·운송", rate: "★★★☆☆", bar: 60 },
      { period: "바이오·ESS", rate: "★★★☆☆", bar: 58 },
      { period: "화학·소재", rate: "★★★☆☆", bar: 55 },
    ],
  },
  {
    id: 7,
    type: "summary",
    title: "핵심 정리",
    points: [
      { icon: "🛢️", text: "오일쇼크 후엔 항상 에너지 전환·운송·소비 섹터가 반등" },
      { icon: "🤖", text: "AI 1단계(반도체·전력)는 이미 올랐지만 구조적 성장 지속" },
      { icon: "🎯", text: "2단계 사이버보안·클라우드가 지금 진입 적기라는 시각" },
      { icon: "💡", text: "3단계 바이오·ESS에서 초과수익(알파) 기회 있을 수도" },
    ],
    closing: '"이미 오른 섹터의 기대감보다\n아직 덜 오른 곳의 실적이 더 놀라울 수 있다."',
  },
];

// ─────────────────────────────────────────────
// 공통
// ─────────────────────────────────────────────
const allSlides: Record<string, typeof pensionSlides> = {
  pension: pensionSlides,
  bok: bokSlides,
  sector: sectorSlides,
};

const topicMeta: Record<string, { label: string; accent: string; progress: string }> = {
  pension: { label: "국민연금",    accent: "bg-blue-500",   progress: "bg-blue-500" },
  bok:     { label: "한은총재",    accent: "bg-emerald-500", progress: "bg-emerald-500" },
  sector:  { label: "투자 섹터",   accent: "bg-rose-500",   progress: "bg-rose-500" },
};

const colorMap: Record<string, { bg: string; text: string; border: string; dot: string }> = {
  blue:   { bg: "bg-blue-50",   text: "text-blue-700",   border: "border-blue-200",   dot: "bg-blue-500" },
  green:  { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", dot: "bg-emerald-500" },
  purple: { bg: "bg-violet-50", text: "text-violet-700", border: "border-violet-200", dot: "bg-violet-500" },
  orange: { bg: "bg-orange-50", text: "text-orange-700", border: "border-orange-200", dot: "bg-orange-500" },
  teal:   { bg: "bg-teal-50",   text: "text-teal-700",   border: "border-teal-200",   dot: "bg-teal-500" },
};

export default function Presentation() {
  const [topic, setTopic] = useState<"pension" | "bok" | "sector">("pension");
  const [current, setCurrent] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [direction, setDirection] = useState<"next" | "prev">("next");

  const slides = allSlides[topic];
  const meta = topicMeta[topic];

  const goTo = useCallback(
    (index: number, dir: "next" | "prev") => {
      if (animating) return;
      setDirection(dir);
      setAnimating(true);
      setTimeout(() => {
        setCurrent(index);
        setAnimating(false);
      }, 200);
    },
    [animating]
  );

  const next = useCallback(() => {
    if (current < slides.length - 1) goTo(current + 1, "next");
  }, [current, slides.length, goTo]);

  const prev = useCallback(() => {
    if (current > 0) goTo(current - 1, "prev");
  }, [current, goTo]);

  const switchTopic = (t: "pension" | "bok" | "sector") => {
    if (t === topic) return;
    setTopic(t);
    setCurrent(0);
  };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "ArrowDown" || e.key === " ") next();
      if (e.key === "ArrowLeft" || e.key === "ArrowUp") prev();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [next, prev]);

  const slide = slides[current];

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-950 p-4 select-none">

      {/* Topic selector */}
      <div className="flex gap-2 mb-4 bg-white/10 rounded-full p-1">
        {(["pension", "bok", "sector"] as const).map((t) => (
          <button
            key={t}
            onClick={() => switchTopic(t)}
            className={`px-5 py-1.5 rounded-full text-sm font-semibold transition-all duration-200 ${
              topic === t
                ? "bg-white text-gray-900 shadow"
                : "text-white/60 hover:text-white/90"
            }`}
          >
            {topicMeta[t].label}
          </button>
        ))}
      </div>

      {/* Slide container */}
      <div
        className="relative w-full max-w-6xl bg-white rounded-2xl shadow-2xl overflow-hidden"
        style={{ aspectRatio: "16/9", minHeight: 500 }}
      >
        {/* Progress bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gray-100 z-10">
          <div
            className={`h-full ${meta.progress} transition-all duration-500`}
            style={{ width: `${((current + 1) / slides.length) * 100}%` }}
          />
        </div>

        {/* Slide number */}
        <div className="absolute top-4 right-5 text-xs text-gray-400 z-10 font-mono">
          {current + 1} / {slides.length}
        </div>

        {/* Slide content */}
        <div
          className="w-full h-full flex flex-col"
          style={{
            opacity: animating ? 0 : 1,
            transform: animating
              ? direction === "next" ? "translateX(8px)" : "translateX(-8px)"
              : "translateX(0)",
            transition: "opacity 0.2s, transform 0.2s",
          }}
        >
          {/* TITLE */}
          {slide.type === "title" && (() => {
            const s = slide as typeof pensionSlides[0];
            return (
              <div className={`flex flex-col items-center justify-center h-full text-center px-12 bg-gradient-to-br ${s.gradient}`}>
                <span className="text-white/60 text-sm font-medium tracking-widest uppercase mb-6">{s.tag}</span>
                <h1 className="text-5xl font-bold text-white mb-4 leading-tight">{s.title}</h1>
                <p className="text-xl text-white/70">{s.subtitle}</p>
                <div className="mt-10 text-white/40 text-sm">→ 키보드 방향키 또는 아래 버튼으로 이동</div>
              </div>
            );
          })()}

          {/* QUESTION */}
          {slide.type === "question" && (() => {
            const s = slide as typeof pensionSlides[1];
            return (
              <div className="flex flex-col justify-center h-full px-14 py-10">
                <div className="text-gray-400 text-sm font-medium mb-4 uppercase tracking-wider">핵심 질문</div>
                <h2 className="text-3xl font-bold text-gray-800 mb-6 leading-snug">{s.question}</h2>
                <div className="inline-flex items-center gap-3 mb-6">
                  <span className="text-4xl font-black text-blue-600">{s.answer}</span>
                </div>
                <p className="text-lg text-gray-600 leading-relaxed whitespace-pre-line border-l-4 border-blue-400 pl-5 bg-blue-50 py-4 pr-5 rounded-r-xl">
                  {s.detail}
                </p>
              </div>
            );
          })()}

          {/* TWO-COLUMN */}
          {slide.type === "two-column" && (() => {
            const s = slide as typeof pensionSlides[2];
            return (
              <div className="flex flex-col h-full px-10 py-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">{s.title}</h2>
                <div className="flex gap-5 flex-1">
                  {s.columns!.map((col) => {
                    const c = colorMap[col.color];
                    return (
                      <div key={col.label} className={`flex-1 rounded-xl border ${c.border} ${c.bg} p-6 flex flex-col`}>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-2xl">{col.icon}</span>
                          <span className={`text-xs font-semibold ${c.text} uppercase tracking-wider`}>{col.label}</span>
                        </div>
                        <h3 className="text-xl font-bold text-gray-800 mb-4">{col.title}</h3>
                        <ul className="space-y-2">
                          {col.points.map((p, i) => (
                            <li key={i} className="flex items-start gap-2 text-gray-700 text-sm">
                              <span className={`mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0 ${c.dot}`} />
                              {p}
                            </li>
                          ))}
                        </ul>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })()}

          {/* LIFE-IMPACT (3열) */}
          {slide.type === "life-impact" && (() => {
            const s = slide as typeof bokSlides[7];
            return (
              <div className="flex flex-col h-full px-10 py-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-5">{s.title}</h2>
                <div className="flex gap-4 flex-1">
                  {s.columns!.map((col) => {
                    const c = colorMap[col.color];
                    return (
                      <div key={col.label} className={`flex-1 rounded-xl border ${c.border} ${c.bg} p-5 flex flex-col`}>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xl">{col.icon}</span>
                          <span className={`text-xs font-semibold ${c.text} uppercase tracking-wider`}>{col.label}</span>
                        </div>
                        <h3 className="text-base font-bold text-gray-800 mb-3">{col.title}</h3>
                        <ul className="space-y-2">
                          {col.points.map((p, i) => (
                            <li key={i} className="flex items-start gap-2 text-gray-700 text-sm">
                              <span className={`mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0 ${c.dot}`} />
                              {p}
                            </li>
                          ))}
                        </ul>
                      </div>
                    );
                  })}
                </div>
                <p className="text-xs text-gray-400 mt-3">* 투자는 개인 판단 하에 진행하세요. 본 내용은 교육 목적의 참고자료입니다.</p>
              </div>
            );
          })()}

          {/* FORMULA */}
          {slide.type === "formula" && (() => {
            const s = slide as typeof pensionSlides[3];
            return (
              <div className="flex flex-col h-full px-10 py-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">{s.title}</h2>
                <div className="bg-gray-900 text-green-400 font-mono text-base rounded-xl px-6 py-4 mb-6 text-center">
                  {s.formula}
                </div>
                <div className="flex gap-4 flex-1">
                  {s.items!.map((item) => {
                    const c = colorMap[item.color];
                    return (
                      <div key={item.label} className={`flex-1 rounded-xl border ${c.border} ${c.bg} p-4 flex flex-col`}>
                        <span className={`text-xs font-bold uppercase tracking-wider ${c.text} mb-2`}>{item.label}</span>
                        <p className="text-gray-800 text-sm leading-relaxed mb-2">{item.desc}</p>
                        <p className={`text-xs ${c.text} mt-auto`}>{item.sub}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })()}

          {/* TABLE */}
          {slide.type === "table" && (() => {
            const s = slide as typeof pensionSlides[4];
            return (
              <div className="flex flex-col h-full px-10 py-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-1">{s.title}</h2>
                <p className="text-gray-500 text-sm mb-6">{s.subtitle}</p>
                <div className="flex flex-col gap-3 flex-1 justify-center">
                  {s.rows!.map((row) => (
                    <div key={row.period} className="flex items-center gap-4">
                      <span className="text-sm font-semibold text-gray-600 w-36 text-right">{row.period}</span>
                      <div className="flex-1 bg-gray-100 rounded-full h-7 overflow-hidden">
                        <div
                          className={`h-full ${meta.progress} rounded-full flex items-center justify-end pr-3 transition-all duration-700`}
                          style={{ width: `${row.bar}%` }}
                        >
                          <span className="text-white text-xs font-bold">{row.rate}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-400 mt-4">* 지급률(조기수령 감액)과 다른 개념 — 정상수령 시 감액 없이 100% 지급</p>
              </div>
            );
          })()}

          {/* EXAMPLE */}
          {slide.type === "example" && (() => {
            const s = slide as typeof pensionSlides[5];
            return (
              <div className="flex flex-col h-full px-10 py-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">{s.title}</h2>
                <div className="flex gap-4 flex-1">
                  {s.cases!.map((c) => {
                    const col = colorMap[c.color];
                    return (
                      <div key={c.label} className={`flex-1 rounded-xl border-2 ${col.border} ${col.bg} p-4 flex flex-col`}>
                        <div className="mb-3">
                          <span className={`text-xs font-bold uppercase tracking-wider ${col.text}`}>{c.label}</span>
                          <p className="text-gray-700 text-sm font-medium mt-1">{c.condition}</p>
                        </div>
                        <div className="space-y-1.5 flex-1">
                          {c.steps!.map((step, i) => (
                            <div key={i} className="flex items-center justify-between bg-white/70 rounded-lg px-2.5 py-1.5">
                              <span className="text-gray-500 text-xs">{step.label}</span>
                              <div className="text-right">
                                <span className={`text-xs font-bold ${col.text}`}>{step.value}</span>
                                <span className="text-gray-400 text-xs ml-1">({step.sub})</span>
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className={`mt-3 rounded-lg bg-white border ${col.border} px-3 py-2`}>
                          <div className={`text-2xl font-black ${col.text}`}>{c.result}</div>
                          <div className="text-gray-500 text-xs mt-0.5">{c.highlight}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <p className="text-xs text-gray-400 mt-3">* 예상 금액 (기본연금액 기준, 부양가족연금 미포함)</p>
              </div>
            );
          })()}

          {/* CAREER */}
          {slide.type === "career" && (() => {
            const s = slide as typeof pensionSlides[6];
            const barWidths = ["33%", "66%", "100%"];
            return (
              <div className="flex flex-col h-full px-10 py-7">
                <h2 className="text-2xl font-bold text-gray-800 mb-0.5">{s.title}</h2>
                <p className="text-gray-400 text-xs mb-4">{s.subtitle}</p>
                <div className="flex gap-3 mb-4">
                  {s.phases!.map((ph, i) => {
                    const col = colorMap[ph.color];
                    return (
                      <div key={ph.period} className={`flex-1 rounded-xl border ${col.border} ${col.bg} p-4 flex flex-col gap-2`}>
                        <div className="flex items-center justify-between">
                          <span className={`text-xs font-bold uppercase tracking-wider ${col.text}`}>{ph.period}</span>
                          <span className="text-xs text-gray-500">{ph.label}</span>
                        </div>
                        <div className="bg-white/60 rounded-full h-2 overflow-hidden">
                          <div className={`h-full rounded-full ${col.dot} transition-all duration-700`} style={{ width: barWidths[i] }} />
                        </div>
                        <div className="space-y-1">
                          <div className="flex justify-between">
                            <span className="text-gray-500 text-xs">월 소득 / 역할</span>
                            <span className={`text-xs font-semibold ${col.text}`}>{ph.salary}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500 text-xs">월 보험료 / 세부</span>
                            <span className="text-xs font-semibold text-gray-700">{ph.insurance}</span>
                          </div>
                          <div className="flex justify-between border-t border-dashed border-gray-200 pt-1 mt-1">
                            <span className="text-gray-500 text-xs">10년 합계 / 비고</span>
                            <span className="text-xs font-bold text-gray-800">{ph.total}</span>
                          </div>
                        </div>
                        {ph.note && <p className="text-gray-400 text-xs mt-1">{ph.note}</p>}
                      </div>
                    );
                  })}
                </div>
                <div className="bg-gray-900 rounded-xl px-5 py-3 flex items-center gap-6">
                  <div className="text-center">
                    <div className="text-gray-400 text-xs mb-0.5">항목 1</div>
                    <div className="text-white font-bold text-sm">{s.summary!.totalPaid}</div>
                  </div>
                  <div className="w-px h-8 bg-gray-700" />
                  <div className="text-center">
                    <div className="text-gray-400 text-xs mb-0.5">항목 2</div>
                    <div className="text-white font-bold text-sm">{s.summary!.avgB}</div>
                  </div>
                  <div className="w-px h-8 bg-gray-700" />
                  <div className="text-center">
                    <div className="text-gray-400 text-xs mb-0.5">항목 3</div>
                    <div className="text-white font-bold text-sm">{s.summary!.rate}</div>
                  </div>
                  <div className="w-px h-8 bg-gray-700" />
                  <div className="flex-1 text-right">
                    <div className="text-gray-400 text-xs mb-0.5">핵심</div>
                    <div className="text-green-400 font-black text-xl">{s.summary!.result}</div>
                    <div className="text-gray-500 text-xs">{s.summary!.highlight}</div>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  <span className="font-semibold text-orange-500">매파(Hawk)</span>란? 물가 안정을 최우선으로 삼아 금리 인하에 신중하고 긴축적 통화정책을 선호하는 성향. 반대는 비둘기파(Dove).
                </p>
              </div>
            );
          })()}

          {/* SUMMARY */}
          {slide.type === "summary" && (() => {
            const s = slide as typeof pensionSlides[7];
            return (
              <div className="flex flex-col h-full px-10 py-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">{s.title}</h2>
                <div className="grid grid-cols-2 gap-3 mb-6">
                  {s.points!.map((p, i) => (
                    <div key={i} className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3">
                      <span className="text-2xl">{p.icon}</span>
                      <span className="text-gray-700 font-medium text-sm">{p.text}</span>
                    </div>
                  ))}
                </div>
                <div className="flex-1 flex items-end">
                  <blockquote className={`${meta.accent} text-white rounded-xl px-6 py-4 w-full text-center`}>
                    <p className="text-base font-medium whitespace-pre-line leading-relaxed">{s.closing}</p>
                  </blockquote>
                </div>
              </div>
            );
          })()}
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-4 mt-5">
        <button
          onClick={prev}
          disabled={current === 0}
          className="w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center disabled:opacity-30 hover:bg-white/20 transition-colors text-lg"
        >
          ←
        </button>

        <div className="flex gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i, i > current ? "next" : "prev")}
              className={`rounded-full transition-all duration-300 ${
                i === current
                  ? `w-6 h-2 ${meta.accent}`
                  : "w-2 h-2 bg-white/30 hover:bg-white/50"
              }`}
            />
          ))}
        </div>

        <button
          onClick={next}
          disabled={current === slides.length - 1}
          className="w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center disabled:opacity-30 hover:bg-white/20 transition-colors text-lg"
        >
          →
        </button>
      </div>

      <p className="text-white/30 text-xs mt-3">방향키(←→) 또는 스페이스바로 이동</p>
    </div>
  );
}
