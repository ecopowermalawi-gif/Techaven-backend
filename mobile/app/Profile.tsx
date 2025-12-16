import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  Image, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  Switch,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFonts, Poppins_400Regular, Poppins_500Medium, Poppins_600SemiBold } from '@expo-google-fonts/poppins';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiService from './services/api';
import { useTheme } from './context/ThemeContext'; // Add this import

export default function Profile() {
  const [fontsLoaded] = useFonts({
    'Poppins-Regular': Poppins_400Regular,
    'Poppins-Medium': Poppins_500Medium,
    'Poppins-SemiBold': Poppins_600SemiBold,
  });
  
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const { isDarkMode, toggleDarkMode } = useTheme(); // Use theme context instead of local state

  type UserData = {
    id?: string;
    name?: string;
    email?: string;
    phone_number?: string;
    type?: string;
    profile_picture?: string;
    created_at?: string;
    blockchain_tx_id?: string;
    orders?: number;
    reviews?: number;
    likes?: number;
  };

  type BlockchainStats = {
    total_transactions?: number;
    // add other blockchain stat fields here as needed
  };

  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [blockchainStats, setBlockchainStats] = useState<BlockchainStats | null>(null);
  const router = useRouter();

  // Fetch user data on component mount
  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      
      // Check if user is authenticated
      const isAuthenticated = await apiService.isAuthenticated();
      if (!isAuthenticated) {
        Alert.alert('Session Expired', 'Please log in again', [
          { text: 'OK', onPress: () => router.push('/auth/Login') }
        ]);
        return;
      }

      // Get user profile from API
      const profileData = await apiService.getUserProfile();
      
      // Get blockchain activity
      try {
        const blockchainData = await apiService.getUserBlockchainActivityFromAuth();
        setBlockchainStats(blockchainData);
      } catch (blockchainError) {
        console.log('Could not fetch blockchain data:', blockchainError);
      }

      // Parse stored user data for fallback
      const storedData = await AsyncStorage.getItem('userData');
      const localUserData = storedData ? JSON.parse(storedData) : {};

      // Combine API data with local data
      const combinedData = {
        id: profileData.id || localUserData.id,
        name: profileData.name || localUserData.name || 'User',
        email: profileData.email || localUserData.email || 'No email',
        phone_number: profileData.phone_number || localUserData.phone_number || 'No phone',
        type: profileData.type || localUserData.type || 'customer',
        profile_picture: profileData.profile_picture || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
        created_at: profileData.created_at || 'Unknown',
        blockchain_tx_id: profileData.blockchain_tx_id,
        orders: 0, // You would fetch this from orders API
        reviews: 0, // You would fetch this from reviews API
        likes: 0, // You would fetch this from likes API
      };

      setUserData(combinedData);
    } catch (error) {
      console.error('Error fetching user data:', error);
      Alert.alert('Error', 'Failed to load profile data');
      
      // Fallback to local storage data
      try {
        const storedData = await AsyncStorage.getItem('userData');
        if (storedData) {
          const localData = JSON.parse(storedData);
          setUserData({
            name: localData.name || 'User',
            email: localData.email || 'No email',
            phone_number: localData.phone_number || 'No phone',
            profile_picture: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
            orders: 0,
            reviews: 0,
            likes: 0,
          });
        }
      } catch (localError) {
        console.error('Local data error:', localError);
      }
    } finally {
      setLoading(false);
    }
  };

  const menuItems = [
    {
      id: '1',
      title: 'My Orders',
      subtitle: userData?.orders ? `Already have ${userData.orders} orders` : 'View your orders',
      icon: '📦',
      route: '/Orders',
    },
    {
      id: '2',
      title: 'Shipping Addresses',
      subtitle: 'Manage addresses',
      icon: '📍',
      route: '/Addresses',
    },
    {
      id: '3',
      title: 'Payment Methods',
      subtitle: 'Manage payment options',
      icon: '💳',
      route: '/Payments',
    },
    {
      id: '4',
      title: 'My Reviews',
      subtitle: userData?.reviews ? `Reviews for ${userData.reviews} items` : 'Write reviews',
      icon: '⭐',
      route: '/Reviews',
    },
    {
      id: '5',
      title: 'Blockchain Activity',
      subtitle: blockchainStats ? `${blockchainStats.total_transactions} transactions` : 'View blockchain history',
      icon: '⛓️',
      route: '/BlockchainActivity',
    },
  ];

  const settingsItems = [
    {
      id: '1',
      title: 'Notifications',
      subtitle: 'Order updates, promotions',
      icon: '🔔',
      type: 'switch',
      value: notificationsEnabled,
      onValueChange: setNotificationsEnabled,
    },
    {
      id: '2',
      title: 'Dark Mode',
      subtitle: 'Switch to dark theme',
      icon: '🌙',
      type: 'switch',
      value: isDarkMode, // Use from context
      onValueChange: toggleDarkMode, // Use from context
    },
    {
      id: '3',
      title: 'Privacy Policy',
      subtitle: 'How we handle your data',
      icon: '📄',
      type: 'navigation',
      route: '/Privacy',
    },
    {
      id: '4',
      title: 'Terms of Service',
      subtitle: 'Our terms and conditions',
      icon: '📝',
      type: 'navigation',
      route: '/Terms',
    },
  ];

  const handleLogout = async () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Log Out', 
          style: 'destructive', 
          onPress: async () => {
            try {
              await apiService.logout();
              router.replace('/Home');
            } catch (error) {
              console.error('Logout error:', error);
              // Clear local storage anyway
              await AsyncStorage.removeItem('userToken');
              await AsyncStorage.removeItem('userData');
              router.replace('/Home');
            }
          }
        },
      ]
    );
  };

  const handleEditProfile = () => {
    router.push({
      pathname: '/EditProfile',
      params: { userData: JSON.stringify(userData) }
    });
  };

  const handleRefresh = () => {
    fetchUserData();
  };

  if (!fontsLoaded || loading) {
    return (
      <SafeAreaView style={[styles.safeArea, isDarkMode && styles.darkSafeArea]}>
        <View style={[styles.loadingContainer, isDarkMode && styles.darkLoadingContainer]}>
          <ActivityIndicator size="large" color="#232CAD" />
          <Text style={[styles.loadingText, isDarkMode && styles.darkLoadingText]}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const MenuItem = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={[styles.menuItem, isDarkMode && styles.darkMenuItem]}
      onPress={() => {
        if (item.route === '/BlockchainActivity') {
          router.push({
            pathname: item.route,
            params: { userId: userData?.id }
          });
        } else if (item.route) {
          router.push(item.route);
        }
      }}
    >
      <View style={styles.menuItemLeft}>
        <Text style={styles.menuIcon}>{item.icon}</Text>
        <View style={styles.menuTextContainer}>
          <Text style={[styles.menuTitle, isDarkMode && styles.darkMenuTitle]}>{item.title}</Text>
          <Text style={[styles.menuSubtitle, isDarkMode && styles.darkMenuSubtitle]}>{item.subtitle}</Text>
        </View>
      </View>
      
      {item.type === 'switch' ? (
        <Switch
          value={item.value}
          onValueChange={item.onValueChange}
          trackColor={{ false: '#E0E0E0', true: '#232CAD' }}
          thumbColor={item.value ? '#FFFFFF' : '#F4F3F4'}
        />
      ) : (
        <Text style={[styles.chevron, isDarkMode && styles.darkChevron]}>›</Text>
      )}
    </TouchableOpacity>
  );

  // Format join date
  const formatJoinDate = (dateString?: string) => {
    if (!dateString || dateString === 'Unknown') return 'Recently joined';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    } catch {
      return 'Recently joined';
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, isDarkMode && styles.darkSafeArea]}>
      <View style={[styles.mainContainer, isDarkMode && styles.darkMainContainer]}>
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={[styles.header, isDarkMode && styles.darkHeader]}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Text style={[styles.backIcon, isDarkMode && styles.darkBackIcon]}>‹</Text>
            </TouchableOpacity>
            <Text style={[styles.headerTitle, isDarkMode && styles.darkHeaderTitle]}>Profile</Text>
            <View style={styles.headerRight}>
              <TouchableOpacity 
                style={styles.refreshButton}
                onPress={handleRefresh}
              >
                <Text style={[styles.refreshIcon, isDarkMode && styles.darkRefreshIcon]}>🔄</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.editButton}
                onPress={handleEditProfile}
              >
                <Text style={[styles.editText, isDarkMode && styles.darkEditText]}>Edit</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Profile Card */}
          <LinearGradient 
            colors={['#232CAD', '#4547D1']} 
            start={{ x: 0, y: 0 }} 
            end={{ x: 1, y: 1 }} 
            style={styles.profileCard}
          >
            <View style={styles.avatarContainer}>
              <Image 
                source={{ uri: userData?.profile_picture || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face' }}
                style={styles.avatar}
              />
              <TouchableOpacity style={styles.cameraButton}>
                <Text style={styles.cameraIcon}>📷</Text>
              </TouchableOpacity>
            </View>
            
            <Text style={styles.userName}>{userData?.name || 'User'}</Text>
            <Text style={styles.userEmail}>{userData?.email || 'No email'}</Text>
            <Text style={styles.userPhone}>{userData?.phone_number || 'No phone'}</Text>
            <Text style={styles.joinDate}>Joined {formatJoinDate(userData?.created_at)}</Text>
            
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{userData?.orders || 0}</Text>
                <Text style={styles.statLabel}>Orders</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{userData?.reviews || 0}</Text>
                <Text style={styles.statLabel}>Reviews</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{userData?.likes || 0}</Text>
                <Text style={styles.statLabel}>Likes</Text>
              </View>
            </View>

            {/* Blockchain Info */}
            {userData?.blockchain_tx_id && (
              <View style={styles.blockchainInfo}>
                <Text style={styles.blockchainText}>
                  Blockchain Verified ✓
                </Text>
                <Text style={styles.blockchainSubtext}>
                  TX: {userData.blockchain_tx_id.substring(0, 8)}...
                </Text>
              </View>
            )}
          </LinearGradient>

          {/* Account Section */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, isDarkMode && styles.darkSectionTitle]}>Account</Text>
            <View style={[styles.sectionContent, isDarkMode && styles.darkSectionContent]}>
              {menuItems.map((item) => (
                <MenuItem key={item.id} item={item} />
              ))}
            </View>
          </View>

          {/* Settings Section */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, isDarkMode && styles.darkSectionTitle]}>Settings</Text>
            <View style={[styles.sectionContent, isDarkMode && styles.darkSectionContent]}>
              {settingsItems.map((item) => (
                <MenuItem key={item.id} item={item} />
              ))}
            </View>
          </View>

          {/* Support Section */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, isDarkMode && styles.darkSectionTitle]}>Support</Text>
            <View style={[styles.sectionContent, isDarkMode && styles.darkSectionContent]}>
              <TouchableOpacity style={[styles.menuItem, isDarkMode && styles.darkMenuItem]}>
                <View style={styles.menuItemLeft}>
                  <Text style={styles.menuIcon}>💬</Text>
                  <View style={styles.menuTextContainer}>
                    <Text style={[styles.menuTitle, isDarkMode && styles.darkMenuTitle]}>Help & Support</Text>
                    <Text style={[styles.menuSubtitle, isDarkMode && styles.darkMenuSubtitle]}>FAQs, contact support</Text>
                  </View>
                </View>
                <Text style={[styles.chevron, isDarkMode && styles.darkChevron]}>›</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.menuItem, isDarkMode && styles.darkMenuItem]}>
                <View style={styles.menuItemLeft}>
                  <Text style={styles.menuIcon}>ℹ️</Text>
                  <View style={styles.menuTextContainer}>
                    <Text style={[styles.menuTitle, isDarkMode && styles.darkMenuTitle]}>About Us</Text>
                    <Text style={[styles.menuSubtitle, isDarkMode && styles.darkMenuSubtitle]}>Learn more about our company</Text>
                  </View>
                </View>
                <Text style={[styles.chevron, isDarkMode && styles.darkChevron]}>›</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Logout Button */}
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutText}>Log Out</Text>
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={[styles.versionText, isDarkMode && styles.darkVersionText]}>Version 1.0.0</Text>
            <Text style={[styles.userTypeText, isDarkMode && styles.darkUserTypeText]}>
              {userData?.type === 'merchant' ? 'Merchant Account' : 
               userData?.type === 'admin' ? 'Admin Account' : 'Customer Account'}
            </Text>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // Light mode styles (original)
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  loadingText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 16,
    color: '#666666',
    marginTop: 16,
  },
  // Header Styles
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backButton: {
    padding: 8,
  },
  backIcon: {
    fontSize: 24,
    color: '#232CAD',
    fontWeight: 'bold',
  },
  headerTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 18,
    color: '#000000',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  refreshButton: {
    padding: 8,
    marginRight: 8,
  },
  refreshIcon: {
    fontSize: 18,
    color: '#232CAD',
  },
  editButton: {
    padding: 8,
  },
  editText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 16,
    color: '#232CAD',
  },
  // Profile Card Styles
  profileCard: {
    margin: 24,
    marginTop: 16,
    padding: 24,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#232CAD',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cameraIcon: {
    fontSize: 18,
  },
  userName: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 24,
    color: '#FFFFFF',
    marginBottom: 4,
    textAlign: 'center',
  },
  userEmail: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 2,
  },
  userPhone: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 8,
  },
  joinDate: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 16,
    padding: 16,
    width: '100%',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 20,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  statLabel: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  statDivider: {
    width: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginHorizontal: 8,
  },
  blockchainInfo: {
    marginTop: 16,
    padding: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    alignItems: 'center',
  },
  blockchainText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 12,
    color: '#FFFFFF',
    marginBottom: 2,
  },
  blockchainSubtext: {
    fontFamily: 'Poppins-Regular',
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  // Section Styles
  section: {
    marginHorizontal: 24,
    marginBottom: 24,
  },
  sectionTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 18,
    color: '#000000',
    marginBottom: 16,
  },
  sectionContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    overflow: 'hidden',
  },
  // Menu Item Styles
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuIcon: {
    fontSize: 20,
    marginRight: 16,
    width: 24,
    textAlign: 'center',
  },
  menuTextContainer: {
    flex: 1,
  },
  menuTitle: {
    fontFamily: 'Poppins-Medium',
    fontSize: 16,
    color: '#000000',
    marginBottom: 2,
  },
  menuSubtitle: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
    color: '#666666',
  },
  chevron: {
    fontSize: 20,
    color: '#CCCCCC',
    fontWeight: 'bold',
  },
  // Logout Button
  logoutButton: {
    marginHorizontal: 24,
    marginVertical: 16,
    backgroundColor: '#FF3B30',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#FF3B30',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  logoutText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 16,
    color: '#FFFFFF',
  },
  // Footer
  footer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  versionText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
    color: '#999999',
    marginBottom: 4,
  },
  userTypeText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 12,
    color: '#232CAD',
  },

  // Dark mode styles (added)
  darkSafeArea: {
    backgroundColor: '#121212',
  },
  darkMainContainer: {
    backgroundColor: '#121212',
  },
  darkLoadingContainer: {
    backgroundColor: '#121212',
  },
  darkLoadingText: {
    color: '#CCCCCC',
  },
  darkHeader: {
    backgroundColor: '#1E1E1E',
    borderBottomColor: '#333333',
  },
  darkBackIcon: {
    color: '#FFFFFF',
  },
  darkHeaderTitle: {
    color: '#FFFFFF',
  },
  darkRefreshIcon: {
    color: '#BB86FC',
  },
  darkEditText: {
    color: '#BB86FC',
  },
  darkSectionTitle: {
    color: '#FFFFFF',
  },
  darkSectionContent: {
    backgroundColor: '#1E1E1E',
    shadowColor: '#000000',
    shadowOpacity: 0.3,
  },
  darkMenuItem: {
    backgroundColor: '#1E1E1E',
    borderBottomColor: '#333333',
  },
  darkMenuTitle: {
    color: '#FFFFFF',
  },
  darkMenuSubtitle: {
    color: '#AAAAAA',
  },
  darkChevron: {
    color: '#666666',
  },
  darkVersionText: {
    color: '#666666',
  },
  darkUserTypeText: {
    color: '#BB86FC',
  },
});