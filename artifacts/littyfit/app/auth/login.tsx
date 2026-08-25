import React, { useState } from "react";
import { View, KeyboardAvoidingView, Platform, Pressable, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as WebBrowser from "expo-web-browser";
import { Colors } from "@/constants/Colors";
import { Btn, Txt, HapticTap } from "@/components/ui";
import { AuthField } from "@/components/auth-field";
import { useAppStore } from "@/store/useAppStore";
import Animated, { FadeInDown } from "react-native-reanimated";

export default function Login() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const setPreferences = useAppStore((s) => s.setPreferences);
  const profile = useAppStore((s) => s.profile);
  const setProfile = useAppStore((s) => s.setProfile);
  const initGuest = useAppStore((s) => s.initGuest);

  const signIn = () => {
    if (!email.trim() || !password.trim()) {
      setError("Enter your email and a password to continue");
      return;
    }
    HapticTap.success();
    const name = email.split("@")[0] || "Athlete";
    if (!profile) {
      initGuest(name);
    }
    setProfile({ email: email.trim(), isGuest: false });
    setPreferences({ authed: true });
    router.replace("/(tabs)/home");
  };

  const continueGuest = () => {
    HapticTap.medium();
    if (!profile) {
      initGuest("Athlete");
    }
    setPreferences({ authed: true });
    router.replace("/(tabs)/home");
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={{ flex: 1, backgroundColor: Colors.bg }}
    >
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          paddingHorizontal: 28,
          paddingTop: insets.top + 40,
          paddingBottom: insets.bottom + 24,
        }}
        keyboardShouldPersistTaps="handled"
      >
        <Animated.View entering={FadeInDown.duration(500)} style={{ alignItems: "center", gap: 16, marginBottom: 40 }}>
          <View
            style={{
              width: 88,
              height: 88,
              borderRadius: 44,
              borderWidth: 1,
              borderColor: Colors.violet,
              alignItems: "center",
              justifyContent: "center",
              boxShadow: `0 0 40px ${Colors.violetGlow}`,
            }}
          >
            <Ionicons name="flame" size={44} color={Colors.violet} />
          </View>
          <Txt size={34} weight="bold" uppercase letterSpacing={2}>
            LittyFit
          </Txt>
          <Txt size={13} color={Colors.textDim} style={{ textAlign: "center", marginTop: -4 }}>
            Your life OS. Welcome back.
          </Txt>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(150).duration(500)} style={{ gap: 16 }}>
          <AuthField
            label="Email"
            icon="mail"
            value={email}
            onChangeText={(v) => {
              setEmail(v);
              setError(null);
            }}
            autoCapitalize="none"
            keyboardType="email-address"
            placeholder="you@example.com"
          />
          <AuthField
            label="Password"
            icon="lock-closed"
            value={password}
            onChangeText={(v) => {
              setPassword(v);
              setError(null);
            }}
            secureTextEntry
            placeholder="••••••••"
          />
          <Txt size={12} color={Colors.textMuted} style={{ textAlign: "center", lineHeight: 18 }}>
            New here? Enter any email + password to create your profile.{"\n"}No account needed — your data stays on this device.
          </Txt>
          {error && (
            <Txt size={12} color={Colors.red} selectable>
              {error}
            </Txt>
          )}
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(300).duration(500)} style={{ gap: 14, marginTop: 32 }}>
          <Btn title="Sign In" onPress={signIn} size="lg" />
          <Btn
            title="Create Account"
            variant="secondary"
            onPress={() => {
              HapticTap.light();
              router.push("/auth/register");
            }}
            size="lg"
          />
          <Pressable onPress={continueGuest} style={{ paddingVertical: 12 }}>
            <Txt size={13} weight="semiBold" color={Colors.violet} uppercase letterSpacing={2} style={{ textAlign: "center" }}>
              Continue as Guest
            </Txt>
          </Pressable>
        </Animated.View>

        <View style={{ flex: 1 }} />

        <Pressable
          onPress={async () => {
            HapticTap.light();
            await WebBrowser.openBrowserAsync("https://littyverse.com");
          }}
          style={{ paddingVertical: 16 }}
        >
          <Txt size={12} weight="semiBold" color={Colors.textDim} uppercase letterSpacing={2} style={{ textAlign: "center" }}>
            littyverse.com
          </Txt>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
