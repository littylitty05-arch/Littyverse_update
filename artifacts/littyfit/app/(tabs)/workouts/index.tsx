import React from "react";
import { View, Pressable, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Colors } from "@/constants/Colors";
import { Txt, HapticTap, SectionHeader } from "@/components/ui";
import { useAppStore } from "@/store/useAppStore";
import { PROGRAMS, quickWorkout } from "@/data/programs";

export default function WorkoutsHome() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const selected = useAppStore((s) => s.selectedProgram);
  const completed = useAppStore((s) => s.completedWorkouts);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: Colors.bg }}
      contentContainerStyle={{
        paddingTop: insets.top + 16,
        paddingHorizontal: 16,
        paddingBottom: 120,
        gap: 16,
      }}
      showsVerticalScrollIndicator={false}
    >
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
        <View>
          <Txt size={11} weight="bold" color={Colors.violet} uppercase letterSpacing={3}>
            LittyFit Programs
          </Txt>
          <Txt size={28} weight="bold" style={{ marginTop: 4 }}>
            Train like it matters.
          </Txt>
        </View>
        <Pressable
          onPress={() => {
            HapticTap.light();
            router.push("/(tabs)/workouts/history");
          }}
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: Colors.card,
            borderWidth: 1,
            borderColor: Colors.border,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Ionicons name="time" size={18} color={Colors.violet} />
        </Pressable>
      </View>

      {/* Quick Workout Card */}
      <Animated.View entering={FadeInDown.duration(400)}>
        <Pressable
          onPress={() => {
            HapticTap.medium();
            router.push(`/(tabs)/workouts/session/${quickWorkout.id}?program=quick`);
          }}
        >
          <View
            style={{
              borderRadius: 20,
              borderWidth: 1,
              borderColor: Colors.orange,
              backgroundColor: Colors.card,
              padding: 18,
              flexDirection: "row",
              alignItems: "center",
              gap: 14,
              boxShadow: `0 0 24px ${Colors.orange}33`,
            }}
          >
            <View
              style={{
                width: 56,
                height: 56,
                borderRadius: 28,
                backgroundColor: `${Colors.orange}22`,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Ionicons name="flash" size={26} color={Colors.orange} />
            </View>
            <View style={{ flex: 1, gap: 4 }}>
              <Txt size={10} weight="bold" color={Colors.orange} uppercase letterSpacing={2}>
                Quick Hit
              </Txt>
              <Txt size={16} weight="bold">
                Bodyweight AMRAP
              </Txt>
              <Txt size={12} color={Colors.textDim}>
                20 min · No equipment · +25 LTK
              </Txt>
            </View>
            <Ionicons name="arrow-forward" size={20} color={Colors.orange} />
          </View>
        </Pressable>
      </Animated.View>

      <SectionHeader title="Programs" right={
        completed.length > 0 ? (
          <Txt size={11} weight="semiBold" color={Colors.textDim}>
            {completed.length} sessions completed
          </Txt>
        ) : undefined
      } />

      {PROGRAMS.map((p, i) => {
        const active = selected === p.id;
        return (
          <Animated.View key={p.id} entering={FadeInDown.delay(80 + i * 60).duration(400)}>
            <Pressable
              onPress={() => {
                HapticTap.medium();
                router.push(`/(tabs)/workouts/${p.id}`);
              }}
            >
              <View
                style={{
                  borderRadius: 20,
                  overflow: "hidden",
                  borderWidth: 1,
                  borderColor: active ? p.color : Colors.border,
                  backgroundColor: Colors.card,
                  boxShadow: active ? `0 0 28px ${p.color}55` : undefined,
                }}
              >
                <View style={{ height: 140, position: "relative" }}>
                  <Image
                    source={p.image}
                    style={{ width: "100%", height: "100%" }}
                    contentFit="cover"
                  />
                  <View
                    style={{
                      position: "absolute",
                      inset: 0,
                      backgroundColor: "rgba(10,10,10,0.55)",
                    }}
                  />
                  <View style={{ position: "absolute", top: 12, right: 12 }}>
                    {active && (
                      <View
                        style={{
                          paddingHorizontal: 10,
                          paddingVertical: 6,
                          borderRadius: 999,
                          backgroundColor: p.color,
                        }}
                      >
                        <Txt size={9} weight="bold" color={Colors.bg} uppercase letterSpacing={1.5}>
                          Active
                        </Txt>
                      </View>
                    )}
                  </View>
                  <View style={{ position: "absolute", bottom: 14, left: 14, right: 14 }}>
                    <Txt size={10} weight="bold" color={p.color} uppercase letterSpacing={2.5}>
                      {p.level} · {p.weeks} weeks
                    </Txt>
                    <Txt size={26} weight="bold" style={{ marginTop: 2 }}>
                      {p.name}
                    </Txt>
                  </View>
                </View>
                <View
                  style={{
                    padding: 14,
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 12,
                  }}
                >
                  <Txt size={12} color={Colors.textDim} style={{ flex: 1 }}>
                    {p.description}
                  </Txt>
                  <View
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 18,
                      backgroundColor: `${p.color}22`,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Ionicons name="arrow-forward" size={16} color={p.color} />
                  </View>
                </View>
              </View>
            </Pressable>
          </Animated.View>
        );
      })}
    </ScrollView>
  );
}
