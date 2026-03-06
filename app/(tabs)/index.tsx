import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  TextInput,
  ActivityIndicator,
  useColorScheme,
  Platform,
  Image,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import * as Haptics from "expo-haptics";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useData, Gym } from "@/contexts/DataContext";
import GymMapView from "@/components/GymMapView";
import { useAuth } from "@/contexts/AuthContext";

const CATEGORIES = ["All", "Strength", "Boxing", "Yoga", "CrossFit", "Cycling", "HIIT", "Climbing", "Full Service"];

const CATEGORY_ICONS: Record<string, keyof typeof import("@expo/vector-icons").Ionicons.glyphMap> = {
  All: "apps-outline",
  Strength: "barbell-outline",
  Boxing: "hand-left-outline",
  Yoga: "body-outline",
  CrossFit: "flame-outline",
  Cycling: "bicycle-outline",
  HIIT: "flash-outline",
  Climbing: "trending-up-outline",
  "Full Service": "star-outline",
};

function GymCard({ gym, index }: { gym: Gym; index: number }) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const card = isDark ? "#1C1C1E" : "#FFFFFF";
  const text = isDark ? "#FAFAFA" : "#09090B";
  const textSec = isDark ? "#A1A1AA" : "#71717A";
  const border = isDark ? "#2C2C2E" : "#E4E4E7";

  return (
    <Animated.View entering={FadeInDown.delay(index * 50).springify()}>
      <Pressable
        style={[styles.gymCard, { backgroundColor: card, borderColor: border }]}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          router.push({ pathname: "/gym/[id]", params: { id: gym.id } });
        }}
      >
        <View style={styles.gymCardBanner}>
          <Image
            source={{ uri: gym.imageUrl }}
            style={StyleSheet.absoluteFillObject}
            resizeMode="cover"
          />
          <View style={styles.imageGradientOverlay} />
          <View style={styles.cardBannerContent}>
            <View style={styles.categoryBadge}>
              <Ionicons name={CATEGORY_ICONS[gym.category] || "fitness-outline"} size={12} color="#fff" />
              <Text style={[styles.categoryBadgeText, { fontFamily: "Inter_600SemiBold" }]}>
                {gym.category}
              </Text>
            </View>
            {gym.isOpen ? (
              <View style={styles.openBadge}>
                <View style={styles.openDot} />
                <Text style={[styles.openText, { fontFamily: "Inter_500Medium" }]}>Open</Text>
              </View>
            ) : (
              <View style={[styles.openBadge, { backgroundColor: "rgba(0,0,0,0.55)" }]}>
                <View style={[styles.openDot, { backgroundColor: "#EF4444" }]} />
                <Text style={[styles.openText, { fontFamily: "Inter_500Medium" }]}>Closed</Text>
              </View>
            )}
          </View>
          <View style={styles.priceFloating}>
            <Text style={[styles.priceFloatingText, { fontFamily: "Inter_700Bold" }]}>
              ${(gym.pricePerSession / 100).toFixed(0)}
            </Text>
            <Text style={[styles.priceFloatingUnit, { fontFamily: "Inter_400Regular" }]}>/session</Text>
          </View>
        </View>

        <View style={styles.gymCardBody}>
          <View style={styles.gymCardTop}>
            <Text style={[styles.gymName, { color: text, fontFamily: "Inter_700Bold" }]} numberOfLines={1}>
              {gym.name}
            </Text>
            <View style={styles.ratingPill}>
              <Ionicons name="star" size={11} color="#F59E0B" />
              <Text style={[styles.ratingText, { fontFamily: "Inter_700Bold" }]}>
                {gym.rating}
              </Text>
            </View>
          </View>

          <View style={styles.locationRow}>
            <Ionicons name="location-outline" size={13} color={textSec} />
            <Text style={[styles.locationText, { color: textSec, fontFamily: "Inter_400Regular" }]} numberOfLines={1}>
              {gym.neighborhood} · {gym.address.split(",")[0]}
            </Text>
          </View>

          <View style={styles.gymCardFooter}>
            <View style={styles.amenitiesRow}>
              {gym.amenities.slice(0, 3).map((a) => (
                <View key={a} style={[styles.amenityChip, { backgroundColor: isDark ? "#2C2C2E" : "#F4F4F5" }]}>
                  <Text style={[styles.amenityText, { color: textSec, fontFamily: "Inter_400Regular" }]}>{a}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

export default function DiscoverScreen() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const { gyms } = useData();
  const { user } = useAuth();

  const bg = isDark ? "#09090B" : "#F2F2F7";
  const surface = isDark ? "#1C1C1E" : "#FFFFFF";
  const border = isDark ? "#2C2C2E" : "#E4E4E7";
  const text = isDark ? "#FAFAFA" : "#09090B";
  const textSec = isDark ? "#A1A1AA" : "#71717A";

  const [viewMode, setViewMode] = useState<"list" | "map">("list");
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [locationLoading, setLocationLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === "granted") {
        const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        setLocation(loc);
      }
      setLocationLoading(false);
    })();
  }, []);

  const filteredGyms = gyms.filter((g) => {
    const matchSearch =
      search === "" ||
      g.name.toLowerCase().includes(search.toLowerCase()) ||
      g.neighborhood.toLowerCase().includes(search.toLowerCase());
    const matchCategory =
      selectedCategory === "All" ||
      g.category.toLowerCase().includes(selectedCategory.toLowerCase());
    return matchSearch && matchCategory;
  });

  const mapCenter = location
    ? { latitude: location.coords.latitude, longitude: location.coords.longitude }
    : { latitude: 37.7749, longitude: -122.4194 };

  const firstName = user?.name?.split(" ")[0] || "there";

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
        <View style={styles.headerTop}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.headerGreeting, { color: textSec, fontFamily: "Inter_400Regular" }]}>
              Good morning, {firstName} 👋
            </Text>
            <Text style={[styles.headerTitle, { color: text, fontFamily: "Inter_700Bold" }]}>
              Find a Gym
            </Text>
          </View>
          <View style={[styles.viewToggle, { backgroundColor: surface, borderColor: border }]}>
            <Pressable
              style={[styles.toggleBtn, viewMode === "list" && styles.toggleBtnActive]}
              onPress={() => { setViewMode("list"); Haptics.selectionAsync(); }}
            >
              <Ionicons name="list" size={17} color={viewMode === "list" ? "#fff" : textSec} />
            </Pressable>
            <Pressable
              style={[styles.toggleBtn, viewMode === "map" && styles.toggleBtnActive]}
              onPress={() => { setViewMode("map"); Haptics.selectionAsync(); }}
            >
              <Ionicons name="map" size={17} color={viewMode === "map" ? "#fff" : textSec} />
            </Pressable>
          </View>
        </View>

        <View style={[styles.searchBar, { backgroundColor: surface, borderColor: border }]}>
          <Ionicons name="search-outline" size={18} color={textSec} />
          <TextInput
            style={[styles.searchInput, { color: text, fontFamily: "Inter_400Regular" }]}
            placeholder="Search gyms, neighborhoods..."
            placeholderTextColor={textSec}
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <Pressable onPress={() => setSearch("")}>
              <Ionicons name="close-circle" size={18} color={textSec} />
            </Pressable>
          )}
        </View>

        <FlatList
          horizontal
          data={CATEGORIES}
          keyExtractor={(item) => item}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesList}
          renderItem={({ item }) => {
            const isActive = selectedCategory === item;
            return (
              <Pressable
                style={[
                  styles.categoryChip,
                  {
                    backgroundColor: isActive ? "#F97316" : surface,
                    borderColor: isActive ? "#F97316" : border,
                  },
                ]}
                onPress={() => { setSelectedCategory(item); Haptics.selectionAsync(); }}
              >
                <Ionicons
                  name={CATEGORY_ICONS[item] || "fitness-outline"}
                  size={13}
                  color={isActive ? "#fff" : textSec}
                />
                <Text
                  style={[
                    styles.categoryChipText,
                    { color: isActive ? "#fff" : textSec, fontFamily: "Inter_500Medium" },
                  ]}
                >
                  {item}
                </Text>
              </Pressable>
            );
          }}
        />
      </View>

      {viewMode === "list" ? (
        <FlatList
          data={filteredGyms}
          keyExtractor={(g) => g.id}
          renderItem={({ item, index }) => <GymCard gym={item} index={index} />}
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: Platform.OS === "web" ? 118 : insets.bottom + 100 },
          ]}
          ListHeaderComponent={
            filteredGyms.length > 0 ? (
              <Text style={[styles.resultsLabel, { color: textSec, fontFamily: "Inter_500Medium" }]}>
                {filteredGyms.length} {filteredGyms.length === 1 ? "gym" : "gyms"} nearby
              </Text>
            ) : null
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <View style={[styles.emptyIcon, { backgroundColor: isDark ? "#1C1C1E" : "#F4F4F5" }]}>
                <Ionicons name="fitness-outline" size={32} color={textSec} />
              </View>
              <Text style={[styles.emptyTitle, { color: text, fontFamily: "Inter_600SemiBold" }]}>
                No gyms found
              </Text>
              <Text style={[styles.emptySubtext, { color: textSec, fontFamily: "Inter_400Regular" }]}>
                Try a different search or category
              </Text>
            </View>
          }
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={{ flex: 1 }}>
          {locationLoading ? (
            <View style={styles.mapLoading}>
              <ActivityIndicator size="large" color="#F97316" />
            </View>
          ) : (
            <GymMapView
              gyms={filteredGyms}
              centerLat={mapCenter.latitude}
              centerLng={mapCenter.longitude}
              hasLocation={!!location}
            />
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingBottom: 4 },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 14,
  },
  headerGreeting: { fontSize: 13, marginBottom: 2 },
  headerTitle: { fontSize: 30, letterSpacing: -0.8 },
  viewToggle: {
    flexDirection: "row",
    borderRadius: 14,
    padding: 3,
    gap: 2,
    borderWidth: 1,
  },
  toggleBtn: { padding: 8, borderRadius: 10 },
  toggleBtnActive: { backgroundColor: "#F97316" },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginHorizontal: 20,
    marginBottom: 12,
    paddingHorizontal: 16,
    paddingVertical: 13,
    borderRadius: 16,
    borderWidth: 1,
  },
  searchInput: { flex: 1, fontSize: 15 },
  categoriesList: { paddingHorizontal: 20, gap: 8, paddingBottom: 16 },
  categoryChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 13,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  categoryChipText: { fontSize: 13 },
  listContent: { paddingHorizontal: 16, paddingTop: 4, gap: 14 },
  resultsLabel: { fontSize: 13, marginBottom: 4, marginLeft: 4 },
  gymCard: {
    borderRadius: 22,
    borderWidth: 1,
    overflow: "hidden",
  },
  gymCardBanner: {
    height: 180,
    position: "relative",
    backgroundColor: "#1C1C1E",
  },
  imageGradientOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.38)",
  },
  cardBannerContent: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    padding: 14,
  },
  categoryBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(0,0,0,0.5)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },
  categoryBadgeText: { color: "#fff", fontSize: 12 },
  openBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(0,0,0,0.5)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },
  openDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#22C55E" },
  openText: { color: "#fff", fontSize: 12 },
  priceFloating: {
    position: "absolute",
    bottom: 14,
    right: 14,
    flexDirection: "row",
    alignItems: "baseline",
    gap: 1,
    backgroundColor: "rgba(249,115,22,0.9)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  priceFloatingText: { color: "#fff", fontSize: 17 },
  priceFloatingUnit: { color: "rgba(255,255,255,0.8)", fontSize: 11 },
  gymCardBody: { padding: 16, gap: 7 },
  gymCardTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  gymName: { fontSize: 18, flex: 1, marginRight: 8 },
  ratingPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#FEF3C7",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  ratingText: { fontSize: 13, color: "#B45309" },
  locationRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  locationText: { fontSize: 13, flex: 1 },
  gymCardFooter: { marginTop: 2 },
  amenitiesRow: { flexDirection: "row", gap: 6, flexWrap: "wrap" },
  amenityChip: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  amenityText: { fontSize: 11 },
  mapLoading: { flex: 1, alignItems: "center", justifyContent: "center" },
  emptyState: { alignItems: "center", justifyContent: "center", gap: 12, paddingTop: 80 },
  emptyIcon: { width: 64, height: 64, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  emptyTitle: { fontSize: 17 },
  emptySubtext: { fontSize: 14 },
});
