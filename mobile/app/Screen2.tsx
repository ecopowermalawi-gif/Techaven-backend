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
          {/* Main Heading */}
          <Text style={styles.mainHeading}>
            All Your Favorite{'\n'}Electronics Shops in One
          </Text>

          {/* Center Image */}
          <Image
            source={require('@/assets/images/screen2.png')}
            style={styles.centerImage}
            resizeMode="contain"
          />

        

          {/* Description */}
          <Text style={styles.description}>
            Find the best deals on electronics from multiple stores.
            Compare products and make smart buying decisions.
          </Text>
            {/* Indicator Bars */}
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

          {/* Next Button */}
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
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  mainHeading: {
    fontFamily: 'Proxima Nova',
    fontWeight: '400',
    fontSize: 18.1,
    lineHeight: 18.1,
    letterSpacing: 0,
    textAlign: 'center',
    color: '#000',
    marginBottom: 40,
    marginTop: 60,
  },
  centerImage: { width: width * 0.9, height: 300, marginBottom: 30 },
  barsContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  bar: { width: 40, height: 6, borderRadius: 3 },
  activeBar: { backgroundColor: '#007AFF' },
  inactiveBar: { backgroundColor: '#CCC' },
  description: {
    fontFamily: 'Proxima Nova',
    fontWeight: '400',
    fontSize: 18.1,
    lineHeight: 18.1,
    letterSpacing: 0,
    textAlign: 'center',
    color: '#555',
    marginBottom: 40,
    marginHorizontal: 20,
  },
  nextButton: {
    backgroundColor: '#007AFF',
    width: 376,
    height: 67.2,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 1,
  },
  nextButtonText: { color: 'white', fontSize: 18, fontWeight: '600', textAlign: 'center' },
});
