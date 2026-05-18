import React, { useEffect } from 'react';
import {
  View,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { Colors } from '../../theme/theme';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '../../redux/store';
import {
  setCustomerSkipRestore,
  resetTrackBooking,
  resetCreateBooking,
} from '../../redux/slices/bookingSlice';
import { createBooking } from '../../redux/sagas/booking/createBookingAction';
import { clearActiveBooking } from '../../utils/tokenStorage';
import { Image } from 'react-native';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'CustomerBookingCancelled'>;
  route: RouteProp<RootStackParamList, 'CustomerBookingCancelled'>;
};

const shorten = (addr: string) => addr.split(',')[0].trim();

const CustomerBookingCancelledScreen: React.FC<Props> = ({ navigation, route }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { loading, data: bookingData } = useSelector(
    (state: RootState) => state.booking.createBooking,
  );
  const {
    bookingNumber,
    pickup,
    dropoff,
    vehicleType,
    receiverName,
    receiverPhone,
    pickupLat,
    pickupLng,
    dropoffLat,
    dropoffLng,
    cancelReason,
  } = route.params;

  useEffect(() => {
    if (loading || !bookingData) return;
    const bId = bookingData?.booking?._id ?? bookingData?._id ?? '';
    dispatch(resetCreateBooking());
    navigation.reset({ index: 0, routes: [{ name: 'FindingRider', params: { pickup, dropoff, bookingId: bId } }] });
  }, [bookingData, loading]);

  const goHome = () => {
    clearActiveBooking();
    dispatch(setCustomerSkipRestore());
    dispatch(resetTrackBooking());
    dispatch(resetCreateBooking());
    navigation.reset({ index: 0, routes: [{ name: 'CustomerDashboard' }] });
  };

  const findNewRider = () => {
    clearActiveBooking();
    dispatch(resetTrackBooking());
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

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={goHome} activeOpacity={0.7}>
          <Image
            source={require('../../assets/icons/arrow.png')}
            style={styles.backArrow}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Booking Cancelled</Text>
        <View style={styles.backBtn} />
      </View>

      {/* Alert Banner */}
      <View style={styles.alertBanner}>
        <View style={styles.alertTopLine} />
        <Text style={styles.alertIcon}>⚠</Text>
        <View style={styles.alertTextWrap}>
          <Text style={styles.alertTitle}>Your rider has cancelled the order</Text>
          <Text style={styles.alertSub}>
            {"We're sorry for the inconvenience. Please see details below."}
          </Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Booking Details Card */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Booking Details</Text>
          <View style={styles.divider} />

          <View style={styles.detailRow}>
            <Text style={styles.detailKey}>Booking ID</Text>
            <Text style={styles.detailValue}>#{bookingNumber}</Text>
          </View>
          <View style={styles.thinDivider} />

          <View style={styles.detailRow}>
            <Text style={styles.detailKey}>Pickup</Text>
            <View style={styles.dotValueRow}>
              <View style={[styles.locDot, { backgroundColor: '#1EAC60' }]} />
              <Text style={styles.detailValueMedium} numberOfLines={1}>
                {shorten(pickup)}
              </Text>
            </View>
          </View>
          <View style={styles.thinDivider} />

          <View style={styles.detailRow}>
            <Text style={styles.detailKey}>Drop-off</Text>
            <View style={styles.dotValueRow}>
              <View style={[styles.locDot, { backgroundColor: Colors.primary }]} />
              <Text style={styles.detailValueMedium} numberOfLines={1}>
                {shorten(dropoff)}
              </Text>
            </View>
          </View>
        </View>

        {/* Cancellation Reason Card */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Cancellation Reason</Text>
          <View style={styles.divider} />

          <View style={styles.reasonRow}>
            <View style={[styles.reasonDot, styles.reasonDotSelected]}>
              <View style={styles.reasonDotInner} />
            </View>
            <Text style={styles.reasonTextSelected}>
              {cancelReason || 'Cancelled by rider'}
            </Text>
          </View>
        </View>

        <View style={{ height: 160 }} />
      </ScrollView>

      {/* Footer Buttons */}
      <View style={styles.footer}>
        <TouchableOpacity style={[styles.findBtn, loading && styles.findBtnDisabled]} activeOpacity={0.85} onPress={findNewRider} disabled={loading}>
          {loading
            ? <ActivityIndicator color={Colors.white} size="small" />
            : <Text style={styles.findBtnText}>{'🔍   Find a New Rider'}</Text>}
        </TouchableOpacity>

        <TouchableOpacity style={styles.homeBtn} activeOpacity={0.85} onPress={goHome}>
          <Text style={styles.homeBtnText}>Go to Home</Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => navigation.navigate('HelpSupport')}>
          <Text style={styles.supportText}>Contact Support</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.white },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.white,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E1E1E1',
  },
  backBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  backArrow: { width: 20, height: 20, resizeMode: 'contain', tintColor: '#1C1C1C' },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1C1C1C',
    textAlign: 'center',
    flex: 1,
  },

  // Alert Banner
  alertBanner: {
    backgroundColor: 'rgba(239,68,68,0.08)',
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingVertical: 18,
    position: 'relative',
  },
  alertTopLine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: '#EF4444',
  },
  alertIcon: { fontSize: 22, color: '#EF4444', marginRight: 10, lineHeight: 26 },
  alertTextWrap: { flex: 1 },
  alertTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#EF4444',
    marginBottom: 4,
  },
  alertSub: {
    fontSize: 12,
    color: '#992626',
    lineHeight: 18,
  },

  scroll: { paddingHorizontal: 20, paddingTop: 16 },

  // Card
  card: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E1E1E1',
    overflow: 'hidden',
    marginBottom: 14,
  },
  cardLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1a1919',
    paddingHorizontal: 15,
    paddingTop: 13,
    paddingBottom: 10,
  },
  divider: { height: 1, backgroundColor: '#E1E1E1', marginHorizontal: 15 },
  thinDivider: {
    height: 1,
    backgroundColor: 'rgba(225,225,225,0.5)',
    marginHorizontal: 15,
  },

  // Detail rows
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingVertical: 11,
  },
  detailKey: { fontSize: 11, color: '#1a1919' },
  detailValue: { fontSize: 13, fontWeight: '600', color: '#1C1C1C' },
  dotValueRow: { flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1, justifyContent: 'flex-end' },
  locDot: { width: 8, height: 8, borderRadius: 4 },
  detailValueMedium: {
    fontSize: 12,
    fontWeight: '500',
    color: '#1a1919',
    maxWidth: 180,
    textAlign: 'right',
  },

  // Reason rows
  reasonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    gap: 12,
  },
  reasonDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#E1E1E1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  reasonDotSelected: { backgroundColor: '#EF4444' },
  reasonDotInner: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.white,
  },
  reasonText: { fontSize: 12, color: '#1a1919' },
  reasonTextSelected: { fontSize: 13, fontWeight: '700', color: '#1C1C1C', flex: 1 },

  // Footer
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.white,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 24,
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: '#E1E1E1',
    alignItems: 'center',
  },
  findBtn: {
    width: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 16,
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
  },
  findBtnDisabled: { opacity: 0.6 },
  findBtnText: { color: Colors.white, fontSize: 15, fontWeight: '700' },
  homeBtn: {
    width: '100%',
    borderWidth: 1.5,
    borderColor: '#E1E1E1',
    borderRadius: 16,
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
  },
  homeBtnText: { color: '#1C1C1C', fontSize: 15, fontWeight: '600' },
  supportText: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.primary,
    paddingVertical: 4,
  },
});

export default CustomerBookingCancelledScreen;
