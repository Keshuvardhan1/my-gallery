import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  Button,
  Image,
  TextInput,
  StyleSheet,
  Alert,
  Platform,
  ScrollView,
  Modal,
  StatusBar,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Voice from "@react-native-voice/voice";
import { useTheme } from "../ThemeContext";

export default function AddPhotoScreen({ navigation }) {
  const [image, setImage] = useState(null);
  const [caption, setCaption] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const { isDark, toggleTheme } = useTheme();

  const videoRef = useRef(null);
  const [webCameraOn, setWebCameraOn] = useState(false);

  useEffect(() => {
    if (Platform.OS !== "web") {
      Voice.onSpeechResults = (event) => {
        if (event?.value && event.value.length > 0) {
          setCaption(event.value[0]);
        }
      };
    }

    return () => {
      if (Platform.OS !== "web") {
        Voice.destroy().then(Voice.removeAllListeners).catch(() => {});
      }
    };
  }, []);

  const pickImage = async () => {
    if (Platform.OS !== "web") {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission denied", "We need camera roll permissions to continue!");
        return;
      }
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 1,
      });

      if (!result.canceled && result.assets?.[0]?.uri) {
        setImage(result.assets[0].uri);
      }
    } catch (err) {
      console.error("pickImage error", err);
      Alert.alert("Error", "Could not open image picker.");
    }
  };

  const takePhoto = async () => {
    if (Platform.OS === "web") {
      startWebCamera();
      return;
    }

    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission denied", "We need camera permissions to continue!");
      return;
    }

    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        quality: 1,
      });

      if (!result.canceled && result.assets?.[0]?.uri) {
        setImage(result.assets[0].uri);
      }
    } catch (err) {
      console.error("takePhoto error", err);
      Alert.alert("Error", "Could not open camera.");
    }
  };

  const startWebCamera = async () => {
    try {
      setWebCameraOn(true);
      await new Promise((r) => setTimeout(r, 60));

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        Alert.alert("Camera not available", "Your browser does not support camera access.");
        setWebCameraOn(false);
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" }, audio: false });

      if (videoRef.current) {
        try {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        } catch (err) {
          console.warn("video play error", err);
        }
      }
    } catch (err) {
      console.error("startWebCamera err", err);
      Alert.alert("Camera error", "Could not start camera. Check permissions and that you're on HTTPS or localhost.");
      setWebCameraOn(false);
    }
  };

  const stopWebCamera = async () => {
    try {
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks() || [];
        tracks.forEach((t) => t.stop());
      }
    } catch (e) {
      /* ignore */
    } finally {
      if (videoRef.current) {
        try {
          videoRef.current.srcObject = null;
        } catch {}
      }
      setWebCameraOn(false);
    }
  };

  const captureWebPhoto = async () => {
    try {
      const video = videoRef.current;
      if (!video) return;

      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth || video.clientWidth || 640;
      canvas.height = video.videoHeight || video.clientHeight || 480;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
      setImage(dataUrl);

      await stopWebCamera();
    } catch (err) {
      console.error("captureWebPhoto err", err);
      Alert.alert("Capture failed", "Could not capture photo from camera.");
    }
  };

  const saveCaption = async () => {
    if (!image) {
      Alert.alert("No image", "Please select or take a photo first!");
      return;
    }

    try {
      const existingData = await AsyncStorage.getItem("gallery");
      const gallery = existingData ? JSON.parse(existingData) : [];

      gallery.unshift({ id: Date.now().toString(), imageUri: image, caption });

      await AsyncStorage.setItem("gallery", JSON.stringify(gallery));

      Alert.alert("Saved!", "Your image and caption have been saved.");
      setImage(null);
      setCaption("");
    } catch (error) {
      console.error("saveCaption error", error);
      Alert.alert("Error", "Failed to save image. Please try again.");
    }
  };

  const startRecording = async () => {
    if (Platform.OS === "web") {
      Alert.alert("Not supported on web", "Voice recording is available only on native (device) builds.");
      return;
    }
    setIsRecording(true);
    try {
      await Voice.start("en-US");
    } catch (e) {
      console.error("Voice.start error", e);
      Alert.alert("Error", "Could not start voice recognition.");
      setIsRecording(false);
    }
  };

  const stopRecording = async () => {
    if (Platform.OS === "web") return;
    setIsRecording(false);
    try {
      await Voice.stop();
    } catch (e) {
      console.error("Voice.stop error", e);
    }
  };

  const containerBg = isDark ? "#0e0e0e" : "#ffffff";
  const textColor = isDark ? "#ffffff" : "#000000";
  const inputBg = isDark ? "#222222" : "#ffffff";
  const inputColor = isDark ? "#ffffff" : "#000000";

  return (
    <>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />

      <ScrollView contentContainerStyle={[styles.container, { backgroundColor: containerBg }]}>
        <Text style={[styles.title, { color: textColor }]}>Add Photo</Text>

        <View style={styles.row}>
          <Button title="Pick from gallery" onPress={pickImage} />
          <View style={{ width: 12 }} />
          <Button title="Take photo" onPress={takePhoto} />
        </View>

        {image && <Image source={{ uri: image }} style={styles.image} />}

        {image && (
          <>
            <TextInput
              style={[styles.input, { backgroundColor: inputBg, color: inputColor }]}
              placeholder="Enter caption"
              placeholderTextColor={isDark ? "#999" : "#666"}
              value={caption}
              onChangeText={setCaption}
              multiline
            />

            <View style={{ height: 8 }} />

            <Button title={isRecording ? "Stop Recording" : "Record Caption"} onPress={isRecording ? stopRecording : startRecording} />

            <View style={{ height: 10 }} />
            <Button title="Save Caption" onPress={saveCaption} />
          </>
        )}

        <View style={{ height: 14 }} />
        <Button title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"} onPress={toggleTheme} />

        <View style={{ height: 14 }} />
        <Button title="Go Back to Gallery" onPress={() => navigation.goBack()} />
      </ScrollView>

      {Platform.OS === "web" && (
        <Modal transparent={true} animationType="slide" visible={webCameraOn} onRequestClose={stopWebCamera}>
          <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.8)", justifyContent: "center", alignItems: "center" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <video
                ref={(el) => {
                  videoRef.current = el;
                }}
                style={{ width: 360, maxWidth: "90vw", borderRadius: 8 }}
                playsInline
                muted
                autoPlay
              />
              <div style={{ height: 12 }} />
              <div style={{ display: "flex", gap: 12 }}>
                <button onClick={captureWebPhoto} style={{ padding: 10 }}>Capture</button>
                <button onClick={stopWebCamera} style={{ padding: 10 }}>Cancel</button>
              </div>
            </div>
          </View>
        </Modal>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: "center",
    minHeight: "100%",
  },
  title: {
    fontSize: 20,
    marginBottom: 18,
    fontWeight: "600",
  },
  row: {
    flexDirection: "row",
    marginBottom: 12,
    alignItems: "center",
  },
  image: {
    width: 300,
    height: 300,
    marginTop: 16,
    borderRadius: 10,
  },
  input: {
    width: "100%",
    borderColor: "#ccc",
    borderWidth: 1,
    padding: 10,
    marginTop: 10,
    marginBottom: 10,
    borderRadius: 6,
    minHeight: 60,
    textAlignVertical: "top",
  },
});
