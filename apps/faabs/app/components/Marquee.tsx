const items = [
  "FAABS COFFEE",
  "공학적 접근의 로스팅",
  "ENGINEERING ROASTING",
  "파파빈",
  "서울 은평구",
  "CLEAN CUP",
  "FAABS COFFEE",
  "표현하다",
  "EXPRESS",
  "SPECIALTY COFFEE",
  "FAABS COFFEE",
  "공학적 접근의 로스팅",
  "ENGINEERING ROASTING",
  "파파빈",
  "서울 은평구",
  "CLEAN CUP",
  "FAABS COFFEE",
  "표현하다",
  "EXPRESS",
  "SPECIALTY COFFEE",
];

export default function Marquee() {
  return (
    <div className="border-y border-black/10 py-4 overflow-hidden bg-[#f5f5f0] select-none">
      <div className="flex animate-marquee whitespace-nowrap">
        {items.map((item, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-6 px-6 text-sm tracking-widest uppercase text-black/70"
          >
            {item}
            <span className="text-black/20">·</span>
          </span>
        ))}
      </div>
    </div>
  );
}
