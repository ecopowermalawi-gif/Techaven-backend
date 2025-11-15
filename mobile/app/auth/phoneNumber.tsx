import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Modal,
  FlatList,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFonts, Poppins_400Regular, Poppins_500Medium, Poppins_600SemiBold } from '@expo-google-fonts/poppins';

const { width, height } = Dimensions.get('window');

// African countries array (same as before)
const africanCountries = [
  { code: '+213', name: 'Algeria', flag: '🇩🇿' },
  { code: '+244', name: 'Angola', flag: '🇦🇴' },
  { code: '+229', name: 'Benin', flag: '🇧🇯' },
  { code: '+267', name: 'Botswana', flag: '🇧🇼' },
  { code: '+226', name: 'Burkina Faso', flag: '🇧🇫' },
  { code: '+257', name: 'Burundi', flag: '🇧🇮' },
  { code: '+238', name: 'Cape Verde', flag: '🇨🇻' },
  { code: '+236', name: 'Central African Republic', flag: '🇨🇫' },
  { code: '+235', name: 'Chad', flag: '🇹🇩' },
  { code: '+269', name: 'Comoros', flag: '🇰🇲' },
  { code: '+242', name: 'Congo', flag: '🇨🇬' },
  { code: '+243', name: 'DR Congo', flag: '🇨🇩' },
  { code: '+253', name: 'Djibouti', flag: '🇩🇯' },
  { code: '+20', name: 'Egypt', flag: '🇪🇬' },
  { code: '+240', name: 'Equatorial Guinea', flag: '🇬🇶' },
  { code: '+291', name: 'Eritrea', flag: '🇪🇷' },
  { code: '+251', name: 'Ethiopia', flag: '🇪🇹' },
  { code: '+241', name: 'Gabon', flag: '🇬🇦' },
  { code: '+220', name: 'Gambia', flag: '🇬🇲' },
  { code: '+233', name: 'Ghana', flag: '🇬🇭' },
  { code: '+224', name: 'Guinea', flag: '🇬🇳' },
  { code: '+245', name: 'Guinea-Bissau', flag: '🇬🇼' },
  { code: '+225', name: 'Ivory Coast', flag: '🇨🇮' },
  { code: '+254', name: 'Kenya', flag: '🇰🇪' },
  { code: '+266', name: 'Lesotho', flag: '🇱🇸' },
  { code: '+231', name: 'Liberia', flag: '🇱🇷' },
  { code: '+218', name: 'Libya', flag: '🇱🇾' },
  { code: '+261', name: 'Madagascar', flag: '🇲🇬' },
  { code: '+265', name: 'Malawi', flag: '🇲🇼' },
  { code: '+223', name: 'Mali', flag: '🇲🇱' },
  { code: '+222', name: 'Mauritania', flag: '🇲🇷' },
  { code: '+230', name: 'Mauritius', flag: '🇲🇺' },
  { code: '+212', name: 'Morocco', flag: '🇲🇦' },
  { code: '+258', name: 'Mozambique', flag: '🇲🇿' },
  { code: '+264', name: 'Namibia', flag: '🇳🇦' },
  { code: '+227', name: 'Niger', flag: '🇳🇪' },
  { code: '+234', name: 'Nigeria', flag: '🇳🇬' },
  { code: '+262', name: 'Réunion', flag: '🇷🇪' },
  { code: '+250', name: 'Rwanda', flag: '🇷🇼' },
  { code: '+290', name: 'Saint Helena', flag: '🇸🇭' },
  { code: '+239', name: 'São Tomé and Príncipe', flag: '🇸🇹' },
  { code: '+221', name: 'Senegal', flag: '🇸🇳' },
  { code: '+248', name: 'Seychelles', flag: '🇸🇨' },
  { code: '+232', name: 'Sierra Leone', flag: '🇸🇱' },
  { code: '+252', name: 'Somalia', flag: '🇸🇴' },
  { code: '+27', name: 'South Africa', flag: '🇿🇦' },
  { code: '+211', name: 'South Sudan', flag: '🇸🇸' },
  { code: '+249', name: 'Sudan', flag: '🇸🇩' },
  { code: '+268', name: 'Eswatini', flag: '🇸🇿' },
  { code: '+255', name: 'Tanzania', flag: '🇹🇿' },
  { code: '+228', name: 'Togo', flag: '🇹🇬' },
  { code: '+216', name: 'Tunisia', flag: '🇹🇳' },
  { code: '+256', name: 'Uganda', flag: '🇺🇬' },
  { code: '+260', name: 'Zambia', flag: '🇿🇲' },
  { code: '+263', name: 'Zimbabwe', flag: '🇿🇼' },
].sort((a, b) => a.name.localeCompare(b.name));

const defaultCountry = africanCountries.find(country => country.code === '+265') || africanCountries[0];

export default function PhoneNumber() {
  const router = useRouter();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [selectedCountry, setSelectedCountry] = useState(defaultCountry);
  const [showCountryPicker, setShowCountryPicker] = useState(false);

  // Load Poppins fonts
  const [fontsLoaded] = useFonts({
    'Poppins-Regular': Poppins_400Regular,
    'Poppins-Medium': Poppins_500Medium,
    'Poppins-SemiBold': Poppins_600SemiBold,
  });

  if (!fontsLoaded) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  const handleNumberPress = (number: string) => {
    setPhoneNumber(prev => prev + number);
  };

  const handleBackspace = () => {
    setPhoneNumber(prev => prev.slice(0, -1));
  };

  const handleContinue = () => {
    if (phoneNumber.length >= 9 && selectedCountry) {
      const fullPhoneNumber = `${selectedCountry.code}${phoneNumber}`;
      console.log('Phone number:', fullPhoneNumber);
      
      // Navigate to verify page with phone number as parameter
      router.push({
        pathname: '/auth/verify',
        params: { phoneNumber: fullPhoneNumber }
      });
    }
  };

  const handleCountrySelect = (country: any) => {
    setSelectedCountry(country);
    setShowCountryPicker(false);
  };

  const handleBack = () => {
    router.back(); // Go back to previous screen
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
      >
        {/* Back Button - Top Left Corner */}
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Text style={styles.backButtonText}>‹ Back</Text>
        </TouchableOpacity>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Title */}
          <Text style={styles.title}>Phone Number</Text>

          {/* Subtitle */}
          <Text style={styles.subtitle}>
            Please enter your phone number to verify your account
          </Text>

          {/* Phone Input */}
          <View style={styles.phoneInputContainer}>
            <TouchableOpacity 
              style={styles.countryCodeContainer}
              onPress={() => setShowCountryPicker(true)}
            >
              <Text style={styles.countryCode}>
                {selectedCountry.flag} {selectedCountry.code}
              </Text>
              <Text style={styles.dropdownArrow}>▼</Text>
            </TouchableOpacity>
            <TextInput
              style={styles.phoneInput}
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              placeholder="Enter phone number"
              placeholderTextColor="#88879C"
              keyboardType="phone-pad"
              maxLength={15}
              editable={false}
            />
          </View>

          {/* Selected Country Display */}
          <Text style={styles.selectedCountryText}>
            {selectedCountry.name}
          </Text>

          {/* Continue Button */}
          <TouchableOpacity
            style={[
              styles.continueButton,
              (phoneNumber.length >= 9 && selectedCountry) ? styles.continueButtonActive : styles.continueButtonInactive,
            ]}
            onPress={handleContinue}
            disabled={!(phoneNumber.length >= 9 && selectedCountry)}
          >
            <Text style={styles.continueButtonText}>Continue</Text>
          </TouchableOpacity>

          {/* Custom Number Keyboard */}
          <View style={styles.keyboardContainer}>
            <View style={styles.keyboardRow}>
              {['1', '2', '3'].map(number => (
                <TouchableOpacity
                  key={number}
                  style={styles.keyButton}
                  onPress={() => handleNumberPress(number)}
                >
                  <Text style={styles.keyButtonText}>{number}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.keyboardRow}>
              {['4', '5', '6'].map(number => (
                <TouchableOpacity
                  key={number}
                  style={styles.keyButton}
                  onPress={() => handleNumberPress(number)}
                >
                  <Text style={styles.keyButtonText}>{number}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.keyboardRow}>
              {['7', '8', '9'].map(number => (
                <TouchableOpacity
                  key={number}
                  style={styles.keyButton}
                  onPress={() => handleNumberPress(number)}
                >
                  <Text style={styles.keyButtonText}>{number}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.keyboardRow}>
              <TouchableOpacity style={styles.keyButton} onPress={() => handleNumberPress('+')}>
                <Text style={styles.keyButtonText}>+</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.keyButton}
                onPress={() => handleNumberPress('0')}
              >
                <Text style={styles.keyButtonText}>0</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.keyButton} onPress={handleBackspace}>
                <Text style={styles.keyButtonText}>⌫</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* African Countries Picker Modal */}
      <Modal
        visible={showCountryPicker}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowCountryPicker(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select African Country</Text>
            <FlatList
              data={africanCountries}
              keyExtractor={(item) => item.code}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.countryItem,
                    selectedCountry.code === item.code && styles.selectedCountryItem
                  ]}
                  onPress={() => handleCountrySelect(item)}
                >
                  <Text style={styles.countryFlag}>{item.flag}</Text>
                  <View style={styles.countryTextContainer}>
                    <Text style={styles.countryName}>{item.name}</Text>
                    <Text style={styles.countryCodeText}>{item.code}</Text>
                  </View>
                </TouchableOpacity>
              )}
              showsVerticalScrollIndicator={false}
            />
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowCountryPicker(false)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  keyboardAvoid: {
    flex: 1,
  },
  // Back Button Styles
  backButton: {
   position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 30,
    left: 20,
    zIndex: 10,
   
    
    justifyContent: 'center',
    alignItems: 'center',
    
    borderColor: '#E0E0E0',
  },
  backButtonText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 16,
    color: '#040525',
    marginTop: -2,
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 100, // Increased to accommodate back button
    paddingBottom: 20,
  },
  title: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 28,
    lineHeight: 34,
    textAlign: 'center',
    color: '#040525',
    marginBottom: 16,
  },
  subtitle: {
    fontFamily: 'Poppins-Regular',
    fontSize: 16,
    lineHeight: 22.4,
    textAlign: 'center',
    color: '#88879C',
    marginBottom: 40,
    maxWidth: '80%',
  },
  phoneInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '90%',
    marginBottom: 20,
  },
  countryCodeContainer: {
    width: '30%',
    height: 50,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
    flexDirection: 'row',
    gap: 4,
    paddingHorizontal: 8,
  },
  countryCode: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: '#040525',
  },
  dropdownArrow: {
    fontSize: 10,
    color: '#88879C',
  },
  phoneInput: {
    width: '68%',
    height: 50,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    paddingHorizontal: 16,
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: '#040525',
    backgroundColor: '#FFFFFF',
  },
  selectedCountryText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: '#88879C',
    marginBottom: 30,
    textAlign: 'center',
  },
  continueButton: {
    width: '90%',
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 60,
    borderRadius: 10,
  },
  continueButtonActive: {
    backgroundColor: '#007AFF',
  },
  continueButtonInactive: {
    backgroundColor: '#E0E0E0',
  },
  continueButtonText: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 16,
    textAlign: 'center',
    color: '#FFFFFF',
  },
  keyboardContainer: {
    width: '90%',
    gap: 16,
    marginTop: 20,
  },
  keyboardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  keyButton: {
    flex: 1,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  keyButtonText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 24,
    color: '#040525',
  },
  // Modal Styles
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 20,
  },
  modalContent: {
    width: '90%',
    height: '80%',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
  },
  modalTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 20,
    textAlign: 'center',
    marginBottom: 20,
    color: '#040525',
  },
  countryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    gap: 12,
  },
  selectedCountryItem: {
    backgroundColor: '#F0F8FF',
  },
  countryFlag: {
    fontSize: 20,
    width: 30,
  },
  countryTextContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  countryName: {
    fontFamily: 'Poppins-Regular',
    fontSize: 16,
    color: '#040525',
    flex: 1,
  },
  countryCodeText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: '#88879C',
    marginLeft: 10,
  },
  closeButton: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#007AFF',
    borderRadius: 12,
    alignItems: 'center',
  },
  closeButtonText: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 16,
    color: 'white',
  },
});