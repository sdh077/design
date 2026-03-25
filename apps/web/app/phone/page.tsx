"use client";

import { useEffect, useMemo, useState } from "react";

type SavedSlot = {
    name: string;
    data: FormState;
    savedAt: string;
};

type FormState = {
    contractMonths: string;

    selfPhonePrice: string;
    selfMonthlyPlan: string;

    agencyPhonePrice: string;
    agencyMaintainMonths: string;
    agencyMaintainPlan: string;
    agencyAfterPlan: string;
    agencyBenefitPerMonth: string;
    agencyCardDiscountPerMonth: string;
};

type SlotMap = {
    slot1: SavedSlot | null;
    slot2: SavedSlot | null;
    slot3: SavedSlot | null;
};

const STORAGE_KEY = "phone-compare-slots-v1";

function toNumber(value: string) {
    const num = Number(value.replaceAll(",", ""));
    return Number.isNaN(num) ? 0 : num;
}

function formatNumber(value: number) {
    return new Intl.NumberFormat("ko-KR").format(value);
}

function getDefaultFormState(): FormState {
    return {
        contractMonths: "24",

        selfPhonePrice: "1200000",
        selfMonthlyPlan: "60000",

        agencyPhonePrice: "900000",
        agencyMaintainMonths: "6",
        agencyMaintainPlan: "95000",
        agencyAfterPlan: "55000",
        agencyBenefitPerMonth: "15000",
        agencyCardDiscountPerMonth: "10000",
    };
}

function getDefaultSlots(): SlotMap {
    return {
        slot1: null,
        slot2: null,
        slot3: null,
    };
}

export default function HomePage() {
    const [form, setForm] = useState<FormState>(getDefaultFormState());
    const [slots, setSlots] = useState<SlotMap>(getDefaultSlots());
    const [slotName, setSlotName] = useState("");

    useEffect(() => {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return;

        try {
            const parsed = JSON.parse(raw) as SlotMap;
            setSlots({
                slot1: parsed.slot1 ?? null,
                slot2: parsed.slot2 ?? null,
                slot3: parsed.slot3 ?? null,
            });
        } catch {
            setSlots(getDefaultSlots());
        }
    }, []);

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(slots));
    }, [slots]);

    const result = useMemo(() => {
        const months = Math.max(toNumber(form.contractMonths), 0);

        const selfPlanTotal = toNumber(form.selfMonthlyPlan) * months;
        const selfTotal = toNumber(form.selfPhonePrice) + selfPlanTotal;

        const agencyMaintain = Math.max(toNumber(form.agencyMaintainMonths), 0);
        const safeMaintainMonths = Math.min(agencyMaintain, months);
        const agencyRemainMonths = Math.max(months - safeMaintainMonths, 0);

        const agencyPlanTotal =
            toNumber(form.agencyMaintainPlan) * safeMaintainMonths +
            toNumber(form.agencyAfterPlan) * agencyRemainMonths;

        const agencyBenefitTotal = toNumber(form.agencyBenefitPerMonth) * months;
        const agencyCardDiscountTotal =
            toNumber(form.agencyCardDiscountPerMonth) * months;

        const agencyBaseTotal = toNumber(form.agencyPhonePrice) + agencyPlanTotal;

        const agencyTotal = Math.max(
            agencyBaseTotal - agencyBenefitTotal - agencyCardDiscountTotal,
            0
        );

        const diff = selfTotal - agencyTotal;

        return {
            selfPlanTotal,
            selfTotal,
            agencyRemainMonths,
            safeMaintainMonths,
            agencyPlanTotal,
            agencyBenefitTotal,
            agencyCardDiscountTotal,
            agencyBaseTotal,
            agencyTotal,
            diff,
        };
    }, [form]);

    const diffText =
        result.diff > 0
            ? "통신사 구매가 더 저렴"
            : result.diff < 0
                ? "자급제가 더 저렴"
                : "두 방식의 총비용이 동일";

    function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
        setForm((prev) => ({
            ...prev,
            [key]: value,
        }));
    }

    function saveToSlot(slotKey: keyof SlotMap) {
        const finalName =
            slotName.trim() ||
            `비교안 ${slotKey === "slot1" ? "1" : slotKey === "slot2" ? "2" : "3"}`;

        setSlots((prev) => ({
            ...prev,
            [slotKey]: {
                name: finalName,
                data: form,
                savedAt: new Date().toLocaleString("ko-KR"),
            },
        }));
    }

    function loadFromSlot(slotKey: keyof SlotMap) {
        const slot = slots[slotKey];
        if (!slot) return;
        setForm(slot.data);
    }

    function deleteSlot(slotKey: keyof SlotMap) {
        setSlots((prev) => ({
            ...prev,
            [slotKey]: null,
        }));
    }

    function resetForm() {
        setForm(getDefaultFormState());
    }

    return (
        <main className="min-h-screen bg-[#0a0a0b] px-6 py-10 text-white">
            <div className="mx-auto max-w-7xl">
                <div className="mb-8">
                    <p className="mb-2 inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70">
                        휴대폰 구매 비교 계산기
                    </p>
                    <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
                        자급제 vs 통신사 구매 비교
                    </h1>
                    <p className="mt-3 text-sm text-white/60 md:text-base">
                        휴대폰 자급제와 통신사 구매 중 어떤 방식이 더 저렴한지 실제
                        총비용으로 비교해보세요.
                    </p>
                </div>

                <section className="mb-6 rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-black/20">
                    <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                        <div>
                            <h2 className="text-lg font-semibold">비교안 저장 슬롯</h2>
                            <p className="mt-1 text-sm text-white/55">
                                현재 입력값을 저장해두고 나중에 다시 불러올 수 있어요.
                            </p>
                        </div>

                        <div className="w-full md:w-[320px]">
                            <label className="mb-2 block text-sm font-medium text-white/80">
                                저장 이름
                            </label>
                            <input
                                value={slotName}
                                onChange={(e) => setSlotName(e.target.value)}
                                placeholder="예: 아이폰 16 자급제안"
                                className="w-full rounded-2xl border border-white/10 bg-[#111114] px-4 py-3 text-white outline-none placeholder:text-white/25 focus:border-emerald-400/60"
                            />
                        </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-3">
                        <SlotCard
                            title="슬롯 1"
                            slot={slots.slot1}
                            onSave={() => saveToSlot("slot1")}
                            onLoad={() => loadFromSlot("slot1")}
                            onDelete={() => deleteSlot("slot1")}
                        />
                        <SlotCard
                            title="슬롯 2"
                            slot={slots.slot2}
                            onSave={() => saveToSlot("slot2")}
                            onLoad={() => loadFromSlot("slot2")}
                            onDelete={() => deleteSlot("slot2")}
                        />
                        <SlotCard
                            title="슬롯 3"
                            slot={slots.slot3}
                            onSave={() => saveToSlot("slot3")}
                            onLoad={() => loadFromSlot("slot3")}
                            onDelete={() => deleteSlot("slot3")}
                        />
                    </div>

                    <div className="mt-4 flex gap-3">
                        <button
                            onClick={resetForm}
                            className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/85 transition hover:bg-white/10"
                        >
                            기본값으로 초기화
                        </button>
                    </div>
                </section>

                <div className="mb-6 rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-black/20">
                    <h2 className="mb-4 text-lg font-semibold text-white">공통 입력</h2>
                    <div className="grid gap-4 md:grid-cols-2">
                        <InputField
                            label="약정 개월 수"
                            value={form.contractMonths}
                            onChange={(value) => updateField("contractMonths", value)}
                            suffix="개월"
                        />
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                    <section className="rounded-3xl border border-cyan-400/20 bg-gradient-to-b from-cyan-500/10 to-transparent p-6 shadow-2xl shadow-cyan-950/20">
                        <div className="mb-5 flex items-center justify-between">
                            <div>
                                <p className="text-sm text-cyan-300">Case 1</p>
                                <h2 className="text-2xl font-bold text-white">자급제</h2>
                            </div>
                            <span className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-xs text-cyan-200">
                                단순 구매 방식
                            </span>
                        </div>

                        <div className="space-y-4">
                            <InputField
                                label="구매 가격"
                                value={form.selfPhonePrice}
                                onChange={(value) => updateField("selfPhonePrice", value)}
                                suffix="원"
                            />
                            <InputField
                                label="월 요금제"
                                value={form.selfMonthlyPlan}
                                onChange={(value) => updateField("selfMonthlyPlan", value)}
                                suffix="원"
                            />
                        </div>

                        <div className="mt-6 rounded-2xl border border-cyan-300/15 bg-black/20 p-4">
                            <h3 className="mb-3 text-sm font-semibold text-cyan-200">
                                계산 결과
                            </h3>
                            <div className="space-y-3 text-sm text-white/75">
                                <Row
                                    label="휴대폰 가격"
                                    value={`${formatNumber(toNumber(form.selfPhonePrice))}원`}
                                />
                                <Row
                                    label="요금제 총합"
                                    value={`${formatNumber(result.selfPlanTotal)}원`}
                                />
                                <Row
                                    label="총비용"
                                    value={`${formatNumber(result.selfTotal)}원`}
                                    strong
                                />
                            </div>
                        </div>
                    </section>

                    <section className="rounded-3xl border border-violet-400/20 bg-gradient-to-b from-violet-500/10 to-transparent p-6 shadow-2xl shadow-violet-950/20">
                        <div className="mb-5 flex items-center justify-between">
                            <div>
                                <p className="text-sm text-violet-300">Case 2</p>
                                <h2 className="text-2xl font-bold text-white">통신사 구매</h2>
                            </div>
                            <span className="rounded-full border border-violet-300/20 bg-violet-300/10 px-3 py-1 text-xs text-violet-200">
                                약정 / 혜택 포함
                            </span>
                        </div>

                        <div className="space-y-4">
                            <InputField
                                label="휴대폰 가격"
                                value={form.agencyPhonePrice}
                                onChange={(value) => updateField("agencyPhonePrice", value)}
                                suffix="원"
                            />

                            <InputField
                                label="유지 개월 수"
                                value={form.agencyMaintainMonths}
                                onChange={(value) => updateField("agencyMaintainMonths", value)}
                                suffix="개월"
                            />

                            <InputField
                                label="유지 기간 월 요금제"
                                value={form.agencyMaintainPlan}
                                onChange={(value) => updateField("agencyMaintainPlan", value)}
                                suffix="원"
                            />

                            <InputField
                                label="유지 이후 월 요금제"
                                value={form.agencyAfterPlan}
                                onChange={(value) => updateField("agencyAfterPlan", value)}
                                suffix="원"
                            />

                            <InputField
                                label="통신사별 혜택 월 예상액"
                                value={form.agencyBenefitPerMonth}
                                onChange={(value) => updateField("agencyBenefitPerMonth", value)}
                                suffix="원"
                            />

                            <InputField
                                label="카드 할인"
                                value={form.agencyCardDiscountPerMonth}
                                onChange={(value) =>
                                    updateField("agencyCardDiscountPerMonth", value)
                                }
                                suffix="원/월"
                            />
                        </div>

                        <div className="mt-6 rounded-2xl border border-violet-300/15 bg-black/20 p-4">
                            <h3 className="mb-3 text-sm font-semibold text-violet-200">
                                계산 결과
                            </h3>
                            <div className="space-y-3 text-sm text-white/75">
                                <Row
                                    label="유지 개월 수 반영"
                                    value={`${formatNumber(result.safeMaintainMonths)}개월`}
                                />
                                <Row
                                    label="유지 이후 개월 수"
                                    value={`${formatNumber(result.agencyRemainMonths)}개월`}
                                />
                                <Row
                                    label="요금제 총합"
                                    value={`${formatNumber(result.agencyPlanTotal)}원`}
                                />
                                <Row
                                    label="통신사 혜택 총합"
                                    value={`- ${formatNumber(result.agencyBenefitTotal)}원`}
                                />
                                <Row
                                    label="카드 할인 총합"
                                    value={`- ${formatNumber(result.agencyCardDiscountTotal)}원`}
                                />
                                <Row
                                    label="할인 전 총비용"
                                    value={`${formatNumber(result.agencyBaseTotal)}원`}
                                />
                                <Row
                                    label="총비용"
                                    value={`${formatNumber(result.agencyTotal)}원`}
                                    strong
                                />
                            </div>
                        </div>
                    </section>
                </div>

                <section className="mt-8 rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-black/20">
                    <div className="mb-4 flex items-center justify-between gap-3">
                        <div>
                            <p className="text-sm text-white/50">Summary</p>
                            <h2 className="text-2xl font-bold text-white">최종 비교</h2>
                        </div>
                        <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs text-emerald-300">
                            {diffText}
                        </span>
                    </div>

                    <div className="grid gap-4 md:grid-cols-3">
                        <SummaryCard
                            title="자급제 총비용"
                            value={`${formatNumber(result.selfTotal)}원`}
                        />
                        <SummaryCard
                            title="통신사 총비용"
                            value={`${formatNumber(result.agencyTotal)}원`}
                        />
                        <SummaryCard
                            title="차액"
                            value={`${formatNumber(Math.abs(result.diff))}원`}
                            description={diffText}
                            highlight
                        />
                    </div>
                </section>

                <section className="mt-8 rounded-3xl border border-amber-400/20 bg-gradient-to-b from-amber-500/10 to-transparent p-6 shadow-2xl shadow-amber-950/20">
                    <div className="mb-5">
                        <p className="text-sm text-amber-300">추천 상품</p>
                        <h2 className="text-2xl font-bold text-white">
                            쿠팡 파트너스 추천 링크
                        </h2>
                        <p className="mt-2 text-sm text-white/60">
                            자급제폰, 액세서리, 충전기 등을 함께 비교할 수 있도록 추천 링크를
                            넣을 수 있어요.
                        </p>
                    </div>

                    <div className="grid gap-4 md:grid-cols-3">
                        <AffiliateCard
                            title="자급제 아이폰 보러가기"
                            description="최신 자급제 아이폰 모델을 비교해보세요."
                            href="https://link.coupang.com/a/여기에-파트너스-링크1"
                        />
                        <AffiliateCard
                            title="자급제 갤럭시 보러가기"
                            description="갤럭시 자급제 모델과 특가 상품을 확인해보세요."
                            href="https://link.coupang.com/a/여기에-파트너스-링크2"
                        />
                        <AffiliateCard
                            title="충전기 / 액세서리 보기"
                            description="충전기, 케이스, 보호필름 등 함께 필요한 상품."
                            href="https://link.coupang.com/a/여기에-파트너스-링크3"
                        />
                    </div>

                    <p className="mt-4 text-xs leading-6 text-white/45">
                        이 포스팅은 쿠팡 파트너스 활동의 일환으로, 이에 따른 일정액의
                        수수료를 제공받을 수 있습니다.
                    </p>
                </section>
            </div>
        </main>
    );
}

function InputField({
    label,
    value,
    onChange,
    suffix,
}: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    suffix?: string;
}) {
    return (
        <div>
            <label className="mb-2 block text-sm font-medium text-white/80">
                {label}
            </label>
            <div className="relative">
                <input
                    type="number"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-[#111114] px-4 py-3 pr-20 text-white outline-none transition placeholder:text-white/25 focus:border-cyan-400/60"
                    placeholder="숫자를 입력하세요"
                />
                {suffix && (
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-white/40">
                        {suffix}
                    </span>
                )}
            </div>
        </div>
    );
}

function Row({
    label,
    value,
    strong = false,
}: {
    label: string;
    value: string;
    strong?: boolean;
}) {
    return (
        <div className="flex items-center justify-between gap-4 border-b border-white/5 pb-3 last:border-b-0 last:pb-0">
            <span className="text-white/60">{label}</span>
            <span className={strong ? "font-bold text-white" : "text-white/85"}>
                {value}
            </span>
        </div>
    );
}

function SummaryCard({
    title,
    value,
    description,
    highlight = false,
}: {
    title: string;
    value: string;
    description?: string;
    highlight?: boolean;
}) {
    return (
        <div
            className={[
                "rounded-2xl border p-5",
                highlight
                    ? "border-emerald-400/20 bg-emerald-400/10"
                    : "border-white/10 bg-[#101013]",
            ].join(" ")}
        >
            <p className="text-sm text-white/50">{title}</p>
            <p className="mt-2 text-2xl font-bold text-white">{value}</p>
            {description && (
                <p className="mt-2 text-sm text-white/65">{description}</p>
            )}
        </div>
    );
}

function SlotCard({
    title,
    slot,
    onSave,
    onLoad,
    onDelete,
}: {
    title: string;
    slot: SavedSlot | null;
    onSave: () => void;
    onLoad: () => void;
    onDelete: () => void;
}) {
    return (
        <div className="rounded-2xl border border-white/10 bg-[#101013] p-5">
            <div className="mb-3 flex items-center justify-between">
                <h3 className="font-semibold text-white">{title}</h3>
                <span className="text-xs text-white/35">
                    {slot ? "저장됨" : "비어있음"}
                </span>
            </div>

            {slot ? (
                <div className="mb-4 space-y-1 text-sm text-white/65">
                    <p className="font-medium text-white">{slot.name}</p>
                    <p>저장 시간: {slot.savedAt}</p>
                    <p>약정: {slot.data.contractMonths}개월</p>
                </div>
            ) : (
                <div className="mb-4 text-sm text-white/40">
                    현재 저장된 비교안이 없습니다.
                </div>
            )}

            <div className="flex flex-wrap gap-2">
                <button
                    onClick={onSave}
                    className="rounded-xl bg-emerald-500 px-3 py-2 text-sm font-medium text-black transition hover:bg-emerald-400"
                >
                    저장
                </button>
                <button
                    onClick={onLoad}
                    disabled={!slot}
                    className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
                >
                    불러오기
                </button>
                <button
                    onClick={onDelete}
                    disabled={!slot}
                    className="rounded-xl border border-red-400/20 bg-red-500/10 px-3 py-2 text-sm text-red-300 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-40"
                >
                    삭제
                </button>
            </div>
        </div>
    );
}

function AffiliateCard({
    title,
    description,
    href,
}: {
    title: string;
    description: string;
    href: string;
}) {
    return (
        <a
            href={href}
            target="_blank"
            rel="noopener noreferrer sponsored"
            className="group rounded-2xl border border-white/10 bg-[#101013] p-5 transition hover:border-amber-300/30 hover:bg-[#141419]"
        >
            <p className="text-lg font-semibold text-white">{title}</p>
            <p className="mt-2 text-sm leading-6 text-white/60">{description}</p>
            <div className="mt-4 text-sm font-medium text-amber-300 group-hover:text-amber-200">
                상품 보러가기 →
            </div>
        </a>
    );
}