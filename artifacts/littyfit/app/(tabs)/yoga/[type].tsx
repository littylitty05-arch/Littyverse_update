import React, { useCallback, useEffect, useState } from "react";
import { View, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeIn } from "react-native-reanimated";
import { Colors } from "@/constants/Colors";
import { Txt, Btn, HapticTap } from "@/components/ui";
import { findYoga } from "@/data/content";
import { useAppStore } from "@/store/useAppStore";
import { Ring } from "@/components/ring";

export default function YogaSession() {
  const { type } = useLocalSearchParams<{ type: string }>();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const program = findYoga(String(type));
  const [idx, setIdx] = useState(0);
  const [remaining, setRemaining] = useState(program.poses[0].duration);
  const [running, setRunning] = useState(false);
  const [finished, setFinished] = useState(false);
  const completeYoga = useAppStore((s) => s.completeYoga);
  const unlock = useAppStore((s) => s.unlockAchievement);
  const yogaSessions = useAppStore((s) => s.yogaSessions);
  const setActiveSession = useAppStore((s) => s.setActiveSession);

  useEffect(() => {
    setActiveSession({
      type: "yoga",
      id: String(type),
      label: `${program.name} · ${program.duration} min`,
      startedAt: Date.now(),
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFinish = useCallback(() => {
    HapticTap.success();
    completeYoga(program.name, program.duration);
    if (yogaSessions.length + 1 >= 10) {
      unlock({ id: "yoga-warrior", name: "Yoga Warrior", icon: "moon" });
    }
    setFinished(true);
  }, [completeYoga, program.name, program.duration, yogaSessions.length, unlock]);

  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          HapticTap.medium();
          if (idx < program.poses.length - 1) {
            setIdx((i) => i + 1);
            return program.poses[idx + 1].duration;
          } else {
            setRunning(false);
            handleFinish();
            return 0;
          }
        }
        return r - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [running, idx, program, handleFinish]);

  const current = program.poses[idx];
  const totalProgress = (idx + (1 - remaining / current.duration)) / program.poses.length;
  const poseProgress = 1 - remaining / current.duration;

  if (finished) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: Colors.bg,
          paddingTop: insets.top + 20,
          paddingBottom: insets.bottom + 20,
          paddingHorizontal: 24,
          alignItems: "center",
          justifyContent: "center",
          gap: 24,
        }}
      >
        <Animated.View
          entering={FadeIn.duration(600)}
          style={{
            width: 140,
            height: 140,
            borderRadius: 70,
            backgroundColor: `${program.color}22`,
            borderWidth: 2,
            borderColor: program.color,
            alignItems: "center",
            justifyContent: "center",
            boxShadow: `0 0 60px ${program.color}88`,
          }}
        >
          <Ionicons name="flower" size={72} color={program.color} />
        </Animated.View>
        <View style={{ alignItems: "center", gap: 10 }}>
          <Txt size={11} weight="bold" color={program.color} uppercase letterSpacing={3}>
            Session Complete
          </Txt>
          <Txt size={32} weight="bold" style={{ textAlign: "center" }}>
            +15 LTK
          </Txt>
          <Txt size={13} color={Colors.textDim} style={{ textAlign: "center" }}>
            {program.name} · {program.duration} min
          </Txt>
        </View>
        <View style={{ width: "100%" }}>
          <Btn title="Done" onPress={() => router.back()} size="lg" />
        </View>
      </View>
    );
  }

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: Colors.bg,
        paddingTop: insets.top + 12,
        paddingBottom: insets.bottom + 20,
        paddingHorizontal: 20,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
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
        <View style={{ flex: 1 }}>
          <Txt size={11} weight="bold" color={program.color} uppercase letterSpacing={2}>
            {program.name}
          </Txt>
          <Txt size={16} weight="bold">
            Pose {idx + 1} of {program.poses.length}
          </Txt>
        </View>
      </View>

      {/* Overall progress */}
      <View
        style={{
          height: 4,
          backgroundColor: Colors.cardAlt,
          borderRadius: 2,
          overflow: "hidden",
          marginTop: 16,
        }}
      >
        <View
          style={{
            height: "100%",
            width: `${totalProgress * 100}%`,
            backgroundColor: program.color,
          }}
        />
      </View>

      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", gap: 24 }}>
        <Ring
          size={260}
          strokeWidth={14}
          progress={poseProgress}
          gradient={[program.color, Colors.violet]}
        >
          <View style={{ alignItems: "center", gap: 6 }}>
            <Txt size={11} weight="bold" color={Colors.textDim} uppercase letterSpacing={2}>
              Hold
            </Txt>
            <Txt size={56} weight="bold" style={{ fontVariant: ["tabular-nums"] }}>
              {remaining}
            </Txt>
            <Txt size={10} color={Colors.textMuted} uppercase letterSpacing={1}>
              seconds
            </Txt>
          </View>
        </Ring>

        <Animated.View key={idx} entering={FadeIn.duration(300)} style={{ alignItems: "center", gap: 8 }}>
          <Txt size={28} weight="bold" style={{ textAlign: "center" }}>
            {current.name}
          </Txt>
          <Txt size={14} color={Colors.textDim} style={{ textAlign: "center" }}>
            {current.cue}
          </Txt>
        </Animated.View>
      </View>

      {/* Controls */}
      <View style={{ gap: 12 }}>
        <View style={{ flexDirection: "row", gap: 10 }}>
          <Pressable
            disabled={idx === 0}
            onPress={() => {
              HapticTap.light();
              if (idx > 0) {
                setIdx(idx - 1);
                setRemaining(program.poses[idx - 1].duration);
              }
            }}
            style={{
              width: 56,
              height: 56,
              borderRadius: 28,
              backgroundColor: Colors.card,
              borderWidth: 1,
              borderColor: Colors.border,
              alignItems: "center",
              justifyContent: "center",
              opacity: idx === 0 ? 0.5 : 1,
            }}
          >
            <Ionicons name="play-skip-back" size={22} color={Colors.text} />
          </Pressable>
          <Pressable
            onPress={() => {
              HapticTap.medium();
              setRunning(!running);
            }}
            style={{
              flex: 1,
              height: 56,
              borderRadius: 28,
              backgroundColor: program.color,
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "row",
              gap: 8,
              boxShadow: `0 0 30px ${program.color}88`,
            }}
          >
            <Ionicons name={running ? "pause" : "play"} size={22} color={Colors.bg} />
            <Txt size={14} weight="bold" color={Colors.bg} uppercase letterSpacing={2}>
              {running ? "Pause" : idx === 0 && remaining === current.duration ? "Begin" : "Resume"}
            </Txt>
          </Pressable>
          <Pressable
            onPress={() => {
              HapticTap.light();
              if (idx < program.poses.length - 1) {
                setIdx(idx + 1);
                setRemaining(program.poses[idx + 1].duration);
              } else {
                handleFinish();
              }
            }}
            style={{
              width: 56,
              height: 56,
              borderRadius: 28,
              backgroundColor: Colors.card,
              borderWidth: 1,
              borderColor: Colors.border,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons name="play-skip-forward" size={22} color={Colors.text} />
          </Pressable>
        </View>
      </View>
    </View>
  );
}
