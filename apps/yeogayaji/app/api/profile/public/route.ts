import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

function normalizeHandle(value: string) {
    return value
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-_]/g, "");
}

export async function PUT(req: NextRequest) {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ message: "로그인이 필요합니다." }, { status: 401 });
    }

    const body = (await req.json().catch(() => null)) as
        | {
            handle?: string;
            display_name?: string | null;
            bio?: string | null;
            is_public?: boolean;
        }
        | null;

    const handle = normalizeHandle(body?.handle ?? "");

    if (!handle) {
        return NextResponse.json(
            { message: "공개 아이디를 입력해 주세요." },
            { status: 400 }
        );
    }

    if (handle.length < 3) {
        return NextResponse.json(
            { message: "공개 아이디는 3자 이상이어야 합니다." },
            { status: 400 }
        );
    }

    const payload = {
        id: user.id,
        handle,
        display_name: body?.display_name?.trim() || null,
        bio: body?.bio?.trim() || null,
        is_public: Boolean(body?.is_public),
    };

    const { error } = await supabase.from("profiles").upsert(payload);

    if (error) {
        if (error.code === "23505") {
            return NextResponse.json(
                { message: "이미 사용 중인 공개 아이디입니다." },
                { status: 409 }
            );
        }

        return NextResponse.json(
            { message: error.message ?? "프로필 저장에 실패했습니다." },
            { status: 500 }
        );
    }

    return NextResponse.json({ ok: true });
}