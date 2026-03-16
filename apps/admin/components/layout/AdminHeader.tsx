export default function AdminHeader() {
    return (
        <header className="flex h-16 items-center justify-between border-b border-border bg-card px-6">
            <div>
                <p className="text-sm text-muted-foreground">토스 연동 운영</p>
                <h2 className="text-base font-semibold text-foreground">
                    가맹점 어드민
                </h2>
            </div>
        </header>
    );
}