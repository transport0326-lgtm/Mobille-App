import React from 'react';
import {
  View,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  Linking,
  ScrollView,
  Image,
} from 'react-native';
import { Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { Colors } from '../../theme/theme';
import { useSelector } from 'react-redux';
import type { RootState } from '../../redux/store';
import { useDispatch } from 'react-redux';
import { updateBookingStatus } from '../../redux/sagas/rider/riderArrivedAction';
import type { AppDispatch } from '../../redux/store';

type GoingToPickupScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'GoingToPickup'>;
};

const GoingToPickupScreen: React.FC<GoingToPickupScreenProps> = ({ navigation }) => {
  const dispatch = useDispatch<AppDispatch>();
  const booking    = useSelector((state: RootState) => state.acceptBooking.data?.booking);
  const etaMinutes = useSelector((state: RootState) => state.acceptBooking.data?.etaMinutes as number | null | undefined);
  console.log('📦 acceptBooking data:', JSON.stringify(booking));

  const receiverInitials = booking?.receiverName
    ? booking.receiverName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
    : '??';

  const handleCall = () => {
    if (booking?.receiverPhone) {
      Linking.openURL(`tel:${booking.receiverPhone}`);
    }
  };
  const handleArrived = () => {
    if (!booking?._id) return;

    dispatch(
      updateBookingStatus({
        bookingId: booking._id,
        status: 'arrived_at_pickup',
      })
    );
    navigation.navigate('DeliveringParcel');
  };

  const handleNavigate = () => {
    if (booking?.pickupLocation?.coordinates) {
      const { lat, lng } = booking.pickupLocation.coordinates;
      Linking.openURL(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.secondary} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} activeOpacity={0.7}>
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

        <Text style={styles.etaTime}>{etaMinutes != null ? `${etaMinutes} min` : '— min'} · 2.1 km</Text>
        <Text style={styles.etaSub}>Estimated time to pickup</Text>

        {/* Navigate Button */}
        <TouchableOpacity style={styles.navigateBtn} onPress={handleNavigate} activeOpacity={0.85}>
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
              <Text style={styles.avatarText}>{receiverInitials}</Text>
            </View>
            <View style={styles.customerInfo}>
              <Text style={styles.customerName}>{booking?.receiverName ?? 'Loading...'}</Text>
              <Text style={styles.customerMeta}>
                Booking #{booking?.bookingNumber ?? '...'} • {booking?.parcelDetails ?? 'Pa'}
              </Text>
            </View>
            <View style={styles.actionBtns}>
              <TouchableOpacity
                style={styles.chatBtn}
                activeOpacity={0.8}
                onPress={() => navigation.navigate('RiderChat', {
                  customerName: booking?.receiverName ?? 'Customer',
                  bookingNumber: `BK-${booking?.bookingNumber ?? ''}`,
                  bookingStatus: 'Going to Pickup',
                  customerPhone: booking?.receiverPhone,
                  bookingId: booking?._id,
                })}>
                <Text style={styles.chatBtnText}>💬 Chat</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.callBtn} onPress={handleCall} activeOpacity={0.8}>
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
                {booking?.pickupLocation?.address ?? 'Koramangala 5th Block, Bangalore'}
              </Text>
            </View>
          </View>

          {/* Arrived button */}
          <TouchableOpacity
            style={styles.arrivedBtn}
            onPress={handleArrived}
            activeOpacity={0.85}>
            <Text style={styles.arrivedBtnText}>I've Arrived at Pickup</Text>
          </TouchableOpacity>

        </ScrollView>
      </View>
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
  backBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' }, 
  backArrow: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
    tintColor: '#fff',
  },
  headerTitle: { flex: 0, fontSize: 17, fontWeight: '800', color: Colors.white },
  inRouteBadge: { backgroundColor: '#22C55E', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 4 },
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
  etaSub: { fontSize: 13, color: Colors.textGray, marginTop: 4, marginBottom: 18 },

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
  navigateBtnText: { color: '#FFFFFF', fontSize: 18, fontWeight: '700', marginStart: 5 },

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
  panelContent: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 20, gap: 14 },

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
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: Colors.secondary, alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { fontSize: 15, fontWeight: '800', color: Colors.white },
  customerInfo: { flex: 1 },
  customerName: { fontSize: 15, fontWeight: '700', color: Colors.textDark, marginBottom: 2 },
  customerMeta: { fontSize: 12, color: Colors.textGray },
  actionBtns: { flexDirection: 'row', gap: 6 },
  chatBtn: { backgroundColor: '#1E293B', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 7 },
  chatBtnText: { fontSize: 12, fontWeight: '700', color: Colors.white },
  callBtn: { backgroundColor: '#22C55E', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 7 },
  callBtnText: { fontSize: 12, fontWeight: '700', color: Colors.white },

  // Location row
  locationRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: '#F8F9FA', borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 12,
    marginTop: 20,
  },
  locationDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#22C55E' },
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
});

export default GoingToPickupScreen;
