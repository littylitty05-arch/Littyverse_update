import React, { useMemo } from "react";
import { View, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Colors } from "@/constants/Colors";
import { Txt, Card, SectionHeader } from "@/components/ui";
import { useAppStore, useTodayLtk, LTK_DAILY_CAP } from "@/store/useAppStore";
import type { LtkActivity } from "@/store/types";

const todayStr = () => new Date().toISOString().slice(0, 10);

const ACTIVITY_ICONS: Record<LtkActivity["type"], { icon: string; color: string }> = {
  workout: { icon: "barbell", color: Colors.orange },
  yoga: { icon: "moon", color: Colors.blue },
  meal: { icon: "leaf", color: Colors.green },
  checkin: { icon: "sunny", color: Colors.amber },
  streak: { icon: "flame", color: Colors.orange },
  hydration: { icon: "water", color: Colors.blue },
  non_negotiables: { icon: "checkmark-done-circle", color: Colors.violet },
};

const EARNING_GUIDE = [
  { label: "Daily Workout", ltk: 25, icon: "barbell", color: Colors.orange, cap: "× 2/day" },
  { label: "Recovery Session", ltk: 15, icon: "moon", color: Colors.blue, cap: "× 1/day" },
  { label: "Log a Meal", ltk: 10, icon: "leaf", color: Colors.green, cap: "per meal" },
  { label: "Daily Check-In", ltk: 5, icon: "sunny", color: Colors.amber, cap: "1/day" },
  { label: "Day Streak Bonus", ltk: 10, icon: "flame", color: Colors.orange, cap: "per streak day" },
  { label: "Hydration Goal", ltk: 5, icon: "water", color: Colors.blue, cap: "1/day" },
  { label: "All Non-Negotiables", ltk: 20, icon: "checkmark-done-circle", color: Colors.violet, cap: "1/day" },
];

function timeAgo(ts: number) {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function RewardsDashboard() {
  const insets = useSafeAreaInsets();
  const ltkBalance = useAppStore((s) => s.ltkBalance);
  const ltkTotalEarned = useAppStore((s) => s.ltkTotalEarned);
  const ltkActivity = useAppStore((s) => s.ltkActivity);
  const completedWorkouts = useAppStore((s) => s.completedWorkouts);
  const yogaSessions = useAppStore((s) => s.yogaSessions);
  const currentStreak = useAppStore((s) => s.currentStreak);
  const todayLtk = useTodayLtk();

  const t = todayStr();
  const todayProgress = Math.min(todayLtk / LTK_DAILY_CAP, 1);

  const todayWorkouts = useMemo(
    () => completedWorkouts.filter((w) => w.date.slice(0, 10) === t),
    [completedWorkouts, t]
  );
  const todayYoga = useMemo(
    () => yogaSessions.filter((y) => y.date.slice(0, 10) === t),
    [yogaSessions, t]
  );

  const todayActivity = useMemo(
    () => ltkActivity.filter((a) => {
      const d = new Date(a.timestamp);
      return d.toISOString().slice(0, 10) === t;
    }),
    [ltkActivity, t]
  );

  const nextRewards = useMemo(() => {
    const r: string[] = [];
    if (todayWorkouts.length < 2) r.push(`Workout (+25 LTK)`);
    if (todayYoga.length === 0) r.push(`Recovery session (+15 LTK)`);
    if (!todayActivity.some((a) => a.type === "checkin")) r.push("Daily check-in (+5 LTK)");
    if (!todayActivity.some((a) => a.type === "non_negotiables")) r.push("Complete Non-Negotiables (+20 LTK)");
    if (!todayActivity.some((a) => a.type === "hydration")) r.push("Hydration goal (+5 LTK)");
    return r.slice(0, 3);
  }, [todayWorkouts, todayYoga, todayActivity]);

  const capReached = todayLtk >= LTK_DAILY_CAP;

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
      {/* Header */}
      <Animated.View entering={FadeInDown.duration(400)}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
          <View>
            <Txt size={11} weight="bold" color={Colors.textMuted} uppercase letterSpacing={2}>
              Littkoin
            </Txt>
            <Txt size={28} weight="bold">Rewards</Txt>
          </View>
          <View style={{
            backgroundColor: `${Colors.violet}18`,
            borderRadius: 14,
            borderWidth: 1,
            borderColor: `${Colors.violet}40`,
            paddingHorizontal: 16,
            paddingVertical: 10,
            alignItems: "center",
          }}>
            <Txt size={24} weight="bold" color={Colors.violet}>{ltkBalance.toLocaleString()}</Txt>
            <Txt size={9} color={Colors.textMuted} uppercase letterSpacing={1.5}>LTK Balance</Txt>
          </View>
        </View>
      </Animated.View>

      {/* Daily cap card */}
      <Animated.View entering={FadeInDown.delay(60).duration(400)}>
        <Card>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 10 }}>
            <View>
              <Txt size={11} color={Colors.textMuted} uppercase letterSpacing={1.5}>Today's Earnings</Txt>
              <View style={{ flexDirection: "row", alignItems: "baseline", gap: 4, marginTop: 2 }}>
                <Txt size={32} weight="bold" color={capReached ? Colors.amber : Colors.violet}>
                  {todayLtk}
                </Txt>
                <Txt size={14} color={Colors.textMuted}>/ {LTK_DAILY_CAP} LTK</Txt>
              </View>
            </View>
            {capReached && (
              <View style={{
                backgroundColor: `${Colors.amber}20`,
                borderRadius: 8,
                paddingHorizontal: 10,
                paddingVertical: 5,
                borderWidth: 1,
                borderColor: `${Colors.amber}50`,
              }}>
                <Txt size={10} weight="bold" color={Colors.amber} uppercase letterSpacing={1}>Daily Cap Hit!</Txt>
              </View>
            )}
          </View>

          {/* Progress bar */}
          <View style={{ height: 8, backgroundColor: Colors.cardAlt, borderRadius: 4, overflow: "hidden" }}>
            <View style={{
              height: "100%",
              width: `${todayProgress * 100}%`,
              backgroundColor: capReached ? Colors.amber : Colors.violet,
              borderRadius: 4,
            }} />
          </View>
          <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 6 }}>
            <Txt size={11} color={Colors.textMuted}>{todayWorkouts.length} workout{todayWorkouts.length !== 1 ? "s" : ""} · {todayYoga.length} recovery</Txt>
            <Txt size={11} color={Colors.textMuted}>{currentStreak}-day streak</Txt>
          </View>
        </Card>
      </Animated.View>

      {/* Session tiles */}
      <Animated.View entering={FadeInDown.delay(100).duration(400)}>
        <View style={{ flexDirection: "row", gap: 10 }}>
          <StatTile label="Total Earned" value={ltkTotalEarned.toLocaleString()} unit="LTK" color={Colors.violet} icon="diamond" />
          <StatTile label="Sessions Today" value={String(todayWorkouts.length + todayYoga.length)} unit="done" color={Colors.green} icon="checkmark-circle" />
        </View>
      </Animated.View>

      {/* Next rewards available */}
      {!capReached && nextRewards.length > 0 && (
        <Animated.View entering={FadeInDown.delay(140).duration(400)}>
          <SectionHeader title="Earn Next" />
          <Card>
            <View style={{ gap: 10 }}>
              {nextRewards.map((r, i) => (
                <View key={i} style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                  <Ionicons name="add-circle" size={16} color={Colors.violet} />
                  <Txt size={13} color={Colors.textDim}>{r}</Txt>
                </View>
              ))}
            </View>
          </Card>
        </Animated.View>
      )}

      {/* How to earn */}
      <Animated.View entering={FadeInDown.delay(180).duration(400)}>
        <SectionHeader title="How to Earn" />
        <Card>
          <View style={{ gap: 12 }}>
            {EARNING_GUIDE.map((g, i) => (
              <View key={i} style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                <View style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  backgroundColor: `${g.color}18`,
                  borderWidth: 1,
                  borderColor: `${g.color}30`,
                  alignItems: "center",
                  justifyContent: "center",
                }}>
                  <Ionicons name={g.icon as never} size={18} color={g.color} />
                </View>
                <View style={{ flex: 1 }}>
                  <Txt size={13} weight="bold">{g.label}</Txt>
                  <Txt size={11} color={Colors.textMuted}>{g.cap}</Txt>
                </View>
                <View style={{ alignItems: "flex-end" }}>
                  <Txt size={14} weight="bold" color={g.color}>+{g.ltk}</Txt>
                  <Txt size={10} color={Colors.textMuted}>LTK</Txt>
                </View>
              </View>
            ))}
          </View>
        </Card>
      </Animated.View>

      {/* Today's activity */}
      {todayActivity.length > 0 && (
        <Animated.View entering={FadeInDown.delay(220).duration(400)}>
          <SectionHeader title="Today's Activity" />
          <Card>
            <View style={{ gap: 12 }}>
              {todayActivity.map((a) => {
                const meta = ACTIVITY_ICONS[a.type] ?? { icon: "star", color: Colors.violet };
                return (
                  <View key={a.id} style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                    <View style={{
                      width: 34,
                      height: 34,
                      borderRadius: 10,
                      backgroundColor: `${meta.color}18`,
                      borderWidth: 1,
                      borderColor: `${meta.color}30`,
                      alignItems: "center",
                      justifyContent: "center",
                    }}>
                      <Ionicons name={meta.icon as never} size={16} color={meta.color} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Txt size={13}>{a.description}</Txt>
                      <Txt size={11} color={Colors.textMuted}>{timeAgo(a.timestamp)}</Txt>
                    </View>
                    <Txt size={14} weight="bold" color={meta.color}>+{a.amount}</Txt>
                  </View>
                );
              })}
            </View>
          </Card>
        </Animated.View>
      )}

      {/* Redeem CTA */}
      <Animated.View entering={FadeInDown.delay(260).duration(400)}>
        <Card style={{ alignItems: "center", gap: 8, paddingVertical: 20 }}>
          <Ionicons name="diamond" size={28} color={Colors.violet} />
          <Txt size={16} weight="bold" style={{ textAlign: "center" }}>
            {ltkBalance.toLocaleString()} LTK Available
          </Txt>
          <Txt size={12} color={Colors.textMuted} style={{ textAlign: "center" }}>
            Redeem your Littkoin at littyverse.com
          </Txt>
        </Card>
      </Animated.View>
    </ScrollView>
  );
}

function StatTile({
  label, value, unit, color, icon,
}: {
  label: string; value: string; unit: string; color: string; icon: string;
}) {
  return (
    <View style={{ flex: 1 }}>
      <Card style={{ alignItems: "center", gap: 6, paddingVertical: 16 }}>
        <Ionicons name={icon as never} size={20} color={color} />
        <Txt size={22} weight="bold" color={color}>{value}</Txt>
        <Txt size={10} color={Colors.textMuted} uppercase letterSpacing={1}>{unit}</Txt>
        <Txt size={11} color={Colors.textMuted} style={{ textAlign: "center" }}>{label}</Txt>
      </Card>
    </View>
  );
}
