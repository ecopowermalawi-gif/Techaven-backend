// mobile/src/utils/network.js
import NetInfo from '@react-native-community/netinfo';
import { getBaseURL } from '../services/api';

export const checkNetworkConnection = async () => {
  try {
    const state = await NetInfo.fetch();
    return state.isConnected;
  } catch (error) {
    console.error('Error checking network:', error);
    return false;
  }
};

export const getNetworkInfo = async () => {
  return await NetInfo.fetch();
};

// Test backend connection
export const testBackendConnection = async () => {
  try {
    const response = await fetch(`${getBaseURL()}/api/products`);
    return {
      connected: response.ok,
      status: response.status,
      statusText: response.statusText,
    };
  } catch (error) {
    return {
      connected: false,
      error: error.message,
    };
  }
};

// Monitor network changes
export const monitorNetwork = (callback) => {
  return NetInfo.addEventListener(state => {
    callback(state);
  });
};