import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Image,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  TextInput,
  Dimensions,
} from 'react-native';
import { Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { Colors } from '../../theme/theme';
import { sendOtp, verifyOtp } from '../../redux/sagas/auth/authAction';
import { getFCMToken } from '../../utils/fcm';
import { resetVerifyOtp } from '../../redux/slices/authSlice';
import type { RootState, AppDispatch } from '../../redux/store';

const { width } = Dimensions.get('window');
const OTP_LENGTH = 4;

type OTPScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'OTP'>;
  route: RouteProp<RootStackParamList, 'OTP'>;
};

const OTPScreen: React.FC<OTPScreenProps> = ({ navigation, route }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { phoneNumber } = route.params;
  const storedOtp = useSelector((state: RootState) => state.auth.sendOtp.otp);
  const { loading: verifying, success: verified, isNewUser, isUser, isRider, error: verifyError } = useSelector(
    (state: RootState) => state.auth.verifyOtp,
  );

  const [otp, setOtp] = useState<string[]>(new Array(OTP_LENGTH).fill(''));
  const [timer, setTimer] = useState(45);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef<(TextInput | null)[]>([]);

  // Navigate when verify succeeds
  useEffect(() => {
    if (verified) {
      dispatch(resetVerifyOtp());
      if (isRider) {
        navigation.navigate('RiderDashboard', undefined);
      } else if (isUser) {
        navigation.navigate('CustomerDashboard', undefined);
      } else if (isNewUser) {
        navigation.navigate('CreateAccount', { phoneNumber });
      }
    }
  }, [verified, isRider, isUser, isNewUser]);

  // Countdown timer
  useEffect(() => {
    if (timer <= 0) {
      setCanResend(true);
      return;
    }
    const interval = setInterval(() => {
      setTimer(prev => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timer]);

  const handleFocus = (index: number) => {
    if (verifyError) dispatch(resetVerifyOtp());
    const newOtp = [...otp];
    newOtp[index] = '';
    setOtp(newOtp);
  };

  const handleChange = (text: string, index: number) => {
    if (text.length > 1) {
      // Handle paste
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
    if (key === 'Backspace' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleResend = () => {
    if (!canResend) return;
    setOtp(new Array(OTP_LENGTH).fill(''));
    setTimer(45);
    setCanResend(false);
    inputRefs.current[0]?.focus();
    dispatch(sendOtp({ phone: phoneNumber }));
  };

  const handleVerify = async () => {
    const otpValue = otp.join('');
    if (otpValue.length < OTP_LENGTH) return;
    const fcmToken = await getFCMToken();
    console.log('otp verifing fcm', fcmToken);
    dispatch(verifyOtp({ phone: phoneNumber, otp: storedOtp || otpValue, fcmToken }));
  };

  const isComplete = otp.every(d => d !== '');

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Image
            source={require('../../assets/icons/arrow.png')}
            style={styles.backArrow}
          />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Verify OTP</Text>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View style={styles.content}>

          {/* Logo */}
          <Image
            source={require('../../assets/images/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />

          {/* Title */}
          <Text style={styles.title}>Enter Verification Code</Text>
          <Text style={styles.subtitle}>
            We've sent a 4-digit code to{'\n'}
            <Text style={styles.phoneText}>+91 {phoneNumber}</Text>
          </Text>

          {/* Error message */}
          {verifyError ? (
            <Text style={styles.errorText}>{verifyError}</Text>
          ) : null}

          {/* OTP Boxes */}
          <View style={styles.otpRow}>
            {otp.map((digit, index) => (
              <TextInput
                key={index}
                ref={ref => { inputRefs.current[index] = ref; }}
                style={[
                  styles.otpBox,
                  digit && !verifyError ? styles.otpBoxFilled : {},
                  verifyError ? styles.otpBoxError : {},
                ]}
                value={digit}
                onChangeText={text => handleChange(text, index)}
                onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, index)}
                onFocus={() => handleFocus(index)}
                keyboardType="number-pad"
                maxLength={OTP_LENGTH}
                textContentType="oneTimeCode"
              />
            ))}
          </View>

          {/* Resend Timer */}
          <View style={styles.resendRow}>
            <Text style={styles.resendText}>Resend code in </Text>
            {canResend ? (
              <TouchableOpacity onPress={handleResend}>
                <Text style={styles.resendLink}>Resend</Text>
              </TouchableOpacity>
            ) : (
              <Text style={styles.timerText}>{formatTime(timer)}</Text>
            )}
          </View>

          {/* Verify Button */}
          <TouchableOpacity
            style={[styles.verifyBtn, (!isComplete || verifying) && styles.verifyBtnDisabled]}
            onPress={handleVerify}
            activeOpacity={0.85}
            disabled={!isComplete || verifying}>
            <Text style={styles.verifyBtnText}>
              {verifying ? 'Verifying...' : 'Verify & Continue'}
            </Text>
          </TouchableOpacity>

        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.white,
  },

  // Header
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

  // Content
  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 28,
    paddingTop: 36,
  },
  logo: {
    width: width * 0.38,
    height: 55,
    marginBottom: 28,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.textDark,
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textGray,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  phoneText: {
    fontWeight: '700',
    color: Colors.textDark,
  },

  // OTP
  otpRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 24,
  },
  otpBox: {
    width: (width - 56 - 50) / OTP_LENGTH,
    height: 52,
    borderWidth: 1.5,
    borderColor: Colors.borderGray,
    borderRadius: 10,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textDark,
    backgroundColor: Colors.inputBg,
  },
  otpBoxFilled: {
    borderColor: Colors.primary,
    backgroundColor: Colors.white,
  },
  otpBoxError: {
    borderColor: '#D32F2F',
    backgroundColor: '#FFF5F5',
  },
  errorText: {
    color: '#D32F2F',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 12,
  },

  // Resend
  resendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 36,
  },
  resendText: {
    fontSize: 13,
    color: Colors.textGray,
  },
  timerText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primary,
  },
  resendLink: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.secondary,
    textDecorationLine: 'underline',
  },

  // Button
  verifyBtn: {
    width: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: 'center',
    elevation: 2,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  verifyBtnDisabled: {
    opacity: 0.6,
  },
  verifyBtnText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});

export default OTPScreen;
