import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator } from 'react-native';

// Mock function to check authentication
const checkAuth = async () => {
  // Replace this with your real auth logic (e.g., AsyncStorage token)
  // Return true if logged in, false otherwise
  return false;
};

export default function RootLayout() {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const loadAuth = async () => {
      const auth = await checkAuth();
      setIsAuthenticated(auth);
      setIsLoading(false);
    };
    loadAuth();
  }, []);

  if (isLoading) {
    return <ActivityIndicator size="large" style={{ flex: 1 }} />;
  }

  return (
    <Stack>
      {/* Splash and onboarding screens */}
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="Screen1" options={{ headerShown: false }} />
      <Stack.Screen name="Screen2" options={{ headerShown: false }} />
      <Stack.Screen name="Screen3" options={{ headerShown: false }} />
      <Stack.Screen name="Home" options={{ headerShown: false }} />
      <Stack.Screen name="auth/login" options={{ headerShown: false }} />
      <Stack.Screen name="Screen4" options={{ headerShown: false }} />
      <Stack.Screen name="auth/phoneNumber" options={{ headerShown: false }} />
      <Stack.Screen name="auth/register" options={{ headerShown: false }} />
      <Stack.Screen name="auth/verify" options={{ headerShown: false }} />

      {/* Home - only allow if authenticated */}
      {isAuthenticated && <Stack.Screen name="home" options={{ headerShown: false }} />}
    </Stack>
  );
}
