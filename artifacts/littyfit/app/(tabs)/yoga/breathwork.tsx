import React, { useEffect, useState, useMemo } from "react";
import { View, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { Colors } from "@/constants/Colors";
import { Txt, HapticTap } from "@/components/ui";
import { useAppStore } from "@/store/useAppStore";

type Pattern = "box" | "478";

const patterns: Record<Pattern, { label: string; phases: { name: string; sec: number }[] }> = {
  box: {
    label: "Box Breathing (4-4-4-4)",
    phases: [
      { name: "Inhale", sec: 4 },
      { name: "Hold", sec: 4 },
      { name: "Exhale", sec: 4 },
      { name: "Hold", sec: 4 },
    ],
  },
  "478": {
    label: "4-7-8 Breath",
    phases: [
      { name: "Inhale", sec: 4 },
      { name: "Hold", sec: 7 },
      { name: "Exhale", sec: 8 },
    ],
  },
};

export default function Breathwork() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [pattern, setPattern] = useState<Pattern>("box");
  const [running, setRunning] = useState(false);
  const [phaseIdx, setPhaseIdx] = useState(0);
  const [remaining, setRemaining] = useState(patterns.box.phases[0].sec);
  const [cycles, setCycles] = useState(0);
  const scale = useSharedValue(1);
  const addLtk = useAppStore((s) => s.addLtk);

  const phase = patterns[pattern].phases[phaseIdx];

  useEffect(() => {
    if (!running) return;
    if (phase.name === "Inhale") {
      scale.value = withTiming(1.5, { duration: phase.sec * 1000, easing: Easing.inOut(Easing.sin) });
    } else if (phase.name === "Exhale") {
      scale.value = withTiming(1, { duration: phase.sec * 1000, easing: Easing.inOut(Easing.sin) });
    }
    const t = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          HapticTap.light();
          const next = phaseIdx + 1;
          if (next >= patterns[pattern].phases.length) {
            setPhaseIdx(0);
            setCycles((c) => c + 1);
            return patterns[pattern].phases[0].sec;
          } else {
            setPhaseIdx(next);
            return patterns[pattern].phases[next].sec;
          }
        }
        return r - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [running, phaseIdx, pattern, phase, scale]);

  useEffect(() => {
    if (cycles === 5 && running) {
      HapticTap.success();
      addLtk(5, "checkin", "Breathwork session complete");
      setCycles(6);
    }
  }, [cycles, running, addLtk]);

  const aStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const gradientColor = useMemo(() => {
    if (phase.name === "Inhale") return Colors.blue;
    if (phase.name === "Exhale") return Colors.violet;
    return Colors.green;
  }, [phase]);

  const reset = () => {
    HapticTap.light();
    setRunning(false);
    setPhaseIdx(0);
    setRemaining(patterns[pattern].phases[0].sec);
    setCycles(0);
    scale.value = withTiming(1, { duration: 300 });
  };

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
          <Txt size={11} weight="bold" color={Colors.violet} uppercase letterSpacing={2}>
            Breathwork
          </Txt>
          <Txt size={18} weight="bold">
            {patterns[pattern].label}
          </Txt>
        </View>
      </View>

      {/* Pattern switcher */}
      <View style={{ flexDirection: "row", gap: 8, marginTop: 20 }}>
        {(Object.keys(patterns) as Pattern[]).map((p) => (
          <Pressable
            key={p}
            onPress={() => {
              HapticTap.light();
              setPattern(p);
              reset();
            }}
            style={{
              flex: 1,
              paddingVertical: 12,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: pattern === p ? Colors.violet : Colors.border,
              backgroundColor: pattern === p ? `${Colors.violet}22` : Colors.card,
              alignItems: "center",
            }}
          >
            <Txt size={11} weight="bold" color={pattern === p ? Colors.violet : Colors.textDim} uppercase letterSpacing={1.5}>
              {p === "box" ? "Box 4-4-4-4" : "4-7-8"}
            </Txt>
          </Pressable>
        ))}
      </View>

      {/* Breath animation */}
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", gap: 32 }}>
        <View
          style={{
            width: 280,
            height: 280,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Animated.View
            style={[
              {
                width: 160,
                height: 160,
                borderRadius: 80,
                backgroundColor: `${gradientColor}22`,
                borderWidth: 2,
                borderColor: gradientColor,
                alignItems: "center",
                justifyContent: "center",
                boxShadow: `0 0 60px ${gradientColor}88`,
              },
              aStyle,
            ]}
          >
            <Txt size={14} weight="bold" color={gradientColor} uppercase letterSpacing={3}>
              {phase.name}
            </Txt>
            <Txt size={48} weight="bold" style={{ fontVariant: ["tabular-nums"] }}>
              {remaining}
            </Txt>
          </Animated.View>
        </View>

        <View style={{ alignItems: "center", gap: 6 }}>
          <Txt size={11} weight="bold" color={Colors.textDim} uppercase letterSpacing={2}>
            Cycles Complete
          </Txt>
          <Txt size={32} weight="bold" style={{ fontVariant: ["tabular-nums"] }}>
            {cycles}
          </Txt>
          {cycles >= 5 && (
            <Txt size={11} weight="bold" color={Colors.green} uppercase letterSpacing={1}>
              Reset Complete · +5 LTK
            </Txt>
          )}
        </View>
      </View>

      <View style={{ flexDirection: "row", gap: 12 }}>
        <Pressable
          onPress={() => {
            HapticTap.medium();
            setRunning(!running);
          }}
          style={{
            flex: 1,
            height: 56,
            borderRadius: 28,
            backgroundColor: Colors.violet,
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "row",
            gap: 8,
            boxShadow: `0 0 30px ${Colors.violetGlow}`,
          }}
        >
          <Ionicons name={running ? "pause" : "play"} size={22} color={Colors.bg} />
          <Txt size={14} weight="bold" color={Colors.bg} uppercase letterSpacing={2}>
            {running ? "Pause" : "Begin"}
          </Txt>
        </Pressable>
        <Pressable
          onPress={reset}
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
          <Ionicons name="refresh" size={22} color={Colors.text} />
        </Pressable>
      </View>
    </View>
  );
}
