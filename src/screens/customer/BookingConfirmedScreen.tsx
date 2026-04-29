import React, { useEffect } from 'react';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {
  View,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  Linking,
  Image,
} from 'react-native';
import { Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import type { RootState } from '../../redux/store';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { Colors } from '../../theme/theme';
import ChatBottomSheet from '../../components/ChatBottomSheet';
import { useDispatch } from 'react-redux';
import { trackBooking } from '../../redux/sagas/booking/trackBookingAction';

type BookingConfirmedScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'BookingConfirmed'>;
  route: RouteProp<RootStackParamList, 'BookingConfirmed'>;
};

const getInitials = (name?: string) => {
  if (!name) return '?';
  const parts = name.trim().split(' ').filter(Boolean);
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const formatTime = (dateStr?: string) => {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
};

const BookingConfirmedScreen: React.FC<BookingConfirmedScreenProps> = ({ navigation, route }) => {
  const dispatch = useDispatch();
  const intervalRef = React.useRef<any>(null);
  const hasNavigated = React.useRef(false);
  const [chatVisible, setChatVisible] = React.useState(false);

  // ✅ FIX 1: Route params se bookingId seedha lo — Redux trackData se nahi
  // Isse ensure hota hai ki pehla dispatch correct ID se ho
  const routeBookingId = route.params?.booking?._id;

  const trackData = useSelector((state: RootState) => state.booking.trackBooking.data);
  const booking = trackData?.booking;
  const rider = trackData?.rider;

  const otpDigits = booking?.deliveryOtp
    ? booking.deliveryOtp.split('')
    : ['—', '—', '—', '—'];

  const status = booking?.status ?? '';

  const progressSteps = [
    {
      label: 'Booking Placed',
      time: formatTime(booking?.createdAt),
      done: true,
      active: false,
    },
    {
      label: `Rider Assigned${rider?.name ? ` – ${rider.name}` : ''}`,
      time: formatTime(booking?.createdAt),
      done: !!rider,
      active: false,
    },
    {
      label: 'Pickup In Progress',
      time: status === 'arrived_at_pickup' ? 'Now' : '',
      done: ['in_transit', 'delivered'].includes(status),
      active: ['assigned', 'going_to_pickup', 'arrived_at_pickup'].includes(status),
    },
    {
      label: 'On The Way',
      time: '',
      done: status === 'delivered',
      active: status === 'in_transit',
    },
    {
      label: 'Delivered',
      time: '',
      done: status === 'delivered',
      active: false,
    },
  ];

  // ✅ FIX 2: routeBookingId use karo — booking?._id nahi
  // booking?._id har Redux update pe change hota hua lag sakta tha
  useEffect(() => {
    if (!routeBookingId) return;

    dispatch(trackBooking({ bookingId: routeBookingId }));

    intervalRef.current = setInterval(() => {
      dispatch(trackBooking({ bookingId: routeBookingId }));
    }, 10000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [routeBookingId]); // ✅ stable dependency — route params change nahi hote

  // ✅ FIX 3: hasNavigated guard + interval clear BEFORE navigation
  useEffect(() => {
    if (!status || hasNavigated.current) return;

    if (status === 'cancelled') {
      hasNavigated.current = true;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      navigation.reset({ index: 0, routes: [{ name: 'CustomerDashboard' }] });
      return;
    }

    if (status === 'arrived_at_pickup') {
      hasNavigated.current = true;

      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }

      const b = booking ?? route.params?.booking;
      console.log('delivery otp', b.deliveryOtp);

      navigation.reset({
        index: 0,
        routes: [{
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
            otp: b?.deliveryOtp,
          },
        }],
      });
      return;
    }

    if (['completed', 'delivered'].includes(status)) {
      hasNavigated.current = true;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      const b = booking ?? route.params?.booking;
      navigation.reset({
        index: 0,
        routes: [{
          name: 'BookingOTP',
          params: {
            otp: b?.deliveryOtp || '',
            bookingId: b?._id || '',
            pickup: b?.pickupLocation?.address || '',
            dropoff: b?.dropoffLocation?.address || '',
            vehicleType: b?.vehicleType || 'bike',
            distanceKm: 0,
            platformFee: b?.platformFee || 0,
            total: b?.fare || 0,
            riderName: rider?.name || '',
            vehicleNumber: rider?.vehicleNumber || '',
            bookingNumber: b?.bookingNumber || '',
          },
        }],
      });
    }
  }, [status]);

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
        <Text style={styles.headerTitle}>Booking Details</Text>
      </View>

      {/* Scrollable Content */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>

        {/* ── Booking Confirmed Banner ── */}
        <View style={styles.confirmedBanner}>
          <View style={styles.checkCircle}>
            <MaterialIcons name="check" size={24} color={Colors.white} />
          </View>
          <Text style={styles.confirmedTitle}>Booking Confirmed!</Text>
          <Text style={styles.bookingId}>
            Booking ID: {booking?.bookingNumber ?? '—'}
          </Text>
        </View>

        {/* ── Rider Card ── */}
        <View style={styles.card}>
          <View style={styles.riderRow}>
            <View style={styles.riderAvatar}>
              <Text style={styles.riderAvatarText}>{getInitials(rider?.name)}</Text>
            </View>
            <View style={styles.riderInfo}>
              <Text style={styles.riderName}>{rider?.name ?? '—'}</Text>
              <View style={styles.riderMeta}>
                <Text style={styles.riderVehicle}>
                  {(rider?.vehicleType ?? booking?.vehicleType ?? '—')}
                </Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.callBtn}
              activeOpacity={0.8}
              disabled={!rider?.phone}
              onPress={() => rider?.phone && Linking.openURL(`tel:${rider.phone}`)}>
              <Text style={styles.callBtnText}>📞 Call</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.vehicleBox}>
            <Text style={styles.vehicleIcon}>🏍️</Text>
            <Text style={styles.vehicleNumber}>
              Vehicle No:{' '}
              <Text style={{ fontWeight: 'bold' , fontSize:15,textTransform: 'uppercase', }}>
                {rider?.vehicleNumber ?? '—'}
              </Text>
            </Text>
          </View>
        </View>

        {/* ── Live Tracking ── */}
        <View style={styles.card}>
          <Text style={styles.cardSectionLabel}>Live Tracking</Text>
          <View style={styles.trackingBar}>
            <View style={styles.trackingLine} />
            <View style={[styles.trackingLineFilled, { width: '45%' }]} />
            <View style={[styles.trackingDot, styles.trackingDotDone, { left: 0 }]} />
            <View style={[styles.trackingDot, styles.trackingDotActive, { left: '43%' }]} />
            <View style={[styles.trackingDot, styles.trackingDotPending, { right: 0 }]} />
          </View>
          <View style={styles.etaBox}>
            <Text style={styles.etaText}>ETA: 12 min</Text>
          </View>
        </View>

        {/* ── Delivery Progress ── */}
        <View style={styles.card}>
          <Text style={styles.deliveryProgressTitle}>Delivery Progress</Text>
          {progressSteps.map((step, i) => (
            <View key={i} style={styles.progressRow}>
              <View style={styles.progressDotCol}>
                <View style={[
                  styles.progressDot,
                  step.done && styles.progressDotDone,
                  step.active && styles.progressDotActive,
                  !step.done && !step.active && styles.progressDotPending,
                ]} />
                {i < progressSteps.length - 1 && (
                  <View style={[
                    styles.progressLine,
                    (step.done || step.active) && styles.progressLineDone,
                  ]} />
                )}
              </View>
              <View style={styles.progressTextCol}>
                <Text style={[
                  styles.progressLabel,
                  !step.done && !step.active && styles.progressLabelPending,
                ]}>
                  {step.label}
                </Text>
                {step.time !== '' && (
                  <Text style={[
                    styles.progressTime,
                    step.active && styles.progressTimeActive,
                  ]}>
                    {step.time}
                  </Text>
                )}
              </View>
            </View>
          ))}
        </View>

        {/* ── Chat Button ── */}
        <TouchableOpacity
          style={styles.chatBtn}
          activeOpacity={0.85}
          onPress={() => setChatVisible(true)}>
          <Text style={styles.chatBtnText}>💬  Chat with Rider</Text>
        </TouchableOpacity>

        <ChatBottomSheet
          visible={chatVisible}
          onClose={() => setChatVisible(false)}
          bookingId={routeBookingId ?? ''}
          riderName={rider?.name}
        />

        <View style={{ height: 10 }} />
      </ScrollView>

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F5F5F0' },

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
  scrollContent: { paddingHorizontal: 14, paddingTop: 16, paddingBottom: 16 },

  confirmedBanner: {
    alignItems: 'center', backgroundColor: '#E8F5E9',
    borderRadius: 14, paddingVertical: 20, marginBottom: 14,
  },
  checkCircle: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: '#22C55E', alignItems: 'center', justifyContent: 'center',
    marginBottom: 10,
  },
  confirmedTitle: { fontSize: 20, fontWeight: '800', color: Colors.textDark, marginBottom: 4 },
  bookingId: { fontSize: 13, color: Colors.textGray },

  card: {
    backgroundColor: Colors.white, borderRadius: 14,
    padding: 16, marginBottom: 14,
    elevation: 1, shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4,
  },

  riderRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  riderAvatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.secondary, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  riderAvatarText: { fontSize: 15, fontWeight: '700', color: Colors.white },
  riderInfo: { flex: 1 },
  riderName: { fontSize: 15, fontWeight: '700', color: Colors.textDark },
  riderMeta: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  riderVehicle: { fontSize: 12, color: Colors.textGray, textTransform: 'capitalize' },
  callBtn: { backgroundColor: '#E8F5E9', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6 },
  callBtnText: { fontSize: 13, fontWeight: '700', color: '#16A34A' },
  vehicleBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 10,
    borderWidth: 1,
    borderColor: '#7c7575e5',
  },
  vehicleIcon: { fontSize: 18 },
  vehicleNumber: { fontSize: 13, fontWeight: '600', color: Colors.textDark },

  cardSectionLabel: { fontSize: 13, fontWeight: '700', color: Colors.textGray, textAlign: 'center', marginBottom: 14, letterSpacing: 0.3 },
  otpRow: { flexDirection: 'row', justifyContent: 'center', gap: 12, marginBottom: 10 },
  otpBox: { width: 54, height: 58, borderRadius: 10, borderWidth: 1.5, borderColor: '#E0E0E0', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FAFAFA' },
  otpDigit: { fontSize: 26, fontWeight: '800', color: Colors.textDark },
  otpNote: { fontSize: 12, color: Colors.primary, textAlign: 'center', fontWeight: '500' },

  trackingBar: { height: 6, marginVertical: 14, position: 'relative', justifyContent: 'center' },
  trackingLine: { position: 'absolute', left: 0, right: 0, height: 4, backgroundColor: '#E0E0E0', borderRadius: 2 },
  trackingLineFilled: { position: 'absolute', left: 0, height: 4, backgroundColor: '#22C55E', borderRadius: 2 },
  trackingDot: { position: 'absolute', width: 14, height: 14, borderRadius: 7, top: -5 },
  trackingDotDone: { backgroundColor: '#22C55E' },
  trackingDotActive: { backgroundColor: Colors.primary, width: 18, height: 18, borderRadius: 9, top: -7, borderWidth: 3, borderColor: '#FFF' },
  trackingDotPending: { backgroundColor: '#E0E0E0' },
  etaBox: { alignSelf: 'center', backgroundColor: Colors.white, borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 6, marginTop: 6 },
  etaText: { fontSize: 13, fontWeight: '700', color: Colors.textDark },

  deliveryProgressTitle: { fontSize: 15, fontWeight: '800', color: Colors.textDark, marginBottom: 16 },
  progressRow: { flexDirection: 'row', marginBottom: 0 },
  progressDotCol: { width: 24, alignItems: 'center' },
  progressDot: { width: 12, height: 12, borderRadius: 6, marginTop: 3 },
  progressDotDone: { backgroundColor: '#22C55E' },
  progressDotActive: { backgroundColor: Colors.primary },
  progressDotPending: { backgroundColor: '#E0E0E0' },
  progressLine: { width: 2, flex: 1, minHeight: 28, backgroundColor: '#E0E0E0', marginVertical: 2 },
  progressLineDone: { backgroundColor: '#22C55E' },
  progressTextCol: { flex: 1, paddingBottom: 20, paddingLeft: 8 },
  progressLabel: { fontSize: 14, fontWeight: '600', color: Colors.textDark },
  progressLabelPending: { color: '#AAAAAA' },
  progressTime: { fontSize: 12, color: Colors.textGray, marginTop: 2 },
  progressTimeActive: { color: Colors.primary, fontWeight: '700' },

  chatBtn: {
    backgroundColor: Colors.secondary, borderRadius: 12,
    paddingVertical: 16, alignItems: 'center',
    elevation: 2, shadowColor: Colors.secondary,
    shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8,
  },
  chatBtnText: { color: Colors.white, fontSize: 16, fontWeight: '700' },
});

export default BookingConfirmedScreen;
