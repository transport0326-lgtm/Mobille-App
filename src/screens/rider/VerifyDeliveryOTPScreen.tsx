import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  TextInput as RNTextInput,
  Dimensions,
  Image,
} from 'react-native';
import { Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSelector } from 'react-redux';
import { Colors } from '../../theme/theme';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { useDispatch } from 'react-redux';
import { verifyBookingOtp } from '../../redux/sagas/rider/verifyBookingOtpAction';
import { resetVerifyOtpState } from '../../redux/slices/verifyBookingOtpSlice';

const { width } = Dimensions.get('window');
const OTP_LENGTH = 4;

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'VerifyDeliveryOTP'>;
};

// Helper: get initials from name
const getInitials = (name: string): string => {
  if (!name) return '??';
  return name
    .trim()
    .split(' ')
    .slice(0, 2)
    .map(w => w[0]?.toUpperCase() ?? '')
    .join('');
};

// Helper: format payment label
const formatPayment = (status: string, amount: number): string => {
  const label = status === 'paid' ? 'ONLINE PAYMENT' : 'ONLINE PAYMENT';
  return `${label} – ₹${amount}`;
};

// Helper: distance placeholder (real distance needs Maps API)
const formatDistance = (
  pickup: { lat: number; lng: number },
  dropoff: { lat: number; lng: number },
): string => {
  const R = 6371;
  const dLat = ((dropoff.lat - pickup.lat) * Math.PI) / 180;
  const dLng = ((dropoff.lng - pickup.lng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((pickup.lat * Math.PI) / 180) *
    Math.cos((dropoff.lat * Math.PI) / 180) *
    Math.sin(dLng / 2) ** 2;
  const dist = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return `${dist.toFixed(1)} km`;
};

const VerifyDeliveryOTPScreen: React.FC<Props> = ({ navigation }) => {
  const dispatch = useDispatch();
  const [otp, setOtp] = useState<string[]>(new Array(OTP_LENGTH).fill(''));
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const inputRefs = useRef<(RNTextInput | null)[]>([]);

  const statusBooking = useSelector((state: any) => state.updateBookingStatus.booking);
  const activeData = useSelector((state: any) => state.riderActive.data);
  const booking = statusBooking ?? activeData?.booking;

  const handleChange = (text: string, index: number) => {
    if (text.length > 1) {
      const pasteData = text.slice(0, OTP_LENGTH).split('');
      const newOtp = [...otp];
      pasteData.forEach((char, i) => {
        if (index + i < OTP_LENGTH) newOtp[index + i] = char;
      });
      setOtp(newOtp);
      const nextIndex = Math.min(index + pasteData.length, OTP_LENGTH - 1);
      inputRefs.current[nextIndex]?.focus();
      return;
    }
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);
    if (text && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && !otp[index] && index > 0) {
      const newOtp = [...otp];
      newOtp[index - 1] = '';
      setOtp(newOtp);
      inputRefs.current[index - 1]?.focus();
    }
  };

  const isComplete = otp.every(d => d !== '');
  
  useEffect(() => {
    dispatch(resetVerifyOtpState());
  }, []);

  const handleVerify = () => {
    if (!isComplete) return;

    const enteredOtp = otp.join('');

    dispatch(
      verifyBookingOtp({
        bookingId: booking?._id,
        otp: enteredOtp,
      }),
    );
  };
  const verifyState = useSelector((state: any) => state.verifyBookingOtp);

useEffect(() => {
  console.log('VERIFY STATE:', verifyState);
}, [verifyState]);
  const verifyOtpSuccess = useSelector(
    (state: any) => state.verifyBookingOtp?.success,
  );

  useEffect(() => {
    if (verifyOtpSuccess) {
      navigation.navigate('TripCompleted');
    }
  }, [verifyOtpSuccess]);

  const verifyOtpError = useSelector(
    (state: any) => state.verifyBookingOtp?.error,
  );

  useEffect(() => {
    if (verifyOtpError) {
      console.log('OTP Error:', verifyOtpError);
      // yahan alert dikha sakte ho
    }
  }, [verifyOtpError]);


  // Derived values from booking
  const receiverName = booking?.receiverName ?? 'Unknown';
  const receiverPhone = booking?.receiverPhone ?? '';
  const dropoffAddress = booking?.dropoffLocation?.address ?? 'N/A';
  const totalAmount = booking?.totalAmount ?? 0;
  const paymentStatus = booking?.paymentStatus ?? 'unpaid';
  const distance =
    booking?.pickupLocation?.coordinates && booking?.dropoffLocation?.coordinates
      ? formatDistance(
        booking.pickupLocation.coordinates,
        booking.dropoffLocation.coordinates,
      )
      : 'N/A';

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
        <Text style={styles.headerTitle}>Verify Delivery OTP</Text>
        <View style={styles.atDeliveryBadge}>
          <Text style={styles.atDeliveryText}>At Delivery</Text>
        </View>
      </View>

      <View style={styles.content}>

        {/* Pin Icon */}
        <View style={styles.pinIconWrap}>
          <View style={styles.pinIconCircle}>
            <Text style={styles.pinEmoji}>📍</Text>
          </View>
        </View>

        {/* Title */}
        <Text style={styles.title}>Arrived at Drop-off!</Text>
        <Text style={styles.subtitle}>
          Ask the customer for the 4-digit OTP{'\n'}to confirm parcel delivery
        </Text>

        {/* OTP Boxes */}
        <View style={styles.otpRow}>
          {otp.map((digit, index) => (
            <RNTextInput
              key={index}
              ref={ref => { inputRefs.current[index] = ref; }}
              style={[
                styles.otpBox,
                digit ? styles.otpBoxFilled : {},
                focusedIndex === index && styles.otpBoxActive,
              ]}
              value={digit}
              onChangeText={text => handleChange(text, index)}
              onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, index)}
              onFocus={() => setFocusedIndex(index)}
              onBlur={() => setFocusedIndex(null)}
              keyboardType="number-pad"
              maxLength={OTP_LENGTH}
              selectTextOnFocus
              textContentType="oneTimeCode"
            />
          ))}
        </View>

        {/* Customer Info Card — Dynamic */}
        <View style={styles.customerCard}>
          <View style={styles.customerAvatar}>
            <Text style={styles.customerAvatarText}>{getInitials(receiverName)}</Text>
          </View>
          <View style={styles.customerInfo}>
            <Text style={styles.customerName}>{receiverName}</Text>
            <Text style={styles.customerAddr}>{dropoffAddress}</Text>
          </View>
          {/* Call Button */}
          <TouchableOpacity
            style={styles.callBtn}
            activeOpacity={0.8}
            onPress={() => {
              if (receiverPhone) {
                // Linking.openURL(`tel:${receiverPhone}`);
              }
            }}>
            <Text style={styles.callIcon}>📞</Text>
          </TouchableOpacity>
        </View>

        {/* Parcel Details — Dynamic */}
        <View style={styles.parcelCard}>
          <Text style={styles.parcelTitle}>Parcel Details</Text>
          {[
            { label: 'Drop-off', value: dropoffAddress },
            { label: 'Distance', value: distance },
            { label: 'Payment', value: formatPayment(paymentStatus, totalAmount) },
          ].map((row, i, arr) => (
            <View
              key={i}
              style={[
                styles.parcelRow,
                i === arr.length - 1 && { borderBottomWidth: 0 },
              ]}>
              <Text style={styles.parcelLabel}>{row.label}</Text>
              <Text style={styles.parcelValue}>{row.value}</Text>
            </View>
          ))}
        </View>

        {/* Verify Button */}
        <TouchableOpacity
          style={[styles.verifyBtn, !isComplete && styles.verifyBtnDisabled]}
          onPress={handleVerify}
          activeOpacity={0.85}
          disabled={!isComplete}>
          <Text style={styles.verifyBtnText}>Verify & Complete Delivery</Text>
        </TouchableOpacity>

      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F5F5F0' },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.secondary,
    gap: 10,
  },
  backBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  backArrow: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
    tintColor: '#fff',
  },
  headerTitle: { flex: 0, fontSize: 17, lineHeight: 22, fontWeight: '800', color: Colors.white, includeFontPadding: false },
  atDeliveryBadge: { backgroundColor: '#22C55E', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 4 },
  atDeliveryText: { fontSize: 12, fontWeight: '700', color: Colors.white },

  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 28,
    paddingBottom: 20,
    alignItems: 'center',
  },

  pinIconWrap: { marginBottom: 16 },
  pinIconCircle: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#E8F5E9', alignItems: 'center', justifyContent: 'center' },
  pinEmoji: { fontSize: 30 },

  title: { fontSize: 22, fontWeight: '800', color: Colors.textDark, marginBottom: 8, textAlign: 'center' },
  subtitle: { fontSize: 13, color: Colors.textGray, textAlign: 'center', lineHeight: 20, marginBottom: 24 },

  otpRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  otpBox: {
    width: (width - 40 - 36) / OTP_LENGTH,
    height: 56,
    borderWidth: 1.5,
    borderColor: '#DDDDDD',
    borderRadius: 10,
    textAlign: 'center',
    fontSize: 24,
    fontWeight: '800',
    color: Colors.textDark,
    backgroundColor: Colors.white,
  },
  otpBoxFilled: { borderColor: Colors.secondary, backgroundColor: Colors.white },
  otpBoxActive: { borderColor: Colors.secondary, borderWidth: 2 },

  customerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 14,
    width: '100%',
    marginBottom: 16,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    gap: 12,
  },
  customerAvatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.secondary, alignItems: 'center', justifyContent: 'center' },
  customerAvatarText: { fontSize: 15, fontWeight: '700', color: Colors.white },
  customerInfo: { flex: 1 },
  customerName: { fontSize: 15, fontWeight: '700', color: Colors.textDark },
  customerAddr: { fontSize: 12, color: Colors.textGray, marginTop: 2 },
  callBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#21A659', alignItems: 'center', justifyContent: 'center' },
  callIcon: { fontSize: 18 },

  parcelCard: { width: '100%', backgroundColor: Colors.white, borderRadius: 12, padding: 16, marginBottom: 24, elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4 },
  parcelTitle: { fontSize: 14, fontWeight: '800', color: Colors.textDark, marginBottom: 10 },
  parcelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingVertical: 9, borderBottomWidth: 1, borderBottomColor: '#F5F5F5' },
  parcelLabel: { fontSize: 13, color: Colors.textGray, flexShrink: 0, marginRight: 12 },
  parcelValue: { fontSize: 13, fontWeight: '600', color: Colors.textDark, flex: 1, textAlign: 'right' },

  verifyBtn: { width: '100%', backgroundColor: Colors.primary, borderRadius: 12, paddingVertical: 16, alignItems: 'center', elevation: 2, shadowColor: Colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 },
  verifyBtnDisabled: { opacity: 0.6 },
  verifyBtnText: { color: Colors.white, fontSize: 16, fontWeight: '700' },
});

export default VerifyDeliveryOTPScreen;