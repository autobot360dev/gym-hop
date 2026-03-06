import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  useColorScheme,
  Image,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";

const COUNTRY_CODES = [
  { code: "+1", flag: "🇺🇸", name: "US" },
  { code: "+44", flag: "🇬🇧", name: "UK" },
  { code: "+91", flag: "🇮🇳", name: "IN" },
  { code: "+61", flag: "🇦🇺", name: "AU" },
  { code: "+65", flag: "🇸🇬", name: "SG" },
  { code: "+971", flag: "🇦🇪", name: "AE" },
];

const SPLASH_IMAGE = "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80";

export default function PhoneScreen() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const [phone, setPhone] = useState("");
  const [countryCode, setCountryCode] = useState("+1");
  const [isLoading, setIsLoading] = useState(false);
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const inputRef = useRef<TextInput>(null);

  const formatPhone = (raw: string) => {
    const digits = raw.replace(/\D/g, "").slice(0, 10);
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  };

  const rawDigits = phone.replace(/\D/g, "");
  const isValid = rawDigits.length === 10;

  const handleContinue = async () => {
    if (!isValid) return;
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 900));
    setIsLoading(false);
    router.push({
      pathname: "/(auth)/otp",
      params: { phone: `${countryCode}${rawDigits}` },
    });
  };

  const selectedCountry = COUNTRY_CODES.find((c) => c.code === countryCode) || COUNTRY_CODES[0];

  return (
    <View style={styles.container}>
      <View style={styles.heroSection}>
        <Image source={{ uri: SPLASH_IMAGE }} style={styles.heroImage} resizeMode="cover" />
        <View style={styles.heroOverlay} />
        <View style={[styles.heroContent, { paddingTop: Platform.OS === "web" ? 80 : insets.top + 20 }]}>
          <View style={styles.logoRow}>
            <View style={styles.logoIcon}>
              <Ionicons name="flash" size={22} color="#fff" />
            </View>
            <Text style={[styles.logoText, { fontFamily: "Inter_700Bold" }]}>GymPass</Text>
          </View>
          <View style={styles.heroText}>
            <Text style={[styles.heroTitle, { fontFamily: "Inter_700Bold" }]}>
              Your city's gyms,{"\n"}one pass away.
            </Text>
            <Text style={[styles.heroSubtitle, { fontFamily: "Inter_400Regular" }]}>
              Book any session, check in with a QR code, track every visit.
            </Text>
          </View>
        </View>
      </View>

      <View style={[styles.formSection, { backgroundColor: isDark ? "#09090B" : "#FFFFFF" }]}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          <View style={[styles.formInner, { paddingBottom: Math.max(insets.bottom, 24) + 8 }]}>
            <Animated.View entering={FadeInDown.delay(100).springify()}>
              <Text style={[styles.formTitle, { color: isDark ? "#FAFAFA" : "#09090B", fontFamily: "Inter_700Bold" }]}>
                Enter your number
              </Text>
              <Text style={[styles.formSubtitle, { color: isDark ? "#A1A1AA" : "#71717A", fontFamily: "Inter_400Regular" }]}>
                We'll send a one-time code to verify
              </Text>
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(160).springify()} style={styles.form}>
              <View style={[styles.inputRow, {
                backgroundColor: isDark ? "#1C1C1E" : "#F4F4F5",
                borderColor: isDark ? "#2C2C2E" : "#E4E4E7",
              }]}>
                <Pressable
                  style={[styles.countryBtn, { borderRightColor: isDark ? "#2C2C2E" : "#E4E4E7" }]}
                  onPress={() => setShowCountryPicker(!showCountryPicker)}
                >
                  <Text style={styles.countryFlag}>{selectedCountry.flag}</Text>
                  <Text style={[styles.countryCode, { color: isDark ? "#FAFAFA" : "#09090B", fontFamily: "Inter_600SemiBold" }]}>
                    {countryCode}
                  </Text>
                  <Ionicons name="chevron-down" size={14} color={isDark ? "#A1A1AA" : "#71717A"} />
                </Pressable>
                <TextInput
                  ref={inputRef}
                  style={[styles.phoneInput, { color: isDark ? "#FAFAFA" : "#09090B", fontFamily: "Inter_500Medium" }]}
                  placeholder="(555) 000-0000"
                  placeholderTextColor={isDark ? "#52525B" : "#A1A1AA"}
                  keyboardType="phone-pad"
                  value={phone}
                  onChangeText={(t) => setPhone(formatPhone(t))}
                  autoFocus
                  maxLength={14}
                />
                {phone.length > 0 && (
                  <Pressable onPress={() => setPhone("")} style={{ paddingRight: 16 }}>
                    <Ionicons name="close-circle" size={18} color={isDark ? "#52525B" : "#A1A1AA"} />
                  </Pressable>
                )}
              </View>

              {showCountryPicker && (
                <View style={[styles.countryDropdown, {
                  backgroundColor: isDark ? "#1C1C1E" : "#FFFFFF",
                  borderColor: isDark ? "#2C2C2E" : "#E4E4E7",
                }]}>
                  {COUNTRY_CODES.map((c) => (
                    <Pressable
                      key={c.code}
                      style={[styles.countryOption, { borderBottomColor: isDark ? "#2C2C2E" : "#F4F4F5" }]}
                      onPress={() => {
                        setCountryCode(c.code);
                        setShowCountryPicker(false);
                        Haptics.selectionAsync();
                      }}
                    >
                      <Text style={styles.countryFlag}>{c.flag}</Text>
                      <Text style={[styles.countryOptionName, { color: isDark ? "#FAFAFA" : "#09090B", fontFamily: "Inter_500Medium" }]}>
                        {c.name}
                      </Text>
                      <Text style={[styles.countryOptionCode, { color: isDark ? "#A1A1AA" : "#71717A", fontFamily: "Inter_400Regular" }]}>
                        {c.code}
                      </Text>
                      {c.code === countryCode && (
                        <Ionicons name="checkmark" size={16} color="#F97316" />
                      )}
                    </Pressable>
                  ))}
                </View>
              )}

              <Pressable
                style={[styles.continueBtn, { opacity: isValid ? 1 : 0.4 }]}
                onPress={handleContinue}
                disabled={!isValid || isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Text style={[styles.continueBtnText, { fontFamily: "Inter_600SemiBold" }]}>
                      Send Code
                    </Text>
                    <Ionicons name="arrow-forward" size={18} color="#fff" />
                  </>
                )}
              </Pressable>
            </Animated.View>

            <Animated.View entering={FadeInUp.delay(300).springify()}>
              <View style={styles.demoHint}>
                <Ionicons name="information-circle-outline" size={16} color={isDark ? "#52525B" : "#A1A1AA"} />
                <Text style={[styles.demoHintText, { color: isDark ? "#52525B" : "#A1A1AA", fontFamily: "Inter_400Regular" }]}>
                  Demo: Enter any phone number, then use OTP <Text style={{ fontFamily: "Inter_700Bold" }}>123456</Text>
                </Text>
              </View>
            </Animated.View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  heroSection: { height: 280, position: "relative", backgroundColor: "#1C1C1E" },
  heroImage: { ...StyleSheet.absoluteFillObject as any },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject as any,
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  heroContent: {
    ...StyleSheet.absoluteFillObject as any,
    padding: 24,
    justifyContent: "space-between",
  },
  logoRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  logoIcon: {
    width: 38,
    height: 38,
    borderRadius: 11,
    backgroundColor: "#F97316",
    alignItems: "center",
    justifyContent: "center",
  },
  logoText: { fontSize: 20, color: "#fff", letterSpacing: -0.4 },
  heroText: { gap: 8 },
  heroTitle: { fontSize: 30, color: "#fff", letterSpacing: -0.8, lineHeight: 36 },
  heroSubtitle: { fontSize: 15, color: "rgba(255,255,255,0.75)", lineHeight: 22 },
  formSection: { flex: 1, borderTopLeftRadius: 28, borderTopRightRadius: 28, marginTop: -24 },
  formInner: { flex: 1, paddingHorizontal: 24, paddingTop: 32, gap: 20, justifyContent: "space-between" },
  formTitle: { fontSize: 26, letterSpacing: -0.6, marginBottom: 6 },
  formSubtitle: { fontSize: 15 },
  form: { gap: 14 },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 16,
    borderWidth: 1.5,
    overflow: "hidden",
    height: 58,
  },
  countryBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    borderRightWidth: 1.5,
    height: "100%",
  },
  countryFlag: { fontSize: 20 },
  countryCode: { fontSize: 15 },
  phoneInput: { flex: 1, paddingHorizontal: 16, fontSize: 18, height: "100%" },
  countryDropdown: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
  },
  countryOption: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderBottomWidth: 1,
  },
  countryOptionName: { flex: 1, fontSize: 15 },
  countryOptionCode: { fontSize: 14 },
  continueBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#F97316",
    borderRadius: 16,
    height: 56,
  },
  continueBtnText: { color: "#fff", fontSize: 17 },
  demoHint: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    padding: 12,
  },
  demoHintText: { flex: 1, fontSize: 13, lineHeight: 18 },
});
