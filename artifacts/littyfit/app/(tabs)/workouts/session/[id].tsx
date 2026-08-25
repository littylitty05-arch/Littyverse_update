import React, { useEffect, useRef, useState } from "react";
import { View, ScrollView, Pressable, TextInput } from "react-native";
import { Fonts } from "@/constants/Typography";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import { Colors } from "@/constants/Colors";
import { Txt, Card, Btn, HapticTap, Chip } from "@/components/ui";
import { findSession, quickWorkout } from "@/data/programs";
import { useAppStore } from "@/store/useAppStore";

export default function WorkoutSession() {
  const { id, program = "performance", week = "1" } = useLocalSearchParams<{
    id: string;
    program?: string;
    week?: string;
  }>();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const complete = useAppStore((s) => s.completeWorkout);
  const setPr = useAppStore((s) => s.setPr);
  const unlock = useAppStore((s) => s.unlockAchievement);
  const completed = useAppStore((s) => s.completedWorkouts);
  const setActiveSession = useAppStore((s) => s.setActiveSession);

  const data =
    id === quickWorkout.id
      ? { session: quickWorkout, program: { name: "QUICK HIT", color: Colors.orange, id: "quick" } }
      : findSession(String(program), String(id));

  const session = data?.session;

  const [setStates, setSetStates] = useState<boolean[][]>(() =>
    (session?.exercises ?? []).map((e) => Array(e.sets).fill(false))
  );
  const [restSec, setRestSec] = useState(0);
  const [difficulty, setDifficulty] = useState<number | null>(null);
  const [finished, setFinished] = useState(false);
  const [isPr, setIsPr] = useState(false);
  const [prWeight, setPrWeight] = useState("");
  const [prReps, setPrReps] = useState("");
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const t = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (!session) return;
    setActiveSession({
      type: "workout",
      id: String(id),
      programId: String(program),
      label: session.name,
      startedAt: Date.now(),
    });
    return () => {
      // Clear only if not finished (finish() clears via completeWorkout)
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (restSec <= 0) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }
    if (!timerRef.current) {
      timerRef.current = setInterval(() => {
        setRestSec((s) => {
          if (s <= 1) {
            HapticTap.success();
            return 0;
          }
          return s - 1;
        });
      }, 1000);
    }
  }, [restSec]);

  if (!session) {
    return (
      <View style={{ flex: 1, backgroundColor: Colors.bg, alignItems: "center", justifyContent: "center" }}>
        <Txt color={Colors.textDim}>Session not found</Txt>
      </View>
    );
  }

  const toggleSet = (exIdx: number, setIdx: number) => {
    HapticTap.light();
    setSetStates((prev) => {
      const next = prev.map((r) => [...r]);
      next[exIdx][setIdx] = !next[exIdx][setIdx];
      return next;
    });
    const ex = session.exercises[exIdx];
    if (!setStates[exIdx][setIdx]) setRestSec(ex.rest);
  };

  const totalSets = setStates.reduce((a, r) => a + r.length, 0);
  const doneSets = setStates.reduce((a, r) => a + r.filter(Boolean).length, 0);
  const progress = totalSets ? doneSets / totalSets : 0;

  const finish = () => {
    HapticTap.success();
    complete({
      programId: String(program),
      weekNum: parseInt(String(week), 10) || 1,
      sessionName: session.name,
      duration: Math.round(elapsed / 60),
      exercises: session.exercises.length,
    });
    if (completed.length === 0) {
      unlock({ id: "first-workout", name: "First Rep", icon: "barbell" });
    }
    if (isPr && prWeight && prReps) {
      const exName = session.exercises[0].name;
      setPr(exName, {
        weight: parseFloat(prWeight),
        reps: parseInt(prReps, 10),
        date: new Date().toISOString(),
      });
    }
    setFinished(true);
  };

  const programColor =
    data && "color" in (data.program as { color?: string })
      ? (data.program as { color: string }).color
      : Colors.violet;

  const formatSec = (s: number) => {
    const m = Math.floor(s / 60);
    const r = s % 60;
    return `${m}:${r.toString().padStart(2, "0")}`;
  };

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
            backgroundColor: `${Colors.violet}22`,
            borderWidth: 2,
            borderColor: Colors.violet,
            alignItems: "center",
            justifyContent: "center",
            boxShadow: `0 0 60px ${Colors.violet}88`,
          }}
        >
          <Ionicons name="checkmark" size={72} color={Colors.violet} />
        </Animated.View>
        <View style={{ alignItems: "center", gap: 10 }}>
          <Txt size={11} weight="bold" color={Colors.violet} uppercase letterSpacing={3}>
            Session Complete
          </Txt>
          <Txt size={32} weight="bold" style={{ textAlign: "center" }}>
            +25 LTK banked
          </Txt>
          <Txt size={13} color={Colors.textDim} style={{ textAlign: "center" }}>
            {formatSec(elapsed)} · {doneSets}/{totalSets} sets
          </Txt>
        </View>
        <View style={{ alignItems: "center", gap: 12, width: "100%" }}>
          <Txt size={11} weight="bold" color={Colors.textDim} uppercase letterSpacing={2}>
            Difficulty
          </Txt>
          <View style={{ flexDirection: "row", gap: 8 }}>
            {[1, 2, 3, 4, 5].map((n) => (
              <Pressable
                key={n}
                onPress={() => {
                  HapticTap.light();
                  setDifficulty(n);
                }}
              >
                <Ionicons
                  name={difficulty && n <= difficulty ? "star" : "star-outline"}
                  size={32}
                  color={difficulty && n <= difficulty ? Colors.amber : Colors.textMuted}
                />
              </Pressable>
            ))}
          </View>
        </View>
        <View style={{ width: "100%" }}>
          <Btn title="Done" onPress={() => router.back()} size="lg" />
        </View>
      </View>
    );
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: Colors.bg }}
      contentContainerStyle={{
        paddingTop: insets.top + 12,
        paddingHorizontal: 16,
        paddingBottom: insets.bottom + 32,
        gap: 14,
      }}
      showsVerticalScrollIndicator={false}
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
          <Txt size={11} weight="bold" color={programColor} uppercase letterSpacing={2}>
            Week {week} · {session.duration} min
          </Txt>
          <Txt size={20} weight="bold">
            {session.name}
          </Txt>
        </View>
        <View style={{ alignItems: "flex-end" }}>
          <Txt size={10} weight="bold" color={Colors.textDim} uppercase letterSpacing={1.5}>
            Elapsed
          </Txt>
          <Txt size={18} weight="bold" style={{ fontVariant: ["tabular-nums"] }}>
            {formatSec(elapsed)}
          </Txt>
        </View>
      </View>

      {/* Rest Timer */}
      {restSec > 0 && (
        <Animated.View entering={FadeIn.duration(200)}>
          <Card
            padding={16}
            style={{
              backgroundColor: `${Colors.violet}22`,
              borderColor: Colors.violet,
              flexDirection: "row",
              alignItems: "center",
              gap: 14,
            }}
          >
            <View
              style={{
                width: 48,
                height: 48,
                borderRadius: 24,
                backgroundColor: Colors.violet,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Ionicons name="timer" size={22} color={Colors.bg} />
            </View>
            <View style={{ flex: 1 }}>
              <Txt size={10} weight="bold" color={Colors.violet} uppercase letterSpacing={2}>
                Rest
              </Txt>
              <Txt size={24} weight="bold" style={{ fontVariant: ["tabular-nums"] }}>
                {formatSec(restSec)}
              </Txt>
            </View>
            <Pressable
              onPress={() => {
                HapticTap.light();
                setRestSec(0);
              }}
              style={{
                paddingHorizontal: 14,
                paddingVertical: 10,
                borderRadius: 999,
                borderWidth: 1,
                borderColor: Colors.violet,
              }}
            >
              <Txt size={11} weight="bold" color={Colors.violet} uppercase letterSpacing={1}>
                Skip
              </Txt>
            </Pressable>
          </Card>
        </Animated.View>
      )}

      {/* Progress bar */}
      <View
        style={{
          height: 8,
          backgroundColor: Colors.cardAlt,
          borderRadius: 4,
          overflow: "hidden",
        }}
      >
        <View
          style={{
            height: "100%",
            width: `${progress * 100}%`,
            backgroundColor: programColor,
            boxShadow: `0 0 12px ${programColor}`,
          }}
        />
      </View>

      {session.exercises.map((ex, exIdx) => {
        const setsDone = setStates[exIdx].filter(Boolean).length;
        const allDone = setsDone === ex.sets;
        return (
          <Animated.View key={ex.name} entering={FadeInDown.delay(exIdx * 60).duration(300)}>
            <Card
              padding={16}
              active={allDone}
              glow={allDone}
              style={{ gap: 12 }}
            >
              <View style={{ flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between" }}>
                <View style={{ flex: 1 }}>
                  <Txt size={10} weight="bold" color={programColor} uppercase letterSpacing={1.5}>
                    {String.fromCharCode(65 + exIdx)} · {ex.sets} × {ex.reps}
                  </Txt>
                  <Txt size={16} weight="bold" style={{ marginTop: 2 }}>
                    {ex.name}
                  </Txt>
                  <View style={{ flexDirection: "row", gap: 6, marginTop: 6, flexWrap: "wrap" }}>
                    {ex.muscles.map((m) => (
                      <View
                        key={m}
                        style={{
                          paddingHorizontal: 8,
                          paddingVertical: 4,
                          borderRadius: 6,
                          backgroundColor: Colors.cardAlt,
                        }}
                      >
                        <Txt size={9} weight="semiBold" color={Colors.textDim} uppercase letterSpacing={0.5}>
                          {m}
                        </Txt>
                      </View>
                    ))}
                  </View>
                </View>
                <View style={{ alignItems: "flex-end" }}>
                  <Txt size={9} weight="bold" color={Colors.textDim} uppercase letterSpacing={1.5}>
                    Rest
                  </Txt>
                  <Txt size={15} weight="bold" color={programColor}>
                    {ex.rest}s
                  </Txt>
                </View>
              </View>

              <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
                {Array.from({ length: ex.sets }).map((_, si) => (
                  <Pressable
                    key={si}
                    onPress={() => toggleSet(exIdx, si)}
                    style={{
                      flex: 1,
                      minWidth: 40,
                      height: 42,
                      borderRadius: 10,
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: setStates[exIdx][si] ? programColor : Colors.cardAlt,
                      borderWidth: 1,
                      borderColor: setStates[exIdx][si] ? programColor : Colors.border,
                    }}
                  >
                    {setStates[exIdx][si] ? (
                      <Ionicons name="checkmark" size={18} color={Colors.bg} />
                    ) : (
                      <Txt size={12} weight="bold" color={Colors.textDim}>
                        SET {si + 1}
                      </Txt>
                    )}
                  </Pressable>
                ))}
              </View>
            </Card>
          </Animated.View>
        );
      })}

      {/* PR Badge */}
      <Card padding={14}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <Ionicons name="trophy" size={20} color={Colors.amber} />
            <View>
              <Txt size={13} weight="bold">
                Hit a PR?
              </Txt>
              <Txt size={11} color={Colors.textDim}>
                Log it for {session.exercises[0].name}
              </Txt>
            </View>
          </View>
          <Chip
            label={isPr ? "Yes" : "No"}
            active={isPr}
            color={Colors.amber}
            onPress={() => setIsPr(!isPr)}
          />
        </View>
        {isPr && (
          <Animated.View entering={FadeIn.duration(200)} style={{ flexDirection: "row", gap: 10, marginTop: 12 }}>
            <View style={{ flex: 1 }}>
              <PrInput label="Weight" value={prWeight} onChangeText={setPrWeight} />
            </View>
            <View style={{ flex: 1 }}>
              <PrInput label="Reps" value={prReps} onChangeText={setPrReps} />
            </View>
          </Animated.View>
        )}
      </Card>

      <Btn
        title={`Finish Workout (+25 LTK)`}
        onPress={finish}
        size="lg"
      />
    </ScrollView>
  );
}

function PrInput({
  label,
  value,
  onChangeText,
}: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
}) {
  return (
    <View style={{ gap: 4 }}>
      <Txt size={9} weight="bold" color={Colors.textDim} uppercase letterSpacing={1.5}>
        {label}
      </Txt>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        keyboardType="decimal-pad"
        placeholder="—"
        placeholderTextColor={Colors.textMuted}
        style={{
          fontFamily: Fonts.bold,
          fontSize: 16,
          color: Colors.text,
          borderWidth: 1,
          borderColor: Colors.border,
          borderRadius: 8,
          paddingHorizontal: 10,
          height: 38,
        }}
      />
    </View>
  );
}
