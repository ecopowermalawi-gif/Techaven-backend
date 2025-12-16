import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  Image, 
  StyleSheet, 
  Dimensions, 
  ScrollView, 
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  Share,
  FlatList,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFonts, Poppins_400Regular, Poppins_600SemiBold } from '@expo-google-fonts/poppins';
import { useRouter, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from './context/ThemeContext';
import { useCart } from './context/CartContext';
import apiService from './services/api';

const { width } = Dimensions.get('window');

interface ProductColor {
  name: string;
  code: string;
  image_url?: string;
}

interface StorageOption {
  size: string;
  price: number;
}

interface ProductVariant {
  id: string;
  color?: string;
  storage?: string;
  price: number;
  stock_quantity: number;
  image_url?: string;
}

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  original_price?: number;
  rating?: number;
  image_url?: string;
  images?: string[];
  category?: string;
  long_description?: string;
  in_stock?: boolean;
  stock_quantity?: number;
  variants?: ProductVariant[];
  specifications?: Record<string, string>;
  reviews?: any[];
  shop?: {
    id: string;
    name: string;
    rating?: number;
  };
  created_at?: string;
  updated_at?: string;
}

interface CartItem {
  product_id: string;  // Changed from productId to product_id
  name: string;
  price: number;
  quantity: number;
  color?: string;
  storage?: string;
  image_url?: string;
  variantId?: string;
}

// Helper function to extract error message
const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  
  if (typeof error === 'string') {
    return error;
  }
  
  // Handle API service error format
  if (error && typeof error === 'object') {
    const err = error as any;
    if (err.message && typeof err.message === 'string') {
      return err.message;
    }
    if (err.response?.data?.message) {
      return err.response.data.message;
    }
    if (err.response?.data?.detail) {
      if (Array.isArray(err.response.data.detail)) {
        return err.response.data.detail.map((d: any) => d.msg).join(', ');
      }
      return err.response.data.detail;
    }
  }
  
  return 'An unknown error occurred';
};

export default function ProductDetailsScreen() {
  const [fontsLoaded] = useFonts({
    'Poppins-Regular': Poppins_400Regular,
    'Poppins-SemiBold': Poppins_600SemiBold,
  });
  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  
  const router = useRouter();
  const params = useLocalSearchParams();
  const { isDarkMode } = useTheme();
  const { addToCart } = useCart();
  
  const productId = params.id as string;

  useEffect(() => {
    fetchProductDetails();
  }, [productId]);

  const fetchProductDetails = async () => {
    try {
      setLoading(true);
      
      // Fetch product details from API
      const productData = await apiService.getProductById(productId);
      console.log('Product data:', productData);
      
      setProduct(productData);
      
      // Set default variant if available
      if (productData.variants && productData.variants.length > 0) {
        setSelectedVariant(productData.variants[0]);
      }
      
    } catch (error: unknown) {
      console.error('Error fetching product:', error);
      
      // Extract error message
      const errorMessage = getErrorMessage(error) || 'Failed to load product details';
      Alert.alert('Error', errorMessage, [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    try {
      if (!product) return;
      
      const message = `Check out ${product.name} for $${product.price} on TechAven!`;
      const result = await Share.share({
        message,
        url: `https://techaven.com/products/${productId}`,
      });
      
      if (result.action === Share.sharedAction) {
        console.log('Product shared successfully');
      }
    } catch (error: unknown) {
      console.error('Error sharing product:', error);
    }
  };

  const handleAddToCart = async () => {
    try {
      if (!product) return;
      
      setAddingToCart(true);
      
      // Check authentication
      const isAuthenticated = await apiService.isAuthenticated();
      if (!isAuthenticated) {
        Alert.alert(
          'Login Required',
          'Please login to add items to your cart',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Login', onPress: () => router.push('/Screen4') }
          ]
        );
        return;
      }
      
      // Prepare cart item - CORRECTED to match CartContext interface
      const cartItem: CartItem = {
        product_id: product.id,  // Changed from productId to product_id
        name: product.name,
        price: selectedVariant ? selectedVariant.price : product.price,
        quantity: quantity,
        image_url: product.image_url,
        variantId: selectedVariant?.id,
      };
      
      // Add variant details if available
      if (selectedVariant) {
        if (selectedVariant.color) cartItem.color = selectedVariant.color;
        if (selectedVariant.storage) cartItem.storage = selectedVariant.storage;
      }
      
      // Add to cart context
      await addToCart(cartItem);
      
      // Show success message
      Alert.alert(
        'Success',
        `${product.name} added to cart!`,
        [
          { text: 'Continue Shopping', style: 'cancel' },
          { text: 'View Cart', onPress: () => router.push('/Cart') }
        ]
      );
      
    } catch (error: unknown) {
      console.error('Error adding to cart:', error);
      const errorMessage = getErrorMessage(error) || 'Failed to add item to cart. Please try again.';
      Alert.alert('Error', errorMessage);
    } finally {
      setAddingToCart(false);
    }
  };

  const handleBuyNow = async () => {
    try {
      await handleAddToCart();
      router.push('/Cart');
    } catch (error: unknown) {
      console.error('Error in buy now:', error);
    }
  };

  const navigateToShop = () => {
    if (product?.shop?.id) {
      router.push({ pathname: '/shop', params: { id: product.shop.id } } as any);
    }
  };

  const incrementQuantity = () => {
    const maxQuantity = selectedVariant?.stock_quantity || product?.stock_quantity || 10;
    if (quantity < maxQuantity) {
      setQuantity(quantity + 1);
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const renderImageGallery = () => {
    const images = product?.images || [];
    const mainImage = product?.image_url;
    
    if (images.length === 0 && !mainImage) {
      return (
        <View style={[styles.imagePlaceholder, isDarkMode && styles.darkImagePlaceholder]}>
          <Text style={styles.placeholderText}>📷</Text>
          <Text style={[styles.placeholderSubtext, isDarkMode && styles.darkPlaceholderSubtext]}>
            No image available
          </Text>
        </View>
      );
    }

    const allImages = mainImage ? [mainImage, ...images] : images;

    return (
      <View style={styles.imageGalleryContainer}>
        {/* Main Image */}
        <View style={styles.mainImageContainer}>
          <Image
            source={{ uri: allImages[activeImageIndex] }}
            style={styles.mainImage}
            resizeMode="contain"
            defaultSource={require('@/assets/images/placeholder.png')}
          />
        </View>
        
        {/* Image Thumbnails */}
        {allImages.length > 1 && (
          <View style={styles.thumbnailContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {allImages.map((image, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.thumbnail,
                    activeImageIndex === index && styles.activeThumbnail,
                    isDarkMode && styles.darkThumbnail,
                    isDarkMode && activeImageIndex === index && styles.darkActiveThumbnail
                  ]}
                  onPress={() => setActiveImageIndex(index)}
                >
                  <Image
                    source={{ uri: image }}
                    style={styles.thumbnailImage}
                    resizeMode="cover"
                  />
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
      </View>
    );
  };

  const renderVariants = () => {
    if (!product?.variants || product.variants.length === 0) return null;

    const colors = new Set(product.variants.map(v => v.color).filter(Boolean));
    const storages = new Set(product.variants.map(v => v.storage).filter(Boolean));

    return (
      <View style={styles.variantsContainer}>
        {colors.size > 0 && (
          <View style={styles.variantSection}>
            <Text style={[styles.variantLabel, isDarkMode && styles.darkVariantLabel]}>
              Color
            </Text>
            <View style={styles.variantOptions}>
              {Array.from(colors).map((color) => {
                const variant = product.variants?.find(v => v.color === color);
                const isSelected = selectedVariant?.color === color;
                
                return (
                  <TouchableOpacity
                    key={color}
                    style={[
                      styles.colorOption,
                      isSelected && styles.selectedColorOption,
                      isDarkMode && styles.darkColorOption,
                      isDarkMode && isSelected && styles.darkSelectedColorOption
                    ]}
                    onPress={() => variant && setSelectedVariant(variant)}
                  >
                    <View style={[styles.colorCircle, { backgroundColor: color?.toLowerCase() || '#CCCCCC' }]} />
                    <Text style={[
                      styles.colorText,
                      isSelected && styles.selectedColorText,
                      isDarkMode && styles.darkColorText,
                      isDarkMode && isSelected && styles.darkSelectedColorText
                    ]}>
                      {color}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        {storages.size > 0 && (
          <View style={styles.variantSection}>
            <Text style={[styles.variantLabel, isDarkMode && styles.darkVariantLabel]}>
              Storage
            </Text>
            <View style={styles.variantOptions}>
              {Array.from(storages).map((storage) => {
                const variant = product.variants?.find(v => v.storage === storage);
                const isSelected = selectedVariant?.storage === storage;
                
                return (
                  <TouchableOpacity
                    key={storage}
                    style={[
                      styles.storageOption,
                      isSelected && styles.selectedStorageOption,
                      isDarkMode && styles.darkStorageOption,
                      isDarkMode && isSelected && styles.darkSelectedStorageOption
                    ]}
                    onPress={() => variant && setSelectedVariant(variant)}
                  >
                    <Text style={[
                      styles.storageText,
                      isSelected && styles.selectedStorageText,
                      isDarkMode && styles.darkStorageText,
                      isDarkMode && isSelected && styles.darkSelectedStorageText
                    ]}>
                      {storage}
                    </Text>
                    {variant && (
                      <Text style={[
                        styles.storagePrice,
                        isSelected && styles.selectedStoragePrice,
                        isDarkMode && styles.darkStoragePrice,
                        isDarkMode && isSelected && styles.darkSelectedStoragePrice
                      ]}>
                        +${(variant.price - product.price).toFixed(2)}
                      </Text>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}
      </View>
    );
  };

  const renderSpecifications = () => {
    if (!product?.specifications || Object.keys(product.specifications).length === 0) {
      return null;
    }

    return (
      <View style={styles.specificationsContainer}>
        <Text style={[styles.sectionTitle, isDarkMode && styles.darkSectionTitle]}>
          Specifications
        </Text>
        <View style={[styles.specificationsList, isDarkMode && styles.darkSpecificationsList]}>
          {Object.entries(product.specifications).map(([key, value], index, array) => (
            <View 
              key={key} 
              style={[
                styles.specRow,
                index === array.length - 1 && styles.specRowLast
              ]}
            >
              <Text style={[styles.specKey, isDarkMode && styles.darkSpecKey]}>{key}</Text>
              <Text style={[styles.specValue, isDarkMode && styles.darkSpecValue]}>{value}</Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  const renderReviews = () => {
    const reviews = product?.reviews || [];
    
    if (reviews.length === 0) {
      return (
        <View style={styles.reviewsContainer}>
          <Text style={[styles.sectionTitle, isDarkMode && styles.darkSectionTitle]}>
            Reviews
          </Text>
          <View style={[styles.noReviews, isDarkMode && styles.darkNoReviews]}>
            <Text style={[styles.noReviewsText, isDarkMode && styles.darkNoReviewsText]}>
              No reviews yet. Be the first to review this product!
            </Text>
          </View>
        </View>
      );
    }

    return (
      <View style={styles.reviewsContainer}>
        <Text style={[styles.sectionTitle, isDarkMode && styles.darkSectionTitle]}>
          Reviews ({reviews.length})
        </Text>
        <View style={styles.reviewsList}>
          {reviews.slice(0, 3).map((review) => (
            <View key={review.id} style={[styles.reviewItem, isDarkMode && styles.darkReviewItem]}>
              <View style={styles.reviewHeader}>
                <Text style={[styles.reviewAuthor, isDarkMode && styles.darkReviewAuthor]}>
                  {review.author}
                </Text>
                <Text style={[styles.reviewRating, isDarkMode && styles.darkReviewRating]}>
                  ⭐ {review.rating}/5
                </Text>
              </View>
              <Text style={[styles.reviewComment, isDarkMode && styles.darkReviewComment]}>
                {review.comment}
              </Text>
              <Text style={[styles.reviewDate, isDarkMode && styles.darkReviewDate]}>
                {review.date}
              </Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  if (!fontsLoaded) {
    return (
      <View style={[styles.loadingContainer, isDarkMode && styles.darkLoadingContainer]}>
        <ActivityIndicator size="large" color="#232CAD" />
        <Text style={[styles.loadingText, isDarkMode && styles.darkLoadingText]}>Loading...</Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={[styles.loadingContainer, isDarkMode && styles.darkLoadingContainer]}>
        <ActivityIndicator size="large" color="#232CAD" />
        <Text style={[styles.loadingText, isDarkMode && styles.darkLoadingText]}>
          Loading product details...
        </Text>
      </View>
    );
  }

  if (!product) {
    return (
      <SafeAreaView style={[styles.safeArea, isDarkMode && styles.darkSafeArea]}>
        <View style={[styles.container, isDarkMode && styles.darkContainer]}>
          <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
              <Text style={[styles.backIcon, isDarkMode && styles.darkBackIcon]}>←</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.errorContainer}>
            <Text style={[styles.errorIcon, isDarkMode && styles.darkErrorIcon]}>😕</Text>
            <Text style={[styles.errorTitle, isDarkMode && styles.darkErrorTitle]}>
              Product Not Found
            </Text>
            <Text style={[styles.errorMessage, isDarkMode && styles.darkErrorMessage]}>
              The product you're looking for doesn't exist or has been removed.
            </Text>
            <TouchableOpacity 
              style={[styles.backHomeButton, isDarkMode && styles.darkBackHomeButton]}
              onPress={() => router.push('/Home')}
            >
              <Text style={[styles.backHomeText, isDarkMode && styles.darkBackHomeText]}>
                Back to Home
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  const displayPrice = selectedVariant ? selectedVariant.price : product.price;
  const displayStock = selectedVariant?.stock_quantity || product.stock_quantity || 0;
  const isOutOfStock = displayStock === 0;

  return (
    <SafeAreaView style={[styles.safeArea, isDarkMode && styles.darkSafeArea]}>
      <View style={[styles.container, isDarkMode && styles.darkContainer]}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Header with back button and actions */}
          <View style={[styles.header, isDarkMode && styles.darkHeader]}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
              <Text style={[styles.backIcon, isDarkMode && styles.darkBackIcon]}>←</Text>
            </TouchableOpacity>
            <View style={styles.headerActions}>
              <TouchableOpacity style={styles.headerButton} onPress={() => setIsLiked(!isLiked)}>
                <Text style={[styles.headerIcon, isDarkMode && styles.darkHeaderIcon]}>
                  {isLiked ? '❤️' : '🤍'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.headerButton} onPress={handleShare}>
                <Text style={[styles.headerIcon, isDarkMode && styles.darkHeaderIcon]}>↗️</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Product Images */}
          {renderImageGallery()}

          {/* Product Info */}
          <View style={styles.productInfo}>
            <View style={styles.productHeader}>
              <Text style={[styles.productName, isDarkMode && styles.darkProductName]}>
                {product.name}
              </Text>
              {product.rating && (
                <View style={styles.ratingContainer}>
                  <Text style={[styles.ratingText, isDarkMode && styles.ratingText]}>
                    ⭐ {product.rating.toFixed(1)}
                  </Text>
                </View>
              )}
            </View>

            {product.category && (
              <Text style={[styles.productCategory, isDarkMode && styles.darkProductCategory]}>
                {product.category}
              </Text>
            )}

            {/* Price Section */}
            <View style={styles.priceSection}>
              <Text style={[styles.price, isDarkMode && styles.darkPrice]}>
                ${displayPrice.toFixed(2)}
              </Text>
              {product.original_price && product.original_price > displayPrice && (
                <Text style={[styles.originalPrice, isDarkMode && styles.darkOriginalPrice]}>
                  ${product.original_price.toFixed(2)}
                </Text>
              )}
            </View>

            {/* Stock Status */}
            <View style={styles.stockContainer}>
              <Text style={[
                styles.stockText,
                isOutOfStock ? styles.outOfStockText : styles.inStockText,
                isDarkMode && (isOutOfStock ? styles.darkOutOfStockText : styles.darkInStockText)
              ]}>
                {isOutOfStock ? 'Out of Stock' : `${displayStock} in stock`}
              </Text>
            </View>

            {/* Description */}
            <Text style={[styles.description, isDarkMode && styles.darkDescription]}>
              {product.description}
            </Text>
            {product.long_description && (
              <Text style={[styles.longDescription, isDarkMode && styles.darkLongDescription]}>
                {product.long_description}
              </Text>
            )}

            {/* Shop Info */}
            {product.shop && (
              <TouchableOpacity 
                style={[styles.shopInfo, isDarkMode && styles.darkShopInfo]}
                onPress={navigateToShop}
              >
                <Text style={[styles.shopLabel, isDarkMode && styles.darkShopLabel]}>Sold by:</Text>
                <Text style={[styles.shopName, isDarkMode && styles.darkShopName]}>
                  {product.shop.name}
                </Text>
                {product.shop.rating && (
                  <Text style={[styles.shopRating, isDarkMode && styles.darkShopRating]}>
                    ⭐ {product.shop.rating.toFixed(1)}
                  </Text>
                )}
                <Text style={[styles.shopArrow, isDarkMode && styles.darkShopArrow]}>→</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Variants Selection */}
          {renderVariants()}

          {/* Quantity Selector */}
          <View style={[styles.quantityContainer, isDarkMode && styles.darkQuantityContainer]}>
            <Text style={[styles.quantityLabel, isDarkMode && styles.darkQuantityLabel]}>
              Quantity
            </Text>
            <View style={styles.quantitySelector}>
              <TouchableOpacity 
                style={[styles.quantityButton, isDarkMode && styles.darkQuantityButton]}
                onPress={decrementQuantity}
                disabled={quantity === 1}
              >
                <Text style={[styles.quantityButtonText, isDarkMode && styles.darkQuantityButtonText]}>-</Text>
              </TouchableOpacity>
              <Text style={[styles.quantityValue, isDarkMode && styles.darkQuantityValue]}>
                {quantity}
              </Text>
              <TouchableOpacity 
                style={[styles.quantityButton, isDarkMode && styles.darkQuantityButton]}
                onPress={incrementQuantity}
                disabled={quantity >= displayStock}
              >
                <Text style={[styles.quantityButtonText, isDarkMode && styles.darkQuantityButtonText]}>+</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Specifications */}
          {renderSpecifications()}

          {/* Reviews */}
          {renderReviews()}

          {/* Bottom Spacer */}
          <View style={styles.bottomSpacer} />
        </ScrollView>

        {/* Fixed Action Buttons */}
        <View style={[styles.actionBar, isDarkMode && styles.darkActionBar]}>
          <TouchableOpacity 
            style={[styles.addToCartButton, isDarkMode && styles.darkAddToCartButton]}
            onPress={handleAddToCart}
            disabled={isOutOfStock || addingToCart}
          >
            {addingToCart ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.addToCartText}>Add to Cart</Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.buyNowButton, isDarkMode && styles.darkBuyNowButton]}
            onPress={handleBuyNow}
            disabled={isOutOfStock || addingToCart}
          >
            <Text style={styles.buyNowText}>Buy Now</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // Layout styles
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  // Loading states
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
  // Error state
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  errorIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  errorTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 24,
    color: '#000000',
    marginBottom: 8,
  },
  errorMessage: {
    fontFamily: 'Poppins-Regular',
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 24,
  },
  backHomeButton: {
    backgroundColor: '#232CAD',
    borderRadius: 25,
    paddingHorizontal: 32,
    paddingVertical: 12,
  },
  backHomeText: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 16,
    color: '#FFFFFF',
  },
  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  backButton: {
    padding: 8,
  },
  backIcon: {
    fontSize: 24,
    color: '#000000',
  },
  headerActions: {
    flexDirection: 'row',
  },
  headerButton: {
    padding: 8,
    marginLeft: 12,
  },
  headerIcon: {
    fontSize: 20,
  },
  // Image Gallery
  imageGalleryContainer: {
    marginBottom: 20,
  },
  mainImageContainer: {
    width: '100%',
    height: 300,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
  },
  mainImage: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    width: '100%',
    height: 300,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
  },
  placeholderText: {
    fontSize: 48,
    marginBottom: 8,
  },
  placeholderSubtext: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: '#666666',
  },
  thumbnailContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  thumbnail: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 10,
    borderWidth: 2,
    borderColor: 'transparent',
    overflow: 'hidden',
  },
  activeThumbnail: {
    borderColor: '#232CAD',
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  // Product Info
  productInfo: {
    paddingHorizontal: 20,
  },
  productHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  productName: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 22,
    color: '#000000',
    flex: 1,
    marginRight: 12,
  },
  ratingContainer: {
    backgroundColor: '#F2F2FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  ratingText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: '#232CAD',
  },
  productCategory: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: '#666666',
    marginBottom: 12,
  },
  priceSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  price: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 24,
    color: '#232CAD',
    marginRight: 12,
  },
  originalPrice: {
    fontFamily: 'Poppins-Regular',
    fontSize: 18,
    color: '#999999',
    textDecorationLine: 'line-through',
  },
  stockContainer: {
    marginBottom: 16,
  },
  stockText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
  },
  inStockText: {
    color: '#228B22',
  },
  outOfStockText: {
    color: '#DC143C',
  },
  description: {
    fontFamily: 'Poppins-Regular',
    fontSize: 16,
    color: '#333333',
    lineHeight: 24,
    marginBottom: 16,
  },
  longDescription: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: '#666666',
    lineHeight: 22,
    marginBottom: 20,
  },
  shopInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
    padding: 12,
    borderRadius: 10,
    marginBottom: 20,
  },
  shopLabel: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: '#666666',
    marginRight: 8,
  },
  shopName: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 14,
    color: '#232CAD',
    flex: 1,
  },
  shopRating: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
    color: '#666666',
    marginRight: 12,
  },
  shopArrow: {
    fontSize: 16,
    color: '#666666',
  },
  // Variants
  variantsContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  variantSection: {
    marginBottom: 16,
  },
  variantLabel: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 16,
    color: '#000000',
    marginBottom: 12,
  },
  variantOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  colorOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  selectedColorOption: {
    backgroundColor: '#232CAD',
    borderColor: '#232CAD',
  },
  colorCircle: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 8,
  },
  colorText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: '#666666',
  },
  selectedColorText: {
    color: '#FFFFFF',
  },
  storageOption: {
    backgroundColor: '#F8F8F8',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    alignItems: 'center',
    minWidth: 80,
  },
  selectedStorageOption: {
    backgroundColor: '#232CAD',
    borderColor: '#232CAD',
  },
  storageText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: '#666666',
    marginBottom: 4,
  },
  selectedStorageText: {
    color: '#FFFFFF',
  },
  storagePrice: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
    color: '#999999',
  },
  selectedStoragePrice: {
    color: '#FFFFFF',
  },
  // Quantity
  quantityContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  quantityLabel: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 16,
    color: '#000000',
  },
  quantitySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
    borderRadius: 25,
    padding: 4,
  },
  quantityButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityButtonText: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 20,
    color: '#000000',
  },
  quantityValue: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 18,
    color: '#000000',
    marginHorizontal: 16,
  },
  // Specifications
  specificationsContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 18,
    color: '#000000',
    marginBottom: 16,
  },
  specificationsList: {
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
    padding: 16,
  },
  specRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  specRowLast: {
    borderBottomWidth: 0,
  },
  specKey: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: '#666666',
    flex: 1,
  },
  specValue: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 14,
    color: '#000000',
    flex: 2,
    textAlign: 'right',
  },
  // Reviews
  reviewsContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  noReviews: {
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  noReviewsText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
  },
  reviewsList: {
    gap: 12,
  },
  reviewItem: {
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
    padding: 16,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  reviewAuthor: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 14,
    color: '#000000',
  },
  reviewRating: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
    color: '#666666',
  },
  reviewComment: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: '#333333',
    lineHeight: 20,
    marginBottom: 8,
  },
  reviewDate: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
    color: '#999999',
  },
  // Action Bar
  actionBar: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    gap: 12,
  },
  addToCartButton: {
    flex: 1,
    backgroundColor: '#F2F2FF',
    borderRadius: 25,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#232CAD',
  },
  addToCartText: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 16,
    color: '#232CAD',
  },
  buyNowButton: {
    flex: 1,
    backgroundColor: '#232CAD',
    borderRadius: 25,
    paddingVertical: 16,
    alignItems: 'center',
  },
  buyNowText: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 16,
    color: '#FFFFFF',
  },
  // Bottom Spacer
  bottomSpacer: {
    height: 80,
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
  darkErrorIcon: {
    color: '#AAAAAA',
  },
  darkErrorTitle: {
    color: '#FFFFFF',
  },
  darkErrorMessage: {
    color: '#AAAAAA',
  },
  darkBackHomeButton: {
    backgroundColor: '#BB86FC',
  },
  darkBackHomeText: {
    color: '#000000',
  },
  darkHeader: {
    backgroundColor: '#1E1E1E',
  },
  darkBackIcon: {
    color: '#FFFFFF',
  },
  darkHeaderIcon: {
    color: '#FFFFFF',
  },
  darkImagePlaceholder: {
    backgroundColor: '#2D2D2D',
  },
  darkPlaceholderSubtext: {
    color: '#AAAAAA',
  },
  darkThumbnail: {
    borderColor: '#444444',
  },
  darkActiveThumbnail: {
    borderColor: '#BB86FC',
  },
  darkProductName: {
    color: '#FFFFFF',
  },
  darkProductCategory: {
    color: '#AAAAAA',
  },
  darkPrice: {
    color: '#BB86FC',
  },
  darkOriginalPrice: {
    color: '#888888',
  },
  darkInStockText: {
    color: '#4CAF50',
  },
  darkOutOfStockText: {
    color: '#F44336',
  },
  darkDescription: {
    color: '#CCCCCC',
  },
  darkLongDescription: {
    color: '#AAAAAA',
  },
  darkShopInfo: {
    backgroundColor: '#2D2D2D',
  },
  darkShopLabel: {
    color: '#AAAAAA',
  },
  darkShopName: {
    color: '#BB86FC',
  },
  darkShopRating: {
    color: '#AAAAAA',
  },
  darkShopArrow: {
    color: '#AAAAAA',
  },
  darkVariantLabel: {
    color: '#FFFFFF',
  },
  darkColorOption: {
    backgroundColor: '#2D2D2D',
    borderColor: '#444444',
  },
  darkSelectedColorOption: {
    backgroundColor: '#BB86FC',
    borderColor: '#BB86FC',
  },
  darkColorText: {
    color: '#AAAAAA',
  },
  darkSelectedColorText: {
    color: '#000000',
  },
  darkStorageOption: {
    backgroundColor: '#2D2D2D',
    borderColor: '#444444',
  },
  darkSelectedStorageOption: {
    backgroundColor: '#BB86FC',
    borderColor: '#BB86FC',
  },
  darkStorageText: {
    color: '#AAAAAA',
  },
  darkSelectedStorageText: {
    color: '#000000',
  },
  darkStoragePrice: {
    color: '#888888',
  },
  darkSelectedStoragePrice: {
    color: '#000000',
  },
  darkQuantityContainer: {
    backgroundColor: '#121212',
  },
  darkQuantityLabel: {
    color: '#FFFFFF',
  },
  darkQuantityButton: {
    backgroundColor: '#2D2D2D',
  },
  darkQuantityButtonText: {
    color: '#FFFFFF',
  },
  darkQuantityValue: {
    color: '#FFFFFF',
  },
  darkSectionTitle: {
    color: '#FFFFFF',
  },
  darkSpecificationsList: {
    backgroundColor: '#2D2D2D',
  },
  darkSpecKey: {
    color: '#AAAAAA',
  },
  darkSpecValue: {
    color: '#CCCCCC',
  },
  darkNoReviews: {
    backgroundColor: '#2D2D2D',
  },
  darkNoReviewsText: {
    color: '#AAAAAA',
  },
  darkReviewItem: {
    backgroundColor: '#2D2D2D',
  },
  darkReviewAuthor: {
    color: '#FFFFFF',
  },
  darkReviewRating: {
    color: '#AAAAAA',
  },
  darkReviewComment: {
    color: '#CCCCCC',
  },
  darkReviewDate: {
    color: '#888888',
  },
  darkActionBar: {
    backgroundColor: '#1E1E1E',
    borderTopColor: '#333333',
  },
  darkAddToCartButton: {
    backgroundColor: '#2D2D2D',
    borderColor: '#BB86FC',
  },
  darkAddToCartText: {
    color: '#BB86FC',
  },
  darkBuyNowButton: {
    backgroundColor: '#BB86FC',
  },
  darkBuyNowText: {
    color: '#000000',
  },
});