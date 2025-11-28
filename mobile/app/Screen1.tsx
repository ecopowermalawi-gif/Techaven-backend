import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Dimensions, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

export default function Screen1() {
  const router = useRouter();
  const activeIndex = 0; // Screen1 is active (0-based)

  return (
    <View style={styles.container}>
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
            source={require('@/assets/images/screen1.png')}
            style={styles.centerImage}
            resizeMode="contain"
          />

          {/* Spacer to push description and bars down */}
          <View style={styles.middleSpacer} />

          {/* Description - Pushed Down */}
          <Text style={styles.description}>
            Discover and buy top-quality electronics from
            verified suppliers across Malawi, all in one app.
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
            onPress={() => router.push('/Screen2')}
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
    paddingTop: 10, // Further reduced to push heading even higher
  },
  mainHeading: {
    fontFamily: 'System',
    fontWeight: '400',
    fontSize: 26,
    lineHeight: 38,
    letterSpacing: -0.5,
    textAlign: 'center',
    color: '#000',
    marginTop: 10, // Further reduced to push heading higher
    marginBottom: 20,
  },
  centerImage: { 
    width: width * 0.95, // Increased from 0.9 to 0.95
    height: 350, // Increased from 300 to 350
    marginBottom: 10, // Reduced margin since we're using spacer
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
    borderRadius: 3,
  },
  activeBar: { backgroundColor: '#007AFF' },
  inactiveBar: { backgroundColor: '#CCC' },
  description: {
    fontFamily: 'System',
    fontWeight: '400',
    fontSize: 18,
    lineHeight: 18,
    letterSpacing: 0,
    textAlign: 'center',
    color: '#555',
    marginBottom: 20, // Reduced since spacer handles the pushing
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
    marginTop: 'auto',
  },
  nextButtonText: { 
    color: 'white', 
    fontSize: 18, 
    fontWeight: '600', 
    textAlign: 'center' 
  },
});