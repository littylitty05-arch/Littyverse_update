import React, { useState } from "react";
import { View, KeyboardAvoidingView, Platform, Pressable, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/Colors";
import { Btn, Txt, HapticTap } from "@/components/ui";
import { AuthField } from "@/components/auth-field";
import { useAppStore } from "@/store/useAppStore";
import Animated, { FadeInDown } from "react-native-reanimated";

export default function Register() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [name, setName] = useState(useAppStore.getState().profile?.name || "");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const setPreferences = useAppStore((s) => s.setPreferences);
  const initGuest = useAppStore((s) => s.initGuest);
  const setProfile = useAppStore((s) => s.setProfile);

  const submit = () => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      setError("Fill in all fields");
      return;
    }
    if (password.length < 6) {
      setError("Password must be 6+ characters");
      return;
    }
    HapticTap.success();
    initGuest(name.trim());
    setProfile({ email: email.trim(), isGuest: false });
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
          paddingTop: insets.top + 12,
          paddingBottom: insets.bottom + 24,
        }}
        keyboardShouldPersistTaps="handled"
      >
        <Pressable onPress={() => router.back()} style={{ padding: 8, alignSelf: "flex-start" }}>
          <Ionicons name="chevron-back" size={24} color={Colors.text} />
        </Pressable>

        <Animated.View entering={FadeInDown.duration(400)} style={{ gap: 8, marginTop: 24, marginBottom: 32 }}>
          <Txt size={11} weight="bold" color={Colors.violet} uppercase letterSpacing={3}>
            Create Account
          </Txt>
          <Txt size={30} weight="bold" style={{ lineHeight: 36 }}>
            Build your{"\n"}base, athlete.
          </Txt>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(150).duration(400)} style={{ gap: 16 }}>
          <AuthField label="Name" icon="person" value={name} onChangeText={setName} placeholder="Your name" />
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
            placeholder="6+ characters"
          />
          {error && (
            <Txt size={12} color={Colors.red} selectable>
              {error}
            </Txt>
          )}
        </Animated.View>

        <View style={{ gap: 14, marginTop: 32 }}>
          <Btn title="Activate Base" onPress={submit} size="lg" />
          <Pressable onPress={() => router.back()} style={{ paddingVertical: 12 }}>
            <Txt size={13} weight="semiBold" color={Colors.textDim} uppercase letterSpacing={2} style={{ textAlign: "center" }}>
              I already have an account
            </Txt>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
