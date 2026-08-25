import React from "react";
import { View, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/Colors";
import { Txt } from "./ui";

export function LtkBalanceCard({
  balance,
  onPress,
  compact,
}: {
  balance: number;
  onPress?: () => void;
  compact?: boolean;
}) {
  const Body = (
    <View
      style={{
        backgroundColor: Colors.cardAlt,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: Colors.violet,
        padding: compact ? 16 : 20,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        boxShadow: `0 0 30px ${Colors.violetGlow}, inset 0 0 0 1px rgba(167,139,250,0.3)`,
      }}
    >
      <View style={{ gap: 4, flex: 1 }}>
        <Txt size={10} weight="bold" color={Colors.violet} uppercase letterSpacing={2}>
          LTK Wallet
        </Txt>
        <View style={{ flexDirection: "row", alignItems: "baseline", gap: 6 }}>
          <Txt size={compact ? 28 : 34} weight="bold" style={{ fontVariant: ["tabular-nums"] }}>
            {balance.toLocaleString()}
          </Txt>
          <Txt size={13} weight="semiBold" color={Colors.violet} uppercase letterSpacing={2}>
            LTK
          </Txt>
        </View>
        {!compact && (
          <Txt size={11} color={Colors.textDim}>
            Balance
          </Txt>
        )}
      </View>
      <View
        style={{
          width: 52,
          height: 52,
          borderRadius: 26,
          backgroundColor: `${Colors.violet}22`,
          borderWidth: 1,
          borderColor: Colors.violet,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Ionicons name="wallet" size={24} color={Colors.violet} />
      </View>
    </View>
  );

  if (onPress) {
    return <Pressable onPress={onPress}>{Body}</Pressable>;
  }
  return Body;
}
