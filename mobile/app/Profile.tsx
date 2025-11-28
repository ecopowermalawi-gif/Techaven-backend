import React, { useState } from 'react';
import { 
  View, 
  Text, 
  Image, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFonts, Poppins_400Regular, Poppins_500Medium, Poppins_600SemiBold } from '@expo-google-fonts/poppins';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

export default function Profile() {
  const [fontsLoaded] = useFonts({
    'Poppins-Regular': Poppins_400Regular,
    'Poppins-Medium': Poppins_500Medium,
    'Poppins-SemiBold': Poppins_600SemiBold,
  });
  
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);
  const router = useRouter();

  const userData = {
    name: 'Alex Johnson',
    email: 'alex.johnson@example.com',
    phone: '+1 (555) 123-4567',
    joinDate: 'January 2024',
    orders: 12,
    reviews: 8,
    likes: 23,
  };

  const menuItems = [
    {
      id: '1',
      title: 'My Orders',
      subtitle: 'Already have 12 orders',
      icon: '📦',
      route: '/Orders',
    },
    {
      id: '2',
      title: 'Shipping Addresses',
      subtitle: '3 addresses',
      icon: '📍',
      route: '/Addresses',
    },
    {
      id: '3',
      title: 'Payment Methods',
      subtitle: 'Visa **34',
      icon: '💳',
      route: '/Payments',
    },
    {
      id: '4',
      title: 'My Reviews',
      subtitle: 'Reviews for 8 items',
      icon: '⭐',
      route: '/Reviews',
    },
    {
      id: '5',
      title: 'My Likes',
      subtitle: '23 items',
      icon: '❤️',
      route: '/Likes',
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
      value: darkModeEnabled,
      onValueChange: setDarkModeEnabled,
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

  const handleLogout = () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Log Out', style: 'destructive', onPress: () => router.push('/Home') },
      ]
    );
  };

  const handleEditProfile = () => {
    router.push('/EditProfile');
  };

  if (!fontsLoaded) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  const MenuItem = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={styles.menuItem}
      onPress={() => item.route && router.push(item.route)}
    >
      <View style={styles.menuItemLeft}>
        <Text style={styles.menuIcon}>{item.icon}</Text>
        <View style={styles.menuTextContainer}>
          <Text style={styles.menuTitle}>{item.title}</Text>
          <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
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
        <Text style={styles.chevron}>›</Text>
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.mainContainer}>
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Text style={styles.backIcon}>‹</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Profile</Text>
            <TouchableOpacity 
              style={styles.editButton}
              onPress={handleEditProfile}
            >
              <Text style={styles.editText}>Edit</Text>
            </TouchableOpacity>
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
                source={{ uri: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face' }}
                style={styles.avatar}
              />
              <TouchableOpacity style={styles.cameraButton}>
                <Text style={styles.cameraIcon}>📷</Text>
              </TouchableOpacity>
            </View>
            
            <Text style={styles.userName}>{userData.name}</Text>
            <Text style={styles.userEmail}>{userData.email}</Text>
            
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{userData.orders}</Text>
                <Text style={styles.statLabel}>Orders</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{userData.reviews}</Text>
                <Text style={styles.statLabel}>Reviews</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{userData.likes}</Text>
                <Text style={styles.statLabel}>Likes</Text>
              </View>
            </View>
          </LinearGradient>

          {/* Account Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Account</Text>
            <View style={styles.sectionContent}>
              {menuItems.map((item) => (
                <MenuItem key={item.id} item={item} />
              ))}
            </View>
          </View>

          {/* Settings Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Settings</Text>
            <View style={styles.sectionContent}>
              {settingsItems.map((item) => (
                <MenuItem key={item.id} item={item} />
              ))}
            </View>
          </View>

          {/* Support Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Support</Text>
            <View style={styles.sectionContent}>
              <TouchableOpacity style={styles.menuItem}>
                <View style={styles.menuItemLeft}>
                  <Text style={styles.menuIcon}>💬</Text>
                  <View style={styles.menuTextContainer}>
                    <Text style={styles.menuTitle}>Help & Support</Text>
                    <Text style={styles.menuSubtitle}>FAQs, contact support</Text>
                  </View>
                </View>
                <Text style={styles.chevron}>›</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.menuItem}>
                <View style={styles.menuItemLeft}>
                  <Text style={styles.menuIcon}>ℹ️</Text>
                  <View style={styles.menuTextContainer}>
                    <Text style={styles.menuTitle}>About Us</Text>
                    <Text style={styles.menuSubtitle}>Learn more about our company</Text>
                  </View>
                </View>
                <Text style={styles.chevron}>›</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Logout Button */}
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutText}>Log Out</Text>
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={styles.versionText}>Version 1.0.0</Text>
          </View>
        </ScrollView>
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
    justifyContent: 'center',
    alignItems: 'center',
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
  },
  userEmail: {
    fontFamily: 'Poppins-Regular',
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 24,
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
  },
});