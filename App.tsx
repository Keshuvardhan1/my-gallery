import React from "react";
import { ThemeProvider, useTheme } from "./src/ThemeContext";
import { AuthProvider } from "./src/AuthContext";
import LoginScreen from "./src/screens/LoginScreen";
import GalleryScreen from "./src/screens/GalleryScreen";
import AddPhotoScreen from "./src/screens/AddPhotoScreen";
import { NavigationContainer, DefaultTheme, DarkTheme } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

const Stack = createNativeStackNavigator();

function Routes() {
  const { isDark } = useTheme();

  const navTheme = isDark
    ? {
        ...DarkTheme,
        colors: {
          ...DarkTheme.colors,
          background: "#0a0a0a",
          card: "#121212",
          text: "#ffffff",
          primary: "#ffffff",
        },
      }
    : {
        ...DefaultTheme,
        colors: {
          ...DefaultTheme.colors,
          background: "#ffffff",
          card: "#ffffff",
          text: "#000000",
          primary: "#000000",
        },
      };

  return (
    <NavigationContainer theme={navTheme}>
      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={{
          headerStyle: { backgroundColor: isDark ? "#121212" : "#ffffff" },
          headerTintColor: isDark ? "#ffffff" : "#000000",
          headerTitleStyle: { fontWeight: "600" },
        }}
      >
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Gallery" component={GalleryScreen} />
        <Stack.Screen name="AddPhoto" component={AddPhotoScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Routes />
      </AuthProvider>
    </ThemeProvider>
  );
}
