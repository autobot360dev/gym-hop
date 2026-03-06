import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  useColorScheme,
  Share,
  Animated as RNAnimated,
  Image,
  ScrollView,
  Platform,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import QRCode from "react-native-qrcode-svg";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import { useData } from "@/contexts/DataContext";

export default function QRScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const { bookings } = useData();

  const bg = isDark ? "#09090B" : "#F2F2F7";
  const card = isDark ? "#1C1C1E" : "#FFFFFF";
  const border = isDark ? "#2C2C2E" : "#E4E4E7";
  const text = isDark ? "#FAFAFA" : "#09090B";
  const textSec = isDark ? "#A1A1AA" : "#71717A";

  const booking = bookings.find((b) => b.id === id);

  const pulseAnim = useRef(new RNAnimated.Value(1)).current;

  useEffect(() => {
    if (booking?.status === "confirmed") {
      const pulse = RNAnimated.loop(
        RNAnimated.sequence([
          RNAnimated.timing(pulseAnim, { toValue: 1.03, duration: 1000, useNativeDriver: true }),
          RNAnimated.timing(pulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    }
  }, [booking?.status]);

  if (!booking) {
    return (
      <View style={[styles.container, { backgroundColor: bg, alignItems: "center", justifyContent: "center" }]}>
        <Text style={{ color: text }}>Booking not found</Text>
      </View>
    );
  }

  const dateObj = new Date(booking.date);
  const formattedDate = dateObj.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  const isCheckedIn = booking.status === "checked_in";
  const statusColor = isCheckedIn ? "#22C55E" : "#F97316";

  const qrData = JSON.stringify({
    bookingId: booking.id,
    qrCode: booking.qrCode,
    gymId: booking.gymId,
    userId: booking.userId,
    date: booking.date,
    time: booking.time,
  });

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
        <Pressable
          style={[styles.headerBtn, { backgroundColor: isDark ? "#1C1C1E" : "#FFFFFF", borderColor: border }]}
          onPress={() => router.back()}
        >
          <Ionicons name="chevron-back" size={20} color={text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: text, fontFamily: "Inter_700Bold" }]}>Your Pass</Text>
        <Pressable
          style={[styles.headerBtn, { backgroundColor: isDark ? "#1C1C1E" : "#FFFFFF", borderColor: border }]}
          onPress={async () => {
            await Share.share({ message: `GymPass for ${booking.gymName} on ${formattedDate} at ${booking.time}` });
          }}
        >
          <Ionicons name="share-outline" size={20} color={text} />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Platform.OS === "web" ? 118 : insets.bottom + 32 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInDown.delay(60).springify()}>
          <View style={[styles.passCard, { backgroundColor: card, borderColor: border }]}>
            <View style={styles.passHeader}>
              {booking.gymImageUrl ? (
                <Image
                  source={{ uri: booking.gymImageUrl }}
                  style={StyleSheet.absoluteFillObject}
                  resizeMode="cover"
                />
              ) : (
                <View style={[StyleSheet.absoluteFillObject, { backgroundColor: booking.gymGradientStart }]} />
              )}
              <View style={styles.passHeaderOverlay} />
              <View style={styles.passHeaderContent}>
                <View>
                  <Text style={[styles.passGymLabel, { fontFamily: "Inter_400Regular" }]}>
                    YOUR PASS FOR
                  </Text>
                  <Text style={[styles.passGymName, { fontFamily: "Inter_700Bold" }]}>{booking.gymName}</Text>
                </View>
                <View style={[styles.passStatusBadge, { backgroundColor: isCheckedIn ? "#22C55E" : "#F97316" }]}>
                  <View style={styles.statusDot} />
                  <Text style={[styles.passStatusText, { fontFamily: "Inter_600SemiBold" }]}>
                    {isCheckedIn ? "Checked In" : "Ready to Use"}
                  </Text>
                </View>
              </View>
            </View>

            <View style={[styles.perforationRow, { backgroundColor: isDark ? "#09090B" : "#F2F2F7" }]}>
              <View style={[styles.notchLeft, { backgroundColor: isDark ? "#09090B" : "#F2F2F7" }]} />
              {Array.from({ length: 20 }).map((_, i) => (
                <View key={i} style={[styles.dashDot, { backgroundColor: isDark ? "#2C2C2E" : "#E4E4E7" }]} />
              ))}
              <View style={[styles.notchRight, { backgroundColor: isDark ? "#09090B" : "#F2F2F7" }]} />
            </View>

            <View style={styles.passBody}>
              <View style={styles.passInfoGrid}>
                <View style={styles.passInfoItem}>
                  <Text style={[styles.passInfoLabel, { color: textSec, fontFamily: "Inter_400Regular" }]}>DATE</Text>
                  <Text style={[styles.passInfoValue, { color: text, fontFamily: "Inter_600SemiBold" }]}>
                    {dateObj.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </Text>
                </View>
                <View style={[styles.passInfoDivider, { backgroundColor: border }]} />
                <View style={styles.passInfoItem}>
                  <Text style={[styles.passInfoLabel, { color: textSec, fontFamily: "Inter_400Regular" }]}>TIME</Text>
                  <Text style={[styles.passInfoValue, { color: text, fontFamily: "Inter_600SemiBold" }]}>
                    {booking.time}
                  </Text>
                </View>
                <View style={[styles.passInfoDivider, { backgroundColor: border }]} />
                <View style={styles.passInfoItem}>
                  <Text style={[styles.passInfoLabel, { color: textSec, fontFamily: "Inter_400Regular" }]}>DURATION</Text>
                  <Text style={[styles.passInfoValue, { color: text, fontFamily: "Inter_600SemiBold" }]}>
                    {booking.duration}m
                  </Text>
                </View>
                <View style={[styles.passInfoDivider, { backgroundColor: border }]} />
                <View style={styles.passInfoItem}>
                  <Text style={[styles.passInfoLabel, { color: textSec, fontFamily: "Inter_400Regular" }]}>PAID</Text>
                  <Text style={[styles.passInfoValue, { color: "#F97316", fontFamily: "Inter_700Bold" }]}>
                    ${(booking.amount / 100).toFixed(0)}
                  </Text>
                </View>
              </View>

              <Animated.View entering={FadeIn.delay(200)} style={styles.qrSection}>
                <RNAnimated.View style={{ transform: [{ scale: isCheckedIn ? 1 : pulseAnim }] }}>
                  <View style={[styles.qrWrapper, { backgroundColor: "#FFFFFF", borderColor: statusColor + "40" }]}>
                    <QRCode
                      value={qrData}
                      size={190}
                      color="#000000"
                      backgroundColor="#FFFFFF"
                      quietZone={10}
                    />
                    {isCheckedIn && (
                      <View style={styles.checkedInOverlay}>
                        <View style={styles.checkedInCircle}>
                          <Ionicons name="checkmark" size={44} color="#fff" />
                        </View>
                        <Text style={[styles.checkedInLabel, { fontFamily: "Inter_700Bold" }]}>
                          Checked In!
                        </Text>
                      </View>
                    )}
                  </View>
                </RNAnimated.View>

                <Text style={[styles.qrInstruction, { color: textSec, fontFamily: "Inter_400Regular" }]}>
                  {isCheckedIn
                    ? "You have successfully checked in. Enjoy your session!"
                    : "Show this QR code to staff at the gym entrance"}
                </Text>
                <View style={[styles.qrCodeRow, { backgroundColor: isDark ? "#2C2C2E" : "#F4F4F5" }]}>
                  <Ionicons name="shield-checkmark-outline" size={14} color={textSec} />
                  <Text style={[styles.qrCodeText, { color: textSec, fontFamily: "Inter_400Regular" }]}>
                    {booking.qrCode.slice(0, 16).toUpperCase()}
                  </Text>
                </View>
              </Animated.View>
            </View>
          </View>
        </Animated.View>

        {!isCheckedIn && (
          <Animated.View entering={FadeInDown.delay(200).springify()}>
            <View style={[styles.tipsCard, { backgroundColor: card, borderColor: border }]}>
              <Text style={[styles.tipsTitle, { color: text, fontFamily: "Inter_700Bold" }]}>
                How to check in
              </Text>
              {[
                { icon: "phone-portrait-outline" as const, text: "Keep this screen open when you arrive at the gym" },
                { icon: "scan-outline" as const, text: "Staff will scan your QR code at the entrance" },
                { icon: "checkmark-circle-outline" as const, text: "Your visit is logged automatically in real-time" },
              ].map((tip, i) => (
                <View key={i} style={styles.tipRow}>
                  <View style={[styles.tipIcon, { backgroundColor: "#FFF7ED" }]}>
                    <Ionicons name={tip.icon} size={16} color="#F97316" />
                  </View>
                  <Text style={[styles.tipText, { color: textSec, fontFamily: "Inter_400Regular" }]}>
                    {tip.text}
                  </Text>
                </View>
              ))}
            </View>
          </Animated.View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  headerBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  headerTitle: { fontSize: 18 },
  scrollContent: { paddingHorizontal: 16, gap: 14 },
  passCard: {
    borderRadius: 24,
    borderWidth: 1,
    overflow: "hidden",
  },
  passHeader: { height: 150, position: "relative", backgroundColor: "#1C1C1E" },
  passHeaderOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.55)",
  },
  passHeaderContent: {
    ...StyleSheet.absoluteFillObject,
    padding: 20,
    justifyContent: "space-between",
    flexDirection: "row",
    alignItems: "flex-end",
  },
  passGymLabel: { color: "rgba(255,255,255,0.6)", fontSize: 10, letterSpacing: 1.5, marginBottom: 4 },
  passGymName: { color: "#fff", fontSize: 24, letterSpacing: -0.5 },
  passStatusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: "flex-end",
  },
  statusDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "rgba(255,255,255,0.8)" },
  passStatusText: { color: "#fff", fontSize: 12 },
  perforationRow: {
    flexDirection: "row",
    alignItems: "center",
    height: 24,
    paddingHorizontal: 0,
    overflow: "hidden",
  },
  notchLeft: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginLeft: -12,
  },
  notchRight: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: -12,
  },
  dashDot: {
    flex: 1,
    height: 1.5,
    marginHorizontal: 2,
    borderRadius: 1,
  },
  passBody: { padding: 20, gap: 20 },
  passInfoGrid: {
    flexDirection: "row",
    alignItems: "center",
  },
  passInfoItem: { flex: 1, alignItems: "center", gap: 4 },
  passInfoLabel: { fontSize: 10, letterSpacing: 1.2 },
  passInfoValue: { fontSize: 16 },
  passInfoDivider: { width: 1, height: 32 },
  qrSection: { alignItems: "center", gap: 16 },
  qrWrapper: {
    padding: 16,
    borderRadius: 20,
    borderWidth: 2,
    position: "relative",
  },
  checkedInOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(34, 197, 94, 0.9)",
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  checkedInCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#22C55E",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 4,
    borderColor: "rgba(255,255,255,0.4)",
  },
  checkedInLabel: { color: "#fff", fontSize: 18 },
  qrInstruction: { fontSize: 14, textAlign: "center", lineHeight: 20 },
  qrCodeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  qrCodeText: { fontSize: 11, letterSpacing: 1.5 },
  tipsCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 20,
    gap: 14,
  },
  tipsTitle: { fontSize: 17 },
  tipRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  tipIcon: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  tipText: { flex: 1, fontSize: 14, lineHeight: 20 },
});
