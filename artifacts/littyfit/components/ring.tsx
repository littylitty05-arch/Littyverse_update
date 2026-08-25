import React from "react";
import { View } from "react-native";
import Svg, { Circle, Defs, LinearGradient, Stop } from "react-native-svg";
import { Colors } from "@/constants/Colors";
import { Txt } from "./ui";

interface RingProps {
  size: number;
  strokeWidth?: number;
  progress: number; // 0..1
  color?: string;
  track?: string;
  gradient?: [string, string];
  label?: string;
  value?: string;
  sublabel?: string;
  children?: React.ReactNode;
}

export function Ring({
  size,
  strokeWidth = 10,
  progress,
  color = Colors.violet,
  track = Colors.cardAlt,
  gradient,
  label,
  value,
  sublabel,
  children,
}: RingProps) {
  const r = (size - strokeWidth) / 2;
  const c = 2 * Math.PI * r;
  const p = Math.min(1, Math.max(0, progress));
  const dash = c * p;

  return (
    <View style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}>
      <Svg width={size} height={size}>
        {gradient && (
          <Defs>
            <LinearGradient id="g" x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0" stopColor={gradient[0]} />
              <Stop offset="1" stopColor={gradient[1]} />
            </LinearGradient>
          </Defs>
        )}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={track}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={gradient ? "url(#g)" : color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={`${dash} ${c - dash}`}
          strokeDashoffset={c / 4}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <View style={{ position: "absolute", alignItems: "center", justifyContent: "center" }}>
        {children ? (
          children
        ) : (
          <>
            {value && <Txt size={22} weight="bold">{value}</Txt>}
            {label && <Txt size={10} weight="medium" color={Colors.textDim} uppercase letterSpacing={1.5}>{label}</Txt>}
            {sublabel && <Txt size={10} color={Colors.textMuted}>{sublabel}</Txt>}
          </>
        )}
      </View>
    </View>
  );
}

export function MultiRing({
  size,
  strokeWidth = 10,
  values,
}: {
  size: number;
  strokeWidth?: number;
  values: { progress: number; color: string }[];
}) {
  return (
    <View style={{ width: size, height: size }}>
      {values.map((v, i) => {
        const ringSize = size - i * (strokeWidth * 2 + 6);
        return (
          <View
            key={i}
            style={{
              position: "absolute",
              top: i * (strokeWidth + 3),
              left: i * (strokeWidth + 3),
            }}
          >
            <Ring
              size={ringSize}
              strokeWidth={strokeWidth}
              progress={v.progress}
              color={v.color}
            />
          </View>
        );
      })}
    </View>
  );
}
