import { useAuth } from "@/contexts/AuthContext";
import { router } from "expo-router";
import { useEffect } from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";

export default function Index() {
  const { isAuthenticated, isLoading, user } = useAuth();

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
      router.replace("/(auth)/phone");
    } else if (user?.role === "gym") {
      router.replace("/(gym-portal)");
    } else if (user?.role === "admin") {
      router.replace("/(admin)");
    } else {
      router.replace("/(tabs)");
    }
  }, [isAuthenticated, isLoading, user]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#F97316" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#09090B",
    alignItems: "center",
    justifyContent: "center",
  },
});
