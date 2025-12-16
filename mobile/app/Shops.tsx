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
  FlatList,
  Alert,
  ActivityIndicator,
  RefreshControl,
  Modal,
  TouchableWithoutFeedback,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFonts, Poppins_400Regular, Poppins_600SemiBold } from '@expo-google-fonts/poppins';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from './context/ThemeContext';
import apiService from './services/api';

const { width, height } = Dimensions.get('window');

interface Shop {
  id: string;
  name: string;
  rating?: number;
  image_url?: string;
  description?: string;
  category?: string;
  is_featured?: boolean;
  product_count?: number;
  location?: string;
  joined_date?: string;
  verified?: boolean;
}

interface FilterOption {
  id: string;
  label: string;
  value: string;
}

export default function ShopsScreen() {
  const [fontsLoaded] = useFonts({
    'Poppins-Regular': Poppins_400Regular,
    'Poppins-SemiBold': Poppins_600SemiBold,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [shops, setShops] = useState<Shop[]>([]);
  const [filteredShops, setFilteredShops] = useState<Shop[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('rating');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showSortModal, setShowSortModal] = useState(false);
  
  const router = useRouter();
  const params = useLocalSearchParams();
  const { isDarkMode } = useTheme();

  // Categories for filtering
  const categories: FilterOption[] = [
    { id: 'all', label: 'All Categories', value: 'all' },
    { id: 'electronics', label: 'Electronics', value: 'electronics' },
    { id: 'fashion', label: 'Fashion', value: 'fashion' },
    { id: 'home', label: 'Home & Living', value: 'home' },
    { id: 'beauty', label: 'Beauty', value: 'beauty' },
    { id: 'sports', label: 'Sports', value: 'sports' },
    { id: 'books', label: 'Books', value: 'books' },
    { id: 'food', label: 'Food & Drink', value: 'food' },
  ];

  // Sort options
  const sortOptions: FilterOption[] = [
    { id: 'rating', label: 'Highest Rated', value: 'rating' },
    { id: 'name', label: 'Name (A-Z)', value: 'name' },
    { id: 'product_count', label: 'Most Products', value: 'product_count' },
    { id: 'featured', label: 'Featured First', value: 'featured' },
  ];

  // Fetch data on component mount
  useEffect(() => {
    fetchShops();
  }, []);

  // Filter shops when search query or category changes
  useEffect(() => {
    filterAndSortShops();
  }, [searchQuery, selectedCategory, sortBy, shops]);

  const fetchShops = async () => {
    try {
      setLoading(true);
      
      const shopsResponse = await apiService.getShops({ 
        limit: 50,
        sort_by: sortBy,
        order: 'desc'
      });
      
      if (shopsResponse && shopsResponse.items) {
        setShops(shopsResponse.items);
        setFilteredShops(shopsResponse.items);
      }
      
    } catch (error) {
      console.error('Error fetching shops:', error);
      Alert.alert('Error', 'Failed to load shops. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchShops();
  };

  const filterAndSortShops = () => {
    let filtered = [...shops];

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(shop =>
        shop.name.toLowerCase().includes(query) ||
        shop.description?.toLowerCase().includes(query) ||
        shop.category?.toLowerCase().includes(query)
      );
    }

    // Apply category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(shop =>
        shop.category?.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        case 'name':
          return a.name.localeCompare(b.name);
        case 'product_count':
          return (b.product_count || 0) - (a.product_count || 0);
        case 'featured':
          if (a.is_featured && !b.is_featured) return -1;
          if (!a.is_featured && b.is_featured) return 1;
          return (b.rating || 0) - (a.rating || 0);
        default:
          return 0;
      }
    });

    setFilteredShops(filtered);
  };

  const getShopCategoryIcon = (category?: string): string => {
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
    
    if (!category) return icons.default;
    
    const lowerName = category.toLowerCase();
    for (const key in icons) {
      if (lowerName.includes(key)) {
        return icons[key];
      }
    }
    return icons.default;
  };

  const formatDate = (dateString?: string): string => {
    if (!dateString) return 'Joined recently';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 30) {
      return `Joined ${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`;
    } else if (diffDays < 365) {
      const months = Math.floor(diffDays / 30);
      return `Joined ${months} ${months === 1 ? 'month' : 'months'} ago`;
    } else {
      const years = Math.floor(diffDays / 365);
      return `Joined ${years} ${years === 1 ? 'year' : 'years'} ago`;
    }
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

  const navigateToShop = (shopId: string) => {
    handleProtectedAction('view shop', () => {
      router.push({ pathname: '/shop', params: { id: shopId } } as any);
    });
  };

  const navigateBack = () => {
    router.back();
  };

  const renderShopItem = ({ item }: { item: Shop }) => (
    <TouchableOpacity 
      style={[styles.shopCard, isDarkMode && styles.darkShopCard]}
      activeOpacity={0.9}
      onPress={() => navigateToShop(item.id)}
    >
      <View style={styles.shopCardHeader}>
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
          {item.verified && (
            <View style={styles.verifiedBadge}>
              <Text style={styles.verifiedText}>✓</Text>
            </View>
          )}
        </View>
        
        <View style={styles.shopHeaderInfo}>
          <View style={styles.shopNameContainer}>
            <Text style={[styles.shopName, isDarkMode && styles.darkShopName]} numberOfLines={1}>
              {item.name}
            </Text>
            {item.is_featured && (
              <View style={styles.featuredBadge}>
                <Text style={styles.featuredText}>Featured</Text>
              </View>
            )}
          </View>
          
          <View style={styles.ratingContainer}>
            <Text style={[styles.ratingText, isDarkMode && styles.darkRatingText]}>
              ⭐ {item.rating?.toFixed(1) || '4.5'}
            </Text>
            <Text style={[styles.reviewCount, isDarkMode && styles.darkReviewCount]}>
              ({Math.floor(Math.random() * 100) + 50} reviews)
            </Text>
          </View>
        </View>
      </View>
      
      <View style={styles.shopCardBody}>
        {item.description && (
          <Text style={[styles.shopDescription, isDarkMode && styles.darkShopDescription]} numberOfLines={2}>
            {item.description}
          </Text>
        )}
        
        <View style={styles.shopDetails}>
          {item.category && (
            <View style={[styles.detailChip, isDarkMode && styles.darkDetailChip]}>
              <Text style={[styles.detailText, isDarkMode && styles.darkDetailText]}>
                {getShopCategoryIcon(item.category)} {item.category}
              </Text>
            </View>
          )}
          
          {item.product_count !== undefined && (
            <View style={[styles.detailChip, isDarkMode && styles.darkDetailChip]}>
              <Text style={[styles.detailText, isDarkMode && styles.darkDetailText]}>
                📦 {item.product_count} products
              </Text>
            </View>
          )}
        </View>
        
        {item.location && (
          <View style={styles.locationContainer}>
            <Text style={[styles.locationText, isDarkMode && styles.darkLocationText]}>
              📍 {item.location}
            </Text>
          </View>
        )}
        
        <Text style={[styles.joinedDate, isDarkMode && styles.darkJoinedDate]}>
          {formatDate(item.joined_date)}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderCategoryItem = ({ item }: { item: FilterOption }) => (
    <TouchableOpacity
      style={[
        styles.categoryChip,
        selectedCategory === item.value && styles.selectedCategoryChip,
        isDarkMode && styles.darkCategoryChip,
        isDarkMode && selectedCategory === item.value && styles.darkSelectedCategoryChip
      ]}
      onPress={() => setSelectedCategory(item.value)}
    >
      <Text style={[
        styles.categoryText,
        selectedCategory === item.value && styles.selectedCategoryText,
        isDarkMode && styles.darkCategoryText,
        isDarkMode && selectedCategory === item.value && styles.darkSelectedCategoryText
      ]}>
        {item.label}
      </Text>
    </TouchableOpacity>
  );

  const FilterModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={showFilterModal}
      onRequestClose={() => setShowFilterModal(false)}
    >
      <TouchableWithoutFeedback onPress={() => setShowFilterModal(false)}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback>
            <View style={[styles.modalContent, isDarkMode && styles.darkModalContent]}>
              <Text style={[styles.modalTitle, isDarkMode && styles.darkModalTitle]}>
                Filter by Category
              </Text>
              
              <FlatList
                data={categories}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      styles.modalOption,
                      selectedCategory === item.value && styles.selectedModalOption,
                      isDarkMode && styles.darkModalOption,
                      isDarkMode && selectedCategory === item.value && styles.darkSelectedModalOption
                    ]}
                    onPress={() => {
                      setSelectedCategory(item.value);
                      setShowFilterModal(false);
                    }}
                  >
                    <Text style={[
                      styles.modalOptionText,
                      selectedCategory === item.value && styles.selectedModalOptionText,
                      isDarkMode && styles.darkModalOptionText,
                      isDarkMode && selectedCategory === item.value && styles.darkSelectedModalOptionText
                    ]}>
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                )}
                keyExtractor={(item) => item.id}
                style={styles.modalList}
              />
              
              <TouchableOpacity
                style={[styles.clearFilterButton, isDarkMode && styles.darkClearFilterButton]}
                onPress={() => {
                  setSelectedCategory('all');
                  setShowFilterModal(false);
                }}
              >
                <Text style={[styles.clearFilterText, isDarkMode && styles.darkClearFilterText]}>
                  Clear Filter
                </Text>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );

  const SortModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={showSortModal}
      onRequestClose={() => setShowSortModal(false)}
    >
      <TouchableWithoutFeedback onPress={() => setShowSortModal(false)}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback>
            <View style={[styles.modalContent, isDarkMode && styles.darkModalContent]}>
              <Text style={[styles.modalTitle, isDarkMode && styles.darkModalTitle]}>
                Sort By
              </Text>
              
              <FlatList
                data={sortOptions}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      styles.modalOption,
                      sortBy === item.value && styles.selectedModalOption,
                      isDarkMode && styles.darkModalOption,
                      isDarkMode && sortBy === item.value && styles.darkSelectedModalOption
                    ]}
                    onPress={() => {
                      setSortBy(item.value);
                      setShowSortModal(false);
                    }}
                  >
                    <Text style={[
                      styles.modalOptionText,
                      sortBy === item.value && styles.selectedModalOptionText,
                      isDarkMode && styles.darkModalOptionText,
                      isDarkMode && sortBy === item.value && styles.darkSelectedModalOptionText
                    ]}>
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                )}
                keyExtractor={(item) => item.id}
                style={styles.modalList}
              />
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );

  if (!fontsLoaded) {
    return (
      <View style={[styles.loadingContainer, isDarkMode && styles.darkLoadingContainer]}>
        <ActivityIndicator size="large" color="#232CAD" />
        <Text style={[styles.loadingText, isDarkMode && styles.darkLoadingText]}>Loading...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, isDarkMode && styles.darkSafeArea]}>
      <View style={[styles.container, isDarkMode && styles.darkContainer]}>
        <LinearGradient 
          colors={isDarkMode ? ['#1E1E1E', '#121212'] : ['#FFFFFF', '#E8EBF9']} 
          start={{ x: 0.5, y: 0 }} 
          end={{ x: 0.5, y: 1 }} 
          style={styles.gradient} 
        />
        
        {/* Header */}
        <View style={[styles.header, isDarkMode && styles.darkHeader]}>
          <TouchableOpacity style={styles.backButton} onPress={navigateBack}>
            <Image 
              source={require('@/assets/images/back.png')} 
              style={[styles.backIcon, isDarkMode && styles.darkBackIcon]} 
              resizeMode="contain"
            />
          </TouchableOpacity>
          
          <Text style={[styles.headerTitle, isDarkMode && styles.darkHeaderTitle]}>Shops</Text>
          
          <View style={styles.headerRight} />
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
              placeholder="Search shops..."
              placeholderTextColor={isDarkMode ? '#AAAAAA' : '#757575'}
              value={searchQuery}
              onChangeText={setSearchQuery}
              returnKeyType="search"
            />
          </View>
        </View>

        {/* Quick Filters */}
        <View style={styles.quickFilters}>
          <TouchableOpacity 
            style={[styles.filterButton, isDarkMode && styles.darkFilterButton]}
            onPress={() => setShowFilterModal(true)}
          >
            <Image 
              source={require('@/assets/images/filter.png')} 
              style={[styles.filterIcon, isDarkMode && styles.darkFilterIcon]} 
              resizeMode="contain"
            />
            <Text style={[styles.filterButtonText, isDarkMode && styles.darkFilterButtonText]}>
              {selectedCategory === 'all' ? 'Category' : 
                categories.find(c => c.value === selectedCategory)?.label || 'Category'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.filterButton, isDarkMode && styles.darkFilterButton]}
            onPress={() => setShowSortModal(true)}
          >
            <Image 
              source={require('@/assets/images/sort.png')} 
              style={[styles.filterIcon, isDarkMode && styles.darkFilterIcon]} 
              resizeMode="contain"
            />
            <Text style={[styles.filterButtonText, isDarkMode && styles.darkFilterButtonText]}>
              {sortOptions.find(s => s.value === sortBy)?.label || 'Sort'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Categories Horizontal Scroll */}
        <View style={styles.categoriesContainer}>
          <FlatList
            data={categories}
            renderItem={renderCategoryItem}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesList}
          />
        </View>

        {/* Results Count */}
        <View style={styles.resultsContainer}>
          <Text style={[styles.resultsText, isDarkMode && styles.darkResultsText]}>
            {filteredShops.length} {filteredShops.length === 1 ? 'Shop' : 'Shops'} Found
          </Text>
        </View>

        {/* Shops List */}
        {loading ? (
          <View style={styles.loadingListContainer}>
            <ActivityIndicator size="large" color="#232CAD" />
            <Text style={[styles.loadingListText, isDarkMode && styles.darkLoadingListText]}>
              Loading shops...
            </Text>
          </View>
        ) : filteredShops.length > 0 ? (
          <FlatList
            data={filteredShops}
            renderItem={renderShopItem}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.shopsList}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={isDarkMode ? '#BB86FC' : '#232CAD'}
              />
            }
            ListFooterComponent={<View style={styles.listFooter} />}
          />
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyIcon, isDarkMode && styles.darkEmptyIcon]}>🏪</Text>
            <Text style={[styles.emptyTitle, isDarkMode && styles.darkEmptyTitle]}>
              No Shops Found
            </Text>
            <Text style={[styles.emptyMessage, isDarkMode && styles.darkEmptyMessage]}>
              {searchQuery.trim() 
                ? `No shops match "${searchQuery}"`
                : `No shops found in ${selectedCategory === 'all' ? 'any category' : `the ${selectedCategory} category`}`
              }
            </Text>
            <TouchableOpacity 
              style={[styles.resetButton, isDarkMode && styles.darkResetButton]}
              onPress={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}
            >
              <Text style={[styles.resetButtonText, isDarkMode && styles.darkResetButtonText]}>
                Reset Filters
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Modals */}
        <FilterModal />
        <SortModal />
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
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
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
  // Header
  header: {
    width: '100%',
    height: 64,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 16,
  },
  backButton: {
    padding: 4,
  },
  backIcon: {
    width: 24,
    height: 24,
    tintColor: '#000000',
  },
  headerTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 20,
    color: '#000000',
  },
  headerRight: {
    width: 32,
  },
  // Search Bar
  searchContainer: {
    width: '100%',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 16,
  },
  searchField: {
    width: '100%',
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
  // Quick Filters
  quickFilters: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    marginBottom: 16,
    gap: 12,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2FF',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#E0E0FF',
  },
  filterIcon: {
    width: 16,
    height: 16,
    marginRight: 6,
    tintColor: '#232CAD',
  },
  filterButtonText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: '#232CAD',
  },
  // Categories
  categoriesContainer: {
    height: 40,
    marginBottom: 16,
  },
  categoriesList: {
    paddingHorizontal: 24,
  },
  categoryChip: {
    backgroundColor: '#F8F8F8',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  selectedCategoryChip: {
    backgroundColor: '#232CAD',
    borderColor: '#232CAD',
  },
  categoryText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
    color: '#666666',
  },
  selectedCategoryText: {
    color: '#FFFFFF',
  },
  // Results
  resultsContainer: {
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  resultsText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: '#666666',
  },
  // Shops List
  shopsList: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  shopCard: {
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  shopCardHeader: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  shopImageContainer: {
    position: 'relative',
    width: 60,
    height: 60,
    borderRadius: 30,
    overflow: 'hidden',
    marginRight: 12,
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
    fontSize: 30,
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#232CAD',
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  verifiedText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  shopHeaderInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  shopNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  shopName: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 16,
    color: '#000000',
    flex: 1,
  },
  featuredBadge: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 8,
  },
  featuredText: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 10,
    color: '#000000',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: '#666666',
    marginRight: 8,
  },
  reviewCount: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
    color: '#999999',
  },
  shopCardBody: {
    padding: 16,
  },
  shopDescription: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
    marginBottom: 12,
  },
  shopDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
    gap: 8,
  },
  detailChip: {
    backgroundColor: '#F2F2FF',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  detailText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
    color: '#232CAD',
  },
  locationContainer: {
    marginBottom: 8,
  },
  locationText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: '#666666',
  },
  joinedDate: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
    color: '#999999',
  },
  // Loading List
  loadingListContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingListText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: '#666666',
    marginTop: 16,
  },
  // Empty State
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 20,
    color: '#000000',
    marginBottom: 8,
  },
  emptyMessage: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 24,
  },
  resetButton: {
    backgroundColor: '#232CAD',
    borderRadius: 20,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  resetButtonText: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 14,
    color: '#FFFFFF',
  },
  // List Footer
  listFooter: {
    height: 20,
  },
  // Modals
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    width: width * 0.8,
    maxHeight: height * 0.7,
  },
  modalTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 18,
    color: '#000000',
    marginBottom: 20,
  },
  modalList: {
    maxHeight: height * 0.5,
  },
  modalOption: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  selectedModalOption: {
    backgroundColor: '#F2F2FF',
    borderLeftWidth: 4,
    borderLeftColor: '#232CAD',
  },
  modalOptionText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 16,
    color: '#000000',
    paddingLeft: 16,
  },
  selectedModalOptionText: {
    fontFamily: 'Poppins-SemiBold',
    color: '#232CAD',
  },
  clearFilterButton: {
    marginTop: 20,
    paddingVertical: 12,
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
    alignItems: 'center',
  },
  clearFilterText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 16,
    color: '#666666',
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
  darkHeader: {
    backgroundColor: '#1E1E1E',
  },
  darkBackIcon: {
    tintColor: '#FFFFFF',
  },
  darkHeaderTitle: {
    color: '#FFFFFF',
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
  darkFilterButton: {
    backgroundColor: '#2D2D2D',
    borderColor: '#444444',
  },
  darkFilterIcon: {
    tintColor: '#BB86FC',
  },
  darkFilterButtonText: {
    color: '#BB86FC',
  },
  darkCategoryChip: {
    backgroundColor: '#2D2D2D',
    borderColor: '#444444',
  },
  darkSelectedCategoryChip: {
    backgroundColor: '#BB86FC',
    borderColor: '#BB86FC',
  },
  darkCategoryText: {
    color: '#AAAAAA',
  },
  darkSelectedCategoryText: {
    color: '#FFFFFF',
  },
  darkResultsText: {
    color: '#AAAAAA',
  },
  darkLoadingListText: {
    color: '#AAAAAA',
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
  darkRatingText: {
    color: '#AAAAAA',
  },
  darkReviewCount: {
    color: '#888888',
  },
  darkShopDescription: {
    color: '#AAAAAA',
  },
  darkDetailChip: {
    backgroundColor: '#3D3D3D',
  },
  darkDetailText: {
    color: '#BB86FC',
  },
  darkLocationText: {
    color: '#AAAAAA',
  },
  darkJoinedDate: {
    color: '#888888',
  },
  darkEmptyIcon: {
    color: '#AAAAAA',
  },
  darkEmptyTitle: {
    color: '#FFFFFF',
  },
  darkEmptyMessage: {
    color: '#AAAAAA',
  },
  darkResetButton: {
    backgroundColor: '#BB86FC',
  },
  darkResetButtonText: {
    color: '#000000',
  },
  darkModalContent: {
    backgroundColor: '#2D2D2D',
  },
  darkModalTitle: {
    color: '#FFFFFF',
  },
  darkModalOption: {
    borderBottomColor: '#444444',
  },
  darkSelectedModalOption: {
    backgroundColor: '#3D3D3D',
    borderLeftColor: '#BB86FC',
  },
  darkModalOptionText: {
    color: '#FFFFFF',
  },
  darkSelectedModalOptionText: {
    color: '#BB86FC',
  },
  darkClearFilterButton: {
    backgroundColor: '#3D3D3D',
  },
  darkClearFilterText: {
    color: '#AAAAAA',
  },
});