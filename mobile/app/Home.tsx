import React, { useState } from 'react';
import { 
  View, 
  Text, 
  Image, 
  StyleSheet, 
  Dimensions, 
  TextInput, 
  TouchableOpacity,
  ScrollView,
  ImageSourcePropType,
  FlatList,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFonts, Poppins_400Regular } from '@expo-google-fonts/poppins';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

const { width, height } = Dimensions.get('window');

export default function HomeScreen() {
  const [fontsLoaded] = useFonts({
    'Poppins-Regular': Poppins_400Regular,
  });
  const [activeTab, setActiveTab] = useState('home');
  
  // Use Expo Router's useRouter hook
  const router = useRouter();

  // Hot Sales Products Data with Icons
  const hotSalesProducts = [
    {
      id: '1',
      name: 'Wireless Earbuds',
      price: '$99.99',
      rating: '4.5',
      icon: '🎧',
    },
    {
      id: '2',
      name: 'Smart Watch',
      price: '$199.99',
      rating: '4.8',
      icon: '⌚',
    },
    {
      id: '3',
      name: 'Bluetooth Speaker',
      price: '$149.99',
      rating: '4.7',
      icon: '🔊',
    },
    {
      id: '4',
      name: 'Gaming Headset',
      price: '$129.99',
      rating: '4.6',
      icon: '🎮',
    },
    {
      id: '5',
      name: 'Phone Case',
      price: '$29.99',
      rating: '4.4',
      icon: '📱',
    },
    {
      id: '6',
      name: 'Laptop',
      price: '$899.99',
      rating: '4.9',
      icon: '💻',
    },
  ];

  if (!fontsLoaded) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  // Navigation functions
  const navigateToCategories = () => {
    router.push('/Categories');
  };

  const navigateToHotSales = () => {
    router.push('/HotSales');
  };

  const navigateToSpecialOffers = () => {
    router.push('/SpecialOffers');
  };

  const navigateToProfile = () => {
    router.push('/Profile');
  };

  const navigateToCart = () => {
    router.push('/Cart');
  };

  const navigateToLikes = () => {
    router.push('/Likes');
  };

  const navigateToNotifications = () => {
    router.push('/Notifications');
  };

  // Bottom tab navigation handler
  const handleTabPress = (tabName: string) => {
    setActiveTab(tabName);
    switch (tabName) {
      case 'home':
        // Already on home, no navigation needed
        break;
      case 'Likes':
        navigateToLikes();
        break;
      case 'Cart':
        navigateToCart();
        break;
      case 'Profile':
        navigateToProfile();
        break;
    }
  };

  interface TabButtonProps {
    icon: ImageSourcePropType;
    label: string;
    isActive?: boolean;
    onPress: () => void;
  }

  const TabButton: React.FC<TabButtonProps> = ({ icon, label, isActive, onPress }) => (
    <TouchableOpacity style={styles.tabButton} onPress={onPress}>
      <Image 
        source={icon} 
        style={[
          styles.tabIcon,
          isActive && styles.activeTabIcon
        ]} 
        resizeMode="contain"
      />
      <Text style={[
        styles.tabLabel,
        isActive && styles.activeTabLabel
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  // Render Hot Sales Product Item with Icons
  const renderHotSalesItem = ({ item }: { item: typeof hotSalesProducts[0] }) => (
    <TouchableOpacity 
      style={styles.hotSalesCard}
      activeOpacity={0.9}
    >
      <View style={styles.hotSalesIconContainer}>
        <Text style={styles.hotSalesIcon}>{item.icon}</Text>
      </View>
      <View style={styles.hotSalesInfo}>
        <Text style={styles.hotSalesName} numberOfLines={2}>{item.name}</Text>
        <Text style={styles.hotSalesPrice}>{item.price}</Text>
        <Text style={styles.hotSalesRating}>⭐ {item.rating}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.mainContainer}>
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
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
                {/* Bell Icon - Updated with navigation */}
                <TouchableOpacity style={styles.iconButton} onPress={navigateToNotifications}>
                  <Image 
                    source={require('@/assets/images/bell.png')} 
                    style={styles.bellIcon} 
                    resizeMode="contain"
                  />
                </TouchableOpacity>
                
                {/* Shopping Cart Icon - Updated with navigation */}
                <TouchableOpacity style={styles.iconButton} onPress={navigateToCart}>
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
              
              {/* Notification Icon - Updated with navigation */}
              <TouchableOpacity style={styles.notificationButton} onPress={navigateToNotifications}>
                <Image 
                  source={require('@/assets/images/bell.png')} 
                  style={styles.notificationIcon} 
                  resizeMode="contain"
                />
              </TouchableOpacity>
            </View>

            {/* Blue Frame Section */}
            <View style={styles.blueFrame}>
              {/* You can add content inside this blue frame later */}
            </View>

            {/* Categories Header Section */}
            <View style={styles.categoriesHeader}>
              <Text style={styles.categoriesTitle}>Categories</Text>
              <TouchableOpacity onPress={navigateToCategories}>
                <Text style={styles.seeAllText}>See all</Text>
              </TouchableOpacity>
            </View>

            {/* Categories Grid Preview */}
            <View style={styles.categoriesPreview}>
              {/* Category 1 */}
              <TouchableOpacity style={styles.categoryPreviewItem}>
                <View style={styles.categoryPreviewIcon}>
                  <Text style={styles.categoryPreviewEmoji}>📱</Text>
                </View>
                <Text style={styles.categoryPreviewText}>Phones</Text>
              </TouchableOpacity>

              {/* Category 2 */}
              <TouchableOpacity style={styles.categoryPreviewItem}>
                <View style={styles.categoryPreviewIcon}>
                  <Text style={styles.categoryPreviewEmoji}>💻</Text>
                </View>
                <Text style={styles.categoryPreviewText}>Laptops</Text>
              </TouchableOpacity>

              {/* Category 3 */}
              <TouchableOpacity style={styles.categoryPreviewItem}>
                <View style={styles.categoryPreviewIcon}>
                  <Text style={styles.categoryPreviewEmoji}>🎧</Text>
                </View>
                <Text style={styles.categoryPreviewText}>Audio</Text>
              </TouchableOpacity>

              {/* Category 4 */}
              <TouchableOpacity style={styles.categoryPreviewItem}>
                <View style={styles.categoryPreviewIcon}>
                  <Text style={styles.categoryPreviewEmoji}>⌚</Text>
                </View>
                <Text style={styles.categoryPreviewText}>Watches</Text>
              </TouchableOpacity>
            </View>

            {/* Banner Default */}
            <TouchableOpacity 
              style={styles.bannerDefault}
              activeOpacity={0.9}
            >
              {/* Banner content can be added here */}
            </TouchableOpacity>

            {/* Hot Sells Header Section */}
            <View style={styles.hotSellsHeader}>
              <Text style={styles.hotSellsTitle}>Hot Sales</Text>
              <TouchableOpacity onPress={navigateToHotSales}>
                <Text style={styles.seeAllText}>See all</Text>
              </TouchableOpacity>
            </View>

            {/* Hot Sales Horizontal Scroll */}
            <View style={styles.hotSalesContainer}>
              <FlatList
                data={hotSalesProducts}
                renderItem={renderHotSalesItem}
                keyExtractor={(item) => item.id}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.hotSalesList}
                snapToAlignment="start"
                decelerationRate="fast"
                snapToInterval={160} // Card width + margin
              />
            </View>

            {/* Banner Default - Below Hot Sells */}
            <TouchableOpacity 
              style={styles.secondBannerDefault}
              activeOpacity={0.9}
            >
              {/* Banner content can be added here */}
            </TouchableOpacity>

            {/* Tab Header */}
            <View style={styles.tabHeader}>
              <Text style={styles.tabHeaderText}>Special Offers</Text>
              <TouchableOpacity onPress={navigateToSpecialOffers}>
                <Text style={styles.seeAllText}>See all</Text>
              </TouchableOpacity>
            </View>

            {/* Product Property Grid */}
            <View style={styles.productPropertyGrid}>
              {/* Product Property 1 */}
              <TouchableOpacity 
                style={styles.productPropertyCard}
                activeOpacity={0.9}
              >
                <View style={styles.productIconContainer}>
                  <Text style={styles.productIcon}>🎧</Text>
                </View>
                <View style={styles.productInfo}>
                  <Text style={styles.productName}>Wireless Headphones</Text>
                  <Text style={styles.productPrice}>$129.99</Text>
                  <Text style={styles.productRating}>⭐ 4.3</Text>
                </View>
              </TouchableOpacity>

              {/* Product Property 2 */}
              <TouchableOpacity 
                style={styles.productPropertyCard}
                activeOpacity={0.9}
              >
                <View style={styles.productIconContainer}>
                  <Text style={styles.productIcon}>🔊</Text>
                </View>
                <View style={styles.productInfo}>
                  <Text style={styles.productName}>Bluetooth Speaker</Text>
                  <Text style={styles.productPrice}>$149.99</Text>
                  <Text style={styles.productRating}>⭐ 4.7</Text>
                </View>
              </TouchableOpacity>
            </View>

            {/* Second Banner Default */}
            <TouchableOpacity 
              style={styles.bannerDefault}
              activeOpacity={0.9}
            >
              {/* Banner content can be added here */}
            </TouchableOpacity>

          
          </View>
        </ScrollView>

        {/* Bottom Tab Bar - Updated with navigation */}
        <View style={styles.bottomTabBar}>
          <TabButton
            icon={require('@/assets/images/home.png')}
            label="Home"
            isActive={activeTab === 'home'}
            onPress={() => handleTabPress('home')}
          />
          <TabButton
            icon={require('@/assets/images/heart.png')}
            label="Likes"
            isActive={activeTab === 'Likes'}
            onPress={() => handleTabPress('Likes')}
          />
          <TabButton
            icon={require('@/assets/images/bag.png')}
            label="Cart"
            isActive={activeTab === 'Cart'}
            onPress={() => handleTabPress('Cart')}
          />
          <TabButton
            icon={require('@/assets/images/user.png')}
            label="Profile"
            isActive={activeTab === 'Profile'}
            onPress={() => handleTabPress('Profile')}
          />
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
  mainContainer: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingBottom: 80,
  },
  gradient: { 
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
  // Search Bar Styles
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
  // Blue Frame Section
  blueFrame: {
    width: 382,
    height: 149,
    backgroundColor: '#232CAD',
    borderRadius: 18,
    opacity: 1,
    alignSelf: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  // Categories Header Section
  categoriesHeader: {
    width: 382,
    height: 25,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    opacity: 1,
    alignSelf: 'center',
    marginBottom: 16,
  },
  categoriesTitle: {
    fontFamily: 'Poppins-Regular',
    fontWeight: '400',
    fontSize: 18,
    lineHeight: 25,
    letterSpacing: 0,
    color: '#000000',
  },
  // Categories Preview
  categoriesPreview: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  categoryPreviewItem: {
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 8,
  },
  categoryPreviewIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#F2F2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryPreviewEmoji: {
    fontSize: 24,
  },
  categoryPreviewText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
    color: '#000000',
    textAlign: 'center',
  },
  // Banner Default
  bannerDefault: {
    width: 379,
    height: 150,
    opacity: 1,
    paddingTop: 20,
    paddingRight: 24,
    paddingBottom: 20,
    paddingLeft: 24,
    gap: 10,
    borderRadius: 10,
    backgroundColor: '#F0F0F0',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    alignSelf: 'center',
    marginBottom: 24,
  },
  // Second Banner Default - Below Hot Sells
  secondBannerDefault: {
    width: 379,
    height: 150,
    opacity: 1,
    paddingTop: 20,
    paddingRight: 24,
    paddingBottom: 20,
    paddingLeft: 24,
    gap: 10,
    borderRadius: 10,
    backgroundColor: '#11123A',
    alignSelf: 'center',
    marginBottom: 24,
  },
  // Hot Sells Header Section
  hotSellsHeader: {
    width: 382,
    height: 25,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    opacity: 1,
    alignSelf: 'center',
    marginBottom: 16,
  },
  hotSellsTitle: {
    fontFamily: 'Poppins-Regular',
    fontWeight: '400',
    fontSize: 18,
    lineHeight: 25,
    letterSpacing: 0,
    color: '#000000',
  },
  // Hot Sales Horizontal Scroll
  hotSalesContainer: {
    height: 200,
    marginBottom: 24,
  },
  hotSalesList: {
    paddingHorizontal: 24,
    paddingVertical: 8,
    gap: 16,
  },
  hotSalesCard: {
    width: 140,
    height: 180,
    backgroundColor: '#F2F2FF',
    borderRadius: 12,
    padding: 16,
    marginRight: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    alignItems: 'center',
  },
  hotSalesIconContainer: {
    width: 80,
    height: 80,
    backgroundColor: '#E0E0FF',
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  hotSalesIcon: {
    fontSize: 32,
  },
  hotSalesInfo: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  hotSalesName: {
    fontFamily: 'Poppins-Regular',
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 16,
    letterSpacing: 0,
    color: '#000000',
    textAlign: 'center',
    marginBottom: 8,
  },
  hotSalesPrice: {
    fontFamily: 'Poppins-Regular',
    fontWeight: '600',
    fontSize: 16,
    lineHeight: 18,
    letterSpacing: 0,
    color: '#232CAD',
    marginBottom: 4,
  },
  hotSalesRating: {
    fontFamily: 'Poppins-Regular',
    fontWeight: '400',
    fontSize: 12,
    lineHeight: 14,
    letterSpacing: 0,
    color: '#666666',
  },
  // Tab Header
  tabHeader: {
    width: 376,
    height: 25,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    opacity: 1,
    alignSelf: 'center',
    marginBottom: 16,
  },
  tabHeaderText: {
    fontFamily: 'Poppins-Regular',
    fontWeight: '400',
    fontSize: 18,
    lineHeight: 25,
    letterSpacing: 0,
    color: '#000000',
  },
  seeAllText: {
    fontFamily: 'Poppins-Regular',
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 25,
    letterSpacing: 0,
    color: '#232CAD',
    textDecorationLine: 'underline',
  },
  // Products Grid
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    gap: 16,
    marginBottom: 24,
  },
  productCard: {
    width: 183.5,
    height: 240,
    opacity: 1,
    paddingTop: 15,
    paddingRight: 10,
    paddingBottom: 15,
    paddingLeft: 10,
    gap: 20,
    borderRadius: 10,
    backgroundColor: '#F2F2FF',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
    marginBottom: 16,
  },
  // Product Property Grid
  productPropertyGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    gap: 16,
    marginBottom: 24,
  },
  // Product Property Card
  productPropertyCard: {
    width: 156,
    height: 240,
    opacity: 1,
    paddingTop: 15,
    paddingRight: 10,
    paddingBottom: 15,
    paddingLeft: 10,
    gap: 20,
    borderRadius: 10,
    backgroundColor: '#F2F2F2',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
    marginBottom: 16,
    alignItems: 'center',
  },
  productIconContainer: {
    width: 80,
    height: 80,
    backgroundColor: '#E0E0E0',
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  productIcon: {
    fontSize: 32,
  },
  productInfo: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productName: {
    fontFamily: 'Poppins-Regular',
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 16,
    letterSpacing: 0,
    color: '#000000',
    textAlign: 'center',
    marginBottom: 8,
  },
  productPrice: {
    fontFamily: 'Poppins-Regular',
    fontWeight: '600',
    fontSize: 16,
    lineHeight: 18,
    letterSpacing: 0,
    color: '#232CAD',
    marginBottom: 4,
  },
  productRating: {
    fontFamily: 'Poppins-Regular',
    fontWeight: '400',
    fontSize: 12,
    lineHeight: 14,
    letterSpacing: 0,
    color: '#666666',
  },
  // Main Content
  content: { 
    alignItems: 'center', 
    justifyContent: 'center',
    paddingHorizontal: 20,
    marginTop: 20,
  },
  tagline: { 
    fontFamily: 'Poppins-Regular',
    fontWeight: '400', 
    fontSize: 16, 
    lineHeight: 16, 
    letterSpacing: 0, 
    textAlign: 'center', 
    color: '#555',
  },
  // Bottom Tab Bar Styles
  bottomTabBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    paddingHorizontal: 16,
    paddingBottom: 20,
    paddingTop: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  tabIcon: {
    width: 50,
    height: 50,
    marginBottom: 4,
    opacity: 0.6,
  },
  activeTabIcon: {
    opacity: 1,
    tintColor: '#232CAD',
  },
  tabLabel: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
    color: '#666666',
  },
  activeTabLabel: {
    color: '#232CAD',
    fontWeight: '500',
  },
});