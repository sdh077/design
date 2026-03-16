import AdminHeader from "@/components/layout/AdminHeader";
import AdminSidebar from "@/components/layout/AdminSidebar";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen bg-background text-foreground">
            <AdminSidebar />
            <div className="flex min-w-0 flex-1 flex-col">
                <AdminHeader />
                <main className="flex-1 p-6">{children}</main>
            </div>
        </div>
    );
}