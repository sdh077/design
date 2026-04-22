"use client";

import { useState } from "react";
import { useLanguage } from "../../i18n/LanguageContext";

const copy = {
  label: { ko: "납품 문의", en: "Wholesale Inquiry", zh: "批发咨询" },
  title: { ko: "함께 시작해요", en: "Let's Get Started", zh: "让我们开始合作" },
  desc: {
    ko: "아래 양식을 작성해주시면 2영업일 내로 연락드리겠습니다.",
    en: "Fill in the form below and we'll get back to you within 2 business days.",
    zh: "请填写以下表格，我们将在2个工作日内与您联系。",
  },
  fields: {
    name: { ko: "업체명 / 담당자", en: "Business / Contact Name", zh: "企业名称 / 联系人" },
    phone: { ko: "연락처", en: "Phone Number", zh: "联系电话" },
    email: { ko: "이메일", en: "Email", zh: "电子邮件" },
    volume: { ko: "예상 월 사용량 (kg)", en: "Estimated Monthly Volume (kg)", zh: "预计月用量（kg）" },
    message: { ko: "추가 문의사항", en: "Additional Inquiries", zh: "其他咨询内容" },
  },
  submit: { ko: "문의 보내기", en: "Send Inquiry", zh: "发送咨询" },
  submitting: { ko: "전송 중...", en: "Sending...", zh: "发送中..." },
  success: {
    ko: "문의가 접수됐습니다. 빠르게 연락드리겠습니다!",
    en: "Your inquiry has been received. We'll be in touch soon!",
    zh: "您的咨询已收到，我们将尽快与您联系！",
  },
  or: { ko: "또는 직접 연락", en: "Or contact directly", zh: "或直接联系" },
};

type FormStatus = "idle" | "loading" | "success";

export default function WholesaleContact() {
  const { lang } = useLanguage();
  const [status, setStatus] = useState<FormStatus>("idle");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setTimeout(() => setStatus("success"), 800);
  };

  return (
    <section id="contact" className="py-24 px-6 md:px-12 bg-[#f5f5f0]">
      <div className="max-w-6xl mx-auto">
        <p className="text-xs tracking-[0.4em] uppercase text-black/70 mb-4">
          {copy.label[lang]}
        </p>
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <h2 className="text-[clamp(1.8rem,4vw,3rem)] font-black leading-tight uppercase text-[#0a0a0a]">
            {copy.title[lang]}
          </h2>
          <p className="max-w-sm text-black/70 text-sm leading-relaxed">
            {copy.desc[lang]}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-px bg-black/5">
          <div className="lg:col-span-2 bg-white p-8 md:p-12">
            {status === "success" ? (
              <div className="h-full flex items-center justify-center text-center py-16">
                <div>
                  <div className="text-4xl mb-4">✓</div>
                  <p className="text-lg font-bold text-[#0a0a0a] mb-2">{copy.success[lang]}</p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <label className="flex flex-col gap-1.5">
                    <span className="text-xs tracking-widest uppercase text-black/60">
                      {copy.fields.name[lang]}
                    </span>
                    <input
                      type="text"
                      required
                      className="border border-black/10 bg-[#f5f5f0] px-4 py-3 text-sm text-[#0a0a0a] outline-none focus:border-black/40 transition-colors"
                    />
                  </label>
                  <label className="flex flex-col gap-1.5">
                    <span className="text-xs tracking-widest uppercase text-black/60">
                      {copy.fields.phone[lang]}
                    </span>
                    <input
                      type="tel"
                      required
                      className="border border-black/10 bg-[#f5f5f0] px-4 py-3 text-sm text-[#0a0a0a] outline-none focus:border-black/40 transition-colors"
                    />
                  </label>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <label className="flex flex-col gap-1.5">
                    <span className="text-xs tracking-widest uppercase text-black/60">
                      {copy.fields.email[lang]}
                    </span>
                    <input
                      type="email"
                      className="border border-black/10 bg-[#f5f5f0] px-4 py-3 text-sm text-[#0a0a0a] outline-none focus:border-black/40 transition-colors"
                    />
                  </label>
                  <label className="flex flex-col gap-1.5">
                    <span className="text-xs tracking-widest uppercase text-black/60">
                      {copy.fields.volume[lang]}
                    </span>
                    <input
                      type="text"
                      placeholder="ex) 10kg"
                      className="border border-black/10 bg-[#f5f5f0] px-4 py-3 text-sm text-[#0a0a0a] outline-none focus:border-black/40 transition-colors placeholder:text-black/20"
                    />
                  </label>
                </div>
                <label className="flex flex-col gap-1.5">
                  <span className="text-xs tracking-widest uppercase text-black/60">
                    {copy.fields.message[lang]}
                  </span>
                  <textarea
                    rows={4}
                    className="border border-black/10 bg-[#f5f5f0] px-4 py-3 text-sm text-[#0a0a0a] outline-none focus:border-black/40 transition-colors resize-none"
                  />
                </label>
                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="mt-2 bg-black text-white py-4 text-sm tracking-widest uppercase hover:bg-black/80 transition-all disabled:opacity-50"
                >
                  {status === "loading" ? copy.submitting[lang] : copy.submit[lang]}
                </button>
              </form>
            )}
          </div>

          {/* Direct contact */}
          <div className="bg-white p-8 md:p-12 flex flex-col gap-8">
            <div>
              <p className="text-xs tracking-[0.3em] uppercase text-black/70 mb-6">
                {copy.or[lang]}
              </p>
              <div className="flex flex-col gap-6">
                <div>
                  <p className="text-xs text-black/70 mb-1">Instagram</p>
                  <a
                    href="https://instagram.com/faabs_coffee_roasters"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-[#0a0a0a] hover:text-black/70 transition-colors"
                  >
                    @faabs_coffee_roasters
                  </a>
                </div>
                <div>
                  <p className="text-xs text-black/70 mb-1">Naver SmartStore</p>
                  <a
                    href="https://smartstore.naver.com/faabscoffee"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-[#0a0a0a] hover:text-black/70 transition-colors"
                  >
                    smartstore.naver.com/faabscoffee
                  </a>
                </div>
                <div>
                  <p className="text-xs text-black/70 mb-1">{lang === "ko" ? "매장" : lang === "en" ? "Store" : "门店"}</p>
                  <p className="text-sm text-black/60 leading-relaxed">
                    서울 은평구<br />증산로15가길 15, 1층
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
