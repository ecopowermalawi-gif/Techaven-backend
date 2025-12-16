import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View, Text, useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

// Check if onboarding is completed
const checkOnboardingStatus = async (): Promise<boolean> => {
  try {
    const onboardingCompleted = await AsyncStorage.getItem('onboardingCompleted');
    return onboardingCompleted === 'true';
  } catch (error: unknown) {
    console.log('Onboarding check error:', error instanceof Error ? error.message : 'Unknown error');
    return false;
  }
};

function RootLayoutNav() {
  const [isLoading, setIsLoading] = useState(true);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const colorScheme = useColorScheme();

  useEffect(() => {
    const loadOnboarding = async () => {
      try {
        console.log('Initializing app...');
        
        // Check onboarding status
        const onboardingStatus = await checkOnboardingStatus();
        console.log('Onboarding status:', onboardingStatus);
        setHasCompletedOnboarding(onboardingStatus);
      } catch (error: unknown) {
        console.log('App initialization error:', error instanceof Error ? error.message : 'Unknown error');
      } finally {
        setIsLoading(false);
        console.log('App initialization complete');
      }
    };
    
    loadOnboarding();
  }, []);

  if (isLoading) {
    return (
      <View style={{ 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center', 
        backgroundColor: colorScheme === 'dark' ? '#121212' : '#fff' 
      }}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={{ 
          marginTop: 10, 
          fontSize: 16, 
          color: colorScheme === 'dark' ? '#CCCCCC' : '#666' 
        }}>
          Loading TechHaven...
        </Text>
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* Step 1: Show onboarding screens if not completed */}
      {!hasCompletedOnboarding ? (
        <>
          <Stack.Screen name="index" />
          <Stack.Screen name="Screen1" />
          <Stack.Screen name="Screen2" />
          <Stack.Screen name="Screen3" />
        </>
      ) : (
        <>
          {/* Step 2: After onboarding, show ALL screens */}
          {/* Public screens that everyone can access (including Home) */}
          <Stack.Screen name="Home" />
          <Stack.Screen name="Categories" />
          <Stack.Screen name="HotSales" />
          <Stack.Screen name="SpecialOffers" />
          <Stack.Screen name="category/[id]" />
          <Stack.Screen name="product/[id]" />
          <Stack.Screen name="search" />
          <Stack.Screen name="Shops" />
          <Stack.Screen name="shop/[id]" />
          
          {/* Auth screens */}
          <Stack.Screen name="auth/login" />
          <Stack.Screen name="Screen4" />
          <Stack.Screen name="auth/phoneNumber" />
          <Stack.Screen name="auth/register" />
          <Stack.Screen name="auth/verify" />
          <Stack.Screen name="auth/forgotPassword" />
          
          {/* Protected screens - These will show auth alert when accessed without login */}
          <Stack.Screen name="Profile" />
          <Stack.Screen name="Cart" />
          <Stack.Screen name="Settings" />
          <Stack.Screen name="Support" />
          <Stack.Screen name="AboutUs" />
          <Stack.Screen name="ContactUs" />
          <Stack.Screen name="Likes" />
        </>
      )}
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <RootLayoutNav />
      </AuthProvider>
    </ThemeProvider>
  );
}