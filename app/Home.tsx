import React from 'react';
import { 
  View, 
  Text, 
  Image, 
  StyleSheet, 
  Dimensions, 
  TextInput, 
  TouchableOpacity 
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFonts, Poppins_400Regular } from '@expo-google-fonts/poppins';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

export default function HomeScreen() {
  const [fontsLoaded] = useFonts({
    'Poppins-Regular': Poppins_400Regular,
  });

  if (!fontsLoaded) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <LinearGradient 
          colors={['#FFFFFF', '#E8EBF9']} 
          start={{ x: 0.5, y: 0 }} 
          end={{ x: 0.5, y: 1 }} 
          style={styles.gradient} 
        />
      
        
        {/* Top Bar */}
        <View style={styles.topBar}>
          {/* Logo */}
          <Image 
            source={require('@/assets/images/logo.png')} 
            style={styles.logo} 
            resizeMode="contain" 
          />
          
          {/* Icons Container */}
          <View style={styles.iconsContainer}>
            {/* Bell Icon */}
            <TouchableOpacity style={styles.iconButton}>
              <Image 
                source={require('@/assets/images/bell.png')} 
                style={styles.bellIcon} 
                resizeMode="contain"
              />
            </TouchableOpacity>
            
            {/* Shopping Cart Icon */}
            <TouchableOpacity style={styles.iconButton}>
              <Image 
                source={require('@/assets/images/shopping-cart.png')} 
                style={styles.cartIcon} 
                resizeMode="contain"
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Search Bar - Frame 6934 */}
        <View style={styles.searchContainer}>
          <View style={styles.searchField}>
            {/* Search Icon */}
            <Image 
              source={require('@/assets/images/Search.png')} 
              style={styles.searchIcon} 
              resizeMode="contain"
            />
            
            {/* Search Input */}
            <TextInput
              style={styles.searchInput}
              placeholder="Search products"
              placeholderTextColor="#757575"
            />
          </View>
          
          {/* Notification Icon */}
          <TouchableOpacity style={styles.notificationButton}>
            <Image 
              source={require('@/assets/images/bell.png')} 
              style={styles.notificationIcon} 
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>

        {/* Main Content */}
        <View style={styles.content}>
          <Text style={styles.tagline}>Welcome to TechAvenApp Home!</Text>
        </View>
      </View>
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
  gradient: { 
    position: 'absolute', 
    width: width, 
    height: height 
  },
  backgroundShape: { 
    position: 'absolute', 
    width: width, 
    height: height 
  },
  // Top Bar Styles
  topBar: {
    width: '100%',
    height: 64,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 16,
    gap: 24,
    opacity: 1,
  },
  logo: {
    width: 140,
    height: 28.13,
    opacity: 1,
  },
  iconsContainer: {
    flexDirection: 'row',
    gap: 24,
    alignItems: 'center',
  },
  iconButton: {
    padding: 4,
  },
  bellIcon: {
    width: 20,
    height: 20,
    opacity: 1,
  },
  cartIcon: {
    width: 20,
    height: 20,
    opacity: 1,
  },
  // Search Bar Styles - Frame 6934
  searchContainer: {
    width: '100%',
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingTop: 16,
    paddingRight: 24,
    paddingBottom: 16,
    paddingLeft: 24,
    opacity: 1,
  },
  searchField: {
    flex: 1,
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    paddingHorizontal: 12,
  },
  searchIcon: {
    width: 12.51,
    height: 12.81,
    opacity: 1,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontFamily: 'Poppins-Regular',
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 14,
    letterSpacing: 0,
    color: '#000000',
  },
  notificationButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  notificationIcon: {
    width: 16,
    height: 16,
    opacity: 1,
  },
  // Main Content
  content: { 
    flex: 1, 
    alignItems: 'center', 
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  tagline: { 
    fontFamily: 'Poppins-Regular',
    fontWeight: '400', 
    fontSize: 16, 
    lineHeight: 16, 
    letterSpacing: 0, 
    textAlign: 'center', 
    color: '#555',
    marginTop: 20,
  },
});