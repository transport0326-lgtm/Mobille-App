import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../../redux/store';
import { fetchRiderProfile } from '../../redux/sagas/profile/riderProfileAction';
import { goOnline } from '../../redux/sagas/rider/goOnlineAction';
import { resetGoOnline } from '../../redux/slices/goOnlineSlice';
import { goOffline } from '../../redux/sagas/rider/goOfflineAction';
import { resetGoOffline } from '../../redux/slices/goOfflineSlice';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { Platform, PermissionsAndroid, Image } from 'react-native';
import Geolocation from '@react-native-community/geolocation';
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
import { fetchRiderActive } from '../../redux/sagas/rider/riderActiveAction';
import { getNotifications } from '../../redux/sagas/notifications/riderNotificationsAction';
import messaging from '@react-native-firebase/messaging';
import { getFCMToken } from '../../utils/fcm';

type RiderDashboardProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'RiderDashboard'>;
};

type TabName = 'Home' | 'Trips' | 'Earnings' | 'Profile';

const TAB_ITEMS: TabName[] = ['Home', 'Trips', 'Earnings', 'Profile'];

Geolocation.setRNConfiguration({
  skipPermissionRequests: false,
  authorizationLevel: 'whenInUse',
  locationProvider: 'auto',
});

// ══════════════════════════════════════════════════════════════════════════

const RiderDashboard: React.FC<RiderDashboardProps> = ({ navigation }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { loading: goingOnline, success: goOnlineSuccess, error: goOnlineError } =
    useSelector((state: RootState) => state.goOnline);
  const { loading: goingOffline, success: goOfflineSuccess, error: goOfflineError } =
    useSelector((state: RootState) => state.goOffline);
  const { data: homeData } = useSelector((state: RootState) => state.riderHome as { data: import('../../redux/slices/riderHomeSlice').RiderHomeData | null; loading: boolean; error: string | null; success: boolean });

  const isOnline = homeData?.isOnline ?? false;
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Poll fetchRiderActive every 10s while online — fallback when FCM is not delivered
  useEffect(() => {
    if (isOnline) {
      dispatch(fetchRiderActive());
      pollRef.current = setInterval(() => {
        dispatch(fetchRiderActive());
      }, 10000);
    } else {
      if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
    }
    return () => {
      if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
    };
  }, [isOnline]);

  // After go-online succeeds, re-fetch home so isOnline updates from API
  useEffect(() => {
    if (goOnlineSuccess) {
      dispatch(resetGoOnline());
      dispatch(fetchRiderHome());
    }
  }, [goOnlineSuccess]);

  // Show error if go-online fails
  useEffect(() => {
    if (goOnlineError) {
      Alert.alert('Failed to go online', goOnlineError);
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

  const handleGoOnline = async () => {
    try {
      const fcmToken = await getFCMToken().catch(() => null);

      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        );
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          Alert.alert('Permission Denied', 'Location permission is required to go online.');
          return;
        }
      }

      Geolocation.getCurrentPosition(
        pos => {
          dispatch(goOnline({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            ...(fcmToken ? { fcmToken } : {}),
          }));
        },
        error => {
          console.log('GPS Error:', error.code, error.message);
          Geolocation.getCurrentPosition(
            pos => {
              dispatch(goOnline({
                lat: pos.coords.latitude,
                lng: pos.coords.longitude,
                ...(fcmToken ? { fcmToken } : {}),
              }));
            },
            () => {
              Alert.alert('Location Error', 'Location nahi mili. GPS on hai? Please try again.');
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
    if (value) handleGoOnline();
    else dispatch(goOffline());
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

    messaging().getInitialNotification().then(remoteMessage => {
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
  }, []);

  // useEffect(() => {
  //   dispatch(fetchRiderActive());
  // }, []);

  useEffect(() => {
    if (activeTab === 'Profile') dispatch(fetchRiderProfile());
  }, [activeTab]);

  const handleTabPress = (tab: TabName) => setActiveTab(tab);

  // ── Render ─────────────────────────────────────────────────────────────

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.secondary} />

      {activeTab === 'Home' && (
        <View style={styles.content}>
          <AppHeader
            name={homeData?.name ?? undefined}
            subtitle="Aap Hi Transpport Ho"
            showBell
            onBellPress={() => navigation.navigate('Notifications')}
          />
          <View style={[styles.bannerWrapper, isOnline && styles.bannerWrapperOnline]}>
            <View style={[styles.banner, isOnline && styles.bannerOnline]}>
              <View style={styles.bannerText}>
                <Text style={[styles.bannerTitle, isOnline && styles.bannerTitleOnline]}>
                  {isOnline ? "🟢  You're Online" : "You're Offline"}
                </Text>
                <Text style={styles.bannerSub}>
                  {isOnline ? 'Accepting delivery requests' : "You won't receive delivery requests"}
                </Text>
              </View>
              {(goingOnline || goingOffline)
                ? <ActivityIndicator size="small" color="#22C55E" style={{ marginRight: 4 }} />
                : <Switch
                  value={isOnline}
                  onValueChange={handleToggle}
                  disabled={goingOnline || goingOffline}
                  trackColor={{ false: '#CCCCCC', true: '#22C55E' }}
                  thumbColor={Colors.white}
                />
              }
            </View>
          </View>

          {isOnline
            ? <RiderOnlineScreen navigation={navigation} />
            : <RiderOfflineScreen onGoOnline={handleGoOnline} todaySummary={homeData?.todaySummary} />
          }
        </View>
      )}

      {activeTab === 'Trips' && <RiderTripsScreen navigation={navigation as any} />}
      {activeTab === 'Earnings' && <RiderEarningsScreen navigation={navigation as any} />}
      {activeTab === 'Profile' && <RiderProfileScreen navigation={navigation as any} />}

      {/* Tab Bar */}
      <View style={styles.tabBar}>
        {TAB_ITEMS.map(tab => (
          <TouchableOpacity
            key={tab}
            style={styles.tabItem}
            onPress={() => handleTabPress(tab)}
            activeOpacity={0.7}>
            {tab === 'Home'
              ? <Image
                source={require('../../assets/icons/riderHome.png')}
                style={{
                  width: 22,
                  height: 22,
                  tintColor: activeTab === 'Home' ? Colors.primary : Colors.textGray,
                  resizeMode: 'contain'
                }}
              />
              : tab === 'Trips'
                ? <Image
                  source={require('../../assets/icons/trips.png')}
                  style={{
                    width: 22,
                    height: 22,
                    tintColor: activeTab === 'Trips' ? Colors.primary : Colors.textGray,
                    resizeMode: 'contain'
                  }}
                />
                : tab === 'Earnings'
                  ? <Image
                    source={require('../../assets/icons/wallet.png')}
                    style={{
                      width: 22,
                      height: 22,
                      tintColor: activeTab === 'Earnings' ? Colors.primary : Colors.textGray,
                      resizeMode: 'contain'
                    }}
                  />
                  : <Image
                    source={require('../../assets/icons/person.png')}
                    style={{
                      width: 22,
                      height: 22,
                      tintColor: activeTab === 'Profile' ? Colors.primary : Colors.textGray,
                      resizeMode: 'contain'
                    }}
                  />}
            <Text style={[styles.tabLabel, activeTab === tab && styles.tabLabelActive]}>
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

  bannerWrapper: { marginHorizontal: 16, marginTop: 14, marginBottom: 4, borderRadius: 10, overflow: 'hidden' },
  bannerWrapperOnline: { borderRadius: 10 },
  banner: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  bannerOnline: { borderColor: '#22C55E' },
  bannerText: { flex: 1, marginRight: 10 },
  bannerTitle: { fontSize: 15, fontWeight: '800', color: Colors.primary, marginBottom: 2 },
  bannerTitleOnline: { color: '#16A34A' },
  bannerSub: { fontSize: 12, color: Colors.textGray },

  // ── Tab Bar ───────────────────────────────────────────────────────────
  tabBar: {
    flexDirection: 'row', backgroundColor: Colors.white,
    borderTopWidth: 1, borderTopColor: Colors.borderGray,
    paddingBottom: 4, paddingTop: 8,
    elevation: 10, shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 }, shadowOpacity: 0.08, shadowRadius: 6,
  },
  tabItem: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 3, position: 'relative' },
  tabLabel: { fontSize: 11, color: Colors.textGray, fontWeight: '500' },
  tabLabelActive: { color: Colors.primary, fontWeight: '700' },
  tabActiveBar: { position: 'absolute', bottom: -8, width: 24, height: 3, backgroundColor: Colors.primary, borderRadius: 2 },
});

export default RiderDashboard;
