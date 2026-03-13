"use client";

import { useState } from "react";
import { Button, Input } from "@workspace/ui";

type WorkspaceOption = {
    id: string;
    name: string;
};

export function CreateStoreForm({
    workspaces,
}: {
    workspaces: WorkspaceOption[];
}) {
    const [workspaceId, setWorkspaceId] = useState(workspaces[0]?.id ?? "");
    const [name, setName] = useState("");
    const [code, setCode] = useState("");
    const [timezone, setTimezone] = useState("Asia/Seoul");
    const [loading, setLoading] = useState(false);

    const onSubmit = async () => {
        try {
            setLoading(true);

            const res = await fetch("/api/stores", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    workspaceId,
                    name,
                    code,
                    timezone,
                }),
            });

            const json = await res.json();

            if (!res.ok || !json.ok) {
                throw new Error(json.message ?? "매장 생성 실패");
            }

            window.location.reload();
        } catch (error) {
            alert(error instanceof Error ? error.message : "매장 생성 실패");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-3">
            <select
                className="h-10 w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 text-sm text-zinc-100 outline-none focus:ring-2 focus:ring-zinc-600"
                value={workspaceId}
                onChange={(e) => setWorkspaceId(e.target.value)}
            >
                {workspaces.map((workspace) => (
                    <option key={workspace.id} value={workspace.id}>
                        {workspace.name}
                    </option>
                ))}
            </select>

            <Input
                placeholder="매장명"
                value={name}
                onChange={(e) => setName(e.target.value)}
            />

            <Input
                placeholder="코드(선택)"
                value={code}
                onChange={(e) => setCode(e.target.value)}
            />

            <Input
                placeholder="Timezone"
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
            />

            <Button onClick={onSubmit} disabled={loading || !workspaceId || !name}>
                {loading ? "생성 중..." : "매장 생성"}
            </Button>
        </div>
    );
}