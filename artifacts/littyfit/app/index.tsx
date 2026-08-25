import { Redirect } from "expo-router";
import { useAppStore } from "@/store/useAppStore";

export default function Index() {
  const prefs = useAppStore((s) => s.preferences);
  const profile = useAppStore((s) => s.profile);

  if (!prefs.onboardingComplete) {
    return <Redirect href="/onboarding" />;
  }
  if (!prefs.authed || !profile) {
    return <Redirect href="/auth/login" />;
  }
  return <Redirect href="/(tabs)/home" />;
}
