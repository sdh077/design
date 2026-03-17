import { InputHTMLAttributes, ReactNode } from "react";
import Link from "next/link";

type DSSectionProps = {
  title: string;
  children: ReactNode;
};

export function DSSection({ title, children }: DSSectionProps) {
  return (
    <section className="space-y-6">
      <div className="flex items-end justify-between gap-4">
        <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
        <Link
          href="/"
          className="text-sm text-neutral-500 transition hover:text-neutral-300"
        >
          포트폴리오로 돌아가기
        </Link>
      </div>
      {children}
    </section>
  );
}

type DSColorChipProps = {
  name: string;
  value: string;
  previewClass: string;
};

export function DSColorChip({ name, value, previewClass }: DSColorChipProps) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-4">
      <div className={`h-24 rounded-2xl border border-white/10 ${previewClass}`} />
      <div className="mt-4">
        <div className="font-medium">{name}</div>
        <div className="mt-1 text-sm text-neutral-500">{value}</div>
      </div>
    </div>
  );
}

type DSButtonProps = {
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost";
};

export function DSButton({
  children,
  variant = "primary",
}: DSButtonProps) {
  const styles = {
    primary:
      "bg-white text-black hover:opacity-90",
    secondary:
      "border border-white/10 bg-white/[0.04] text-white hover:bg-white/[0.08]",
    ghost:
      "text-neutral-300 hover:bg-white/[0.06]",
  };

  return (
    <button
      className={`rounded-2xl px-5 py-3 text-sm font-medium transition ${styles[variant]}`}
    >
      {children}
    </button>
  );
}

type DSCardProps = {
  title: string;
  description: string;
};

export function DSCard({ title, description }: DSCardProps) {
  return (
    <article className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
      <h3 className="text-xl font-semibold tracking-tight">{title}</h3>
      <p className="mt-4 leading-7 text-neutral-400">{description}</p>
      <div className="mt-6 flex flex-wrap gap-2">
        <DSBadge>TypeScript</DSBadge>
        <DSBadge>React</DSBadge>
        <DSBadge>GSAP</DSBadge>
      </div>
    </article>
  );
}

type DSBadgeProps = {
  children: ReactNode;
};

export function DSBadge({ children }: DSBadgeProps) {
  return (
    <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-sm text-neutral-300">
      {children}
    </span>
  );
}

export function DSInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className="h-12 rounded-2xl border border-white/10 bg-white/[0.03] px-4 text-sm text-white outline-none placeholder:text-neutral-500 focus:border-white/20"
    />
  );
}

type DSSectionTitleProps = {
  eyebrow: string;
  title: string;
  description: string;
};

export function DSSectionTitle({
  eyebrow,
  title,
  description,
}: DSSectionTitleProps) {
  return (
    <div className="max-w-3xl">
      <p className="text-sm uppercase tracking-[0.2em] text-neutral-500">
        {eyebrow}
      </p>
      <h3 className="mt-3 text-3xl font-semibold tracking-tight">{title}</h3>
      <p className="mt-4 leading-7 text-neutral-400">{description}</p>
    </div>
  );
}