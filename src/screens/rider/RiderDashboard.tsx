import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../../redux/store';
import { fetchRiderProfile } from '../../redux/sagas/profile/riderProfileAction';
import { goOnline } from '../../redux/sagas/rider/goOnlineAction';
import { resetGoOnline } from '../../redux/slices/goOnlineSlice';
import { goOffline } from '../../redux/sagas/rider/goOfflineAction';
import { resetGoOffline } from '../../redux/slices/goOfflineSlice';
import { Platform, PermissionsAndroid, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiRequest, RIDER_BASE_URL } from '../../config/api.config';
import API_ENDPOINTS from '../../config/api.config';

const ONLINE_PREF_KEY = 'rider_online_pref';
import Geolocation from 'react-native-geolocation-service';
import {
  View,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  Switch,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { Colors } from '../../theme/theme';
import RiderOnlineScreen from './RiderOnlineScreen';
import RiderOfflineScreen from './RiderOfflineScreen';
import RiderTripsScreen from './RiderTripsScreen';
import RiderEarningsScreen from './RiderEarningsScreen';
import RiderProfileScreen from './RiderProfileScreen';
import { fetchRiderHome } from '../../redux/sagas/rider/riderHomeAction';
import AppHeader from '../../components/AppHeader';
import DocVerificationPopup from '../../components/DocVerificationPopup';
import OngoingDeliveryBanner from '../../components/OngoingDeliveryBanner';
import { fetchRiderActive } from '../../redux/sagas/rider/riderActiveAction';
import { getNotifications } from '../../redux/sagas/notifications/riderNotificationsAction';
import messaging from '@react-native-firebase/messaging';
import { getFCMToken } from '../../utils/fcm';
import {
  resetRiderActive,
  setSkipRestore,
} from '../../redux/slices/riderActiveSlice';

type RiderDashboardProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'RiderDashboard'>;
  route: import('@react-navigation/native').RouteProp<
    RootStackParamList,
    'RiderDashboard'
  >;
};

type TabName = 'Home' | 'Trips' | 'Earnings' | 'Profile';

const TAB_ITEMS: TabName[] = ['Home', 'Trips', 'Earnings', 'Profile'];

// ══════════════════════════════════════════════════════════════════════════

const RiderDashboard: React.FC<RiderDashboardProps> = ({
  navigation,
  route,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const {
    loading: goingOnline,
    success: goOnlineSuccess,
    error: goOnlineError,
  } = useSelector((state: RootState) => state.goOnline);
  const {
    loading: goingOffline,
    success: goOfflineSuccess,
    error: goOfflineError,
  } = useSelector((state: RootState) => state.goOffline);
  const skipRestore = useSelector(
    (state: RootState) => state.riderActive.skipRestore,
  );
  const { data: homeData } = useSelector(
    (state: RootState) =>
      state.riderHome as {
        data: import('../../redux/slices/riderHomeSlice').RiderHomeData | null;
        loading: boolean;
        error: string | null;
        success: boolean;
      },
  );
  const cancelledBooking = useSelector(
    (state: RootState) => state.riderActive.data?.cancelled ?? null,
  );
  const riderActiveData = useSelector(
    (state: RootState) => state.riderActive.data,
  );
  const unreadCount = useSelector(
    (state: RootState) => state.notifications.unreadCount,
  );

  const serverIsOnline = homeData?.isOnline ?? false;
  const isOnline = serverIsOnline && !userChosenOffline;
  const isApproved = homeData?.isApproved ?? true;

  const [docPopupDismissed, setDocPopupDismissed] = useState(false);
  const handleDocPopupDismiss = () => setDocPopupDismissed(true);

  const [userChosenOffline, setUserChosenOffline] = useState(false);
  const [offlinePrefLoaded, setOfflinePrefLoaded] = useState(false);

  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const cancelledBookingIdRef = useRef<string | null>(null);
  const goOnlineIntervalRef = useRef<ReturnType<typeof setInterval> | null>(
    null,
  );
  const cachedFcmTokenRef = useRef<string | null>(null);
  // true only when user manually pressed the toggle — heartbeat sets it false
  const goOnlineManualRef = useRef(false);
  const sessionRestoredRef = useRef(false);

  // Load persisted offline preference before any server data arrives
  useEffect(() => {
    AsyncStorage.getItem(ONLINE_PREF_KEY).then(pref => {
      if (pref === 'offline') setUserChosenOffline(true);
      setOfflinePrefLoaded(true);
    });
  }, []);

  // If server says online but user explicitly chose offline, sync server back to offline
  useEffect(() => {
    if (!offlinePrefLoaded) return;
    if (serverIsOnline && userChosenOffline) {
      dispatch(goOffline());
    }
  }, [serverIsOnline, offlinePrefLoaded]);

  useEffect(() => {
    const getLocation = async () => {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        );

        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          console.log('Permission denied');
          return;
        }
      }

      Geolocation.getCurrentPosition(
        position => {
          console.log('Initial Location:', position);
        },
        error => {
          console.log('Initial Location Error:', error);
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 10000,
        },
      );
    };

    getLocation();
  }, []);
  // Poll fetchRiderActive every 10s while online — fallback when FCM is not delivered
  useEffect(() => {
    if (isOnline) {
      dispatch(fetchRiderActive());
      pollRef.current = setInterval(() => {
        dispatch(fetchRiderActive());
      }, 10000);
    } else {
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
    }
    return () => {
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
    };
  }, [isOnline]);

  // Repeat goOnline every 10s while online to keep location fresh on server
  useEffect(() => {
    if (isOnline) {
      // Cache FCM token once — avoids blocking permission dialogs inside the interval
      getFCMToken()
        .catch(() => null)
        .then(token => {
          cachedFcmTokenRef.current = token;
        });

      goOnlineIntervalRef.current = setInterval(() => {
        const fcmToken = cachedFcmTokenRef.current;
        goOnlineManualRef.current = false; // heartbeat — suppress error alerts
        Geolocation.getCurrentPosition(
          pos => {
            dispatch(
              goOnline({
                lat: pos.coords.latitude,
                lng: pos.coords.longitude,
                ...(fcmToken ? { fcmToken } : {}),
              }),
            );
          },
          () => {
            Geolocation.getCurrentPosition(
              pos => {
                dispatch(
                  goOnline({
                    lat: pos.coords.latitude,
                    lng: pos.coords.longitude,
                    ...(fcmToken ? { fcmToken } : {}),
                  }),
                );
              },
              err => console.log('[goOnline heartbeat] location error:', err),
              { enableHighAccuracy: false, timeout: 20000, maximumAge: 120000 },
            );
          },
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
        );
      }, 10000);
    } else {
      if (goOnlineIntervalRef.current) {
        clearInterval(goOnlineIntervalRef.current);
        goOnlineIntervalRef.current = null;
      }
    }
    return () => {
      if (goOnlineIntervalRef.current) {
        clearInterval(goOnlineIntervalRef.current);
        goOnlineIntervalRef.current = null;
      }
    };
  }, [isOnline]);

  // After go-online succeeds, re-fetch home so isOnline updates from API
  useEffect(() => {
    if (goOnlineSuccess) {
      dispatch(resetGoOnline());
      dispatch(fetchRiderHome());
    }
  }, [goOnlineSuccess]);

  // Show error only when the user manually pressed the toggle (not for heartbeat failures)
  useEffect(() => {
    if (goOnlineError) {
      if (goOnlineManualRef.current) {
        Alert.alert('Failed to go online', goOnlineError);
      }
      goOnlineManualRef.current = false;
      dispatch(resetGoOnline());
    }
  }, [goOnlineError]);

  // After go-offline succeeds, re-fetch home
  useEffect(() => {
    if (goOfflineSuccess) {
      dispatch(resetGoOffline());
      dispatch(fetchRiderHome());
    }
  }, [goOfflineSuccess]);

  useEffect(() => {
    if (goOfflineError) {
      Alert.alert('Failed to go offline', goOfflineError);
      dispatch(resetGoOffline());
    }
  }, [goOfflineError]);

  useEffect(() => {
    if (
      cancelledBooking &&
      cancelledBooking._id !== cancelledBookingIdRef.current
    ) {
      cancelledBookingIdRef.current = cancelledBooking._id;
      dispatch(resetRiderActive());
      navigation.navigate('RiderBookingCancelled', {
        cancelled: cancelledBooking,
      });
    }
  }, [cancelledBooking]);

  const handleGoOnline = async () => {
    try {
      // Always fetch fresh approval status from server before going online
      const homeResponse = await apiRequest<any>(
        API_ENDPOINTS.RIDER_HOME,
        { method: 'GET' },
        RIDER_BASE_URL,
      );
      dispatch(fetchRiderHome()); // sync Redux store with fresh data
      if (!homeResponse.data?.isApproved) {
        Alert.alert('Approval Pending', 'Your account is under review. You can go online once approved.');
        return;
      }
    } catch {
      // If home API fails, fall back to cached value
      if (!isApproved) {
        Alert.alert('Approval Pending', 'Your account is under review. You can go online once approved.');
        return;
      }
    }

    // Clear offline preference — must happen before goOnline so the sync effect
    // doesn't see userChosenOffline=true when serverIsOnline flips to true
    setUserChosenOffline(false);
    await AsyncStorage.setItem(ONLINE_PREF_KEY, 'online');
    try {
      goOnlineManualRef.current = true; // user pressed toggle — show error if it fails
      const fcmToken = await getFCMToken().catch(() => null);

      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        );
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          Alert.alert(
            'Permission Denied',
            'Location permission is required to go online.',
          );
          return;
        }
      }

      Geolocation.getCurrentPosition(
        pos => {
          dispatch(
            goOnline({
              lat: pos.coords.latitude,
              lng: pos.coords.longitude,
              ...(fcmToken ? { fcmToken } : {}),
            }),
          );
        },
        error => {
          console.log('GPS Error:', error.code, error.message);
          Geolocation.getCurrentPosition(
            pos => {
              dispatch(
                goOnline({
                  lat: pos.coords.latitude,
                  lng: pos.coords.longitude,
                  ...(fcmToken ? { fcmToken } : {}),
                }),
              );
            },
            () => {
              Alert.alert(
                'Location Error',
                'Location nahi mili. GPS on hai? Please try again.',
              );
            },
            { enableHighAccuracy: false, timeout: 20000, maximumAge: 120000 },
          );
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
      );
    } catch (err) {
      console.log('handleGoOnline ERROR:', err);
      Alert.alert('Error', 'Something went wrong.');
    }
  };

  const handleToggle = (value: boolean) => {
    if (value) {
      handleGoOnline();
    } else {
      setUserChosenOffline(true);
      AsyncStorage.setItem(ONLINE_PREF_KEY, 'offline');
      dispatch(goOffline());
    }
  };

  useEffect(() => {
    dispatch(getNotifications());
    const unsubscribeForeground = messaging().onMessage(_msg => {
      console.log('[RiderDashboard] FCM foreground — fetching active booking');
      dispatch(getNotifications());
      dispatch(fetchRiderActive());
    });
    const unsubscribeBackground = messaging().onNotificationOpenedApp(() => {
      dispatch(getNotifications());
      dispatch(fetchRiderActive());
    });

    messaging()
      .getInitialNotification()
      .then(remoteMessage => {
        if (remoteMessage) {
          dispatch(getNotifications());
          dispatch(fetchRiderActive());
        }
      });

    return () => {
      unsubscribeForeground();
      unsubscribeBackground();
    };
  }, [dispatch]);

  const [activeTab, setActiveTab] = useState<TabName>('Home');

  useEffect(() => {
    dispatch(fetchRiderHome());
    dispatch(fetchRiderActive());
  }, []);

  // RiderDashboard.tsx

const skipRestoreRef = useRef(false);
skipRestoreRef.current = skipRestore;

// Restore effect mein ref se check karo
useEffect(() => {
  console.log('[RESTORE] skipRestoreRef:', skipRestoreRef.current);
  console.log('[RESTORE] booking status:', riderActiveData?.booking?.status);
  
  if (skipRestoreRef.current) return;
  
  const booking = riderActiveData?.booking;
  if (!booking) return;

  const status = booking.status;
  if (status === 'assigned') {
    navigation.navigate('GoingToPickup');
  } else if (status === 'arrived_at_pickup' || status === 'in_transit') {
    navigation.navigate('DeliveringParcel');
  }
}, [riderActiveData]);

  useEffect(() => {
    if (activeTab === 'Profile') dispatch(fetchRiderProfile());
  }, [activeTab]);

  const handleTabPress = (tab: TabName) => setActiveTab(tab);

  // ── Render ─────────────────────────────────────────────────────────────

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.secondary} />

      <DocVerificationPopup
        visible={!docPopupDismissed && homeData != null && !homeData.isApproved}
        onDismiss={handleDocPopupDismiss}
        rejectionReason={homeData?.rejectionReason}
      />

      {activeTab === 'Home' && (
        <View style={styles.content}>
          <AppHeader
            name={homeData?.name ?? undefined}
            subtitle="Aap Hi Transpport Ho"
            showBell
            hasUnread={unreadCount > 0}
            onBellPress={() => navigation.navigate('Notifications')}
          />
          <View
            style={[
              styles.bannerWrapper,
              isOnline && styles.bannerWrapperOnline,
            ]}
          >
            <View style={[styles.banner, isOnline && styles.bannerOnline]}>
              <View style={styles.bannerText}>
                <Text
                  style={[
                    styles.bannerTitle,
                    isOnline && styles.bannerTitleOnline,
                  ]}
                >
                  {isOnline ? "🟢  You're Online" : "You're Offline"}
                </Text>
                <Text style={styles.bannerSub}>
                  {isOnline
                    ? 'Accepting delivery requests'
                    : !isApproved
                      ? 'Account pending approval — cannot go online'
                      : "You won't receive delivery requests"}
                </Text>
              </View>
              {goingOnline || goingOffline ? (
                <ActivityIndicator
                  size="small"
                  color="#22C55E"
                  style={{ marginRight: 4 }}
                />
              ) : (
                <Switch
                  value={isOnline}
                  onValueChange={handleToggle}
                  disabled={goingOnline || goingOffline || !isApproved}
                  trackColor={{ false: '#CCCCCC', true: '#22C55E' }}
                  thumbColor={Colors.white}
                />
              )}
            </View>
          </View>

          {isOnline ? (
            <RiderOnlineScreen navigation={navigation} />
          ) : (
            <RiderOfflineScreen
              onGoOnline={handleGoOnline}
              todaySummary={homeData?.todaySummary}
            />
          )}
        </View>
      )}

      {activeTab === 'Trips' && (
        <RiderTripsScreen navigation={navigation as any} />
      )}
      {activeTab === 'Earnings' && (
        <RiderEarningsScreen navigation={navigation as any} />
      )}
      {activeTab === 'Profile' && (
        <RiderProfileScreen />
      )}

      {/* Ongoing Delivery Banner — visible on all tabs */}
      {(() => {
        const booking = riderActiveData?.booking;
        const status = booking?.status;
        if (
          !booking ||
          !['assigned', 'arrived_at_pickup', 'in_transit'].includes(
            status ?? '',
          )
        )
          return null;
        return (
          <OngoingDeliveryBanner
            pickup={booking.pickupLocation?.address ?? ''}
            dropoff={booking.dropoffLocation?.address ?? ''}
            distanceKm={riderActiveData?.distanceKm}
            etaMinutes={riderActiveData?.etaMinutes}
            onPress={() => {
              if (status === 'assigned') navigation.navigate('GoingToPickup');
              else navigation.navigate('DeliveringParcel');
            }}
          />
        );
      })()}

      {/* Tab Bar */}
      <View style={styles.tabBar}>
        {TAB_ITEMS.map(tab => (
          <TouchableOpacity
            key={tab}
            style={styles.tabItem}
            onPress={() => handleTabPress(tab)}
            activeOpacity={0.7}
          >
            {tab === 'Home' ? (
              <Image
                source={require('../../assets/icons/riderHome.png')}
                style={{
                  width: 22,
                  height: 22,
                  tintColor:
                    activeTab === 'Home' ? Colors.primary : Colors.textGray,
                  resizeMode: 'contain',
                }}
              />
            ) : tab === 'Trips' ? (
              <Image
                source={require('../../assets/icons/trips.png')}
                style={{
                  width: 22,
                  height: 22,
                  tintColor:
                    activeTab === 'Trips' ? Colors.primary : Colors.textGray,
                  resizeMode: 'contain',
                }}
              />
            ) : tab === 'Earnings' ? (
              <Image
                source={require('../../assets/icons/wallet.png')}
                style={{
                  width: 22,
                  height: 22,
                  tintColor:
                    activeTab === 'Earnings' ? Colors.primary : Colors.textGray,
                  resizeMode: 'contain',
                }}
              />
            ) : (
              <Image
                source={require('../../assets/icons/person.png')}
                style={{
                  width: 22,
                  height: 22,
                  tintColor:
                    activeTab === 'Profile' ? Colors.primary : Colors.textGray,
                  resizeMode: 'contain',
                }}
              />
            )}
            <Text
              style={[
                styles.tabLabel,
                activeTab === tab && styles.tabLabelActive,
              ]}
            >
              {tab}
            </Text>
            {activeTab === tab && <View style={styles.tabActiveBar} />}
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },
  content: { flex: 1 },

  bannerWrapper: {
    marginHorizontal: 16,
    marginTop: 14,
    marginBottom: 4,
    borderRadius: 10,
    overflow: 'hidden',
  },
  bannerWrapperOnline: { borderRadius: 10 },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bannerOnline: { borderColor: '#22C55E' },
  bannerText: { flex: 1, marginRight: 10 },
  bannerTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.primary,
    marginBottom: 2,
  },
  bannerTitleOnline: { color: '#16A34A' },
  bannerSub: { fontSize: 12, color: Colors.textGray },

  // ── Tab Bar ───────────────────────────────────────────────────────────
  tabBar: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.borderGray,
    paddingBottom: 4,
    paddingTop: 8,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    position: 'relative',
  },
  tabLabel: { fontSize: 11, color: Colors.textGray, fontWeight: '500' },
  tabLabelActive: { color: Colors.primary, fontWeight: '700' },
  tabActiveBar: {
    position: 'absolute',
    bottom: -8,
    width: 24,
    height: 3,
    backgroundColor: Colors.primary,
    borderRadius: 2,
  },
});

export default RiderDashboard;
