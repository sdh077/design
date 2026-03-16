import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

// 실제 프로젝트 role 값에 맞게 바꿔도 됨.
const MEMBERSHIP_ROLE_BY_ACCOUNT_ROLE: Record<string, string> = {
    OWNER: "owner",
    MANAGER: "manager",
    STAFF: "staff",
};

export async function POST(req: Request) {
    try {
        const body = await req.json();

        const {
            merchant_id,
            workspace_id,
            name,
            email,
            password,
            role,
            status,
        } = body as {
            merchant_id?: string;
            workspace_id?: string;
            name?: string;
            email?: string;
            password?: string;
            role?: string;
            status?: string;
        };

        if (
            !merchant_id ||
            !workspace_id ||
            !name ||
            !email ||
            !password ||
            !role ||
            !status
        ) {
            return NextResponse.json(
                {
                    message:
                        "merchant_id, workspace_id, name, email, password, role, status는 필수입니다.",
                },
                { status: 400 }
            );
        }

        const membershipRole = role;

        // 1) Auth user 생성
        const { data: createdUserData, error: createUserError } =
            await supabaseAdmin.auth.admin.createUser({
                email,
                password,
                email_confirm: true,
                user_metadata: {
                    name,
                    merchant_id,
                    workspace_id,
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

        // 2) memberships 생성
        const { error: membershipError } = await supabaseAdmin
            .from("memberships")
            .insert({
                workspace_id,
                user_id: authUserId,
                role: membershipRole,
            });

        if (membershipError) {
            console.error("[POST /api/accounts] membershipError", membershipError);

            // 롤백: auth user 삭제
            await supabaseAdmin.auth.admin.deleteUser(authUserId);

            return NextResponse.json(
                { message: "워크스페이스 권한 생성에 실패했습니다." },
                { status: 500 }
            );
        }

        // 3) merchant_accounts 생성
        const { data: accountData, error: accountError } = await supabaseAdmin
            .from("merchant_accounts")
            .insert({
                merchant_id,
                name,
                email,
                role,
                status,
            })
            .select("*")
            .single();

        if (accountError) {
            console.error("[POST /api/accounts] accountError", accountError);

            // 롤백: membership + auth user 삭제
            await supabaseAdmin
                .from("memberships")
                .delete()
                .eq("user_id", authUserId)
                .eq("workspace_id", workspace_id);

            await supabaseAdmin.auth.admin.deleteUser(authUserId);

            return NextResponse.json(
                { message: "가맹점 계정 레코드 생성에 실패했습니다." },
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