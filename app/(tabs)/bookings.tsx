import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  useColorScheme,
  Platform,
  Image,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useData, Booking } from "@/contexts/DataContext";
import { useAuth } from "@/contexts/AuthContext";

const STATUS_CONFIG = {
  confirmed: { label: "Active Pass", color: "#F97316", bg: "#FFF7ED", icon: "flash" as const },
  checked_in: { label: "Checked In", color: "#22C55E", bg: "#F0FDF4", icon: "checkmark-circle" as const },
  cancelled: { label: "Cancelled", color: "#EF4444", bg: "#FEF2F2", icon: "close-circle" as const },
  completed: { label: "Completed", color: "#71717A", bg: "#F4F4F5", icon: "checkmark-done" as const },
};

function BookingCard({ booking, index, onPress }: { booking: Booking; index: number; onPress: () => void }) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const card = isDark ? "#1C1C1E" : "#FFFFFF";
  const border = isDark ? "#2C2C2E" : "#E4E4E7";
  const text = isDark ? "#FAFAFA" : "#09090B";
  const textSec = isDark ? "#A1A1AA" : "#71717A";
  const status = STATUS_CONFIG[booking.status];
  const isActive = booking.status === "confirmed";

  const dateObj = new Date(booking.date);
  const dateStr = dateObj.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });

  return (
    <Animated.View entering={FadeInDown.delay(index * 50).springify()}>
      <Pressable
        style={[styles.bookingCard, { backgroundColor: card, borderColor: isActive ? "#F97316" : border, borderWidth: isActive ? 1.5 : 1 }]}
        onPress={onPress}
      >
        <View style={styles.gymBanner}>
          {booking.gymImageUrl ? (
            <Image
              source={{ uri: booking.gymImageUrl }}
              style={StyleSheet.absoluteFillObject}
              resizeMode="cover"
            />
          ) : (
            <View style={[StyleSheet.absoluteFillObject, { backgroundColor: booking.gymGradientStart }]} />
          )}
          <View style={[styles.bannerOverlay, { backgroundColor: "rgba(0,0,0,0.5)" }]} />
          <View style={styles.bannerContent}>
            <View style={styles.gymBannerLeft}>
              <Text style={[styles.gymNameBanner, { fontFamily: "Inter_700Bold" }]}>{booking.gymName}</Text>
              <View style={styles.bannerDateRow}>
                <Ionicons name="calendar-outline" size={13} color="rgba(255,255,255,0.8)" />
                <Text style={[styles.bannerDate, { fontFamily: "Inter_400Regular" }]}>{dateStr}</Text>
              </View>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
              <Ionicons name={status.icon} size={12} color={status.color} />
              <Text style={[styles.statusText, { color: status.color, fontFamily: "Inter_600SemiBold" }]}>
                {status.label}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.bookingBody}>
          <View style={styles.bookingRow}>
            <View style={styles.bookingInfoGroup}>
              <View style={styles.bookingInfo}>
                <View style={[styles.bookingInfoIcon, { backgroundColor: isDark ? "#2C2C2E" : "#F4F4F5" }]}>
                  <Ionicons name="time-outline" size={14} color={textSec} />
                </View>
                <Text style={[styles.bookingInfoText, { color: text, fontFamily: "Inter_500Medium" }]}>
                  {booking.time} · {booking.duration} min
                </Text>
              </View>
            </View>
            <Text style={[styles.priceText, { fontFamily: "Inter_700Bold" }]}>
              ${(booking.amount / 100).toFixed(0)}
            </Text>
          </View>

          {isActive && (
            <Pressable
              style={[styles.tapForQR, { backgroundColor: "#F97316" }]}
              onPress={onPress}
            >
              <Ionicons name="qr-code" size={18} color="#fff" />
              <Text style={[styles.tapForQRText, { fontFamily: "Inter_600SemiBold" }]}>
                View QR Pass
              </Text>
              <Ionicons name="chevron-forward" size={16} color="#fff" />
            </Pressable>
          )}
        </View>
      </Pressable>
    </Animated.View>
  );
}

const TABS = ["All", "Active", "History"];

export default function BookingsScreen() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const { user } = useAuth();
  const { getUserBookings } = useData();
  const [activeTab, setActiveTab] = useState("All");

  const bg = isDark ? "#09090B" : "#F2F2F7";
  const surface = isDark ? "#1C1C1E" : "#FFFFFF";
  const border = isDark ? "#2C2C2E" : "#E4E4E7";
  const text = isDark ? "#FAFAFA" : "#09090B";
  const textSec = isDark ? "#A1A1AA" : "#71717A";

  const allBookings = user ? getUserBookings(user.id) : [];
  const activeCount = allBookings.filter((b) => b.status === "confirmed").length;
  const filteredBookings =
    activeTab === "Active"
      ? allBookings.filter((b) => b.status === "confirmed")
      : activeTab === "History"
      ? allBookings.filter((b) => b.status !== "confirmed")
      : allBookings;

  return (
    <View style={[styles.container, { backgroundColor: bg }]}>
      <View
        style={[
          styles.header,
          {
            paddingTop: Platform.OS === "web" ? 67 : insets.top + 8,
            backgroundColor: isDark ? "#09090B" : "#F2F2F7",
          },
        ]}
      >
        <View style={styles.headerTop}>
          <View>
            <Text style={[styles.headerSub, { color: textSec, fontFamily: "Inter_400Regular" }]}>
              Your gym sessions
            </Text>
            <Text style={[styles.headerTitle, { color: text, fontFamily: "Inter_700Bold" }]}>
              My Passes
            </Text>
          </View>
          {activeCount > 0 && (
            <View style={styles.activeCountBadge}>
              <Text style={[styles.activeCountText, { fontFamily: "Inter_700Bold" }]}>
                {activeCount} active
              </Text>
            </View>
          )}
        </View>

        <View style={[styles.tabRow, { backgroundColor: surface, borderColor: border }]}>
          {TABS.map((tab) => (
            <Pressable
              key={tab}
              style={[styles.tabItem, activeTab === tab && styles.activeTab]}
              onPress={() => {
                setActiveTab(tab);
                Haptics.selectionAsync();
              }}
            >
              <Text
                style={[
                  styles.tabText,
                  {
                    color: activeTab === tab ? "#fff" : textSec,
                    fontFamily: activeTab === tab ? "Inter_600SemiBold" : "Inter_400Regular",
                  },
                ]}
              >
                {tab}
                {tab === "Active" && activeCount > 0 ? ` · ${activeCount}` : ""}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <FlatList
        data={filteredBookings}
        keyExtractor={(b) => b.id}
        renderItem={({ item, index }) => (
          <BookingCard
            booking={item}
            index={index}
            onPress={() => {
              if (item.status === "confirmed") {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.push({ pathname: "/qr/[id]", params: { id: item.id } });
              }
            }}
          />
        )}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: Platform.OS === "web" ? 118 : insets.bottom + 100 },
        ]}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <View style={[styles.emptyIconWrap, { backgroundColor: isDark ? "#1C1C1E" : "#F4F4F5" }]}>
              <Ionicons name="ticket-outline" size={32} color={textSec} />
            </View>
            <Text style={[styles.emptyTitle, { color: text, fontFamily: "Inter_700Bold" }]}>
              {activeTab === "Active" ? "No active passes" : "No bookings yet"}
            </Text>
            <Text style={[styles.emptySubtitle, { color: textSec, fontFamily: "Inter_400Regular" }]}>
              {activeTab === "Active"
                ? "Book a session to get your pass"
                : "Your session history will appear here"}
            </Text>
            <Pressable
              style={styles.discoverBtn}
              onPress={() => router.push("/(tabs)")}
            >
              <Ionicons name="search-outline" size={16} color="#fff" />
              <Text style={[styles.discoverBtnText, { fontFamily: "Inter_600SemiBold" }]}>
                Find a gym
              </Text>
            </Pressable>
          </View>
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 16 },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: 16,
  },
  headerSub: { fontSize: 13, marginBottom: 2 },
  headerTitle: { fontSize: 30, letterSpacing: -0.8 },
  activeCountBadge: {
    backgroundColor: "#FFF7ED",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  activeCountText: { color: "#F97316", fontSize: 13 },
  tabRow: {
    flexDirection: "row",
    borderRadius: 14,
    padding: 4,
    gap: 4,
    borderWidth: 1,
  },
  tabItem: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 10,
    alignItems: "center",
  },
  activeTab: { backgroundColor: "#F97316" },
  tabText: { fontSize: 14 },
  listContent: { paddingHorizontal: 16, paddingTop: 12, gap: 12 },
  bookingCard: { borderRadius: 22, overflow: "hidden" },
  gymBanner: { height: 120, position: "relative", backgroundColor: "#1C1C1E" },
  bannerOverlay: { ...StyleSheet.absoluteFillObject },
  bannerContent: {
    ...StyleSheet.absoluteFillObject,
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  gymBannerLeft: { gap: 6, flex: 1, marginRight: 12 },
  gymNameBanner: { color: "#fff", fontSize: 20 },
  bannerDateRow: { flexDirection: "row", alignItems: "center", gap: 5 },
  bannerDate: { color: "rgba(255,255,255,0.85)", fontSize: 13 },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: { fontSize: 12 },
  bookingBody: { padding: 16, gap: 12 },
  bookingRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  bookingInfoGroup: { gap: 8 },
  bookingInfo: { flexDirection: "row", alignItems: "center", gap: 8 },
  bookingInfoIcon: { width: 28, height: 28, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  bookingInfoText: { fontSize: 15 },
  priceText: { fontSize: 20, color: "#F97316" },
  tapForQR: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 14,
    borderRadius: 14,
  },
  tapForQRText: { flex: 1, fontSize: 15, color: "#fff" },
  emptyState: { alignItems: "center", gap: 12, paddingTop: 80, paddingHorizontal: 40 },
  emptyIconWrap: { width: 72, height: 72, borderRadius: 24, alignItems: "center", justifyContent: "center", marginBottom: 4 },
  emptyTitle: { fontSize: 20 },
  emptySubtitle: { fontSize: 15, textAlign: "center" as const, lineHeight: 22 },
  discoverBtn: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 8,
    backgroundColor: "#F97316",
    paddingHorizontal: 24,
    paddingVertical: 13,
    borderRadius: 14,
    marginTop: 8,
  },
  discoverBtnText: { color: "#fff", fontSize: 15 },
});