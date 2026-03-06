import { isLiquidGlassAvailable } from "expo-glass-effect";
import { Tabs } from "expo-router";
import { NativeTabs, Icon, Label } from "expo-router/unstable-native-tabs";
import { BlurView } from "expo-blur";
import { Platform, StyleSheet, useColorScheme, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import React from "react";

function NativePortalTabs() {
  return (
    <NativeTabs>
      <NativeTabs.Trigger name="index">
        <Icon sf={{ default: "chart.bar", selected: "chart.bar.fill" }} />
        <Label>Dashboard</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="scanner">
        <Icon sf={{ default: "qrcode.viewfinder", selected: "qrcode.viewfinder" }} />
        <Label>Scanner</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="revenue">
        <Icon sf={{ default: "banknote", selected: "banknote.fill" }} />
        <Label>Revenue</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="gym-profile">
        <Icon sf={{ default: "building.2", selected: "building.2.fill" }} />
        <Label>Gym</Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}

function ClassicPortalTabs() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const isIOS = Platform.OS === "ios";
  const isWeb = Platform.OS === "web";

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#22C55E",
        tabBarInactiveTintColor: isDark ? "#71717A" : "#A1A1AA",
        tabBarStyle: {
          position: "absolute",
          backgroundColor: isIOS ? "transparent" : isDark ? "#09090B" : "#FFFFFF",
          borderTopWidth: isWeb ? 1 : 0,
          borderTopColor: isDark ? "#27272A" : "#E4E4E7",
          elevation: 0,
          ...(isWeb ? { height: 84 } : {}),
        },
        tabBarBackground: () =>
          isIOS ? (
            <BlurView intensity={100} tint={isDark ? "dark" : "light"} style={StyleSheet.absoluteFill} />
          ) : isWeb ? (
            <View style={[StyleSheet.absoluteFill, { backgroundColor: isDark ? "#09090B" : "#FFFFFF" }]} />
          ) : null,
        tabBarLabelStyle: { fontFamily: "Inter_500Medium", fontSize: 11 },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Dashboard",
          tabBarIcon: ({ color, size }) => <Ionicons name="bar-chart-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="scanner"
        options={{
          title: "Scanner",
          tabBarIcon: ({ color, size }) => <Ionicons name="qr-code-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="revenue"
        options={{
          title: "Revenue",
          tabBarIcon: ({ color, size }) => <Ionicons name="cash-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="gym-profile"
        options={{
          title: "Gym",
          tabBarIcon: ({ color, size }) => <Ionicons name="business-outline" size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}

export default function GymPortalLayout() {
  if (isLiquidGlassAvailable()) return <NativePortalTabs />;
  return <ClassicPortalTabs />;
}
