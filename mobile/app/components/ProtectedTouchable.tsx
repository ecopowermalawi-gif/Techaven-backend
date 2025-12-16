import React from 'react';
import { TouchableOpacity, TouchableOpacityProps, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../context/AuthContext';

interface ProtectedTouchableProps extends TouchableOpacityProps {
  onProtectedPress: () => void;
  actionName?: string;
  children: React.ReactNode;
}

export const ProtectedTouchable: React.FC<ProtectedTouchableProps> = ({
  onProtectedPress,
  actionName = 'perform this action',
  children,
  ...touchableProps
}) => {
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  const handlePress = () => {
    if (!isAuthenticated) {
      // Show alert first
      Alert.alert(
        'Authentication Required',
        `Please sign up or log in to ${actionName}.`,
        [
          {
            text: 'Cancel',
            style: 'cancel',
            onPress: () => console.log('Cancel pressed')
          },
          {
            text: 'Sign Up / Login',
            style: 'default',
            onPress: () => {
              // Navigate to Screen4 after user presses "Sign Up / Login"
              router.push('/Screen4');
            }
          }
        ],
        { cancelable: true }
      );
    } else {
      // User is authenticated, proceed with the action
      onProtectedPress();
    }
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.7}
      {...touchableProps}
    >
      {children}
    </TouchableOpacity>
  );
};