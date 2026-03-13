import Link from "next/link";
import * as React from "react";

type NavLinkProps = {
  href: string;
  children: React.ReactNode;
  active?: boolean;
};

export function NavLink({ href, children, active = false }: NavLinkProps) {
  return (
    <Link
      href={href}
      className={[
        "flex items-center rounded-xl px-3 py-2 text-sm font-medium transition",
        active
          ? "bg-zinc-800 text-zinc-100"
          : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100",
      ].join(" ")}
    >
      {children}
    </Link>
  );
}