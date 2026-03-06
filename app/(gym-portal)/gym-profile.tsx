import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  useColorScheme,
  Platform,
  Alert,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useAuth } from "@/contexts/AuthContext";
import { useData } from "@/contexts/DataContext";

const GYM_ID = "gym_001";

export default function GymProfileScreen() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const { user, logout, switchRole } = useAuth();
  const { getGym } = useData();

  const bg = isDark ? "#09090B" : "#FAFAFA";
  const card = isDark ? "#27272A" : "#FFFFFF";
  const border = isDark ? "#3F3F46" : "#E4E4E7";
  const surface = isDark ? "#18181B" : "#F4F4F5";
  const text = isDark ? "#FAFAFA" : "#09090B";
  const textSec = isDark ? "#A1A1AA" : "#71717A";

  const gym = getGym(GYM_ID);

  const handleSwitchToUser = () => {
    Alert.alert("Switch Role", "Switch to member view?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Switch",
        onPress: async () => {
          await switchRole("user");
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          router.replace("/(tabs)");
        },
      },
    ]);
  };

  const handleLogout = () => {
    Alert.alert("Sign Out", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          await logout();
          router.replace("/(auth)/phone");
        },
      },
    ]);
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: bg }]}
      contentContainerStyle={{ paddingBottom: Platform.OS === "web" ? 118 : insets.bottom + 100 }}
      showsVerticalScrollIndicator={false}
    >
      <View style={{ paddingTop: Platform.OS === "web" ? 67 : insets.top + 12 }}>
        <Animated.View entering={FadeInDown.delay(0).springify()} style={{ paddingHorizontal: 20, marginBottom: 20 }}>
          <Text style={[styles.title, { color: text, fontFamily: "Inter_700Bold" }]}>My Gym</Text>
        </Animated.View>

        {gym && (
          <Animated.View entering={FadeInDown.delay(80).springify()} style={{ marginHorizontal: 20, marginBottom: 20 }}>
            <View style={[styles.gymCard, { borderColor: border }]}>
              <View style={[styles.gymBanner, { backgroundColor: gym.gradientStart }]}>
                <View style={[styles.gymBannerOverlay, { backgroundColor: gym.gradientEnd + "44" }]} />
                <View style={styles.gymBannerContent}>
                  <Text style={[styles.gymName, { fontFamily: "Inter_700Bold" }]}>{gym.name}</Text>
                  <View style={styles.gymBadgeRow}>
                    <View style={styles.gymBadge}>
                      <Text style={[styles.gymBadgeText, { fontFamily: "Inter_500Medium" }]}>{gym.category}</Text>
                    </View>
                    <View style={[styles.gymBadge, { backgroundColor: gym.isOpen ? "#22C55E33" : "#EF444433" }]}>
                      <View style={[styles.gymStatusDot, { backgroundColor: gym.isOpen ? "#22C55E" : "#EF4444" }]} />
                      <Text style={[styles.gymBadgeText, { fontFamily: "Inter_500Medium" }]}>
                        {gym.isOpen ? "Open" : "Closed"}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
              <View style={[styles.gymInfo, { backgroundColor: card }]}>
                <View style={styles.gymInfoRow}>
                  <Ionicons name="location-outline" size={16} color={textSec} />
                  <Text style={[styles.gymAddress, { color: textSec, fontFamily: "Inter_400Regular" }]}>
                    {gym.address}
                  </Text>
                </View>
                <View style={styles.gymInfoRow}>
                  <Ionicons name="time-outline" size={16} color={textSec} />
                  <Text style={[styles.gymAddress, { color: textSec, fontFamily: "Inter_400Regular" }]}>
                    {gym.openTime} – {gym.closeTime}
                  </Text>
                </View>
                <View style={styles.gymInfoRow}>
                  <Ionicons name="people-outline" size={16} color={textSec} />
                  <Text style={[styles.gymAddress, { color: textSec, fontFamily: "Inter_400Regular" }]}>
                    Capacity: {gym.capacity} people
                  </Text>
                </View>
                <View style={[styles.revShareRow, { backgroundColor: isDark ? "#18181B" : "#F4F4F5" }]}>
                  <Text style={[styles.revShareLabel, { color: textSec, fontFamily: "Inter_400Regular" }]}>
                    Revenue share
                  </Text>
                  <Text style={[styles.revShareValue, { fontFamily: "Inter_700Bold" }]}>
                    {gym.revenueShare}% / {100 - gym.revenueShare}%
                  </Text>
                </View>
              </View>
            </View>
          </Animated.View>
        )}

        <Animated.View entering={FadeInDown.delay(160).springify()} style={{ paddingHorizontal: 20, marginBottom: 20 }}>
          <Text style={[styles.sectionTitle, { color: textSec, fontFamily: "Inter_600SemiBold" }]}>SETTINGS</Text>
          <View style={styles.menuGroup}>
            {[
              { icon: "create-outline" as const, label: "Edit Gym Details", color: "#3B82F6" },
              { icon: "calendar-outline" as const, label: "Manage Schedule", color: "#F97316" },
              { icon: "notifications-outline" as const, label: "Booking Alerts", color: "#A855F7" },
              { icon: "wallet-outline" as const, label: "Payout Settings", color: "#22C55E" },
            ].map((item) => (
              <Pressable
                key={item.label}
                style={[styles.menuItem, { backgroundColor: card, borderColor: border }]}
                onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
              >
                <View style={[styles.menuIcon, { backgroundColor: item.color + "18" }]}>
                  <Ionicons name={item.icon} size={20} color={item.color} />
                </View>
                <Text style={[styles.menuLabel, { color: text, fontFamily: "Inter_500Medium" }]}>{item.label}</Text>
                <Ionicons name="chevron-forward" size={16} color={textSec} />
              </Pressable>
            ))}
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(240).springify()} style={{ paddingHorizontal: 20, gap: 12 }}>
          <Pressable
            style={[styles.switchBtn, { backgroundColor: card, borderColor: border }]}
            onPress={handleSwitchToUser}
          >
            <Ionicons name="person-outline" size={20} color="#3B82F6" />
            <Text style={[styles.switchBtnText, { color: "#3B82F6", fontFamily: "Inter_600SemiBold" }]}>
              Switch to Member View
            </Text>
          </Pressable>
          <Pressable
            style={[styles.switchBtn, { backgroundColor: card, borderColor: "#EF4444" + "44" }]}
            onPress={handleLogout}
          >
            <Ionicons name="log-out-outline" size={20} color="#EF4444" />
            <Text style={[styles.switchBtnText, { color: "#EF4444", fontFamily: "Inter_600SemiBold" }]}>
              Sign Out
            </Text>
          </Pressable>
        </Animated.View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  title: { fontSize: 28, letterSpacing: -0.6 },
  gymCard: { borderRadius: 20, borderWidth: 1, overflow: "hidden" },
  gymBanner: { height: 140, position: "relative" },
  gymBannerOverlay: { ...StyleSheet.absoluteFillObject },
  gymBannerContent: {
    ...StyleSheet.absoluteFillObject,
    padding: 20,
    justifyContent: "flex-end",
    gap: 10,
  },
  gymName: { color: "#fff", fontSize: 22 },
  gymBadgeRow: { flexDirection: "row", gap: 8 },
  gymBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(0,0,0,0.4)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  gymStatusDot: { width: 6, height: 6, borderRadius: 3 },
  gymBadgeText: { color: "#fff", fontSize: 12 },
  gymInfo: { padding: 16, gap: 12 },
  gymInfoRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  gymAddress: { fontSize: 14, flex: 1 },
  revShareRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 12,
    borderRadius: 12,
    marginTop: 4,
  },
  revShareLabel: { fontSize: 14 },
  revShareValue: { fontSize: 14, color: "#22C55E" },
  sectionTitle: { fontSize: 11, letterSpacing: 1, marginBottom: 12 },
  menuGroup: { gap: 8 },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
  },
  menuIcon: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  menuLabel: { flex: 1, fontSize: 15 },
  switchBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  switchBtnText: { fontSize: 15 },
});
