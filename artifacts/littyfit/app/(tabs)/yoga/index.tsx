import React from "react";
import { View, ScrollView, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Colors } from "@/constants/Colors";
import { Txt, Card, HapticTap, SectionHeader } from "@/components/ui";
import { useAppStore } from "@/store/useAppStore";
import { YOGA_PROGRAMS } from "@/data/content";
import { Flame } from "@/components/flame";

export default function YogaHome() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const yogaStreak = useAppStore((s) => s.yogaStreak);
  const yogaSessions = useAppStore((s) => s.yogaSessions);

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
      <View>
        <Txt size={11} weight="bold" color={Colors.violet} uppercase letterSpacing={3}>
          Recover & Center
        </Txt>
        <Txt size={28} weight="bold" style={{ marginTop: 4 }}>
          Breathe. Stretch.{"\n"}Reset.
        </Txt>
      </View>

      {/* Streak banner */}
      <Animated.View entering={FadeInDown.duration(400)}>
        <Card padding={16} style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
          <View
            style={{
              width: 52,
              height: 52,
              borderRadius: 26,
              backgroundColor: `${Colors.violet}22`,
              borderWidth: 1,
              borderColor: Colors.violet,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons name="moon" size={22} color={Colors.violet} />
          </View>
          <View style={{ flex: 1 }}>
            <Txt size={10} weight="bold" color={Colors.violet} uppercase letterSpacing={2}>
              Yoga Streak
            </Txt>
            <View style={{ flexDirection: "row", alignItems: "baseline", gap: 6 }}>
              <Txt size={24} weight="bold">
                {yogaStreak}
              </Txt>
              <Txt size={12} color={Colors.textDim}>
                days · {yogaSessions.length} total sessions
              </Txt>
            </View>
          </View>
          {yogaStreak > 0 && <Flame streak={yogaStreak} size={22} showCount={false} />}
        </Card>
      </Animated.View>

      <SectionHeader title="Flows" />

      {YOGA_PROGRAMS.map((y, i) => (
        <Animated.View key={y.id} entering={FadeInDown.delay(60 + i * 50).duration(400)}>
          <Pressable
            onPress={() => {
              HapticTap.medium();
              router.push(`/(tabs)/yoga/${y.id}`);
            }}
          >
            <View
              style={{
                borderRadius: 20,
                borderWidth: 1,
                borderColor: Colors.border,
                backgroundColor: Colors.card,
                padding: 18,
                flexDirection: "row",
                gap: 16,
                alignItems: "center",
                overflow: "hidden",
                position: "relative",
              }}
            >
              <View
                style={{
                  position: "absolute",
                  right: -30,
                  top: -30,
                  width: 120,
                  height: 120,
                  borderRadius: 60,
                  backgroundColor: `${y.color}15`,
                }}
              />
              <View
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 16,
                  backgroundColor: `${y.color}22`,
                  borderWidth: 1,
                  borderColor: `${y.color}66`,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Ionicons
                  name={
                    y.id === "morning"
                      ? "sunny"
                      : y.id === "recovery"
                        ? "leaf"
                        : y.id === "mobility"
                          ? "body"
                          : "bed"
                  }
                  size={24}
                  color={y.color}
                />
              </View>
              <View style={{ flex: 1, gap: 4 }}>
                <Txt size={16} weight="bold">
                  {y.name}
                </Txt>
                <Txt size={12} color={Colors.textDim}>
                  {y.description}
                </Txt>
                <View style={{ flexDirection: "row", gap: 10, marginTop: 4 }}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                    <Ionicons name="time" size={11} color={y.color} />
                    <Txt size={10} weight="bold" color={y.color} uppercase letterSpacing={1}>
                      {y.duration} min
                    </Txt>
                  </View>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                    <Ionicons name="flower" size={11} color={y.color} />
                    <Txt size={10} weight="bold" color={y.color} uppercase letterSpacing={1}>
                      {y.poses.length} poses
                    </Txt>
                  </View>
                </View>
              </View>
              <Ionicons name="play-circle" size={32} color={y.color} />
            </View>
          </Pressable>
        </Animated.View>
      ))}

      <SectionHeader title="Breathwork" />
      <Pressable
        onPress={() => {
          HapticTap.medium();
          router.push("/(tabs)/yoga/breathwork");
        }}
      >
        <View
          style={{
            borderRadius: 20,
            borderWidth: 1,
            borderColor: Colors.violet,
            backgroundColor: `${Colors.violet}11`,
            padding: 20,
            gap: 12,
            boxShadow: `0 0 30px ${Colors.violetGlow}`,
          }}
        >
          <View style={{ flexDirection: "row", gap: 14, alignItems: "center" }}>
            <View
              style={{
                width: 56,
                height: 56,
                borderRadius: 28,
                backgroundColor: Colors.violet,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Ionicons name="infinite" size={28} color={Colors.bg} />
            </View>
            <View style={{ flex: 1 }}>
              <Txt size={11} weight="bold" color={Colors.violet} uppercase letterSpacing={2}>
                Guided Breath
              </Txt>
              <Txt size={18} weight="bold" style={{ marginTop: 2 }}>
                Box Breathing · 4-7-8
              </Txt>
              <Txt size={12} color={Colors.textDim} style={{ marginTop: 2 }}>
                Nervous system reset in 3 minutes
              </Txt>
            </View>
          </View>
        </View>
      </Pressable>
    </ScrollView>
  );
}
