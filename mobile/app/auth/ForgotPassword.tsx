import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator,
  Image,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const { width: screenWidth } = Dimensions.get('window');

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSendResetLink = async () => {
    if (!email) {
      Alert.alert('Error', 'Please enter your email address');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      Alert.alert(
        'Email Sent',
        'We have sent a password reset link to your email address. Please check your inbox.',
        [
          {
            text: 'OK',
            onPress: () => router.back()
          }
        ]
      );
    }, 1500);
  };

  // Check if email is provided and valid
  const isEmailValid = email.length > 0 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const buttonBackgroundColor = isEmailValid ? '#4F46E5' : '#E5E7EB';
  const buttonTextColor = isEmailValid ? 'white' : '#9CA3AF';

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Back Button Only */}
          <View style={styles.backButtonContainer}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => router.back()}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="arrow-back" size={24} color="#111827" />
            </TouchableOpacity>
          </View>

          {/* Large Image */}
          <View style={styles.imageContainer}>
            <Image 
              source={require('@/assets/images/top.png')}
              style={styles.topImage}
              resizeMode="contain"
            />
          </View>

          {/* Email Input Field */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Enter email"
              placeholderTextColor="#9CA3AF"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              autoComplete="email"
              editable={!isLoading}
              returnKeyType="done"
            />
          </View>

          {/* Send Button */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[
                styles.sendButton, 
                { 
                  backgroundColor: buttonBackgroundColor,
                },
                isLoading && styles.sendButtonDisabled
              ]}
              onPress={handleSendResetLink}
              disabled={!isEmailValid || isLoading}
              activeOpacity={0.8}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={[styles.sendButtonText, { color: buttonTextColor }]}>
                  Send
                </Text>
              )}
            </TouchableOpacity>
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
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'ios' ? 20 : 40,
  },
  backButtonContainer: {
    marginBottom: 40,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageContainer: {
    width: '100%',
    height: 250,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 50,
  },
  topImage: {
    width: screenWidth * 0.7,
    height: 250,
    maxWidth: 300,
    maxHeight: 250,
  },
  inputContainer: {
    width: '100%',
    marginBottom: 40,
  },
  input: {
    width: '100%',
    height: 56,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingHorizontal: 20,
    fontSize: 16,
    color: '#111827',
    fontFamily: 'System',
    backgroundColor: '#FFFFFF',
  },
  buttonContainer: {
    width: '100%',
  },
  sendButton: {
    width: '100%',
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.7,
  },
  sendButtonText: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'System',
  },
});