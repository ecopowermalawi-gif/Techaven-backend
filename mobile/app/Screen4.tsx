import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React from 'react';
import { Dimensions, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';

const { width, height } = Dimensions.get('window');

export default function Screen4() {
  const router = useRouter();

  // Load Zalando fonts
  const [fontsLoaded] = useFonts({
    'Zalando Sans Expanded': require('@/assets/fonts/ZalandoSans-Expanded.ttf'),
  });

  const handleBack = () => {
    router.back(); // Go back to previous screen
  };

  // Handle login navigation
  const handleLogin = () => {
    router.push('/auth/Login');
  };

  // Handle phone login navigation
  const handlePhoneLogin = () => {
    router.push('/auth/phoneNumber');
  };

  // Show loading or fallback until fonts are loaded
  if (!fontsLoaded) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#FFFFFF', '#E8EBF9']}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={styles.gradient}
      />
    
      <SafeAreaView style={styles.safeArea}>
        {/* Back Button - Top Left Corner */}
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Text style={styles.backButtonText}>‹ Back</Text>
        </TouchableOpacity>

        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Logo - Reduced space from top */}
          <Image
            source={require('@/assets/images/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />

          {/* Center Image - Increased height */}
          <Image
            source={require('@/assets/images/screen4.png')}
            style={styles.centerImage}
            resizeMode="contain"
          />

          {/* Description */}
          <Text style={styles.description}>
            Continue With
          </Text>

          {/* Auth Options */}
          <View style={styles.authOptionsContainer}>
            {/* Google Auth Option */}
            <TouchableOpacity style={styles.authOption}>
              <View style={styles.authRow}>
                <Image 
                  source={require('@/assets/images/google-icon.png')} 
                  style={styles.authIcon} 
                />
                <Text style={styles.authText}>Google</Text>
              </View>
            </TouchableOpacity>

            {/* Login Option */}
            <TouchableOpacity 
              style={styles.authOption}
              onPress={handleLogin}
            >
              <Text style={styles.authText}>Login</Text>
            </TouchableOpacity>

            {/* Phone Login Text with blue link */}
            <View style={styles.phoneOptionContainer}>
              <Text style={styles.phoneText}>
                Or login with{' '}
                <Text style={styles.phoneLink} onPress={handlePhoneLogin}>
                  Phone Number
                </Text>
              </Text>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  safeArea: { 
    flex: 1,
  },
  gradient: { 
    position: 'absolute', 
    width: width, 
    height: height 
  },
  // Back Button Styles
  backButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 30,
    left: 20,
    zIndex: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 16,
    color: '#040525',
    marginTop: -2,
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingTop: 40, // Further reduced from 60 to 40
    paddingBottom: 20,
  },
  logo: {
    width: 180,
    height: 60,
    marginBottom: 15, // Reduced from 20
    marginTop: 0, // Removed margin top to bring logo closer to notification bar
  },
  centerImage: { 
    width: width * 0.9, // Increased back to 90%
    height: 320, // Increased from 280 to 320
    marginBottom: 25, // Adjusted
  },
  description: {
    fontFamily: 'Zalando Sans Expanded',
    fontWeight: '400',
    fontSize: 20,
    lineHeight: 20,
    letterSpacing: 0,
    textAlign: 'center',
    color: '#555',
    marginHorizontal: 20,
    marginBottom: 30,
  },
  authOptionsContainer: {
    width: '100%',
    alignItems: 'center',
    gap: 16,
    marginTop: 10,
  },
  authOption: {
    width: '100%',
    maxWidth: 376,
    height: 56,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  authRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  authIcon: {
    width: 20,
    height: 20,
  },
  authText: {
    fontFamily: 'Zalando Sans Expanded',
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 16,
    textAlign: 'center',
    color: '#333',
  },
  // Phone option container
  phoneOptionContainer: {
    width: '100%',
    maxWidth: 376,
    marginTop: 10,
    alignItems: 'center',
  },
  phoneText: {
    fontFamily: 'Zalando Sans Expanded',
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 14,
    textAlign: 'center',
    color: '#666',
  },
  phoneLink: {
    fontFamily: 'Zalando Sans Expanded',
    fontWeight: '600',
    color: '#232CAD', // Blue color matching your app theme
    textDecorationLine: 'underline',
  },
});