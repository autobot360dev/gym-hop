import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  ActivityIndicator,
  useColorScheme,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, { FadeInDown, useAnimatedStyle, useSharedValue, withSequence, withTiming } from "react-native-reanimated";
import { useAuth } from "@/contexts/AuthContext";

const DEMO_OTP = "123456";
const CODE_LENGTH = 6;

export default function OtpScreen() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const { phone } = useLocalSearchParams<{ phone: string }>();
  const { login } = useAuth();

  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [resendTimer, setResendTimer] = useState(30);
  const inputRef = useRef<TextInput>(null);
  const shakeX = useSharedValue(0);

  const bg = isDark ? "#09090B" : "#FAFAFA";
  const card = isDark ? "#27272A" : "#FFFFFF";
  const border = isDark ? "#3F3F46" : "#E4E4E7";
  const text = isDark ? "#FAFAFA" : "#09090B";
  const textSec = isDark ? "#A1A1AA" : "#52525B";

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer((t) => t - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const shakeStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shakeX.value }],
  }));

  const triggerShake = () => {
    shakeX.value = withSequence(
      withTiming(-10, { duration: 50 }),
      withTiming(10, { duration: 50 }),
      withTiming(-8, { duration: 50 }),
      withTiming(8, { duration: 50 }),
      withTiming(0, { duration: 50 })
    );
  };

  const handleChange = async (val: string) => {
    const digits = val.replace(/\D/g, "").slice(0, CODE_LENGTH);
    setCode(digits);
    setError("");
    if (digits.length === CODE_LENGTH) {
      await verify(digits);
    }
  };

  const verify = async (digits: string) => {
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    if (digits !== DEMO_OTP) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      triggerShake();
      setError("Incorrect code. Try 123456");
      setCode("");
      setIsLoading(false);
      return;
    }
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await login(phone || "+15550000000");
    router.dismissAll();
    router.replace("/(tabs)");
  };

  const formatPhone = (p: string) => {
    if (!p) return "";
    const digits = p.replace(/\D/g, "");
    if (digits.length === 11) {
      return `+${digits[0]} (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
    }
    return p;
  };

  return (
    <View style={[styles.container, { backgroundColor: bg }]}>
      <View style={[styles.inner, { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 20 }]}>
        <Pressable
          style={styles.backBtn}
          onPress={() => router.back()}
        >
          <Ionicons name="chevron-back" size={24} color={text} />
        </Pressable>

        <Animated.View entering={FadeInDown.delay(100).springify()} style={styles.header}>
          <View style={styles.iconWrap}>
            <Ionicons name="shield-checkmark" size={32} color="#F97316" />
          </View>
          <Text style={[styles.title, { color: text, fontFamily: "Inter_700Bold" }]}>
            Verify your number
          </Text>
          <Text style={[styles.subtitle, { color: textSec, fontFamily: "Inter_400Regular" }]}>
            Enter the 6-digit code sent to{"\n"}
            <Text style={{ color: text, fontFamily: "Inter_600SemiBold" }}>
              {formatPhone(phone)}
            </Text>
          </Text>
          <Text style={[styles.demoNote, { fontFamily: "Inter_400Regular" }]}>
            Demo: use code 123456
          </Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200).springify()} style={{ gap: 24 }}>
          <Animated.View style={shakeStyle}>
            <Pressable
              style={styles.codeInputWrap}
              onPress={() => inputRef.current?.focus()}
            >
              {Array.from({ length: CODE_LENGTH }).map((_, i) => (
                <View
                  key={i}
                  style={[
                    styles.codeBox,
                    {
                      backgroundColor: card,
                      borderColor: error
                        ? "#EF4444"
                        : code.length === i
                        ? "#F97316"
                        : border,
                      borderWidth: code.length === i ? 2 : 1.5,
                    },
                  ]}
                >
                  <Text style={[styles.codeDigit, { color: text, fontFamily: "Inter_700Bold" }]}>
                    {code[i] || ""}
                  </Text>
                </View>
              ))}
            </Pressable>
          </Animated.View>

          {error ? (
            <Text style={[styles.errorText, { fontFamily: "Inter_500Medium" }]}>{error}</Text>
          ) : null}

          {isLoading && (
            <View style={styles.loadingRow}>
              <ActivityIndicator size="small" color="#F97316" />
              <Text style={[styles.loadingText, { color: textSec, fontFamily: "Inter_400Regular" }]}>
                Verifying...
              </Text>
            </View>
          )}

          <TextInput
            ref={inputRef}
            style={styles.hiddenInput}
            keyboardType="number-pad"
            value={code}
            onChangeText={handleChange}
            maxLength={CODE_LENGTH}
            autoFocus
            caretHidden
          />
        </Animated.View>

        <View style={styles.resendRow}>
          {resendTimer > 0 ? (
            <Text style={[styles.resendText, { color: textSec, fontFamily: "Inter_400Regular" }]}>
              Resend code in{" "}
              <Text style={{ color: text, fontFamily: "Inter_600SemiBold" }}>0:{resendTimer.toString().padStart(2, "0")}</Text>
            </Text>
          ) : (
            <Pressable
              onPress={() => {
                setResendTimer(30);
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
            >
              <Text style={[styles.resendText, { color: "#F97316", fontFamily: "Inter_600SemiBold" }]}>
                Resend code
              </Text>
            </Pressable>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  inner: { flex: 1, paddingHorizontal: 24, gap: 40 },
  backBtn: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: -8,
  },
  header: { gap: 12 },
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: "#1C1917",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  title: { fontSize: 28, letterSpacing: -0.6 },
  subtitle: { fontSize: 16, lineHeight: 24 },
  demoNote: {
    fontSize: 12,
    color: "#F97316",
    marginTop: 4,
  },
  codeInputWrap: { flexDirection: "row", gap: 10, justifyContent: "center" },
  codeBox: {
    width: 50,
    height: 58,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  codeDigit: { fontSize: 24 },
  hiddenInput: {
    position: "absolute",
    opacity: 0,
    width: 1,
    height: 1,
  },
  errorText: { textAlign: "center", color: "#EF4444", fontSize: 14 },
  loadingRow: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
  loadingText: { fontSize: 14 },
  resendRow: { alignItems: "center", flex: 1, justifyContent: "flex-end" },
  resendText: { fontSize: 15 },
});
