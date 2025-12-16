// app/utils/authUtils.ts
import { Alert } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../context/AuthContext';

export const requireAuth = (
  isAuthenticated: boolean,
  actionName: string,
  onSuccess: () => void
): boolean => {
  if (!isAuthenticated) {
    Alert.alert(
      'Sign In Required',
      `To ${actionName}, please sign in or create an account.`,
      [
        {
          text: 'Not Now',
          style: 'cancel',
        },
        {
          text: 'Sign In',
          style: 'default',
          onPress: () => {
            router.push('/Screen4');
          },
        },
      ]
    );
    return false;
  }
  
  onSuccess();
  return true;
};