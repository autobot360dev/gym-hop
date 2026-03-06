import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  useColorScheme,
  Platform,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, { FadeIn } from "react-native-reanimated";
import { useData, Booking } from "@/contexts/DataContext";
import { useAuth } from "@/contexts/AuthContext";
import { CameraView, useCameraPermissions } from "expo-camera";

function PersonalQRPrompt() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const { user } = useAuth();
  const { getUserBookings } = useData();
  const insets = useSafeAreaInsets();

  const bg = isDark ? "#09090B" : "#FAFAFA";
  const text = isDark ? "#FAFAFA" : "#09090B";
  const textSec = isDark ? "#A1A1AA" : "#71717A";
  const surface = isDark ? "#18181B" : "#F4F4F5";

  const activeBookings = user
    ? getUserBookings(user.id).filter((b) => b.status === "confirmed")
    : [];

  return (
    <View style={[styles.container, { backgroundColor: bg }]}>
      <View style={{ paddingTop: Platform.OS === "web" ? 67 : insets.top + 12, paddingHorizontal: 20 }}>
        <Text style={[styles.headerTitle, { color: text, fontFamily: "Inter_700Bold" }]}>QR Pass</Text>
        <Text style={[styles.headerSubtitle, { color: textSec, fontFamily: "Inter_400Regular" }]}>
          Show your pass at the gym entrance
        </Text>
      </View>

      {activeBookings.length === 0 ? (
        <View style={styles.emptyState}>
          <View style={[styles.emptyIcon, { backgroundColor: surface }]}>
            <Ionicons name="qr-code-outline" size={52} color={textSec} />
          </View>
          <Text style={[styles.emptyTitle, { color: text, fontFamily: "Inter_600SemiBold" }]}>
            No active passes
          </Text>
          <Text style={[styles.emptyText, { color: textSec, fontFamily: "Inter_400Regular" }]}>
            Book a gym session to get your QR pass
          </Text>
          <Pressable
            style={styles.bookBtn}
            onPress={() => router.push("/(tabs)")}
          >
            <Text style={[styles.bookBtnText, { fontFamily: "Inter_600SemiBold" }]}>
              Find a Gym
            </Text>
          </Pressable>
        </View>
      ) : (
        <View style={[styles.passesContainer, { paddingBottom: insets.bottom + 100 }]}>
          {activeBookings.map((booking) => (
            <Pressable
              key={booking.id}
              style={[styles.passCard, { backgroundColor: booking.gymGradientStart, borderColor: booking.gymGradientEnd + "66" }]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.push({ pathname: "/qr/[id]", params: { id: booking.id } });
              }}
            >
              <View style={[styles.passOverlay, { backgroundColor: booking.gymGradientEnd + "33" }]} />
              <View style={styles.passContent}>
                <View>
                  <Text style={[styles.passGymName, { fontFamily: "Inter_700Bold" }]}>{booking.gymName}</Text>
                  <Text style={[styles.passDateTime, { fontFamily: "Inter_400Regular" }]}>
                    {new Date(booking.date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                    {" · "}{booking.time}
                  </Text>
                </View>
                <View style={styles.passRight}>
                  <View style={styles.qrIconWrap}>
                    <Ionicons name="qr-code" size={36} color="#fff" />
                  </View>
                  <Text style={[styles.tapText, { fontFamily: "Inter_400Regular" }]}>Tap to open</Text>
                </View>
              </View>
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}

export default function ScanScreen() {
  return <PersonalQRPrompt />;
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerTitle: { fontSize: 28, letterSpacing: -0.6, marginBottom: 4 },
  headerSubtitle: { fontSize: 15 },
  emptyState: { flex: 1, alignItems: "center", justifyContent: "center", gap: 16, paddingHorizontal: 40 },
  emptyIcon: { width: 100, height: 100, borderRadius: 30, alignItems: "center", justifyContent: "center" },
  emptyTitle: { fontSize: 20 },
  emptyText: { fontSize: 15, textAlign: "center", lineHeight: 22 },
  bookBtn: {
    backgroundColor: "#F97316",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 14,
    marginTop: 4,
  },
  bookBtnText: { color: "#fff", fontSize: 15 },
  passesContainer: { padding: 20, gap: 16 },
  passCard: {
    borderRadius: 24,
    overflow: "hidden",
    borderWidth: 1,
    height: 140,
    position: "relative",
  },
  passOverlay: { ...StyleSheet.absoluteFillObject },
  passContent: {
    ...StyleSheet.absoluteFillObject,
    padding: 24,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  passGymName: { color: "#fff", fontSize: 20, marginBottom: 4 },
  passDateTime: { color: "rgba(255,255,255,0.75)", fontSize: 14 },
  passRight: { alignItems: "center", gap: 6 },
  qrIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  tapText: { color: "rgba(255,255,255,0.75)", fontSize: 11 },
});
