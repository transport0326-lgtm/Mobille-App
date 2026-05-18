import React, { useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  Animated,
  Dimensions,
  Easing,
  Image,
} from 'react-native';
import { Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { Colors } from '../../theme/theme';
import { useSelector, useDispatch } from 'react-redux';
import { trackBooking } from '../../redux/sagas/booking/trackBookingAction';
import {
  resetTrackBooking,
  resetCreateBooking,
  setCustomerSkipRestore,
} from '../../redux/slices/bookingSlice';
import { saveActiveBooking } from '../../utils/tokenStorage';
import Loader from '../../components/Loader';

const { width, height } = Dimensions.get('window');
const RADAR_HEIGHT = height * 0.4;
const CENTER_X = width / 2;
const CENTER_Y = RADAR_HEIGHT / 2;

type FindingRiderScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'FindingRider'>;
  route: RouteProp<RootStackParamList, 'FindingRider'>;
};

const RIDERS = [
  { angle: 200, distance: width * 0.3 },
  { angle: 40, distance: width * 0.28 },
  { angle: 310, distance: width * 0.22 },
  { angle: 150, distance: width * 0.18 },
];

const getPosition = (angle: number, distance: number) => {
  const rad = (angle * Math.PI) / 180;
  return {
    left: CENTER_X + distance * Math.cos(rad) - 18,
    top: CENTER_Y + distance * Math.sin(rad) - 18,
  };
};

const RippleWave: React.FC<{ delay: number }> = ({ delay }) => {
  const scale = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(scale, {
            toValue: 1,
            duration: 2600,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.sequence([
            Animated.timing(opacity, {
              toValue: 0.75,
              duration: 100,
              useNativeDriver: true,
            }),
            Animated.timing(opacity, {
              toValue: 0,
              duration: 2500,
              easing: Easing.out(Easing.ease),
              useNativeDriver: true,
            }),
          ]),
        ]),
        Animated.parallel([
          Animated.timing(scale, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
        ]),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, []);

  const SIZE = width * 0.88;

  return (
    <Animated.View
      style={{
        position: 'absolute',
        width: SIZE,
        height: SIZE,
        borderRadius: SIZE / 2,
        backgroundColor: '#E8897A',
        opacity,
        transform: [{ scale }],
      }}
    />
  );
};

const RiderDot: React.FC<{ left: number; top: number; delay: number }> = ({
  left,
  top,
  delay,
}) => {
  const bounce = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(bounce, {
          toValue: -5,
          duration: 600,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(bounce, {
          toValue: 0,
          duration: 600,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, []);

  return (
    <Animated.View
      style={[
        styles.riderDot,
        { left, top, transform: [{ translateY: bounce }] },
      ]}
    >
      <View style={styles.personIcon}>
        <View style={styles.personHead} />
        <View style={styles.personBody} />
      </View>
    </Animated.View>
  );
};

const FindingRiderScreen: React.FC<FindingRiderScreenProps> = ({
  navigation,
  route,
}) => {
  const { pickup, dropoff, bookingId } = route.params;
  const dispatch = useDispatch();
  const trackingData = useSelector(
    (state: any) => state.booking.trackBooking?.data,
  );
  const intervalRef = useRef<any>(null);
  const timeoutRef = useRef<any>(null);
  const hasNavigated = useRef(false);

  useEffect(() => {
    if (bookingId) saveActiveBooking(bookingId);
    dispatch(resetTrackBooking());

    timeoutRef.current = setTimeout(() => {
      if (!hasNavigated.current) {
        hasNavigated.current = true;
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        navigation.replace('NoRiders', { pickup, dropoff, bookingId });
      }
    }, 100000);

    return () => clearTimeout(timeoutRef.current);
  }, []);

  useEffect(() => {
    if (!bookingId) return;
    dispatch(trackBooking({ bookingId }));

    intervalRef.current = setInterval(() => {
      dispatch(trackBooking({ bookingId }));
    }, 5000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [bookingId]);

  useEffect(() => {
    if (!trackingData || hasNavigated.current) return;

    const status = trackingData?.booking?.status ?? '';
    const rider = trackingData?.rider ?? null;
    const b = trackingData?.booking ?? null;

    const stopTimers = () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };

    // assigned / going_to_pickup → BookingConfirmed
    if (
      rider &&
      (rider._id || rider.name) &&
      ['assigned', 'going_to_pickup'].includes(status)
    ) {
      hasNavigated.current = true;
      stopTimers();
      navigation.reset({
        index: 0,
        routes: [{ name: 'BookingConfirmed', params: { booking: b, rider } }],
      });
      return;
    }

    // arrived_at_pickup → ReviewBooking directly
    if (rider && (rider._id || rider.name) && status === 'arrived_at_pickup') {
      hasNavigated.current = true;
      stopTimers();
      navigation.reset({
        index: 0,
        routes: [
          {
            name: 'ReviewBooking',
            params: {
              pickup: b?.pickupLocation?.address || '',
              dropoff: b?.dropoffLocation?.address || '',
              vehicleType: b?.vehicleType || 'bike',
              receiverName: b?.receiverName || '',
              receiverPhone: b?.receiverPhone || '',
              pickupLat: b?.pickupLocation?.coordinates?.lat || 0,
              pickupLng: b?.pickupLocation?.coordinates?.lng || 0,
              dropoffLat: b?.dropoffLocation?.coordinates?.lat || 0,
              dropoffLng: b?.dropoffLocation?.coordinates?.lng || 0,
              bookingId: b?._id,
            },
          },
        ],
      });
      return;
    }

    // completed / delivered → BookingOTP
    if (['completed', 'delivered'].includes(status)) {
      hasNavigated.current = true;
      stopTimers();
      const fd = trackingData?.fareBreakdown;
      navigation.reset({
        index: 0,
        routes: [
          {
            name: 'BookingOTP',
            params: {
              otp: b?.deliveryOtp || '',
              bookingId: b?._id || '',
              pickup: b?.pickupLocation?.address || '',
              dropoff: b?.dropoffLocation?.address || '',
              vehicleType: b?.vehicleType || 'bike',
              distanceKm: fd?.distanceKm ?? trackingData?.distanceKm ?? 0,
              baseFare: fd?.baseFare ?? 0,
              ratePerKm: fd?.perKmRate ?? 0,
              platformFee: fd?.platformFee ?? b?.platformFee ?? 0,
              total: fd?.totalAmount ?? b?.fare ?? 0,
              riderName: rider?.name,
              vehicleNumber: rider?.vehicleNumber,
              bookingNumber: b?.bookingNumber,
            },
          },
        ],
      });
      return;
    }

    // cancelled → route based on cancelledBy
    if (status === 'cancelled') {
      hasNavigated.current = true;
      stopTimers();
      const cancelledBy = b?.cancelledBy ?? '';

      if (cancelledBy === 'system') {
        navigation.reset({
          index: 0,
          routes: [{
            name: 'NoRiders',
            params: {
              pickup: b?.pickupLocation?.address ?? pickup,
              dropoff: b?.dropoffLocation?.address ?? dropoff,
              bookingId: b?._id ?? bookingId,
              vehicleType: b?.vehicleType,
              receiverName: b?.receiverName,
              receiverPhone: b?.receiverPhone,
              pickupLat: b?.pickupLocation?.coordinates?.lat,
              pickupLng: b?.pickupLocation?.coordinates?.lng,
              dropoffLat: b?.dropoffLocation?.coordinates?.lat,
              dropoffLng: b?.dropoffLocation?.coordinates?.lng,
            },
          }],
        });
      } else if (cancelledBy === 'customer' || cancelledBy === 'user') {
        navigation.reset({
          index: 0,
          routes: [{ name: 'CustomerDashboard' }],
        });
      } else {
        // cancelledBy === 'rider'
        navigation.reset({
          index: 0,
          routes: [
            {
              name: 'CustomerBookingCancelled',
              params: {
                bookingId: b?._id ?? '',
                bookingNumber: b?.bookingNumber ?? '',
                pickup: b?.pickupLocation?.address ?? pickup,
                dropoff: b?.dropoffLocation?.address ?? dropoff,
                vehicleType: b?.vehicleType ?? 'bike',
                receiverName: b?.receiverName ?? '',
                receiverPhone: b?.receiverPhone ?? '',
                pickupLat: b?.pickupLocation?.coordinates?.lat ?? 0,
                pickupLng: b?.pickupLocation?.coordinates?.lng ?? 0,
                dropoffLat: b?.dropoffLocation?.coordinates?.lat ?? 0,
                dropoffLng: b?.dropoffLocation?.coordinates?.lng ?? 0,
                cancelReason: b?.cancelReason ?? '',
              },
            },
          ],
        });
      }
      return;
    }
  }, [trackingData]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      hasNavigated.current = true;
    };
  }, []);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.secondary} />
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => {
            hasNavigated.current = true;
            dispatch(resetCreateBooking());
            dispatch(setCustomerSkipRestore());
            if (intervalRef.current) {
              clearInterval(intervalRef.current);
              intervalRef.current = null;
            }
            if (timeoutRef.current) {
              clearTimeout(timeoutRef.current);
              timeoutRef.current = null;
            }
            navigation.reset({
              index: 0,
              routes: [{ name: 'CustomerDashboard' }],
            });
          }}
          style={styles.backBtn}
        >
          <Image
            source={require('../../assets/icons/arrow.png')}
            style={styles.backArrow}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Finding Rider</Text>
      </View>

      <View style={styles.radarArea}>
        <RippleWave delay={0} />
        <RippleWave delay={650} />
        <RippleWave delay={1300} />
        <RippleWave delay={1950} />
        <View style={styles.centerDot} />
        {RIDERS.map((r, i) => {
          const pos = getPosition(r.angle, r.distance);
          return (
            <RiderDot key={i} left={pos.left} top={pos.top} delay={i * 300} />
          );
        })}
      </View>

      <View style={styles.bottomSheet}>
        {!trackingData?.rider && (
          <View style={{ marginBottom: 18 }}>
            <Loader />
          </View>
        )}

        <Text style={styles.findingTitle}>Finding your rider...</Text>
        <Text style={styles.findingSubtitle}>
          Looking for nearby riders to pick up{'\n'}your parcel. This usually
          takes 30-60 seconds.
        </Text>

        <View style={styles.locationCard}>
          <View style={styles.locationRow}>
            <View style={[styles.locDot, { backgroundColor: '#22C55E' }]} />
            <View style={styles.locTextWrap}>
              <Text style={styles.locType}>PICKUP</Text>
              <Text
                style={styles.locAddress}
                numberOfLines={2}
                ellipsizeMode="tail"
              >
                {pickup || 'Salt Lake Sector V, Kolkata'}
              </Text>
            </View>
          </View>
          <View style={styles.locationDivider} />
          <View style={styles.locationRow}>
            <View
              style={[styles.locDot, { backgroundColor: Colors.primary }]}
            />
            <View style={styles.locTextWrap}>
              <Text style={styles.locType}>DROP-OFF</Text>
              <Text
                style={styles.locAddress}
                numberOfLines={2}
                ellipsizeMode="tail"
              >
                {dropoff || 'Park Street, Kolkata'}
              </Text>
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={styles.cancelBtn}
          onPress={() => {
            hasNavigated.current = true;
            if (intervalRef.current) {
              clearInterval(intervalRef.current);
              intervalRef.current = null;
            }
            if (timeoutRef.current) {
              clearTimeout(timeoutRef.current);
              timeoutRef.current = null;
            }
            navigation.navigate('CancelBooking', { bookingId });
          }}
          activeOpacity={0.8}
        >
          <Text style={styles.cancelBtnText}>Cancel Booking</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.white },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.secondary,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },

  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },

  backArrow: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
    tintColor: '#fff',
  },

  headerTitle: {
    fontSize: 18,
    color: Colors.white,
    fontWeight: '700',
    marginLeft: 12,
  },

  radarArea: {
    width: width,
    height: RADAR_HEIGHT,
    backgroundColor: '#D4EDDA',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    position: 'relative',
    borderBottomWidth: 1.5,
    borderBottomColor: '#B2D8BC',
  },

  centerDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: Colors.primary,
    zIndex: 30,
    elevation: 8,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 8,
  },

  riderDot: {
    position: 'absolute',
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#22C55E',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 20,
    elevation: 6,
  },

  personIcon: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 1,
  },
  personHead: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.white,
  },
  personBody: {
    width: 14,
    height: 8,
    borderTopLeftRadius: 7,
    borderTopRightRadius: 7,
    backgroundColor: Colors.white,
  },

  bottomSheet: {
    flex: 1,
    backgroundColor: Colors.white,
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 14,
  },

  findingTitle: {
    fontSize: 21,
    fontWeight: '800',
    color: Colors.textDark,
    marginBottom: 7,
    textAlign: 'center',
  },
  findingSubtitle: {
    fontSize: 13,
    color: Colors.textGray,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
  },

  locationCard: {
    width: '100%',
    backgroundColor: '#F8F8F8',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 2,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.borderGray,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 11,
    gap: 12,
  },
  locDot: { width: 10, height: 10, borderRadius: 5, flexShrink: 0 },
  locTextWrap: { flex: 1 },
  locType: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.textGray,
    letterSpacing: 1,
    marginBottom: 2,
  },
  locAddress: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textDark,
    flexShrink: 1,
  },
  locationDivider: {
    height: 1,
    backgroundColor: Colors.borderGray,
    marginLeft: 22,
  },

  cancelBtn: {
    width: '100%',
    borderWidth: 1.5,
    borderColor: Colors.primary,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: Colors.white,
  },
  cancelBtnText: { color: Colors.primary, fontSize: 15, fontWeight: '700' },
});

export default FindingRiderScreen;
