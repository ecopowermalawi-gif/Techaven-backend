import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Font from 'expo-font';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

const { width, height } = Dimensions.get('window');

type RootStackParamList = {
  Splash: undefined;
  Screen1: undefined;
  Screen2: undefined;
  Screen3: undefined;
  Screen4: undefined;
  phoneNumber: undefined;
  Login: undefined;
  Register: undefined;
  Auth: undefined;
  Home: undefined;
  Profile: undefined;
  Categories: undefined;
  ProductDetails: { productId: string };
  Cart: undefined;
  Checkout: undefined;
  OrderConfirmation: undefined;
};

type SplashScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Splash'
>;

export default function SplashScreen() {
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const navigation = useNavigation<SplashScreenNavigationProp>();

  useEffect(() => {
    Font.loadAsync({
      'Proxima Nova': require('@/assets/fonts/Proximanova-Regular.otf'),
    }).then(() => setFontsLoaded(true));

    const timer = setTimeout(() => {
      navigation.replace('Screen1'); // Navigate to first onboarding screen
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  if (!fontsLoaded) return null;

  return (
    <>
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
      <View style={styles.content}>
        <Image
          source={require('@/assets/images/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.tagline}>Your One-Stop Shop for Electronics</Text>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  gradient: {
    position: 'absolute',
    width: width,
    height: height,
  },
  backgroundShape: {
    position: 'absolute',
    width: width,
    height: height,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 180,
    height: 60,
    marginBottom: 10,
  },
  tagline: {
    fontFamily: 'Proxima Nova',
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 16,
    letterSpacing: 0,
    textAlign: 'center',
    color: '#555',
  },
});
