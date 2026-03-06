import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  useColorScheme,
  Alert,
  ActivityIndicator,
  Image,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, { FadeInDown, SlideInUp } from "react-native-reanimated";
import { useData } from "@/contexts/DataContext";
import { useAuth } from "@/contexts/AuthContext";

function generateId() {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}

function getDatesForWeek() {
  const dates = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    dates.push(d);
  }
  return dates;
}

export default function GymDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const { getGym, getTimeSlots, createBooking } = useData();
  const { user } = useAuth();

  const bg = isDark ? "#09090B" : "#F2F2F7";
  const card = isDark ? "#1C1C1E" : "#FFFFFF";
  const border = isDark ? "#2C2C2E" : "#E4E4E7";
  const surface = isDark ? "#2C2C2E" : "#F4F4F5";
  const text = isDark ? "#FAFAFA" : "#09090B";
  const textSec = isDark ? "#A1A1AA" : "#71717A";

  const gym = getGym(id || "");
  const dates = getDatesForWeek();
  const [selectedDateIdx, setSelectedDateIdx] = useState(0);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [isBooking, setIsBooking] = useState(false);
  const [showPayment, setShowPayment] = useState(false);

  if (!gym) {
    return (
      <View style={[styles.container, { backgroundColor: bg, alignItems: "center", justifyContent: "center" }]}>
        <Text style={{ color: text }}>Gym not found</Text>
      </View>
    );
  }

  const selectedDate = dates[selectedDateIdx];
  const dateStr = selectedDate.toISOString().split("T")[0];
  const slots = getTimeSlots(gym.id, dateStr);

  const handleBook = async () => {
    if (!selectedSlot || !user) return;
    setShowPayment(true);
  };

  const handleConfirmPayment = async () => {
    if (!selectedSlot || !user) return;
    const slot = slots.find((s) => s.id === selectedSlot);
    if (!slot) return;

    setIsBooking(true);
    await new Promise((r) => setTimeout(r, 1500));

    const qrCode = generateId();
    const booking = await createBooking({
      userId: user.id,
      gymId: gym.id,
      gymName: gym.name,
      gymGradientStart: gym.gradientStart,
      gymGradientEnd: gym.gradientEnd,
      gymImageUrl: gym.imageUrl,
      slotId: slot.id,
      date: dateStr,
      time: slot.time,
      duration: slot.duration,
      status: "confirmed",
      qrCode,
      amount: gym.pricePerSession,
    });

    setIsBooking(false);
    setShowPayment(false);
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.replace({ pathname: "/qr/[id]", params: { id: booking.id } });
  };

  const availableSlots = slots.filter((s) => s.bookedCount < s.capacity);
  const selectedSlotData = slots.find((s) => s.id === selectedSlot);

  return (
    <View style={[styles.container, { backgroundColor: bg }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        <View style={styles.heroBanner}>
          <Image
            source={{ uri: gym.imageUrl }}
            style={StyleSheet.absoluteFillObject}
            resizeMode="cover"
          />
          <View style={[styles.heroOverlay, { backgroundColor: gym.gradientStart + "99" }]} />
          <View style={styles.heroGradientBottom} />

          <View style={[styles.heroContent, { paddingTop: insets.top + 8 }]}>
            <Pressable style={styles.backBtn} onPress={() => router.back()}>
              <Ionicons name="chevron-back" size={22} color="#fff" />
            </Pressable>
            <View style={styles.heroInfo}>
              <View style={[styles.heroCategoryBadge, { borderColor: "rgba(255,255,255,0.3)" }]}>
                <Text style={[styles.heroCategoryText, { fontFamily: "Inter_600SemiBold" }]}>
                  {gym.category}
                </Text>
              </View>
              <Text style={[styles.heroName, { fontFamily: "Inter_700Bold" }]}>{gym.name}</Text>
              <View style={styles.heroMeta}>
                <View style={styles.heroMetaItem}>
                  <Ionicons name="star" size={14} color="#F59E0B" />
                  <Text style={[styles.heroMetaText, { fontFamily: "Inter_600SemiBold" }]}>
                    {gym.rating}
                  </Text>
                  <Text style={[styles.heroMetaText, { fontFamily: "Inter_400Regular", opacity: 0.8 }]}>
                    ({gym.reviewCount} reviews)
                  </Text>
                </View>
                <View style={styles.heroMetaDot} />
                <View style={styles.heroMetaItem}>
                  <Ionicons name="location-outline" size={14} color="rgba(255,255,255,0.8)" />
                  <Text style={[styles.heroMetaText, { fontFamily: "Inter_400Regular" }]}>
                    {gym.neighborhood}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.bodyContent}>
          <Animated.View entering={FadeInDown.delay(60).springify()} style={styles.quickInfoRow}>
            <View style={[styles.quickInfoCard, { backgroundColor: card, borderColor: border }]}>
              <View style={[styles.quickInfoIcon, { backgroundColor: "#FFF7ED" }]}>
                <Ionicons name="cash-outline" size={18} color="#F97316" />
              </View>
              <Text style={[styles.quickInfoValue, { color: "#F97316", fontFamily: "Inter_700Bold" }]}>
                ${(gym.pricePerSession / 100).toFixed(0)}
              </Text>
              <Text style={[styles.quickInfoLabel, { color: textSec, fontFamily: "Inter_400Regular" }]}>Per session</Text>
            </View>
            <View style={[styles.quickInfoCard, { backgroundColor: card, borderColor: border }]}>
              <View style={[styles.quickInfoIcon, { backgroundColor: "#EFF6FF" }]}>
                <Ionicons name="people-outline" size={18} color="#3B82F6" />
              </View>
              <Text style={[styles.quickInfoValue, { color: text, fontFamily: "Inter_700Bold" }]}>
                {gym.capacity}
              </Text>
              <Text style={[styles.quickInfoLabel, { color: textSec, fontFamily: "Inter_400Regular" }]}>Capacity</Text>
            </View>
            <View style={[styles.quickInfoCard, { backgroundColor: card, borderColor: border }]}>
              <View style={[styles.quickInfoIcon, { backgroundColor: gym.isOpen ? "#F0FDF4" : "#FEF2F2" }]}>
                <View style={[styles.openDot, { backgroundColor: gym.isOpen ? "#22C55E" : "#EF4444" }]} />
              </View>
              <Text style={[styles.quickInfoValue, { color: text, fontFamily: "Inter_700Bold" }]}>
                {gym.isOpen ? "Open" : "Closed"}
              </Text>
              <Text style={[styles.quickInfoLabel, { color: textSec, fontFamily: "Inter_400Regular" }]}>
                Until {gym.closeTime}
              </Text>
            </View>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(100).springify()} style={[styles.section, { backgroundColor: card, borderColor: border }]}>
            <Text style={[styles.sectionTitle, { color: text, fontFamily: "Inter_700Bold" }]}>About</Text>
            <Text style={[styles.descriptionText, { color: textSec, fontFamily: "Inter_400Regular" }]}>
              {gym.description}
            </Text>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(140).springify()} style={[styles.section, { backgroundColor: card, borderColor: border }]}>
            <Text style={[styles.sectionTitle, { color: text, fontFamily: "Inter_700Bold" }]}>Amenities</Text>
            <View style={styles.amenitiesGrid}>
              {gym.amenities.map((amenity) => (
                <View key={amenity} style={[styles.amenityItem, { backgroundColor: isDark ? "#2C2C2E" : "#F4F4F5" }]}>
                  <Ionicons name="checkmark-circle" size={15} color="#22C55E" />
                  <Text style={[styles.amenityItemText, { color: text, fontFamily: "Inter_400Regular" }]}>
                    {amenity}
                  </Text>
                </View>
              ))}
            </View>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(180).springify()} style={[styles.section, { backgroundColor: card, borderColor: border }]}>
            <Text style={[styles.sectionTitle, { color: text, fontFamily: "Inter_700Bold" }]}>Choose a date</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.datesRow}>
              {dates.map((date, idx) => {
                const isSelected = selectedDateIdx === idx;
                const isToday = idx === 0;
                const dayName = isToday ? "Today" : date.toLocaleDateString("en-US", { weekday: "short" });
                const dayNum = date.getDate();
                const monthName = date.toLocaleDateString("en-US", { month: "short" });
                return (
                  <Pressable
                    key={idx}
                    style={[
                      styles.dateChip,
                      {
                        backgroundColor: isSelected ? "#F97316" : isDark ? "#2C2C2E" : "#F4F4F5",
                        borderColor: isSelected ? "#F97316" : "transparent",
                      },
                    ]}
                    onPress={() => {
                      setSelectedDateIdx(idx);
                      setSelectedSlot(null);
                      Haptics.selectionAsync();
                    }}
                  >
                    <Text
                      style={[
                        styles.dateDay,
                        { color: isSelected ? "rgba(255,255,255,0.85)" : textSec, fontFamily: "Inter_500Medium" },
                      ]}
                    >
                      {dayName}
                    </Text>
                    <Text
                      style={[
                        styles.dateNum,
                        { color: isSelected ? "#fff" : text, fontFamily: "Inter_700Bold" },
                      ]}
                    >
                      {dayNum}
                    </Text>
                    <Text
                      style={[
                        styles.dateMonth,
                        { color: isSelected ? "rgba(255,255,255,0.7)" : textSec, fontFamily: "Inter_400Regular" },
                      ]}
                    >
                      {monthName}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(220).springify()} style={[styles.section, { backgroundColor: card, borderColor: border }]}>
            <View style={styles.slotsHeader}>
              <Text style={[styles.sectionTitle, { color: text, fontFamily: "Inter_700Bold" }]}>
                Available slots
              </Text>
              <View style={[styles.slotCountBadge, { backgroundColor: "#FFF7ED" }]}>
                <Text style={[styles.slotCountText, { fontFamily: "Inter_600SemiBold" }]}>
                  {availableSlots.length} open
                </Text>
              </View>
            </View>
            <View style={styles.slotsGrid}>
              {slots.map((slot) => {
                const isFull = slot.bookedCount >= slot.capacity;
                const isSelected = selectedSlot === slot.id;
                const fillPct = Math.min((slot.bookedCount / slot.capacity) * 100, 100);
                const spotsLeft = slot.capacity - slot.bookedCount;
                const isAlmostFull = spotsLeft <= 3 && !isFull;
                return (
                  <Pressable
                    key={slot.id}
                    style={[
                      styles.slotBtn,
                      {
                        backgroundColor: isSelected ? "#F97316" : isFull ? (isDark ? "#1C1C1E" : "#F9FAFB") : card,
                        borderColor: isSelected ? "#F97316" : isAlmostFull ? "#F59E0B" : border,
                        opacity: isFull ? 0.4 : 1,
                        borderWidth: isSelected || isAlmostFull ? 2 : 1,
                      },
                    ]}
                    onPress={() => {
                      if (isFull) return;
                      setSelectedSlot(isSelected ? null : slot.id);
                      Haptics.selectionAsync();
                    }}
                    disabled={isFull}
                  >
                    <Text
                      style={[
                        styles.slotTime,
                        { color: isSelected ? "#fff" : isFull ? textSec : text, fontFamily: "Inter_600SemiBold" },
                      ]}
                    >
                      {slot.time}
                    </Text>
                    <Text
                      style={[
                        styles.slotAvail,
                        {
                          color: isSelected ? "rgba(255,255,255,0.75)" : isAlmostFull ? "#F59E0B" : textSec,
                          fontFamily: "Inter_400Regular",
                        },
                      ]}
                    >
                      {isFull ? "Full" : isAlmostFull ? `${spotsLeft} left!` : `${spotsLeft} spots`}
                    </Text>
                    {!isFull && (
                      <View style={[styles.slotFillBar, { backgroundColor: isSelected ? "rgba(255,255,255,0.25)" : isDark ? "#2C2C2E" : "#F4F4F5" }]}>
                        <View
                          style={[
                            styles.slotFillProgress,
                            {
                              width: `${fillPct}%` as any,
                              backgroundColor: isSelected ? "rgba(255,255,255,0.8)" : isAlmostFull ? "#F59E0B" : "#F97316",
                            },
                          ]}
                        />
                      </View>
                    )}
                  </Pressable>
                );
              })}
            </View>
          </Animated.View>
        </View>
      </ScrollView>

      {selectedSlot && (
        <Animated.View
          entering={SlideInUp.springify()}
          style={[styles.bookingFooter, { backgroundColor: card, borderTopColor: border, paddingBottom: Math.max(insets.bottom, 16) + 4 }]}
        >
          <View style={styles.bookingFooterInfo}>
            <Text style={[styles.footerGymName, { color: text, fontFamily: "Inter_700Bold" }]}>{gym.name}</Text>
            <Text style={[styles.footerSlotTime, { color: textSec, fontFamily: "Inter_400Regular" }]}>
              {selectedDate.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })} · {selectedSlotData?.time} · 60 min
            </Text>
          </View>
          <View style={styles.bookingFooterRight}>
            <View>
              <Text style={[styles.footerPrice, { fontFamily: "Inter_700Bold" }]}>
                ${(gym.pricePerSession / 100).toFixed(0)}
              </Text>
            </View>
            <Pressable style={styles.bookNowBtn} onPress={handleBook}>
              <Ionicons name="flash" size={16} color="#fff" />
              <Text style={[styles.bookNowText, { fontFamily: "Inter_600SemiBold" }]}>Book Now</Text>
            </Pressable>
          </View>
        </Animated.View>
      )}

      {showPayment && (
        <View style={styles.paymentOverlay}>
          <Pressable style={styles.paymentBackdrop} onPress={() => !isBooking && setShowPayment(false)} />
          <Animated.View
            entering={SlideInUp.springify()}
            style={[styles.paymentSheet, { backgroundColor: card, paddingBottom: Math.max(insets.bottom, 20) + 8 }]}
          >
            <View style={styles.paymentHandle} />
            <Text style={[styles.paymentTitle, { color: text, fontFamily: "Inter_700Bold" }]}>Confirm Booking</Text>

            <View style={[styles.gymPreview, { backgroundColor: isDark ? "#2C2C2E" : "#F4F4F5", borderColor: border }]}>
              <Image source={{ uri: gym.imageUrl }} style={styles.gymPreviewImage} resizeMode="cover" />
              <View style={styles.gymPreviewInfo}>
                <Text style={[styles.gymPreviewName, { color: text, fontFamily: "Inter_700Bold" }]}>{gym.name}</Text>
                <Text style={[styles.gymPreviewMeta, { color: textSec, fontFamily: "Inter_400Regular" }]}>
                  {gym.neighborhood}
                </Text>
              </View>
              <View style={[styles.gymPreviewRating, { backgroundColor: "#FEF3C7" }]}>
                <Ionicons name="star" size={11} color="#F59E0B" />
                <Text style={[styles.gymPreviewRatingText, { fontFamily: "Inter_700Bold" }]}>{gym.rating}</Text>
              </View>
            </View>

            <View style={[styles.paymentSummary, { backgroundColor: isDark ? "#2C2C2E" : "#F4F4F5", borderColor: border }]}>
              <View style={styles.paymentRow}>
                <Text style={[styles.paymentLabel, { color: textSec, fontFamily: "Inter_400Regular" }]}>Date & Time</Text>
                <Text style={[styles.paymentValue, { color: text, fontFamily: "Inter_600SemiBold" }]}>
                  {selectedDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })} · {selectedSlotData?.time}
                </Text>
              </View>
              <View style={[styles.paymentDivider, { backgroundColor: border }]} />
              <View style={styles.paymentRow}>
                <Text style={[styles.paymentLabel, { color: textSec, fontFamily: "Inter_400Regular" }]}>Duration</Text>
                <Text style={[styles.paymentValue, { color: text, fontFamily: "Inter_600SemiBold" }]}>60 minutes</Text>
              </View>
              <View style={[styles.paymentDivider, { backgroundColor: border }]} />
              <View style={styles.paymentRow}>
                <Text style={[styles.paymentLabel, { color: textSec, fontFamily: "Inter_400Regular" }]}>Payment</Text>
                <View style={styles.paymentCardRow}>
                  <Ionicons name="card" size={16} color={textSec} />
                  <Text style={[styles.paymentValue, { color: text, fontFamily: "Inter_600SemiBold" }]}>•••• 4242</Text>
                </View>
              </View>
            </View>

            <View style={[styles.totalRow, { borderTopColor: border }]}>
              <Text style={[styles.totalLabel, { color: textSec, fontFamily: "Inter_400Regular" }]}>Total charged</Text>
              <Text style={[styles.totalAmount, { fontFamily: "Inter_700Bold" }]}>
                ${(gym.pricePerSession / 100).toFixed(2)}
              </Text>
            </View>

            <Pressable
              style={[styles.confirmBtn, { opacity: isBooking ? 0.8 : 1 }]}
              onPress={handleConfirmPayment}
              disabled={isBooking}
            >
              {isBooking ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Ionicons name="flash" size={18} color="#fff" />
                  <Text style={[styles.confirmBtnText, { fontFamily: "Inter_700Bold" }]}>
                    Pay & Get QR Pass
                  </Text>
                </>
              )}
            </Pressable>
          </Animated.View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  heroBanner: { height: 320, position: "relative", backgroundColor: "#1C1C1E" },
  heroOverlay: { ...StyleSheet.absoluteFillObject },
  heroGradientBottom: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 160,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  heroContent: {
    ...StyleSheet.absoluteFillObject,
    padding: 20,
    justifyContent: "space-between",
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(0,0,0,0.45)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
  },
  heroInfo: { gap: 8 },
  heroCategoryBadge: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(0,0,0,0.45)",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
  },
  heroCategoryText: { color: "#fff", fontSize: 12 },
  heroName: { color: "#fff", fontSize: 30, letterSpacing: -0.8 },
  heroMeta: { flexDirection: "row", alignItems: "center", gap: 8 },
  heroMetaItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  heroMetaText: { color: "rgba(255,255,255,0.9)", fontSize: 14 },
  heroMetaDot: { width: 3, height: 3, borderRadius: 1.5, backgroundColor: "rgba(255,255,255,0.4)" },
  bodyContent: { padding: 16, gap: 14 },
  quickInfoRow: { flexDirection: "row", gap: 10 },
  quickInfoCard: {
    flex: 1,
    padding: 14,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: "center",
    gap: 4,
  },
  quickInfoIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 2,
  },
  openDot: { width: 10, height: 10, borderRadius: 5 },
  quickInfoValue: { fontSize: 17 },
  quickInfoLabel: { fontSize: 11 },
  section: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 18,
    gap: 14,
  },
  sectionTitle: { fontSize: 17 },
  descriptionText: { fontSize: 15, lineHeight: 24 },
  amenitiesGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  amenityItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  amenityItemText: { fontSize: 13 },
  datesRow: { gap: 8, paddingVertical: 4 },
  dateChip: {
    width: 62,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 2,
    alignItems: "center",
    gap: 2,
  },
  dateDay: { fontSize: 11 },
  dateNum: { fontSize: 20 },
  dateMonth: { fontSize: 10 },
  slotsHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  slotCountBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  slotCountText: { fontSize: 12, color: "#F97316" },
  slotsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  slotBtn: {
    width: "30%",
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
    gap: 4,
    overflow: "hidden",
  },
  slotTime: { fontSize: 15 },
  slotAvail: { fontSize: 11 },
  slotFillBar: { height: 3, borderRadius: 2, overflow: "hidden", marginTop: 4 },
  slotFillProgress: { height: "100%", borderRadius: 2 },
  bookingFooter: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 16,
    borderTopWidth: 1,
  },
  bookingFooterInfo: { flex: 1 },
  footerGymName: { fontSize: 16 },
  footerSlotTime: { fontSize: 13, marginTop: 2 },
  bookingFooterRight: { flexDirection: "row", alignItems: "center", gap: 14 },
  footerPrice: { fontSize: 22, color: "#F97316" },
  bookNowBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#F97316",
    paddingHorizontal: 20,
    paddingVertical: 13,
    borderRadius: 14,
  },
  bookNowText: { color: "#fff", fontSize: 15 },
  paymentOverlay: { ...StyleSheet.absoluteFillObject, justifyContent: "flex-end" },
  paymentBackdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.65)" },
  paymentSheet: {
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 24,
    gap: 18,
  },
  paymentHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#3F3F46",
    alignSelf: "center",
    marginBottom: 4,
  },
  paymentTitle: { fontSize: 24, letterSpacing: -0.6 },
  gymPreview: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
  },
  gymPreviewImage: {
    width: 52,
    height: 52,
    borderRadius: 12,
  },
  gymPreviewInfo: { flex: 1 },
  gymPreviewName: { fontSize: 15 },
  gymPreviewMeta: { fontSize: 13, marginTop: 2 },
  gymPreviewRating: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderRadius: 10,
  },
  gymPreviewRatingText: { fontSize: 12, color: "#B45309" },
  paymentSummary: { borderRadius: 16, borderWidth: 1, overflow: "hidden" },
  paymentRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 14,
  },
  paymentLabel: { fontSize: 14 },
  paymentValue: { fontSize: 14 },
  paymentDivider: { height: 1 },
  paymentCardRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 16,
    borderTopWidth: 1,
  },
  totalLabel: { fontSize: 15 },
  totalAmount: { fontSize: 26, color: "#F97316" },
  confirmBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#F97316",
    borderRadius: 18,
    height: 58,
  },
  confirmBtnText: { color: "#fff", fontSize: 17 },
});
