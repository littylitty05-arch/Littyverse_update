import React, { useMemo, useState } from "react";
import { View, ScrollView, Pressable, TextInput } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Svg, { Polyline, Line } from "react-native-svg";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Colors } from "@/constants/Colors";
import { Txt, Card, Btn, HapticTap, SectionHeader } from "@/components/ui";
import { Fonts } from "@/constants/Typography";
import { useAppStore } from "@/store/useAppStore";

export default function ProgressScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const workouts = useAppStore((s) => s.completedWorkouts);
  const streak = useAppStore((s) => s.currentStreak);
  const bodyStats = useAppStore((s) => s.bodyStats);
  const personalRecords = useAppStore((s) => s.personalRecords);
  const addBodyStat = useAppStore((s) => s.addBodyStat);

  const [weight, setWeight] = useState("");
  const [bodyFat, setBodyFat] = useState("");
  const [statSaved, setStatSaved] = useState(false);

  const thisWeek = useMemo(() => {
    const now = new Date();
    const start = new Date(now);
    start.setDate(now.getDate() - 6);
    return workouts.filter((w) => new Date(w.date) >= start).length;
  }, [workouts]);

  const weekLtk = useMemo(() => thisWeek * 25, [thisWeek]);

  const weightSeries = useMemo(
    () =>
      [...bodyStats]
        .filter((b) => b.weight !== undefined)
        .reverse()
        .slice(-12)
        .map((b) => b.weight!),
    [bodyStats]
  );

  const calendarDays = useMemo(() => {
    const days: { date: number; state: "full" | "partial" | "missed" | "empty" }[] = [];
    const today = new Date();
    const month = today.getMonth();
    const year = today.getFullYear();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    for (let i = 0; i < firstDay; i++) days.push({ date: 0, state: "empty" });
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = new Date(year, month, d).toISOString().slice(0, 10);
      const hasWorkout = workouts.some((w) => w.date.slice(0, 10) === dateStr);
      const isToday = d === today.getDate();
      const isFuture = d > today.getDate();
      let state: "full" | "partial" | "missed" | "empty" = "missed";
      if (isFuture) state = "empty";
      else if (hasWorkout) state = "full";
      else if (isToday) state = "partial";
      days.push({ date: d, state });
    }
    return days;
  }, [workouts]);

  const addStat = () => {
    const wStr = weight.trim().replace(",", ".");
    const bfStr = bodyFat.trim().replace(",", ".");
    const w = wStr ? parseFloat(wStr) : NaN;
    const bf = bfStr ? parseFloat(bfStr) : NaN;
    if (isNaN(w) && isNaN(bf)) return;
    addBodyStat({
      date: new Date().toISOString(),
      weight: !isNaN(w) ? w : undefined,
      bodyFat: !isNaN(bf) ? bf : undefined,
    });
    setWeight("");
    setBodyFat("");
    HapticTap.success();
    setStatSaved(true);
    setTimeout(() => setStatSaved(false), 2500);
  };

  const prList = Object.entries(personalRecords);

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
        <Txt size={24} weight="bold" uppercase letterSpacing={1}>
          Progress
        </Txt>
      </View>

      <Animated.View entering={FadeInDown.duration(400)}>
        <SectionHeader title="This Week" />
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(60).duration(400)} style={{ flexDirection: "row", gap: 12 }}>
        <StatChip label="Workouts" value={`${thisWeek}`} color={Colors.orange} icon="barbell" />
        <StatChip label="LTK Earned" value={`${weekLtk}`} color={Colors.violet} icon="wallet" />
        <StatChip label="Streak" value={`${streak}d`} color={Colors.red} icon="flame" />
      </Animated.View>

      {/* Calendar */}
      <Animated.View entering={FadeInDown.delay(120).duration(400)}>
        <Card padding={16}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 16 }}>
            <Txt size={13} weight="bold" uppercase letterSpacing={1}>
              {new Date().toLocaleString("en-US", { month: "long", year: "numeric" })}
            </Txt>
            <View style={{ flexDirection: "row", gap: 10 }}>
              <Legend color={Colors.green} label="Full" />
              <Legend color={Colors.amber} label="Partial" />
              <Legend color={Colors.red} label="Miss" />
            </View>
          </View>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
            {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
              <Txt key={i} size={10} weight="bold" color={Colors.textMuted} uppercase style={{ width: 36, textAlign: "center" }}>
                {d}
              </Txt>
            ))}
            {calendarDays.map((d, i) => (
              <View
                key={i}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  backgroundColor:
                    d.state === "full"
                      ? `${Colors.green}33`
                      : d.state === "partial"
                        ? `${Colors.amber}22`
                        : d.state === "missed"
                          ? `${Colors.red}11`
                          : "transparent",
                  borderWidth: 1,
                  borderColor:
                    d.state === "full"
                      ? Colors.green
                      : d.state === "partial"
                        ? Colors.amber
                        : d.state === "missed"
                          ? `${Colors.red}44`
                          : Colors.border,
                  alignItems: "center",
                  justifyContent: "center",
                  opacity: d.state === "empty" ? 0.2 : 1,
                }}
              >
                {d.date > 0 && (
                  <Txt size={11} weight="semiBold" color={d.state === "empty" ? Colors.textMuted : Colors.text}>
                    {d.date}
                  </Txt>
                )}
              </View>
            ))}
          </View>
        </Card>
      </Animated.View>

      {/* Body Stats */}
      <Animated.View entering={FadeInDown.delay(180).duration(400)}>
        <SectionHeader title="Body Stats" />
      </Animated.View>
      <Animated.View entering={FadeInDown.delay(200).duration(400)}>
        <Card padding={16}>
          {weightSeries.length > 1 ? (
            <View style={{ height: 120, marginBottom: 16 }}>
              <LineChart values={weightSeries} />
            </View>
          ) : (
            <View
              style={{
                height: 100,
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 16,
              }}
            >
              <Txt size={12} color={Colors.textDim}>
                Log 2+ entries to see your trend
              </Txt>
            </View>
          )}
          <View style={{ flexDirection: "row", gap: 10 }}>
            <View style={{ flex: 1, gap: 6 }}>
              <Txt size={10} weight="bold" color={Colors.textDim} uppercase letterSpacing={1.5}>
                Weight (lbs)
              </Txt>
              <TextInput
                value={weight}
                onChangeText={setWeight}
                keyboardType="decimal-pad"
                placeholder="—"
                placeholderTextColor={Colors.textMuted}
                style={{
                  fontFamily: Fonts.bold,
                  fontSize: 18,
                  color: Colors.text,
                  borderWidth: 1,
                  borderColor: Colors.border,
                  borderRadius: 10,
                  paddingHorizontal: 12,
                  height: 42,
                }}
              />
            </View>
            <View style={{ flex: 1, gap: 6 }}>
              <Txt size={10} weight="bold" color={Colors.textDim} uppercase letterSpacing={1.5}>
                Body Fat (%)
              </Txt>
              <TextInput
                value={bodyFat}
                onChangeText={setBodyFat}
                keyboardType="decimal-pad"
                placeholder="—"
                placeholderTextColor={Colors.textMuted}
                style={{
                  fontFamily: Fonts.bold,
                  fontSize: 18,
                  color: Colors.text,
                  borderWidth: 1,
                  borderColor: Colors.border,
                  borderRadius: 10,
                  paddingHorizontal: 12,
                  height: 42,
                }}
              />
            </View>
          </View>
          {statSaved && (
            <View style={{
              marginTop: 10,
              backgroundColor: `${Colors.green}22`,
              borderRadius: 10,
              borderWidth: 1,
              borderColor: Colors.green,
              paddingVertical: 8,
              paddingHorizontal: 14,
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
            }}>
              <Ionicons name="checkmark-circle" size={16} color={Colors.green} />
              <Txt size={13} weight="bold" color={Colors.green}>Stat saved!</Txt>
            </View>
          )}
          <View style={{ marginTop: 12 }}>
            <Btn title="Log Entry" variant="secondary" onPress={addStat} size="sm" />
          </View>
        </Card>
      </Animated.View>

      {/* PRs */}
      <Animated.View entering={FadeInDown.delay(250).duration(400)}>
        <SectionHeader title="Personal Records" />
      </Animated.View>
      <Animated.View entering={FadeInDown.delay(270).duration(400)}>
        <Card padding={16}>
          {prList.length === 0 ? (
            <View style={{ alignItems: "center", gap: 8, paddingVertical: 16 }}>
              <Ionicons name="trophy" size={28} color={Colors.textMuted} />
              <Txt size={12} color={Colors.textDim}>
                No PRs yet. Hit the weights and earn your first.
              </Txt>
            </View>
          ) : (
            <View style={{ gap: 10 }}>
              {prList.map(([ex, pr]) => (
                <View
                  key={ex}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: 12,
                    borderRadius: 12,
                    backgroundColor: Colors.cardAlt,
                  }}
                >
                  <View style={{ gap: 2, flex: 1 }}>
                    <Txt size={13} weight="bold">
                      {ex}
                    </Txt>
                    <Txt size={10} color={Colors.textDim} uppercase letterSpacing={1}>
                      {new Date(pr.date).toLocaleDateString()}
                    </Txt>
                  </View>
                  <Txt size={16} weight="bold" color={Colors.amber}>
                    {pr.weight} × {pr.reps}
                  </Txt>
                </View>
              ))}
            </View>
          )}
        </Card>
      </Animated.View>
    </ScrollView>
  );
}

function StatChip({
  label,
  value,
  color,
  icon,
}: {
  label: string;
  value: string;
  color: string;
  icon: keyof typeof Ionicons.glyphMap;
}) {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: Colors.card,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: Colors.border,
        padding: 14,
        gap: 8,
      }}
    >
      <View
        style={{
          width: 28,
          height: 28,
          borderRadius: 14,
          backgroundColor: `${color}22`,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Ionicons name={icon} size={14} color={color} />
      </View>
      <Txt size={20} weight="bold" style={{ fontVariant: ["tabular-nums"] }}>
        {value}
      </Txt>
      <Txt size={10} weight="bold" color={Colors.textDim} uppercase letterSpacing={1}>
        {label}
      </Txt>
    </View>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
      <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: color }} />
      <Txt size={9} color={Colors.textDim} uppercase letterSpacing={1}>
        {label}
      </Txt>
    </View>
  );
}

function LineChart({ values }: { values: number[] }) {
  const w = 300;
  const h = 120;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const points = values
    .map((v, i) => {
      const x = (i / Math.max(1, values.length - 1)) * w;
      const y = h - ((v - min) / range) * (h - 20) - 10;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <View style={{ flex: 1 }}>
      <Svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
        {[0, 1, 2, 3].map((i) => (
          <Line
            key={i}
            x1={0}
            y1={(h / 4) * i}
            x2={w}
            y2={(h / 4) * i}
            stroke={Colors.border}
            strokeWidth={0.5}
          />
        ))}
        <Polyline
          points={points}
          fill="none"
          stroke={Colors.violet}
          strokeWidth={2.5}
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      </Svg>
    </View>
  );
}
