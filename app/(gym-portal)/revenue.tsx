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
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useData, RevenueEntry } from "@/contexts/DataContext";

const GYM_ID = "gym_001";

const PERIODS = ["Week", "Month", "All Time"];

export default function RevenueScreen() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const { getGymRevenue, getGym } = useData();
  const [selectedPeriod, setSelectedPeriod] = useState("All Time");

  const bg = isDark ? "#09090B" : "#FAFAFA";
  const surface = isDark ? "#18181B" : "#F4F4F5";
  const card = isDark ? "#27272A" : "#FFFFFF";
  const border = isDark ? "#3F3F46" : "#E4E4E7";
  const text = isDark ? "#FAFAFA" : "#09090B";
  const textSec = isDark ? "#A1A1AA" : "#71717A";

  const gym = getGym(GYM_ID);
  const allRevenue = getGymRevenue(GYM_ID);

  const now = new Date();
  const filteredRevenue = allRevenue.filter((r) => {
    if (selectedPeriod === "All Time") return true;
    const d = new Date(r.date);
    if (selectedPeriod === "Week") {
      const weekAgo = new Date(now);
      weekAgo.setDate(now.getDate() - 7);
      return d >= weekAgo;
    }
    if (selectedPeriod === "Month") {
      const monthAgo = new Date(now);
      monthAgo.setMonth(now.getMonth() - 1);
      return d >= monthAgo;
    }
    return true;
  });

  const totalGross = filteredRevenue.reduce((s, r) => s + r.amount, 0);
  const totalGymShare = filteredRevenue.reduce((s, r) => s + r.gymShare, 0);
  const totalPlatform = filteredRevenue.reduce((s, r) => s + r.platformShare, 0);
  const paidOut = filteredRevenue.filter((r) => r.status === "paid").reduce((s, r) => s + r.gymShare, 0);
  const pending = filteredRevenue.filter((r) => r.status === "pending").reduce((s, r) => s + r.gymShare, 0);
  const gymSharePct = gym?.revenueShare || 80;
  const platformSharePct = 100 - gymSharePct;

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
        <Text style={[styles.headerTitle, { color: text, fontFamily: "Inter_700Bold" }]}>Revenue</Text>
        <View style={[styles.periodRow, { backgroundColor: surface }]}>
          {PERIODS.map((p) => (
            <Pressable
              key={p}
              style={[styles.periodBtn, selectedPeriod === p && styles.periodBtnActive]}
              onPress={() => {
                setSelectedPeriod(p);
                Haptics.selectionAsync();
              }}
            >
              <Text
                style={[
                  styles.periodBtnText,
                  { color: selectedPeriod === p ? "#fff" : textSec, fontFamily: "Inter_500Medium" },
                ]}
              >
                {p}
              </Text>
            </Pressable>
          ))}
        </View>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(80).springify()} style={styles.section}>
        <View style={[styles.grossCard, { borderColor: border }]}>
          <View style={[styles.grossCardBg, { backgroundColor: "#0A1628" }]} />
          <View style={[styles.grossCardOverlay, { backgroundColor: "#22C55E" + "18" }]} />
          <View style={styles.grossCardContent}>
            <Text style={[styles.grossLabel, { fontFamily: "Inter_400Regular" }]}>Your Earnings</Text>
            <Text style={[styles.grossValue, { fontFamily: "Inter_700Bold" }]}>
              ${(totalGymShare / 100).toFixed(2)}
            </Text>
            <View style={styles.grossRow}>
              <View style={styles.grossItem}>
                <Text style={[styles.grossItemLabel, { fontFamily: "Inter_400Regular" }]}>Paid Out</Text>
                <Text style={[styles.grossItemValue, { fontFamily: "Inter_600SemiBold" }]}>
                  ${(paidOut / 100).toFixed(2)}
                </Text>
              </View>
              <View style={styles.grossDivider} />
              <View style={styles.grossItem}>
                <Text style={[styles.grossItemLabel, { fontFamily: "Inter_400Regular" }]}>Pending</Text>
                <Text style={[styles.grossItemValue, { color: "#F59E0B", fontFamily: "Inter_600SemiBold" }]}>
                  ${(pending / 100).toFixed(2)}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(140).springify()} style={styles.section}>
        <Text style={[styles.sectionTitle, { color: text, fontFamily: "Inter_700Bold" }]}>Revenue Split</Text>
        <View style={[styles.splitCard, { backgroundColor: card, borderColor: border }]}>
          <View style={styles.splitRow}>
            <View style={styles.splitLeft}>
              <Text style={[styles.splitLabel, { color: text, fontFamily: "Inter_600SemiBold" }]}>
                {gym?.name || "Your Gym"}
              </Text>
              <Text style={[styles.splitPct, { color: "#22C55E", fontFamily: "Inter_700Bold" }]}>
                {gymSharePct}%
              </Text>
            </View>
            <View style={styles.splitBarContainer}>
              <View style={styles.splitBar}>
                <View style={[styles.splitBarFill, { width: `${gymSharePct}%` as any, backgroundColor: "#22C55E" }]} />
                <View style={[styles.splitBarRemainder, { width: `${platformSharePct}%` as any, backgroundColor: "#F97316" }]} />
              </View>
            </View>
            <View style={styles.splitRight}>
              <Text style={[styles.splitLabel, { color: textSec, fontFamily: "Inter_600SemiBold" }]}>
                Platform
              </Text>
              <Text style={[styles.splitPct, { color: "#F97316", fontFamily: "Inter_700Bold" }]}>
                {platformSharePct}%
              </Text>
            </View>
          </View>
          <View style={[styles.splitAmounts, { borderTopColor: border }]}>
            <View style={styles.splitAmountItem}>
              <Text style={[styles.splitAmountLabel, { color: textSec, fontFamily: "Inter_400Regular" }]}>Your share</Text>
              <Text style={[styles.splitAmountValue, { color: "#22C55E", fontFamily: "Inter_700Bold" }]}>
                ${(totalGymShare / 100).toFixed(2)}
              </Text>
            </View>
            <View style={[styles.splitAmountDivider, { backgroundColor: border }]} />
            <View style={styles.splitAmountItem}>
              <Text style={[styles.splitAmountLabel, { color: textSec, fontFamily: "Inter_400Regular" }]}>Platform share</Text>
              <Text style={[styles.splitAmountValue, { color: "#F97316", fontFamily: "Inter_700Bold" }]}>
                ${(totalPlatform / 100).toFixed(2)}
              </Text>
            </View>
            <View style={[styles.splitAmountDivider, { backgroundColor: border }]} />
            <View style={styles.splitAmountItem}>
              <Text style={[styles.splitAmountLabel, { color: textSec, fontFamily: "Inter_400Regular" }]}>Total gross</Text>
              <Text style={[styles.splitAmountValue, { color: text, fontFamily: "Inter_700Bold" }]}>
                ${(totalGross / 100).toFixed(2)}
              </Text>
            </View>
          </View>
        </View>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(200).springify()} style={styles.section}>
        <Text style={[styles.sectionTitle, { color: text, fontFamily: "Inter_700Bold" }]}>
          Transactions · {filteredRevenue.length}
        </Text>
        {filteredRevenue.length === 0 ? (
          <View style={[styles.emptyCard, { backgroundColor: surface }]}>
            <Ionicons name="receipt-outline" size={36} color={textSec} />
            <Text style={[styles.emptyText, { color: textSec, fontFamily: "Inter_400Regular" }]}>
              No transactions in this period
            </Text>
          </View>
        ) : (
          <View style={styles.transactionList}>
            {filteredRevenue.map((entry, i) => (
              <RevenueRow key={entry.bookingId} entry={entry} index={i} isDark={isDark} />
            ))}
          </View>
        )}
      </Animated.View>
    </ScrollView>
  );
}

function RevenueRow({ entry, index, isDark }: { entry: RevenueEntry; index: number; isDark: boolean }) {
  const card = isDark ? "#27272A" : "#FFFFFF";
  const border = isDark ? "#3F3F46" : "#E4E4E7";
  const text = isDark ? "#FAFAFA" : "#09090B";
  const textSec = isDark ? "#A1A1AA" : "#71717A";
  const isPaid = entry.status === "paid";
  const date = new Date(entry.date);
  const dateStr = date.toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });

  return (
    <Animated.View entering={FadeInDown.delay(index * 40).springify()}>
      <View style={[styles.transactionRow, { backgroundColor: card, borderColor: border }]}>
        <View style={[styles.transactionIcon, { backgroundColor: isPaid ? "#DCFCE7" : "#FEF9C3" }]}>
          <Ionicons name={isPaid ? "checkmark" : "time"} size={16} color={isPaid ? "#22C55E" : "#F59E0B"} />
        </View>
        <View style={styles.transactionInfo}>
          <Text style={[styles.transactionId, { color: text, fontFamily: "Inter_500Medium" }]}>
            Booking #{entry.bookingId.slice(-6).toUpperCase()}
          </Text>
          <Text style={[styles.transactionDate, { color: textSec, fontFamily: "Inter_400Regular" }]}>{dateStr}</Text>
        </View>
        <View style={styles.transactionAmounts}>
          <Text style={[styles.transactionGym, { fontFamily: "Inter_700Bold" }]}>
            +${(entry.gymShare / 100).toFixed(2)}
          </Text>
          <Text style={[styles.transactionTotal, { color: textSec, fontFamily: "Inter_400Regular" }]}>
            of ${(entry.amount / 100).toFixed(2)}
          </Text>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 20, gap: 16 },
  headerTitle: { fontSize: 28, letterSpacing: -0.6 },
  periodRow: { flexDirection: "row", borderRadius: 14, padding: 4, gap: 4 },
  periodBtn: { flex: 1, paddingVertical: 8, borderRadius: 10, alignItems: "center" },
  periodBtnActive: { backgroundColor: "#22C55E" },
  periodBtnText: { fontSize: 13 },
  section: { paddingHorizontal: 20, marginBottom: 24 },
  grossCard: {
    borderRadius: 24,
    borderWidth: 1,
    overflow: "hidden",
    height: 180,
    position: "relative",
  },
  grossCardBg: { ...StyleSheet.absoluteFillObject },
  grossCardOverlay: { ...StyleSheet.absoluteFillObject },
  grossCardContent: {
    ...StyleSheet.absoluteFillObject,
    padding: 24,
    justifyContent: "center",
    gap: 8,
  },
  grossLabel: { color: "rgba(255,255,255,0.7)", fontSize: 14 },
  grossValue: { color: "#22C55E", fontSize: 40 },
  grossRow: { flexDirection: "row", alignItems: "center", gap: 20, marginTop: 4 },
  grossItem: { gap: 2 },
  grossItemLabel: { color: "rgba(255,255,255,0.6)", fontSize: 12 },
  grossItemValue: { color: "#fff", fontSize: 16 },
  grossDivider: { width: 1, height: 32, backgroundColor: "rgba(255,255,255,0.2)" },
  sectionTitle: { fontSize: 18, marginBottom: 14 },
  splitCard: { borderRadius: 20, borderWidth: 1, overflow: "hidden" },
  splitRow: { flexDirection: "row", alignItems: "center", padding: 20, gap: 14 },
  splitLeft: { alignItems: "center", minWidth: 60 },
  splitRight: { alignItems: "center", minWidth: 60 },
  splitLabel: { fontSize: 12 },
  splitPct: { fontSize: 20 },
  splitBarContainer: { flex: 1 },
  splitBar: { height: 10, borderRadius: 5, flexDirection: "row", overflow: "hidden" },
  splitBarFill: { height: "100%" },
  splitBarRemainder: { height: "100%" },
  splitAmounts: { borderTopWidth: 1, padding: 16, gap: 0 },
  splitAmountItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
  },
  splitAmountDivider: { height: 1 },
  splitAmountLabel: { fontSize: 14 },
  splitAmountValue: { fontSize: 15 },
  emptyCard: { borderRadius: 16, padding: 32, alignItems: "center", gap: 10 },
  emptyText: { fontSize: 14 },
  transactionList: { gap: 10 },
  transactionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
  },
  transactionIcon: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  transactionInfo: { flex: 1 },
  transactionId: { fontSize: 14 },
  transactionDate: { fontSize: 12 },
  transactionAmounts: { alignItems: "flex-end" },
  transactionGym: { fontSize: 15, color: "#22C55E" },
  transactionTotal: { fontSize: 12 },
});
