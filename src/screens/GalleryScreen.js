import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  Image,
  FlatList,
  Dimensions,
  StyleSheet,
  Alert,
  Platform,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Sharing from "expo-sharing";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../AuthContext";
import { useTheme } from "../ThemeContext";

const numColumns = 3;
const H_PADDING = 16;

export default function GalleryScreen({ navigation }) {
  const { user, signOutUser } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  const [gallery, setGallery] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const screenWidth = Dimensions.get("window").width;
  const totalSpacing = H_PADDING * 2 + (numColumns - 1) * 8;
  const itemSize = Math.floor((screenWidth - totalSpacing) / numColumns);

  const containerBg = isDark ? "#0e0e0e" : "#ffffff";
  const textColor = isDark ? "#ffffff" : "#000000";
  const subTextColor = isDark ? "#bbb" : "#444";
  const overlayBg = isDark ? "rgba(0,0,0,0.5)" : "rgba(255,255,255,0.6)";

  const loadGallery = useCallback(async () => {
    try {
      setLoading(true);
      const raw = await AsyncStorage.getItem("gallery");
      const arr = raw ? JSON.parse(raw) : [];
      setGallery(arr);
    } catch (err) {
      console.error("loadGallery", err);
      Alert.alert("Error", "Could not load gallery.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadGallery();
    const unsub = navigation.addListener && navigation.addListener("focus", loadGallery);
    return () => {
      if (unsub && typeof unsub === "function") unsub();
    };
  }, [navigation, loadGallery]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadGallery();
    setRefreshing(false);
  }, [loadGallery]);

  const shareItem = async (item) => {
    if (!item?.imageUri) {
      Alert.alert("No image to share");
      return;
    }
    if (Platform.OS !== "web") {
      try {
        await Sharing.shareAsync(item.imageUri, { dialogTitle: "Share image" });
      } catch (err) {
        console.error("shareItem", err);
        Alert.alert("Error", "Could not share image.");
      }
      return;
    }
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: item.caption || "Shared image",
          text: item.caption || "",
          url: item.imageUri,
        });
      } catch (err) {
        console.error("navigator.share", err);
      }
      return;
    }
    Alert.alert("Share not supported", `Caption:\n${item.caption || "(no caption)"}\n\nImage:\n${item.imageUri}`);
  };

  const deleteItem = async (id) => {
    Alert.alert("Delete", "Are you sure you want to delete this item?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            const raw = await AsyncStorage.getItem("gallery");
            const arr = raw ? JSON.parse(raw) : [];
            const filtered = arr.filter((it) => it.id !== id);
            await AsyncStorage.setItem("gallery", JSON.stringify(filtered));
            setGallery(filtered);
          } catch (err) {
            console.error("deleteItem", err);
            Alert.alert("Error", "Could not delete item.");
          }
        },
      },
    ]);
  };

  const handleSignOut = async () => {
    try {
      await signOutUser();

      try {
        await AsyncStorage.removeItem("guestProfile");
      } catch (e) {
        console.warn("Failed to clear local profile keys:", e);
      }

      navigation.reset({
        index: 0,
        routes: [{ name: "Login" }],
      });
    } catch (err) {
      console.error("handleSignOut error", err);
      Alert.alert("Sign out failed", err?.message || "Unknown error");
    }
  };

  const renderItem = ({ item }) => {
    return (
      <View style={{ width: itemSize, margin: 4 }}>
        <View style={{ position: "relative" }}>
          <Image source={{ uri: item.imageUri }} style={{ width: itemSize, height: itemSize, borderRadius: 8 }} />

          <View style={[styles.iconOverlay, { backgroundColor: overlayBg }]}>
            <TouchableOpacity onPress={() => shareItem(item)} style={styles.iconButton}>
              <Ionicons name="share-outline" size={18} color={isDark ? "#fff" : "#111"} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => deleteItem(item.id)} style={styles.iconButton}>
              <Ionicons name="trash-outline" size={18} color={isDark ? "#fff" : "#b00"} />
            </TouchableOpacity>
          </View>
        </View>

        <Text numberOfLines={1} style={[styles.caption, { color: textColor }]}>
          {item.caption || ""}
        </Text>
      </View>
    );
  };

  return (
    <View style={[styles.wrapper, { backgroundColor: containerBg }]}>
      <View style={styles.header}>
        {user?.photoURL ? (
          <Image source={{ uri: user.photoURL }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder} />
        )}
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={[styles.name, { color: textColor }]} numberOfLines={1}>
            {user?.displayName || "Guest"}
          </Text>
          <Text style={[styles.email, { color: subTextColor }]} numberOfLines={1}>
            {user?.email || ""}
          </Text>
        </View>

        <View style={{ marginLeft: 8 }}>
          <TouchableOpacity onPress={toggleTheme} style={{ padding: 6 }}>
            <Ionicons name={isDark ? "sunny-outline" : "moon-outline"} size={20} color={isDark ? "#fff" : "#111"} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.controlsRow}>
        <TouchableOpacity onPress={() => navigation.navigate("AddPhoto")} style={styles.controlBtn}>
          <Ionicons name="add-circle-outline" size={22} color={isDark ? "#fff" : "#111"} />
        </TouchableOpacity>
        <View style={{ width: 12 }} />
        <TouchableOpacity onPress={handleSignOut} style={styles.controlBtn}>
          <Ionicons name="log-out-outline" size={22} color={isDark ? "#fff" : "#111"} />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" />
        </View>
      ) : gallery.length === 0 ? (
        <View style={styles.emptyWrap}>
          <Text style={[styles.emptyText, { color: textColor }]}>No images yet — add one!</Text>
        </View>
      ) : (
        <FlatList
          data={gallery}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          numColumns={numColumns}
          contentContainerStyle={{ paddingHorizontal: H_PADDING, paddingBottom: 24 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          removeClippedSubviews={true}
          initialNumToRender={12}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    paddingTop: 8,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: H_PADDING,
    marginBottom: 8,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  avatarPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#888",
  },
  name: {
    fontSize: 17,
    fontWeight: "600",
  },
  email: {
    fontSize: 13,
  },
  controlsRow: {
    flexDirection: "row",
    paddingHorizontal: H_PADDING,
    marginBottom: 8,
    alignItems: "center",
  },
  caption: {
    marginTop: 6,
    fontSize: 13,
    height: 36,
  },
  loadingWrap: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyWrap: {
    alignItems: "center",
    marginTop: 40,
  },
  emptyText: {
    fontSize: 16,
  },
  iconOverlay: {
    position: "absolute",
    right: 6,
    top: 6,
    borderRadius: 18,
    paddingVertical: 4,
    paddingHorizontal: 6,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  iconButton: {
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  controlBtn: {
    padding: 8,
    alignItems: "center",
    justifyContent: "center",
  },
});
