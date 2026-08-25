import React from "react";
import {
  Pressable,
  PressableProps,
  Text,
  TextProps,
  View,
  ViewProps,
  StyleProp,
  ViewStyle,
  TextStyle,
  Platform,
} from "react-native";
import * as Haptics from "expo-haptics";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { Colors } from "@/constants/Colors";
import { Fonts } from "@/constants/Typography";

const haptic = (style: Haptics.ImpactFeedbackStyle = Haptics.ImpactFeedbackStyle.Light) => {
  if (Platform.OS === "ios" || Platform.OS === "android") {
    Haptics.impactAsync(style).catch(() => {});
  }
};

export const HapticTap = Object.assign(
  ({ onPress, children, ...rest }: PressableProps) => (
    <Pressable
      {...rest}
      onPress={(event) => {
        haptic();
        onPress?.(event);
      }}
    >
      {children}
    </Pressable>
  ),
  {
    light: () => haptic(Haptics.ImpactFeedbackStyle.Light),
    medium: () => haptic(Haptics.ImpactFeedbackStyle.Medium),
    heavy: () => haptic(Haptics.ImpactFeedbackStyle.Heavy),
    success: () => {
      if (Platform.OS === "ios" || Platform.OS === "android") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(
          () => {}
        );
      }
    },
  },
);

interface TxtProps extends TextProps {
  size?: number;
  weight?: keyof typeof Fonts;
  bold?: boolean;
  color?: string;
  uppercase?: boolean;
  letterSpacing?: number;
  style?: StyleProp<TextStyle>;
}
export function Txt({
  size = 14,
  weight = "regular",
  bold,
  color = Colors.text,
  uppercase,
  letterSpacing,
  style,
  children,
  ...rest
}: TxtProps) {
  return (
    <Text
      {...rest}
      style={[
        {
          fontFamily: Fonts[bold ? "bold" : weight],
          fontSize: size,
          color,
          letterSpacing,
          textTransform: uppercase ? "uppercase" : undefined,
        },
        style,
      ]}
    >
      {children}
    </Text>
  );
}

interface CardProps extends ViewProps {
  glow?: boolean;
  active?: boolean;
  padding?: number;
  style?: StyleProp<ViewStyle>;
}
export function Card({
  glow,
  active,
  padding = 16,
  style,
  children,
  ...rest
}: CardProps) {
  return (
    <View
      {...rest}
      style={[
        {
          backgroundColor: Colors.card,
          borderRadius: 20,
          borderWidth: 1,
          borderColor: active ? Colors.violet : Colors.border,
          padding,
          borderCurve: "continuous",
          boxShadow: glow
            ? `0 0 20px ${Colors.violetGlow}, inset 0 0 0 1px rgba(167,139,250,0.2)`
            : undefined,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

interface PressCardProps extends PressableProps {
  glow?: boolean;
  active?: boolean;
  padding?: number;
  style?: StyleProp<ViewStyle>;
}
export function PressCard({
  glow,
  active,
  padding = 16,
  style,
  children,
  onPress,
  ...rest
}: PressCardProps) {
  const scale = useSharedValue(1);
  const aStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  return (
    <Animated.View style={aStyle}>
      <Pressable
        {...rest}
        onPressIn={() => {
          scale.value = withSpring(0.97, { damping: 18, stiffness: 300 });
          HapticTap.light();
        }}
        onPressOut={() => {
          scale.value = withSpring(1, { damping: 18, stiffness: 300 });
        }}
        onPress={onPress}
        style={[
          {
            backgroundColor: Colors.card,
            borderRadius: 20,
            borderWidth: 1,
            borderColor: active ? Colors.violet : Colors.border,
            padding,
            borderCurve: "continuous",
            boxShadow: glow
              ? `0 0 24px ${Colors.violetGlow}, inset 0 0 0 1px rgba(167,139,250,0.25)`
              : undefined,
          },
          style as ViewStyle,
        ]}
      >
        {children as React.ReactNode}
      </Pressable>
    </Animated.View>
  );
}

interface BtnProps extends PressableProps {
  title: string;
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "md" | "lg" | "sm";
  icon?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  loading?: boolean;
}
export function Btn({
  title,
  variant = "primary",
  size = "md",
  icon,
  style,
  onPress,
  loading,
  disabled,
  ...rest
}: BtnProps) {
  const scale = useSharedValue(1);
  const aStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const heights = { sm: 40, md: 48, lg: 56 } as const;
  const fontSize = { sm: 13, md: 15, lg: 16 } as const;

  const bg = {
    primary: Colors.violet,
    secondary: Colors.cardAlt,
    ghost: "transparent",
    danger: Colors.red,
  }[variant];
  const border = {
    primary: Colors.violet,
    secondary: Colors.border,
    ghost: Colors.border,
    danger: Colors.red,
  }[variant];
  const color =
    variant === "primary" || variant === "danger"
      ? Colors.bg
      : Colors.text;

  return (
    <Animated.View style={aStyle}>
      <Pressable
        {...rest}
        disabled={disabled || loading}
        onPressIn={() => {
          scale.value = withSpring(0.97, { damping: 18, stiffness: 300 });
          HapticTap.light();
        }}
        onPressOut={() => {
          scale.value = withSpring(1, { damping: 18, stiffness: 300 });
        }}
        onPress={onPress}
        style={[
          {
            height: heights[size],
            backgroundColor: bg,
            borderWidth: 1,
            borderColor: border,
            borderRadius: 999,
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "row",
            gap: 8,
            paddingHorizontal: 24,
            opacity: disabled ? 0.5 : 1,
            boxShadow:
              variant === "primary"
                ? `0 0 24px ${Colors.violetGlow}`
                : undefined,
          },
          style as ViewStyle,
        ]}
      >
        {icon}
        <Text
          style={{
            fontFamily: Fonts.bold,
            color,
            fontSize: fontSize[size],
            letterSpacing: 0.5,
          }}
        >
          {loading ? "..." : title.toUpperCase()}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

export function Divider({ style }: { style?: StyleProp<ViewStyle> }) {
  return (
    <View
      style={[
        { height: 1, backgroundColor: Colors.border, width: "100%" },
        style,
      ]}
    />
  );
}

export function Chip({
  label,
  active,
  color = Colors.violet,
  onPress,
}: {
  label: string;
  active?: boolean;
  color?: string;
  onPress?: () => void;
}) {
  return (
    <Pressable
      onPress={() => {
        HapticTap.light();
        onPress?.();
      }}
      style={{
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: active ? color : Colors.border,
        backgroundColor: active ? `${color}22` : "transparent",
      }}
    >
      <Txt size={12} weight="semiBold" color={active ? color : Colors.textDim} uppercase letterSpacing={1}>
        {label}
      </Txt>
    </Pressable>
  );
}

export function SectionHeader({
  title,
  right,
}: {
  title: string;
  right?: React.ReactNode;
}) {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: 4,
      }}
    >
      <Txt size={11} weight="bold" color={Colors.textDim} uppercase letterSpacing={2}>
        {title}
      </Txt>
      {right}
    </View>
  );
}

export function Dot({ color, size = 6 }: { color: string; size?: number }) {
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size,
        backgroundColor: color,
      }}
    />
  );
}
