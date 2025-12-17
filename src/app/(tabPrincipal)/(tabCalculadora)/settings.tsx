import { useRouter } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { signout } from "../../../utils/authService";

export default function SettingsScreen() {
  const router = useRouter();

  const handleLogout = async () => {
    const result = await signout();

    if (result?.success) {
      router.replace("/(auth)");
    }
  };

  return (
    <View style={styles.container}>
      <Pressable style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Cerrar sesión</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  logoutButton: {
    marginTop: 24,
    paddingVertical: 14,
    borderRadius: 8,
    backgroundColor: "#d32f2f",
    alignItems: "center",
  },
  logoutText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});