// context/ThemeContext.tsx
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme } from 'react-native';

interface ThemeContextType {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  setDarkMode: (value: boolean) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load saved theme preference
  useEffect(() => {
    const loadThemePreference = async () => {
      try {
        console.log('🎨 Loading theme preference...');
        const savedTheme = await AsyncStorage.getItem('darkModeEnabled');
        console.log('🎨 Saved theme from storage:', savedTheme);
        
        if (savedTheme !== null) {
          setIsDarkMode(savedTheme === 'true');
        } else {
          // If no saved preference, use system preference
          setIsDarkMode(systemColorScheme === 'dark');
          // Save system preference
          await AsyncStorage.setItem('darkModeEnabled', (systemColorScheme === 'dark').toString());
        }
      } catch (error) {
        console.error('Error loading theme preference:', error);
        // Fallback to system preference
        setIsDarkMode(systemColorScheme === 'dark');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadThemePreference();
  }, [systemColorScheme]);

  const toggleDarkMode = async () => {
    const newValue = !isDarkMode;
    console.log('🎨 Toggling dark mode to:', newValue);
    setIsDarkMode(newValue);
    try {
      await AsyncStorage.setItem('darkModeEnabled', newValue.toString());
      console.log('🎨 Dark mode preference saved');
    } catch (error) {
      console.error('Error saving theme preference:', error);
    }
  };

  const setDarkMode = async (value: boolean) => {
    console.log('🎨 Setting dark mode to:', value);
    setIsDarkMode(value);
    try {
      await AsyncStorage.setItem('darkModeEnabled', value.toString());
      console.log('🎨 Dark mode preference saved');
    } catch (error) {
      console.error('Error saving theme preference:', error);
    }
  };

  if (isLoading) {
    // You can return a loading indicator here if needed
    return null;
  }

  return (
    <ThemeContext.Provider
      value={{
        isDarkMode,
        toggleDarkMode,
        setDarkMode,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};