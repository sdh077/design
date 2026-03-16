import Link from "next/link";
import {
    NavLink,
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupLabel,
    SidebarHeader,
    Topbar,
} from "@workspace/ui";
import { createClient } from "@/lib/supabase/server";
import { LogoutButton } from "./logout-button";

export default async function AppLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    return (
        <div className="flex min-h-screen bg-zinc-950 text-zinc-100">
            <Sidebar>
                <SidebarHeader>
                    <Link href="/dashboard" className="block">
                        <div className="text-lg font-semibold">FM</div>
                        <div className="text-xs text-zinc-500">F&B Operations SaaS</div>
                    </Link>
                </SidebarHeader>

                <SidebarContent>
                    <SidebarGroup>
                        <SidebarGroupLabel>Overview</SidebarGroupLabel>
                        <div className="space-y-1">
                            <NavLink href="/dashboard">대시보드</NavLink>
                        </div>
                    </SidebarGroup>

                    <SidebarGroup>
                        <SidebarGroupLabel>Operations</SidebarGroupLabel>
                        <div className="space-y-1">
                            <NavLink href="/stores">매장 관리</NavLink>
                            <NavLink href="/pos-connections">POS 연결</NavLink>
                        </div>
                    </SidebarGroup>

                    <SidebarGroup>
                        <SidebarGroupLabel>Inventory</SidebarGroupLabel>
                        <div className="space-y-1">
                            <NavLink href="/menus">메뉴</NavLink>
                            <NavLink href="/inventory">재고</NavLink>
                            <NavLink href="/recipes">레시피</NavLink>
                            <NavLink href="/consumption">소모량</NavLink>
                            <NavLink href="/recipe-calibration">레시피 보정</NavLink>
                        </div>
                    </SidebarGroup>
                </SidebarContent>
            </Sidebar>

            <div className="flex min-w-0 flex-1 flex-col">
                <Topbar>
                    <div>
                        <div className="text-sm font-medium text-zinc-100">FM Admin</div>
                        <div className="text-xs text-zinc-500">운영 대시보드</div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="rounded-full border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-sm text-zinc-300">
                            {user?.email ?? "Unknown"}
                        </div>
                        <LogoutButton />
                    </div>
                </Topbar>

                <main className="flex-1 p-6">{children}</main>
            </div>
        </div>
    );
}