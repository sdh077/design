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

export default function AppLayout({
    children,
}: {
    children: React.ReactNode;
}) {
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

                    <div className="rounded-full border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-sm text-zinc-300">
                        Owner
                    </div>
                </Topbar>

                <main className="flex-1 p-6">{children}</main>
            </div>
        </div>
    );
}