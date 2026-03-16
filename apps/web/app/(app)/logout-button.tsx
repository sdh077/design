"use client";

import { Button } from "@workspace/ui";
import { createClient } from "@/lib/supabase/browser";
import { useState } from "react";

export function LogoutButton() {
    const [loading, setLoading] = useState(false);

    const onLogout = async () => {
        try {
            setLoading(true);
            const supabase = createClient();
            await supabase.auth.signOut();
            window.location.href = "/login";
        } finally {
            setLoading(false);
        }
    };

    return (
        <Button variant="outline" onClick={onLogout} disabled={loading}>
            {loading ? "로그아웃 중..." : "로그아웃"}
        </Button>
    );
}