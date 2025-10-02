import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";
import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";
import { GoogleAuthProvider, signInWithCredential, signOut as firebaseSignOut } from "firebase/auth";
import { auth } from "./firebase"; 
import { Alert } from "react-native";

WebBrowser.maybeCompleteAuthSession();

const AuthContext = createContext({
  user: null,
  signInWithGoogle: async () => {},
  signOutUser: async () => {},
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const WEB_CLIENT_ID = "141187149875-iada1n26vfrckk49ksg7iidbi51p44h2.apps.googleusercontent.com";

  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId: WEB_CLIENT_ID,
  });

  useEffect(() => {
    const unsub = auth.onAuthStateChanged((u) => {
      setUser(u ? { uid: u.uid, displayName: u.displayName, photoURL: u.photoURL, email: u.email } : null);
    });

    try {
      if (typeof window !== "undefined") window.__FIREBASE_AUTH__ = auth;
    } catch (e) {}

    return () => {
      unsub();
      try {
        if (typeof window !== "undefined") delete window.__FIREBASE_AUTH__;
      } catch (e) {}
    };
  }, []);

  useEffect(() => {
    if (response?.type === "success") {
      const { id_token } = response.params ?? {};
      if (id_token) {
        const credential = GoogleAuthProvider.credential(id_token);
        signInWithCredential(auth, credential).catch((err) => {
          console.error("signInWithCredential error", err);
          Alert.alert("Sign-in error", err.message || JSON.stringify(err));
        });
      } else {
        console.warn("Google response had no id_token", response);
      }
    }
  }, [response]);

  const signInWithGoogle = async () => {
    try {
      await promptAsync({ useProxy: true });
    } catch (err) {
      console.error("signInWithGoogle error", err);
      Alert.alert("Sign in failed", err?.message || "Unknown error");
      throw err;
    }
  };

  const signOutUser = async () => {
    try {
      await firebaseSignOut(auth).catch((e) => {
        console.warn("firebaseSignOut:", e?.message || e);
      });
      
      try {
        await AsyncStorage.removeItem("guestProfile");
      } catch (e) {
        console.warn("Failed clearing AsyncStorage keys on signOut:", e);
      }
      
      setUser(null);
      console.log("[AuthContext] signOutUser cleared local state");
    
    } catch (err) {
      console.error("signOutUser error", err);
      setUser(null);
      throw err;
    }
  };

  return <AuthContext.Provider value={{ user, signInWithGoogle, signOutUser }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
