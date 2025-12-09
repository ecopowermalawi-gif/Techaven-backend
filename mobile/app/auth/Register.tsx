// app/auth/Register.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { userService } from '../api';
import { useRouter } from 'expo-router';

// Define types for API responses
interface RegisterResponse {
  success: boolean;
  message: string;
  userId?: string;
}

interface LoginResponse {
  token: string;
  user: {
    id: string;
    email: string;
    username?: string;
    roles?: string[];
  };
}

interface ApiError {
  message: string;
  status?: number;
  response?: {
    data?: {
      message?: string;
    };
  };
}

export default function RegisterScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async () => {
    // Validation
    if (!email || !password || !confirmPassword || !username) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);

    try {
      console.log('Registering user:', email);
      
      // Call your backend register endpoint with default role 'customer'
      const response = await userService.register({
        email,
        password,
        username,
        role: 'customer' // Default role is customer
      }) as unknown as RegisterResponse;

      console.log('Registration response:', response);

      // After successful registration, automatically login
      if (response.userId || response.success) {
        // Try to login with the new credentials
        try {
          const loginResponse = await userService.login(email, password) as unknown as LoginResponse;
          
          if (loginResponse.token && loginResponse.user) {
            // Store token and user data
            await AsyncStorage.setItem('userToken', loginResponse.token);
            await AsyncStorage.setItem('userData', JSON.stringify(loginResponse.user));
            
            console.log('Registration and login successful');
            
            Alert.alert(
              'Success',
              'Account created successfully!',
              [{ text: 'OK', onPress: () => router.replace('/Home' as any) }]
            );
          }
        } catch (loginError: unknown) {
          console.log('Auto-login failed:', loginError);
          Alert.alert(
            'Account Created',
            'Your account was created successfully! Please log in.',
            [{ text: 'OK', onPress: () => router.push('/auth/login' as any) }]
          );
        }
      }
    } catch (error: unknown) {
      console.log('Registration error:', error);
      
      let errorMessage = 'Registration failed. Please try again.';
      
      const apiError = error as ApiError;
      
      if (apiError.message) {
        errorMessage = apiError.message;
      } else if (apiError.response?.data?.message) {
        errorMessage = apiError.response.data.message;
      }
      
      Alert.alert('Registration Error', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Create Account</Text>
      <Text style={styles.subtitle}>Join Techaven today</Text>

      <View style={styles.form}>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Email Address *</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            autoComplete="email"
            editable={!isLoading}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Username *</Text>
          <TextInput
            style={styles.input}
            placeholder="Choose a username"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            editable={!isLoading}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Password *</Text>
          <TextInput
            style={styles.input}
            placeholder="Create a password (min. 6 characters)"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoComplete="password-new"
            editable={!isLoading}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Confirm Password *</Text>
          <TextInput
            style={styles.input}
            placeholder="Confirm your password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            autoComplete="password-new"
            editable={!isLoading}
          />
        </View>

        <TouchableOpacity
          style={[styles.registerButton, isLoading && styles.registerButtonDisabled]}
          onPress={handleRegister}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.registerButtonText}>Create Account</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.loginButton}
          onPress={() => router.back()}
          disabled={isLoading}
        >
          <Text style={styles.loginButtonText}>Already have an account? Sign In</Text>
        </TouchableOpacity>

        <Text style={styles.termsText}>
          By creating an account, you agree to our Terms of Service and Privacy Policy
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 40,
  },
  form: {
    width: '100%',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  registerButton: {
    backgroundColor: '#2196F3',
    borderRadius: 8,
    padding: 18,
    alignItems: 'center',
    marginBottom: 20,
  },
  registerButtonDisabled: {
    backgroundColor: '#90CAF9',
  },
  registerButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loginButton: {
    padding: 15,
    alignItems: 'center',
  },
  loginButtonText: {
    color: '#2196F3',
    fontSize: 14,
  },
  termsText: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    marginTop: 20,
    paddingHorizontal: 20,
  },
});