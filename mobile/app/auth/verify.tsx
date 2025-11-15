import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ScrollView,
  Alert,
  Platform
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFonts, Poppins_400Regular, Poppins_500Medium, Poppins_600SemiBold } from '@expo-google-fonts/poppins';

const { width, height } = Dimensions.get('window');

export default function Verify() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  // Get phone number from navigation params or use a placeholder
  const phoneNumber = params.phoneNumber || '+265 123 456 789';
  
  const [code, setCode] = useState(['', '', '', '']);
  const [timeLeft, setTimeLeft] = useState(60); // 60 seconds countdown
  const [canResend, setCanResend] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  
  const inputRefs = [
    useRef<TextInput>(null),
    useRef<TextInput>(null),
    useRef<TextInput>(null),
    useRef<TextInput>(null),
  ];

  // Load Poppins fonts
  const [fontsLoaded] = useFonts({
    'Poppins-Regular': Poppins_400Regular,
    'Poppins-Medium': Poppins_500Medium,
    'Poppins-SemiBold': Poppins_600SemiBold,
  });

  // Countdown timer
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [timeLeft]);

  const handleCodeChange = (text: string, index: number) => {
    // Only allow numbers
    const numericText = text.replace(/[^0-9]/g, '');
    
    const newCode = [...code];
    newCode[index] = numericText;
    setCode(newCode);

    // Auto-focus next input
    if (numericText && index < 3) {
      inputRefs[index + 1].current?.focus();
    }

    // If all fields are filled, auto-verify
    if (newCode.every(digit => digit !== '') && index === 3) {
      handleVerify();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    // Handle backspace
    if (e.nativeEvent.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs[index - 1].current?.focus();
    }
  };

  const handleVerify = async () => {
    const verificationCode = code.join('');
    
    if (verificationCode.length === 4) {
      setIsVerifying(true);
      
      // Simulate API call delay
      setTimeout(() => {
        // Here you would typically verify the code with your backend
        // For demo purposes, we'll assume the code is always valid
        console.log('Verification code:', verificationCode);
        
        // Show success message
        Alert.alert('Success', 'Phone number verified successfully!', [
          {
            text: 'OK',
            onPress: () => {
              // Navigate to Home page after successful verification
              router.replace('/Home');
            }
          }
        ]);
        
        setIsVerifying(false);
      }, 1000);
      
    } else {
      Alert.alert('Error', 'Please enter the complete 4-digit code');
    }
  };

  const handleResendCode = () => {
    if (canResend) {
      setTimeLeft(60);
      setCanResend(false);
      setCode(['', '', '', '']);
      inputRefs[0].current?.focus();
      
      // Here you would typically resend the verification code
      Alert.alert('Code Sent', 'A new verification code has been sent to your phone.');
    }
  };

  const handleBack = () => {
    router.back();
  };

  if (!fontsLoaded) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={handleBack}>
        <Text style={styles.backButtonText}>‹ Back</Text>
      </TouchableOpacity>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Verification Image */}
        <View style={styles.imageContainer}>
          <Image 
            source={require('@/assets/images/verify.png')} 
            style={styles.verifyImage} 
            resizeMode="contain" 
          />
        </View>

        {/* Title */}
        <Text style={styles.title}>Verify Your Phone</Text>

        {/* Subtitle with phone number */}
        <Text style={styles.subtitle}>
          Please enter the 4 digit code sent to{'\n'}
          <Text style={styles.phoneNumberText}>{phoneNumber}</Text>
        </Text>

        {/* Code Input Form */}
        <View style={styles.codeContainer}>
          {code.map((digit, index) => (
            <TextInput
              key={index}
              ref={inputRefs[index]}
              style={[
                styles.codeInput,
                digit && styles.codeInputFilled
              ]}
              value={digit}
              onChangeText={(text) => handleCodeChange(text, index)}
              onKeyPress={(e) => handleKeyPress(e, index)}
              keyboardType="number-pad"
              maxLength={1}
              textAlign="center"
              selectTextOnFocus
              editable={!isVerifying}
            />
          ))}
        </View>

        {/* Timer Countdown */}
        <Text style={styles.timerText}>
          {formatTime(timeLeft)}
        </Text>

        {/* Resend Code */}
        <TouchableOpacity 
          style={styles.resendContainer}
          onPress={handleResendCode}
          disabled={!canResend || isVerifying}
        >
          <Text style={[
            styles.resendText,
            (!canResend || isVerifying) && styles.resendTextDisabled
          ]}>
            Didn't receive the code?{' '}
            <Text style={[
              styles.resendLink,
              (!canResend || isVerifying) && styles.resendLinkDisabled
            ]}>
              Resend
            </Text>
          </Text>
        </TouchableOpacity>

        {/* Verify Button */}
        <TouchableOpacity
          style={[
            styles.verifyButton,
            code.every(digit => digit !== '') && !isVerifying 
              ? styles.verifyButtonActive 
              : styles.verifyButtonInactive
          ]}
          onPress={handleVerify}
          disabled={!code.every(digit => digit !== '') || isVerifying}
        >
          <Text style={styles.verifyButtonText}>
            {isVerifying ? 'Verifying...' : 'Verify'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  backButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 30,
    left: 20,
    zIndex: 10,
    justifyContent: 'center',
    alignItems: 'center',
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
    paddingTop: 100,
    paddingBottom: 40,
  },
  imageContainer: {
    width: 200,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  verifyImage: {
    width: 200,
    height: 200,
  },
  title: {
    width: 374,
    height: 34,
    fontFamily: 'Poppins-Medium',
    fontWeight: '500',
    fontSize: 28,
    lineHeight: 34,
    letterSpacing: 0,
    textAlign: 'center',
    color: '#040525',
    marginBottom: 16,
  },
  subtitle: {
    fontFamily: 'Poppins-Regular',
    fontSize: 16,
    lineHeight: 22,
    letterSpacing: 0,
    textAlign: 'center',
    color: '#88879C',
    marginBottom: 40,
    maxWidth: 300,
  },
  phoneNumberText: {
    fontFamily: 'Poppins-Medium',
    color: '#007AFF',
    fontWeight: '500',
  },
  codeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '90%',
    maxWidth: 280,
    marginBottom: 30,
    gap: 12,
  },
  codeInput: {
    flex: 1,
    height: 60,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    fontFamily: 'Poppins-Medium',
    fontSize: 24,
    color: '#040525',
  },
  codeInputFilled: {
    borderColor: '#007AFF',
    backgroundColor: '#F0F8FF',
  },
  timerText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 18,
    color: '#007AFF',
    marginBottom: 20,
  },
  resendContainer: {
    marginBottom: 40,
  },
  resendText: {
    fontFamily: 'Poppins-Medium',
    fontWeight: '500',
    fontSize: 14,
    lineHeight: 14,
    letterSpacing: 0,
    textAlign: 'center',
    color: '#88879C',
  },
  resendTextDisabled: {
    opacity: 0.5,
  },
  resendLink: {
    color: '#007AFF',
  },
  resendLinkDisabled: {
    color: '#88879C',
  },
  verifyButton: {
    width: '90%',
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
  },
  verifyButtonActive: {
    backgroundColor: '#007AFF',
  },
  verifyButtonInactive: {
    backgroundColor: '#E0E0E0',
  },
  verifyButtonText: {
    fontFamily: 'Poppins-Medium',
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 16,
    letterSpacing: 0,
    textAlign: 'center',
    color: '#FFFFFF',
  },
});