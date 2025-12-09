import React, { useState } from 'react';
import { 
  View, 
  Text, 
  Image, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  Switch,
} from 'react-native';
import { useFonts, Poppins_400Regular, Poppins_500Medium, Poppins_600SemiBold } from '@expo-google-fonts/poppins';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

export default function Notifications() {
  const [fontsLoaded] = useFonts({
    'Poppins-Regular': Poppins_400Regular,
    'Poppins-Medium': Poppins_500Medium,
    'Poppins-SemiBold': Poppins_600SemiBold,
  });

  const [notifications, setNotifications] = useState([
    {
      id: '1',
      title: 'Order Shipped',
      message: 'Your order #ORD-7890 has been shipped',
      time: '2 hours ago',
      type: 'order',
      read: false,
      icon: '🚚',
    },
    {
      id: '2',
      title: 'Price Drop Alert',
      message: 'Wireless Earbuds price dropped by 20%',
      time: '5 hours ago',
      type: 'price',
      read: false,
      icon: '💰',
    },
    {
      id: '3',
      title: 'New Arrival',
      message: 'Check out the latest tech gadgets',
      time: '1 day ago',
      type: 'promotion',
      read: true,
      icon: '🆕',
    },
    {
      id: '4',
      title: 'Order Confirmed',
      message: 'Your order #ORD-7889 has been confirmed',
      time: '2 days ago',
      type: 'order',
      read: true,
      icon: '✅',
    },
    {
      id: '5',
      title: 'Limited Time Offer',
      message: 'Special discount on Smart Watches',
      time: '3 days ago',
      type: 'promotion',
      read: true,
      icon: '⏰',
    },
    {
      id: '6',
      title: 'Back in Stock',
      message: 'Gaming Headset is back in stock',
      time: '1 week ago',
      type: 'stock',
      read: true,
      icon: '📦',
    },
  ]);

  const [settings, setSettings] = useState({
    pushNotifications: true,
    emailNotifications: true,
    orderUpdates: true,
    priceAlerts: true,
    promotions: false,
    securityAlerts: true,
  });

  const router = useRouter();

  const toggleNotificationRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, read: !notification.read }
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const toggleSetting = (key: keyof typeof settings) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const getNotificationIcon = (type: string) => {
    switch(type) {
      case 'order': return '📦';
      case 'price': return '💰';
      case 'promotion': return '🎉';
      case 'stock': return '📈';
      default: return '🔔';
    }
  };

  const getNotificationColor = (type: string) => {
    switch(type) {
      case 'order': return '#4CAF50';
      case 'price': return '#2196F3';
      case 'promotion': return '#FF9800';
      case 'stock': return '#9C27B0';
      default: return '#232CAD';
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  if (!fontsLoaded) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

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
            <Text style={styles.headerTitle}>Notifications</Text>
            <View style={styles.headerActions}>
              {notifications.length > 0 && unreadCount > 0 && (
                <TouchableOpacity 
                  style={styles.markReadButton}
                  onPress={markAllAsRead}
                >
                  <Text style={styles.markReadText}>Mark all read</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Unread Count Badge */}
          {unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadCount}>{unreadCount} unread</Text>
            </View>
          )}

          {/* Notifications List */}
          <View style={styles.notificationsSection}>
            {notifications.length === 0 ? (
              <View style={styles.emptyNotifications}>
                <Text style={styles.emptyIcon}>🔔</Text>
                <Text style={styles.emptyTitle}>No notifications</Text>
                <Text style={styles.emptyText}>
                  You're all caught up! Check back later for updates.
                </Text>
              </View>
            ) : (
              <View style={styles.notificationsList}>
                {notifications.map((notification) => (
                  <TouchableOpacity 
                    key={notification.id}
                    style={[
                      styles.notificationItem,
                      !notification.read && styles.unreadNotification
                    ]}
                    onPress={() => toggleNotificationRead(notification.id)}
                  >
                    <View style={styles.notificationLeft}>
                      <View style={[
                        styles.notificationIconContainer,
                        { backgroundColor: `${getNotificationColor(notification.type)}15` }
                      ]}>
                        <Text style={[
                          styles.notificationIcon,
                          { color: getNotificationColor(notification.type) }
                        ]}>
                          {notification.icon}
                        </Text>
                      </View>
                      <View style={styles.notificationContent}>
                        <Text style={styles.notificationTitle}>
                          {notification.title}
                        </Text>
                        <Text style={styles.notificationMessage}>
                          {notification.message}
                        </Text>
                        <Text style={styles.notificationTime}>
                          {notification.time}
                        </Text>
                      </View>
                    </View>
                    
                    {!notification.read && (
                      <View style={styles.unreadDot} />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Notification Settings */}
          <View style={styles.settingsSection}>
            <Text style={styles.sectionTitle}>Notification Settings</Text>
            
            <View style={styles.settingsList}>
              <View style={styles.settingItem}>
                <View style={styles.settingLeft}>
                  <Text style={styles.settingIcon}>📱</Text>
                  <View style={styles.settingTextContainer}>
                    <Text style={styles.settingTitle}>Push Notifications</Text>
                    <Text style={styles.settingDescription}>Receive app notifications</Text>
                  </View>
                </View>
                <Switch
                  value={settings.pushNotifications}
                  onValueChange={() => toggleSetting('pushNotifications')}
                  trackColor={{ false: '#E0E0E0', true: '#232CAD' }}
                  thumbColor={settings.pushNotifications ? '#FFFFFF' : '#F4F3F4'}
                />
              </View>

              <View style={styles.settingItem}>
                <View style={styles.settingLeft}>
                  <Text style={styles.settingIcon}>📧</Text>
                  <View style={styles.settingTextContainer}>
                    <Text style={styles.settingTitle}>Email Notifications</Text>
                    <Text style={styles.settingDescription}>Receive email updates</Text>
                  </View>
                </View>
                <Switch
                  value={settings.emailNotifications}
                  onValueChange={() => toggleSetting('emailNotifications')}
                  trackColor={{ false: '#E0E0E0', true: '#232CAD' }}
                  thumbColor={settings.emailNotifications ? '#FFFFFF' : '#F4F3F4'}
                />
              </View>

              <View style={styles.settingItem}>
                <View style={styles.settingLeft}>
                  <Text style={styles.settingIcon}>📦</Text>
                  <View style={styles.settingTextContainer}>
                    <Text style={styles.settingTitle}>Order Updates</Text>
                    <Text style={styles.settingDescription}>Order status and shipping</Text>
                  </View>
                </View>
                <Switch
                  value={settings.orderUpdates}
                  onValueChange={() => toggleSetting('orderUpdates')}
                  trackColor={{ false: '#E0E0E0', true: '#232CAD' }}
                  thumbColor={settings.orderUpdates ? '#FFFFFF' : '#F4F3F4'}
                />
              </View>

              <View style={styles.settingItem}>
                <View style={styles.settingLeft}>
                  <Text style={styles.settingIcon}>💰</Text>
                  <View style={styles.settingTextContainer}>
                    <Text style={styles.settingTitle}>Price Alerts</Text>
                    <Text style={styles.settingDescription}>Price drops and deals</Text>
                  </View>
                </View>
                <Switch
                  value={settings.priceAlerts}
                  onValueChange={() => toggleSetting('priceAlerts')}
                  trackColor={{ false: '#E0E0E0', true: '#232CAD' }}
                  thumbColor={settings.priceAlerts ? '#FFFFFF' : '#F4F3F4'}
                />
              </View>

              <View style={styles.settingItem}>
                <View style={styles.settingLeft}>
                  <Text style={styles.settingIcon}>🎉</Text>
                  <View style={styles.settingTextContainer}>
                    <Text style={styles.settingTitle}>Promotions</Text>
                    <Text style={styles.settingDescription}>Sales and special offers</Text>
                  </View>
                </View>
                <Switch
                  value={settings.promotions}
                  onValueChange={() => toggleSetting('promotions')}
                  trackColor={{ false: '#E0E0E0', true: '#232CAD' }}
                  thumbColor={settings.promotions ? '#FFFFFF' : '#F4F3F4'}
                />
              </View>
            </View>
          </View>

          {/* Clear All Button */}
          {notifications.length > 0 && (
            <TouchableOpacity 
              style={styles.clearButton}
              onPress={clearAllNotifications}
            >
              <Text style={styles.clearButtonText}>Clear All Notifications</Text>
            </TouchableOpacity>
          )}
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
  headerActions: {
    minWidth: 80,
    alignItems: 'flex-end',
  },
  markReadButton: {
    padding: 8,
  },
  markReadText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    color: '#232CAD',
  },
  // Unread Badge
  unreadBadge: {
    backgroundColor: '#232CAD',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 24,
    marginTop: 16,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  unreadCount: {
    fontFamily: 'Poppins-Medium',
    fontSize: 12,
    color: '#FFFFFF',
  },
  // Notifications Section
  notificationsSection: {
    marginTop: 16,
  },
  emptyNotifications: {
    alignItems: 'center',
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 24,
    color: '#CCCCCC',
  },
  emptyTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 20,
    color: '#000000',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 20,
  },
  notificationsList: {
    paddingHorizontal: 24,
  },
  notificationItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  unreadNotification: {
    backgroundColor: '#F0F2FF',
    borderLeftWidth: 4,
    borderLeftColor: '#232CAD',
  },
  notificationLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
  },
  notificationIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  notificationIcon: {
    fontSize: 20,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 16,
    color: '#000000',
    marginBottom: 4,
  },
  notificationMessage: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: '#666666',
    marginBottom: 4,
    lineHeight: 18,
  },
  notificationTime: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
    color: '#999999',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#232CAD',
    marginTop: 8,
  },
  // Settings Section
  settingsSection: {
    marginTop: 24,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 18,
    color: '#000000',
    marginBottom: 16,
  },
  settingsList: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    fontSize: 20,
    marginRight: 12,
    width: 24,
    textAlign: 'center',
  },
  settingTextContainer: {
    flex: 1,
  },
  settingTitle: {
    fontFamily: 'Poppins-Medium',
    fontSize: 16,
    color: '#000000',
    marginBottom: 2,
  },
  settingDescription: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
    color: '#666666',
  },
  // Clear Button
  clearButton: {
    marginHorizontal: 24,
    marginTop: 24,
    marginBottom: 40,
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
  clearButtonText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 16,
    color: '#FFFFFF',
  },
});