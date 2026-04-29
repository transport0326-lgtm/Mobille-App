import React from 'react';
import {
  View,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { Colors } from '../../theme/theme';
import { resetBooking } from '../../redux/slices/bookingSlice';
import { resetCancelBooking } from '../../redux/slices/cancelBookingSlice';
import { RootState } from '../../redux/store';

type BookingOTPScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'BookingOTP'>;
  route: RouteProp<RootStackParamList, 'BookingOTP'>;
};

const BookingOTPScreen: React.FC<BookingOTPScreenProps> = ({ navigation, route }) => {
  const dispatch = useDispatch();
  const {
    otp, bookingId, pickup, dropoff, vehicleType,
    distanceKm, baseFare, ratePerKm, platformFee, total,
    riderName, vehicleNumber, bookingNumber,
  } = route.params;
  const trackData = useSelector((state: RootState) => state.booking.trackBooking.data);

  const etaMin = distanceKm > 0 ? Math.round(distanceKm * 3.75) : 0;
  const vehicleName =
    vehicleType.charAt(0).toUpperCase() + vehicleType.slice(1).replace(/([A-Z])/g, ' $1');
  const otpDigits = otp ? otp.split('') : ['—', '—', '—', '—'];

  const handlePaymentSuccessful = () => {
    dispatch(resetBooking());
    dispatch(resetCancelBooking());
    navigation.reset({
      index: 0,
      routes: [{
        name: 'RateDelivery',
        params: { bookingId, riderName:trackData?.rider.name || '', vehicleNumber:trackData?.rider.vehicleNumber, vehicleType, bookingNumber, total },
      }],
    });
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.secondary} />

      <View style={styles.header}>
        <View style={{ width: 40 }} />
        <Text style={styles.headerTitle}>Review Booking</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>

        {/* Route Card */}
        <View style={styles.card}>
          <Text style={styles.routeTitle}>Route</Text>

          <View style={styles.routeRow}>
            <View style={[styles.routeDot, { backgroundColor: '#22C55E' }]} />
            <View style={styles.routeTextCol}>
              <Text style={styles.routeAddressLabel}>Pickup</Text>
              <Text style={styles.routeAddress} numberOfLines={2}>{pickup}</Text>
            </View>
          </View>

          <View style={styles.routeConnector}>
            <View style={styles.routeConnectorLine} />
          </View>

          <View style={styles.routeRow}>
            <View style={[styles.routeDot, { backgroundColor: Colors.primary }]} />
            <View style={styles.routeTextCol}>
              <Text style={styles.routeAddressLabel}>Dropoff</Text>
              <Text style={styles.routeAddress} numberOfLines={2}>{dropoff}</Text>
            </View>
          </View>

          {distanceKm > 0 && (
            <View style={styles.routeMeta}>
              <Text style={styles.routeMetaText}>
                {distanceKm.toFixed(1)} km · ~{etaMin} min
              </Text>
            </View>
          )}
        </View>

        {/* Delivery OTP */}
        <View style={styles.otpCard}>
          <Text style={styles.otpTitle}>Delivery OTP</Text>
          <View style={styles.otpRow}>
            {otpDigits.map((digit: string, i: number) => (
              <View key={i} style={styles.otpBox}>
                <Text style={styles.otpDigit}>{digit}</Text>
              </View>
            ))}
          </View>
          <Text style={styles.otpNote}>Share this OTP with rider at delivery</Text>
        </View>

        {/* Fare Breakdown */}
        <View style={styles.card}>
          <Text style={styles.fareTitle}>Fare Breakdown</Text>

          <View style={styles.fareRow}>
            <Text style={styles.fareKey}>Vehicle</Text>
            <Text style={styles.fareVal}>{vehicleName}</Text>
          </View>

          {baseFare != null && (
            <View style={styles.fareRow}>
              <Text style={styles.fareKey}>Base Fare</Text>
              <Text style={styles.fareVal}>₹{baseFare}</Text>
            </View>
          )}

          {ratePerKm != null && distanceKm > 0 && (
            <View style={styles.fareRow}>
              <Text style={styles.fareKey}>
                Distance ({distanceKm.toFixed(1)} km × ₹{ratePerKm})
              </Text>
              <Text style={styles.fareVal}>₹{(distanceKm * ratePerKm).toFixed(2)}</Text>
            </View>
          )}

          {platformFee > 0 && (
            <View style={styles.fareRow}>
              <Text style={styles.fareKey}>Platform Fee</Text>
              <Text style={styles.fareVal}>₹{platformFee}</Text>
            </View>
          )}

          <View style={styles.fareRow}>
            <Text style={styles.fareKey}>Payment</Text>
            <Text style={styles.fareVal}>Pay After Delivery</Text>
          </View>

          <View style={styles.fareDivider} />

          <View style={styles.fareTotalRow}>
            <Text style={styles.fareTotalLabel}>Total</Text>
            <Text style={styles.fareTotalValue}>₹{Number(total).toFixed(2)}</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.successBtn} onPress={handlePaymentSuccessful} activeOpacity={0.85}>
          <Text style={styles.successBtnText}>Payment Successful</Text>
        </TouchableOpacity>

        <View style={{ height: 16 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F5F5F0' },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.secondary,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.white,
    includeFontPadding: false,
  },

  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 16 },

  card: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },

  routeTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textGray,
    marginBottom: 12,
    letterSpacing: 0.3,
  },
  routeRow: { flexDirection: 'row', alignItems: 'flex-start' },
  routeDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginTop: 4,
    marginRight: 10,
  },
  routeTextCol: { flex: 1 },
  routeAddressLabel: {
    fontSize: 11,
    color: Colors.textGray,
    marginBottom: 2,
    fontWeight: '500',
  },
  routeAddress: { fontSize: 14, fontWeight: '600', color: Colors.textDark },
  routeConnector: { paddingLeft: 5, paddingVertical: 4 },
  routeConnectorLine: {
    width: 2,
    height: 20,
    backgroundColor: '#E0E0E0',
    marginLeft: 1,
  },
  routeMeta: {
    marginTop: 12,
    backgroundColor: '#F0F0F0',
    borderRadius: 20,
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  routeMetaText: { fontSize: 12, color: Colors.textGray, fontWeight: '500' },

  otpCard: {
    backgroundColor: '#FFF3EE',
    borderRadius: 14,
    padding: 20,
    marginBottom: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFD5C4',
  },
  otpTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textGray,
    marginBottom: 14,
    letterSpacing: 0.3,
  },
  otpRow: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  otpBox: {
    width: 54,
    height: 58,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white,
  },
  otpDigit: { fontSize: 26, fontWeight: '800', color: Colors.textDark },
  otpNote: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '500',
    textAlign: 'center',
  },

  fareTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.textDark,
    marginBottom: 14,
  },
  fareRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  fareKey: { fontSize: 13, color: Colors.textGray, flex: 1, marginRight: 8 },
  fareVal: { fontSize: 13, fontWeight: '600', color: Colors.textDark },
  fareDivider: {
    height: 1,
    backgroundColor: '#EEEEEE',
    marginVertical: 10,
  },
  fareTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  fareTotalLabel: { fontSize: 16, fontWeight: '800', color: Colors.textDark },
  fareTotalValue: { fontSize: 22, fontWeight: '800', color: Colors.textDark },

  successBtn: {
    backgroundColor: '#22C55E',
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#22C55E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
  },
  successBtnText: {
    color: Colors.white,
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
});

export default BookingOTPScreen;
