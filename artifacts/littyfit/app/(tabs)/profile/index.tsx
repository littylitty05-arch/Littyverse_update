import React, { useEffect, useState } from "react";
import { View, ScrollView, Pressable, Alert, Platform, Clipboard } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as WebBrowser from "expo-web-browser";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Colors } from "@/constants/Colors";
import { Txt, Card, HapticTap, SectionHeader, Divider } from "@/components/ui";
import { Ring } from "@/components/ring";
import { Flame } from "@/components/flame";
import { LtkBalanceCard } from "@/components/ltk-balance";
import { useAppStore, useLevel } from "@/store/useAppStore";
import { ACHIEVEMENTS_ALL } from "@/data/content";
import type { LtkActivity } from "@/store/types";

export default function Profile() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const profile = useAppStore((s) => s.profile);
  const ltkBalance = useAppStore((s) => s.ltkBalance);
  const ltkTotalEarned = useAppStore((s) => s.ltkTotalEarned);
  const ltkActivity = useAppStore((s) => s.ltkActivity);
  const currentStreak = useAppStore((s) => s.currentStreak);
  const bestStreak = useAppStore((s) => s.bestStreak);
  const workouts = useAppStore((s) => s.completedWorkouts);
  const yogaSessions = useAppStore((s) => s.yogaSessions);
  const achievements = useAppStore((s) => s.achievements);
  const logout = useAppStore((s) => s.logout);
  const { level, progress, title } = useLevel();
  const [gymId, setGymId] = useState<string | null>(null);
  const [gymIdCopied, setGymIdCopied] = useState(false);
  const [adminTaps, setAdminTaps] = useState(0);
  const [adminHint, setAdminHint] = useState(false);

  useEffect(() => {
    import("@react-native-async-storage/async-storage").then(({ default: AS }) => {
      AS.getItem("__gym_user__").then((raw) => {
        if (raw) setGymId(JSON.parse(raw).gymId);
      });
    });
  }, []);

  const copyGymId = () => {
    if (!gymId) return;
    Clipboard.setString(gymId);
    setGymIdCopied(true);
    setTimeout(() => setGymIdCopied(false), 2000);
  };

  const initials = (profile?.name ?? "AT")
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const openLink = async (url: string) => {
    HapticTap.light();
    await WebBrowser.openBrowserAsync(url);
  };

  const confirmLogout = () => {
    HapticTap.medium();
    if (Platform.OS === "web") {
      if (confirm("Log out?")) {
        logout();
        router.replace("/auth/login");
      }
    } else {
      Alert.alert("Log out", "Are you sure?", [
        { text: "Cancel", style: "cancel" },
        {
          text: "Log Out",
          style: "destructive",
          onPress: () => {
            logout();
            router.replace("/auth/login");
          },
        },
      ]);
    }
  };

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
        <View style={{ alignItems: "center", gap: 12, paddingVertical: 8 }}>
          <View
            style={{
              width: 80,
              height: 80,
              borderRadius: 40,
              backgroundColor: Colors.cardAlt,
              borderWidth: 2,
              borderColor: Colors.violet,
              alignItems: "center",
              justifyContent: "center",
              boxShadow: `0 0 30px ${Colors.violetGlow}`,
            }}
          >
            <Txt size={28} weight="bold" color={Colors.violet}>
              {initials}
            </Txt>
          </View>
          <View style={{ alignItems: "center", gap: 4 }}>
            <Txt size={22} weight="bold">
              {profile?.name ?? "Athlete"}
            </Txt>
            <Txt size={11} color={Colors.textDim}>
              Member since{" "}
              {profile?.memberSince
                ? new Date(profile.memberSince).getFullYear()
                : new Date().getFullYear()}
            </Txt>
          </View>
        </View>
      </Animated.View>

      {/* Gym ID Card */}
      {gymId && (
        <Animated.View entering={FadeInDown.delay(40).duration(400)}>
          <Pressable
            onPress={copyGymId}
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              backgroundColor: `${Colors.violet}10`,
              borderRadius: 14,
              borderWidth: 1,
              borderColor: `${Colors.violet}40`,
              paddingHorizontal: 16,
              paddingVertical: 12,
            }}
          >
            <View style={{ gap: 2 }}>
              <Txt size={10} color={Colors.textMuted} uppercase letterSpacing={1.5}>Litty Gym ID</Txt>
              <Txt size={18} weight="bold" color={Colors.violet} letterSpacing={2}>{gymId}</Txt>
            </View>
            <Ionicons
              name={gymIdCopied ? "checkmark-circle" : "copy-outline"}
              size={20}
              color={gymIdCopied ? Colors.green : Colors.violet}
            />
          </Pressable>
        </Animated.View>
      )}

      {/* LTK Wallet */}
      <Animated.View entering={FadeInDown.delay(80).duration(400)}>
        <LtkBalanceCard balance={ltkBalance} />
      </Animated.View>
      <Animated.View entering={FadeInDown.delay(120).duration(400)}>
        <Pressable
          onPress={() => openLink("https://littyverse.com")}
          style={{
            padding: 14,
            borderRadius: 14,
            borderWidth: 1,
            borderColor: Colors.violet,
            backgroundColor: `${Colors.violet}11`,
            flexDirection: "row",
            alignItems: "center",
            gap: 10,
            justifyContent: "center",
          }}
        >
          <Ionicons name="open-outline" size={16} color={Colors.violet} />
          <Txt size={12} weight="bold" color={Colors.violet} uppercase letterSpacing={2}>
            Redeem at littyverse.com
          </Txt>
        </Pressable>
      </Animated.View>

      {/* Stats grid */}
      <Animated.View entering={FadeInDown.delay(160).duration(400)} style={{ flexDirection: "row", gap: 10 }}>
        <StatBox label="Total Workouts" value={`${workouts.length}`} icon="barbell" color={Colors.orange} />
        <StatBox label="Best Streak" value={`${bestStreak}d`} icon="flame" color={Colors.red} />
      </Animated.View>
      <Animated.View entering={FadeInDown.delay(200).duration(400)} style={{ flexDirection: "row", gap: 10 }}>
        <StatBox label="Yoga Sessions" value={`${yogaSessions.length}`} icon="moon" color={Colors.violet} />
        <StatBox label="Total LTK Earned" value={`${ltkTotalEarned.toLocaleString()}`} icon="wallet" color={Colors.amber} />
      </Animated.View>

      {/* Level ring */}
      <Animated.View entering={FadeInDown.delay(240).duration(400)}>
        <Card padding={16}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 16 }}>
            <Ring
              size={96}
              strokeWidth={10}
              progress={progress}
              gradient={[Colors.violet, Colors.blue]}
            >
              <View style={{ alignItems: "center" }}>
                <Txt size={10} weight="bold" color={Colors.textDim} uppercase letterSpacing={1.5}>
                  Level
                </Txt>
                <Txt size={26} weight="bold">
                  {level}
                </Txt>
              </View>
            </Ring>
            <View style={{ flex: 1, gap: 6 }}>
              <Txt size={11} weight="bold" color={Colors.violet} uppercase letterSpacing={2}>
                Current Title
              </Txt>
              <Txt size={18} weight="bold">
                {title}
              </Txt>
              <View style={{ flexDirection: "row", gap: 8, alignItems: "center" }}>
                <Flame streak={currentStreak} size={14} showCount={false} />
                <Txt size={11} color={Colors.textDim}>
                  {currentStreak}-day active streak
                </Txt>
              </View>
            </View>
          </View>
        </Card>
      </Animated.View>

      {/* Activity */}
      <SectionHeader title="Recent Activity" />
      <Card padding={12}>
        {ltkActivity.length === 0 ? (
          <View style={{ alignItems: "center", gap: 8, paddingVertical: 24 }}>
            <Ionicons name="flash" size={32} color={Colors.textMuted} />
            <Txt size={12} color={Colors.textDim}>
              Earn your first LTK to see activity.
            </Txt>
          </View>
        ) : (
          ltkActivity.slice(0, 20).map((a, i) => (
            <View key={a.id}>
              <ActivityRow activity={a} />
              {i < Math.min(ltkActivity.length, 20) - 1 && <Divider />}
            </View>
          ))
        )}
      </Card>

      {/* Achievements */}
      <SectionHeader title="Achievements" />
      <Card padding={14}>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
          {ACHIEVEMENTS_ALL.map((a) => {
            const earned = achievements.find((e) => e.id === a.id);
            return (
              <View
                key={a.id}
                style={{
                  width: "31%",
                  aspectRatio: 1,
                  borderRadius: 14,
                  backgroundColor: earned ? `${Colors.amber}11` : Colors.cardAlt,
                  borderWidth: 1,
                  borderColor: earned ? Colors.amber : Colors.border,
                  alignItems: "center",
                  justifyContent: "center",
                  padding: 8,
                  gap: 6,
                  opacity: earned ? 1 : 0.45,
                }}
              >
                <Ionicons
                  name={a.icon as keyof typeof Ionicons.glyphMap}
                  size={24}
                  color={earned ? Colors.amber : Colors.textMuted}
                />
                <Txt size={9} weight="bold" color={earned ? Colors.text : Colors.textDim} style={{ textAlign: "center" }} uppercase letterSpacing={0.5}>
                  {a.name}
                </Txt>
              </View>
            );
          })}
        </View>
      </Card>

      {/* Settings */}
      <SectionHeader title="Settings" />
      <Card padding={0}>
        <SettingRow icon="person" label="Edit Profile" onPress={() => router.push("/(tabs)/profile/edit")} />
        <Divider />
        <SettingRow icon="notifications" label="Notifications" onPress={() => HapticTap.light()} />
        <Divider />
        <SettingRow icon="moon" label="Dark Mode" right={<Txt size={11} color={Colors.textDim}>Always</Txt>} onPress={() => HapticTap.light()} />
        <Divider />
        <SettingRow icon="options" label="Units" right={<Txt size={11} color={Colors.textDim}>{profile?.units ?? "imperial"}</Txt>} onPress={() => HapticTap.light()} />
        <Divider />
        <SettingRow icon="planet" label="littyverse.com" onPress={() => openLink("https://littyverse.com")} />
        <Divider />
        <SettingRow icon="flame" label="LittyFit" onPress={() => openLink("https://littyverse.com/littyfit")} />
        <Divider />
        <SettingRow icon="log-out" label="Log Out" danger onPress={confirmLogout} />
      </Card>

      {/* Support & Legal */}
      <SectionHeader title="Support & Legal" />
      <Card padding={0}>
        <SettingRow
          icon="document-text"
          label="Privacy Policy"
          onPress={() => openLink("https://littyverse.com/privacy")}
        />
        <Divider />
        <SettingRow
          icon="shield-checkmark"
          label="Terms of Service"
          onPress={() => openLink("https://littyverse.com/terms")}
        />
        <Divider />
        <SettingRow
          icon="mail"
          label="Contact Support"
          onPress={() => openLink("mailto:support@littyverse.com")}
        />
      </Card>

      {/* Version / admin easter egg */}
      <Pressable
        onPress={() => {
          const next = adminTaps + 1;
          setAdminTaps(next);
          if (next >= 5) {
            setAdminTaps(0);
            router.push("/admin/checklist");
          } else if (next >= 3) {
            setAdminHint(true);
            setTimeout(() => setAdminHint(false), 1500);
          }
        }}
        style={{ alignItems: "center", paddingVertical: 16 }}
      >
        <Txt size={11} color={Colors.textMuted}>
          LittyFit v1.0.0{adminHint ? ` · ${5 - adminTaps} more...` : ""}
        </Txt>
      </Pressable>
    </ScrollView>
  );
}

function StatBox({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
}) {
  return (
    <Card padding={14} style={{ flex: 1, gap: 8 }}>
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
      <Txt size={22} weight="bold" style={{ fontVariant: ["tabular-nums"] }}>
        {value}
      </Txt>
      <Txt size={10} weight="bold" color={Colors.textDim} uppercase letterSpacing={1}>
        {label}
      </Txt>
    </Card>
  );
}

function ActivityRow({ activity }: { activity: LtkActivity }) {
  const iconMap: Record<LtkActivity["type"], keyof typeof Ionicons.glyphMap> = {
    workout: "barbell",
    yoga: "moon",
    meal: "leaf",
    checkin: "checkmark-circle",
    streak: "flame",
    hydration: "water",
    non_negotiables: "star",
  };
  const colorMap: Record<LtkActivity["type"], string> = {
    workout: Colors.orange,
    yoga: Colors.violet,
    meal: Colors.green,
    checkin: Colors.blue,
    streak: Colors.red,
    hydration: Colors.blue,
    non_negotiables: Colors.amber,
  };
  const color = colorMap[activity.type];
  const minAgo = Math.floor((Date.now() - activity.timestamp) / 60000);
  const time = minAgo < 1 ? "just now" : minAgo < 60 ? `${minAgo}m ago` : `${Math.floor(minAgo / 60)}h ago`;
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 10, padding: 10 }}>
      <View
        style={{
          width: 32,
          height: 32,
          borderRadius: 10,
          backgroundColor: `${color}22`,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Ionicons name={iconMap[activity.type]} size={14} color={color} />
      </View>
      <View style={{ flex: 1 }}>
        <Txt size={12} weight="semiBold">
          {activity.description}
        </Txt>
        <Txt size={10} color={Colors.textMuted}>
          {time}
        </Txt>
      </View>
      <Txt size={12} weight="bold" color={activity.amount >= 0 ? Colors.violet : Colors.red}>
        {activity.amount >= 0 ? "+" : ""}
        {activity.amount} LTK
      </Txt>
    </View>
  );
}

function SettingRow({
  icon,
  label,
  onPress,
  right,
  danger,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  right?: React.ReactNode;
  danger?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        padding: 14,
      }}
    >
      <Ionicons name={icon} size={18} color={danger ? Colors.red : Colors.violet} />
      <Txt size={14} weight="semiBold" color={danger ? Colors.red : Colors.text} style={{ flex: 1 }}>
        {label}
      </Txt>
      {right}
      <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
    </Pressable>
  );
}
