import { OnboardingForm } from "@/components/onboarding/onboarding-form";
import type { MemberProfileBundle } from "@/types/profile";

export function MemberProfileForm({ bundle }: { bundle: MemberProfileBundle }) {
  return <OnboardingForm bundle={bundle} />;
}
