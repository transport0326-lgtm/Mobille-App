import React from 'react';
import {
  View,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { Colors } from '../../theme/theme';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'VehicleDetails'>;
};

type InfoRow = { label: string; value: string; accent?: boolean };

const VEHICLE_INFO: InfoRow[] = [
  { label: 'Vehicle Type', value: 'Bike' },
  { label: 'Make & Model', value: 'Honda Shine 125', accent: true },
  { label: 'Color',        value: 'Blue',            accent: true },
  { label: 'Year',         value: '2022',            accent: true },
  { label: 'Fuel Type',    value: 'Petrol',          accent: true },
];

const REGISTRATION: InfoRow[] = [
  { label: 'Registration No.',  value: 'WB-02-AB-3456',  accent: true },
  { label: 'RC Card Number',    value: 'RC-2022-87654',  accent: true },
  { label: 'RC Expiry',         value: '15 Mar 2027',    accent: true },
  { label: 'Status',            value: '✓ Active',       accent: true },
];

const INSURANCE: InfoRow[] = [
  { label: 'Insurance Provider', value: 'HDFC Ergo',    accent: true },
  { label: 'Policy No.',         value: 'INS-456789',   accent: true },
  { label: 'Insurance Expiry',   value: '20 Sep 2026',  accent: true },
  { label: 'Fitness Valid Till', value: '10 Jan 2027',  accent: true },
];

const Section: React.FC<{ title: string; rows: InfoRow[] }> = ({ title, rows }) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>{title}</Text>
    {rows.map((row, i) => (
      <View key={i} style={[styles.row, i < rows.length - 1 && styles.rowBorder]}>
        <Text style={styles.rowLabel}>{row.label}</Text>
        <Text style={[styles.rowValue, row.accent && styles.rowValueAccent]}>
          {row.value}
        </Text>
      </View>
    ))}
  </View>
);

const VehicleDetailsScreen: React.FC<Props> = ({ navigation }) => (
  <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
    <StatusBar barStyle="light-content" backgroundColor={Colors.secondary} />

    {/* Header */}
    <View style={styles.header}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
        <Text style={styles.backArrow}>←</Text>
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Vehicle Details</Text>
      <View style={{ width: 40 }} />
    </View>

    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

      {/* Vehicle identity card */}
      <View style={styles.identityCard}>
        <Text style={styles.bikeEmoji}>🏍️</Text>
        <Text style={styles.plateText}>WB-02-AB-3456</Text>
        <View style={styles.verifiedBadge}>
          <Text style={styles.verifiedText}>✓ Verified</Text>
        </View>
      </View>

      <Section title="Vehicle Information" rows={VEHICLE_INFO} />
      <Section title="Registration"        rows={REGISTRATION} />
      <Section title="Insurance & Fitness" rows={INSURANCE} />

    </ScrollView>

    {/* Edit button */}
    <View style={styles.footer}>
      <TouchableOpacity style={styles.editBtn} activeOpacity={0.85} onPress={() => navigation.navigate('EditVehicleDetails')}>
        <Text style={styles.editBtnText}>Edit Vehicle Details</Text>
      </TouchableOpacity>
    </View>
  </SafeAreaView>
);

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12, backgroundColor: Colors.secondary,
  },
  backBtn:     { width: 40, height: 40, justifyContent: 'center' },
  backArrow: { fontSize: 22, lineHeight: 22, color: Colors.white, fontWeight: '600', includeFontPadding: false },
  headerTitle: { fontSize: 17, lineHeight: 22, fontWeight: '700', color: Colors.white, includeFontPadding: false },

  scroll: { paddingBottom: 24 },

  // Identity card
  identityCard: {
    backgroundColor: Colors.secondary,
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 28,
  },
  bikeEmoji:     { fontSize: 36, marginBottom: 8 },
  plateText:     { fontSize: 22, fontWeight: '800', color: Colors.white, letterSpacing: 1, marginBottom: 10 },
  verifiedBadge: { backgroundColor: 'rgba(34,197,94,0.2)', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 4, borderWidth: 1, borderColor: '#22C55E' },
  verifiedText:  { fontSize: 13, fontWeight: '700', color: '#22C55E' },

  // Sections
  section: {
    backgroundColor: Colors.white, marginTop: 10,
    paddingHorizontal: 20, paddingTop: 16, paddingBottom: 4,
  },
  sectionTitle: { fontSize: 14, fontWeight: '800', color: Colors.textDark, marginBottom: 12 },

  row:           { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12 },
  rowBorder:     { borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  rowLabel:      { fontSize: 13, color: Colors.textGray },
  rowValue:      { fontSize: 13, fontWeight: '500', color: Colors.textDark },
  rowValueAccent:{ fontWeight: '700' },

  // Footer
  footer: { padding: 16, backgroundColor: Colors.white, borderTopWidth: 1, borderTopColor: Colors.borderGray },
  editBtn: {
    backgroundColor: Colors.secondary, borderRadius: 12,
    paddingVertical: 16, alignItems: 'center',
  },
  editBtnText: { color: Colors.white, fontSize: 16, fontWeight: '700' },
});

export default VehicleDetailsScreen;
