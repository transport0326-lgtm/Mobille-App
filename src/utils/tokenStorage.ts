import AsyncStorage from '@react-native-async-storage/async-storage';
import { setAuthToken } from '../config/api.config';

const TOKEN_KEY     = 'authToken';
const ROLE_KEY      = 'userRole';
const TIMESTAMP_KEY = 'loginTimestamp';

/** Persist token to AsyncStorage and load it into the in-memory api.config slot. */
export const saveToken = async (token: string): Promise<void> => {
  await AsyncStorage.setItem(TOKEN_KEY, token);
  setAuthToken(token);
};

/** Read token from AsyncStorage and restore it to the in-memory slot. */
export const loadToken = async (): Promise<string | null> => {
  const token = await AsyncStorage.getItem(TOKEN_KEY);

  if (token) {
    setAuthToken(token);
  } else {
    setAuthToken(null);
  }

  return token;
};

/** Remove token from AsyncStorage and clear the in-memory slot. */
export const clearToken = async (): Promise<void> => {
  await AsyncStorage.multiRemove([TOKEN_KEY, ROLE_KEY, TIMESTAMP_KEY]);
  setAuthToken(null);
};

export const saveLoginTimestamp = async (): Promise<void> => {
  await AsyncStorage.setItem(TIMESTAMP_KEY, Date.now().toString());
};

export const loadLoginTimestamp = async (): Promise<string | null> => {
  return AsyncStorage.getItem(TIMESTAMP_KEY);
};

export const saveRole = async (role: string): Promise<void> => {
  await AsyncStorage.setItem(ROLE_KEY, role);
};

export const loadRole = async (): Promise<string | null> => {
  return AsyncStorage.getItem(ROLE_KEY);
};

const ACTIVE_BOOKING_KEY = 'activeBookingId';

export const saveActiveBooking = async (bookingId: string): Promise<void> => {
  await AsyncStorage.setItem(ACTIVE_BOOKING_KEY, bookingId);
};

export const loadActiveBooking = async (): Promise<string | null> => {
  return AsyncStorage.getItem(ACTIVE_BOOKING_KEY);
};

export const clearActiveBooking = async (): Promise<void> => {
  await AsyncStorage.removeItem(ACTIVE_BOOKING_KEY);
};
