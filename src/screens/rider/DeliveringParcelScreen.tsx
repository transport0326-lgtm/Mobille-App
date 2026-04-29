import React from 'react';
import {
  View,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  Linking,
  Image,
} from 'react-native';
import { Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { Colors } from '../../theme/theme';
import { useSelector } from 'react-redux';
import type { RootState } from '../../redux/store';

type DeliveringParcelScreenProps = {
  navigation: NativeStackNavigationProp<
    RootStackParamList,
    'DeliveringParcel'
  >;
};

const formatTime = (dateString?: string) => {
  if (!dateString) return '';
  const date = new Date(dateString);

  return date.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
};


const DeliveringParcelScreen: React.FC<
  DeliveringParcelScreenProps
> = ({ navigation }) => {
  const booking    = useSelector((state: RootState) => state.updateBookingStatus.booking);
  const etaMinutes = useSelector((state: RootState) => state.updateBookingStatus.etaMinutes);

  
const PROGRESS_STEPS = [
  {
    label: 'Order Accepted',
    time: formatTime(booking?.createdAt),
    done: true,
    active: false,
  },
  {
    label: 'Picked Up from Customer',
    time: formatTime(booking?.updatedAt),
    done: true,
    active: false,
  },
  {
    label: 'On the Way to Drop-off',
    time: 'Now',
    done: false,
    active: true,
  },
  {
    label: 'Delivered',
    time: '',
    done: false,
    active: false,
  },
];

  const senderName = booking?.userName ?? 'Rahim';
  const senderPhone = booking?.userPhone ?? '9999999999';

  const getInitials = (name?: string) => {
    return name
      ? name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
      : '??';
  };

  const handleNavigate = () => {
    if (booking?.dropoffLocation?.coordinates) {
      const { lat, lng } = booking.dropoffLocation.coordinates;
      Linking.openURL(
        `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`
      );
    }
  };

  const handleCall = (phone?: string) => {
    if (phone) {
      Linking.openURL(`tel:${phone}`);
    }
  };

  const handleChat = () => {
    navigation.navigate('RiderChat', {
      customerName: senderName,
      bookingNumber: `BK-${booking?.bookingNumber ?? ''}`,
      bookingStatus: 'Delivering Parcel',
      customerPhone: senderPhone,
      bookingId: booking?._id,
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.secondary} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}>
          <Image
            source={require('../../assets/icons/arrow.png')}
            style={styles.backArrow}
          />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Delivering Parcel</Text>

        <View style={styles.inTransitBadge}>
          <Text style={styles.inTransitText}>In Transit</Text>
        </View>
      </View>

      {/* Top Section */}
      <View style={styles.etaSection}>
        <View style={styles.navIconWrapper}>
          <Image
            source={require('../../assets/icons/near_me.png')}
            style={styles.navIcon}
          />
        </View>

        <Text style={styles.etaTime}>{etaMinutes != null ? `${etaMinutes} min` : '— min'} · 3.2 km</Text>
        <Text style={styles.etaSub}>Estimated time to drop-off</Text>

        <TouchableOpacity
          style={styles.navigateBtn}
          onPress={handleNavigate}>
          <Image
            source={require('../../assets/icons/navigation.png')}
            style={styles.navigateBtnIcon}
          />
          <Text style={styles.navigateBtnText}>
            Navigate in Google Maps
          </Text>
        </TouchableOpacity>

        <View style={styles.addressRow}>
          <Image
            source={require('../../assets/icons/location_on.png')}
            style={styles.addressPin}
          />
          <Text style={styles.addressText} numberOfLines={2} ellipsizeMode="tail">
            {booking?.dropoffLocation?.address ?? ''}
          </Text>
        </View>
      </View>
      {/* 🔵 Sender (STATIC) */}
      <View style={styles.customerRow}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {getInitials(senderName)}
          </Text>
        </View>

        <View style={styles.customerInfo}>
          <Text style={styles.customerName}>{senderName}</Text>
          <Text style={styles.customerMeta}>Sender</Text>
        </View>

        <View style={styles.actionBtns}>
          <TouchableOpacity
            style={styles.chatBtn}
            onPress={handleChat}>
            <Text style={styles.chatBtnText}>💬 Chat</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.callBtn}
            onPress={() => handleCall(senderPhone)}>
            <Text style={styles.callBtnText}>📞 Call</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 🟢 Receiver (DYNAMIC) */}
      <View style={styles.customerRow}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {getInitials(booking?.receiverName)}
          </Text>
        </View>

        <View style={styles.customerInfo}>
          <Text style={styles.customerName}>
            {booking?.receiverName ?? 'Receiver'}
          </Text>
          <Text style={styles.customerMeta}>Receiver</Text>
        </View>

        <View style={styles.actionBtns}>
          <TouchableOpacity
            style={styles.callBtn}
            onPress={() => handleCall(booking?.receiverPhone)}>
            <Text style={styles.callBtnText}>📞 Call</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Bottom Panel */}
      <View style={styles.panel}>
        <Text style={styles.progressTitle}>Delivery Progress</Text>

        <View>
          {PROGRESS_STEPS.map((step, index) => (
            <View key={index} style={styles.stepRow}>
              <View style={styles.stepIndicator}>
                <View
                  style={[
                    styles.stepDot,
                    step.done && styles.stepDotDone,
                    step.active && styles.stepDotActive,
                    !step.done && !step.active &&
                    styles.stepDotPending,
                  ]}
                />
                {index < PROGRESS_STEPS.length - 1 && (
                  <View
                    style={[
                      styles.stepLine,
                      step.done && styles.stepLineDone,
                    ]}
                  />
                )}
              </View>

              <View style={styles.stepContent}>
                <Text style={styles.stepLabel}>{step.label}</Text>
                {step.time ? (
                  <Text style={styles.stepTime}>{step.time}</Text>
                ) : null}
              </View>
            </View>
          ))}
        </View>

        <View style={styles.locationRow}>
          <View style={styles.locationDot} />
          <View style={{ flex: 1 }}>
            <Text style={styles.locationLabel}>Drop-off Location</Text>
            <Text style={styles.locationValue} numberOfLines={2} ellipsizeMode="tail">
              {booking?.dropoffLocation?.address ?? ''}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.completeBtn}
          onPress={() => navigation.navigate('VerifyDeliveryOTP')}>
          <Text style={styles.completeBtnText}>
            Complete Delivery
          </Text>
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

  headerTitle: {
    flex: 0,
    fontSize: 16,
    color: Colors.white,
    fontWeight: '700',
  },

  inTransitBadge: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },

  inTransitText: { color: '#fff', fontSize: 12 },

  etaSection: {
    backgroundColor: '#EEF2F7',
    alignItems: 'center',
    padding: 20,
  },

  navIconWrapper: { marginBottom: 10 },

  navIcon: { width: 30, height: 30, tintColor: Colors.secondary },

  etaTime: { fontSize: 18, fontWeight: '700' },

  etaSub: { fontSize: 12, color: 'gray', marginBottom: 10 },

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
    width: 18,
    height: 18,
    tintColor: '#fff',
  },

  navigateBtnText: {
    color: '#fff',
    marginLeft: 6,
  },

  addressRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    width: '100%',
    gap: 6,
    marginTop: 30,
    marginBottom: 30,
  },

  addressPin: { width: 16, height: 16, marginTop: 2, flexShrink: 0 },

  addressText: { flex: 1, marginLeft: 5, fontSize: 13, color: Colors.textDark },

  panel: { flex: 1, padding: 16 },

  progressTitle: { fontWeight: '700', marginBottom: 10 },

  stepRow: { flexDirection: 'row', marginBottom: 10 },

  stepIndicator: { alignItems: 'center', marginRight: 10 },

  stepDot: { width: 10, height: 10, borderRadius: 5 },

  stepDotDone: { backgroundColor: '#21A659' },

  stepDotActive: { backgroundColor: '#F75522' },

  stepDotPending: { backgroundColor: '#ccc' },

  stepLine: { width: 2, height: 20, backgroundColor: '#ccc' },

  stepLineDone: { backgroundColor: 'green' },

  stepContent: {},

  stepLabel: {},

  stepTime: { fontSize: 12, color: 'gray' },

  locationRow: { flexDirection: 'row', marginTop: 10 },

  locationDot: {
    width: 10,
    height: 10,
    backgroundColor: '#F75522',
    borderRadius: 10,
    margin:5,
  },

  locationLabel: { fontSize: 12 },

  locationValue: { fontWeight: '600' },

  completeBtn: {
    marginTop: 20,
    backgroundColor: '#21A659',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
  },

  completeBtnText: { color: '#fff', fontWeight: '700' },

  customerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },

  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },

  avatarText: {
    color: '#fff',
    fontWeight: '800',
  },

  customerInfo: {
    flex: 1,
    marginLeft: 10,
  },

  customerName: {
    fontWeight: '700',
    fontSize: 14,
  },

  customerMeta: {
    fontSize: 12,
    color: 'gray',
  },

  actionBtns: {
    flexDirection: 'row',
    gap: 6,
  },

  chatBtn: {
    backgroundColor: '#1E293B',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },

  chatBtnText: {
    color: '#fff',
    fontSize: 12,
  },

  callBtn: {
    backgroundColor: '#22B14C',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },

  callBtnText: {
    color: '#fff',
    fontSize: 12,
  },
});

export default DeliveringParcelScreen;