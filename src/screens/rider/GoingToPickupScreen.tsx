import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  Linking,
  ScrollView,
  Image,
  BackHandler,
} from 'react-native';
import { Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { Colors } from '../../theme/theme';
import { useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '../../redux/store';
import { useDispatch } from 'react-redux';
import { updateBookingStatus } from '../../redux/sagas/rider/riderArrivedAction';
import { setSkipRestore } from '../../redux/slices/riderActiveSlice';
import { fetchMessages } from '../../redux/sagas/chat/chatAction';
import CancelOrderSheet from '../../components/CancelOrderSheet';

type GoingToPickupScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'GoingToPickup'>;
};

const GoingToPickupScreen: React.FC<GoingToPickupScreenProps> = ({
  navigation,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const [showCancelSheet, setShowCancelSheet] = useState(false);
  const [seenCustomerMsgCount, setSeenCustomerMsgCount] = useState(0);
  const chatMessages = useSelector((state: RootState) => state.chat.messages);
  const incomingMsgCount = chatMessages.filter(m => m.senderRole !== 'rider').length;
  const hasUnread = incomingMsgCount > seenCustomerMsgCount;
  const markSeenRef = useRef(() => {});
  const acceptedBooking = useSelector(
    (state: RootState) => state.acceptBooking.data?.booking,
  );
  const activeData = useSelector((state: RootState) => state.riderActive.data);
  const booking = acceptedBooking ?? activeData?.booking;
  const etaMinutes = activeData?.etaMinutes ?? null;
  const distanceKm = activeData?.distanceKm ?? null;
  const senderName =
    activeData?.customer?.name ?? booking?.receiverName ?? 'Customer';
  const senderPhone =
    activeData?.customer?.phone ?? booking?.receiverPhone ?? '';

  const senderInitials = senderName
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
  markSeenRef.current = () => setSeenCustomerMsgCount(incomingMsgCount);

  // Background message polling for unread dot
  useEffect(() => {
    if (!booking?._id) return;
    dispatch(fetchMessages({ bookingId: booking._id }));
    const id = setInterval(() => dispatch(fetchMessages({ bookingId: booking._id! })), 5000);
    return () => clearInterval(id);
  }, [booking?._id]);

  // Returning from RiderChat clears the dot
  useEffect(() => {
    const unsub = navigation.addListener('focus', () => markSeenRef.current());
    return unsub;
  }, [navigation]);

  useEffect(() => {
    console.log('[GoingToPickup] MOUNTED');
    return () => console.log('[GoingToPickup] UNMOUNTED');
  }, []);

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      dispatch(setSkipRestore());
      requestAnimationFrame(() => {
        navigation.reset({ index: 0, routes: [{ name: 'RiderDashboard' }] });
      });
      return true;
    });
    return () => sub.remove();
  }, [navigation]);

  const handleCall = () => {
    if (senderPhone) Linking.openURL(`tel:${senderPhone}`);
  };
  const handleArrived = () => {
    if (!booking?._id) return;

    dispatch(
      updateBookingStatus({
        bookingId: booking._id,
        status: 'arrived_at_pickup',
      }),
    );
    navigation.navigate('DeliveringParcel');
  };

  const handleNavigate = () => {
    if (booking?.pickupLocation?.coordinates) {
      const { lat, lng } = booking.pickupLocation.coordinates;
      Linking.openURL(
        `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`,
      );
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.secondary} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => {
            dispatch(setSkipRestore());
            requestAnimationFrame(() => {
              navigation.reset({
                index: 0,
                routes: [{ name: 'RiderDashboard' }],
              });
            });
          }}
          style={styles.backBtn}
          activeOpacity={0.7}
        >
          <Image
            source={require('../../assets/icons/arrow.png')}
            style={styles.backArrow}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Going to Pickup</Text>
        <View style={styles.inRouteBadge}>
          <Text style={styles.inRouteText}>In Route</Text>
        </View>
      </View>

      {/* ETA Section */}
      <View style={styles.etaSection}>
        {/* Navigation Arrow Icon */}
        <View style={styles.navIconWrapper}>
          <Image
            source={require('../../assets/icons/near_me.png')} // apna path sahi rakhna
            style={styles.navIcon}
          />
        </View>

        <Text style={styles.etaTime}>
          {etaMinutes != null ? `${etaMinutes} min` : '— min'} ·{' '}
          {distanceKm != null ? `${distanceKm.toFixed(2)} km` : '— km'}
        </Text>
        <Text style={styles.etaSub}>Estimated time to pickup</Text>

        {/* Navigate Button */}
        <TouchableOpacity
          style={styles.navigateBtn}
          onPress={handleNavigate}
          activeOpacity={0.85}
        >
          <Image
            source={require('../../assets/icons/navigation.png')}
            style={styles.navigateBtnIcon}
          />
          <Text style={styles.navigateBtnText}>Navigate in Google Maps</Text>
        </TouchableOpacity>

        {/* Pickup Address Row */}
        <View style={styles.addressRow}>
          <Image
            source={require('../../assets/icons/location_on.png')}
            style={styles.addressPin}
          />
          <Text style={styles.addressText} numberOfLines={1}>
            {booking?.pickupLocation?.address ?? ''}
          </Text>
        </View>
      </View>

      {/* Bottom Panel */}
      <View style={styles.panel}>
        <ScrollView contentContainerStyle={styles.panelContent}>
          {/* Customer row */}
          <View style={styles.customerRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{senderInitials}</Text>
            </View>
            <View style={styles.customerInfo}>
              <Text style={styles.customerName}>{senderName}</Text>
              <Text style={styles.customerMeta}>
                Booking #{booking?.bookingNumber ?? '...'} •{' '}
                {booking?.parcelDetails ?? 'Parcel'}
              </Text>
            </View>
            <View style={styles.actionBtns}>
              <View style={{ position: 'relative' }}>
                <TouchableOpacity
                  style={styles.chatBtn}
                  activeOpacity={0.8}
                  onPress={() => {
                    markSeenRef.current();
                    navigation.navigate('RiderChat', {
                      customerName: senderName,
                      bookingNumber: `BK-${booking?.bookingNumber ?? ''}`,
                      bookingStatus: 'Going to Pickup',
                      customerPhone: senderPhone,
                      bookingId: booking?._id,
                    });
                  }}
                >
                  <Text style={styles.chatBtnText}>💬 Chat</Text>
                </TouchableOpacity>
                {hasUnread && <View style={styles.unreadDot} />}
              </View>
              <TouchableOpacity
                style={styles.callBtn}
                onPress={handleCall}
                activeOpacity={0.8}
              >
                <Text style={styles.callBtnText}>📞 Call</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Pickup location */}
          <View style={styles.locationRow}>
            <View style={styles.locationDot} />
            <View style={{ flex: 1 }}>
              <Text style={styles.locationLabel}>Pickup Location</Text>
              <Text style={styles.locationValue} numberOfLines={2}>
                {booking?.pickupLocation?.address ??
                  'Koramangala 5th Block, Bangalore'}
              </Text>
            </View>
          </View>

          {/* Arrived button */}
          <TouchableOpacity
            style={styles.arrivedBtn}
            onPress={handleArrived}
            activeOpacity={0.85}
          >
            <Text style={styles.arrivedBtnText}>I've Arrived at Pickup</Text>
          </TouchableOpacity>

          {/* Cancel Order */}
          <TouchableOpacity
            style={styles.cancelBtn}
            activeOpacity={0.85}
            onPress={() => setShowCancelSheet(true)}
          >
            <Text style={styles.cancelBtnText}>Cancel Order</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      <CancelOrderSheet
        visible={showCancelSheet}
        onClose={() => setShowCancelSheet(false)}
        bookingId={booking?._id ?? ''}
        onConfirm={(cancelledBy, cancelled) => {
          dispatch(setSkipRestore());
          if (cancelledBy === 'customer' || cancelledBy === 'user') {
            navigation.reset({
              index: 0,
              routes: [{ name: 'RiderBookingCancelled', params: { cancelled } }],
            });
          } else {
            navigation.reset({
              index: 0,
              routes: [{ name: 'RiderDashboard' }],
            });
          }
        }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#EEF2F7' },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.secondary,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
  },
  backBtn: {
    width: 36,
    height: 36,
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
    flex: 0,
    fontSize: 17,
    fontWeight: '800',
    color: Colors.white,
  },
  inRouteBadge: {
    backgroundColor: '#22C55E',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  inRouteText: { fontSize: 12, fontWeight: '700', color: Colors.white },

  // ETA Section (replaces map)
  etaSection: {
    backgroundColor: '#EEF2F7',
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 20,
    alignItems: 'center',
  },
  navIconWrapper: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  navIcon: {
    width: 35,
    height: 35,
    resizeMode: 'contain',
    tintColor: Colors.secondary,
  },
  etaTime: { fontSize: 20, fontWeight: '800', color: Colors.textDark },
  etaSub: {
    fontSize: 13,
    color: Colors.textGray,
    marginTop: 4,
    marginBottom: 18,
  },

  navigateBtn: {
    flexDirection: 'row',
    backgroundColor: '#3385F5',
    borderRadius: 15,
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginBottom: 16,
    elevation: 3,
  },
  navigateBtnIcon: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
    tintColor: '#fff',
  },
  navigateBtnText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    marginStart: 5,
  },

  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    marginTop: 30,
    marginBottom: 30,
  },
  addressPin: {
    width: 14,
    height: 14,
    resizeMode: 'contain',
  },
  addressText: { fontSize: 14, color: Colors.textDark, fontWeight: '500' },

  // Panel
  panel: {
    flex: 1,
    backgroundColor: Colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  panelContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 20,
    gap: 14,
  },

  // Customer row
  customerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    gap: 10,
    marginTop: 15,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 15, fontWeight: '800', color: Colors.white },
  customerInfo: { flex: 1 },
  customerName: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textDark,
    marginBottom: 2,
  },
  customerMeta: { fontSize: 12, color: Colors.textGray },
  actionBtns: { flexDirection: 'row', gap: 6 },
  chatBtn: {
    backgroundColor: '#1E293B',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  chatBtnText: { fontSize: 12, fontWeight: '700', color: Colors.white },
  callBtn: {
    backgroundColor: '#22C55E',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  callBtnText: { fontSize: 12, fontWeight: '700', color: Colors.white },

  // Location row
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#F8F9FA',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginTop: 20,
  },
  locationDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#22C55E',
  },
  locationLabel: { fontSize: 11, color: Colors.textGray, marginBottom: 2 },
  locationValue: { fontSize: 14, fontWeight: '600', color: Colors.textDark },

  // Arrived button
  arrivedBtn: {
    backgroundColor: '#F75522',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    elevation: 2,
  },
  arrivedBtnText: { color: Colors.white, fontSize: 15, fontWeight: '700' },

  cancelBtn: {
    borderWidth: 1.5,
    borderColor: '#EF4444',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  cancelBtnText: { color: '#EF4444', fontSize: 15, fontWeight: '700' },

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
});

export default GoingToPickupScreen;
