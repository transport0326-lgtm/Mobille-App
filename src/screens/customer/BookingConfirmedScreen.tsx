import React, { useEffect, useRef } from 'react';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {
  View,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  Linking,
  Image,
  Animated,
  BackHandler,
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
import { fetchMessages } from '../../redux/sagas/chat/chatAction';
import {
  saveActiveBooking,
  clearActiveBooking,
} from '../../utils/tokenStorage';
import {
  setCustomerSkipRestore,
  resetCreateBooking,
} from '../../redux/slices/bookingSlice';

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

const BookingConfirmedScreen: React.FC<BookingConfirmedScreenProps> = ({
  navigation,
  route,
}) => {
  const dispatch = useDispatch();
  const intervalRef = React.useRef<any>(null);
  const hasNavigated = React.useRef(false);
  const initialRiderLocRef = useRef<{ lat: number; lng: number } | null>(null);
  const [chatVisible, setChatVisible] = React.useState(false);
  const [seenRiderMsgCount, setSeenRiderMsgCount] = React.useState(0);

  const chatMessages = useSelector((state: RootState) => state.chat.messages);
  const incomingMsgCount = chatMessages.filter(m => m.senderRole !== 'customer').length;
  const hasUnread = incomingMsgCount > seenRiderMsgCount;

  // ✅ FIX 1: Route params se bookingId seedha lo — Redux trackData se nahi
  // Isse ensure hota hai ki pehla dispatch correct ID se ho
  const routeBookingId = route.params?.booking?._id;

  const trackData = useSelector(
    (state: RootState) => state.booking.trackBooking.data,
  );
  const booking = trackData?.booking;
  const rider = trackData?.rider;
  const distanceKm = trackData?.distanceKm;
  const etaMinutes = trackData?.etaMinutes;

  const otpDigits = booking?.deliveryOtp
    ? booking.deliveryOtp.split('')
    : ['—', '—', '—', '—'];

  const status = booking?.status ?? '';

  const pickupLat = booking?.pickupLocation?.coordinates?.lat;
  const pickupLng = booking?.pickupLocation?.coordinates?.lng;
  const dropoffLat = booking?.dropoffLocation?.coordinates?.lat;
  const dropoffLng = booking?.dropoffLocation?.coordinates?.lng;
  const riderLat = trackData?.riderLocation?.lat;
  const riderLng = trackData?.riderLocation?.lng;

  const getDistance = (
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number,
  ) => {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };

  const isAssignedPhase = status === 'assigned';

  const dotProgress = (() => {
    if (isAssignedPhase) {
      // Rider → Pickup: show how far rider has come towards pickup
      if (!riderLat || !riderLng || !pickupLat || !pickupLng) return 0;
      const initLoc = initialRiderLocRef.current;
      if (!initLoc) return 0;
      const totalToPickup = getDistance(
        initLoc.lat,
        initLoc.lng,
        pickupLat,
        pickupLng,
      );
      if (totalToPickup === 0) return 1;
      const remaining = getDistance(riderLat, riderLng, pickupLat, pickupLng);
      return Math.min(Math.max(1 - remaining / totalToPickup, 0), 1);
    }
    // arrived_at_pickup / in_transit: Pickup → Dropoff
    if (
      !pickupLat ||
      !pickupLng ||
      !dropoffLat ||
      !dropoffLng ||
      !riderLat ||
      !riderLng
    )
      return 0;
    const total = getDistance(pickupLat, pickupLng, dropoffLat, dropoffLng);
    if (total === 0) return 0;
    const covered = getDistance(pickupLat, pickupLng, riderLat, riderLng);
    return Math.min(Math.max(covered / total, 0), 1);
  })();

  const trackingMessage =
    status === 'assigned'
      ? 'Rider is on the way to pickup location'
      : status === 'arrived_at_pickup'
      ? 'Rider has picked up the parcel and is heading for delivery!'
      : status === 'in_transit'
      ? 'Parcel picked up! On the way to destination'
      : null;

  const trackLeftLabel = isAssignedPhase
    ? 'Rider'
    : booking?.pickupLocation?.address?.split(',')[0] ?? 'Pickup';

  const trackRightLabel = isAssignedPhase
    ? booking?.pickupLocation?.address?.split(',')[0] ?? 'Pickup'
    : booking?.dropoffLocation?.address?.split(',')[0] ?? 'Dropoff';

  const progressAnim = useRef(new Animated.Value(0)).current;

  // Capture rider's initial position once when assigned phase begins
  useEffect(() => {
    if (
      status === 'assigned' &&
      riderLat &&
      riderLng &&
      !initialRiderLocRef.current
    ) {
      initialRiderLocRef.current = { lat: riderLat, lng: riderLng };
    }
  }, [riderLat, riderLng, status]);

  const prevIsAssignedRef = useRef(isAssignedPhase);
  useEffect(() => {
    if (prevIsAssignedRef.current && !isAssignedPhase) {
      progressAnim.setValue(0);
    }
    prevIsAssignedRef.current = isAssignedPhase;
  }, [isAssignedPhase]);

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: dotProgress,
      duration: 4000,
      useNativeDriver: false,
    }).start();
  }, [dotProgress]);

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
      done: ['arrived_at_pickup', 'in_transit', 'delivered'].includes(status),
      active: ['assigned', 'going_to_pickup'].includes(status),
    },
    {
      label: 'On The Way',
      time: '',
      done: status === 'delivered',
      active: ['arrived_at_pickup', 'in_transit'].includes(status),
    },
    {
      label: 'Delivered',
      time: '',
      done: status === 'delivered',
      active: false,
    },
  ];

  useEffect(() => {
    if (routeBookingId) {
      saveActiveBooking(routeBookingId);
    }
  }, [routeBookingId]);

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      dispatch(resetCreateBooking());
      dispatch(setCustomerSkipRestore());
      navigation.reset({
        index: 0,
        routes: [{ name: 'CustomerDashboard', params: { tab: 'Home' } }],
      });
      return true;
    });
    return () => sub.remove();
  }, [navigation]);

  useEffect(() => {
    if (!routeBookingId) return;

    dispatch(trackBooking({ bookingId: routeBookingId }));
    dispatch(fetchMessages({ bookingId: routeBookingId }));

    intervalRef.current = setInterval(() => {
      dispatch(trackBooking({ bookingId: routeBookingId }));
      dispatch(fetchMessages({ bookingId: routeBookingId }));
    }, 5000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [routeBookingId]);

  useEffect(() => {
    if (chatVisible) setSeenRiderMsgCount(incomingMsgCount);
  }, [chatVisible, incomingMsgCount]);

  useEffect(() => {
    if (!status || hasNavigated.current) return;
    if (booking?._id !== routeBookingId) return;

    if (status === 'cancelled') {
      hasNavigated.current = true;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      clearActiveBooking();
      const b = booking ?? route.params?.booking;
      const cancelledBy = b?.cancelledBy;
      if (cancelledBy === 'customer' || cancelledBy === 'user') {
        dispatch(setCustomerSkipRestore());
        navigation.reset({
          index: 0,
          routes: [{ name: 'CustomerDashboard', params: { tab: 'Home' } }],
        });
      } else if (cancelledBy === 'system') {
        dispatch(setCustomerSkipRestore());
        navigation.reset({
          index: 0,
          routes: [
            {
              name: 'NoRiders',
              params: {
                pickup: b?.pickupLocation?.address ?? '',
                dropoff: b?.dropoffLocation?.address ?? '',
                bookingId: b?._id ?? '',
              },
            },
          ],
        });
      } else {
        navigation.reset({
          index: 0,
          routes: [
            {
              name: 'CustomerBookingCancelled',
              params: {
                bookingId: b?._id ?? '',
                bookingNumber: b?.bookingNumber ?? '',
                pickup: b?.pickupLocation?.address ?? '',
                dropoff: b?.dropoffLocation?.address ?? '',
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

    if (status === 'delivered') {
      hasNavigated.current = true;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      clearActiveBooking();
      const b = booking ?? route.params?.booking;
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
              distanceKm: 0,
              platformFee: b?.platformFee || 0,
              total: b?.fare || 0,
              riderName: rider?.name || '',
              vehicleNumber: rider?.vehicleNumber || '',
              bookingNumber: b?.bookingNumber || '',
            },
          },
        ],
      });
      return;
    }

    if (status === 'completed') {
      hasNavigated.current = true;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      clearActiveBooking();
      const b = booking ?? route.params?.booking;
      navigation.reset({
        index: 0,
        routes: [
          {
            name: 'RateDelivery',
            params: {
              bookingId: b?._id || '',
              riderName: rider?.name || '',
              vehicleNumber: rider?.vehicleNumber || '',
              vehicleType: b?.vehicleType || 'bike',
              bookingNumber: b?.bookingNumber || '',
              total: b?.fare || 0,
            },
          },
        ],
      });
    }
  }, [status]);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.secondary} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          activeOpacity={0.7}
          onPress={() => {
            dispatch(resetCreateBooking());
            dispatch(setCustomerSkipRestore());
            navigation.reset({
              index: 0,
              routes: [{ name: 'CustomerDashboard', params: { tab: 'Home' } }],
            });
          }}
        >
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
        showsVerticalScrollIndicator={false}
      >
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
              <Text style={styles.riderAvatarText}>
                {getInitials(rider?.name)}
              </Text>
            </View>
            <View style={styles.riderInfo}>
              <Text style={styles.riderName}>{rider?.name ?? '—'}</Text>
              <View style={styles.riderMeta}>
                <Text style={styles.riderVehicle}>
                  {rider?.vehicleType ?? booking?.vehicleType ?? '—'}
                </Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.callBtn}
              activeOpacity={0.8}
              disabled={!rider?.phone}
              onPress={() =>
                rider?.phone && Linking.openURL(`tel:${rider.phone}`)
              }
            >
              <Text style={styles.callBtnText}>📞 Call</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.vehicleBox}>
            <Text style={styles.vehicleIcon}>🏍️</Text>
            <Text style={styles.vehicleNumber}>
              Vehicle No:{' '}
              <Text
                style={{
                  fontWeight: 'bold',
                  fontSize: 15,
                  textTransform: 'uppercase',
                }}
              >
                {rider?.vehicleNumber ?? '—'}
              </Text>
            </Text>
          </View>
        </View>

        {/* ── Live Tracking ── */}
        <View style={styles.card}>
          <View style={styles.trackingHeader}>
            <Text style={styles.cardSectionLabel}>Live Tracking</Text>
            <View style={styles.trackingMeta}>
              {distanceKm != null && (
                <Text style={styles.trackingMetaText}>
                  {distanceKm.toFixed(1)} km
                </Text>
              )}
              {etaMinutes != null && (
                <View style={styles.etaBadge}>
                  <Text style={styles.etaBadgeText}>ETA {etaMinutes} min</Text>
                </View>
              )}
            </View>
          </View>

          {/* Status message */}
          {trackingMessage != null && (
            <View style={styles.trackingMessageBox}>
              <Text style={styles.trackingMessageText}>{trackingMessage}</Text>
            </View>
          )}

          {/* Track bar */}
          <View style={styles.trackRow}>
            {/* Left endpoint — green for pickup start, orange for rider start */}
            <View
              style={[
                styles.endDotPickup,
                isAssignedPhase && { backgroundColor: Colors.primary },
              ]}
            >
              <View style={styles.endDotInner} />
            </View>

            {/* Line container */}
            <View style={styles.lineContainer}>
              <View style={styles.lineGray} />
              <Animated.View
                style={[
                  styles.lineGreen,
                  {
                    width: progressAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0%', '100%'],
                    }),
                  },
                ]}
              />
              <Animated.View
                style={[
                  styles.riderDot,
                  {
                    left: progressAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0%', '93%'],
                    }),
                  },
                ]}
              >
                <View style={styles.riderDotOrange} />
              </Animated.View>
            </View>

            {/* Right endpoint */}
            <View
              style={[
                styles.endDotDropoff,
                isAssignedPhase && { backgroundColor: '#22C55E' },
              ]}
            >
              <View style={styles.endDotInnerGray} />
            </View>
          </View>

          {/* Labels */}
          <View style={styles.trackLabels}>
            <Text style={styles.trackLabel} numberOfLines={1}>
              {trackLeftLabel}
            </Text>
            <Text
              style={[styles.trackLabel, { textAlign: 'right' }]}
              numberOfLines={1}
            >
              {trackRightLabel}
            </Text>
          </View>
        </View>

        {/* ── Delivery Progress ── */}
        <View style={styles.card}>
          <Text style={styles.deliveryProgressTitle}>Delivery Progress</Text>
          {progressSteps.map((step, i) => (
            <View key={i} style={styles.progressRow}>
              <View style={styles.progressDotCol}>
                <View
                  style={[
                    styles.progressDot,
                    step.done && styles.progressDotDone,
                    step.active && styles.progressDotActive,
                    !step.done && !step.active && styles.progressDotPending,
                  ]}
                />
                {i < progressSteps.length - 1 && (
                  <View
                    style={[
                      styles.progressLine,
                      (step.done || step.active) && styles.progressLineDone,
                    ]}
                  />
                )}
              </View>
              <View style={styles.progressTextCol}>
                <Text
                  style={[
                    styles.progressLabel,
                    !step.done && !step.active && styles.progressLabelPending,
                  ]}
                >
                  {step.label}
                </Text>
                {step.time !== '' && (
                  <Text
                    style={[
                      styles.progressTime,
                      step.active && styles.progressTimeActive,
                    ]}
                  >
                    {step.time}
                  </Text>
                )}
              </View>
            </View>
          ))}
        </View>

        <View style={{ height: 10 }} />
      </ScrollView>

      {/* ── Fixed Bottom Bar ── */}
      <View style={styles.bottomBar}>
        {/* Row 1: Chat + Payment */}
        <View style={styles.bottomRow}>
          <View style={{ position: 'relative', flex: 1 }}>
            <TouchableOpacity
              style={styles.chatBtn}
              activeOpacity={0.85}
              onPress={() => setChatVisible(true)}
            >
              <MaterialIcons
                name="chat-bubble-outline"
                size={18}
                color={Colors.white}
              />
              <Text style={styles.chatBtnText}>Chat</Text>
            </TouchableOpacity>
            {hasUnread && <View style={styles.unreadDot} />}
          </View>

          <TouchableOpacity
            style={styles.payBtn}
            activeOpacity={0.85}
            onPress={() => {
              const b = booking ?? route.params?.booking;
              navigation.navigate('ReviewBooking', {
                pickup: b?.pickupLocation?.address ?? '',
                dropoff: b?.dropoffLocation?.address ?? '',
                vehicleType: b?.vehicleType ?? 'bike',
                receiverName: b?.receiverName ?? '',
                receiverPhone: b?.receiverPhone ?? '',
                pickupLat: b?.pickupLocation?.coordinates?.lat ?? 0,
                pickupLng: b?.pickupLocation?.coordinates?.lng ?? 0,
                dropoffLat: b?.dropoffLocation?.coordinates?.lat ?? 0,
                dropoffLng: b?.dropoffLocation?.coordinates?.lng ?? 0,
                bookingId: b?._id,
                otp: b?.deliveryOtp,
              });
            }}
          >
            <MaterialIcons name="payment" size={18} color={Colors.white} />
            <Text style={styles.payBtnText}>Make Payment</Text>
          </TouchableOpacity>
        </View>

        {/* Row 2: Cancel — only while rider hasn't picked up yet */}
        {status === 'assigned' && (
          <TouchableOpacity
            style={styles.cancelBtn}
            activeOpacity={0.85}
            onPress={() =>
              navigation.navigate('CancelBooking', {
                bookingId: routeBookingId ?? '',
              })
            }
          >
            <MaterialIcons name="cancel" size={18} color={Colors.primary} />
            <Text style={styles.cancelBtnText}>Cancel Booking</Text>
          </TouchableOpacity>
        )}
      </View>

      <ChatBottomSheet
        visible={chatVisible}
        onClose={() => setChatVisible(false)}
        bookingId={routeBookingId ?? ''}
        riderName={rider?.name}
      />
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
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    borderRadius: 14,
    paddingVertical: 20,
    marginBottom: 14,
  },
  checkCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#22C55E',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  confirmedTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.textDark,
    marginBottom: 4,
  },
  bookingId: { fontSize: 13, color: Colors.textGray },

  card: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },

  riderRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  riderAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  riderAvatarText: { fontSize: 15, fontWeight: '700', color: Colors.white },
  riderInfo: { flex: 1 },
  riderName: { fontSize: 15, fontWeight: '700', color: Colors.textDark },
  riderMeta: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  riderVehicle: {
    fontSize: 12,
    color: Colors.textGray,
    textTransform: 'capitalize',
  },
  callBtn: {
    backgroundColor: '#E8F5E9',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
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

  cardSectionLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textGray,
    letterSpacing: 0.3,
  },
  otpRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 10,
  },
  otpBox: {
    width: 54,
    height: 58,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FAFAFA',
  },
  otpDigit: { fontSize: 26, fontWeight: '800', color: Colors.textDark },
  otpNote: {
    fontSize: 12,
    color: Colors.primary,
    textAlign: 'center',
    fontWeight: '500',
  },

  trackingMessageBox: {
    backgroundColor: '#EFF6FF',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 14,
  },
  trackingMessageText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.secondary,
    textAlign: 'center',
  },

  trackingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  trackingMeta: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  trackingMetaText: { fontSize: 12, fontWeight: '600', color: Colors.textGray },
  etaBadge: {
    backgroundColor: '#E8F5E9',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  etaBadgeText: { fontSize: 12, fontWeight: '700', color: '#16A34A' },

  trackRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 4,
    marginBottom: 10,
  },

  endDotPickup: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#22C55E',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  endDotInner: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: Colors.white,
  },
  endDotDropoff: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#E0E0E0',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  endDotInnerGray: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: Colors.white,
  },

  lineContainer: {
    flex: 1,
    height: 6,
    position: 'relative',
    justifyContent: 'center',
    marginHorizontal: 2,
  },
  lineGray: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 6,
    backgroundColor: '#E0E0E0',
    borderRadius: 3,
  },
  lineGreen: {
    position: 'absolute',
    left: 0,
    height: 6,
    backgroundColor: '#22C55E',
    borderRadius: 3,
  },
  riderDot: {
    position: 'absolute',
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    top: -13,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    borderWidth: 2,
    borderColor: '#22C55E',
  },
  riderDotIcon: { fontSize: 16 },
  riderDotOrange: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.primary,
  },

  trackLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 2,
  },
  trackLabel: {
    fontSize: 11,
    color: Colors.textGray,
    fontWeight: '500',
    maxWidth: '45%',
  },

  deliveryProgressTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.textDark,
    marginBottom: 16,
  },
  progressRow: { flexDirection: 'row', marginBottom: 0 },
  progressDotCol: { width: 24, alignItems: 'center' },
  progressDot: { width: 12, height: 12, borderRadius: 6, marginTop: 3 },
  progressDotDone: { backgroundColor: '#22C55E' },
  progressDotActive: { backgroundColor: Colors.primary },
  progressDotPending: { backgroundColor: '#E0E0E0' },
  progressLine: {
    width: 2,
    flex: 1,
    minHeight: 28,
    backgroundColor: '#E0E0E0',
    marginVertical: 2,
  },
  progressLineDone: { backgroundColor: '#22C55E' },
  progressTextCol: { flex: 1, paddingBottom: 20, paddingLeft: 8 },
  progressLabel: { fontSize: 14, fontWeight: '600', color: Colors.textDark },
  progressLabelPending: { color: '#AAAAAA' },
  progressTime: { fontSize: 12, color: Colors.textGray, marginTop: 2 },
  progressTimeActive: { color: Colors.primary, fontWeight: '700' },

  bottomBar: {
    backgroundColor: Colors.white,
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 14,
    borderTopWidth: 1,
    borderTopColor: Colors.borderGray,
    gap: 10,
  },
  bottomRow: { flexDirection: 'row', gap: 10 },

  chatBtn: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.secondary,
    borderRadius: 12,
    paddingVertical: 14,
  },
  chatBtnText: { color: Colors.white, fontSize: 14, fontWeight: '700' },

  payBtn: {
    flex: 3,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
  },
  payBtnText: { color: Colors.white, fontSize: 14, fontWeight: '700' },

  cancelBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 13,
    backgroundColor: '#FFF5F5',
  },
  cancelBtnText: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '700',
    flex: 0,
    textAlign: 'center',
  },

  unreadDot: {
    position: 'absolute',
    top: -3,
    right: -3,
    width: 11,
    height: 11,
    borderRadius: 6,
    backgroundColor: '#EF4444',
    borderWidth: 2,
    borderColor: Colors.white,
  },

  riderAvatarSmall: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: Colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    right: 14,
  },
  riderAvatarSmallText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.white,
  },
});

export default BookingConfirmedScreen;
