import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  Switch,
  RefreshControl,
  Alert,
  ActivityIndicator
} from 'react-native';
import { useFonts, Poppins_400Regular, Poppins_500Medium, Poppins_600SemiBold } from '@expo-google-fonts/poppins';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { apiService } from './services/api'; // Adjust path as needed

interface Notification {
  id: string;
  title: string;
  message: string;
  body?: string;
  type: string;
  read: boolean;
  created_at: string;
  data?: {
    order_id?: string;
    product_id?: string;
    promotion_id?: string;
  };
}

interface Settings {
  pushNotifications: boolean;
  emailNotifications: boolean;
  orderUpdates: boolean;
  priceAlerts: boolean;
  promotions: boolean;
  securityAlerts: boolean;
}

export default function Notifications() {
  const [fontsLoaded] = useFonts({
    'Poppins-Regular': Poppins_400Regular,
    'Poppins-Medium': Poppins_500Medium,
    'Poppins-SemiBold': Poppins_600SemiBold,
  });

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [settings, setSettings] = useState<Settings>({
    pushNotifications: true,
    emailNotifications: true,
    orderUpdates: true,
    priceAlerts: true,
    promotions: false,
    securityAlerts: true,
  });

  const router = useRouter();
  const limit = 20;

  // Load notifications on component mount
  useEffect(() => {
    loadNotifications();
    loadNotificationPreferences();
  }, []);

  // Load notifications from API
  const loadNotifications = async (refresh = false) => {
    try {
      if (refresh) {
        setRefreshing(true);
        setPage(1);
        setHasMore(true);
      } else {
        setLoading(true);
      }

      const offset = refresh ? 0 : (page - 1) * limit;
      
      // Try to get user notifications first
      let result: any;
      try {
        result = await apiService.getUserNotifications({
          limit,
          offset,
          read: null, // Get all notifications
          sort_by: 'created_at',
          sort_order: 'desc'
        });
      } catch (error: any) {
        // Fallback to mock data if API fails
        console.log('Using mock data:', error.message);
        result = getMockNotifications(limit);
      }

      const notificationsData = Array.isArray(result?.items) ? result.items : 
                               Array.isArray(result) ? result : [];
      
      setNotifications(prev => {
        if (refresh || page === 1) {
          return notificationsData;
        } else {
          return [...prev, ...notificationsData];
        }
      });

      // Update hasMore flag
      if (notificationsData.length < limit) {
        setHasMore(false);
      }

      // Load unread count
      loadUnreadCount();
    } catch (error) {
      console.error('Failed to load notifications:', error);
      Alert.alert('Error', 'Failed to load notifications. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Load unread count
  const loadUnreadCount = async () => {
    try {
      const result = await apiService.getUnreadNotificationCount();
      // Handle different response formats
      const count = typeof result === 'string' ? parseInt(result) : 
                    typeof result === 'number' ? result :
                    result?.count || result?.unread_count || 0;
      setUnreadCount(count);
    } catch (error) {
      console.error('Failed to load unread count:', error);
    }
  };

  // Load notification preferences
  const loadNotificationPreferences = async () => {
    try {
      const result = await apiService.getNotificationPreferences();
      
      if (result && typeof result === 'object') {
        setSettings(prev => ({
          ...prev,
          emailNotifications: result.email_notifications || false,
          pushNotifications: result.push_notifications || false,
          orderUpdates: result.order_updates || false,
          promotions: result.promotion_alerts || false,
        }));
      }
    } catch (error) {
      console.error('Failed to load preferences:', error);
    }
  };

  // Save notification preferences
  const saveNotificationPreferences = async (updatedSettings: Settings) => {
    try {
      const preferencesData = {
        email_notifications: updatedSettings.emailNotifications,
        push_notifications: updatedSettings.pushNotifications,
        order_updates: updatedSettings.orderUpdates,
        promotion_alerts: updatedSettings.promotions,
        price_alerts: updatedSettings.priceAlerts,
        security_alerts: updatedSettings.securityAlerts,
        newsletter: false, // Default value
      };
      
      await apiService.updateNotificationPreferences(preferencesData);
      Alert.alert('Success', 'Notification preferences updated successfully');
    } catch (error) {
      console.error('Failed to update preferences:', error);
      Alert.alert('Error', 'Failed to update preferences. Please try again.');
      // Revert to previous settings on error
      setSettings(updatedSettings);
    }
  };

  // Mark notification as read
  const markNotificationAsRead = async (notificationId: string) => {
    try {
      await apiService.markNotificationAsRead(notificationId);
      
      // Update local state
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === notificationId 
            ? { ...notification, read: true }
            : notification
        )
      );
      
      // Update unread count
      setUnreadCount(prev => Math.max(0, prev - 1));
      
    } catch (error) {
      console.error('Failed to mark as read:', error);
      Alert.alert('Error', 'Failed to mark notification as read');
    }
  };

  // Mark all notifications as read
  const handleMarkAllAsRead = async () => {
    try {
      await apiService.markAllNotificationsAsRead();
      
      // Update all notifications to read
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, read: true }))
      );
      
      // Reset unread count
      setUnreadCount(0);
      
      Alert.alert('Success', 'All notifications marked as read');
    } catch (error) {
      console.error('Failed to mark all as read:', error);
      Alert.alert('Error', 'Failed to mark all notifications as read');
    }
  };

  // Delete a notification
  const deleteNotification = async (notificationId: string) => {
    try {
      Alert.alert(
        'Delete Notification',
        'Are you sure you want to delete this notification?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: async () => {
              await apiService.deleteNotification(notificationId);
              setNotifications(prev => 
                prev.filter(notification => notification.id !== notificationId)
              );
              
              // If the deleted notification was unread, update count
              const deletedNotification = notifications.find(n => n.id === notificationId);
              if (deletedNotification && !deletedNotification.read) {
                setUnreadCount(prev => Math.max(0, prev - 1));
              }
            }
          }
        ]
      );
    } catch (error) {
      console.error('Failed to delete notification:', error);
      Alert.alert('Error', 'Failed to delete notification');
    }
  };

  // Clear all notifications
  const handleClearAllNotifications = async () => {
    try {
      Alert.alert(
        'Clear All Notifications',
        'Are you sure you want to clear all notifications? This action cannot be undone.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Clear All',
            style: 'destructive',
            onPress: async () => {
              // Get all notification IDs
              const notificationIds = notifications.map(n => n.id);
              
              if (notificationIds.length > 0) {
                await apiService.bulkDeleteNotifications(notificationIds);
              }
              
              setNotifications([]);
              setUnreadCount(0);
              setPage(1);
              setHasMore(true);
              
              Alert.alert('Success', 'All notifications cleared');
            }
          }
        ]
      );
    } catch (error) {
      console.error('Failed to clear all notifications:', error);
      Alert.alert('Error', 'Failed to clear notifications');
    }
  };

  // Toggle notification setting
  const toggleSetting = (key: keyof Settings) => {
    const updatedSettings: Settings = {
      ...settings,
      [key]: !settings[key]
    };
    
    setSettings(updatedSettings);
    saveNotificationPreferences(updatedSettings);
  };

  // Format date to relative time
  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    return date.toLocaleDateString();
  };

  // Get notification icon based on type
  const getNotificationIcon = (type: string) => {
    switch(type) {
      case 'order':
      case 'order_update': return '📦';
      case 'price':
      case 'price_alert': return '💰';
      case 'promotion':
      case 'promotion_alert': return '🎉';
      case 'stock':
      case 'stock_alert': return '📈';
      case 'system': return '⚙️';
      case 'security': return '🔒';
      case 'announcement': return '📢';
      default: return '🔔';
    }
  };

  // Get notification color based on type
  const getNotificationColor = (type: string) => {
    switch(type) {
      case 'order':
      case 'order_update': return '#4CAF50';
      case 'price':
      case 'price_alert': return '#2196F3';
      case 'promotion':
      case 'promotion_alert': return '#FF9800';
      case 'stock':
      case 'stock_alert': return '#9C27B0';
      case 'system': return '#607D8B';
      case 'security': return '#F44336';
      case 'announcement': return '#232CAD';
      default: return '#666666';
    }
  };

  // Handle notification press
  const handleNotificationPress = async (notification: Notification) => {
    // Mark as read if unread
    if (!notification.read) {
      await markNotificationAsRead(notification.id);
    }
    
    // Handle navigation based on notification type/data
    if (notification.data) {
      const data = notification.data;
      
      if (data.order_id) {
        router.push({
          pathname: '/order/[id]',
          params: { id: data.order_id }
        } as any);
      } else if (data.product_id) {
        router.push({
          pathname: '/product/[id]',
          params: { id: data.product_id }
        } as any);
      } else if (data.promotion_id) {
        router.push({
          pathname: '/promotion/[id]',
          params: { id: data.promotion_id }
        } as any);
      }
    }
  };

  // Load more notifications
  const loadMore = () => {
    if (hasMore && !loading) {
      setPage(prev => prev + 1);
      loadNotifications(false);
    }
  };

  // Mock data for fallback
  const getMockNotifications = (count = 6): Notification[] => {
    const mockTypes = ['order', 'price', 'promotion', 'stock', 'system', 'announcement'];
    const mockTitles = [
      'Order Shipped',
      'Price Drop Alert',
      'New Arrival',
      'Order Confirmed',
      'Limited Time Offer',
      'Back in Stock',
      'Security Alert',
      'System Update',
      'Welcome Bonus'
    ];
    const mockMessages = [
      'Your order has been shipped',
      'Price dropped on your watched items',
      'Check out the latest tech gadgets',
      'Your order has been confirmed',
      'Special discount available for limited time',
      'Item is back in stock',
      'Unusual login detected',
      'System maintenance scheduled',
      'Get 10% off your first purchase'
    ];
    
    return Array.from({ length: count }, (_, i) => ({
      id: `mock-${i + 1}`,
      title: mockTitles[i % mockTitles.length],
      message: mockMessages[i % mockMessages.length],
      type: mockTypes[i % mockTypes.length],
      read: i > 2, // First 3 are unread
      created_at: new Date(Date.now() - i * 3600000).toISOString(), // Staggered times
    }));
  };

  // Handle pull to refresh
  const onRefresh = () => {
    loadNotifications(true);
  };

  if (!fontsLoaded) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#232CAD" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.mainContainer}>
        <ScrollView 
          style={styles.scrollView} 
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#232CAD']}
              tintColor="#232CAD"
            />
          }
        >
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
                  onPress={handleMarkAllAsRead}
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

          {/* Loading State */}
          {loading && !refreshing && notifications.length === 0 ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#232CAD" />
              <Text style={styles.loadingText}>Loading notifications...</Text>
            </View>
          ) : (
            <>
              {/* Notifications List */}
              <View style={styles.notificationsSection}>
                {notifications.length === 0 ? (
                  <View style={styles.emptyNotifications}>
                    <Text style={styles.emptyIcon}>🔔</Text>
                    <Text style={styles.emptyTitle}>No notifications</Text>
                    <Text style={styles.emptyText}>
                      You're all caught up! Check back later for updates.
                    </Text>
                    <TouchableOpacity 
                      style={styles.refreshButton}
                      onPress={onRefresh}
                    >
                      <Text style={styles.refreshButtonText}>Refresh</Text>
                    </TouchableOpacity>
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
                        onPress={() => handleNotificationPress(notification)}
                        onLongPress={() => deleteNotification(notification.id)}
                        delayLongPress={500}
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
                              {getNotificationIcon(notification.type)}
                            </Text>
                          </View>
                          <View style={styles.notificationContent}>
                            <Text style={styles.notificationTitle}>
                              {notification.title || 'Notification'}
                            </Text>
                            <Text style={styles.notificationMessage} numberOfLines={2}>
                              {notification.message || notification.body || 'New notification'}
                            </Text>
                            <Text style={styles.notificationTime}>
                              {notification.created_at ? formatRelativeTime(notification.created_at) : 'Recently'}
                            </Text>
                          </View>
                        </View>
                        
                        {!notification.read && (
                          <View style={styles.unreadDot} />
                        )}
                        
                        <TouchableOpacity 
                          style={styles.deleteButton}
                          onPress={() => deleteNotification(notification.id)}
                        >
                          <Text style={styles.deleteButtonText}>×</Text>
                        </TouchableOpacity>
                      </TouchableOpacity>
                    ))}
                    
                    {/* Load More */}
                    {hasMore && (
                      <TouchableOpacity 
                        style={styles.loadMoreButton}
                        onPress={loadMore}
                        disabled={loading}
                      >
                        {loading ? (
                          <ActivityIndicator size="small" color="#232CAD" />
                        ) : (
                          <Text style={styles.loadMoreText}>Load More</Text>
                        )}
                      </TouchableOpacity>
                    )}
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
                  onPress={handleClearAllNotifications}
                >
                  <Text style={styles.clearButtonText}>Clear All Notifications</Text>
                </TouchableOpacity>
              )}
            </>
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
  // Loading State
  loadingContainer: {
    paddingVertical: 100,
    alignItems: 'center',
  },
  loadingText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    color: '#666666',
    marginTop: 12,
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
    marginBottom: 24,
  },
  refreshButton: {
    backgroundColor: '#232CAD',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  refreshButtonText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    color: '#FFFFFF',
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
    marginRight: 8,
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
    marginRight: 8,
  },
  deleteButton: {
    padding: 4,
  },
  deleteButtonText: {
    fontSize: 20,
    color: '#999999',
    fontWeight: 'bold',
  },
  loadMoreButton: {
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  loadMoreText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    color: '#232CAD',
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