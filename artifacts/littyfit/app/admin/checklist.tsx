import React, { useState } from "react";
import { View, ScrollView, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Colors } from "@/constants/Colors";
import { Txt, Card, HapticTap } from "@/components/ui";
import { useAppStore, LTK_DAILY_CAP, useTodayLtk } from "@/store/useAppStore";

interface CheckItem {
  id: string;
  label: string;
  description: string;
  icon: string;
  color: string;
  group: string;
}

const CHECKLIST: CheckItem[] = [
  {
    id: "recovery_cap",
    label: "Recovery rewards capped",
    description: "Yoga/recovery sessions only grant LTK once per day per user",
    icon: "shield-checkmark",
    color: Colors.green,
    group: "Reward Safety",
  },
  {
    id: "workout_cap",
    label: "Workout LTK capped",
    description: "Max 2 workouts per day earn LTK (50 LTK max from workouts)",
    icon: "shield-checkmark",
    color: Colors.green,
    group: "Reward Safety",
  },
  {
    id: "daily_cap",
    label: `Daily ${LTK_DAILY_CAP} LTK cap enforced`,
    description: `addLtk() silently caps at ${LTK_DAILY_CAP} LTK per day per device`,
    icon: "shield-checkmark",
    color: Colors.green,
    group: "Reward Safety",
  },
  {
    id: "timers",
    label: "Session timers enforced",
    description: "Yoga pose timers and workout rest timers are running, skip is user-controlled only",
    icon: "timer",
    color: Colors.blue,
    group: "Session Integrity",
  },
  {
    id: "session_resume",
    label: "Session resume working",
    description: "Abandoning a session shows Resume banner on Home tab",
    icon: "refresh-circle",
    color: Colors.blue,
    group: "Session Integrity",
  },
  {
    id: "demo_images",
    label: "Demo pose images visible",
    description: "Yoga poses display correctly on the session screen",
    icon: "image",
    color: Colors.amber,
    group: "Content",
  },
  {
    id: "mobile_nav",
    label: "Bottom navigation working",
    description: "All 5 tabs (Home, Train, Recover, Rewards, Profile) are accessible",
    icon: "menu",
    color: Colors.violet,
    group: "Navigation",
  },
  {
    id: "privacy_policy",
    label: "Privacy Policy linked",
    description: "Privacy Policy link is in Profile > Support & Legal",
    icon: "document-text",
    color: Colors.violet,
    group: "Legal",
  },
  {
    id: "support_email",
    label: "Support email linked",
    description: "Contact Support email is accessible in Profile > Support & Legal",
    icon: "mail",
    color: Colors.violet,
    group: "Legal",
  },
  {
    id: "no_broken_buttons",
    label: "No broken buttons",
    description: "All CTAs, nav buttons, and form submissions tested on mobile",
    icon: "finger-print",
    color: Colors.green,
    group: "QA",
  },
  {
    id: "android_tested",
    label: "Tested on Android browser",
    description: "App opened and verified in Android Chrome / Median wrapper",
    icon: "logo-android",
    color: Colors.green,
    group: "QA",
  },
  {
    id: "https",
    label: "HTTPS working",
    description: "App loads correctly over HTTPS from litty-fit.replit.app",
    icon: "lock-closed",
    color: Colors.green,
    group: "Deployment",
  },
  {
    id: "no_debug",
    label: "No debug panels visible",
    description: "No dev tools, console output, or debug banners visible to users",
    icon: "eye-off",
    color: Colors.green,
    group: "Deployment",
  },
];

const GROUPS = Array.from(new Set(CHECKLIST.map((c) => c.group)));

export default function LaunchChecklist() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const ltkBalance = useAppStore((s) => s.ltkBalance);
  const ltkTotalEarned = useAppStore((s) => s.ltkTotalEarned);
  const completedWorkouts = useAppStore((s) => s.completedWorkouts);
  const yogaSessions = useAppStore((s) => s.yogaSessions);
  const todayLtk = useTodayLtk();

  const toggle = (id: string) => {
    HapticTap.light();
    setChecked((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const total = CHECKLIST.length;
  const done = checked.size;
  const pct = Math.round((done / total) * 100);
  const allDone = done === total;

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
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 4 }}>
          <Pressable
            onPress={() => router.back()}
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
            <Ionicons name="chevron-back" size={20} color={Colors.text} />
          </Pressable>
          <View>
            <Txt size={10} weight="bold" color={Colors.textMuted} uppercase letterSpacing={2}>Admin Only</Txt>
            <Txt size={22} weight="bold">Mobile Launch Checklist</Txt>
          </View>
        </View>
      </Animated.View>

      {/* Progress */}
      <Animated.View entering={FadeInDown.delay(60).duration(400)}>
        <Card style={{ gap: 10 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
            <Txt size={14} weight="bold">{done} / {total} items complete</Txt>
            <Txt size={14} weight="bold" color={allDone ? Colors.green : Colors.violet}>{pct}%</Txt>
          </View>
          <View style={{ height: 8, backgroundColor: Colors.cardAlt, borderRadius: 4, overflow: "hidden" }}>
            <View style={{
              height: "100%",
              width: `${pct}%`,
              backgroundColor: allDone ? Colors.green : Colors.violet,
              borderRadius: 4,
            }} />
          </View>
          {allDone && (
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <Ionicons name="rocket" size={16} color={Colors.green} />
              <Txt size={13} weight="bold" color={Colors.green}>Ready to launch!</Txt>
            </View>
          )}
        </Card>
      </Animated.View>

      {/* Live stats */}
      <Animated.View entering={FadeInDown.delay(100).duration(400)}>
        <Txt size={11} weight="bold" color={Colors.textMuted} uppercase letterSpacing={1.5} style={{ marginBottom: 8 }}>
          Live Store Stats
        </Txt>
        <View style={{ flexDirection: "row", gap: 8 }}>
          <MiniStat label="LTK Balance" value={String(ltkBalance)} color={Colors.violet} />
          <MiniStat label="Total Earned" value={String(ltkTotalEarned)} color={Colors.amber} />
          <MiniStat label="Today LTK" value={`${todayLtk}/${LTK_DAILY_CAP}`} color={Colors.green} />
        </View>
        <View style={{ flexDirection: "row", gap: 8, marginTop: 8 }}>
          <MiniStat label="Workouts" value={String(completedWorkouts.length)} color={Colors.orange} />
          <MiniStat label="Recovery" value={String(yogaSessions.length)} color={Colors.blue} />
        </View>
      </Animated.View>

      {/* Checklist by group */}
      {GROUPS.map((group, gi) => {
        const items = CHECKLIST.filter((c) => c.group === group);
        return (
          <Animated.View key={group} entering={FadeInDown.delay(140 + gi * 40).duration(400)}>
            <Txt size={11} weight="bold" color={Colors.textMuted} uppercase letterSpacing={1.5} style={{ marginBottom: 8 }}>
              {group}
            </Txt>
            <Card>
              <View style={{ gap: 0 }}>
                {items.map((item, ii) => {
                  const isDone = checked.has(item.id);
                  return (
                    <Pressable
                      key={item.id}
                      onPress={() => toggle(item.id)}
                      style={({ pressed }) => ({
                        flexDirection: "row",
                        alignItems: "flex-start",
                        gap: 12,
                        paddingVertical: 12,
                        paddingHorizontal: 2,
                        borderTopWidth: ii > 0 ? 1 : 0,
                        borderTopColor: Colors.border,
                        opacity: pressed ? 0.7 : 1,
                      })}
                    >
                      <View style={{
                        width: 28,
                        height: 28,
                        borderRadius: 8,
                        backgroundColor: isDone ? `${Colors.green}22` : `${item.color}12`,
                        borderWidth: 1,
                        borderColor: isDone ? Colors.green : `${item.color}30`,
                        alignItems: "center",
                        justifyContent: "center",
                        marginTop: 1,
                      }}>
                        <Ionicons
                          name={isDone ? "checkmark" : item.icon as never}
                          size={14}
                          color={isDone ? Colors.green : item.color}
                        />
                      </View>
                      <View style={{ flex: 1, gap: 2 }}>
                        <Txt
                          size={13}
                          weight="bold"
                          color={isDone ? Colors.textMuted : Colors.text}
                          style={{ textDecorationLine: isDone ? "line-through" : "none" }}
                        >
                          {item.label}
                        </Txt>
                        <Txt size={11} color={Colors.textMuted}>{item.description}</Txt>
                      </View>
                    </Pressable>
                  );
                })}
              </View>
            </Card>
          </Animated.View>
        );
      })}
    </ScrollView>
  );
}

function MiniStat({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <View style={{ flex: 1 }}>
      <Card style={{ alignItems: "center", paddingVertical: 12, gap: 4 }}>
        <Txt size={16} weight="bold" color={color}>{value}</Txt>
        <Txt size={10} color={Colors.textMuted} style={{ textAlign: "center" }}>{label}</Txt>
      </Card>
    </View>
  );
}
