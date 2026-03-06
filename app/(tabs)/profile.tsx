import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  useColorScheme,
  Platform,
  Alert,
  Image,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useAuth, UserRole } from "@/contexts/AuthContext";
import { useData } from "@/contexts/DataContext";

interface MenuItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  label: string;
  value?: string;
  onPress: () => void;
  destructive?: boolean;
  isDark: boolean;
}

function MenuItem({ icon, iconColor, label, value, onPress, destructive, isDark }: MenuItemProps) {
  const text = isDark ? "#FAFAFA" : "#09090B";
  const textSec = isDark ? "#A1A1AA" : "#71717A";
  const card = isDark ? "#1C1C1E" : "#FFFFFF";
  const border = isDark ? "#2C2C2E" : "#F4F4F5";

  return (
    <Pressable
      style={({ pressed }) => [
        styles.menuItem,
        { backgroundColor: card, borderBottomColor: border, opacity: pressed ? 0.7 : 1 },
      ]}
      onPress={onPress}
    >
      <View style={[styles.menuIconWrap, { backgroundColor: iconColor + "15" }]}>
        <Ionicons name={icon} size={19} color={iconColor} />
      </View>
      <Text style={[styles.menuLabel, { color: destructive ? "#EF4444" : text, fontFamily: "Inter_500Medium" }]}>
        {label}
      </Text>
      <View style={{ flex: 1 }} />
      {value && (
        <Text style={[styles.menuValue, { color: textSec, fontFamily: "Inter_400Regular" }]}>{value}</Text>
      )}
      <Ionicons name="chevron-forward" size={15} color={isDark ? "#3F3F46" : "#D4D4D8"} />
    </Pressable>
  );
}

const ROLE_CONFIG: Record<UserRole, { label: string; color: string; icon: keyof typeof Ionicons.glyphMap; description: string }> = {
  user: { label: "Member", color: "#3B82F6", icon: "person", description: "Browse & book gyms" },
  gym: { label: "Gym Partner", color: "#22C55E", icon: "barbell", description: "Manage your gym" },
  admin: { label: "Admin", color: "#F97316", icon: "shield", description: "Platform overview" },
};

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const { user, logout, switchRole } = useAuth();
  const { getUserBookings } = useData();

  const bg = isDark ? "#09090B" : "#F2F2F7";
  const card = isDark ? "#1C1C1E" : "#FFFFFF";
  const border = isDark ? "#2C2C2E" : "#E4E4E7";
  const surface = isDark ? "#2C2C2E" : "#F4F4F5";
  const text = isDark ? "#FAFAFA" : "#09090B";
  const textSec = isDark ? "#A1A1AA" : "#71717A";

  const allBookings = user ? getUserBookings(user.id) : [];
  const completedVisits = allBookings.filter((b) => b.status === "checked_in" || b.status === "completed").length;
  const totalSpent = allBookings
    .filter((b) => b.status !== "cancelled")
    .reduce((sum, b) => sum + b.amount, 0);
  const activeBookings = allBookings.filter((b) => b.status === "confirmed").length;

  const roleInfo = user ? ROLE_CONFIG[user.role] : ROLE_CONFIG.user;

  const handleLogout = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
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

  const handleSwitchRole = (role: UserRole) => {
    Alert.alert(
      "Switch Role",
      `Switch to ${ROLE_CONFIG[role].label} view?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Switch",
          onPress: async () => {
            await switchRole(role);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            if (role === "gym") router.replace("/(gym-portal)");
            else if (role === "admin") router.replace("/(admin)");
          },
        },
      ]
    );
  };

  if (!user) return null;

  const initials = user.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: bg }]}
      contentContainerStyle={{ paddingBottom: Platform.OS === "web" ? 118 : insets.bottom + 100 }}
      showsVerticalScrollIndicator={false}
    >
      <View style={{ paddingTop: Platform.OS === "web" ? 67 : insets.top + 8 }}>

        <Animated.View entering={FadeInDown.delay(0).springify()} style={[styles.profileHero, { backgroundColor: card, borderColor: border }]}>
          <View style={[styles.avatarWrap, { backgroundColor: user.avatarColor + "22" }]}>
            <View style={[styles.avatar, { backgroundColor: user.avatarColor }]}>
              <Text style={[styles.avatarText, { fontFamily: "Inter_700Bold" }]}>{initials}</Text>
            </View>
          </View>
          <Text style={[styles.profileName, { color: text, fontFamily: "Inter_700Bold" }]}>{user.name}</Text>
          <Text style={[styles.profilePhone, { color: textSec, fontFamily: "Inter_400Regular" }]}>{user.phone}</Text>
          <View style={[styles.roleBadge, { backgroundColor: roleInfo.color + "18" }]}>
            <Ionicons name={roleInfo.icon} size={13} color={roleInfo.color} />
            <Text style={[styles.roleBadgeText, { color: roleInfo.color, fontFamily: "Inter_600SemiBold" }]}>
              {roleInfo.label}
            </Text>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(60).springify()} style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: card, borderColor: border }]}>
            <Text style={[styles.statValue, { color: "#F97316", fontFamily: "Inter_700Bold" }]}>{completedVisits}</Text>
            <Text style={[styles.statLabel, { color: textSec, fontFamily: "Inter_400Regular" }]}>Visits</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: card, borderColor: border }]}>
            <Text style={[styles.statValue, { color: "#3B82F6", fontFamily: "Inter_700Bold" }]}>{activeBookings}</Text>
            <Text style={[styles.statLabel, { color: textSec, fontFamily: "Inter_400Regular" }]}>Active</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: card, borderColor: border }]}>
            <Text style={[styles.statValue, { color: "#22C55E", fontFamily: "Inter_700Bold" }]}>
              ${(totalSpent / 100).toFixed(0)}
            </Text>
            <Text style={[styles.statLabel, { color: textSec, fontFamily: "Inter_400Regular" }]}>Spent</Text>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(120).springify()} style={styles.section}>
          <Text style={[styles.sectionLabel, { color: textSec, fontFamily: "Inter_600SemiBold" }]}>VIEW AS</Text>
          <View style={[styles.roleCards, { gap: 10 }]}>
            {(["user", "gym", "admin"] as UserRole[]).map((role) => {
              const r = ROLE_CONFIG[role];
              const isActive = user.role === role;
              return (
                <Pressable
                  key={role}
                  style={[
                    styles.roleCard,
                    {
                      backgroundColor: isActive ? r.color : card,
                      borderColor: isActive ? r.color : border,
                    },
                  ]}
                  onPress={() => !isActive && handleSwitchRole(role)}
                >
                  <View style={[styles.roleCardIcon, { backgroundColor: isActive ? "rgba(255,255,255,0.2)" : r.color + "15" }]}>
                    <Ionicons name={r.icon} size={18} color={isActive ? "#fff" : r.color} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.roleCardLabel, { color: isActive ? "#fff" : text, fontFamily: "Inter_600SemiBold" }]}>
                      {r.label}
                    </Text>
                    <Text style={[styles.roleCardDesc, { color: isActive ? "rgba(255,255,255,0.75)" : textSec, fontFamily: "Inter_400Regular" }]}>
                      {r.description}
                    </Text>
                  </View>
                  {isActive && <Ionicons name="checkmark-circle" size={20} color="rgba(255,255,255,0.9)" />}
                </Pressable>
              );
            })}
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200).springify()} style={styles.section}>
          <Text style={[styles.sectionLabel, { color: textSec, fontFamily: "Inter_600SemiBold" }]}>ACCOUNT</Text>
          <View style={[styles.menuGroup, { backgroundColor: card, borderColor: border }]}>
            <MenuItem
              icon="notifications-outline"
              iconColor="#3B82F6"
              label="Notifications"
              value="On"
              onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
              isDark={isDark}
            />
            <MenuItem
              icon="card-outline"
              iconColor="#22C55E"
              label="Payment Methods"
              value="Visa •• 4242"
              onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
              isDark={isDark}
            />
            <MenuItem
              icon="location-outline"
              iconColor="#F59E0B"
              label="Default Location"
              value="San Francisco"
              onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
              isDark={isDark}
            />
            <MenuItem
              icon="shield-checkmark-outline"
              iconColor="#A855F7"
              label="Privacy & Security"
              onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
              isDark={isDark}
            />
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(280).springify()} style={styles.section}>
          <Text style={[styles.sectionLabel, { color: textSec, fontFamily: "Inter_600SemiBold" }]}>SUPPORT</Text>
          <View style={[styles.menuGroup, { backgroundColor: card, borderColor: border }]}>
            <MenuItem
              icon="help-circle-outline"
              iconColor="#14B8A6"
              label="Help Center"
              onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
              isDark={isDark}
            />
            <MenuItem
              icon="document-text-outline"
              iconColor="#6366F1"
              label="Terms of Service"
              onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
              isDark={isDark}
            />
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(340).springify()} style={[styles.section, { marginBottom: 0 }]}>
          <View style={[styles.menuGroup, { backgroundColor: card, borderColor: border }]}>
            <MenuItem
              icon="log-out-outline"
              iconColor="#EF4444"
              label="Sign Out"
              onPress={handleLogout}
              destructive
              isDark={isDark}
            />
          </View>
        </Animated.View>

        <View style={styles.versionRow}>
          <Text style={[styles.versionText, { color: isDark ? "#3F3F46" : "#D4D4D8", fontFamily: "Inter_400Regular" }]}>
            GymPass v1.0 · Made with ♥
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  profileHero: {
    alignItems: "center",
    gap: 8,
    padding: 24,
    marginHorizontal: 16,
    marginBottom: 14,
    borderRadius: 24,
    borderWidth: 1,
  },
  avatarWrap: {
    width: 90,
    height: 90,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  avatar: {
    width: 76,
    height: 76,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { fontSize: 28, color: "#fff" },
  profileName: { fontSize: 22, letterSpacing: -0.4 },
  profilePhone: { fontSize: 14 },
  roleBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
    marginTop: 4,
  },
  roleBadgeText: { fontSize: 13 },
  statsRow: { flexDirection: "row", gap: 10, marginHorizontal: 16, marginBottom: 14 },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: "center",
    gap: 4,
  },
  statValue: { fontSize: 24 },
  statLabel: { fontSize: 12 },
  section: { paddingHorizontal: 16, marginBottom: 14 },
  sectionLabel: { fontSize: 11, letterSpacing: 1.2, marginBottom: 10, paddingLeft: 4 },
  roleCards: {},
  roleCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1.5,
  },
  roleCardIcon: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  roleCardLabel: { fontSize: 15 },
  roleCardDesc: { fontSize: 12, marginTop: 1 },
  menuGroup: {
    borderRadius: 18,
    borderWidth: 1,
    overflow: "hidden",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  menuIconWrap: { width: 34, height: 34, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  menuLabel: { fontSize: 15 },
  menuValue: { fontSize: 14 },
  versionRow: { alignItems: "center", paddingTop: 16, paddingBottom: 8 },
  versionText: { fontSize: 12 },
});
