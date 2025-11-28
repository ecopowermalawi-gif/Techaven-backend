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
  FlatList,
  StatusBar,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFonts, Poppins_400Regular, Poppins_600SemiBold, Poppins_700Bold } from '@expo-google-fonts/poppins';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialIcons, FontAwesome } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

// Type definitions
interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  rating: number;
  reviewCount: number;
  image: string;
  isFeatured: boolean;
  isTrending: boolean;
  tags: string[];
  colors: string[];
  inStock: boolean;
  isFavorite: boolean;
}

interface FilterOption {
  label: string;
  value: string;
  icon: string;
}

// Product data
const HOT_SALES_DATA: Product[] = [
  {
    id: '1',
    name: 'iPhone 15 Pro',
    description: 'Latest A17 Pro chip, Titanium design',
    price: 999,
    originalPrice: 1199,
    discount: 17,
    rating: 4.8,
    reviewCount: 1247,
    image: '📱',
    isFeatured: true,
    isTrending: true,
    tags: ['New', 'Trending'],
    colors: ['#2C2C2E', '#FFFFFF', '#FF375F'],
    inStock: true,
    isFavorite: true,
  },
  {
    id: '2',
    name: 'MacBook Air M3',
    description: '13.6" Liquid Retina display',
    price: 1099,
    originalPrice: 1299,
    discount: 15,
    rating: 4.9,
    reviewCount: 892,
    image: '💻',
    isFeatured: true,
    isTrending: true,
    tags: ['Best Seller'],
    colors: ['#2C2C2E', '#A2AAAD'],
    inStock: true,
    isFavorite: false,
  },
  {
    id: '3',
    name: 'Sony WH-1000XM5',
    description: 'Industry leading noise cancellation',
    price: 399,
    originalPrice: 449,
    discount: 11,
    rating: 4.7,
    reviewCount: 2341,
    image: '🎧',
    isFeatured: true,
    isTrending: false,
    tags: ['Popular'],
    colors: ['#000000', '#C0C0C0'],
    inStock: true,
    isFavorite: true,
  },
  {
    id: '4',
    name: 'Apple Watch Series 9',
    description: 'Smarter. Brighter. Mightier.',
    price: 399,
    originalPrice: 429,
    discount: 7,
    rating: 4.6,
    reviewCount: 1567,
    image: '⌚',
    isFeatured: false,
    isTrending: true,
    tags: ['New'],
    colors: ['#2C2C2E', '#FFD700', '#FF375F'],
    inStock: true,
    isFavorite: false,
  },
  {
    id: '5',
    name: 'Samsung Galaxy S24',
    description: 'AI-powered smartphone experience',
    price: 799,
    originalPrice: 899,
    discount: 11,
    rating: 4.5,
    reviewCount: 987,
    image: '📱',
    isFeatured: true,
    isTrending: true,
    tags: ['AI', 'New'],
    colors: ['#2C2C2E', '#7C53E7', '#4A90E2'],
    inStock: true,
    isFavorite: false,
  },
  {
    id: '6',
    name: 'AirPods Pro 2',
    description: 'Active Noise Cancellation',
    price: 249,
    originalPrice: 279,
    discount: 11,
    rating: 4.8,
    reviewCount: 3124,
    image: '🎧',
    isFeatured: true,
    isTrending: false,
    tags: ['Popular'],
    colors: ['#FFFFFF'],
    inStock: true,
    isFavorite: true,
  },
];

const FILTER_OPTIONS: FilterOption[] = [
  { label: 'All', value: 'all', icon: 'grid' },
  { label: 'Featured', value: 'featured', icon: 'star' },
  { label: 'Trending', value: 'trending', icon: 'trending-up' },
  { label: 'New', value: 'new', icon: 'new-releases' },
  { label: 'Best Deals', value: 'deals', icon: 'local-offer' },
];

const SORT_OPTIONS = [
  { label: 'Popular', value: 'popular' },
  { label: 'Newest', value: 'newest' },
  { label: 'Price: Low to High', value: 'price-low' },
  { label: 'Price: High to Low', value: 'price-high' },
  { label: 'Rating', value: 'rating' },
];

export default function HotSalesScreen() {
  const [fontsLoaded] = useFonts({
    'Poppins-Regular': Poppins_400Regular,
    'Poppins-SemiBold': Poppins_600SemiBold,
    'Poppins-Bold': Poppins_700Bold,
  });
  
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [sortBy, setSortBy] = useState('popular');
  const [showSortModal, setShowSortModal] = useState(false);
  const [favorites, setFavorites] = useState<string[]>(['1', '3', '6']);
  
  const router = useRouter();

  if (!fontsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  // Filter and sort products
  const filteredProducts = HOT_SALES_DATA.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = activeFilter === 'all' || 
                         (activeFilter === 'featured' && product.isFeatured) ||
                         (activeFilter === 'trending' && product.isTrending) ||
                         (activeFilter === 'new' && product.tags.includes('New')) ||
                         (activeFilter === 'deals' && product.discount && product.discount > 10);
    
    return matchesSearch && matchesFilter;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return b.id.localeCompare(a.id);
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      case 'rating':
        return b.rating - a.rating;
      case 'popular':
      default:
        return b.reviewCount - a.reviewCount;
    }
  });

  const toggleFavorite = (productId: string) => {
    setFavorites(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const handleProductPress = (productId: string) => {
    // use a concrete path string to navigate and cast to any to satisfy strict router types
    router.push(`/product/${productId}` as any);
  };

  const ProductCard: React.FC<{ product: Product }> = ({ product }) => {
    const isFavorite = favorites.includes(product.id);
    
    return (
      <TouchableOpacity 
        style={styles.productCard}
        activeOpacity={0.9}
        onPress={() => handleProductPress(product.id)}
      >
        {/* Product Image & Tags */}
        <View style={styles.productImageContainer}>
          <View style={styles.productImage}>
            <Text style={styles.productEmoji}>{product.image}</Text>
          </View>
          
          {/* Tags */}
          <View style={styles.tagsContainer}>
            {product.tags.map((tag, index) => (
              <View 
                key={tag} 
                style={[
                  styles.tag,
                  index === 0 && styles.firstTag
                ]}
              >
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>

          {/* Favorite Button */}
          <TouchableOpacity 
            style={[
              styles.favoriteButton,
              isFavorite && styles.favoriteButtonActive
            ]}
            onPress={() => toggleFavorite(product.id)}
          >
            <Ionicons 
              name={isFavorite ? "heart" : "heart-outline"} 
              size={20} 
              color={isFavorite ? "#FFFFFF" : "#64748B"} 
            />
          </TouchableOpacity>

          {/* Discount Badge */}
          {product.discount && (
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>-{product.discount}%</Text>
            </View>
          )}
        </View>

        {/* Product Info */}
        <View style={styles.productInfo}>
          <Text style={styles.productName} numberOfLines={2}>{product.name}</Text>
          <Text style={styles.productDescription} numberOfLines={1}>
            {product.description}
          </Text>

          {/* Rating */}
          <View style={styles.ratingContainer}>
            <View style={styles.ratingStars}>
              <FontAwesome name="star" size={12} color="#FFD700" />
              <Text style={styles.ratingText}>{product.rating}</Text>
            </View>
            <Text style={styles.reviewCount}>({product.reviewCount})</Text>
          </View>

          {/* Price */}
          <View style={styles.priceContainer}>
            <Text style={styles.currentPrice}>${product.price}</Text>
            {product.originalPrice && (
              <Text style={styles.originalPrice}>${product.originalPrice}</Text>
            )}
          </View>

          {/* Colors */}
          <View style={styles.colorsContainer}>
            {product.colors.map((color, index) => (
              <View 
                key={index} 
                style={[
                  styles.colorDot,
                  { backgroundColor: color },
                  index === 0 && styles.activeColorDot
                ]} 
              />
            ))}
          </View>

          {/* Add to Cart Button */}
          <TouchableOpacity style={styles.addToCartButton}>
            <Ionicons name="cart-outline" size={16} color="#FFFFFF" />
            <Text style={styles.addToCartText}>Add to Cart</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  const FilterButton: React.FC<{ 
    option: FilterOption; 
    isActive: boolean; 
    onPress: (value: string) => void; 
  }> = ({ option, isActive, onPress }) => (
    <TouchableOpacity
      style={[styles.filterButton, isActive && styles.activeFilterButton]}
      onPress={() => onPress(option.value)}
    >
      <Ionicons 
        name={option.icon as any} 
        size={16} 
        color={isActive ? "#FFFFFF" : "#64748B"} 
        style={styles.filterIcon}
      />
      <Text style={[styles.filterButtonText, isActive && styles.activeFilterButtonText]}>
        {option.label}
      </Text>
    </TouchableOpacity>
  );

  const SortModal = () => (
    <View style={styles.modalOverlay}>
      <View style={styles.modalContent}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Sort By</Text>
          <TouchableOpacity onPress={() => setShowSortModal(false)}>
            <Ionicons name="close" size={24} color="#000000" />
          </TouchableOpacity>
        </View>
        
        {SORT_OPTIONS.map((option) => (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.sortOption,
              sortBy === option.value && styles.activeSortOption
            ]}
            onPress={() => {
              setSortBy(option.value);
              setShowSortModal(false);
            }}
          >
            <Text style={[
              styles.sortOptionText,
              sortBy === option.value && styles.activeSortOptionText
            ]}>
              {option.label}
            </Text>
            {sortBy === option.value && (
              <Ionicons name="checkmark" size={20} color="#232CAD" />
            )}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="chevron-back" size={24} color="#000000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Hot Sales</Text>
        <TouchableOpacity style={styles.cartButton}>
          <Ionicons name="cart-outline" size={24} color="#000000" />
          <View style={styles.cartBadge}>
            <Text style={styles.cartBadgeText}>3</Text>
          </View>
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Search Section */}
        <View style={styles.searchSection}>
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color="#64748B" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search hot sales..."
              placeholderTextColor="#94A3B8"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={20} color="#94A3B8" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Stats Bar */}
        <View style={styles.statsBar}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{filteredProducts.length}</Text>
            <Text style={styles.statLabel}>Products</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {filteredProducts.filter(p => p.discount && p.discount > 0).length}
            </Text>
            <Text style={styles.statLabel}>On Sale</Text>
          </View>
          <View style={styles.statDivider} />
          <TouchableOpacity 
            style={styles.statItem}
            onPress={() => setShowSortModal(true)}
          >
            <Ionicons name="filter" size={16} color="#64748B" />
            <Text style={styles.statLabel}>Sort</Text>
          </TouchableOpacity>
        </View>

        {/* Filter Section */}
        <View style={styles.filterSection}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterScrollContent}
          >
            {FILTER_OPTIONS.map((option) => (
              <FilterButton 
                key={option.value}
                option={option}
                isActive={activeFilter === option.value}
                onPress={setActiveFilter}
              />
            ))}
          </ScrollView>
        </View>

        {/* Products Grid */}
        <View style={styles.productsSection}>
          <Text style={styles.sectionTitle}>
            {activeFilter === 'all' ? 'All Hot Sales' : 
             activeFilter === 'featured' ? 'Featured Products' :
             activeFilter === 'trending' ? 'Trending Now' :
             activeFilter === 'new' ? 'New Arrivals' : 'Best Deals'}
          </Text>
          
          <FlatList
            data={filteredProducts}
            renderItem={({ item }) => <ProductCard product={item} />}
            keyExtractor={(item: Product) => item.id}
            scrollEnabled={false}
            numColumns={2}
            contentContainerStyle={styles.productsGrid}
            columnWrapperStyle={styles.productsRow}
          />
        </View>

        {/* Bottom Spacer */}
        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Sort Modal */}
      {showSortModal && <SortModal />}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 20,
    color: '#000000',
  },
  cartButton: {
    padding: 8,
    position: 'relative',
  },
  cartBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#EF4444',
    borderRadius: 10,
    width: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontFamily: 'Poppins-SemiBold',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  searchSection: {
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontFamily: 'Poppins-Regular',
    fontSize: 16,
    color: '#000000',
  },
  statsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: '#F8FAFC',
    marginHorizontal: 24,
    borderRadius: 16,
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  statValue: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 18,
    color: '#232CAD',
  },
  statLabel: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
    color: '#64748B',
  },
  statDivider: {
    width: 1,
    height: 20,
    backgroundColor: '#E2E8F0',
  },
  filterSection: {
    paddingHorizontal: 24,
    paddingVertical: 8,
  },
  filterScrollContent: {
    gap: 12,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#F8FAFC',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 6,
  },
  activeFilterButton: {
    backgroundColor: '#232CAD',
    borderColor: '#232CAD',
  },
  filterIcon: {
    marginRight: 4,
  },
  filterButtonText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: '#64748B',
  },
  activeFilterButtonText: {
    color: '#FFFFFF',
    fontFamily: 'Poppins-SemiBold',
  },
  productsSection: {
    marginTop: 24,
  },
  sectionTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 20,
    color: '#000000',
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  productsGrid: {
    paddingHorizontal: 20,
  },
  productsRow: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  productCard: {
    width: (width - 56) / 2,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  productImageContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  productImage: {
    width: '100%',
    height: 120,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  productEmoji: {
    fontSize: 40,
  },
  tagsContainer: {
    position: 'absolute',
    top: 8,
    left: 8,
    flexDirection: 'row',
    gap: 4,
  },
  tag: {
    backgroundColor: '#232CAD',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  firstTag: {
    backgroundColor: '#EF4444',
  },
  tagText: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 10,
    color: '#FFFFFF',
  },
  favoriteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  favoriteButtonActive: {
    backgroundColor: '#EF4444',
  },
  discountBadge: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: '#10B981',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  discountText: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 10,
    color: '#FFFFFF',
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 14,
    color: '#000000',
    marginBottom: 4,
    lineHeight: 18,
  },
  productDescription: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
    color: '#64748B',
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 4,
  },
  ratingStars: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 12,
    color: '#000000',
  },
  reviewCount: {
    fontFamily: 'Poppins-Regular',
    fontSize: 10,
    color: '#94A3B8',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 6,
  },
  currentPrice: {
    fontFamily: 'Poppins-Bold',
    fontSize: 16,
    color: '#232CAD',
  },
  originalPrice: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
    color: '#94A3B8',
    textDecorationLine: 'line-through',
  },
  colorsContainer: {
    flexDirection: 'row',
    marginBottom: 12,
    gap: 4,
  },
  colorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  activeColorDot: {
    borderWidth: 2,
    borderColor: '#232CAD',
  },
  addToCartButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#232CAD',
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  addToCartText: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 12,
    color: '#FFFFFF',
  },
  bottomSpacer: {
    height: 20,
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 18,
    color: '#000000',
  },
  sortOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  activeSortOption: {
    backgroundColor: '#F8FAFC',
    marginHorizontal: -24,
    paddingHorizontal: 24,
  },
  sortOptionText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 16,
    color: '#64748B',
  },
  activeSortOptionText: {
    color: '#232CAD',
    fontFamily: 'Poppins-SemiBold',
  },
});