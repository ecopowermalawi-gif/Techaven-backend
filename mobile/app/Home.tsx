import React, { useState, useEffect } from 'react';
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
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFonts, Poppins_400Regular, Poppins_600SemiBold } from '@expo-google-fonts/poppins';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from './context/ThemeContext';
import apiService from './services/api';

const { width, height } = Dimensions.get('window');

interface Product {
  id: string;
  name: string;
  price: number;
  rating?: number;
  image_url?: string;
  category?: string;
  description?: string;
  in_stock?: boolean;
}

interface Category {
  id: string;
  name: string;
  icon?: string;
  product_count?: number;
}

interface Shop {
  id: string;
  name: string;
  rating?: number;
  image_url?: string;
  description?: string;
  category?: string;
  is_featured?: boolean;
  product_count?: number;
}

export default function HomeScreen() {
  const [fontsLoaded] = useFonts({
    'Poppins-Regular': Poppins_400Regular,
    'Poppins-SemiBold': Poppins_600SemiBold,
  });
  const [activeTab, setActiveTab] = useState('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [hotSalesProducts, setHotSalesProducts] = useState<Product[]>([]);
  const [recentlyViewedProducts, setRecentlyViewedProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredShops, setFeaturedShops] = useState<Shop[]>([]);
  
  const router = useRouter();
  const { isDarkMode } = useTheme();

  // Fetch data on component mount
  useEffect(() => {
    fetchHomeData();
  }, []);

  const fetchHomeData = async () => {
    try {
      setLoading(true);
      
      // Fetch hot sales products
      const hotSalesResponse = await apiService.getProducts({ 
        limit: 6, 
        sort_by: 'sales',
        is_featured: true 
      });
      
      // Fetch categories
      const categoriesResponse = await apiService.getProducts({ 
        group_by: 'category',
        limit: 4 
      });
      
      // Fetch recently viewed
      const recentResponse = await apiService.getProducts({ 
        limit: 4,
        sort_by: 'created_at',
        order: 'desc'
      });
      
      // Fetch featured shops
      const shopsResponse = await apiService.getShops({ 
        limit: 4,
        is_featured: true,
        sort_by: 'rating',
        order: 'desc'
      });
      
      // Transform API data
      if (hotSalesResponse && hotSalesResponse.items) {
        setHotSalesProducts(hotSalesResponse.items);
      }
      
      if (categoriesResponse && categoriesResponse.categories) {
        setCategories(categoriesResponse.categories.map((cat: any) => ({
          id: cat.id,
          name: cat.name,
          product_count: cat.product_count,
          icon: getCategoryIcon(cat.name)
        })));
      }
      
      if (recentResponse && recentResponse.items) {
        setRecentlyViewedProducts(recentResponse.items);
      }
      
      if (shopsResponse && shopsResponse.items) {
        setFeaturedShops(shopsResponse.items);
      }
      
    } catch (error) {
      console.error('Error fetching home data:', error);
      Alert.alert('Error', 'Failed to load data. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchHomeData();
  };

  const getCategoryIcon = (categoryName: string): string => {
    const icons: { [key: string]: string } = {
      'phones': '📱',
      'laptops': '💻',
      'audio': '🎧',
      'watches': '⌚',
      'tablets': '📱',
      'cameras': '📸',
      'gaming': '🎮',
      'accessories': '🛍️',
      'default': '📦'
    };
    
    const lowerName = categoryName.toLowerCase();
    for (const key in icons) {
      if (lowerName.includes(key)) {
        return icons[key];
      }
    }
    return icons.default;
  };

  const getShopCategoryIcon = (categoryName?: string): string => {
    const icons: { [key: string]: string } = {
      'electronics': '🔌',
      'fashion': '👕',
      'home': '🏠',
      'beauty': '💄',
      'sports': '⚽',
      'books': '📚',
      'food': '🍕',
      'default': '🏪'
    };
    
    if (!categoryName) return icons.default;
    
    const lowerName = categoryName.toLowerCase();
    for (const key in icons) {
      if (lowerName.includes(key)) {
        return icons[key];
      }
    }
    return icons.default;
  };

  // Check if user is authenticated
  const checkAuthentication = async (): Promise<boolean> => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      return !!token;
    } catch (error) {
      console.error('Auth check error:', error);
      return false;
    }
  };

  // Auth check wrapper for protected actions
  const handleProtectedAction = async (actionName: string, actionCallback: () => void) => {
    const isAuthenticated = await checkAuthentication();
    
    if (!isAuthenticated) {
      Alert.alert(
        'You Need to Login First',
        `Please login or register first to ${actionName}.`,
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Login',
            onPress: () => {
              router.push('/Screen4');
            },
            style: 'default',
          },
        ]
      );
      return;
    }
    
    actionCallback();
  };

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
    handleProtectedAction('access profile', () => {
      router.push('/Profile');
    });
  };

  const navigateToCart = () => {
    handleProtectedAction('access cart', () => {
      router.push('/Cart');
    });
  };

  const navigateToLikes = () => {
    handleProtectedAction('access likes', () => {
      router.push('/Likes');
    });
  };

  const navigateToNotifications = () => {
    handleProtectedAction('view notifications', () => {
      router.push('/Notifications');
    });
  };

  const navigateToSearch = () => {
    if (searchQuery.trim()) {
      router.push(`/search?query=${encodeURIComponent(searchQuery)}` as any);
    }
  };

  const navigateToCategory = (categoryId: string, categoryName: string) => {
    router.push(`/category/${categoryId}?name=${encodeURIComponent(categoryName)}` as any);
  };

  const navigateToProduct = (productId: string) => {
    router.push({ pathname: '/product', params: { id: productId } } as any);
  };

  const navigateToShop = (shopId: string) => {
    handleProtectedAction('view shop', () => {
      router.push({ pathname: '/shop', params: { id: shopId } } as any);
    });
  };

  const navigateToShops = () => {
    router.push('/Shops');
  };

  // Bottom tab navigation handler
  const handleTabPress = (tabName: string) => {
    setActiveTab(tabName);
    switch (tabName) {
      case 'home':
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
          isActive && styles.activeTabIcon,
          isDarkMode && styles.darkTabIcon,
          isDarkMode && isActive && styles.darkActiveTabIcon
        ]} 
        resizeMode="contain"
      />
      <Text style={[
        styles.tabLabel,
        isActive && styles.activeTabLabel,
        isDarkMode && styles.darkTabLabel,
        isDarkMode && isActive && styles.darkActiveTabLabel
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  // Render Hot Sales Product Item
  const renderHotSalesItem = ({ item }: { item: Product }) => (
    <TouchableOpacity 
      style={[styles.hotSalesCard, isDarkMode && styles.darkHotSalesCard]}
      activeOpacity={0.9}
      onPress={() => {
        handleProtectedAction('view product details', () => {
          navigateToProduct(item.id);
        });
      }}
    >
      {item.image_url ? (
        <Image
          source={{ uri: item.image_url }}
          style={styles.hotSalesImage}
          resizeMode="cover"
        />
      ) : (
        <View style={[styles.hotSalesIconContainer, isDarkMode && styles.darkHotSalesIconContainer]}>
          <Text style={styles.hotSalesIcon}>📦</Text>
        </View>
      )}
      <View style={styles.hotSalesInfo}>
        <Text style={[styles.hotSalesName, isDarkMode && styles.darkHotSalesName]} numberOfLines={2}>
          {item.name}
        </Text>
        <Text style={[styles.hotSalesPrice, isDarkMode && styles.darkHotSalesPrice]}>
          ${item.price.toFixed(2)}
        </Text>
        <Text style={[styles.hotSalesRating, isDarkMode && styles.darkHotSalesRating]}>
          ⭐ {item.rating?.toFixed(1) || '4.0'}
        </Text>
      </View>
    </TouchableOpacity>
  );

  // Render Recently Viewed Product Item
  const renderRecentlyViewedItem = ({ item }: { item: Product }) => (
    <TouchableOpacity 
      style={[styles.recentlyViewedCard, isDarkMode && styles.darkRecentlyViewedCard]}
      activeOpacity={0.9}
      onPress={() => {
        handleProtectedAction('view product details', () => {
          navigateToProduct(item.id);
        });
      }}
    >
      {item.image_url ? (
        <Image
          source={{ uri: item.image_url }}
          style={styles.recentlyViewedImage}
          resizeMode="cover"
        />
      ) : (
        <View style={[styles.recentlyViewedIconContainer, isDarkMode && styles.darkRecentlyViewedIconContainer]}>
          <Text style={styles.recentlyViewedIcon}>📦</Text>
        </View>
      )}
      <View style={styles.recentlyViewedInfo}>
        <Text style={[styles.recentlyViewedName, isDarkMode && styles.darkRecentlyViewedName]} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={[styles.recentlyViewedPrice, isDarkMode && styles.darkRecentlyViewedPrice]}>
          ${item.price.toFixed(2)}
        </Text>
        <Text style={[styles.recentlyViewedRating, isDarkMode && styles.darkRecentlyViewedRating]}>
          ⭐ {item.rating?.toFixed(1) || '4.0'}
        </Text>
      </View>
    </TouchableOpacity>
  );

  // Render Shop Item
  const renderShopItem = ({ item }: { item: Shop }) => (
    <TouchableOpacity 
      style={[styles.shopCard, isDarkMode && styles.darkShopCard]}
      activeOpacity={0.9}
      onPress={() => navigateToShop(item.id)}
    >
      <View style={styles.shopImageContainer}>
        {item.image_url ? (
          <Image
            source={{ uri: item.image_url }}
            style={styles.shopImage}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.shopIconContainer, isDarkMode && styles.darkShopIconContainer]}>
            <Text style={styles.shopIcon}>
              {getShopCategoryIcon(item.category)}
            </Text>
          </View>
        )}
        <View style={styles.shopBadge}>
          <Text style={styles.shopBadgeText}>Featured</Text>
        </View>
      </View>
      <View style={styles.shopInfo}>
        <Text style={[styles.shopName, isDarkMode && styles.darkShopName]} numberOfLines={1}>
          {item.name}
        </Text>
        {item.category && (
          <Text style={[styles.shopCategory, isDarkMode && styles.darkShopCategory]}>
            {item.category}
          </Text>
        )}
        <View style={styles.shopRatingContainer}>
          <Text style={[styles.shopRating, isDarkMode && styles.darkShopRating]}>
            ⭐ {item.rating?.toFixed(1) || '4.5'}
          </Text>
          {item.product_count !== undefined && (
            <Text style={[styles.shopProductCount, isDarkMode && styles.darkShopProductCount]}>
              {item.product_count} products
            </Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  if (!fontsLoaded) {
    return (
      <View style={[styles.loadingContainer, isDarkMode && styles.darkLoadingContainer]}>
        <ActivityIndicator size="large" color="#232CAD" />
        <Text style={[styles.loadingText, isDarkMode && styles.darkLoadingText]}>Loading...</Text>
      </View>
    );
  }

  if (loading && !refreshing) {
    return (
      <View style={[styles.loadingContainer, isDarkMode && styles.darkLoadingContainer]}>
        <ActivityIndicator size="large" color="#232CAD" />
        <Text style={[styles.loadingText, isDarkMode && styles.darkLoadingText]}>Loading products...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, isDarkMode && styles.darkSafeArea]}>
      <View style={styles.mainContainer}>
        <ScrollView 
          style={styles.scrollView} 
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={isDarkMode ? '#BB86FC' : '#232CAD'}
            />
          }
        >
          <View style={[styles.container, isDarkMode && styles.darkContainer]}>
            <LinearGradient 
              colors={isDarkMode ? ['#1E1E1E', '#121212'] : ['#FFFFFF', '#E8EBF9']} 
              start={{ x: 0.5, y: 0 }} 
              end={{ x: 0.5, y: 1 }} 
              style={styles.gradient} 
            />
        
            {/* Top Bar */}
            <View style={[styles.topBar, isDarkMode && styles.darkTopBar]}>
              <Image 
                source={require('@/assets/images/logo.png')} 
                style={styles.logo} 
                resizeMode="contain" 
              />
              
              <View style={styles.iconsContainer}>
                <TouchableOpacity style={styles.iconButton} onPress={navigateToNotifications}>
                  <Image 
                    source={require('@/assets/images/bell.png')} 
                    style={[styles.bellIcon, isDarkMode && styles.darkBellIcon]} 
                    resizeMode="contain"
                  />
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.iconButton} onPress={navigateToCart}>
                  <Image 
                    source={require('@/assets/images/shopping-cart.png')} 
                    style={[styles.cartIcon, isDarkMode && styles.darkCartIcon]} 
                    resizeMode="contain"
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Search Bar */}
            <View style={styles.searchContainer}>
              <View style={[styles.searchField, isDarkMode && styles.darkSearchField]}>
                <Image 
                  source={require('@/assets/images/Search.png')} 
                  style={[styles.searchIcon, isDarkMode && styles.darkSearchIcon]} 
                  resizeMode="contain"
                />
                
                <TextInput
                  style={[styles.searchInput, isDarkMode && styles.darkSearchInput]}
                  placeholder="Search products, shops..."
                  placeholderTextColor={isDarkMode ? '#AAAAAA' : '#757575'}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  onSubmitEditing={navigateToSearch}
                  returnKeyType="search"
                />
              </View>
              
              <TouchableOpacity 
                style={[styles.notificationButton, isDarkMode && styles.darkNotificationButton]}
                onPress={navigateToSearch}
              >
                <Image 
                  source={require('@/assets/images/Search.png')} 
                  style={[styles.notificationIcon, isDarkMode && styles.darkNotificationIcon]} 
                  resizeMode="contain"
                />
              </TouchableOpacity>
            </View>

            {/* Blue Frame Section - Promotional Banner */}
            <TouchableOpacity 
              style={styles.blueFrame}
              activeOpacity={0.9}
              onPress={() => {
                handleProtectedAction('view featured content', () => {
                  console.log('Promotional banner tapped');
                });
              }}
            >
              <LinearGradient
                colors={['#232CAD', '#4547D1']}
                style={styles.bannerGradient}
              >
                <Text style={styles.bannerTitle}>Special Sale</Text>
                <Text style={styles.bannerSubtitle}>Up to 50% off on selected items</Text>
              </LinearGradient>
            </TouchableOpacity>

            {/* Categories Header Section */}
            <View style={styles.categoriesHeader}>
              <Text style={[styles.categoriesTitle, isDarkMode && styles.darkCategoriesTitle]}>Categories</Text>
              <TouchableOpacity onPress={navigateToCategories}>
                <Text style={[styles.seeAllText, isDarkMode && styles.darkSeeAllText]}>See all</Text>
              </TouchableOpacity>
            </View>

            {/* Categories Grid Preview */}
            {categories.length > 0 ? (
              <View style={styles.categoriesPreview}>
                {categories.slice(0, 4).map((category) => (
                  <TouchableOpacity 
                    key={category.id}
                    style={styles.categoryPreviewItem}
                    onPress={() => navigateToCategory(category.id, category.name)}
                  >
                    <View style={[styles.categoryPreviewIcon, isDarkMode && styles.darkCategoryPreviewIcon]}>
                      <Text style={styles.categoryPreviewEmoji}>{category.icon}</Text>
                    </View>
                    <Text style={[styles.categoryPreviewText, isDarkMode && styles.darkCategoryPreviewText]}>
                      {category.name}
                    </Text>
                    {category.product_count && (
                      <Text style={[styles.categoryCount, isDarkMode && styles.darkCategoryCount]}>
                        {category.product_count} items
                      </Text>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <View style={styles.emptySection}>
                <Text style={[styles.emptyText, isDarkMode && styles.darkEmptyText]}>No categories found</Text>
              </View>
            )}

            {/* Featured Shops Header Section */}
            <View style={styles.shopsHeader}>
              <Text style={[styles.shopsTitle, isDarkMode && styles.darkShopsTitle]}>
                Featured Shops
              </Text>
              <TouchableOpacity onPress={navigateToShops}>
                <Text style={[styles.seeAllText, isDarkMode && styles.darkSeeAllText]}>See all</Text>
              </TouchableOpacity>
            </View>

            {/* Featured Shops Grid */}
            {featuredShops.length > 0 ? (
              <View style={styles.shopsGrid}>
                <View style={styles.shopsRow}>
                  {featuredShops.slice(0, 2).map((shop) => (
                    <TouchableOpacity 
                      key={shop.id}
                      style={[styles.shopCard, isDarkMode && styles.darkShopCard]}
                      onPress={() => navigateToShop(shop.id)}
                    >
                      <View style={styles.shopImageContainer}>
                        {shop.image_url ? (
                          <Image
                            source={{ uri: shop.image_url }}
                            style={styles.shopImage}
                            resizeMode="cover"
                          />
                        ) : (
                          <View style={[styles.shopIconContainer, isDarkMode && styles.darkShopIconContainer]}>
                            <Text style={styles.shopIcon}>
                              {getShopCategoryIcon(shop.category)}
                            </Text>
                          </View>
                        )}
                      </View>
                      <View style={styles.shopInfo}>
                        <Text style={[styles.shopName, isDarkMode && styles.darkShopName]} numberOfLines={1}>
                          {shop.name}
                        </Text>
                        <View style={styles.shopRatingContainer}>
                          <Text style={[styles.shopRating, isDarkMode && styles.darkShopRating]}>
                            ⭐ {shop.rating?.toFixed(1) || '4.5'}
                          </Text>
                          {shop.product_count !== undefined && (
                            <Text style={[styles.shopProductCount, isDarkMode && styles.darkShopProductCount]}>
                              {shop.product_count} items
                            </Text>
                          )}
                        </View>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
                {featuredShops.length > 2 && (
                  <View style={styles.shopsRow}>
                    {featuredShops.slice(2, 4).map((shop) => (
                      <TouchableOpacity 
                        key={shop.id}
                        style={[styles.shopCard, isDarkMode && styles.darkShopCard]}
                        onPress={() => navigateToShop(shop.id)}
                      >
                        <View style={styles.shopImageContainer}>
                          {shop.image_url ? (
                            <Image
                              source={{ uri: shop.image_url }}
                              style={styles.shopImage}
                              resizeMode="cover"
                            />
                          ) : (
                            <View style={[styles.shopIconContainer, isDarkMode && styles.darkShopIconContainer]}>
                              <Text style={styles.shopIcon}>
                                {getShopCategoryIcon(shop.category)}
                              </Text>
                            </View>
                          )}
                        </View>
                        <View style={styles.shopInfo}>
                          <Text style={[styles.shopName, isDarkMode && styles.darkShopName]} numberOfLines={1}>
                            {shop.name}
                          </Text>
                          <View style={styles.shopRatingContainer}>
                            <Text style={[styles.shopRating, isDarkMode && styles.darkShopRating]}>
                              ⭐ {shop.rating?.toFixed(1) || '4.5'}
                            </Text>
                            {shop.product_count !== undefined && (
                              <Text style={[styles.shopProductCount, isDarkMode && styles.darkShopProductCount]}>
                                {shop.product_count} items
                              </Text>
                            )}
                          </View>
                        </View>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            ) : (
              <View style={styles.emptySection}>
                <Text style={[styles.emptyText, isDarkMode && styles.darkEmptyText]}>No featured shops</Text>
              </View>
            )}

            {/* Recently Viewed Header Section */}
            <View style={styles.recentlyViewedHeader}>
              <Text style={[styles.recentlyViewedTitle, isDarkMode && styles.darkRecentlyViewedTitle]}>
                Recently Added
              </Text>
              <TouchableOpacity onPress={navigateToCategories}>
                <Text style={[styles.seeAllText, isDarkMode && styles.darkSeeAllText]}>See all</Text>
              </TouchableOpacity>
            </View>

            {/* Recently Viewed Grid */}
            {recentlyViewedProducts.length > 0 ? (
              <View style={styles.recentlyViewedGrid}>
                <View style={styles.recentlyViewedRow}>
                  {recentlyViewedProducts.slice(0, 2).map((product) => (
                    <TouchableOpacity 
                      key={product.id}
                      style={[styles.recentlyViewedCard, isDarkMode && styles.darkRecentlyViewedCard]}
                      onPress={() => {
                        handleProtectedAction('view product details', () => {
                          navigateToProduct(product.id);
                        });
                      }}
                    >
                      {product.image_url ? (
                        <Image
                          source={{ uri: product.image_url }}
                          style={styles.recentlyViewedImage}
                          resizeMode="cover"
                        />
                      ) : (
                        <View style={[styles.recentlyViewedIconContainer, isDarkMode && styles.darkRecentlyViewedIconContainer]}>
                          <Text style={styles.recentlyViewedIcon}>📦</Text>
                        </View>
                      )}
                      <View style={styles.recentlyViewedInfo}>
                        <Text style={[styles.recentlyViewedName, isDarkMode && styles.darkRecentlyViewedName]} numberOfLines={1}>
                          {product.name}
                        </Text>
                        <Text style={[styles.recentlyViewedPrice, isDarkMode && styles.darkRecentlyViewedPrice]}>
                          ${product.price.toFixed(2)}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
                {recentlyViewedProducts.length > 2 && (
                  <View style={styles.recentlyViewedRow}>
                    {recentlyViewedProducts.slice(2, 4).map((product) => (
                      <TouchableOpacity 
                        key={product.id}
                        style={[styles.recentlyViewedCard, isDarkMode && styles.darkRecentlyViewedCard]}
                        onPress={() => {
                          handleProtectedAction('view product details', () => {
                            navigateToProduct(product.id);
                          });
                        }}
                      >
                        {product.image_url ? (
                          <Image
                            source={{ uri: product.image_url }}
                            style={styles.recentlyViewedImage}
                            resizeMode="cover"
                          />
                        ) : (
                          <View style={[styles.recentlyViewedIconContainer, isDarkMode && styles.darkRecentlyViewedIconContainer]}>
                            <Text style={styles.recentlyViewedIcon}>📦</Text>
                          </View>
                        )}
                        <View style={styles.recentlyViewedInfo}>
                          <Text style={[styles.recentlyViewedName, isDarkMode && styles.darkRecentlyViewedName]} numberOfLines={1}>
                            {product.name}
                          </Text>
                          <Text style={[styles.recentlyViewedPrice, isDarkMode && styles.darkRecentlyViewedPrice]}>
                            ${product.price.toFixed(2)}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            ) : (
              <View style={styles.emptySection}>
                <Text style={[styles.emptyText, isDarkMode && styles.darkEmptyText]}>No recent products</Text>
              </View>
            )}

            {/* Hot Sales Header Section */}
            <View style={styles.hotSellsHeader}>
              <Text style={[styles.hotSellsTitle, isDarkMode && styles.darkHotSellsTitle]}>Hot Sales</Text>
              <TouchableOpacity onPress={navigateToHotSales}>
                <Text style={[styles.seeAllText, isDarkMode && styles.darkSeeAllText]}>See all</Text>
              </TouchableOpacity>
            </View>

            {/* Hot Sales Horizontal Scroll */}
            {hotSalesProducts.length > 0 ? (
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
                  snapToInterval={160}
                />
              </View>
            ) : (
              <View style={styles.emptySection}>
                <Text style={[styles.emptyText, isDarkMode && styles.darkEmptyText]}>No hot sales products</Text>
              </View>
            )}

            {/* Special Offers Banner */}
            <TouchableOpacity 
              style={styles.secondBannerDefault}
              activeOpacity={0.9}
              onPress={navigateToSpecialOffers}
            >
              <LinearGradient
                colors={['#11123A', '#232CAD']}
                style={styles.bannerGradient}
              >
                <Text style={styles.bannerTitle}>Special Offers</Text>
                <Text style={styles.bannerSubtitle}>Limited time deals</Text>
              </LinearGradient>
            </TouchableOpacity>

            {/* Bottom Spacer */}
            <View style={styles.bottomSpacer} />
          </View>
        </ScrollView>

        {/* Bottom Tab Bar */}
        <View style={[styles.bottomTabBar, isDarkMode && styles.darkBottomTabBar]}>
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
  // Light mode styles
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
  emptySection: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: '#666666',
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
  },
  logo: {
    width: 140,
    height: 28.13,
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
    tintColor: '#000000',
  },
  cartIcon: {
    width: 20,
    height: 20,
    tintColor: '#000000',
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
    marginRight: 8,
    tintColor: '#666666',
  },
  searchInput: {
    flex: 1,
    fontFamily: 'Poppins-Regular',
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 14,
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
    tintColor: '#666666',
  },
  // Blue Frame Section
  blueFrame: {
    width: 382,
    height: 149,
    backgroundColor: '#232CAD',
    borderRadius: 18,
    alignSelf: 'center',
    marginTop: 16,
    marginBottom: 24,
    overflow: 'hidden',
  },
  bannerGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  bannerTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 24,
    color: '#FFFFFF',
    marginBottom: 8,
  },
  bannerSubtitle: {
    fontFamily: 'Poppins-Regular',
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
  },
  // Categories Header Section
  categoriesHeader: {
    width: 382,
    height: 25,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 16,
  },
  categoriesTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 18,
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
    marginBottom: 4,
  },
  categoryCount: {
    fontFamily: 'Poppins-Regular',
    fontSize: 10,
    color: '#666666',
  },
  // Featured Shops Section
  shopsHeader: {
    width: 382,
    height: 25,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 16,
  },
  shopsTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 18,
    color: '#000000',
  },
  shopsGrid: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  shopsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  shopCard: {
    width: (width - 48 - 16) / 2,
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
    overflow: 'hidden',
  },
  shopImageContainer: {
    position: 'relative',
    width: '100%',
    height: 100,
  },
  shopImage: {
    width: '100%',
    height: '100%',
  },
  shopIconContainer: {
    width: '100%',
    height: '100%',
    backgroundColor: '#E8E8E8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  shopIcon: {
    fontSize: 40,
  },
  shopBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#232CAD',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  shopBadgeText: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 10,
    color: '#FFFFFF',
  },
  shopInfo: {
    padding: 12,
  },
  shopName: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 14,
    color: '#000000',
    marginBottom: 4,
  },
  shopCategory: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
    color: '#666666',
    marginBottom: 4,
  },
  shopRatingContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  shopRating: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
    color: '#666666',
  },
  shopProductCount: {
    fontFamily: 'Poppins-Regular',
    fontSize: 10,
    color: '#666666',
  },
  // Recently Viewed Section
  recentlyViewedHeader: {
    width: 382,
    height: 25,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 16,
  },
  recentlyViewedTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 18,
    color: '#000000',
  },
  recentlyViewedGrid: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  recentlyViewedRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  recentlyViewedCard: {
    width: (width - 48 - 16) / 2,
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
    overflow: 'hidden',
  },
  recentlyViewedImage: {
    width: '100%',
    height: 120,
  },
  recentlyViewedIconContainer: {
    width: '100%',
    height: 120,
    backgroundColor: '#E8E8E8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  recentlyViewedIcon: {
    fontSize: 40,
  },
  recentlyViewedInfo: {
    padding: 12,
  },
  recentlyViewedName: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: '#000000',
    marginBottom: 4,
  },
  recentlyViewedPrice: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 16,
    color: '#232CAD',
  },
  recentlyViewedRating: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
    color: '#666666',
  },
  seeAllText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: '#232CAD',
    textDecorationLine: 'underline',
  },
  // Second Banner Default - Below Hot Sells
  secondBannerDefault: {
    width: 379,
    height: 150,
    borderRadius: 10,
    alignSelf: 'center',
    marginBottom: 24,
    overflow: 'hidden',
  },
  // Hot Sells Header Section
  hotSellsHeader: {
    width: 382,
    height: 25,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 16,
  },
  hotSellsTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 18,
    color: '#000000',
  },
  // Hot Sales Horizontal Scroll
  hotSalesContainer: {
    height: 220,
    marginBottom: 24,
  },
  hotSalesList: {
    paddingHorizontal: 24,
    paddingVertical: 8,
    gap: 16,
  },
  hotSalesCard: {
    width: 160,
    height: 200,
    backgroundColor: '#F2F2FF',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  hotSalesImage: {
    width: '100%',
    height: 120,
  },
  hotSalesIconContainer: {
    width: '100%',
    height: 120,
    backgroundColor: '#E0E0FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  hotSalesIcon: {
    fontSize: 40,
  },
  hotSalesInfo: {
    padding: 12,
    flex: 1,
    justifyContent: 'space-between',
  },
  hotSalesName: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: '#000000',
    marginBottom: 4,
  },
  hotSalesPrice: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 16,
    color: '#232CAD',
    marginBottom: 4,
  },
  hotSalesRating: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
    color: '#666666',
  },
  bottomSpacer: {
    height: 20,
  },
  // Bottom Tab Bar
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
    width: 24,
    height: 24,
    marginBottom: 4,
    opacity: 0.6,
    tintColor: '#666666',
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

  // Dark mode styles
  darkSafeArea: {
    backgroundColor: '#121212',
  },
  darkContainer: {
    backgroundColor: '#121212',
  },
  darkLoadingContainer: {
    backgroundColor: '#121212',
  },
  darkLoadingText: {
    color: '#CCCCCC',
  },
  darkEmptyText: {
    color: '#AAAAAA',
  },
  darkTopBar: {
    backgroundColor: '#1E1E1E',
  },
  darkBellIcon: {
    tintColor: '#FFFFFF',
  },
  darkCartIcon: {
    tintColor: '#FFFFFF',
  },
  darkSearchField: {
    backgroundColor: '#2D2D2D',
    borderColor: '#444444',
  },
  darkSearchIcon: {
    tintColor: '#AAAAAA',
  },
  darkSearchInput: {
    color: '#FFFFFF',
  },
  darkNotificationButton: {
    backgroundColor: '#2D2D2D',
    borderColor: '#444444',
  },
  darkNotificationIcon: {
    tintColor: '#AAAAAA',
  },
  darkCategoriesTitle: {
    color: '#FFFFFF',
  },
  darkCategoryPreviewIcon: {
    backgroundColor: '#2D2D2D',
  },
  darkCategoryPreviewText: {
    color: '#FFFFFF',
  },
  darkCategoryCount: {
    color: '#AAAAAA',
  },
  darkShopsTitle: {
    color: '#FFFFFF',
  },
  darkShopCard: {
    backgroundColor: '#2D2D2D',
  },
  darkShopIconContainer: {
    backgroundColor: '#3D3D3D',
  },
  darkShopName: {
    color: '#FFFFFF',
  },
  darkShopCategory: {
    color: '#AAAAAA',
  },
  darkShopRating: {
    color: '#AAAAAA',
  },
  darkShopProductCount: {
    color: '#AAAAAA',
  },
  darkRecentlyViewedTitle: {
    color: '#FFFFFF',
  },
  darkRecentlyViewedCard: {
    backgroundColor: '#2D2D2D',
  },
  darkRecentlyViewedIconContainer: {
    backgroundColor: '#3D3D3D',
  },
  darkRecentlyViewedName: {
    color: '#FFFFFF',
  },
  darkRecentlyViewedPrice: {
    color: '#BB86FC',
  },
  darkRecentlyViewedRating: {
    color: '#AAAAAA',
  },
  darkSeeAllText: {
    color: '#BB86FC',
  },
  darkHotSellsTitle: {
    color: '#FFFFFF',
  },
  darkHotSalesCard: {
    backgroundColor: '#2D2D2D',
  },
  darkHotSalesIconContainer: {
    backgroundColor: '#3D3D3D',
  },
  darkHotSalesName: {
    color: '#FFFFFF',
  },
  darkHotSalesPrice: {
    color: '#BB86FC',
  },
  darkHotSalesRating: {
    color: '#AAAAAA',
  },
  darkBottomTabBar: {
    backgroundColor: '#1E1E1E',
    borderTopColor: '#333333',
  },
  darkTabIcon: {
    tintColor: '#AAAAAA',
  },
  darkActiveTabIcon: {
    tintColor: '#BB86FC',
  },
  darkTabLabel: {
    color: '#AAAAAA',
  },
  darkActiveTabLabel: {
    color: '#BB86FC',
  },
});