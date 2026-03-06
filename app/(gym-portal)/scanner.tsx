import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  useColorScheme,
  Platform,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, { FadeInDown, FadeIn } from "react-native-reanimated";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useData } from "@/contexts/DataContext";

export default function ScannerScreen() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const { checkInBooking } = useData();
  const [permission, requestPermission] = useCameraPermissions();
  const [isScanning, setIsScanning] = useState(true);
  const [lastScanned, setLastScanned] = useState<string | null>(null);
  const [checkInResult, setCheckInResult] = useState<"success" | "error" | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const bg = isDark ? "#09090B" : "#FAFAFA";
  const text = isDark ? "#FAFAFA" : "#09090B";
  const textSec = isDark ? "#A1A1AA" : "#71717A";
  const card = isDark ? "#27272A" : "#FFFFFF";
  const border = isDark ? "#3F3F46" : "#E4E4E7";

  const handleScan = async ({ data }: { data: string }) => {
    if (!isScanning || isProcessing || data === lastScanned) return;
    setIsScanning(false);
    setIsProcessing(true);
    setLastScanned(data);

    try {
      let qrCode = data;
      try {
        const parsed = JSON.parse(data);
        qrCode = parsed.qrCode || data;
      } catch {}

      const success = await checkInBooking("", qrCode);
      await Haptics.notificationAsync(
        success ? Haptics.NotificationFeedbackType.Success : Haptics.NotificationFeedbackType.Error
      );
      setCheckInResult(success ? "success" : "error");
    } catch {
      setCheckInResult("error");
    } finally {
      setIsProcessing(false);
    }

    setTimeout(() => {
      setCheckInResult(null);
      setIsScanning(true);
      setLastScanned(null);
    }, 3000);
  };

  if (!permission) {
    return (
      <View style={[styles.container, { backgroundColor: bg, alignItems: "center", justifyContent: "center" }]}>
        <ActivityIndicator size="large" color="#22C55E" />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={[styles.container, { backgroundColor: bg }]}>
        <View style={[styles.permissionContent, { paddingTop: Platform.OS === "web" ? 67 : insets.top + 12 }]}>
          <Animated.View entering={FadeInDown.delay(0).springify()} style={styles.permHeader}>
            <Text style={[styles.permTitle, { color: text, fontFamily: "Inter_700Bold" }]}>Camera Access</Text>
            <Text style={[styles.permSubtitle, { color: textSec, fontFamily: "Inter_400Regular" }]}>
              Camera permission is required to scan member QR codes
            </Text>
          </Animated.View>
          <Pressable style={styles.permBtn} onPress={requestPermission}>
            <Text style={[styles.permBtnText, { fontFamily: "Inter_600SemiBold" }]}>Grant Permission</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: "#000" }]}>
      {Platform.OS !== "web" ? (
        <CameraView
          style={StyleSheet.absoluteFill}
          facing="back"
          barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
          onBarcodeScanned={isScanning ? handleScan : undefined}
        />
      ) : (
        <View style={[StyleSheet.absoluteFill, { backgroundColor: "#111", alignItems: "center", justifyContent: "center" }]}>
          <Ionicons name="camera-outline" size={64} color="#52525B" />
          <Text style={{ color: "#52525B", fontFamily: "Inter_400Regular", marginTop: 12 }}>Camera not available on web</Text>
        </View>
      )}

      <View style={[styles.overlay, { paddingTop: insets.top + 12 }]}>
        <View style={styles.scanHeader}>
          <Text style={[styles.scanTitle, { fontFamily: "Inter_700Bold" }]}>Scan Member QR</Text>
          <Text style={[styles.scanSubtitle, { fontFamily: "Inter_400Regular" }]}>
            Point camera at member's QR pass
          </Text>
        </View>

        <View style={styles.scanFrame}>
          <View style={[styles.corner, styles.topLeft]} />
          <View style={[styles.corner, styles.topRight]} />
          <View style={[styles.corner, styles.bottomLeft]} />
          <View style={[styles.corner, styles.bottomRight]} />
          {isProcessing && (
            <View style={styles.processingOverlay}>
              <ActivityIndicator size="large" color="#22C55E" />
            </View>
          )}
        </View>

        {checkInResult && (
          <Animated.View entering={FadeIn} style={styles.resultBanner}>
            <View
              style={[
                styles.resultCard,
                { backgroundColor: checkInResult === "success" ? "#22C55E" : "#EF4444" },
              ]}
            >
              <Ionicons
                name={checkInResult === "success" ? "checkmark-circle" : "close-circle"}
                size={32}
                color="#fff"
              />
              <View>
                <Text style={[styles.resultTitle, { fontFamily: "Inter_700Bold" }]}>
                  {checkInResult === "success" ? "Check-In Successful!" : "Invalid QR Code"}
                </Text>
                <Text style={[styles.resultSubtitle, { fontFamily: "Inter_400Regular" }]}>
                  {checkInResult === "success"
                    ? "Member has been checked in"
                    : "Could not verify this pass"}
                </Text>
              </View>
            </View>
          </Animated.View>
        )}

        <View style={[styles.scanFooter, { paddingBottom: insets.bottom + 20 }]}>
          <View style={[styles.tipRow, { backgroundColor: "rgba(0,0,0,0.6)" }]}>
            <Ionicons name="information-circle-outline" size={16} color="rgba(255,255,255,0.7)" />
            <Text style={[styles.tipText, { fontFamily: "Inter_400Regular" }]}>
              Auto-scans when QR code is detected
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  overlay: { flex: 1, justifyContent: "space-between" },
  scanHeader: { paddingHorizontal: 24, gap: 4 },
  scanTitle: { color: "#fff", fontSize: 24 },
  scanSubtitle: { color: "rgba(255,255,255,0.7)", fontSize: 14 },
  scanFrame: {
    width: 260,
    height: 260,
    alignSelf: "center",
    position: "relative",
  },
  corner: {
    position: "absolute",
    width: 32,
    height: 32,
    borderColor: "#22C55E",
    borderWidth: 3,
  },
  topLeft: { top: 0, left: 0, borderRightWidth: 0, borderBottomWidth: 0, borderTopLeftRadius: 8 },
  topRight: { top: 0, right: 0, borderLeftWidth: 0, borderBottomWidth: 0, borderTopRightRadius: 8 },
  bottomLeft: { bottom: 0, left: 0, borderRightWidth: 0, borderTopWidth: 0, borderBottomLeftRadius: 8 },
  bottomRight: { bottom: 0, right: 0, borderLeftWidth: 0, borderTopWidth: 0, borderBottomRightRadius: 8 },
  processingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 4,
  },
  resultBanner: { paddingHorizontal: 24 },
  resultCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 18,
    borderRadius: 20,
  },
  resultTitle: { color: "#fff", fontSize: 17 },
  resultSubtitle: { color: "rgba(255,255,255,0.8)", fontSize: 13 },
  scanFooter: { paddingHorizontal: 24 },
  tipRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 14,
    borderRadius: 14,
  },
  tipText: { color: "rgba(255,255,255,0.7)", fontSize: 13 },
  permissionContent: { flex: 1, paddingHorizontal: 24, gap: 32, justifyContent: "center" },
  permHeader: { gap: 12, alignItems: "center" },
  permTitle: { fontSize: 24 },
  permSubtitle: { fontSize: 15, textAlign: "center", lineHeight: 22 },
  permBtn: {
    backgroundColor: "#22C55E",
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
  },
  permBtnText: { color: "#fff", fontSize: 16 },
});
