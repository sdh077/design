"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const menus = [
    { href: "/merchants", label: "가맹점 관리" },
    { href: "/stores", label: "매장 관리" },
    { href: "/accounts", label: "계정 관리" },
];

export default function AdminSidebar() {
    const pathname = usePathname();

    return (
        <aside className="flex h-screen w-64 flex-col border-r border-border bg-card">
            <div className="border-b border-border px-6 py-5">
                <h1 className="text-lg font-semibold text-foreground">Toss Admin</h1>
                <p className="mt-1 text-sm text-muted-foreground">운영 관리 시스템</p>
            </div>

            <nav className="flex flex-1 flex-col gap-1 p-3">
                {menus.map((menu) => {
                    const active = pathname.startsWith(menu.href);

                    return (
                        <Link
                            key={menu.href}
                            href={menu.href}
                            className={`rounded-lg px-3 py-2 text-sm font-medium transition ${active
                                ? "bg-primary text-primary-foreground"
                                : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                }`}
                        >
                            {menu.label}
                        </Link>
                    );
                })}
            </nav>
        </aside>
    );
}