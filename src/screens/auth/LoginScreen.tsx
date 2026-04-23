import React, { useState, useEffect } from 'react';
import {
  View,
  Image,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Dimensions,
  Alert,
} from 'react-native';
import { Text, TextInput } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { Colors } from '../../theme/theme';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { sendOtp } from '../../redux/sagas/auth/authAction';
import { resetSendOtp } from '../../redux/slices/authSlice';
import { TEST_OTP } from '../../redux/sagas/auth/authSaga';
import type { RootState, AppDispatch } from '../../redux/store';

// Test phone number that bypasses the real API
const TEST_PHONE = '9999999999';

type LoginScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Login'>;
};

const { width } = Dimensions.get('window');

const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { loading, success, error, phoneNumber } = useSelector(
    (state: RootState) => state.auth.sendOtp,
  );

  const [phone, setPhone] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  // Navigate to OTP screen once the saga reports success
  useEffect(() => {
    if (success && phoneNumber) {
      navigation.navigate('OTP', { phoneNumber });
      dispatch(resetSendOtp());
    }
  }, [success, phoneNumber]);

  // Show error alert
  useEffect(() => {
    if (error) {
      Alert.alert('Failed to send OTP', error);
      dispatch(resetSendOtp());
    }
  }, [error]);

  const handleContinue = () => {
    if (phone.length !== 10 || loading) return;
    dispatch(sendOtp({ phone }));
  };

  const isReady = phone.length === 10;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.secondary} />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled">

          {/* Logo Section */}
          <View style={styles.logoSection}>
            <Image
              source={require('../../assets/images/logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={styles.logoSubtitle}>Aap Hi Transpport Ho</Text>
          </View>

          {/* Form Card */}
          <View style={styles.card}>
            <Text style={styles.welcomeTitle}>Welcome</Text>
            <Text style={styles.welcomeSubtitle}>
              Enter your mobile number to get started
            </Text>

            <Text style={styles.label}>Mobile Number</Text>

            {/* Phone Input Row */}
            <View style={[styles.inputRow, isFocused && styles.inputRowFocused]}>
              <View style={styles.countryCodeBox}>
                <Text style={styles.countryCode}>+91</Text>
              </View>
              <TextInput
                style={[styles.phoneInput, { fontWeight: '400', fontSize: 15 }]}
                value={phone}
                onChangeText={text => setPhone(text.replace(/[^0-9]/g, ''))}
                placeholder={isFocused ? '' : '967XXXXXXX'}
                placeholderTextColor="#aaaaaae2"
                keyboardType="phone-pad"
                maxLength={10}
                mode="flat"
                underlineColor="transparent"
                activeUnderlineColor="transparent"
                textColor={Colors.textDark}
                cursorColor={Colors.textDark}
                selectionColor={Colors.primary}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                contentStyle={styles.inputContent}
                theme={{
                  colors: {
                    placeholder: '#aaaaaae2',
                    text: Colors.textDark,
                    background: Colors.inputBg,
                  },
                }}
              />
            </View>

            {/* Continue Button */}
            <TouchableOpacity
              style={[
                styles.continueBtn,
                (!isReady || loading) && styles.continueBtnDisabled,
              ]}
              onPress={handleContinue}
              activeOpacity={0.85}
              disabled={!isReady || loading}>
              <Text style={styles.continueBtnText}>
                {loading ? 'Sending OTP...' : 'Continue'}
              </Text>
            </TouchableOpacity>

            {/* Terms */}
            <Text style={styles.termsText}>
              By continuing, you agree to our{' '}
              <Text style={styles.termsLink}>Terms of Service</Text>
              {'\n'}and{' '}
              <Text style={styles.termsLink}>Privacy Policy</Text>.
            </Text>

            {/* Test credentials hint */}
            <View style={styles.testHint}>
              <Text style={styles.testHintText}>
                Test: {TEST_PHONE}  •  OTP: {TEST_OTP}
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 30,
  },

  // Logo Section
  logoSection: {
    backgroundColor: Colors.white,
    alignItems: 'center',
    paddingVertical: 62,
    marginTop: 20,
  },
  logo: {
    width: width * 0.65,
    height: 75,
  },
  logoSubtitle: {
    fontSize: 14,
    color: Colors.textDark,
    letterSpacing: 0.3,
  },

  // Card
  card: {
    flex: 1,
    backgroundColor: Colors.white,
    paddingHorizontal: 28,
    paddingTop: 42,
    paddingBottom: 24,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.textDark,
    marginBottom: 6,
  },
  welcomeSubtitle: {
    fontSize: 14,
    color: Colors.textGray,
    marginBottom: 28,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textDark,
    marginBottom: 8,
  },

  // Input
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: Colors.inputBg,
    borderWidth: 1,
    borderColor: Colors.borderGray,
  },
  inputRowFocused: {
    borderColor: Colors.secondary,
  },
  countryCodeBox: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: Colors.inputBg,
    borderRightWidth: 1,
    borderRightColor: Colors.borderGray,
  },
  countryCode: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textDark,
  },
  phoneInput: {
    flex: 1,
    height: 50,
    backgroundColor: Colors.inputBg,
    fontSize: 15,
  },
  inputContent: {
    paddingLeft: 12,
  },

  // Button
  continueBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 20,
    elevation: 2,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  continueBtnDisabled: {
    opacity: 0.7,
  },
  continueBtnText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  // Terms
  termsText: {
    fontSize: 12,
    color: Colors.textGray,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 24,
  },
  termsLink: {
    color: Colors.secondary,
    fontWeight: '600',
  },

  // Test hint
  testHint: {
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 14,
    backgroundColor: '#FFF8E1',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FFE082',
  },
  testHintText: {
    fontSize: 12,
    color: '#795548',
    fontWeight: '600',
    letterSpacing: 0.3,
  },
});

export default LoginScreen;
