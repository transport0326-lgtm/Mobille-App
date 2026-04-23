import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { Colors } from '../../theme/theme';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'EditVehicleDetails'>;
};

const EditVehicleDetailsScreen: React.FC<Props> = ({ navigation }) => {
  const [vehicleType, setVehicleType]   = useState('Bike');
  const [makeModel, setMakeModel]       = useState('Honda Shine 125');
  const [color, setColor]               = useState('Blue');
  const [year, setYear]                 = useState('2022');
  const [fuelType, setFuelType]         = useState('Petrol');
  const [regNo, setRegNo]               = useState('WB-02-AB-3456');
  const [rcCard, setRcCard]             = useState('RC-2022-87654');
  const [rcExpiry, setRcExpiry]         = useState('15 Mar 2027');
  const [insProvider, setInsProvider]   = useState('HDFC Ergo');
  const [policyNo, setPolicyNo]         = useState('INS-456789');
  const [insExpiry, setInsExpiry]       = useState('20 Sep 2026');
  const [fitnessValid, setFitnessValid] = useState('10 Jan 2027');

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.secondary} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} activeOpacity={0.7}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Vehicle Details</Text>
        <View style={{ width: 36 }} />
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">

          {/* Vehicle Information */}
          <Text style={styles.sectionLabel}>Vehicle Information</Text>
          <View style={styles.form}>
            <Field label="Vehicle Type"  value={vehicleType}  onChange={setVehicleType} />
            <Field label="Make & Model"  value={makeModel}    onChange={setMakeModel} />
            <Field label="Color"         value={color}        onChange={setColor} />
            <Field label="Year"          value={year}         onChange={setYear} keyboardType="numeric" />
            <Field label="Fuel Type"     value={fuelType}     onChange={setFuelType} />
          </View>

          {/* Registration */}
          <Text style={styles.sectionLabel}>Registration</Text>
          <View style={styles.form}>
            <Field label="Registration No."  value={regNo}    onChange={setRegNo} />
            <Field label="RC Card Number"    value={rcCard}   onChange={setRcCard} />
            <Field label="RC Expiry"         value={rcExpiry} onChange={setRcExpiry} />
          </View>

          {/* Insurance & Fitness */}
          <Text style={styles.sectionLabel}>Insurance & Fitness</Text>
          <View style={styles.form}>
            <Field label="Insurance Provider"  value={insProvider}  onChange={setInsProvider} />
            <Field label="Policy No."          value={policyNo}     onChange={setPolicyNo} />
            <Field label="Insurance Expiry"    value={insExpiry}    onChange={setInsExpiry} />
            <Field label="Fitness Valid Till"  value={fitnessValid} onChange={setFitnessValid} />
          </View>

        </ScrollView>

        {/* Save Button */}
        <View style={styles.footer}>
          <TouchableOpacity style={styles.saveBtn} activeOpacity={0.85} onPress={() => navigation.goBack()}>
            <Text style={styles.saveBtnText}>Save Changes</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

// ── Reusable field ──────────────────────────────────────────────────────────

type FieldProps = {
  label: string;
  value: string;
  onChange: (v: string) => void;
  keyboardType?: 'default' | 'numeric' | 'phone-pad' | 'email-address';
};

const Field: React.FC<FieldProps> = ({ label, value, onChange, keyboardType = 'default' }) => (
  <View style={styles.fieldGroup}>
    <Text style={styles.fieldLabel}>{label}</Text>
    <TextInput
      style={styles.fieldInput}
      value={value}
      onChangeText={onChange}
      keyboardType={keyboardType}
      placeholderTextColor="#AAAAAA"
    />
  </View>
);

// ── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: Colors.secondary, paddingHorizontal: 16, paddingVertical: 14,
  },
  backBtn:     { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  backArrow: { fontSize: 22, lineHeight: 22, color: Colors.white, fontWeight: '700', includeFontPadding: false },
  headerTitle: { fontSize: 18, lineHeight: 22, fontWeight: '800', color: Colors.white, includeFontPadding: false },

  scroll:        { flex: 1 },
  scrollContent: { paddingBottom: 16 },

  sectionLabel: {
    fontSize: 13, fontWeight: '700', color: Colors.textGray,
    paddingHorizontal: 18, paddingTop: 20, paddingBottom: 8,
    textTransform: 'uppercase', letterSpacing: 0.5,
  },

  form:       { backgroundColor: Colors.background, paddingHorizontal: 16 },
  fieldGroup: { marginBottom: 4 },
  fieldLabel: { fontSize: 12, color: Colors.textGray, marginBottom: 4, marginLeft: 2 },
  fieldInput: {
    backgroundColor: Colors.white, borderRadius: 10,
    borderWidth: 1, borderColor: Colors.borderGray,
    paddingHorizontal: 14, paddingVertical: 14,
    fontSize: 15, color: Colors.textDark, marginBottom: 12,
  },

  footer: { paddingHorizontal: 16, paddingVertical: 16, backgroundColor: Colors.background },
  saveBtn: {
    backgroundColor: Colors.primary, borderRadius: 12, paddingVertical: 16, alignItems: 'center',
    elevation: 3, shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8,
  },
  saveBtnText: { color: Colors.white, fontSize: 16, fontWeight: '800' },
});

export default EditVehicleDetailsScreen;
