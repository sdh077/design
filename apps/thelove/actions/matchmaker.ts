"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth/guard";
import { createMatchmakerCodeForUser } from "@/lib/db/matchmaker";

function getOptionalNumber(formData: FormData, key: string) {
  const raw = String(formData.get(key) ?? "").trim();
  if (!raw) return null;

  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : null;
}

export async function createInviteCodeAction(formData: FormData) {
  const { profile } = await requireRole(["matchmaker", "admin"]);
  const expiresInDays = getOptionalNumber(formData, "expiresInDays");

  try {
    await createMatchmakerCodeForUser(profile.id, expiresInDays);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "코드 생성에 실패했습니다.";
    redirect(`/matchmaker/codes?error=${encodeURIComponent(message)}`);
  }

  revalidatePath("/matchmaker");
  revalidatePath("/matchmaker/codes");
  redirect("/matchmaker/codes?created=1");
}
