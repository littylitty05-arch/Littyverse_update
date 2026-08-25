import React, { useState } from "react";
import { View, TextInput, TextInputProps } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/Colors";
import { Fonts } from "@/constants/Typography";
import { Txt } from "./ui";

interface Props extends TextInputProps {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}

export function AuthField({ label, icon, ...rest }: Props) {
  const [focused, setFocused] = useState(false);
  const active = focused || !!rest.value;
  return (
    <View style={{ gap: 8 }}>
      <Txt size={11} weight="bold" color={active ? Colors.violet : Colors.textDim} uppercase letterSpacing={2}>
        {label}
      </Txt>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 12,
          borderWidth: 1,
          borderColor: focused ? Colors.violet : Colors.border,
          borderRadius: 14,
          paddingHorizontal: 14,
          backgroundColor: Colors.card,
          height: 52,
          boxShadow: focused ? `0 0 16px ${Colors.violetGlow}` : undefined,
        }}
      >
        <Ionicons name={icon} size={18} color={focused ? Colors.violet : Colors.textDim} />
        <TextInput
          {...rest}
          onFocus={(e) => {
            setFocused(true);
            rest.onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            rest.onBlur?.(e);
          }}
          placeholderTextColor={Colors.textMuted}
          style={[
            {
              flex: 1,
              fontFamily: Fonts.medium,
              fontSize: 15,
              color: Colors.text,
              height: "100%",
            },
            rest.style,
          ]}
        />
      </View>
    </View>
  );
}
