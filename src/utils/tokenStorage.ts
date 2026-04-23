import AsyncStorage from '@react-native-async-storage/async-storage';
import { setAuthToken } from '../config/api.config';

const TOKEN_KEY = 'authToken';

/** Persist token to AsyncStorage and load it into the in-memory api.config slot. */
export const saveToken = async (token: string): Promise<void> => {
  await AsyncStorage.setItem(TOKEN_KEY, token);
  setAuthToken(token);
};

/** Read token from AsyncStorage and restore it to the in-memory slot. */
export const loadToken = async (): Promise<string | null> => {
  const token = await AsyncStorage.getItem(TOKEN_KEY);
  setAuthToken(token);
  return token;
};

/** Remove token from AsyncStorage and clear the in-memory slot. */
export const clearToken = async (): Promise<void> => {
  await AsyncStorage.removeItem(TOKEN_KEY);
  setAuthToken(null);
};
