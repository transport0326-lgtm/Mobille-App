import React, { useEffect } from 'react';
import {
  View,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Image,
} from 'react-native';
import { Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '../../redux/store';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { Colors } from '../../theme/theme';
import { createBooking } from '../../redux/sagas/booking/createBookingAction';
import { resetCreateBooking } from '../../redux/slices/bookingSlice';

type ReviewBookingScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'ReviewBooking'>;
  route: RouteProp<RootStackParamList, 'ReviewBooking'>;
};

const ReviewBookingScreen: React.FC<ReviewBookingScreenProps> = ({ navigation, route }) => {
  const dispatch = useDispatch<AppDispatch>();

  const fareData = useSelector((state: RootState) => state.booking.fareEstimate.data);
  const { loading, data: bookingData, error } = useSelector(
    (state: RootState) => state.booking.createBooking,
  );
  const trackData = useSelector((state: RootState) => state.booking.trackBooking.data);

  const {
    pickup, dropoff, vehicleType,
    receiverName, receiverPhone,
    pickupLat, pickupLng, dropoffLat, dropoffLng, otp
  } = route.params;

  const fd = fareData as any;
  const distanceKm: number = fd?.distanceKm ?? 0;
  const baseFare: number = fd?.baseFare ?? 0;
  const ratePerKm: number = fd?.ratePerKm ?? 0;
  const platformFee: number = fd?.platformFee ?? 0;
  const total: number = fd?.total ?? fd?.fare ?? 0;
  const etaMin = distanceKm > 0 ? Math.round(distanceKm * 3.75) : 0;
  const vehicleName =
    vehicleType.charAt(0).toUpperCase() + vehicleType.slice(1).replace(/([A-Z])/g, ' $1');

  useEffect(() => {
    if (loading || !bookingData) return;
    const bId =
      bookingData?.booking?._id ??
      bookingData?._id ??
      '';
    dispatch(resetCreateBooking());
    navigation.replace('FindingRider', { pickup, dropoff, bookingId: bId });
  }, [bookingData, loading]);

  const handlePay = () => {
    dispatch(
      createBooking({
        pickupLocation: { address: pickup, coordinates: { lat: pickupLat, lng: pickupLng } },
        dropoffLocation: { address: dropoff, coordinates: { lat: dropoffLat, lng: dropoffLng } },
        vehicleType,
        receiverName,
        receiverPhone,
      }),
    );
  };

  // ── TEST ONLY: hardcoded bookingId + OTP, baaki sab fareData se ──
  console.log('otp from review booking screen trackData', trackData?.booking.deliveryOtp);
  const handleTestOTP = () => {
    const booking = bookingData?.booking ?? bookingData;
    const bId = booking?._id ?? '';
    const newOtp: string = trackData?.booking.deliveryOtp || '';
    navigation.navigate('BookingOTP', {
      bookingId: bId,
      otp: newOtp,
      pickup,
      dropoff,
      vehicleType,
      distanceKm,
      baseFare,
      ratePerKm,
      platformFee,
      total,
    });
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.secondary} />

      {/* Header */}
      <View style={styles.header}>
              <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                <Image
                  source={require('../../assets/icons/arrow.png')}
                  style={styles.backArrow}
                />
              </TouchableOpacity>
        <Text style={styles.headerTitle}>Review Booking</Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>

        {/* ── Route Card ── */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Route</Text>

          <View style={styles.routeRow}>
            <View style={styles.dotCol}>
              <View style={[styles.dot, { backgroundColor: '#22C55E' }]} />
              <View style={styles.connectorLine} />
            </View>
            <View style={styles.routeTextCol}>
              <Text style={styles.routeLabel}>Pickup</Text>
              <Text style={styles.routeAddress} numberOfLines={2}>{pickup}</Text>
            </View>
          </View>

          <View style={styles.routeRow}>
            <View style={styles.dotCol}>
              <View style={[styles.dot, { backgroundColor: Colors.primary }]} />
            </View>
            <View style={styles.routeTextCol}>
              <Text style={styles.routeLabel}>Drop-off</Text>
              <Text style={styles.routeAddress} numberOfLines={2}>{dropoff}</Text>
            </View>
          </View>

          {distanceKm > 0 && (
            <View style={styles.distancePill}>
              <Text style={styles.distancePillText}>
                {distanceKm.toFixed(1)} km · ~{etaMin} min
              </Text>
            </View>
          )}
        </View>

        {/* ── Fare Breakdown Card ── */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Fare Breakdown</Text>

          <View style={styles.fareRow}>
            <Text style={styles.fareKey}>Vehicle</Text>
            <Text style={styles.fareVal}>{vehicleName}</Text>
          </View>

          {baseFare > 0 && (
            <View style={styles.fareRow}>
              <Text style={styles.fareKey}>Base Fare</Text>
              <Text style={styles.fareVal}>₹ {baseFare}</Text>
            </View>
          )}

          {ratePerKm > 0 && distanceKm > 0 && (
            <View style={styles.fareRow}>
              <Text style={styles.fareKey}>
                Distance ({distanceKm.toFixed(1)} km × ₹{ratePerKm})
              </Text>
              <Text style={styles.fareVal}>₹ {(distanceKm * ratePerKm).toFixed(2)}</Text>
            </View>
          )}

          {platformFee > 0 && (
            <View style={styles.fareRow}>
              <Text style={styles.fareKey}>Platform Fee</Text>
              <Text style={styles.fareVal}>₹ {platformFee}</Text>
            </View>
          )}

          <View style={styles.fareRow}>
            <Text style={styles.fareKey}>Payment</Text>
            <Text style={styles.fareVal}>Pay After Delivery</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>₹ {Number(total).toFixed(2)}</Text>
          </View>
        </View>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        {/* ── Pay Button ── */}
        <TouchableOpacity
          style={[styles.payBtn, loading && styles.payBtnDisabled]}
          activeOpacity={0.85}
          disabled={loading}
          onPress={handlePay}>
          {loading
            ? <ActivityIndicator color={Colors.white} size="small" />
            : <Text style={styles.payBtnText}>Pay</Text>}
        </TouchableOpacity>

        {/* ── TEST BUTTON — sirf testing ke liye, baad mein hata dena ── */}
        <TouchableOpacity
          style={styles.testBtn}
          activeOpacity={0.8}
          onPress={handleTestOTP}>
          <Text style={styles.testBtnText}>🧪 Test: Go to OTP Screen</Text>
        </TouchableOpacity>

        <View style={{ height: 24 }} />
      </ScrollView>
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
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingTop: 20, paddingBottom: 16 },

  card: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 4,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textDark,
    marginBottom: 16,
  },

  routeRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  dotCol: {
    alignItems: 'center',
    width: 20,
    marginRight: 10,
    paddingTop: 4,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  connectorLine: {
    width: 2,
    height: 28,
    backgroundColor: '#E0E0E0',
    marginTop: 4,
  },
  routeTextCol: { flex: 1, paddingBottom: 12 },
  routeLabel: { fontSize: 11, color: Colors.textGray, fontWeight: '500', marginBottom: 2 },
  routeAddress: { fontSize: 14, fontWeight: '700', color: Colors.textDark },

  distancePill: {
    marginTop: 12,
    backgroundColor: '#EEF2FF',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignSelf: 'flex-start',
  },
  distancePillText: { fontSize: 13, color: '#4B5563', fontWeight: '500' },

  fareRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  fareKey: { fontSize: 14, color: Colors.textGray, flex: 1, marginRight: 8 },
  fareVal: { fontSize: 14, fontWeight: '600', color: Colors.textDark },

  divider: { height: 1, backgroundColor: '#EEEEEE', marginVertical: 12 },

  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: { fontSize: 17, fontWeight: '800', color: Colors.textDark },
  totalValue: { fontSize: 24, fontWeight: '800', color: Colors.secondary },

  errorText: { color: 'red', fontSize: 13, textAlign: 'center', marginBottom: 12 },

  payBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 18,
    alignItems: 'center',
    elevation: 2,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    marginBottom: 12,
  },
  payBtnDisabled: { opacity: 0.6 },
  payBtnText: { color: Colors.white, fontSize: 17, fontWeight: '800', letterSpacing: 0.3 },

  // ── Test button styles ──
  testBtn: {
    borderWidth: 1.5,
    borderColor: '#A855F7',
    borderStyle: 'dashed',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: '#FAF5FF',
  },
  testBtnText: {
    color: '#7C3AED',
    fontSize: 14,
    fontWeight: '700',
  },
});

export default ReviewBookingScreen;
