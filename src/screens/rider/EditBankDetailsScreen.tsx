import React, { useState, useEffect } from 'react';
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
} from 'react-native';
import { Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '../../redux/store';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { Colors } from '../../theme/theme';
import { addBankDetails } from '../../redux/sagas/bank/addBankDetailsAction';
import { resetBankDetails } from '../../redux/slices/bankDetailsSlice';
import { fetchBankDetails } from '../../redux/sagas/bank/fetchBankDetailsAction';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'EditBankDetails'>;
};

// ── Validation ────────────────────────────────────────────────────────────────

const isValidHolderName = (v: string) => v.replace(/[^a-zA-Z\s]/g, '').trim().length >= 3;
const isValidAccNo = (v: string) => /^[0-9]{9,18}$/.test(v.trim());
const isValidIFSC = (v: string) => /^[A-Z]{4}0[A-Z0-9]{6}$/.test(v.trim().toUpperCase());
const isValidUPI = (v: string) => v.trim() === '' || /^[\w.\-]+@[\w]+$/.test(v.trim());

// ── Screen ────────────────────────────────────────────────────────────────────

const EditBankDetailsScreen: React.FC<Props> = ({ navigation }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { loading, success, error } = useSelector((state: RootState) => state.bankDetails);
  const existingData = useSelector((state: RootState) => state.riderBankDetails.data);

  const existingBank = existingData?.bankAccount;
  const isEditing = !!(existingBank?.accountNumber || existingBank?.bankName);

  const [holderName, setHolderName] = useState(existingBank?.accountHolderName ?? '');
  const [bankName, setBankName] = useState(existingBank?.bankName ?? '');
  const [accountNo, setAccountNo] = useState(existingBank?.accountNumber ?? '');
  const [confirmNo, setConfirmNo] = useState(existingBank?.accountNumber ?? '');
  const [ifscCode, setIfscCode] = useState(existingBank?.ifscCode ?? '');
  const [upiId, setUpiId] = useState(existingData?.upiId ?? '');
  const [accountType, setAccountType] = useState<'savings' | 'current'>(
    existingBank?.accountType === 'current' ? 'current' : 'savings',
  );

  const [touched, setTouch] = useState<Record<string, boolean>>({});
  const touch = (f: string) => setTouch(p => ({ ...p, [f]: true }));

  useEffect(() => {
    if (success) {
      dispatch(resetBankDetails());
      dispatch(fetchBankDetails());
      navigation.goBack();
    }
  }, [success]);

  const errors = {
    holderName: touched.holderName && !isValidHolderName(holderName)
      ? 'Enter full name (at least 3 letters)' : null,
    bankName: touched.bankName && bankName.trim().length < 2
      ? 'Enter bank name' : null,
    accountNo: touched.accountNo && !isValidAccNo(accountNo)
      ? 'Account number must be 9–18 digits' : null,
    confirmNo: touched.confirmNo && accountNo !== confirmNo
      ? 'Account numbers do not match' : null,
    ifscCode: touched.ifscCode && !isValidIFSC(ifscCode)
      ? 'Enter a valid IFSC code (e.g. SBIN0001234)' : null,
    upiId: touched.upiId && !isValidUPI(upiId)
      ? 'Enter a valid UPI ID (e.g. name@upi)' : null,
  };

  const isFormValid =
    isValidHolderName(holderName) &&
    bankName.trim().length >= 2 &&
    isValidAccNo(accountNo) &&
    accountNo === confirmNo &&
    isValidIFSC(ifscCode) &&
    isValidUPI(upiId);

  const handleSave = () => {
    setTouch({ holderName: true, bankName: true, accountNo: true, confirmNo: true, ifscCode: true, upiId: true });
    if (!isFormValid || loading) return;
    dispatch(addBankDetails({
      accountHolderName: holderName.trim(),
      bankName: bankName.trim(),
      accountNumber: accountNo.trim(),
      confirmAccountNumber: confirmNo.trim(),
      ifscCode: ifscCode.trim().toUpperCase(),
      upiId: upiId.trim(),
      accountType,
    }));
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
        <Text style={styles.headerTitle}>{isEditing ? 'Edit Bank Account' : 'Add Bank Account'}</Text>
        <View style={{ width: 36 }} />
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">

          <Text style={styles.sectionTitle}>Bank Account Details</Text>

          {error ? <Text style={styles.apiError}>{error}</Text> : null}

          {/* Account Holder Name */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Account Holder Name <Text style={styles.required}>*</Text></Text>
            <TextInput
              style={[styles.fieldInput, errors.holderName ? styles.fieldInputError : null]}
              value={holderName}
              onChangeText={setHolderName}
              onBlur={() => touch('holderName')}
              placeholder="Enter full name as per bank"
              placeholderTextColor="#AAAAAA"
              autoCapitalize="words"
            />
            {errors.holderName ? <Text style={styles.fieldError}>{errors.holderName}</Text> : null}
          </View>

          {/* Bank Name */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Bank Name <Text style={styles.required}>*</Text></Text>
            <TextInput
              style={[styles.fieldInput, errors.bankName ? styles.fieldInputError : null]}
              value={bankName}
              onChangeText={setBankName}
              onBlur={() => touch('bankName')}
              placeholder="e.g. State Bank of India"
              placeholderTextColor="#AAAAAA"
              autoCapitalize="words"
            />
            {errors.bankName ? <Text style={styles.fieldError}>{errors.bankName}</Text> : null}
          </View>

          {/* Account Number */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Account Number <Text style={styles.required}>*</Text></Text>
            <TextInput
              style={[styles.fieldInput, errors.accountNo ? styles.fieldInputError : null]}
              value={accountNo}
              onChangeText={setAccountNo}
              onBlur={() => touch('accountNo')}
              placeholder="Enter account number"
              placeholderTextColor="#AAAAAA"
              keyboardType="numeric"
            />
            {errors.accountNo ? <Text style={styles.fieldError}>{errors.accountNo}</Text> : null}
          </View>

          {/* Confirm Account Number */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Confirm Account Number <Text style={styles.required}>*</Text></Text>
            <TextInput
              style={[styles.fieldInput, errors.confirmNo ? styles.fieldInputError : null]}
              value={confirmNo}
              onChangeText={setConfirmNo}
              onBlur={() => touch('confirmNo')}
              placeholder="Re-enter account number"
              placeholderTextColor="#AAAAAA"
              keyboardType="numeric"
              secureTextEntry
            />
            {errors.confirmNo ? <Text style={styles.fieldError}>{errors.confirmNo}</Text> : null}
          </View>

          {/* IFSC Code */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>IFSC Code <Text style={styles.required}>*</Text></Text>
            <TextInput
              style={[styles.fieldInput, errors.ifscCode ? styles.fieldInputError : null]}
              value={ifscCode}
              onChangeText={v => setIfscCode(v.toUpperCase())}
              onBlur={() => touch('ifscCode')}
              placeholder="e.g. SBIN0001234"
              placeholderTextColor="#AAAAAA"
              autoCapitalize="characters"
            />
            {errors.ifscCode ? <Text style={styles.fieldError}>{errors.ifscCode}</Text> : null}
          </View>

          {/* UPI ID (Optional) */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>UPI ID <Text style={styles.optional}>(Optional)</Text></Text>
            <TextInput
              style={[styles.fieldInput, errors.upiId ? styles.fieldInputError : null]}
              value={upiId}
              onChangeText={setUpiId}
              onBlur={() => touch('upiId')}
              placeholder="e.g. yourname@upi"
              placeholderTextColor="#AAAAAA"
              keyboardType="email-address"
              autoCapitalize="none"
            />
            {errors.upiId ? <Text style={styles.fieldError}>{errors.upiId}</Text> : null}
          </View>

          {/* Security note */}
          <View style={styles.securityNote}>
            <Text style={styles.securityIcon}>🔒</Text>
            <Text style={styles.securityText}>Your bank details are encrypted and secure</Text>
          </View>

          {/* Account Type toggle */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Account Type</Text>
            <View style={styles.toggleRow}>
              <TouchableOpacity
                style={[styles.toggleBtn, accountType === 'savings' && styles.toggleBtnActive]}
                onPress={() => setAccountType('savings')}
                activeOpacity={0.8}>
                <Text style={[styles.toggleBtnText, accountType === 'savings' && styles.toggleBtnTextActive]}>
                  Savings
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.toggleBtn, accountType === 'current' && styles.toggleBtnActive]}
                onPress={() => setAccountType('current')}
                activeOpacity={0.8}>
                <Text style={[styles.toggleBtnText, accountType === 'current' && styles.toggleBtnTextActive]}>
                  Current
                </Text>
              </TouchableOpacity>
            </View>
          </View>

        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.saveBtn, (!isFormValid || loading) && { opacity: 0.5 }]}
            activeOpacity={0.85}
            onPress={handleSave}
            disabled={loading}>
            {loading
              ? <ActivityIndicator color={Colors.white} />
              : <Text style={styles.saveBtnText}>{isEditing ? 'Update Bank Account' : 'Save Bank Account'}</Text>}
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancelBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
            <Text style={styles.cancelBtnText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.white },

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

  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingTop: 20, paddingBottom: 8 },

  sectionTitle: { fontSize: 16, fontWeight: '800', color: Colors.textDark, marginBottom: 18 },

  apiError: { fontSize: 13, color: '#DC2626', textAlign: 'center', marginBottom: 12 },

  fieldGroup: { marginBottom: 14 },
  fieldLabel: { fontSize: 13, fontWeight: '600', color: Colors.textDark, marginBottom: 6 },
  required: { color: '#DC2626' },
  optional: { color: Colors.textGray, fontWeight: '400' },
  fieldInput: {
    backgroundColor: Colors.white,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.borderGray,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 15,
    color: Colors.textDark,
  },
  fieldInputError: { borderColor: '#DC2626' },
  fieldError: { fontSize: 12, color: '#DC2626', marginTop: 4, marginLeft: 2 },

  securityNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 18,
  },
  securityIcon: { fontSize: 13 },
  securityText: { fontSize: 12, color: Colors.textGray },

  toggleRow: { flexDirection: 'row', gap: 10 },
  toggleBtn: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: Colors.borderGray,
    backgroundColor: Colors.white,
  },
  toggleBtnActive: {
    backgroundColor: Colors.secondary,
    borderColor: Colors.secondary,
  },
  toggleBtnText: { fontSize: 14, fontWeight: '600', color: Colors.textGray },
  toggleBtnTextActive: { color: Colors.white },

  footer: { paddingHorizontal: 16, paddingBottom: 16, paddingTop: 8, backgroundColor: Colors.white },
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
    marginBottom: 10,
  },
  saveBtnText: { color: Colors.white, fontSize: 16, fontWeight: '800' },
  cancelBtn: { alignItems: 'center', paddingVertical: 6 },
  cancelBtnText: { fontSize: 15, fontWeight: '600', color: Colors.textGray },
});

export default EditBankDetailsScreen;
