import React from "react";
import MapView, { Marker } from "react-native-maps";
import { StyleSheet } from "react-native";
import { Gym } from "@/contexts/DataContext";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import { Text, View } from "react-native";

interface Props {
  gyms: Gym[];
  centerLat: number;
  centerLng: number;
  hasLocation: boolean;
}

export default function GymMapView({ gyms, centerLat, centerLng, hasLocation }: Props) {
  return (
    <MapView
      style={StyleSheet.absoluteFill}
      initialRegion={{
        latitude: centerLat,
        longitude: centerLng,
        latitudeDelta: 0.08,
        longitudeDelta: 0.08,
      }}
      showsUserLocation={hasLocation}
    >
      {gyms.map((gym) => (
        <Marker
          key={gym.id}
          coordinate={{ latitude: gym.latitude, longitude: gym.longitude }}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.push({ pathname: "/gym/[id]", params: { id: gym.id } });
          }}
        >
          <View style={[mapStyles.pin, { backgroundColor: gym.gradientEnd }]}>
            <Text style={[mapStyles.pinText, { fontFamily: "Inter_700Bold" }]}>
              ${gym.pricePerSession / 100}
            </Text>
          </View>
        </Marker>
      ))}
    </MapView>
  );
}

const mapStyles = StyleSheet.create({
  pin: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  pinText: { color: "#fff", fontSize: 13 },
});
