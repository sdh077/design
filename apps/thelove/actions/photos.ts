"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth/guard";
import { createAdminClient } from "@/lib/supabase/admin";
import { getMemberPhotosBucket } from "@/lib/supabase/storage";

function sanitizeFileName(fileName: string) {
  return fileName.replace(/[^a-zA-Z0-9.\-_]/g, "-").toLowerCase();
}

export async function uploadPhotoAction(formData: FormData) {
  try {
    const { user } = await requireUser();
    const admin = createAdminClient();
    const file = formData.get("photo");
    const setPrimary = formData.get("setPrimary") === "on";

    if (!(file instanceof File) || file.size === 0) {
      redirect("/member/profile/photos?error=업로드할 이미지 파일을 선택해 주세요.");
    }

    if (!file.type.startsWith("image/")) {
      redirect("/member/profile/photos?error=이미지 파일만 업로드할 수 있습니다.");
    }

    const { data: existingPhotos, error: existingError } = await admin
      .from("member_photos")
      .select("id, sort_order, is_primary")
      .eq("user_id", user.id)
      .order("sort_order", { ascending: false });

    if (existingError) {
      redirect(
        `/member/profile/photos?error=${encodeURIComponent(existingError.message)}`
      );
    }

    const sortOrder = (existingPhotos?.[0]?.sort_order ?? -1) + 1;
    const shouldBePrimary = setPrimary || (existingPhotos?.length ?? 0) === 0;
    const storagePath = `${user.id}/${Date.now()}-${sanitizeFileName(file.name)}`;
    const bytes = new Uint8Array(await file.arrayBuffer());

    const { error: uploadError } = await admin.storage
      .from(getMemberPhotosBucket())
      .upload(storagePath, bytes, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      redirect(
        `/member/profile/photos?error=${encodeURIComponent(uploadError.message)}`
      );
    }

    if (shouldBePrimary) {
      const { error: resetError } = await admin
        .from("member_photos")
        .update({ is_primary: false })
        .eq("user_id", user.id);

      if (resetError) {
        redirect(
          `/member/profile/photos?error=${encodeURIComponent(resetError.message)}`
        );
      }
    }

    const { error: insertError } = await admin.from("member_photos").insert({
      user_id: user.id,
      storage_path: storagePath,
      sort_order: sortOrder,
      is_primary: shouldBePrimary,
    });

    if (insertError) {
      redirect(
        `/member/profile/photos?error=${encodeURIComponent(insertError.message)}`
      );
    }

    revalidatePath("/member/profile/photos");
    revalidatePath("/onboarding");
    revalidatePath("/member/matches");
    redirect("/member/profile/photos?uploaded=1");
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "사진 업로드 중 오류가 발생했습니다.";
    redirect(`/member/profile/photos?error=${encodeURIComponent(message)}`);
  }
}

export async function setPrimaryPhotoAction(formData: FormData) {
  const { user } = await requireUser();
  const admin = createAdminClient();
  const photoId = String(formData.get("photoId") ?? "").trim();

  if (!photoId) {
    redirect("/member/profile/photos?error=대표 사진 정보가 올바르지 않습니다.");
  }

  const { error: resetError } = await admin
    .from("member_photos")
    .update({ is_primary: false })
    .eq("user_id", user.id);

  if (resetError) {
    redirect(`/member/profile/photos?error=${encodeURIComponent(resetError.message)}`);
  }

  const { error: updateError } = await admin
    .from("member_photos")
    .update({ is_primary: true })
    .eq("id", photoId)
    .eq("user_id", user.id);

  if (updateError) {
    redirect(`/member/profile/photos?error=${encodeURIComponent(updateError.message)}`);
  }

  revalidatePath("/member/profile/photos");
  revalidatePath("/member/matches");
  redirect("/member/profile/photos?primaryUpdated=1");
}

export async function movePhotoAction(formData: FormData) {
  const { user } = await requireUser();
  const admin = createAdminClient();
  const photoId = String(formData.get("photoId") ?? "").trim();
  const direction = String(formData.get("direction") ?? "").trim();

  if (!photoId || !["up", "down"].includes(direction)) {
    redirect("/member/profile/photos?error=사진 순서 변경 정보가 올바르지 않습니다.");
  }

  const { data: photos, error } = await admin
    .from("member_photos")
    .select("*")
    .eq("user_id", user.id)
    .order("sort_order", { ascending: true });

  if (error) {
    redirect(`/member/profile/photos?error=${encodeURIComponent(error.message)}`);
  }

  const rows = photos ?? [];
  const index = rows.findIndex((photo) => photo.id === photoId);

  if (index === -1) {
    redirect("/member/profile/photos?error=사진을 찾지 못했습니다.");
  }

  const targetIndex = direction === "up" ? index - 1 : index + 1;

  if (targetIndex < 0 || targetIndex >= rows.length) {
    redirect("/member/profile/photos");
  }

  const current = rows[index];
  const target = rows[targetIndex];

  if (!current || !target) {
    redirect("/member/profile/photos?error=사진 순서를 변경할 수 없습니다.");
  }

  const { error: firstUpdateError } = await admin
    .from("member_photos")
    .update({ sort_order: target.sort_order })
    .eq("id", current.id)
    .eq("user_id", user.id);

  if (firstUpdateError) {
    redirect(
      `/member/profile/photos?error=${encodeURIComponent(firstUpdateError.message)}`
    );
  }

  const { error: secondUpdateError } = await admin
    .from("member_photos")
    .update({ sort_order: current.sort_order })
    .eq("id", target.id)
    .eq("user_id", user.id);

  if (secondUpdateError) {
    redirect(
      `/member/profile/photos?error=${encodeURIComponent(secondUpdateError.message)}`
    );
  }

  revalidatePath("/member/profile/photos");
  revalidatePath("/member/matches");
  redirect("/member/profile/photos?reordered=1");
}

export async function deletePhotoAction(formData: FormData) {
  const { user } = await requireUser();
  const admin = createAdminClient();
  const photoId = String(formData.get("photoId") ?? "").trim();

  if (!photoId) {
    redirect("/member/profile/photos?error=삭제할 사진 정보가 올바르지 않습니다.");
  }

  const { data: photo, error: photoError } = await admin
    .from("member_photos")
    .select("*")
    .eq("id", photoId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (photoError) {
    redirect(`/member/profile/photos?error=${encodeURIComponent(photoError.message)}`);
  }

  if (!photo) {
    redirect("/member/profile/photos?error=사진을 찾지 못했습니다.");
  }

  const { error: deleteDbError } = await admin
    .from("member_photos")
    .delete()
    .eq("id", photoId)
    .eq("user_id", user.id);

  if (deleteDbError) {
    redirect(
      `/member/profile/photos?error=${encodeURIComponent(deleteDbError.message)}`
    );
  }

  await admin.storage.from(getMemberPhotosBucket()).remove([photo.storage_path]);

  const { data: remainingPhotos, error: remainingError } = await admin
    .from("member_photos")
    .select("*")
    .eq("user_id", user.id)
    .order("sort_order", { ascending: true });

  if (remainingError) {
    redirect(
      `/member/profile/photos?error=${encodeURIComponent(remainingError.message)}`
    );
  }

  const remaining = remainingPhotos ?? [];

  if (photo.is_primary && remaining.length > 0) {
    const nextPrimary = remaining[0];

    if (!nextPrimary) {
      redirect("/member/profile/photos");
    }

    await admin
      .from("member_photos")
      .update({ is_primary: true })
      .eq("id", nextPrimary.id)
      .eq("user_id", user.id);
  }

  await Promise.all(
    remaining.map((row, index) =>
      admin
        .from("member_photos")
        .update({ sort_order: index })
        .eq("id", row.id)
        .eq("user_id", user.id)
    )
  );

  revalidatePath("/member/profile/photos");
  revalidatePath("/member/matches");
  redirect("/member/profile/photos?deleted=1");
}
