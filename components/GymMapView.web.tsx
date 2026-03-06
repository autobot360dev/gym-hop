import React from "react";
import { View, Text, StyleSheet, ScrollView, Pressable } from "react-native";
import { Gym } from "@/contexts/DataContext";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

interface Props {
  gyms: Gym[];
  centerLat: number;
  centerLng: number;
  hasLocation: boolean;
}

export default function GymMapView({ gyms }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.mapPlaceholder}>
        <Ionicons name="map-outline" size={48} color="#52525B" />
        <Text style={styles.mapText}>Map view available on iOS and Android</Text>
        <Text style={styles.mapSubtext}>Browse gyms in the list below</Text>
      </View>
      <ScrollView contentContainerStyle={styles.webGymList} showsVerticalScrollIndicator={false}>
        {gyms.map((gym) => (
          <Pressable
            key={gym.id}
            style={[styles.webGymItem, { borderColor: gym.gradientEnd + "44" }]}
            onPress={() => router.push({ pathname: "/gym/[id]", params: { id: gym.id } })}
          >
            <View style={[styles.webGymColor, { backgroundColor: gym.gradientStart }]}>
              <View style={[StyleSheet.absoluteFill, { backgroundColor: gym.gradientEnd + "44" }]} />
            </View>
            <View style={styles.webGymInfo}>
              <Text style={styles.webGymName}>{gym.name}</Text>
              <Text style={styles.webGymMeta}>{gym.neighborhood} · ${gym.pricePerSession / 100}/session</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#71717A" />
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  mapPlaceholder: {
    height: 200,
    backgroundColor: "#18181B",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  mapText: { color: "#A1A1AA", fontSize: 15, fontFamily: "Inter_500Medium" },
  mapSubtext: { color: "#71717A", fontSize: 13 },
  webGymList: { padding: 16, gap: 10 },
  webGymItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: 14,
    backgroundColor: "#27272A",
    borderWidth: 1,
  },
  webGymColor: {
    width: 44,
    height: 44,
    borderRadius: 12,
    overflow: "hidden",
    position: "relative",
  },
  webGymInfo: { flex: 1 },
  webGymName: { color: "#FAFAFA", fontSize: 15, fontFamily: "Inter_600SemiBold" },
  webGymMeta: { color: "#A1A1AA", fontSize: 12 },
});
