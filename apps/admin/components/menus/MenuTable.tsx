import type { Menu } from "@/lib/types/menu";
import MenuStatusBadge from "./MenuStatusBadge";

interface MenuTableProps {
    menus: Menu[];
}

export default function MenuTable({ menus }: MenuTableProps) {
    return (
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
            <table className="min-w-full text-sm">
                <thead className="bg-muted/40 text-left text-muted-foreground">
                    <tr className="border-b border-border">
                        <th className="px-4 py-3 font-medium">메뉴명</th>
                        <th className="px-4 py-3 font-medium">상태</th>
                        <th className="px-4 py-3 font-medium">생성일</th>
                    </tr>
                </thead>

                <tbody>
                    {menus.map((menu) => (
                        <tr
                            key={menu.id}
                            className="border-b border-border/70 last:border-b-0"
                        >
                            <td className="px-4 py-3 font-medium text-foreground">
                                {menu.name}
                            </td>
                            <td className="px-4 py-3">
                                <MenuStatusBadge isActive={menu.is_active} />
                            </td>
                            <td className="px-4 py-3 text-muted-foreground">
                                {new Date(menu.created_at).toLocaleDateString("ko-KR")}
                            </td>
                        </tr>
                    ))}

                    {menus.length === 0 && (
                        <tr>
                            <td
                                colSpan={3}
                                className="px-4 py-10 text-center text-muted-foreground"
                            >
                                등록된 메뉴가 없습니다.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}