import React, { useState } from "react";
import { View, ScrollView, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Colors } from "@/constants/Colors";
import { Txt, HapticTap, Btn, Chip } from "@/components/ui";
import { findProgram } from "@/data/programs";
import { useAppStore } from "@/store/useAppStore";

export default function ProgramDetail() {
  const { program: programId } = useLocalSearchParams<{ program: string }>();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const program = findProgram(programId);
  const [week, setWeek] = useState(4);
  const selected = useAppStore((s) => s.selectedProgram);
  const select = useAppStore((s) => s.selectProgram);
  const isSelected = selected === program.id;

  const currentWeek = program.weeksPlan[week - 1] || program.weeksPlan[0];

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: Colors.bg }}
      contentContainerStyle={{
        paddingBottom: insets.bottom + 40,
      }}
      showsVerticalScrollIndicator={false}
    >
      {/* Hero */}
      <View style={{ position: "relative", height: 300 }}>
        <Image source={program.image} style={{ width: "100%", height: "100%" }} contentFit="cover" />
        <View
          style={{
            position: "absolute",
            inset: 0,
            backgroundColor: "rgba(10,10,10,0.65)",
          }}
        />
        <View style={{ position: "absolute", top: insets.top + 8, left: 16, right: 16, flexDirection: "row", justifyContent: "space-between" }}>
          <Pressable
            onPress={() => router.back()}
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: "rgba(0,0,0,0.5)",
              borderWidth: 1,
              borderColor: Colors.border,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons name="chevron-back" size={20} color={Colors.text} />
          </Pressable>
          {isSelected && (
            <View
              style={{
                paddingHorizontal: 12,
                paddingVertical: 8,
                borderRadius: 999,
                backgroundColor: program.color,
              }}
            >
              <Txt size={10} weight="bold" color={Colors.bg} uppercase letterSpacing={1.5}>
                Active Program
              </Txt>
            </View>
          )}
        </View>
        <View style={{ position: "absolute", bottom: 24, left: 20, right: 20 }}>
          <Txt size={11} weight="bold" color={program.color} uppercase letterSpacing={3}>
            {program.level} · {program.weeks} weeks
          </Txt>
          <Txt size={38} weight="bold" style={{ marginTop: 4 }}>
            {program.name}
          </Txt>
          <Txt size={14} color={Colors.textDim} style={{ marginTop: 8 }}>
            {program.description}
          </Txt>
        </View>
      </View>

      <View style={{ padding: 16, gap: 16 }}>
        {!isSelected && (
          <Btn
            title={`Activate ${program.name}`}
            onPress={() => {
              HapticTap.success();
              select(program.id);
            }}
            size="lg"
          />
        )}

        {/* Week selector */}
        <Txt size={11} weight="bold" color={Colors.textDim} uppercase letterSpacing={2}>
          Choose Week
        </Txt>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8, paddingRight: 20 }}
        >
          {Array.from({ length: program.weeks }, (_, i) => i + 1).map((w) => (
            <Chip
              key={w}
              label={`WEEK ${w}`}
              active={w === week}
              color={program.color}
              onPress={() => setWeek(w)}
            />
          ))}
        </ScrollView>

        {/* Sessions */}
        <Animated.View entering={FadeInDown.duration(400)}>
          <View style={{ gap: 12 }}>
            {currentWeek.sessions.map((s, i) => (
              <Pressable
                key={s.id}
                onPress={() => {
                  HapticTap.medium();
                  router.push(`/(tabs)/workouts/session/${s.id}?program=${program.id}&week=${week}`);
                }}
              >
                <View
                  style={{
                    borderRadius: 18,
                    backgroundColor: Colors.card,
                    borderWidth: 1,
                    borderColor: Colors.border,
                    padding: 16,
                    flexDirection: "row",
                    gap: 14,
                    alignItems: "center",
                  }}
                >
                  <View
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 12,
                      backgroundColor: `${program.color}22`,
                      borderWidth: 1,
                      borderColor: `${program.color}66`,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Txt size={14} weight="bold" color={program.color}>
                      {String.fromCharCode(65 + i)}
                    </Txt>
                  </View>
                  <View style={{ flex: 1, gap: 4 }}>
                    <Txt size={15} weight="bold">
                      {s.name}
                    </Txt>
                    <Txt size={11} color={Colors.textDim}>
                      {s.focus} · {s.duration} min · {s.exercises.length} exercises
                    </Txt>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
                </View>
              </Pressable>
            ))}
          </View>
        </Animated.View>
      </View>
    </ScrollView>
  );
}
