import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Dimensions, ScrollView, StatusBar } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

export default function Screen2() {
  const router = useRouter();
  const activeIndex = 1; // Screen2 is active

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
            source={require('@/assets/images/screen2.png')}
            style={styles.centerImage}
            resizeMode="contain"
          />

          {/* Spacer to push description and bars down */}
          <View style={styles.middleSpacer} />

          {/* Description - Pushed Down */}
          <Text style={styles.description}>
            Find the best deals on electronics from multiple stores.
            Compare products and make smart buying decisions.
          </Text>

          {/* Indicator Bars - Pushed Down */}
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

          {/* Spacer to push button down */}
          <View style={styles.bottomSpacer} />

          {/* Next Button - Pushed Down */}
          <TouchableOpacity
            style={styles.nextButton}
            onPress={() => router.push('/Screen3')}
          >
            <Text style={styles.nextButtonText}>Next →</Text>
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
    paddingTop: 10, // Reduced to push heading higher
  },
  mainHeading: {
    fontFamily: 'Proxima Nova',
    fontWeight: '400',
    fontSize: 26, // Increased from 18.1 to match Screen1
    lineHeight: 38, // Increased from 18.1 to match Screen1
    letterSpacing: -0.5, // Added to match Screen1
    textAlign: 'center',
    color: '#000',
    marginTop: 10, // Reduced from 60 to push heading higher
    marginBottom: 20, // Reduced from 40
  },
  centerImage: { 
    width: width * 0.95, // Increased from 0.9 to 0.95
    height: 350, // Increased from 300 to 350
    marginBottom: 10, // Reduced from 30
  },
  middleSpacer: {
    flex: 1, // This pushes description and bars down
    minHeight: 40, // Minimum space between image and description
  },
  barsContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  bar: { 
    width: 40, 
    height: 6, 
    borderRadius: 3 
  },
  activeBar: { backgroundColor: '#007AFF' },
  inactiveBar: { backgroundColor: '#CCC' },
  description: {
    fontFamily: 'Proxima Nova',
    fontWeight: '400',
    fontSize: 18, // Changed from 18.1 to 18 to match Screen1
    lineHeight: 18,
    letterSpacing: 0,
    textAlign: 'center',
    color: '#555',
    marginBottom: 20, // Reduced from 40
    marginHorizontal: 20,
  },
  bottomSpacer: {
    flex: 1, // This pushes the button to the bottom
    minHeight: 20,
  },
  nextButton: {
    backgroundColor: '#007AFF',
    width: 376,
    height: 67.2,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 1,
    marginTop: 'auto', // Ensures button stays at bottom
  },
  nextButtonText: { 
    color: 'white', 
    fontSize: 18, 
    fontWeight: '600', 
    textAlign: 'center' 
  },
});