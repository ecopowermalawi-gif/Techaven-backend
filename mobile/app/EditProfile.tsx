import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  Image, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFonts, Poppins_400Regular, Poppins_500Medium, Poppins_600SemiBold } from '@expo-google-fonts/poppins';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiService from './services/api';
import { useTheme } from './context/ThemeContext';

type UserData = {
  id?: string;
  name?: string;
  email?: string;
  phone_number?: string;
  profile_picture?: string;
  created_at?: string;
};

export default function EditProfile() {
  const [fontsLoaded] = useFonts({
    'Poppins-Regular': Poppins_400Regular,
    'Poppins-Medium': Poppins_500Medium,
    'Poppins-SemiBold': Poppins_600SemiBold,
  });
  
  const router = useRouter();
  const params = useLocalSearchParams();
  const { isDarkMode } = useTheme();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userId, setUserId] = useState<string>('');
  
  // Form fields
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone_number: '',
  });
  
  const [errors, setErrors] = useState({
    name: '',
    email: '',
    phone_number: '',
  });

  // Initialize with user data from params
  useEffect(() => {
    const initializeData = async () => {
      try {
        let userData: UserData | null = null;
        
        // Try to get user data from params first
        if (params.userData) {
          try {
            userData = JSON.parse(params.userData as string);
          } catch (e) {
            console.log('Error parsing userData from params:', e);
          }
        }
        
        // If no userData from params, try to get from AsyncStorage
        if (!userData?.id) {
          const storedData = await AsyncStorage.getItem('userData');
          if (storedData) {
            userData = JSON.parse(storedData);
          }
        }
        
        if (userData) {
          setUserId(userData.id || '');
          setFormData({
            name: userData.name || '',
            email: userData.email || '',
            phone_number: userData.phone_number || '',
          });
        } else {
          Alert.alert('Error', 'Unable to load user data');
          router.back();
        }
      } catch (error) {
        console.error('Error initializing edit profile:', error);
        Alert.alert('Error', 'Failed to load profile data');
        router.back();
      } finally {
        setLoading(false);
      }
    };

    initializeData();
  }, [params.userData]);

  const validateForm = () => {
    const newErrors = {
      name: '',
      email: '',
      phone_number: '',
    };
    
    let isValid = true;
    
    // Validate name
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
      isValid = false;
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
      isValid = false;
    }
    
    // Validate email
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
      isValid = false;
    }
    
    // Validate phone (optional, but validate if provided)
    if (formData.phone_number && !/^\+?[\d\s\-\(\)]{10,}$/.test(formData.phone_number.replace(/\s/g, ''))) {
      newErrors.phone_number = 'Please enter a valid phone number';
      isValid = false;
    }
    
    setErrors(newErrors);
    return isValid;
  };

  const formatPhoneNumber = (phone: string) => {
    // Remove all non-digit characters
    let cleaned = phone.replace(/\D/g, '');
    
    // Format for Malawi numbers
    if (cleaned.startsWith('0')) {
      return '+265' + cleaned.substring(1);
    } else if (!cleaned.startsWith('+')) {
      return '+265' + cleaned;
    }
    
    return phone;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }
    
    try {
      setSaving(true);
      
      // Get current user ID if not already set
      let currentUserId = userId;
      if (!currentUserId) {
        const storedData = await AsyncStorage.getItem('userData');
        if (storedData) {
          const userData = JSON.parse(storedData);
          currentUserId = userData.id;
        }
      }
      
      if (!currentUserId) {
        Alert.alert('Error', 'User ID not found');
        setSaving(false);
        return;
      }
      
      // Format phone number if provided
      const profileData = {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        ...(formData.phone_number && {
          phone_number: formatPhoneNumber(formData.phone_number.trim())
        }),
      };
      
      // Call the update profile API
      const response = await apiService.updateUserProfile(currentUserId, profileData);
      
      // Update local storage with new data
      const storedData = await AsyncStorage.getItem('userData');
      if (storedData) {
        const userData = JSON.parse(storedData);
        const updatedUserData = {
          ...userData,
          name: profileData.name,
          email: profileData.email,
          phone_number: profileData.phone_number || userData.phone_number,
        };
        await AsyncStorage.setItem('userData', JSON.stringify(updatedUserData));
      }
      
      Alert.alert(
        'Success',
        'Profile updated successfully!',
        [{ text: 'OK', onPress: () => router.back() }]
      );
      
    } catch (error: any) {
      console.error('Error updating profile:', error);
      
      let errorMessage = 'Failed to update profile. Please try again.';
      
      if (error.message) {
        errorMessage = error.message;
      } else if (error.response?.data?.detail) {
        // Handle validation errors from API
        if (Array.isArray(error.response.data.detail)) {
          errorMessage = error.response.data.detail
            .map((err: any) => `${err.loc?.join('.')}: ${err.msg}`)
            .join('\n');
        } else {
          errorMessage = error.response.data.detail;
        }
      }
      
      Alert.alert('Error', errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleCancel = () => {
    Alert.alert(
      'Discard Changes',
      'Are you sure you want to discard your changes?',
      [
        { text: 'No', style: 'cancel' },
        { text: 'Yes', style: 'destructive', onPress: () => router.back() }
      ]
    );
  };

  const InputField = ({ 
    label, 
    value, 
    onChangeText, 
    error, 
    placeholder, 
    keyboardType = 'default',
    autoCapitalize = 'sentences',
    editable = true,
    multiline = false,
  }: {
    label: string;
    value: string;
    onChangeText: (text: string) => void;
    error: string;
    placeholder: string;
    keyboardType?: 'default' | 'email-address' | 'phone-pad';
    autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
    editable?: boolean;
    multiline?: boolean;
  }) => (
    <View style={styles.inputContainer}>
      <Text style={[styles.inputLabel, isDarkMode && styles.darkInputLabel]}>{label}</Text>
      <TextInput
        style={[
          styles.textInput,
          isDarkMode && styles.darkTextInput,
          error && styles.inputError,
          multiline && styles.multilineInput,
        ]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={isDarkMode ? '#666666' : '#999999'}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        editable={editable}
        multiline={multiline}
        numberOfLines={multiline ? 3 : 1}
      />
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );

  if (!fontsLoaded || loading) {
    return (
      <SafeAreaView style={[styles.safeArea, isDarkMode && styles.darkSafeArea]}>
        <View style={[styles.loadingContainer, isDarkMode && styles.darkLoadingContainer]}>
          <ActivityIndicator size="large" color="#232CAD" />
          <Text style={[styles.loadingText, isDarkMode && styles.darkLoadingText]}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, isDarkMode && styles.darkSafeArea]}>
      <KeyboardAvoidingView 
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView 
          style={styles.scrollView} 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Header */}
          <View style={[styles.header, isDarkMode && styles.darkHeader]}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={handleCancel}
            >
              <Text style={[styles.backIcon, isDarkMode && styles.darkBackIcon]}>‹</Text>
            </TouchableOpacity>
            <Text style={[styles.headerTitle, isDarkMode && styles.darkHeaderTitle]}>Edit Profile</Text>
            <View style={styles.headerRight}>
              {saving ? (
                <ActivityIndicator size="small" color={isDarkMode ? '#BB86FC' : '#232CAD'} />
              ) : (
                <TouchableOpacity 
                  style={styles.saveButton}
                  onPress={handleSave}
                  disabled={saving}
                >
                  <Text style={[styles.saveText, isDarkMode && styles.darkSaveText]}>Save</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Profile Picture Section */}
          <View style={[styles.profileSection, isDarkMode && styles.darkProfileSection]}>
            <View style={styles.avatarContainer}>
              <Image 
                source={{ 
                  uri: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face' 
                }}
                style={styles.avatar}
              />
              <TouchableOpacity style={styles.changePhotoButton}>
                <Text style={styles.changePhotoText}>Change Photo</Text>
              </TouchableOpacity>
            </View>
            <Text style={[styles.profileNote, isDarkMode && styles.darkProfileNote]}>
              Upload a new profile picture (coming soon)
            </Text>
          </View>

          {/* Form Section */}
          <View style={[styles.formSection, isDarkMode && styles.darkFormSection]}>
            <Text style={[styles.sectionTitle, isDarkMode && styles.darkSectionTitle]}>
              Personal Information
            </Text>
            
            <InputField
              label="Full Name"
              value={formData.name}
              onChangeText={(text) => handleChange('name', text)}
              error={errors.name}
              placeholder="Enter your full name"
              autoCapitalize="words"
            />
            
            <InputField
              label="Email Address"
              value={formData.email}
              onChangeText={(text) => handleChange('email', text)}
              error={errors.email}
              placeholder="Enter your email address"
              keyboardType="email-address"
              autoCapitalize="none"
              editable={false} // Email might not be editable depending on your system
            />
            
            <InputField
              label="Phone Number"
              value={formData.phone_number}
              onChangeText={(text) => handleChange('phone_number', text)}
              error={errors.phone_number}
              placeholder="+265 XXX XXX XXX"
              keyboardType="phone-pad"
            />
            
            {/* Additional Info (Optional) */}
            <View style={styles.additionalInfo}>
              <Text style={[styles.infoTitle, isDarkMode && styles.darkInfoTitle]}>
                Account Information
              </Text>
              <View style={[styles.infoRow, isDarkMode && styles.darkInfoRow]}>
                <Text style={[styles.infoLabel, isDarkMode && styles.darkInfoLabel]}>User ID:</Text>
                <Text style={[styles.infoValue, isDarkMode && styles.darkInfoValue]}>
                  {userId || 'Loading...'}
                </Text>
              </View>
              <Text style={[styles.infoNote, isDarkMode && styles.darkInfoNote]}>
                Some information cannot be changed for security reasons.
              </Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={[styles.cancelButton, isDarkMode && styles.darkCancelButton]}
              onPress={handleCancel}
              disabled={saving}
            >
              <Text style={[styles.cancelButtonText, isDarkMode && styles.darkCancelButtonText]}>
                Cancel
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.saveFullButton, saving && styles.saveButtonDisabled]}
              onPress={handleSave}
              disabled={saving}
            >
              <LinearGradient
                colors={['#232CAD', '#4547D1']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.saveButtonGradient}
              >
                {saving ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.saveFullButtonText}>Save Changes</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Blockchain Notice */}
          <View style={[styles.blockchainNotice, isDarkMode && styles.darkBlockchainNotice]}>
            <Text style={[styles.blockchainIcon, isDarkMode && styles.darkBlockchainIcon]}>⛓️</Text>
            <View style={styles.blockchainTextContainer}>
              <Text style={[styles.blockchainTitle, isDarkMode && styles.darkBlockchainTitle]}>
                Blockchain Verified
              </Text>
              <Text style={[styles.blockchainDescription, isDarkMode && styles.darkBlockchainDescription]}>
                Profile updates are recorded on the blockchain for security and transparency.
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // Layout
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
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
    width: 60,
    alignItems: 'flex-end',
  },
  saveButton: {
    padding: 8,
  },
  saveText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 16,
    color: '#232CAD',
  },
  // Profile Section
  profileSection: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 20,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
    borderWidth: 4,
    borderColor: '#E8EBF9',
  },
  changePhotoButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#F8F8F8',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  changePhotoText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    color: '#232CAD',
  },
  profileNote: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
    color: '#666666',
    textAlign: 'center',
    marginTop: 8,
  },
  // Form Section
  formSection: {
    paddingHorizontal: 20,
    marginTop: 16,
  },
  sectionTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 16,
    color: '#000000',
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    color: '#333333',
    marginBottom: 8,
  },
  textInput: {
    fontFamily: 'Poppins-Regular',
    fontSize: 16,
    color: '#000000',
    backgroundColor: '#F8F8F8',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  multilineInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  inputError: {
    borderColor: '#FF3B30',
  },
  errorText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
    color: '#FF3B30',
    marginTop: 4,
    marginLeft: 4,
  },
  // Additional Info
  additionalInfo: {
    marginTop: 20,
    padding: 16,
    backgroundColor: '#F8F8F8',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  infoTitle: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    color: '#333333',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoLabel: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    color: '#666666',
    width: 80,
  },
  infoValue: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: '#000000',
    flex: 1,
  },
  infoNote: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
    color: '#666666',
    fontStyle: 'italic',
    marginTop: 8,
  },
  // Action Buttons
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginTop: 24,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 16,
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 16,
    color: '#666666',
  },
  saveFullButton: {
    flex: 2,
    borderRadius: 12,
    overflow: 'hidden',
  },
  saveButtonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  saveFullButtonText: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 16,
    color: '#FFFFFF',
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
  // Blockchain Notice
  blockchainNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop: 24,
    padding: 16,
    backgroundColor: '#F2F2FF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0FF',
  },
  blockchainIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  blockchainTextContainer: {
    flex: 1,
  },
  blockchainTitle: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    color: '#232CAD',
    marginBottom: 4,
  },
  blockchainDescription: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
    color: '#666666',
    lineHeight: 16,
  },
  // Dark Mode Styles
  darkSafeArea: {
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
  darkSaveText: {
    color: '#BB86FC',
  },
  darkProfileSection: {
    backgroundColor: '#121212',
  },
  darkProfileNote: {
    color: '#AAAAAA',
  },
  darkFormSection: {
    backgroundColor: '#121212',
  },
  darkSectionTitle: {
    color: '#FFFFFF',
  },
  darkInputLabel: {
    color: '#CCCCCC',
  },
  darkTextInput: {
    backgroundColor: '#2D2D2D',
    borderColor: '#444444',
    color: '#FFFFFF',
  },
  darkInfoTitle: {
    color: '#CCCCCC',
  },
  darkInfoRow: {
    backgroundColor: 'transparent',
  },
  darkInfoLabel: {
    color: '#AAAAAA',
  },
  darkInfoValue: {
    color: '#FFFFFF',
  },
  darkInfoNote: {
    color: '#888888',
  },
  darkCancelButton: {
    backgroundColor: '#2D2D2D',
    borderColor: '#444444',
  },
  darkCancelButtonText: {
    color: '#AAAAAA',
  },
  darkBlockchainNotice: {
    backgroundColor: '#2D2D2D',
    borderColor: '#444444',
  },
  darkBlockchainIcon: {
    color: '#BB86FC',
  },
  darkBlockchainTitle: {
    color: '#BB86FC',
  },
  darkBlockchainDescription: {
    color: '#AAAAAA',
  },
});