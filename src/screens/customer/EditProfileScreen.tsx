import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Image,
  Modal,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '../../redux/store';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { Colors } from '../../theme/theme';
import { updateProfile } from '../../redux/sagas/profile/updateProfileAction';
import { resetUpdateProfile } from '../../redux/slices/updateProfileSlice';
import { sendChangePhoneOtp, verifyChangePhoneOtp } from '../../redux/sagas/profile/changePhoneAction';
import { resetChangePhone, resetSendOtp } from '../../redux/slices/changePhoneSlice';

type EditProfileScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'EditProfile'>;
};

const getInitials = (name: string) => {
  const parts = name.trim().split(' ').filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const EditProfileScreen: React.FC<EditProfileScreenProps> = ({ navigation }) => {
  const dispatch = useDispatch<AppDispatch>();

  const { data } = useSelector((state: RootState) => state.profile);
  const { loading, success, error } = useSelector((state: RootState) => state.updateProfile);
  const { sendOtp, verifyOtp } = useSelector((state: RootState) => state.changePhone);
  const user = data?.user;

  const [fullName, setFullName] = useState('');
  const [phone, setPhone]       = useState('');
  const [email, setEmail]       = useState('');
  const [nameError, setNameError]   = useState('');
  const [emailError, setEmailError] = useState('');

  // Phone change modal
  const [phoneModalVisible, setPhoneModalVisible] = useState(false);
  const [modalStep, setModalStep] = useState<'phone' | 'otp'>('phone');
  const [newPhone, setNewPhone] = useState('');
  const [newPhoneError, setNewPhoneError] = useState('');
  const [otpValues, setOtpValues] = useState(['', '', '', '']);
  const otpRefs = [
    useRef<TextInput>(null),
    useRef<TextInput>(null),
    useRef<TextInput>(null),
    useRef<TextInput>(null),
  ];

  useEffect(() => {
    if (user) {
      setFullName(user.name  || '');
      setPhone(user.phone    || '');
      setEmail(user.email    || '');
    }
  }, [user]);

  useEffect(() => {
    if (success) {
      dispatch(resetUpdateProfile());
      navigation.goBack();
    }
  }, [success]);

  const validate = () => {
    let valid = true;
    const trimmedName  = fullName.trim();
    const trimmedEmail = email.trim();

    if (!trimmedName) {
      setNameError('Name is required.');
      valid = false;
    } else if (trimmedName.length < 2) {
      setNameError('Name must be at least 2 characters.');
      valid = false;
    } else if (!/^[a-zA-Z\s]+$/.test(trimmedName)) {
      setNameError('Name can only contain letters and spaces.');
      valid = false;
    } else {
      setNameError('');
    }

    if (trimmedEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setEmailError('Enter a valid email address.');
      valid = false;
    } else {
      setEmailError('');
    }

    return valid;
  };

  const handleSave = () => {
    if (!validate()) return;
    dispatch(updateProfile({ name: fullName.trim(), phone: phone.trim(), email: email.trim() }));
  };

  // ── Phone modal helpers ──────────────────────────────────────────────────────
  const openPhoneModal = () => {
    setNewPhone('');
    setNewPhoneError('');
    setOtpValues(['', '', '', '']);
    setModalStep('phone');
    setPhoneModalVisible(true);
  };

  const closePhoneModal = () => {
    setPhoneModalVisible(false);
    setModalStep('phone');
    setNewPhone('');
    setOtpValues(['', '', '', '']);
    setNewPhoneError('');
  };

  useEffect(() => {
    if (sendOtp.success) {
      dispatch(resetSendOtp());
      setModalStep('otp');
      setTimeout(() => otpRefs[0].current?.focus(), 100);
    }
    if (sendOtp.error) setNewPhoneError(sendOtp.error);
  }, [sendOtp.success, sendOtp.error]);

  useEffect(() => {
    if (verifyOtp.success) {
      setPhone(newPhone.replace(/[^0-9]/g, ''));
      dispatch(resetChangePhone());
      closePhoneModal();
    }
  }, [verifyOtp.success]);

  const handlePhoneContinue = () => {
    const digits = newPhone.replace(/[^0-9]/g, '');
    if (digits.length !== 10) {
      setNewPhoneError('Enter a valid 10-digit mobile number.');
      return;
    }
    setNewPhoneError('');
    dispatch(sendChangePhoneOtp({ newPhone: digits }));
  };

  const handleOtpChange = (value: string, index: number) => {
    const digit = value.replace(/[^0-9]/g, '').slice(-1);
    const next = [...otpValues];
    next[index] = digit;
    setOtpValues(next);
    if (digit && index < 3) otpRefs[index + 1].current?.focus();
    if (next.every(d => d !== '')) handleOtpVerify(next);
  };

  const handleOtpKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && !otpValues[index] && index > 0) {
      otpRefs[index - 1].current?.focus();
    }
  };

  const handleOtpVerify = (values: string[] = otpValues) => {
    if (values.some(d => d === '')) return;
    dispatch(verifyChangePhoneOtp({ newPhone: newPhone.replace(/[^0-9]/g, ''), otp: values.join('') }));
  };

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
        <Text style={styles.headerTitle}>Edit Profile</Text>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">

          {/* Avatar */}
          <View style={styles.avatarSection}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarText}>{fullName ? getInitials(fullName) : '?'}</Text>
            </View>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            {/* Full Name */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Full Name</Text>
              <TextInput
                style={[styles.fieldInput, nameError ? styles.fieldInputError : null]}
                value={fullName}
                onChangeText={v => { setFullName(v); if (nameError) setNameError(''); }}
                placeholder="Enter your name"
                placeholderTextColor="#AAAAAA"
                autoCapitalize="words"
              />
              {nameError ? <Text style={styles.fieldError}>{nameError}</Text> : null}
            </View>

            {/* Phone Number — read-only with edit icon */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Phone Number</Text>
              <View style={styles.phoneRow}>
                <TextInput
                  style={[styles.fieldInput, styles.phoneInput]}
                  value={phone}
                  editable={false}
                  placeholder="Phone number"
                  placeholderTextColor="#AAAAAA"
                />
                <TouchableOpacity style={styles.phoneEditBtn} onPress={openPhoneModal} activeOpacity={0.7}>
                  <MaterialIcons name="edit" size={18} color={Colors.secondary} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Email */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Email Address</Text>
              <TextInput
                style={[styles.fieldInput, emailError ? styles.fieldInputError : null]}
                value={email}
                onChangeText={v => { setEmail(v); if (emailError) setEmailError(''); }}
                placeholder="Enter your email"
                placeholderTextColor="#AAAAAA"
                keyboardType="email-address"
                autoCapitalize="none"
              />
              {emailError ? <Text style={styles.fieldError}>{emailError}</Text> : null}
            </View>
          </View>
        </ScrollView>

        {/* Save Button */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.saveBtn, loading && styles.saveBtnDisabled]}
            activeOpacity={0.85}
            onPress={handleSave}
            disabled={loading}>
            {loading
              ? <ActivityIndicator color={Colors.white} />
              : <Text style={styles.saveBtnText}>Save Changes</Text>}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {/* ── Phone Change Modal ───────────────────────────────────────────────── */}
      <Modal visible={phoneModalVisible} transparent animationType="slide" onRequestClose={closePhoneModal}>
        <KeyboardAvoidingView style={styles.modalOverlay} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <View style={styles.modalSheet}>

            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {modalStep === 'phone' ? 'Change Mobile Number' : 'Verify OTP'}
              </Text>
              <TouchableOpacity onPress={closePhoneModal} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <MaterialIcons name="close" size={22} color={Colors.secondary} />
              </TouchableOpacity>
            </View>

            {modalStep === 'phone' ? (
              <>
                <Text style={styles.modalSubtitle}>
                  Enter your new mobile number. An OTP will be sent to verify it.
                </Text>

                <Text style={styles.modalLabel}>New Mobile Number</Text>
                <View style={styles.modalInputRow}>
                  <MaterialIcons name="phone" size={18} color="#808080" style={{ marginRight: 10 }} />
                  <TextInput
                    style={styles.modalInput}
                    value={newPhone}
                    onChangeText={v => { setNewPhone(v.replace(/[^0-9]/g, '').slice(0, 10)); setNewPhoneError(''); }}
                    placeholder="Enter 10-digit number"
                    placeholderTextColor="#AAAAAA"
                    keyboardType="number-pad"
                    maxLength={10}
                    autoFocus
                  />
                </View>
                {newPhoneError ? <Text style={styles.modalFieldError}>{newPhoneError}</Text> : null}

                <TouchableOpacity
                  style={[styles.modalBtn, (newPhone.length !== 10 || sendOtp.loading) && styles.modalBtnDisabled]}
                  onPress={handlePhoneContinue}
                  disabled={newPhone.length !== 10 || sendOtp.loading}
                  activeOpacity={0.85}>
                  {sendOtp.loading
                    ? <ActivityIndicator color={Colors.white} />
                    : <Text style={styles.modalBtnText}>Continue</Text>}
                </TouchableOpacity>
              </>
            ) : (
              <>
                <Text style={styles.modalSubtitle}>
                  Enter the 4-digit OTP sent to{' '}
                  <Text style={{ fontWeight: '700', color: Colors.secondary }}>+91 {newPhone}</Text>
                </Text>

                <View style={styles.otpRow}>
                  {otpValues.map((digit, i) => (
                    <TextInput
                      key={i}
                      ref={otpRefs[i]}
                      style={[styles.otpBox, digit ? styles.otpBoxFilled : null]}
                      value={digit}
                      onChangeText={v => handleOtpChange(v, i)}
                      onKeyPress={({ nativeEvent }) => handleOtpKeyPress(nativeEvent.key, i)}
                      keyboardType="number-pad"
                      maxLength={1}
                      textAlign="center"
                    />
                  ))}
                </View>

                {verifyOtp.error ? <Text style={styles.modalFieldError}>{verifyOtp.error}</Text> : null}

                <TouchableOpacity
                  style={[styles.modalBtn, (otpValues.some(d => !d) || verifyOtp.loading) && styles.modalBtnDisabled]}
                  onPress={() => handleOtpVerify()}
                  disabled={otpValues.some(d => !d) || verifyOtp.loading}
                  activeOpacity={0.85}>
                  {verifyOtp.loading
                    ? <ActivityIndicator color={Colors.white} />
                    : <Text style={styles.modalBtnText}>Verify & Update</Text>}
                </TouchableOpacity>

                <TouchableOpacity onPress={() => setModalStep('phone')} style={styles.backToPhoneBtn}>
                  <Text style={styles.backToPhoneText}>Change number</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },

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
  scrollContent: { paddingBottom: 16 },

  avatarSection: {
    alignItems: 'center',
    paddingTop: 28,
    paddingBottom: 24,
    backgroundColor: Colors.background,
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.white,
  },

  form: {
    backgroundColor: Colors.background,
    paddingHorizontal: 16,
  },
  errorText: {
    fontSize: 13,
    color: '#DC2626',
    marginBottom: 12,
    textAlign: 'center',
  },
  fieldGroup: { marginBottom: 4 },
  fieldLabel: {
    fontSize: 15,
    color: Colors.textGray,
    marginBottom: 4,
    marginLeft: 2,
  },
  fieldInput: {
    backgroundColor: Colors.white,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.borderGray,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 15,
    color: Colors.textDark,
    marginBottom: 12,
  },
  fieldInputError: {
    borderColor: '#DC2626',
  },
  fieldError: {
    fontSize: 12,
    color: '#DC2626',
    marginTop: -8,
    marginBottom: 10,
    marginLeft: 2,
  },

  // Phone row with edit icon
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  phoneInput: {
    flex: 1,
    marginBottom: 0,
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
    borderRightWidth: 0,
    backgroundColor: '#F3F4F6',
    color: Colors.textGray,
  },
  phoneEditBtn: {
    height: 52,
    paddingHorizontal: 14,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.borderGray,
    borderTopRightRadius: 10,
    borderBottomRightRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },

  footer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: Colors.background,
  },
  saveBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    elevation: 3,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  saveBtnDisabled: { opacity: 0.6 },
  saveBtnText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '800',
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 36,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.secondary,
  },
  modalSubtitle: {
    fontSize: 13,
    color: Colors.textGray,
    lineHeight: 20,
    marginBottom: 20,
  },
  modalLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textDark,
    marginBottom: 8,
  },
  modalInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.inputBg,
    borderWidth: 1,
    borderColor: Colors.borderGray,
    borderRadius: 10,
    paddingHorizontal: 14,
    height: 52,
    marginBottom: 8,
  },
  modalInput: {
    flex: 1,
    fontSize: 15,
    color: Colors.textDark,
  },
  modalFieldError: {
    fontSize: 12,
    color: '#DC2626',
    marginBottom: 12,
    marginLeft: 2,
  },
  modalBtn: {
    backgroundColor: Colors.secondary,
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 16,
  },
  modalBtnDisabled: { opacity: 0.5 },
  modalBtnText: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: '700',
  },

  // OTP boxes
  otpRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 14,
    marginBottom: 8,
    marginTop: 8,
  },
  otpBox: {
    width: 56,
    height: 56,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.borderGray,
    backgroundColor: Colors.inputBg,
    fontSize: 22,
    fontWeight: '700',
    color: Colors.secondary,
  },
  otpBoxFilled: {
    borderColor: Colors.secondary,
    backgroundColor: '#EFF3FF',
  },
  backToPhoneBtn: {
    alignItems: 'center',
    marginTop: 14,
  },
  backToPhoneText: {
    fontSize: 13,
    color: Colors.secondary,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});

export default EditProfileScreen;
