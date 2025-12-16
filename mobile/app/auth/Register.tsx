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
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiService from '../services/api'; // Update import to use apiService
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

// Define types for API responses
interface RegisterResponse {
  message: string;
  user_id: string;
  blockchain_tx_id?: string;
}

interface LoginResponse {
  access_token: string;
  token_type: string;
  user_type: string;
  user_id: string;
  blockchain_tx_id?: string;
}

interface ApiError {
  message: string;
  status?: number;
  response?: {
    data?: {
      detail?: string;
      message?: string;
    };
  };
}

export default function RegisterScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const [secureConfirmTextEntry, setSecureConfirmTextEntry] = useState(true);
  const router = useRouter();

  const formatPhoneNumber = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    
    if (cleaned.length <= 3) {
      return cleaned;
    } else if (cleaned.length <= 6) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3)}`;
    } else {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`;
    }
  };

  const handlePhoneChange = (text: string) => {
    const formatted = formatPhoneNumber(text);
    setPhone(formatted);
  };

  const validatePhone = (phoneNumber: string) => {
    const cleaned = phoneNumber.replace(/\D/g, '');
    return cleaned.length === 10;
  };

  const handleRegister = async () => {
    if (!email || !password || !confirmPassword || !name) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (!validatePhone(phone)) {
      Alert.alert('Error', 'Please enter a valid 10-digit phone number');
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

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    setIsLoading(true);

    try {
      console.log('Registering user:', email);
      
      // Call apiService.register with correct data format
      const response = await apiService.register({
        email,
        password,
        username: name, // This gets mapped to 'name' in apiService
        phone: phone.replace(/\D/g, ''), // Cleaned phone number (will be converted to +265 format)
        role: 'customer' // This gets mapped to 'type: customer' in apiService
      }) as unknown as RegisterResponse;

      console.log('Registration response:', response);

      // Check if registration was successful (your backend returns user_id on success)
      if (response.user_id) {
        try {
          // Auto-login after successful registration
          const loginResponse = await apiService.login(email, password) as unknown as LoginResponse;
          
          if (loginResponse.access_token) {
            // Store token
            await AsyncStorage.setItem('userToken', loginResponse.access_token);
            
            // Get user profile to store user data
            try {
              const userProfile = await apiService.getUserProfile();
              await AsyncStorage.setItem('userData', JSON.stringify(userProfile));
            } catch (profileError) {
              console.log('Could not get user profile, storing basic info:', profileError);
              // Store basic info if profile fetch fails
              await AsyncStorage.setItem('userData', JSON.stringify({
                id: response.user_id,
                email: email,
                name: name
              }));
            }
            
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
      } else {
        Alert.alert('Registration Failed', 'Could not create account. Please try again.');
      }
    } catch (error: unknown) {
      console.log('Registration error:', error);
      
      let errorMessage = 'Registration failed. Please try again.';
      const apiError = error as ApiError;
      
      if (apiError.message) {
        errorMessage = apiError.message;
      } else if (apiError.response?.data?.detail) {
        // Handle array of validation errors
        if (Array.isArray(apiError.response.data.detail)) {
          errorMessage = apiError.response.data.detail.map((err: any) => 
            `${err.loc?.join('.')}: ${err.msg}`
          ).join('\n');
        } else {
          errorMessage = apiError.response.data.detail;
        }
      } else if (apiError.response?.data?.message) {
        errorMessage = apiError.response.data.message;
      }
      
      Alert.alert('Registration Error', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView 
          style={styles.scrollView} 
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
            disabled={isLoading}
          >
            <Ionicons name="arrow-back" size={24} color="#4F46E5" />
          </TouchableOpacity>

          <View style={styles.header}>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Join our community today</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>
                Full Name <Text style={styles.required}>*</Text>
              </Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="person-outline" size={20} color="#6B7280" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Your full name"
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                  editable={!isLoading}
                />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>
                Email Address <Text style={styles.required}>*</Text>
              </Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="mail-outline" size={20} color="#6B7280" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="you@example.com"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  autoComplete="email"
                  editable={!isLoading}
                />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>
                Phone Number <Text style={styles.required}>*</Text>
              </Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="call-outline" size={20} color="#6B7280" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="(123) 456-7890"
                  value={phone}
                  onChangeText={handlePhoneChange}
                  keyboardType="phone-pad"
                  autoComplete="tel"
                  maxLength={14}
                  editable={!isLoading}
                />
              </View>
              <Text style={styles.hint}>10-digit number required</Text>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>
                Password <Text style={styles.required}>*</Text>
              </Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="lock-closed-outline" size={20} color="#6B7280" style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, styles.passwordInput]}
                  placeholder="Minimum 6 characters"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={secureTextEntry}
                  autoComplete="password-new"
                  editable={!isLoading}
                />
                <TouchableOpacity
                  style={styles.eyeIcon}
                  onPress={() => setSecureTextEntry(!secureTextEntry)}
                  disabled={isLoading}
                >
                  <Ionicons
                    name={secureTextEntry ? "eye-outline" : "eye-off-outline"}
                    size={20}
                    color="#6B7280"
                  />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>
                Confirm Password <Text style={styles.required}>*</Text>
              </Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="lock-closed-outline" size={20} color="#6B7280" style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, styles.passwordInput]}
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={secureConfirmTextEntry}
                  autoComplete="password-new"
                  editable={!isLoading}
                />
                <TouchableOpacity
                  style={styles.eyeIcon}
                  onPress={() => setSecureConfirmTextEntry(!secureConfirmTextEntry)}
                  disabled={isLoading}
                >
                  <Ionicons
                    name={secureConfirmTextEntry ? "eye-outline" : "eye-off-outline"}
                    size={20}
                    color="#6B7280"
                  />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.registerButton, isLoading && styles.registerButtonDisabled]}
              onPress={handleRegister}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              {isLoading ? (
                <ActivityIndicator color="white" />
              ) : (
                <>
                  <Text style={styles.registerButtonText}>Create Account</Text>
                  <Ionicons name="arrow-forward" size={20} color="white" />
                </>
              )}
            </TouchableOpacity>
            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => router.push('/auth/Login' as any)} disabled={isLoading}>
                <Text style={styles.loginLink}>Sign In</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.termsText}>
              By creating an account, you agree to our{' '}
              <Text style={styles.termsLink}>Terms of Service</Text> and{' '}
              <Text style={styles.termsLink}>Privacy Policy</Text>
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 24,
    paddingTop: 40,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  form: {
    width: '100%',
  },
  inputContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  required: {
    color: '#EF4444',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
  },
  inputIcon: {
    marginLeft: 16,
  },
  input: {
    flex: 1,
    padding: 16,
    fontSize: 16,
    color: '#111827',
  },
  passwordInput: {
    paddingRight: 50,
  },
  eyeIcon: {
    position: 'absolute',
    right: 16,
    padding: 8,
  },
  hint: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
    marginLeft: 4,
  },
  registerButton: {
    backgroundColor: '#4F46E5',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
    marginBottom: 24,
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  registerButtonDisabled: {
    backgroundColor: '#A5B4FC',
    shadowOpacity: 0,
  },
  registerButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  dividerText: {
    marginHorizontal: 16,
    color: '#6B7280',
    fontSize: 14,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    padding: 16,
    backgroundColor: '#FFFFFF',
    marginBottom: 24,
  },
  googleButtonText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '500',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  loginText: {
    fontSize: 14,
    color: '#6B7280',
  },
  loginLink: {
    fontSize: 14,
    color: '#4F46E5',
    fontWeight: '600',
  },
  termsText: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 16,
    paddingHorizontal: 20,
  },
  termsLink: {
    color: '#4F46E5',
    textDecorationLine: 'underline',
  },
});