import React, { useState } from "react";
import {
  View,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Pressable,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/Colors";
import { Btn, Txt, HapticTap } from "@/components/ui";
import { Fonts } from "@/constants/Typography";
import { useAppStore } from "@/store/useAppStore";

export default function OnboardName() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [name, setName] = useState("");
  const setProfile = useAppStore((s) => s.setProfile);

  const submit = () => {
    if (!name.trim()) return;
    HapticTap.medium();
    setProfile({ name: name.trim() });
    router.push("/onboarding/fitness-level");
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1, backgroundColor: Colors.bg }}
    >
      <View
        style={{
          flex: 1,
          paddingHorizontal: 28,
          paddingTop: insets.top + 24,
          paddingBottom: insets.bottom + 24,
        }}
      >
        <Pressable onPress={() => router.back()} style={{ padding: 8, alignSelf: "flex-start" }}>
          <Ionicons name="chevron-back" size={24} color={Colors.text} />
        </Pressable>

        <View style={{ flex: 1, justifyContent: "center", gap: 32 }}>
          <View style={{ gap: 8 }}>
            <Txt size={11} weight="bold" color={Colors.violet} uppercase letterSpacing={3}>
              Step 1 of 3
            </Txt>
            <Txt size={32} weight="bold" style={{ lineHeight: 36 }}>
              What should we{"\n"}call you?
            </Txt>
            <Txt size={14} color={Colors.textDim}>
              We&apos;ll greet you every morning. Keep it real.
            </Txt>
          </View>

          <View>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Your name"
              placeholderTextColor={Colors.textMuted}
              autoFocus
              returnKeyType="next"
              onSubmitEditing={submit}
              style={{
                fontFamily: Fonts.bold,
                fontSize: 28,
                color: Colors.text,
                borderBottomWidth: 2,
                borderBottomColor: name ? Colors.violet : Colors.border,
                paddingVertical: 14,
              }}
            />
          </View>
        </View>

        <Btn title="Continue" onPress={submit} size="lg" disabled={!name.trim()} />
      </View>
    </KeyboardAvoidingView>
  );
}
