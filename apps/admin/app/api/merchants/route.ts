import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function POST(req: Request) {
    try {
        const body = await req.json();

        const {
            merchant_id,
            name,
            email,
            password,
            role,
            status,
        } = body as {
            merchant_id?: string;
            name?: string;
            email?: string;
            password?: string;
            role?: string;
            status?: string;
        };

        if (!merchant_id || !name || !email || !password || !role || !status) {
            return NextResponse.json(
                {
                    message:
                        "merchant_id, name, email, password, role, status는 필수입니다.",
                },
                { status: 400 }
            );
        }

        const { data: createdUserData, error: createUserError } =
            await supabaseAdmin.auth.admin.createUser({
                email,
                password,
                email_confirm: true,
                user_metadata: {
                    name,
                    merchant_id,
                    account_role: role,
                },
            });

        if (createUserError || !createdUserData.user) {
            console.error("[POST /api/accounts] createUserError", createUserError);

            return NextResponse.json(
                { message: createUserError?.message ?? "Auth 사용자 생성에 실패했습니다." },
                { status: 500 }
            );
        }

        const authUserId = createdUserData.user.id;

        const { data: accountData, error: accountError } = await supabaseAdmin
            .from("merchant_accounts")
            .insert({
                merchant_id,
                auth_user_id: authUserId,
                name,
                email,
                role,
                status,
            })
            .select("*")
            .single();

        if (accountError) {
            console.error("[POST /api/accounts] accountError", accountError);

            await supabaseAdmin.auth.admin.deleteUser(authUserId);

            return NextResponse.json(
                { message: "가맹점 계정 생성에 실패했습니다." },
                { status: 500 }
            );
        }

        return NextResponse.json({
            data: {
                auth_user_id: authUserId,
                account: accountData,
            },
        });
    } catch (error) {
        console.error("[POST /api/accounts]", error);
        return NextResponse.json(
            { message: "잘못된 요청입니다." },
            { status: 400 }
        );
    }
}