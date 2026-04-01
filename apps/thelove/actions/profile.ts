"use server";

import { saveOnboardingAction } from "@/actions/onboarding";

export async function saveProfileAction(formData: FormData) {
  return saveOnboardingAction(formData);
}
