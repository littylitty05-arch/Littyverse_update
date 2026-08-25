import React, { useEffect } from "react";
import { View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
} from "react-native-reanimated";
import { streakColor } from "@/constants/Colors";
import { Txt } from "./ui";

export function Flame({
  streak,
  size = 24,
  showCount = true,
}: {
  streak: number;
  size?: number;
  showCount?: boolean;
}) {
  const color = streakColor(streak);
  const scale = useSharedValue(1);
  const rot = useSharedValue(0);

  useEffect(() => {
    if (streak > 0) {
      scale.value = withRepeat(
        withSequence(
          withTiming(1.12, { duration: 650, easing: Easing.inOut(Easing.quad) }),
          withTiming(1, { duration: 650, easing: Easing.inOut(Easing.quad) })
        ),
        -1,
        false
      );
      rot.value = withRepeat(
        withSequence(
          withTiming(-3, { duration: 400 }),
          withTiming(3, { duration: 400 })
        ),
        -1,
        true
      );
    }
  }, [streak, scale, rot]);

  const aStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { rotate: `${rot.value}deg` }],
  }));

  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
      <Animated.View style={aStyle}>
        <Ionicons name="flame" size={size} color={color} />
      </Animated.View>
      {showCount && (
        <Txt size={14} weight="bold" color={color}>
          {streak} Day Streak
        </Txt>
      )}
    </View>
  );
}
