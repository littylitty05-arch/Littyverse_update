import React, { useEffect, useState, useCallback } from "react";
import {
  View, ScrollView, Pressable, TextInput, ActivityIndicator, Alert
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Colors } from "@/constants/Colors";
import { Txt, Card, HapticTap } from "@/components/ui";
import { useAppStore } from "@/store/useAppStore";
import {
  registerUser, getMe, getRooms, lookupUser, createRoom,
  type GymUser, type ChatRoom,
} from "@/services/chat";
async function getOrCreateDeviceId(): Promise<string> {
  const AsyncStorage = (await import("@react-native-async-storage/async-storage")).default;
  let id = await AsyncStorage.getItem("__device_id__");
  if (!id) {
    id = "device-" + Math.random().toString(36).slice(2, 18);
    await AsyncStorage.setItem("__device_id__", id);
  }
  return id;
}

export default function SquadScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const profile = useAppStore((s) => s.profile);

  const [gymUser, setGymUser] = useState<GymUser | null>(null);
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchId, setSearchId] = useState("");
  const [searching, setSearching] = useState(false);
  const [showNewSquad, setShowNewSquad] = useState(false);
  const [squadName, setSquadName] = useState("");

  const init = useCallback(async () => {
    try {
      setLoading(true);
      const deviceId = await getOrCreateDeviceId();
      const displayName = profile?.name ?? "Athlete";
      let user = await getMe(deviceId);
      if (!user) {
        user = await registerUser(deviceId, displayName);
      }
      setGymUser(user);
      const AsyncStorage = (await import("@react-native-async-storage/async-storage")).default;
      await AsyncStorage.setItem("__gym_user__", JSON.stringify(user));
      const roomList = await getRooms(user.id);
      setRooms(roomList);
    } catch (e) {
      console.error("Squad init error:", e);
    } finally {
      setLoading(false);
    }
  }, [profile?.name]);

  useEffect(() => { init(); }, [init]);

  const handleSearch = async () => {
    if (!gymUser || !searchId.trim()) return;
    setSearching(true);
    try {
      const found = await lookupUser(searchId.trim().toUpperCase());
      if (!found) { Alert.alert("Not found", `No user with ID ${searchId.trim()}`); return; }
      if (found.id === gymUser.id) { Alert.alert("That's you!", "You can't DM yourself."); return; }

      const existing = rooms.find(
        (r) => r.type === "dm" && r.members.some((m) => m.id === found.id)
      );
      if (existing) {
        router.push({ pathname: "/chat/[roomId]", params: { roomId: existing.id, name: found.displayName } });
        setSearchId("");
        return;
      }

      const room = await createRoom({ type: "dm", memberIds: [found.id], createdBy: gymUser.id });
      await init();
      router.push({ pathname: "/chat/[roomId]", params: { roomId: room.id, name: found.displayName } });
      setSearchId("");
    } finally {
      setSearching(false);
    }
  };

  const handleCreateSquad = async () => {
    if (!gymUser || !squadName.trim()) return;
    try {
      const room = await createRoom({ type: "squad", name: squadName.trim(), memberIds: [], createdBy: gymUser.id });
      setShowNewSquad(false);
      setSquadName("");
      await init();
      router.push({ pathname: "/chat/[roomId]", params: { roomId: room.id, name: squadName.trim() } });
    } catch {
      Alert.alert("Error", "Could not create squad.");
    }
  };

  const openRoom = (room: ChatRoom) => {
    const other = room.members.find((m) => m.id !== gymUser?.id);
    const name = room.type === "dm" ? (other?.displayName ?? "Chat") : (room.name ?? "Squad");
    router.push({ pathname: "/chat/[roomId]", params: { roomId: room.id, name } });
  };

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: Colors.bg, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator color={Colors.violet} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: Colors.bg }}>
      <ScrollView
        contentContainerStyle={{ padding: 20, paddingTop: insets.top + 16, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Animated.View entering={FadeInDown.duration(400)}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
            <Txt size={26} bold style={{ color: Colors.text }}>Squad</Txt>
            <View style={{
              backgroundColor: Colors.card,
              borderRadius: 10,
              borderWidth: 1,
              borderColor: Colors.border,
              paddingHorizontal: 10,
              paddingVertical: 5,
            }}>
              <Txt size={11} style={{ color: Colors.violet, letterSpacing: 1, fontWeight: "700" }}>
                {gymUser?.gymId ?? "—"}
              </Txt>
            </View>
          </View>
          <Txt size={13} style={{ color: Colors.textMuted, marginBottom: 20 }}>
            Your Litty Gym ID · share it to connect
          </Txt>
        </Animated.View>

        {/* Find by Gym ID */}
        <Animated.View entering={FadeInDown.duration(400).delay(80)} style={{ marginBottom: 20 }}>
          <Card style={{ padding: 14, gap: 10 }}>
            <Txt size={11} bold style={{ color: Colors.textMuted, letterSpacing: 1.5 }}>FIND A MEMBER</Txt>
            <View style={{ flexDirection: "row", gap: 8 }}>
              <TextInput
                value={searchId}
                onChangeText={setSearchId}
                placeholder="FIT-555-0102"
                placeholderTextColor={Colors.textMuted}
                autoCapitalize="characters"
                style={{
                  flex: 1,
                  backgroundColor: Colors.bgElevated,
                  borderRadius: 10,
                  borderWidth: 1,
                  borderColor: Colors.border,
                  color: Colors.text,
                  paddingHorizontal: 14,
                  paddingVertical: 10,
                  fontSize: 14,
                  fontWeight: "600",
                  letterSpacing: 1,
                }}
              />
              <HapticTap onPress={handleSearch} disabled={searching || !searchId.trim()}>
                <View style={{
                  backgroundColor: Colors.violet,
                  borderRadius: 10,
                  paddingHorizontal: 16,
                  alignItems: "center",
                  justifyContent: "center",
                  opacity: !searchId.trim() ? 0.4 : 1,
                }}>
                  {searching
                    ? <ActivityIndicator color="#000" size="small" />
                    : <Ionicons name="arrow-forward" size={18} color="#000" />
                  }
                </View>
              </HapticTap>
            </View>
          </Card>
        </Animated.View>

        {/* Create Squad */}
        <Animated.View entering={FadeInDown.duration(400).delay(120)} style={{ marginBottom: 24 }}>
          {showNewSquad ? (
            <Card style={{ padding: 14, gap: 10 }}>
              <Txt size={11} bold style={{ color: Colors.textMuted, letterSpacing: 1.5 }}>SQUAD NAME</Txt>
              <TextInput
                value={squadName}
                onChangeText={setSquadName}
                placeholder="Morning Grind"
                placeholderTextColor={Colors.textMuted}
                style={{
                  backgroundColor: Colors.bgElevated,
                  borderRadius: 10,
                  borderWidth: 1,
                  borderColor: Colors.border,
                  color: Colors.text,
                  paddingHorizontal: 14,
                  paddingVertical: 10,
                  fontSize: 15,
                }}
              />
              <View style={{ flexDirection: "row", gap: 8 }}>
                <HapticTap onPress={() => setShowNewSquad(false)} style={{ flex: 1 }}>
                  <View style={{ backgroundColor: Colors.card, borderRadius: 10, padding: 12, alignItems: "center" }}>
                    <Txt size={13} style={{ color: Colors.textMuted }}>Cancel</Txt>
                  </View>
                </HapticTap>
                <HapticTap onPress={handleCreateSquad} style={{ flex: 1 }} disabled={!squadName.trim()}>
                  <View style={{ backgroundColor: Colors.violet, borderRadius: 10, padding: 12, alignItems: "center", opacity: !squadName.trim() ? 0.4 : 1 }}>
                    <Txt size={13} bold style={{ color: "#000" }}>Create</Txt>
                  </View>
                </HapticTap>
              </View>
            </Card>
          ) : (
            <HapticTap onPress={() => setShowNewSquad(true)}>
              <View style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 10,
                backgroundColor: Colors.card,
                borderRadius: 14,
                borderWidth: 1,
                borderColor: Colors.border,
                padding: 14,
              }}>
                <Ionicons name="people" size={20} color={Colors.violet} />
                <Txt size={14} style={{ color: Colors.text, flex: 1 }}>Create a Squad Chat</Txt>
                <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
              </View>
            </HapticTap>
          )}
        </Animated.View>

        {/* Rooms List */}
        <Txt size={11} bold style={{ color: Colors.textMuted, letterSpacing: 1.5, marginBottom: 12 }}>
          CHATS
        </Txt>

        {rooms.length === 0 ? (
          <Animated.View entering={FadeInDown.duration(400).delay(160)}>
            <Card style={{ padding: 24, alignItems: "center", gap: 8 }}>
              <Ionicons name="chatbubbles-outline" size={36} color={Colors.textMuted} />
              <Txt size={15} bold style={{ color: Colors.textDim }}>No chats yet</Txt>
              <Txt size={13} style={{ color: Colors.textMuted, textAlign: "center" }}>
                Find a member by Gym ID or create a Squad Chat above
              </Txt>
            </Card>
          </Animated.View>
        ) : (
          rooms.map((room, i) => {
            const other = room.type === "dm" ? room.members.find((m) => m.id !== gymUser?.id) : null;
            const name = room.type === "dm" ? (other?.displayName ?? "Chat") : (room.name ?? "Squad");
            const avatarText = room.type === "dm" ? (other?.avatarInitials ?? "?") : (room.name?.slice(0, 2).toUpperCase() ?? "SQ");
            const isBot = room.lastMessage?.type === "bot_log";
            const preview = room.lastMessage
              ? (isBot ? `🤖 ${room.lastMessage.content}` : `${room.lastMessage.senderName}: ${room.lastMessage.content}`)
              : "No messages yet";

            return (
              <Animated.View key={room.id} entering={FadeInDown.duration(350).delay(160 + i * 40)}>
                <HapticTap onPress={() => openRoom(room)}>
                  <View style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 12,
                    backgroundColor: Colors.card,
                    borderRadius: 14,
                    borderWidth: 1,
                    borderColor: Colors.border,
                    padding: 14,
                    marginBottom: 10,
                  }}>
                    <View style={{
                      width: 44,
                      height: 44,
                      borderRadius: 22,
                      backgroundColor: room.type === "squad" ? Colors.violetDim : Colors.bgElevated,
                      borderWidth: 1,
                      borderColor: Colors.borderActive,
                      alignItems: "center",
                      justifyContent: "center",
                    }}>
                      <Txt size={14} bold style={{ color: Colors.text }}>{avatarText}</Txt>
                    </View>
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                        <Txt size={15} bold style={{ color: Colors.text }}>{name}</Txt>
                        {room.lastMessage && (
                          <Txt size={11} style={{ color: Colors.textMuted }}>
                            {formatTime(room.lastMessage.createdAt)}
                          </Txt>
                        )}
                      </View>
                      <Txt size={13} style={{ color: Colors.textMuted }} numberOfLines={1}>{preview}</Txt>
                    </View>
                  </View>
                </HapticTap>
              </Animated.View>
            );
          })
        )}

        {/* Bot help */}
        <Animated.View entering={FadeInDown.duration(400).delay(300)}>
          <Card style={{ padding: 14, marginTop: 12, gap: 6 }}>
            <Txt size={11} bold style={{ color: Colors.violet, letterSpacing: 1.5 }}>LITTYBOT COMMANDS</Txt>
            <Txt size={12} style={{ color: Colors.textMuted, lineHeight: 20 }}>
              Type bot commands in any chat to auto-log:{"\n"}
              /bench 225 · /squat 315 · /run 3.1{"\n"}
              /pullup 15 · /weight 185 · /sleep 8{"\n"}
              /calories 2400 · /steps 10000 · /water 80
            </Txt>
          </Card>
        </Animated.View>
      </ScrollView>
    </View>
  );
}
