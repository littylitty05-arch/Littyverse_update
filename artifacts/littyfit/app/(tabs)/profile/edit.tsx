import React, { useState } from "react";
import { View, ScrollView, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/Colors";
import { Txt, Btn, HapticTap, Chip } from "@/components/ui";
import { AuthField } from "@/components/auth-field";
import { useAppStore } from "@/store/useAppStore";
import type { FitnessLevel, PrimaryGoal } from "@/store/types";

const fitnessLevels: FitnessLevel[] = ["Beginner", "Intermediate", "Advanced"];
const goals: PrimaryGoal[] = ["Build Muscle", "Lose Fat", "Improve Performance", "Longevity"];

export default function EditProfile() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const profile = useAppStore((s) => s.profile);
  const setProfile = useAppStore((s) => s.setProfile);

  const [name, setName] = useState(profile?.name ?? "");
  const [email, setEmail] = useState(profile?.email ?? "");
  const [level, setLevel] = useState<FitnessLevel>(profile?.fitnessLevel ?? "Intermediate");
  const [goal, setGoal] = useState<PrimaryGoal>(profile?.primaryGoal ?? "Build Muscle");

  const save = () => {
    HapticTap.success();
    setProfile({ name: name.trim(), email: email.trim(), fitnessLevel: level, primaryGoal: goal });
    router.back();
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: Colors.bg }}
      contentContainerStyle={{
        paddingTop: insets.top + 16,
        paddingHorizontal: 16,
        paddingBottom: insets.bottom + 40,
        gap: 16,
      }}
      showsVerticalScrollIndicator={false}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
        <Pressable
          onPress={() => router.back()}
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: Colors.card,
            borderWidth: 1,
            borderColor: Colors.border,
          }}
        >
          <Ionicons name="chevron-back" size={20} color={Colors.text} />
        </Pressable>
        <Txt size={22} weight="bold" uppercase letterSpacing={1}>
          Edit Profile
        </Txt>
      </View>

      <View style={{ gap: 16, marginTop: 8 }}>
        <AuthField label="Name" icon="person" value={name} onChangeText={setName} />
        <AuthField label="Email" icon="mail" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
      </View>

      <View style={{ gap: 10 }}>
        <Txt size={11} weight="bold" color={Colors.textDim} uppercase letterSpacing={2}>
          Fitness Level
        </Txt>
        <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
          {fitnessLevels.map((l) => (
            <Chip key={l} label={l} active={level === l} onPress={() => setLevel(l)} />
          ))}
        </View>
      </View>

      <View style={{ gap: 10 }}>
        <Txt size={11} weight="bold" color={Colors.textDim} uppercase letterSpacing={2}>
          Primary Goal
        </Txt>
        <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
          {goals.map((g) => (
            <Chip key={g} label={g} active={goal === g} onPress={() => setGoal(g)} />
          ))}
        </View>
      </View>

      <View style={{ marginTop: 16 }}>
        <Btn title="Save Changes" onPress={save} size="lg" disabled={!name.trim()} />
      </View>
    </ScrollView>
  );
}
