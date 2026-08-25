import React, { useState } from "react";
import { View, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/Colors";
import { Btn, PressCard, Txt, HapticTap } from "@/components/ui";
import { useAppStore } from "@/store/useAppStore";
import type { PrimaryGoal } from "@/store/types";

const options: {
  value: PrimaryGoal;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
}[] = [
  { value: "Build Muscle", icon: "barbell", color: Colors.violet },
  { value: "Lose Fat", icon: "flame", color: Colors.orange },
  { value: "Improve Performance", icon: "speedometer", color: Colors.blue },
  { value: "Longevity", icon: "leaf", color: Colors.green },
];

export default function OnboardGoal() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [goal, setGoal] = useState<PrimaryGoal | null>(null);
  const setProfile = useAppStore((s) => s.setProfile);
  const setPreferences = useAppStore((s) => s.setPreferences);

  const submit = () => {
    if (!goal) return;
    HapticTap.success();
    setProfile({ primaryGoal: goal, memberSince: new Date().toISOString() });
    setPreferences({ onboardingComplete: true });
    router.replace("/auth/login");
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
          Step 3 of 3
        </Txt>
        <Txt size={30} weight="bold" style={{ lineHeight: 36 }}>
          What&apos;s your{"\n"}primary goal?
        </Txt>
      </View>

      <View
        style={{
          flex: 1,
          justifyContent: "center",
          flexDirection: "row",
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        {options.map((o) => {
          const active = goal === o.value;
          return (
            <PressCard
              key={o.value}
              active={active}
              glow={active}
              padding={20}
              onPress={() => setGoal(o.value)}
              style={{ width: "48%", minHeight: 140, justifyContent: "space-between" }}
            >
              <View
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 22,
                  backgroundColor: active ? `${o.color}22` : Colors.cardAlt,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Ionicons name={o.icon} size={22} color={active ? o.color : Colors.textDim} />
              </View>
              <Txt size={16} weight="bold">
                {o.value}
              </Txt>
            </PressCard>
          );
        })}
      </View>

      <Btn title="Activate Base" onPress={submit} size="lg" disabled={!goal} />
    </View>
  );
}
