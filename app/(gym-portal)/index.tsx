import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  useColorScheme,
  Platform,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useAuth } from "@/contexts/AuthContext";
import { useData, Booking } from "@/contexts/DataContext";

const GYM_ID = "gym_001";

function StatCard({
  value, label, sublabel, iconName, color, isDark,
}: {
  value: string; label: string; sublabel?: string; iconName: keyof typeof Ionicons.glyphMap; color: string; isDark: boolean;
}) {
  const card = isDark ? "#27272A" : "#FFFFFF";
  const border = isDark ? "#3F3F46" : "#E4E4E7";
  const text = isDark ? "#FAFAFA" : "#09090B";
  const textSec = isDark ? "#A1A1AA" : "#71717A";

  return (
    <View style={[styles.statCard, { backgroundColor: card, borderColor: border }]}>
      <View style={[styles.statIconWrap, { backgroundColor: color + "18" }]}>
        <Ionicons name={iconName} size={20} color={color} />
      </View>
      <Text style={[styles.statValue, { color: text, fontFamily: "Inter_700Bold" }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: textSec, fontFamily: "Inter_400Regular" }]}>{label}</Text>
      {sublabel && (
        <Text style={[styles.statSublabel, { color: color, fontFamily: "Inter_500Medium" }]}>{sublabel}</Text>
      )}
    </View>
  );
}

function BookingRow({ booking, isDark }: { booking: Booking; isDark: boolean }) {
  const card = isDark ? "#27272A" : "#FFFFFF";
  const border = isDark ? "#3F3F46" : "#E4E4E7";
  const text = isDark ? "#FAFAFA" : "#09090B";
  const textSec = isDark ? "#A1A1AA" : "#71717A";
  const isCheckedIn = booking.status === "checked_in";

  return (
    <View style={[styles.bookingRow, { backgroundColor: card, borderColor: border }]}>
      <View style={[styles.bookingRowLeft, { backgroundColor: isCheckedIn ? "#DCFCE7" : "#DBEAFE" }]}>
        <Ionicons
          name={isCheckedIn ? "checkmark" : "time-outline"}
          size={18}
          color={isCheckedIn ? "#22C55E" : "#3B82F6"}
        />
      </View>
      <View style={styles.bookingRowInfo}>
        <Text style={[styles.bookingRowName, { color: text, fontFamily: "Inter_600SemiBold" }]}>
          Member #{booking.userId.slice(-4).toUpperCase()}
        </Text>
        <Text style={[styles.bookingRowTime, { color: textSec, fontFamily: "Inter_400Regular" }]}>
          {booking.time} · {new Date(booking.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
        </Text>
      </View>
      <View style={styles.bookingRowRight}>
        <Text style={[styles.bookingRowPrice, { fontFamily: "Inter_700Bold" }]}>
          ${(booking.amount / 100).toFixed(0)}
        </Text>
        <View style={[styles.bookingRowStatus, { backgroundColor: isCheckedIn ? "#DCFCE7" : "#DBEAFE" }]}>
          <Text style={[styles.bookingRowStatusText, { color: isCheckedIn ? "#22C55E" : "#3B82F6", fontFamily: "Inter_500Medium" }]}>
            {isCheckedIn ? "In" : "Booked"}
          </Text>
        </View>
      </View>
    </View>
  );
}

export default function GymDashboard() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const { user, switchRole } = useAuth();
  const { getGym, getGymBookings, getGymRevenue } = useData();

  const bg = isDark ? "#09090B" : "#FAFAFA";
  const text = isDark ? "#FAFAFA" : "#09090B";
  const textSec = isDark ? "#A1A1AA" : "#71717A";

  const gym = getGym(GYM_ID);
  const bookings = getGymBookings(GYM_ID);
  const revenue = getGymRevenue(GYM_ID);

  const todayStr = new Date().toISOString().split("T")[0];
  const todayBookings = bookings.filter((b) => b.date === todayStr);
  const checkedIn = bookings.filter((b) => b.status === "checked_in").length;
  const totalRevenue = revenue.reduce((s, r) => s + r.gymShare, 0);
  const pendingRevenue = revenue.filter((r) => r.status === "pending").reduce((s, r) => s + r.gymShare, 0);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: bg }]}
      contentContainerStyle={{ paddingBottom: Platform.OS === "web" ? 118 : insets.bottom + 100 }}
      showsVerticalScrollIndicator={false}
    >
      <Animated.View
        entering={FadeInDown.delay(0).springify()}
        style={[styles.header, { paddingTop: Platform.OS === "web" ? 67 : insets.top + 12 }]}
      >
        <View>
          <Text style={[styles.headerLabel, { color: textSec, fontFamily: "Inter_400Regular" }]}>
            Partner Portal
          </Text>
          <Text style={[styles.headerTitle, { color: text, fontFamily: "Inter_700Bold" }]}>
            {gym?.name || "My Gym"}
          </Text>
        </View>
        <Pressable
          style={styles.switchRoleBtn}
          onPress={async () => {
            await switchRole("user");
            router.replace("/(tabs)");
          }}
        >
          <Ionicons name="swap-horizontal" size={18} color="#22C55E" />
        </Pressable>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(80).springify()} style={styles.statsGrid}>
        <StatCard value={`${todayBookings.length}`} label="Today's Bookings" sublabel={`${checkedIn} checked in`} iconName="ticket-outline" color="#3B82F6" isDark={isDark} />
        <StatCard value={`$${(totalRevenue / 100).toFixed(0)}`} label="Total Earned" sublabel={`$${(pendingRevenue / 100).toFixed(0)} pending`} iconName="cash-outline" color="#22C55E" isDark={isDark} />
        <StatCard value={`${bookings.length}`} label="All Time Visits" iconName="people-outline" color="#F97316" isDark={isDark} />
        <StatCard value={`${gym?.capacity || 0}`} label="Max Capacity" iconName="body-outline" color="#A855F7" isDark={isDark} />
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(160).springify()} style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: text, fontFamily: "Inter_700Bold" }]}>
            Today's Visitors
          </Text>
          <Pressable onPress={() => router.push("/(gym-portal)/scanner")}>
            <Text style={[styles.seeAllBtn, { fontFamily: "Inter_500Medium" }]}>Scan QR</Text>
          </Pressable>
        </View>
        {todayBookings.length === 0 ? (
          <View style={[styles.emptyCard, { backgroundColor: isDark ? "#18181B" : "#F4F4F5" }]}>
            <Ionicons name="calendar-outline" size={32} color={textSec} />
            <Text style={[styles.emptyCardText, { color: textSec, fontFamily: "Inter_400Regular" }]}>
              No bookings for today yet
            </Text>
          </View>
        ) : (
          <View style={styles.bookingsList}>
            {todayBookings.map((b) => (
              <BookingRow key={b.id} booking={b} isDark={isDark} />
            ))}
          </View>
        )}
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(240).springify()} style={styles.section}>
        <Text style={[styles.sectionTitle, { color: text, fontFamily: "Inter_700Bold" }]}>
          Recent Activity
        </Text>
        {bookings.slice(0, 5).length === 0 ? (
          <View style={[styles.emptyCard, { backgroundColor: isDark ? "#18181B" : "#F4F4F5" }]}>
            <Ionicons name="pulse-outline" size={32} color={textSec} />
            <Text style={[styles.emptyCardText, { color: textSec, fontFamily: "Inter_400Regular" }]}>
              Activity will appear here
            </Text>
          </View>
        ) : (
          <View style={styles.bookingsList}>
            {bookings.slice(0, 5).map((b) => (
              <BookingRow key={b.id} booking={b} isDark={isDark} />
            ))}
          </View>
        )}
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerLabel: { fontSize: 13 },
  headerTitle: { fontSize: 26, letterSpacing: -0.6 },
  switchRoleBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "#22C55E18",
    alignItems: "center",
    justifyContent: "center",
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  statCard: {
    width: "47%",
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    gap: 6,
  },
  statIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  statValue: { fontSize: 24 },
  statLabel: { fontSize: 12 },
  statSublabel: { fontSize: 12 },
  section: { paddingHorizontal: 20, marginBottom: 24 },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  sectionTitle: { fontSize: 18 },
  seeAllBtn: { fontSize: 14, color: "#22C55E" },
  emptyCard: { borderRadius: 16, padding: 24, alignItems: "center", gap: 10 },
  emptyCardText: { fontSize: 14 },
  bookingsList: { gap: 10 },
  bookingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
  },
  bookingRowLeft: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  bookingRowInfo: { flex: 1 },
  bookingRowName: { fontSize: 15 },
  bookingRowTime: { fontSize: 13 },
  bookingRowRight: { alignItems: "flex-end", gap: 4 },
  bookingRowPrice: { fontSize: 15, color: "#22C55E" },
  bookingRowStatus: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  bookingRowStatusText: { fontSize: 11 },
});
