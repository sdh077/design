import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function POST(req: Request) {
    try {
        const body = await req.json();

        const {
            name,
            owner_name,
            business_number,
            phone,
            email,
            status,
        } = body as {
            name?: string;
            owner_name?: string;
            business_number?: string;
            phone?: string;
            email?: string;
            status?: string;
        };

        if (!name || !owner_name || !business_number || !status) {
            return NextResponse.json(
                {
                    message:
                        "name, owner_name, business_number, status는 필수입니다.",
                },
                { status: 400 }
            );
        }

        const { data, error } = await supabaseAdmin
            .from("merchants")
            .insert({
                name,
                owner_name,
                business_number,
                phone: phone || null,
                email: email || null,
                status,
            })
            .select("*")
            .single();

        if (error) {
            console.error("[POST /api/merchants]", error);

            if (error.code === "23505") {
                return NextResponse.json(
                    { message: "이미 등록된 사업자번호입니다." },
                    { status: 409 }
                );
            }

            return NextResponse.json(
                { message: "가맹점 생성에 실패했습니다." },
                { status: 500 }
            );
        }

        return NextResponse.json({ data });
    } catch (error) {
        console.error("[POST /api/merchants]", error);
        return NextResponse.json(
            { message: "잘못된 요청입니다." },
            { status: 400 }
        );
    }
}