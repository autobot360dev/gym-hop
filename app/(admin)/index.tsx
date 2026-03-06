import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  useColorScheme,
  Platform,
  Alert,
  TextInput,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useAuth } from "@/contexts/AuthContext";
import { useData } from "@/contexts/DataContext";

const ADMIN_SECTIONS = ["Overview", "Gyms", "Revenue", "Payouts"];

export default function AdminDashboard() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const { user, switchRole, logout } = useAuth();
  const { gyms, bookings, revenueEntries, globalRevenueShare, setGlobalRevenueShare } = useData();
  const [activeSection, setActiveSection] = useState("Overview");
  const [gymShareInput, setGymShareInput] = useState(globalRevenueShare.toString());

  const bg = isDark ? "#09090B" : "#FAFAFA";
  const surface = isDark ? "#18181B" : "#F4F4F5";
  const card = isDark ? "#27272A" : "#FFFFFF";
  const border = isDark ? "#3F3F46" : "#E4E4E7";
  const text = isDark ? "#FAFAFA" : "#09090B";
  const textSec = isDark ? "#A1A1AA" : "#71717A";

  const totalRevenue = revenueEntries.reduce((s, r) => s + r.amount, 0);
  const platformRevenue = revenueEntries.reduce((s, r) => s + r.platformShare, 0);
  const totalBookings = bookings.length;
  const checkedInCount = bookings.filter((b) => b.status === "checked_in").length;
  const activeUsers = new Set(bookings.map((b) => b.userId)).size;

  const handleSaveRevenueShare = async () => {
    const val = parseInt(gymShareInput);
    if (isNaN(val) || val < 0 || val > 100) {
      Alert.alert("Invalid", "Enter a value between 0 and 100");
      return;
    }
    await setGlobalRevenueShare(val);
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert("Saved", `Platform split updated: Gyms get ${val}%, Platform gets ${100 - val}%`);
  };

  return (
    <View style={[styles.container, { backgroundColor: bg }]}>
      <View style={[styles.header, { paddingTop: Platform.OS === "web" ? 67 : insets.top + 12, backgroundColor: bg, borderBottomColor: border }]}>
        <View style={styles.headerTop}>
          <View>
            <Text style={[styles.headerLabel, { color: textSec, fontFamily: "Inter_400Regular" }]}>Admin Console</Text>
            <Text style={[styles.headerTitle, { color: text, fontFamily: "Inter_700Bold" }]}>GymPass</Text>
          </View>
          <Pressable
            style={styles.switchRoleBtn}
            onPress={() => {
              Alert.alert("Switch Role", "Switch to member view?", [
                { text: "Cancel", style: "cancel" },
                {
                  text: "Switch",
                  onPress: async () => {
                    await switchRole("user");
                    router.replace("/(tabs)");
                  },
                },
              ]);
            }}
          >
            <Ionicons name="swap-horizontal" size={18} color="#F97316" />
          </Pressable>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.sectionTabs}
        >
          {ADMIN_SECTIONS.map((s) => (
            <Pressable
              key={s}
              style={[styles.sectionTab, activeSection === s && styles.sectionTabActive]}
              onPress={() => {
                setActiveSection(s);
                Haptics.selectionAsync();
              }}
            >
              <Text
                style={[
                  styles.sectionTabText,
                  { color: activeSection === s ? "#fff" : textSec, fontFamily: "Inter_500Medium" },
                ]}
              >
                {s}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 20, paddingBottom: Platform.OS === "web" ? 60 : insets.bottom + 40, gap: 20 }}
      >
        {activeSection === "Overview" && (
          <>
            <Animated.View entering={FadeInDown.delay(0).springify()} style={styles.metricsGrid}>
              {[
                { label: "Total Revenue", value: `$${(totalRevenue / 100).toFixed(0)}`, icon: "cash-outline" as const, color: "#22C55E" },
                { label: "Platform Earnings", value: `$${(platformRevenue / 100).toFixed(0)}`, icon: "trending-up-outline" as const, color: "#F97316" },
                { label: "Total Bookings", value: `${totalBookings}`, icon: "ticket-outline" as const, color: "#3B82F6" },
                { label: "Active Users", value: `${activeUsers}`, icon: "people-outline" as const, color: "#A855F7" },
                { label: "Gyms Listed", value: `${gyms.length}`, icon: "business-outline" as const, color: "#14B8A6" },
                { label: "Check-ins", value: `${checkedInCount}`, icon: "enter-outline" as const, color: "#F59E0B" },
              ].map((metric) => (
                <View key={metric.label} style={[styles.metricCard, { backgroundColor: card, borderColor: border }]}>
                  <View style={[styles.metricIcon, { backgroundColor: metric.color + "18" }]}>
                    <Ionicons name={metric.icon} size={18} color={metric.color} />
                  </View>
                  <Text style={[styles.metricValue, { color: text, fontFamily: "Inter_700Bold" }]}>{metric.value}</Text>
                  <Text style={[styles.metricLabel, { color: textSec, fontFamily: "Inter_400Regular" }]}>{metric.label}</Text>
                </View>
              ))}
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(100).springify()} style={[styles.analyticsCard, { backgroundColor: card, borderColor: border }]}>
              <Text style={[styles.analyticsTitle, { color: text, fontFamily: "Inter_700Bold" }]}>Analytics</Text>
              <Text style={[styles.analyticsSubtitle, { color: textSec, fontFamily: "Inter_400Regular" }]}>
                Connect your BI dashboard to the analytics API endpoints
              </Text>
              {[
                { label: "GET /api/analytics/revenue", desc: "Total revenue over period" },
                { label: "GET /api/analytics/visits", desc: "Visit count per gym" },
                { label: "GET /api/analytics/churn", desc: "User retention metrics" },
              ].map((ep) => (
                <View key={ep.label} style={[styles.endpointRow, { backgroundColor: isDark ? "#18181B" : "#F4F4F5" }]}>
                  <Text style={[styles.endpointMethod, { fontFamily: "Inter_600SemiBold" }]}>{ep.label}</Text>
                  <Text style={[styles.endpointDesc, { color: textSec, fontFamily: "Inter_400Regular" }]}>{ep.desc}</Text>
                </View>
              ))}
            </Animated.View>
          </>
        )}

        {activeSection === "Gyms" && (
          <Animated.View entering={FadeInDown.delay(0).springify()} style={{ gap: 12 }}>
            {gyms.map((gym, i) => (
              <Animated.View key={gym.id} entering={FadeInDown.delay(i * 50).springify()}>
                <View style={[styles.gymRow, { backgroundColor: card, borderColor: border }]}>
                  <View style={[styles.gymRowIcon, { backgroundColor: gym.gradientStart }]}>
                    <View style={[StyleSheet.absoluteFill, { backgroundColor: gym.gradientEnd + "44" }]} />
                    <Ionicons name="barbell-outline" size={20} color="#fff" />
                  </View>
                  <View style={styles.gymRowInfo}>
                    <Text style={[styles.gymRowName, { color: text, fontFamily: "Inter_600SemiBold" }]}>
                      {gym.name}
                    </Text>
                    <Text style={[styles.gymRowMeta, { color: textSec, fontFamily: "Inter_400Regular" }]}>
                      {gym.category} · {gym.neighborhood}
                    </Text>
                  </View>
                  <View style={styles.gymRowRight}>
                    <Text style={[styles.gymRowShare, { fontFamily: "Inter_700Bold" }]}>
                      {gym.revenueShare}%
                    </Text>
                    <Text style={[styles.gymRowShareLabel, { color: textSec, fontFamily: "Inter_400Regular" }]}>
                      gym split
                    </Text>
                  </View>
                </View>
              </Animated.View>
            ))}
          </Animated.View>
        )}

        {activeSection === "Revenue" && (
          <Animated.View entering={FadeInDown.delay(0).springify()} style={{ gap: 16 }}>
            <View style={[styles.revCard, { backgroundColor: card, borderColor: border }]}>
              <Text style={[styles.revCardTitle, { color: text, fontFamily: "Inter_700Bold" }]}>Platform Revenue</Text>
              <Text style={[styles.revCardAmount, { fontFamily: "Inter_700Bold" }]}>
                ${(platformRevenue / 100).toFixed(2)}
              </Text>
              <Text style={[styles.revCardSub, { color: textSec, fontFamily: "Inter_400Regular" }]}>
                From {revenueEntries.length} transactions
              </Text>
            </View>
            {revenueEntries.slice(0, 10).map((r, i) => (
              <Animated.View key={r.bookingId} entering={FadeInDown.delay(i * 40).springify()}>
                <View style={[styles.revRow, { backgroundColor: card, borderColor: border }]}>
                  <View style={styles.revRowInfo}>
                    <Text style={[styles.revRowGym, { color: text, fontFamily: "Inter_600SemiBold" }]}>{r.gymName}</Text>
                    <Text style={[styles.revRowId, { color: textSec, fontFamily: "Inter_400Regular" }]}>
                      #{r.bookingId.slice(-6).toUpperCase()}
                    </Text>
                  </View>
                  <View style={styles.revRowAmounts}>
                    <Text style={[styles.revRowPlatform, { fontFamily: "Inter_700Bold" }]}>
                      +${(r.platformShare / 100).toFixed(2)}
                    </Text>
                    <Text style={[styles.revRowGross, { color: textSec, fontFamily: "Inter_400Regular" }]}>
                      ${(r.amount / 100).toFixed(2)} gross
                    </Text>
                  </View>
                </View>
              </Animated.View>
            ))}
            {revenueEntries.length === 0 && (
              <View style={[styles.emptyCard, { backgroundColor: surface }]}>
                <Ionicons name="receipt-outline" size={36} color={textSec} />
                <Text style={[styles.emptyText, { color: textSec, fontFamily: "Inter_400Regular" }]}>
                  No revenue data yet
                </Text>
              </View>
            )}
          </Animated.View>
        )}

        {activeSection === "Payouts" && (
          <Animated.View entering={FadeInDown.delay(0).springify()} style={{ gap: 20 }}>
            <View style={[styles.payoutCard, { backgroundColor: card, borderColor: border }]}>
              <Text style={[styles.payoutTitle, { color: text, fontFamily: "Inter_700Bold" }]}>
                Global Revenue Split
              </Text>
              <Text style={[styles.payoutSubtitle, { color: textSec, fontFamily: "Inter_400Regular" }]}>
                Set the default percentage that gyms receive from each booking. Individual gyms can override this.
              </Text>
              <View style={styles.splitInputRow}>
                <View style={[styles.splitInput, { backgroundColor: surface, borderColor: border }]}>
                  <Text style={[styles.splitInputLabel, { color: textSec, fontFamily: "Inter_400Regular" }]}>Gym %</Text>
                  <TextInput
                    style={[styles.splitInputValue, { color: text, fontFamily: "Inter_700Bold" }]}
                    value={gymShareInput}
                    onChangeText={setGymShareInput}
                    keyboardType="number-pad"
                    maxLength={3}
                  />
                </View>
                <View style={[styles.splitDisplay, { backgroundColor: surface }]}>
                  <Text style={[styles.splitDisplayLabel, { color: textSec, fontFamily: "Inter_400Regular" }]}>Platform %</Text>
                  <Text style={[styles.splitDisplayValue, { color: "#F97316", fontFamily: "Inter_700Bold" }]}>
                    {Math.max(0, 100 - (parseInt(gymShareInput) || 0))}
                  </Text>
                </View>
              </View>
              <Pressable style={styles.saveBtn} onPress={handleSaveRevenueShare}>
                <Text style={[styles.saveBtnText, { fontFamily: "Inter_600SemiBold" }]}>Save Split</Text>
              </Pressable>
            </View>

            <View style={[styles.payoutCard, { backgroundColor: card, borderColor: border }]}>
              <Text style={[styles.payoutTitle, { color: text, fontFamily: "Inter_700Bold" }]}>Payout Schedule</Text>
              {[
                { label: "Weekly Payout", icon: "calendar-outline" as const, color: "#22C55E", active: true },
                { label: "Monthly Payout", icon: "calendar-clear-outline" as const, color: "#3B82F6", active: false },
                { label: "Instant Payout", icon: "flash-outline" as const, color: "#F59E0B", active: false },
              ].map((opt) => (
                <Pressable
                  key={opt.label}
                  style={[styles.payoutOption, { backgroundColor: opt.active ? "#22C55E18" : surface, borderColor: opt.active ? "#22C55E44" : "transparent" }]}
                  onPress={() => Haptics.selectionAsync()}
                >
                  <Ionicons name={opt.icon} size={20} color={opt.color} />
                  <Text style={[styles.payoutOptionText, { color: text, fontFamily: "Inter_500Medium" }]}>{opt.label}</Text>
                  {opt.active && (
                    <View style={styles.activeDot}>
                      <Ionicons name="checkmark-circle" size={20} color="#22C55E" />
                    </View>
                  )}
                </Pressable>
              ))}
            </View>

            <Pressable
              style={[styles.disputeBtn, { backgroundColor: card, borderColor: border }]}
              onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
            >
              <Ionicons name="alert-circle-outline" size={20} color="#EF4444" />
              <Text style={[styles.disputeBtnText, { color: "#EF4444", fontFamily: "Inter_600SemiBold" }]}>
                Dispute Management
              </Text>
              <Ionicons name="chevron-forward" size={16} color="#EF4444" style={{ marginLeft: "auto" }} />
            </Pressable>
          </Animated.View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { borderBottomWidth: 1 },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingHorizontal: 20,
    paddingBottom: 14,
  },
  headerLabel: { fontSize: 13 },
  headerTitle: { fontSize: 26, letterSpacing: -0.6 },
  switchRoleBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "#F9731618",
    alignItems: "center",
    justifyContent: "center",
  },
  sectionTabs: { paddingHorizontal: 20, gap: 8, paddingBottom: 14 },
  sectionTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "transparent",
  },
  sectionTabActive: { backgroundColor: "#F97316" },
  sectionTabText: { fontSize: 14 },
  metricsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  metricCard: {
    width: "47%",
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    gap: 6,
  },
  metricIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  metricValue: { fontSize: 22 },
  metricLabel: { fontSize: 12 },
  analyticsCard: { borderRadius: 20, borderWidth: 1, padding: 20, gap: 16 },
  analyticsTitle: { fontSize: 18 },
  analyticsSubtitle: { fontSize: 14, lineHeight: 20 },
  endpointRow: { borderRadius: 12, padding: 12, gap: 4 },
  endpointMethod: { fontSize: 12, color: "#22C55E" },
  endpointDesc: { fontSize: 12 },
  gymRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
  },
  gymRowIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    position: "relative",
  },
  gymRowInfo: { flex: 1 },
  gymRowName: { fontSize: 15 },
  gymRowMeta: { fontSize: 12 },
  gymRowRight: { alignItems: "flex-end" },
  gymRowShare: { fontSize: 18, color: "#22C55E" },
  gymRowShareLabel: { fontSize: 11 },
  revCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 20,
    alignItems: "center",
    gap: 8,
  },
  revCardTitle: { fontSize: 16 },
  revCardAmount: { fontSize: 36, color: "#F97316" },
  revCardSub: { fontSize: 13 },
  revRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
  },
  revRowInfo: { flex: 1 },
  revRowGym: { fontSize: 14 },
  revRowId: { fontSize: 12 },
  revRowAmounts: { alignItems: "flex-end" },
  revRowPlatform: { fontSize: 15, color: "#F97316" },
  revRowGross: { fontSize: 12 },
  emptyCard: { borderRadius: 16, padding: 32, alignItems: "center", gap: 10 },
  emptyText: { fontSize: 14 },
  payoutCard: { borderRadius: 20, borderWidth: 1, padding: 20, gap: 16 },
  payoutTitle: { fontSize: 18 },
  payoutSubtitle: { fontSize: 14, lineHeight: 20 },
  splitInputRow: { flexDirection: "row", gap: 12 },
  splitInput: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 1.5,
    padding: 16,
    gap: 4,
  },
  splitInputLabel: { fontSize: 12 },
  splitInputValue: { fontSize: 28 },
  splitDisplay: { flex: 1, borderRadius: 14, padding: 16, gap: 4 },
  splitDisplayLabel: { fontSize: 12 },
  splitDisplayValue: { fontSize: 28 },
  saveBtn: {
    backgroundColor: "#F97316",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
  },
  saveBtnText: { color: "#fff", fontSize: 15 },
  payoutOption: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1.5,
  },
  payoutOptionText: { fontSize: 15 },
  activeDot: { marginLeft: "auto" },
  disputeBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  disputeBtnText: { fontSize: 15 },
});
