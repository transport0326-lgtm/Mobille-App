import React, { useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { Colors } from '../../theme/theme';
import DeliveryRequestModal from '../../components/modals/DeliveryRequestModal';
import { acceptBooking } from '../../redux/sagas/rider/acceptBookingAction';
import { resetAcceptBooking } from '../../redux/slices/acceptBookingSlice';
import { resetRiderActive } from '../../redux/slices/riderActiveSlice';
import type { AppDispatch, RootState } from '../../redux/store';

type RiderOnlineScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'RiderDashboard'>;
};

const RiderOnlineScreen: React.FC<RiderOnlineScreenProps> = ({ navigation }) => {
  const dispatch = useDispatch<AppDispatch>();

  const { loading: accepting, success: acceptSuccess, error: acceptError } =
    useSelector((state: RootState) => state.acceptBooking);

  const { data: activeData } = useSelector((state: RootState) => state.riderActive);
  const activeBooking = activeData?.booking;
  const modalVisible = !!activeBooking && activeBooking.status === 'pending';

  const customerInitials = activeBooking?.receiverName
    ? activeBooking.receiverName
      .split(' ')
      .map((n: string) => n[0])
      .join('')
      .toUpperCase()
    : '??';

  useEffect(() => {
    if (acceptSuccess) {
      navigation.navigate('GoingToPickup');
    }
  }, [acceptSuccess]);

  useEffect(() => {
    if (acceptError) {
      Alert.alert('Failed to accept', acceptError);
      dispatch(resetAcceptBooking());
    }
  }, [acceptError]);

  const handleAccept = () => {
    if (!activeBooking) return;
    dispatch(acceptBooking({ bookingId: activeBooking._id }));
  };

  const handleReject = () => {
    dispatch(resetRiderActive());
  };

  return (
    <>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>

        <Text style={styles.sectionTitle}>Today's Summary</Text>
        <View style={styles.summaryRow}>
          <View style={[styles.summaryCard, { backgroundColor: '#F0FDF4' }]}>
            <Text style={[styles.summaryValue, { color: '#16A34A' }]}>₹ 385</Text>
            <Text style={styles.summaryLabel}>Earnings</Text>
          </View>
          <View style={[styles.summaryCard, { backgroundColor: '#F3F4F6' }]}>
            <Text style={[styles.summaryValue, { color: Colors.textDark }]}>7</Text>
            <Text style={styles.summaryLabel}>Trips</Text>
          </View>
          <View style={[styles.summaryCard, { backgroundColor: '#FFF7ED' }]}>
            <Text style={[styles.summaryValue, { color: Colors.primary }]}>28 km</Text>
            <Text style={styles.summaryLabel}>Distance</Text>
          </View>
        </View>

        <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Recent Deliveries</Text>
        <View style={styles.deliveriesCard}>
          {/* TODO: replace with real trips data */}
        </View>

      </ScrollView>

      <DeliveryRequestModal
        visible={modalVisible}
        request={{
          bookingId: activeBooking?._id ?? '',
          distance: activeBooking?.distanceKm
            ? `${activeBooking.distanceKm.toFixed(2)} km`
            : 'Calculating...',
          fare: activeBooking?.fare ?? 0,
          vehicle: activeBooking?.vehicleType ?? '',
          pickup: activeBooking?.pickupLocation?.address ?? '',
          dropoff: activeBooking?.dropoffLocation?.address ?? '',
          customerName: activeBooking?.receiverName ?? '',
          customerInitials,
          parcelType: activeBooking?.parcelDetails ?? 'Parcel Delivery',
        }}
        onAccept={handleAccept}
        accepting={accepting}
        onReject={handleReject}
      />
    </>
  );
};

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 16 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: Colors.textDark, marginBottom: 10 },
  summaryRow: { flexDirection: 'row', gap: 10 },
  summaryCard: {
    flex: 1, borderRadius: 10, paddingVertical: 14, alignItems: 'center',
    elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 3,
  },
  summaryValue: { fontSize: 16, fontWeight: '800', marginBottom: 4 },
  summaryLabel: { fontSize: 11, color: Colors.textGray },
  deliveriesCard: {
    backgroundColor: Colors.white, borderRadius: 12, paddingHorizontal: 16,
    elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 3,
  },
  deliveryRow: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', paddingVertical: 14,
  },
  deliveryRowBorder: { borderBottomWidth: 1, borderBottomColor: Colors.borderGray },
  deliveryRoute: { fontSize: 14, fontWeight: '600', color: Colors.textDark, marginBottom: 3 },
  deliveryTime: { fontSize: 12, color: Colors.textGray },
  deliveryFare: { fontSize: 15, fontWeight: '800', color: '#16A34A' },
});

export default RiderOnlineScreen;