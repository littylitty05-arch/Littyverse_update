import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  View, FlatList, TextInput, Pressable, KeyboardAvoidingView,
  Platform, ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/Colors";
import { Txt, HapticTap } from "@/components/ui";
import { getMessages, WS_URL, type ChatMessage } from "@/services/chat";

type ChatTypingEvent = {
  type: "typing";
  displayName?: string;
};

async function getOrCreateDeviceId(): Promise<string> {
  const AsyncStorage = (await import("@react-native-async-storage/async-storage")).default;
  let id = await AsyncStorage.getItem("__device_id__");
  if (!id) {
    id = "device-" + Math.random().toString(36).slice(2, 18);
    await AsyncStorage.setItem("__device_id__", id);
  }
  return id;
}

async function getCachedUser() {
  const AsyncStorage = (await import("@react-native-async-storage/async-storage")).default;
  const raw = await AsyncStorage.getItem("__gym_user__");
  return raw ? JSON.parse(raw) : null;
}

async function saveCachedUser(user: object) {
  const AsyncStorage = (await import("@react-native-async-storage/async-storage")).default;
  await AsyncStorage.setItem("__gym_user__", JSON.stringify(user));
}

export default function ChatRoomScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { roomId, name } = useLocalSearchParams<{ roomId: string; name: string }>();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [typingName, setTypingName] = useState<string | null>(null);
  const [gymUser, setGymUser] = useState<{ id: number; displayName: string; gymId: string } | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const listRef = useRef<FlatList>(null);
  const typingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const roomIdNum = parseInt(roomId ?? "0");

  const connect = useCallback(async (user: { id: number; displayName: string; gymId: string }) => {
    try {
      const ws = new WebSocket(WS_URL);
      wsRef.current = ws;

      ws.onopen = () => {
        ws.send(JSON.stringify({
          type: "join",
          userId: user.id,
          roomId: roomIdNum,
          displayName: user.displayName,
          gymId: user.gymId,
        }));
      };

      ws.onmessage = (e) => {
        try {
          const msg = JSON.parse(e.data) as ChatMessage | ChatTypingEvent;
          if (msg.type === "typing") {
            setTypingName(msg.displayName ?? null);
            if (typingTimer.current) clearTimeout(typingTimer.current);
            typingTimer.current = setTimeout(() => setTypingName(null), 2000);
            return;
          }
          setMessages((prev) => [...prev, msg]);
          setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
        } catch {}
      };

      ws.onerror = (e) => console.error("WS error", e);
      ws.onclose = () => wsRef.current = null;
    } catch (err) {
      console.error("WS connect error:", err);
    }
  }, [roomIdNum]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const [history, user] = await Promise.all([
          getMessages(roomIdNum),
          getCachedUser(),
        ]);
        if (!mounted) return;
        setMessages(history);
        if (user) {
          setGymUser(user);
          await connect(user);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
      wsRef.current?.close();
    };
  }, [roomIdNum, connect]);

  const sendMessage = () => {
    const text = input.trim();
    if (!text || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
    wsRef.current.send(JSON.stringify({ type: "message", content: text }));
    setInput("");
  };

  const handleInputChange = (text: string) => {
    setInput(text);
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: "typing" }));
    }
  };

  const renderMessage = ({ item }: { item: ChatMessage }) => {
    const isSystem = item.type === "system";
    const isBot = item.type === "bot_log";
    const isMine = item.isMine;

    if (isSystem) {
      return (
        <View style={{ alignItems: "center", marginVertical: 6 }}>
          <Txt size={11} style={{ color: Colors.textMuted }}>{item.content}</Txt>
        </View>
      );
    }

    if (isBot) {
      return (
        <View style={{
          marginVertical: 6,
          marginHorizontal: 16,
          backgroundColor: Colors.card,
          borderRadius: 12,
          borderLeftWidth: 3,
          borderLeftColor: Colors.violet,
          padding: 12,
        }}>
          <Txt size={11} bold style={{ color: Colors.violet, marginBottom: 2 }}>LITTYBOT</Txt>
          <Txt size={13} style={{ color: Colors.text }}>{item.content}</Txt>
        </View>
      );
    }

    return (
      <View style={{
        marginVertical: 4,
        marginHorizontal: 16,
        alignItems: isMine ? "flex-end" : "flex-start",
      }}>
        {!isMine && (
          <Txt size={10} style={{ color: Colors.textMuted, marginBottom: 2, marginLeft: 4 }}>
            {item.senderName} · {item.senderGymId}
          </Txt>
        )}
        <View style={{
          backgroundColor: isMine ? Colors.violet : Colors.card,
          borderRadius: 16,
          borderBottomRightRadius: isMine ? 4 : 16,
          borderBottomLeftRadius: isMine ? 16 : 4,
          paddingHorizontal: 14,
          paddingVertical: 10,
          maxWidth: "75%",
          borderWidth: isMine ? 0 : 1,
          borderColor: Colors.border,
        }}>
          <Txt size={14} style={{ color: isMine ? "#000" : Colors.text }}>{item.content}</Txt>
        </View>
        <Txt size={10} style={{ color: Colors.textMuted, marginTop: 2, marginHorizontal: 4 }}>
          {new Date(item.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </Txt>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: Colors.bg }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={0}
    >
      {/* Header */}
      <View style={{
        flexDirection: "row",
        alignItems: "center",
        paddingTop: insets.top + 8,
        paddingBottom: 12,
        paddingHorizontal: 16,
        backgroundColor: Colors.bgElevated,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
        gap: 12,
      }}>
        <HapticTap onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color={Colors.text} />
        </HapticTap>
        <View style={{ flex: 1 }}>
          <Txt size={17} bold style={{ color: Colors.text }}>{name ?? "Chat"}</Txt>
          {typingName && (
            <Txt size={11} style={{ color: Colors.violet }}>{typingName} is typing…</Txt>
          )}
        </View>
      </View>

      {loading ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator color={Colors.violet} />
        </View>
      ) : (
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(m, i) => String(m.id ?? i)}
          renderItem={renderMessage}
          contentContainerStyle={{ paddingVertical: 12 }}
          onLayout={() => listRef.current?.scrollToEnd({ animated: false })}
        />
      )}

      {/* Input */}
      <View style={{
        flexDirection: "row",
        alignItems: "flex-end",
        gap: 10,
        padding: 12,
        paddingBottom: insets.bottom + 8,
        backgroundColor: Colors.bgElevated,
        borderTopWidth: 1,
        borderTopColor: Colors.border,
      }}>
        <TextInput
          value={input}
          onChangeText={handleInputChange}
          placeholder="Message or /bench 225"
          placeholderTextColor={Colors.textMuted}
          multiline
          style={{
            flex: 1,
            backgroundColor: Colors.card,
            borderRadius: 20,
            borderWidth: 1,
            borderColor: Colors.border,
            color: Colors.text,
            paddingHorizontal: 16,
            paddingTop: 10,
            paddingBottom: 10,
            fontSize: 14,
            maxHeight: 100,
          }}
          onSubmitEditing={sendMessage}
        />
        <HapticTap onPress={sendMessage} disabled={!input.trim()}>
          <View style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: input.trim() ? Colors.violet : Colors.card,
            alignItems: "center",
            justifyContent: "center",
            borderWidth: 1,
            borderColor: input.trim() ? Colors.violet : Colors.border,
          }}>
            <Ionicons name="arrow-up" size={18} color={input.trim() ? "#000" : Colors.textMuted} />
          </View>
        </HapticTap>
      </View>
    </KeyboardAvoidingView>
  );
}
