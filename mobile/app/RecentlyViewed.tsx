import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ScrollView,
  FlatList,
  Image,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiService } from './services/api';

const { width } = Dimensions.get('window');

interface RecentlyViewedItem {
  id: string;
  product_id: string;
  user_id: string;
  session_id?: string;
  viewed_at: string;
  product_details?: Product;
}

interface Product {
  id: string;
  name: string;
  price: number;
  original_price?: number;
  rating?: number;
  category_id?: string;
  category?: {
    id?: string;
    name: string;
  };
  images?: Array<{
    id: string;
    url: string;
    is_primary: boolean;
  }>;
  shop?: {
    id: string;
    name: string;
  };
  is_favorite?: boolean;
}

export default function RecentlyViewedScreen() {
  const router = useRouter();
  
  const [recentlyViewed, setRecentlyViewed] = useState<RecentlyViewedItem[]>([]);
  const [recommendations, setRecommendations] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('recent'); // 'recent', 'recommended'
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [stats, setStats] = useState<any>(null);
  const [viewingSessionData, setViewingSessionData] = useState(false);

  // Initialize session ID
  useEffect(() => {
    const initSession = async () => {
      try {
        const isAuthenticated = await apiService.isAuthenticated();
        if (!isAuthenticated) {
          let storedSessionId = await AsyncStorage.getItem('anonymousSessionId');
          if (!storedSessionId) {
            storedSessionId = apiService.generateSessionId();
            await AsyncStorage.setItem('anonymousSessionId', storedSessionId);
          }
          setSessionId(storedSessionId);
          setViewingSessionData(true);
        } else {
          setViewingSessionData(false);
        }
      } catch (error) {
        console.error('Error initializing session:', error);
      }
    };
    
    initSession();
  }, []);

  // Load data
  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      switch (activeTab) {
        case 'recent':
          await loadRecentlyViewed();
          break;
        case 'recommended':
          await loadRecommendations();
          break;
      }
      
      // Load user stats if authenticated
      await loadUserStats();
    } catch (error) {
      console.error('Failed to load data:', error);
      Alert.alert('Error', 'Failed to load data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const loadRecentlyViewed = async () => {
    try {
      const isAuthenticated = await apiService.isAuthenticated();
      let result;
      
      if (isAuthenticated) {
        result = await apiService.getRecentlyViewedProducts({
          limit: 20,
          include_product_details: true
        });
      } else if (sessionId) {
        result = await apiService.getSessionViews(sessionId, {
          limit: 20,
          include_product_details: true
        });
      }
      
      // Handle different API response formats
      if (Array.isArray(result)) {
        setRecentlyViewed(result);
      } else if (result && typeof result === 'object' && result.items) {
        setRecentlyViewed(result.items);
      } else {
        setRecentlyViewed([]);
      }
    } catch (error) {
      console.error('Failed to load recently viewed:', error);
      setRecentlyViewed([]);
    }
  };

  const loadRecommendations = async () => {
    try {
      const isAuthenticated = await apiService.isAuthenticated();
      let result;
      
      if (isAuthenticated) {
        result = await apiService.getPersonalizedRecommendations(10);
      } else if (sessionId) {
        // For anonymous users, show trending instead
        result = await apiService.getTrendingProducts({
          limit: 10,
          hours: 24
        });
      }
      
      // Handle different API response formats
      if (Array.isArray(result)) {
        setRecommendations(result);
      } else if (result && typeof result === 'object' && result.items) {
        setRecommendations(result.items);
      } else {
        setRecommendations([]);
      }
    } catch (error) {
      console.error('Failed to load recommendations:', error);
      setRecommendations([]);
    }
  };

  const loadUserStats = async () => {
    try {
      const isAuthenticated = await apiService.isAuthenticated();
      if (isAuthenticated) {
        const result = await apiService.getUserViewStats(30);
        setStats(result);
      }
    } catch (error) {
      console.error('Failed to load user stats:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  // Check authentication
  const checkAuthentication = async (): Promise<boolean> => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      return !!token;
    } catch (error) {
      console.error('Auth check error:', error);
      return false;
    }
  };

  // Auth check wrapper
  const handleProtectedAction = async (actionName: string, actionCallback: () => void) => {
    const isAuthenticated = await checkAuthentication();
    
    if (!isAuthenticated) {
      Alert.alert(
        'Authentication Required',
        `Please sign up or log in to ${actionName}.`,
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Sign Up / Login',
            onPress: () => {
              router.push('/Screen4');
            },
          },
        ]
      );
      return;
    }
    
    actionCallback();
  };

  const handleBack = () => {
    router.back();
  };

  const handleProductPress = (productId: string) => {
    router.push({ pathname: '/product' as any, params: { id: productId } });
  };

  const handleClearAll = async () => {
    const isAuthenticated = await checkAuthentication();
    
    if (!isAuthenticated && !sessionId) {
      Alert.alert(
        'Clear Recently Viewed',
        'Please sign in to clear your history across devices.',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Sign In',
            onPress: () => {
              router.push('/Screen4');
            },
          },
        ]
      );
      return;
    }

    Alert.alert(
      'Clear Recently Viewed',
      'Are you sure you want to clear all recently viewed items?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            try {
              if (isAuthenticated) {
                await apiService.clearRecentlyViewed();
              } else if (sessionId) {
                await AsyncStorage.removeItem('anonymousSessionId');
                setSessionId(null);
                // Generate new session ID
                const newSessionId = apiService.generateSessionId();
                await AsyncStorage.setItem('anonymousSessionId', newSessionId);
                setSessionId(newSessionId);
              }
              
              setRecentlyViewed([]);
              Alert.alert('Success', 'Recently viewed history cleared');
            } catch (error) {
              console.error('Failed to clear history:', error);
              Alert.alert('Error', 'Failed to clear history. Please try again.');
            }
          },
        },
      ]
    );
  };

  const toggleLike = async (productId: string) => {
    handleProtectedAction('like products', async () => {
      try {
        // Check if already favorited
        const isFavorite = await checkIfFavorite(productId);
        
        if (isFavorite) {
          await apiService.removeFromFavorites(productId);
        } else {
          await apiService.addToFavorites(productId);
        }
        
        // Update local state
        setRecentlyViewed(prev => 
          prev.map(item => {
            if (item.product_details?.id === productId) {
              return {
                ...item,
                product_details: {
                  ...item.product_details,
                  is_favorite: !item.product_details.is_favorite
                }
              };
            }
            return item;
          })
        );
        
        // Also update recommendations if product is in recommendations
        setRecommendations(prev =>
          prev.map(product =>
            product.id === productId
              ? { ...product, is_favorite: !product.is_favorite }
              : product
          )
        );
      } catch (error) {
        console.error('Failed to toggle favorite:', error);
        Alert.alert('Error', 'Failed to update favorite status');
      }
    });
  };

  const checkIfFavorite = async (productId: string): Promise<boolean> => {
    try {
      const result = await apiService.checkFavorite(productId);
      return result?.is_favorite || false;
    } catch (error) {
      return false;
    }
  };

  const handleLoginPrompt = () => {
    Alert.alert(
      'Sign In Required',
      'Sign in to sync your recently viewed items across devices and get personalized recommendations.',
      [
        {
          text: 'Maybe Later',
          style: 'cancel',
        },
        {
          text: 'Sign In',
          onPress: () => {
            router.push('/Screen4');
          },
        },
      ]
    );
  };

  const handleMergeSession = async () => {
    if (!sessionId) return;
    
    try {
      await apiService.mergeSessionToUser(sessionId);
      await AsyncStorage.removeItem('anonymousSessionId');
      setSessionId(null);
      setViewingSessionData(false);
      
      // Reload data
      await loadRecentlyViewed();
      
      Alert.alert('Success', 'Your browsing history has been synced to your account');
    } catch (error) {
      console.error('Failed to merge session:', error);
      Alert.alert('Error', 'Failed to sync your history. Please try again.');
    }
  };

  const getCategoryIcon = (categoryName?: string) => {
    if (!categoryName) return '📦';
    
    switch (categoryName.toLowerCase()) {
      case 'smartphones':
      case 'phones':
        return '📱';
      case 'laptops':
      case 'computers':
        return '💻';
      case 'audio':
      case 'headphones':
      case 'speakers':
        return '🎧';
      case 'wearables':
      case 'watches':
        return '⌚';
      case 'cameras':
        return '📸';
      case 'tablets':
        return '📱';
      case 'gaming':
      case 'games':
        return '🎮';
      case 'home':
      case 'electronics':
        return '🏠';
      default:
        return '📦';
    }
  };

  const formatPrice = (price: number) => {
    return `MWK ${price?.toLocaleString() || '0'}`;
  };

  const formatRelativeTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
      
      if (diffInSeconds < 60) return 'Just now';
      if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
      if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
      if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
      return date.toLocaleDateString();
    } catch (error) {
      return 'Recently';
    }
  };

  const getProductImage = (product: Product) => {
    if (product.images && product.images.length > 0) {
      const primaryImage = product.images.find(img => img.is_primary);
      return primaryImage?.url || product.images[0].url;
    }
    return 'https://via.placeholder.com/150';
  };

  const getCurrentData = (): Product[] => {
    if (activeTab === 'recent') {
      // Convert RecentlyViewedItem[] to Product[]
      return recentlyViewed
        .map(item => item.product_details)
        .filter((product): product is Product => product !== undefined)
        .map(product => ({
          ...product,
          category: product.category || { name: 'Uncategorized' }
        }));
    } else {
      // Ensure recommendations have proper structure
      return recommendations.map(product => ({
        ...product,
        category: product.category || { name: 'Uncategorized' }
      }));
    }
  };

  const renderProductItem = ({ item }: { item: Product }) => {
    const viewedItem = recentlyViewed.find(rv => rv.product_id === item.id);
    
    return (
      <TouchableOpacity
        style={styles.productCard}
        activeOpacity={0.9}
        onPress={() => handleProductPress(item.id)}
      >
        <View style={styles.productHeader}>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryIcon}>
              {getCategoryIcon(item.category?.name)}
            </Text>
            <Text style={styles.categoryText} numberOfLines={1}>
              {item.category?.name || 'Uncategorized'}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.likeButton}
            onPress={() => toggleLike(item.id)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons
              name={item.is_favorite ? "heart" : "heart-outline"}
              size={20}
              color={item.is_favorite ? "#EF4444" : "#9CA3AF"}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.productImageContainer}>
          <Image
            source={{ uri: getProductImage(item) }}
            style={styles.productImage}
            resizeMode="cover"
          />
        </View>

        <View style={styles.productInfo}>
          <Text style={styles.productName} numberOfLines={2}>
            {item.name}
          </Text>
          
          <View style={styles.priceContainer}>
            <Text style={styles.productPrice}>
              {formatPrice(item.price)}
            </Text>
            {item.original_price && item.original_price > item.price && (
              <Text style={styles.originalPrice}>
                {formatPrice(item.original_price)}
              </Text>
            )}
          </View>
          
          {item.rating !== undefined && (
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={16} color="#F59E0B" />
              <Text style={styles.ratingText}>{item.rating.toFixed(1)}</Text>
            </View>
          )}
        </View>

        <View style={styles.productFooter}>
          {viewedItem && activeTab === 'recent' && (
            <Text style={styles.viewedAtText}>
              <Ionicons name="time-outline" size={14} color="#6B7280" />
              {' '}{formatRelativeTime(viewedItem.viewed_at)}
            </Text>
          )}
          {activeTab === 'recommended' && item.shop && (
            <Text style={styles.shopText} numberOfLines={1}>
              {item.shop.name}
            </Text>
          )}
          <TouchableOpacity
            style={styles.viewButton}
            onPress={() => handleProductPress(item.id)}
          >
            <Text style={styles.viewButtonText}>View</Text>
            <Ionicons name="arrow-forward" size={14} color="#4F46E5" />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons 
        name={activeTab === 'recent' ? "eye-off-outline" : "sparkles-outline"} 
        size={80} 
        color="#E5E7EB" 
      />
      <Text style={styles.emptyTitle}>
        {activeTab === 'recent' ? 'No Recent Views' : 'No Recommendations'}
      </Text>
      <Text style={styles.emptyText}>
        {activeTab === 'recent' 
          ? 'Products you view will appear here. Start browsing to build your list!'
          : viewingSessionData
            ? 'Sign in to get personalized recommendations based on your browsing history!'
            : 'Browse more products to get personalized recommendations!'}
      </Text>
      <TouchableOpacity
        style={styles.browseButton}
        onPress={() => router.push('/Categories')}
      >
        <Text style={styles.browseButtonText}>Browse Products</Text>
      </TouchableOpacity>
      {viewingSessionData && (
        <TouchableOpacity
          style={styles.signInButton}
          onPress={handleLoginPrompt}
        >
          <Text style={styles.signInButtonText}>Sign In</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const currentData = getCurrentData();

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={handleBack}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Recently Viewed</Text>
          <Text style={styles.headerSubtitle}>
            {activeTab === 'recent' 
              ? `${currentData.length} ${currentData.length === 1 ? 'item' : 'items'}`
              : 'Personalized for you'}
          </Text>
        </View>
        
        {activeTab === 'recent' && currentData.length > 0 && (
          <TouchableOpacity 
            style={styles.clearButton}
            onPress={handleClearAll}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={styles.clearButtonText}>Clear All</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Stats & Info Banner */}
      {viewingSessionData && (
        <View style={styles.sessionBanner}>
          <View style={styles.sessionInfo}>
            <Ionicons name="information-circle-outline" size={20} color="#4F46E5" />
            <Text style={styles.sessionText}>
              You're viewing anonymous session data
            </Text>
          </View>
          <TouchableOpacity onPress={handleLoginPrompt}>
            <Text style={styles.sessionActionText}>Sign In</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Stats Overview */}
      {stats && activeTab === 'recent' && !viewingSessionData && (
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.total_views || 0}</Text>
            <Text style={styles.statLabel}>Total Views</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.unique_products || 0}</Text>
            <Text style={styles.statLabel}>Products</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.days_active || 0}</Text>
            <Text style={styles.statLabel}>Active Days</Text>
          </View>
        </View>
      )}

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'recent' && styles.activeTab]}
          onPress={() => setActiveTab('recent')}
        >
          <Ionicons
            name="time-outline"
            size={20}
            color={activeTab === 'recent' ? '#4F46E5' : '#6B7280'}
          />
          <Text style={[
            styles.tabText,
            activeTab === 'recent' && styles.activeTabText
          ]}>
            Recent
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'recommended' && styles.activeTab]}
          onPress={() => setActiveTab('recommended')}
        >
          <Ionicons
            name="sparkles-outline"
            size={20}
            color={activeTab === 'recommended' ? '#4F46E5' : '#6B7280'}
          />
          <Text style={[
            styles.tabText,
            activeTab === 'recommended' && styles.activeTabText
          ]}>
            For You
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={styles.container}>
        {loading && !refreshing ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4F46E5" />
            <Text style={styles.loadingText}>Loading...</Text>
          </View>
        ) : currentData.length > 0 ? (
          <FlatList
            data={currentData}
            renderItem={renderProductItem}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            numColumns={2}
            columnWrapperStyle={styles.columnWrapper}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={['#4F46E5']}
                tintColor="#4F46E5"
              />
            }
            ListHeaderComponent={
              <View style={styles.listHeader}>
                <Text style={styles.sectionDescription}>
                  {activeTab === 'recent'
                    ? 'Products you\'ve viewed recently'
                    : 'Recommended based on your interests'}
                </Text>
                {viewingSessionData && activeTab === 'recent' && currentData.length > 0 && (
                  <TouchableOpacity
                    style={styles.mergeButton}
                    onPress={handleMergeSession}
                  >
                    <Text style={styles.mergeButtonText}>
                      Merge to account
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            }
          />
        ) : (
          <ScrollView
            contentContainerStyle={styles.emptyScrollContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={['#4F46E5']}
                tintColor="#4F46E5"
              />
            }
          >
            {renderEmptyState()}
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: 'System',
    fontWeight: '600',
    color: '#111827',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  clearButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#FEF2F2',
    borderRadius: 16,
  },
  clearButtonText: {
    fontSize: 14,
    color: '#EF4444',
    fontWeight: '500',
  },
  sessionBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F0F4FF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E7FF',
  },
  sessionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  sessionText: {
    fontSize: 13,
    color: '#4F46E5',
    marginLeft: 8,
    flex: 1,
  },
  sessionActionText: {
    fontSize: 14,
    color: '#4F46E5',
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    marginHorizontal: 16,
    marginTop: 12,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#4F46E5',
  },
  statLabel: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: '#E2E8F0',
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 20,
    marginHorizontal: 4,
  },
  activeTab: {
    backgroundColor: '#F0F4FF',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
    marginLeft: 6,
  },
  activeTabText: {
    color: '#4F46E5',
  },
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6B7280',
  },
  listHeader: {
    marginBottom: 20,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 100,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 12,
  },
  mergeButton: {
    alignSelf: 'center',
    backgroundColor: '#4F46E5',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  mergeButtonText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  columnWrapper: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  productCard: {
    width: (width - 48) / 2,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  productHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    maxWidth: '70%',
  },
  categoryIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  categoryText: {
    fontSize: 10,
    color: '#6B7280',
    fontWeight: '500',
    flexShrink: 1,
  },
  likeButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  productImageContainer: {
    width: '100%',
    height: (width - 48) / 2 - 40,
    borderRadius: 8,
    backgroundColor: '#F9FAFB',
    marginBottom: 8,
    overflow: 'hidden',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  productInfo: {
    flex: 1,
    marginBottom: 8,
  },
  productName: {
    fontSize: 13,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 6,
    lineHeight: 16,
    minHeight: 32,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  productPrice: {
    fontSize: 15,
    fontWeight: '700',
    color: '#4F46E5',
    marginRight: 8,
  },
  originalPrice: {
    fontSize: 11,
    color: '#9CA3AF',
    textDecorationLine: 'line-through',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 11,
    color: '#6B7280',
    marginLeft: 4,
    fontWeight: '500',
  },
  productFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  viewedAtText: {
    fontSize: 10,
    color: '#6B7280',
    flex: 1,
  },
  shopText: {
    fontSize: 10,
    color: '#4F46E5',
    flex: 1,
    fontStyle: 'italic',
  },
  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewButtonText: {
    fontSize: 11,
    color: '#4F46E5',
    fontWeight: '500',
    marginRight: 2,
  },
  emptyScrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginTop: 24,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  browseButton: {
    backgroundColor: '#4F46E5',
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 14,
    marginBottom: 12,
  },
  browseButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  signInButton: {
    backgroundColor: '#10B981',
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 14,
  },
  signInButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});