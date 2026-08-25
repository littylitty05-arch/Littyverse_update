import React, { useState } from "react";
import { View, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/Colors";
import { Btn, PressCard, Txt, HapticTap } from "@/components/ui";
import { useAppStore } from "@/store/useAppStore";
import type { FitnessLevel } from "@/store/types";

const options: { value: FitnessLevel; desc: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { value: "Beginner", desc: "New to training or returning after a break.", icon: "leaf" },
  { value: "Intermediate", desc: "1+ year lifting. Comfortable with compounds.", icon: "barbell" },
  { value: "Advanced", desc: "Years in. Ready to push peak performance.", icon: "flame" },
];

export default function OnboardFitness() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [level, setLevel] = useState<FitnessLevel | null>(null);
  const setProfile = useAppStore((s) => s.setProfile);

  const submit = () => {
    if (!level) return;
    HapticTap.medium();
    setProfile({ fitnessLevel: level });
    router.push("/onboarding/goal");
  };

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: Colors.bg,
        paddingHorizontal: 20,
        paddingTop: insets.top + 24,
        paddingBottom: insets.bottom + 24,
      }}
    >
      <Pressable onPress={() => router.back()} style={{ padding: 8, alignSelf: "flex-start" }}>
        <Ionicons name="chevron-back" size={24} color={Colors.text} />
      </Pressable>

      <View style={{ gap: 8, paddingHorizontal: 8, marginTop: 16 }}>
        <Txt size={11} weight="bold" color={Colors.violet} uppercase letterSpacing={3}>
          Step 2 of 3
        </Txt>
        <Txt size={30} weight="bold" style={{ lineHeight: 36 }}>
          What&apos;s your level?
        </Txt>
      </View>

      <View style={{ flex: 1, justifyContent: "center", gap: 12 }}>
        {options.map((o) => (
          <PressCard
            key={o.value}
            active={level === o.value}
            glow={level === o.value}
            padding={20}
            onPress={() => setLevel(o.value)}
          >
            <View style={{ flexDirection: "row", alignItems: "center", gap: 16 }}>
              <View
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 26,
                  backgroundColor: level === o.value ? `${Colors.violet}22` : Colors.cardAlt,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Ionicons
                  name={o.icon}
                  size={24}
                  color={level === o.value ? Colors.violet : Colors.textDim}
                />
              </View>
              <View style={{ flex: 1, gap: 4 }}>
                <Txt size={18} weight="bold">
                  {o.value}
                </Txt>
                <Txt size={13} color={Colors.textDim}>
                  {o.desc}
                </Txt>
              </View>
              {level === o.value && (
                <Ionicons name="checkmark-circle" size={24} color={Colors.violet} />
              )}
            </View>
          </PressCard>
        ))}
      </View>

      <Btn title="Continue" onPress={submit} size="lg" disabled={!level} />
    </View>
  );
}
