// app/_layout.tsx
import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View, Text } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { userService } from './api'; // Import your API service

// Define types for API responses
interface User {
  id: string;
  email: string;
  username?: string;
  roles?: string[];
  full_name?: string;
  phone?: string;
}

interface AuthResult {
  isAuthenticated: boolean;
  user: User | null;
  token?: string;
}

interface ApiError {
  message: string;
  status?: number;
  isNetworkError?: boolean;
}

// Real function to check authentication using your API
const checkAuth = async (): Promise<AuthResult> => {
  try {
    console.log('Checking authentication...');
    
    // Check if we have a token stored
    const token = await AsyncStorage.getItem('userToken');
    
    if (!token) {
      console.log('No token found in storage');
      return { isAuthenticated: false, user: null };
    }
    
    console.log('Token found, validating with backend...');
    
    // Validate the token with your backend
    try {
      // Try to get user profile to validate token
      const response = await userService.getProfile();
      const userProfile = response.data as User;
      console.log('Token validated successfully, user:', userProfile.email);
      
      // Store updated user data if needed
      await AsyncStorage.setItem('userData', JSON.stringify(userProfile));
      
      return { 
        isAuthenticated: true, 
        user: userProfile,
        token: token
      };
    } catch (error: unknown) {
      console.log('Token validation error:', error instanceof Error ? error.message : 'Unknown error');
      
      const apiError = error as ApiError;
      
      // Token is invalid or expired
      if (apiError.status === 401) {
        console.log('Token expired or invalid (401), clearing storage');
        await AsyncStorage.removeItem('userToken');
        await AsyncStorage.removeItem('userData');
      } else if (apiError.isNetworkError) {
        console.log('Network error, using cached data if available');
        // Try to get cached user data
        const cachedUser = await AsyncStorage.getItem('userData');
        if (cachedUser) {
          console.log('Using cached user data');
          return { 
            isAuthenticated: true, 
            user: JSON.parse(cachedUser) as User,
            token: token
          };
        }
      }
      
      return { isAuthenticated: false, user: null };
    }
    
  } catch (error: unknown) {
    console.log('Auth check error:', error instanceof Error ? error.message : 'Unknown error');
    return { isAuthenticated: false, user: null };
  }
};

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

export default function RootLayout() {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);

  useEffect(() => {
    const loadAuth = async () => {
      try {
        console.log('Initializing app...');
        
        // Check onboarding status
        const onboardingStatus = await checkOnboardingStatus();
        console.log('Onboarding status:', onboardingStatus);
        setHasCompletedOnboarding(onboardingStatus);
        
        // Only check auth if onboarding is completed
        if (onboardingStatus) {
          const authResult = await checkAuth();
          console.log('Auth result:', authResult.isAuthenticated ? 'Authenticated' : 'Not authenticated');
          setIsAuthenticated(authResult.isAuthenticated);
          setUser(authResult.user);
        }
      } catch (error: unknown) {
        console.log('App initialization error:', error instanceof Error ? error.message : 'Unknown error');
      } finally {
        setIsLoading(false);
        console.log('App initialization complete');
      }
    };
    
    loadAuth();
  }, []);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={{ marginTop: 10, fontSize: 16, color: '#666' }}>Loading TechHaven...</Text>
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* Show onboarding screens if not completed */}
      {!hasCompletedOnboarding ? (
        <>
          <Stack.Screen name="index" />
          <Stack.Screen name="Screen1" />
          <Stack.Screen name="Screen2" />
          <Stack.Screen name="Screen3" />
        </>
      ) : (
        <>
          {/* Show auth screens if not authenticated */}
          {!isAuthenticated ? (
            <>
              <Stack.Screen name="auth/login" />
              <Stack.Screen name="Screen4" />
              <Stack.Screen name="auth/phoneNumber" />
              <Stack.Screen name="auth/register" />
              <Stack.Screen name="auth/verify" />
              
              {/* Public screens that don't require auth */}
              <Stack.Screen name="Categories" />
              <Stack.Screen name="HotSales" />
              <Stack.Screen name="SpecialOffers" />
              <Stack.Screen name="category/[id]" />
              <Stack.Screen name="product/[id]" />
              <Stack.Screen name="search" />
            </>
          ) : (
            <>
              {/* Authenticated user screens */}
              <Stack.Screen name="Home" />
              <Stack.Screen name="Categories" />
              <Stack.Screen name="HotSales" />
              <Stack.Screen name="SpecialOffers" />
              <Stack.Screen name="Profile" />
              <Stack.Screen name="Cart" />
              <Stack.Screen name="Settings" />
              <Stack.Screen name="Support" />
              <Stack.Screen name="AboutUs" />
              <Stack.Screen name="ContactUs" />
              <Stack.Screen name="category/[id]" />
              <Stack.Screen name="product/[id]" />
              <Stack.Screen name="search" />
              <Stack.Screen name="Likes" />
              
              {/* Home - only allow if authenticated */}
              <Stack.Screen name="home" />
            </>
          )}
        </>
      )}
    </Stack>
  );
}