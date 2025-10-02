import React from "react";
import { View, Text, Button, Image, StyleSheet, Alert } from "react-native";
import { useAuth } from "../AuthContext";
import { useTheme } from "../ThemeContext";

export default function LoginScreen({ navigation }) {
  const { user, signInWithGoogle, signOutUser } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  const containerBg = isDark ? "#0e0e0e" : "#ffffff";
  const textColor = isDark ? "#ffffff" : "#000000";

  const handleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (err) {
      console.error("handleSignIn error:", err);
      Alert.alert("Sign in failed", err?.message || "Unknown error");
    }
  };

  const handleSignOut = async () => {
    try {
      await signOutUser();
      Alert.alert("Signed out", "You have been signed out.");
    } catch (err) {
      console.error("handleSignOut error:", err);
      Alert.alert("Sign out failed", err?.message || "Unknown error");
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: containerBg }]}>
      <Text style={[styles.title, { color: textColor }]}>My Gallery</Text>

      {user ? (
        <>
          <View style={styles.profileRow}>
            {user.photoURL ? <Image source={{ uri: user.photoURL }} style={styles.avatar} /> : <View style={styles.avatarPlaceholder} />}
            <View style={{ marginLeft: 12 }}>
              <Text style={[styles.name, { color: textColor }]} numberOfLines={1}>
                {user.displayName || "User"}
              </Text>
              <Text style={[styles.email, { color: isDark ? "#bbb" : "#444" }]} numberOfLines={1}>
                {user.email || ""}
              </Text>
            </View>
          </View>

          <View style={{ height: 14 }} />
          <Button title="Go to Gallery" onPress={() => navigation.navigate("Gallery")} />
          <View style={{ height: 10 }} />
          <Button title="Sign Out" onPress={handleSignOut} />
        </>
      ) : (
        <>
          <Text style={[styles.subtitle, { color: textColor }]}>Please sign in with Google to continue</Text>
          <View style={{ height: 12 }} />
          <Button title="Sign in with Google" onPress={handleSignIn} />
        </>
      )}

      <View style={{ height: 20 }} />

      <Button title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"} onPress={toggleTheme} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center", padding: 20 },
  title: { fontSize: 26, fontWeight: "700", marginBottom: 18 },
  subtitle: { fontSize: 16, textAlign: "center" },
  profileRow: { flexDirection: "row", alignItems: "center", paddingHorizontal: 6 },
  avatar: { width: 64, height: 64, borderRadius: 32 },
  avatarPlaceholder: { width: 64, height: 64, borderRadius: 32, backgroundColor: "#ccc" },
  name: { fontSize: 18, fontWeight: "600" },
  email: { fontSize: 13 },
});
