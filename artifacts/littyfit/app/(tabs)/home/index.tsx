import React, { useEffect, useMemo, useState, useCallback } from "react";
import { View, Pressable, ScrollView, RefreshControl } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import Animated, {
  FadeInDown,
  FadeIn,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { Colors } from "@/constants/Colors";
import { Txt, Card, HapticTap, Btn, SectionHeader } from "@/components/ui";
import { Flame } from "@/components/flame";
import { Ring } from "@/components/ring";
import { LtkBalanceCard } from "@/components/ltk-balance";
import { useAppStore, useLevel, useTodayMacros, XP_PER_LEVEL, useTodayLtk, LTK_DAILY_CAP } from "@/store/useAppStore";
import { MOTIVATION_QUOTES, NON_NEGOTIABLES, MACRO_GOALS } from "@/data/content";
import { quickWorkout } from "@/data/programs";
import type { NonNegotiables } from "@/store/types";

export default function Home() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const profile = useAppStore((s) => s.profile);
  const ltkBalance = useAppStore((s) => s.ltkBalance);
  const streak = useAppStore((s) => s.currentStreak);
  const { level, progress, xp, title } = useLevel();
  const non = useAppStore((s) => s.nonNegotiables);
  const toggle = useAppStore((s) => s.toggleNonNegotiable);
  const checkIn = useAppStore((s) => s.checkIn);
  const resetNon = useAppStore((s) => s.resetNonNegotiablesIfNewDay);
  const resetNut = useAppStore((s) => s.resetNutritionIfNewDay);
  const workouts = useAppStore((s) => s.completedWorkouts);
  const macros = useTodayMacros();
  const hydration = useAppStore((s) => s.nutritionToday.hydrationGlasses);
  const activeSession = useAppStore((s) => s.activeSession);
  const setActiveSession = useAppStore((s) => s.setActiveSession);
  const todayLtk = useTodayLtk();
  const [refreshing, setRefreshing] = useState(false);
  const [celebrate, setCelebrate] = useState(false);

  const quote = useMemo(() => {
    const d = new Date().getDay();
    return MOTIVATION_QUOTES[d % MOTIVATION_QUOTES.length];
  }, []);

  useEffect(() => {
    resetNon();
    resetNut();
    checkIn();
  }, [resetNon, resetNut, checkIn]);

  const allDone = useMemo(() => Object.values(non).every(Boolean), [non]);
  const doneCount = useMemo(() => Object.values(non).filter(Boolean).length, [non]);

  useEffect(() => {
    if (allDone) {
      setCelebrate(true);
      const t = setTimeout(() => setCelebrate(false), 2500);
      return () => clearTimeout(t);
    }
  }, [allDone]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    HapticTap.light();
    await new Promise((r) => setTimeout(r, 700));
    setRefreshing(false);
  }, []);

  const todayWorkouts = workouts.filter((w) => {
    const d = new Date(w.date);
    const t = new Date();
    return d.toDateString() === t.toDateString();
  }).length;

  const workoutProgress = Math.min(1, todayWorkouts / 1);
  const caloriesProgress = Math.min(1, macros.calories / MACRO_GOALS.calories);
  const hydrationProgress = Math.min(1, hydration / 8);
  const stepsProgress = Math.min(1, (todayWorkouts * 3200) / 10000);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: Colors.bg }}
      contentContainerStyle={{
        paddingTop: insets.top + 16,
        paddingHorizontal: 16,
        paddingBottom: 120,
        gap: 16,
      }}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={Colors.violet}
        />
      }
      showsVerticalScrollIndicator={false}
    >
      {/* Session resume banner */}
      {activeSession && (
        <Animated.View entering={FadeInDown.duration(300)}>
          <Pressable
            onPress={() => {
              HapticTap.medium();
              if (activeSession.type === "workout") {
                router.push(`/(tabs)/workouts/session/${activeSession.id}?program=${activeSession.programId ?? "performance"}`);
              } else {
                router.push(`/(tabs)/yoga/${activeSession.id}`);
              }
            }}
            style={({ pressed }) => ({
              flexDirection: "row",
              alignItems: "center",
              gap: 12,
              backgroundColor: `${Colors.amber}14`,
              borderRadius: 14,
              borderWidth: 1,
              borderColor: `${Colors.amber}50`,
              paddingHorizontal: 16,
              paddingVertical: 14,
              opacity: pressed ? 0.8 : 1,
            })}
          >
            <View style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              backgroundColor: `${Colors.amber}20`,
              alignItems: "center",
              justifyContent: "center",
            }}>
              <Ionicons name="play-circle" size={22} color={Colors.amber} />
            </View>
            <View style={{ flex: 1 }}>
              <Txt size={13} weight="bold" color={Colors.amber}>Resume your session?</Txt>
              <Txt size={11} color={Colors.textMuted}>{activeSession.label}</Txt>
            </View>
            <Pressable
              onPress={(e) => {
                e.stopPropagation();
                HapticTap.light();
                setActiveSession(null);
              }}
              style={{ padding: 4 }}
            >
              <Ionicons name="close-circle" size={20} color={Colors.textMuted} />
            </Pressable>
          </Pressable>
        </Animated.View>
      )}

      {/* Daily LTK progress */}
      {todayLtk > 0 && (
        <Animated.View entering={FadeInDown.delay(20).duration(400)}>
          <Pressable
            onPress={() => router.push("/(tabs)/rewards")}
            style={({ pressed }) => ({
              flexDirection: "row",
              alignItems: "center",
              gap: 10,
              backgroundColor: `${Colors.violet}10`,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: `${Colors.violet}30`,
              paddingHorizontal: 14,
              paddingVertical: 10,
              opacity: pressed ? 0.8 : 1,
            })}
          >
            <Ionicons name="diamond" size={14} color={Colors.violet} />
            <Txt size={12} weight="bold" color={Colors.violet}>{todayLtk} / {LTK_DAILY_CAP} LTK earned today</Txt>
            <View style={{ flex: 1 }}>
              <View style={{ height: 4, backgroundColor: Colors.cardAlt, borderRadius: 2, overflow: "hidden" }}>
                <View style={{ height: "100%", width: `${Math.min(todayLtk / LTK_DAILY_CAP, 1) * 100}%`, backgroundColor: Colors.violet, borderRadius: 2 }} />
              </View>
            </View>
            <Ionicons name="chevron-forward" size={12} color={Colors.textMuted} />
          </Pressable>
        </Animated.View>
      )}

      {/* Header */}
      <Animated.View entering={FadeInDown.duration(400)}>
        <View style={{ flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between" }}>
          <View style={{ gap: 6, flex: 1 }}>
            <Txt size={28} weight="bold">
              Gm, {profile?.name || "Athlete"} 👊
            </Txt>
            <Txt size={11} weight="bold" color={Colors.violet} uppercase letterSpacing={2}>
              &ldquo;{quote}&rdquo;
            </Txt>
          </View>
          <Pressable
            onPress={() => {
              HapticTap.light();
              router.push("/(tabs)/home/progress");
            }}
            style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              borderWidth: 1,
              borderColor: Colors.border,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons name="stats-chart" size={18} color={Colors.violet} />
          </Pressable>
        </View>
      </Animated.View>

      {/* LTK + Streak */}
      <Animated.View entering={FadeInDown.delay(80).duration(400)}>
        <LtkBalanceCard balance={ltkBalance} />
      </Animated.View>

      <Animated.View
        entering={FadeInDown.delay(120).duration(400)}
        style={{ flexDirection: "row", gap: 12 }}
      >
        <Card padding={14} style={{ flex: 1, gap: 6 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <Flame streak={streak} size={18} showCount={false} />
            <Txt size={10} weight="bold" color={Colors.textDim} uppercase letterSpacing={1.5}>
              Streak
            </Txt>
          </View>
          <Txt size={22} weight="bold" style={{ fontVariant: ["tabular-nums"] }}>
            {streak}{" "}
            <Txt size={11} color={Colors.textDim}>
              days
            </Txt>
          </Txt>
        </Card>
        <Card padding={14} style={{ flex: 1, gap: 6 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <Ionicons name="trophy" size={16} color={Colors.amber} />
            <Txt size={10} weight="bold" color={Colors.textDim} uppercase letterSpacing={1.5}>
              Level {level}
            </Txt>
          </View>
          <Txt size={14} weight="bold" numberOfLines={1}>
            {title}
          </Txt>
        </Card>
      </Animated.View>

      {/* XP Progress */}
      <Animated.View entering={FadeInDown.delay(160).duration(400)}>
        <Card padding={16}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 10 }}>
            <Txt size={11} weight="bold" color={Colors.textDim} uppercase letterSpacing={2}>
              XP Progress
            </Txt>
            <Txt size={11} weight="bold" color={Colors.violet} style={{ fontVariant: ["tabular-nums"] }}>
              {xp % XP_PER_LEVEL} / {XP_PER_LEVEL}
            </Txt>
          </View>
          <ProgressBar progress={progress} />
        </Card>
      </Animated.View>

      {/* Non-Negotiables */}
      <Animated.View entering={FadeInDown.delay(200).duration(400)}>
        <Card padding={16}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <Txt size={14} weight="bold" uppercase letterSpacing={1}>
              Daily Non-Negotiables
            </Txt>
            <Txt size={11} weight="bold" color={allDone ? Colors.green : Colors.textDim} style={{ fontVariant: ["tabular-nums"] }}>
              {doneCount}/6
            </Txt>
          </View>
          <View style={{ gap: 4 }}>
            {NON_NEGOTIABLES.map((item, i) => (
              <NonNegRow
                key={item.key}
                label={item.label}
                icon={item.icon}
                checked={non[item.key as keyof NonNegotiables]}
                onPress={() => toggle(item.key as keyof NonNegotiables)}
                index={i}
              />
            ))}
          </View>
          {!allDone && (
            <View style={{ marginTop: 16 }}>
              <Btn
                title={`Complete All (+20 LTK)`}
                variant="secondary"
                onPress={() => {
                  HapticTap.medium();
                  NON_NEGOTIABLES.forEach((i) => {
                    if (!non[i.key as keyof NonNegotiables]) {
                      toggle(i.key as keyof NonNegotiables);
                    }
                  });
                }}
              />
            </View>
          )}
          {celebrate && (
            <Animated.View
              entering={FadeIn.duration(300)}
              style={{
                marginTop: 14,
                padding: 12,
                borderRadius: 12,
                backgroundColor: `${Colors.green}22`,
                borderWidth: 1,
                borderColor: Colors.green,
                flexDirection: "row",
                alignItems: "center",
                gap: 8,
              }}
            >
              <Ionicons name="checkmark-circle" size={18} color={Colors.green} />
              <Txt size={12} weight="bold" color={Colors.green}>
                ALL COMPLETE. +20 LTK BANKED.
              </Txt>
            </Animated.View>
          )}
        </Card>
      </Animated.View>

      {/* Quick Actions */}
      <Animated.View entering={FadeInDown.delay(240).duration(400)}>
        <SectionHeader title="Quick Actions" />
      </Animated.View>
      <Animated.View entering={FadeInDown.delay(260).duration(400)} style={{ flexDirection: "row", gap: 12 }}>
        <QuickAction
          icon="flash"
          title="Quick Workout"
          subtitle="20 min AMRAP"
          color={Colors.orange}
          onPress={() => router.push(`/(tabs)/workouts/session/${quickWorkout.id}?program=quick`)}
        />
        <QuickAction
          icon="moon"
          title="Yoga Flow"
          subtitle="15 min reset"
          color={Colors.violet}
          onPress={() => router.push("/(tabs)/yoga/morning")}
        />
      </Animated.View>

      {/* Today's Progress Rings */}
      <Animated.View entering={FadeInDown.delay(300).duration(400)}>
        <SectionHeader title="Today's Progress" />
      </Animated.View>
      <Animated.View entering={FadeInDown.delay(320).duration(400)}>
        <Card padding={16}>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 16, justifyContent: "space-around" }}>
            <RingStat
              label="Workouts"
              value={`${todayWorkouts}/1`}
              progress={workoutProgress}
              color={Colors.orange}
            />
            <RingStat
              label="Calories"
              value={`${Math.round(macros.calories)}`}
              progress={caloriesProgress}
              color={Colors.amber}
            />
            <RingStat
              label="Hydration"
              value={`${hydration}/8`}
              progress={hydrationProgress}
              color={Colors.blue}
            />
            <RingStat
              label="Steps"
              value={`${Math.round(stepsProgress * 10000)}`}
              progress={stepsProgress}
              color={Colors.green}
            />
          </View>
        </Card>
      </Animated.View>
    </ScrollView>
  );
}

function ProgressBar({ progress }: { progress: number }) {
  const width = useSharedValue(0);
  useEffect(() => {
    width.value = withTiming(progress, { duration: 800 });
  }, [progress, width]);
  const aStyle = useAnimatedStyle(() => ({
    width: `${width.value * 100}%`,
  }));
  return (
    <View
      style={{
        height: 10,
        backgroundColor: Colors.cardAlt,
        borderRadius: 6,
        overflow: "hidden",
      }}
    >
      <Animated.View
        style={[
          {
            height: "100%",
            backgroundColor: Colors.violet,
            borderRadius: 6,
            boxShadow: `0 0 12px ${Colors.violet}`,
          },
          aStyle,
        ]}
      />
    </View>
  );
}

function NonNegRow({
  label,
  icon,
  checked,
  onPress,
  index,
}: {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  checked: boolean;
  onPress: () => void;
  index: number;
}) {
  const scale = useSharedValue(1);
  const aStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  return (
    <Animated.View style={aStyle} entering={FadeInDown.delay(220 + index * 30).duration(300)}>
      <Pressable
        onPressIn={() => {
          scale.value = withSpring(0.97);
          HapticTap.light();
        }}
        onPressOut={() => (scale.value = withSpring(1))}
        onPress={onPress}
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 12,
          paddingVertical: 10,
          paddingHorizontal: 12,
          marginVertical: 2,
          borderRadius: 12,
          backgroundColor: checked ? `${Colors.green}11` : "transparent",
        }}
      >
        <View
          style={{
            width: 24,
            height: 24,
            borderRadius: 6,
            borderWidth: 1.5,
            borderColor: checked ? Colors.green : Colors.border,
            backgroundColor: checked ? Colors.green : "transparent",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {checked && <Ionicons name="checkmark" size={16} color={Colors.bg} />}
        </View>
        <Ionicons name={icon} size={16} color={checked ? Colors.green : Colors.textDim} />
        <Txt size={14} weight={checked ? "semiBold" : "medium"} color={checked ? Colors.text : Colors.textDim}>
          {label}
        </Txt>
      </Pressable>
    </Animated.View>
  );
}

function QuickAction({
  icon,
  title,
  subtitle,
  color,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  color: string;
  onPress: () => void;
}) {
  const scale = useSharedValue(1);
  const aStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  return (
    <Animated.View style={[aStyle, { flex: 1 }]}>
      <Pressable
        onPressIn={() => {
          scale.value = withSpring(0.97);
          HapticTap.medium();
        }}
        onPressOut={() => (scale.value = withSpring(1))}
        onPress={onPress}
        style={{
          backgroundColor: Colors.card,
          borderRadius: 20,
          borderWidth: 1,
          borderColor: Colors.border,
          padding: 16,
          gap: 12,
          minHeight: 120,
          justifyContent: "space-between",
        }}
      >
        <View
          style={{
            width: 42,
            height: 42,
            borderRadius: 21,
            backgroundColor: `${color}22`,
            borderWidth: 1,
            borderColor: `${color}66`,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Ionicons name={icon} size={20} color={color} />
        </View>
        <View style={{ gap: 4 }}>
          <Txt size={15} weight="bold">
            {title}
          </Txt>
          <Txt size={11} color={Colors.textDim}>
            {subtitle}
          </Txt>
        </View>
      </Pressable>
    </Animated.View>
  );
}

function RingStat({
  label,
  value,
  progress,
  color,
}: {
  label: string;
  value: string;
  progress: number;
  color: string;
}) {
  return (
    <View style={{ alignItems: "center", gap: 8, width: 72 }}>
      <Ring size={72} strokeWidth={8} progress={progress} color={color}>
        <Txt size={13} weight="bold">
          {value}
        </Txt>
      </Ring>
      <Txt size={10} weight="bold" color={Colors.textDim} uppercase letterSpacing={1}>
        {label}
      </Txt>
    </View>
  );
}
