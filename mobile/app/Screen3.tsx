import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Dimensions, ScrollView, StatusBar } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

export default function Screen3() {
  const router = useRouter();
  const activeIndex = 2; // Screen3 is active

  // Function to handle onboarding completion
  const handleOnboardingComplete = async () => {
    // Mark onboarding as completed
    // await AsyncStorage.setItem('onboardingCompleted', 'true');
    
    // Navigate to Home
    router.replace('/Home'); // Use replace so user can't go back to onboarding
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <LinearGradient
        colors={['#FFFFFF', '#E8EBF9']}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={styles.gradient}
      />
      <Image
        source={require('@/assets/images/landing-shape.png')}
        style={styles.backgroundShape}
        resizeMode="cover"
      />

      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Main Heading - Pushed Up */}
          <Text style={styles.mainHeading}>
            All Your Favorite{'\n'}Electronics Shops in One
          </Text>

          {/* Center Image - Increased Size */}
          <Image
            source={require('@/assets/images/screen3.png')}
            style={styles.centerImage}
            resizeMode="contain"
          />

          {/* Spacer to push content down */}
          <View style={styles.middleSpacer} />

          {/* Description - Pushed Down */}
          <Text style={styles.description}>
            Let's get started! Sign in or create an account to explore the best electronics deals.
          </Text>

          {/* Indicator Bars - Between Description and Button */}
          <View style={styles.barsContainer}>
            {[0, 1, 2].map((i) => (
              <View
                key={i}
                style={[
                  styles.bar,
                  i === activeIndex ? styles.activeBar : styles.inactiveBar,
                ]}
              />
            ))}
          </View>

          {/* Spacer to push button down - Reduced distance */}
          <View style={styles.bottomSpacer} />

          {/* Get Started Button - Now goes to Home */}
          <TouchableOpacity
            style={styles.nextButton}
            onPress={handleOnboardingComplete}
          >
            <Text style={styles.nextButtonText}>Get Started</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  gradient: { position: 'absolute', width: width, height: height },
  backgroundShape: { position: 'absolute', width: width, height: height },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 40,
    paddingTop: 10,
  },
  mainHeading: {
    fontFamily: 'Poppins',
    fontWeight: '400',
    fontSize: 26,
    lineHeight: 38,
    letterSpacing: -0.5,
    textAlign: 'center',
    color: '#000',
    marginTop: 10,
    marginBottom: 20,
  },
  centerImage: { 
    width: width * 0.95,
    height: 350,
    marginBottom: 10,
  },
  middleSpacer: {
    flex: 1,
    minHeight: 40,
  },
  barsContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  bar: { 
    width: 40, 
    height: 6, 
    borderRadius: 3 
  },
  activeBar: { backgroundColor: '#007AFF' },
  inactiveBar: { backgroundColor: '#CCC' },
  description: {
    fontFamily: 'Poppins',
    fontWeight: '400',
    fontSize: 18,
    lineHeight: 18,
    letterSpacing: 0,
    textAlign: 'center',
    color: '#555',
    marginBottom: 15,
    marginHorizontal: 20,
  },
  bottomSpacer: {
    flex: 0.5,
    minHeight: 10,
  },
  nextButton: {
    backgroundColor: '#007AFF',
    width: 376,
    height: 67.2,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 1,
    marginTop: 'auto',
  },
  nextButtonText: { 
    color: 'white', 
    fontSize: 18, 
    fontWeight: '600', 
    fontFamily: 'Poppins',
    textAlign: 'center' 
  },
});