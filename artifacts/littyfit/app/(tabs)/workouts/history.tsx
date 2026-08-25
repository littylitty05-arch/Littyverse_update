import React from "react";
import { View, ScrollView, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Colors } from "@/constants/Colors";
import { Txt, Card } from "@/components/ui";
import { useAppStore } from "@/store/useAppStore";

export default function History() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const workouts = useAppStore((s) => s.completedWorkouts);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: Colors.bg }}
      contentContainerStyle={{
        paddingTop: insets.top + 16,
        paddingHorizontal: 16,
        paddingBottom: insets.bottom + 40,
        gap: 12,
      }}
      showsVerticalScrollIndicator={false}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 8 }}>
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
          History
        </Txt>
      </View>

      {workouts.length === 0 ? (
        <Card padding={28}>
          <View style={{ alignItems: "center", gap: 12 }}>
            <Ionicons name="barbell" size={40} color={Colors.textMuted} />
            <Txt size={14} weight="bold">
              No workouts yet
            </Txt>
            <Txt size={12} color={Colors.textDim} style={{ textAlign: "center" }}>
              Complete your first session to start logging.
            </Txt>
          </View>
        </Card>
      ) : (
        workouts.map((w, i) => (
          <Animated.View key={w.id} entering={FadeInDown.delay(i * 30).duration(300)}>
            <Card padding={14}>
              <View style={{ flexDirection: "row", gap: 12, alignItems: "center" }}>
                <View
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    backgroundColor: `${Colors.violet}22`,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Ionicons name="barbell" size={20} color={Colors.violet} />
                </View>
                <View style={{ flex: 1, gap: 2 }}>
                  <Txt size={14} weight="bold">
                    {w.sessionName}
                  </Txt>
                  <Txt size={11} color={Colors.textDim}>
                    Week {w.weekNum} · {w.duration}m · {w.exercises} exercises
                  </Txt>
                </View>
                <View style={{ alignItems: "flex-end", gap: 4 }}>
                  <Txt size={11} weight="bold" color={Colors.violet}>
                    +{w.ltkEarned} LTK
                  </Txt>
                  <Txt size={9} color={Colors.textMuted} uppercase letterSpacing={1}>
                    {new Date(w.date).toLocaleDateString()}
                  </Txt>
                </View>
              </View>
            </Card>
          </Animated.View>
        ))
      )}
    </ScrollView>
  );
}
