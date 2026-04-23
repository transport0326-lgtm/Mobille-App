import React from 'react';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
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
  navigation: NativeStackNavigationProp<RootStackParamList, 'BankPayment'>;
};

const BANK_ROWS = [
  { label: 'Bank Name',       value: 'State Bank of India' },
  { label: 'Account Number',  value: '•••• •••• 4521' },
  { label: 'IFSC Code',       value: 'SBIN0001234' },
  { label: 'Account Type',    value: 'Savings' },
  { label: 'Account Holder',  value: 'Jahid Hasan' },
];

const UPI_ROWS = [
  { label: 'UPI ID',    value: 'jahid.hasan@upi' },
  { label: 'Linked To', value: 'State Bank of India' },
];

const PAYOUTS = [
  { date: 'Mar 28, 2026', amount: '₹3,450', status: 'Completed' },
  { date: 'Mar 21, 2026', amount: '₹2,800', status: 'Completed' },
  { date: 'Mar 14, 2026', amount: '₹4,100', status: 'Completed' },
];

const BankPaymentScreen: React.FC<Props> = ({ navigation }) => (
  <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
    <StatusBar barStyle="light-content" backgroundColor={Colors.secondary} />

    {/* Header */}
    <View style={styles.header}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} activeOpacity={0.7}>
        <Text style={styles.backArrow}>←</Text>
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Bank & Payment Details</Text>
      <View style={{ width: 36 }} />
    </View>

    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

      {/* Verified banner */}
      <View style={styles.verifiedBanner}>
        <Text style={styles.verifiedIcon}>🏦</Text>
        <View style={styles.verifiedText}>
          <Text style={styles.verifiedTitle}>Payment Verified</Text>
          <Text style={styles.verifiedSub}>Bank account and UPI are active</Text>
        </View>
      </View>

      {/* Balance card */}
      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>Available Balance</Text>
        <Text style={styles.balanceAmount}>₹12,450</Text>
        <View style={styles.statsRow}>
          {[
            { label: 'This Week',  value: '₹3,200'  },
            { label: 'This Month', value: '₹12,450' },
            { label: 'Pending',    value: '₹1,800'  },
          ].map((s, i, arr) => (
            <React.Fragment key={i}>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>{s.label}</Text>
                <Text style={styles.statValue}>{s.value}</Text>
              </View>
              {i < arr.length - 1 && <View style={styles.statDivider} />}
            </React.Fragment>
          ))}
        </View>
        <TouchableOpacity style={styles.withdrawBtn} activeOpacity={0.85}>
          <Text style={styles.withdrawBtnText}>Withdraw to Bank</Text>
        </TouchableOpacity>
      </View>

      {/* Bank Account section */}
      <Text style={styles.sectionTitle}>Bank Account</Text>
      <View style={styles.infoCard}>
        <View style={styles.infoCardHeader}>
          <Text style={styles.infoCardIcon}>🏦</Text>
          <Text style={styles.infoCardName}>State Bank of India</Text>
          <View style={styles.verifiedBadge}>
            <View style={styles.verifiedBadge}>
              <MaterialIcons name="check" size={11} color="#16A34A" />
              <Text style={styles.verifiedBadgeText}> Verified</Text>
            </View>
          </View>
        </View>
        {BANK_ROWS.map((row, i) => (
          <View key={i} style={[styles.infoRow, i < BANK_ROWS.length - 1 && styles.infoRowBorder]}>
            <Text style={styles.infoLabel}>{row.label}</Text>
            <Text style={styles.infoValue}>{row.value}</Text>
          </View>
        ))}
      </View>

      {/* UPI section */}
      <Text style={styles.sectionTitle}>UPI ID</Text>
      <View style={styles.infoCard}>
        <View style={styles.infoCardHeader}>
          <Text style={styles.infoCardIcon}>📱</Text>
          <Text style={styles.infoCardName}>jahid.hasan@upi</Text>
          <View style={styles.verifiedBadge}>
            <View style={styles.verifiedBadge}>
              <MaterialIcons name="check" size={11} color="#16A34A" />
              <Text style={styles.verifiedBadgeText}> Verified</Text>
            </View>
          </View>
        </View>
        {UPI_ROWS.map((row, i) => (
          <View key={i} style={[styles.infoRow, i < UPI_ROWS.length - 1 && styles.infoRowBorder]}>
            <Text style={styles.infoLabel}>{row.label}</Text>
            <Text style={styles.infoValue}>{row.value}</Text>
          </View>
        ))}
      </View>

      {/* Recent Payouts section */}
      <Text style={styles.sectionTitle}>Recent Payouts</Text>
      <View style={styles.payoutsCard}>
        {PAYOUTS.map((p, i) => (
          <View key={i} style={[styles.payoutRow, i < PAYOUTS.length - 1 && styles.infoRowBorder]}>
            <Text style={styles.payoutEmoji}>💸</Text>
            <View style={styles.payoutInfo}>
              <Text style={styles.payoutDate}>{p.date}</Text>
              <Text style={styles.payoutStatus}>✓ {p.status}</Text>
            </View>
            <Text style={styles.payoutAmount}>{p.amount}</Text>
          </View>
        ))}
      </View>

    </ScrollView>

    {/* Edit button */}
    <View style={styles.footer}>
      <TouchableOpacity
        style={styles.editBtn}
        activeOpacity={0.85}
        onPress={() => navigation.navigate('EditBankDetails')}>
        <Text style={styles.editBtnText}>Edit Bank Details</Text>
      </TouchableOpacity>
    </View>
  </SafeAreaView>
);

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: Colors.secondary, paddingHorizontal: 16, paddingVertical: 14,
  },
  backBtn:     { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  backArrow: { fontSize: 22, lineHeight: 22, color: Colors.white, fontWeight: '700', includeFontPadding: false },
  headerTitle: { fontSize: 18, lineHeight: 22, fontWeight: '800', color: Colors.white, includeFontPadding: false },

  scroll: { paddingBottom: 24 },

  // Verified banner
  verifiedBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: '#F0FFF4', borderBottomWidth: 1, borderBottomColor: '#BBF7D0',
    paddingHorizontal: 20, paddingVertical: 16,
  },
  verifiedIcon:  { fontSize: 28 },
  verifiedText:  { flex: 1 },
  verifiedTitle: { fontSize: 15, fontWeight: '800', color: '#16A34A' },
  verifiedSub:   { fontSize: 12, color: '#4B8B5E', marginTop: 2 },

  // Balance card
  balanceCard: {
    backgroundColor: Colors.secondary, margin: 14, borderRadius: 16, padding: 20,
  },
  balanceLabel:  { fontSize: 13, color: 'rgba(255,255,255,0.7)', marginBottom: 4 },
  balanceAmount: { fontSize: 34, fontWeight: '800', color: Colors.white, marginBottom: 20 },
  statsRow:      { flexDirection: 'row', marginBottom: 20 },
  statItem:      { flex: 1, alignItems: 'center' },
  statLabel:     { fontSize: 11, color: 'rgba(255,255,255,0.65)', marginBottom: 4 },
  statValue:     { fontSize: 14, fontWeight: '700', color: Colors.white },
  statDivider:   { width: 1, backgroundColor: 'rgba(255,255,255,0.2)', marginVertical: 4 },
  withdrawBtn: {
    backgroundColor: Colors.primary, borderRadius: 10,
    paddingVertical: 14, alignItems: 'center',
  },
  withdrawBtnText: { color: Colors.white, fontSize: 15, fontWeight: '700' },

  // Section title
  sectionTitle: {
    fontSize: 14, fontWeight: '800', color: Colors.textDark,
    marginHorizontal: 14, marginTop: 6, marginBottom: 8,
  },

  // Info card (shared by Bank + UPI)
  infoCard: {
    backgroundColor: Colors.white, marginHorizontal: 14,
    borderRadius: 14, marginBottom: 14, overflow: 'hidden',
    elevation: 1, shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4,
  },
  infoCardHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingHorizontal: 16, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: '#F0F0F0',
  },
  infoCardIcon:  { fontSize: 22 },
  infoCardName:  { flex: 1, fontSize: 14, fontWeight: '700', color: Colors.textDark },
  verifiedBadge: { backgroundColor: '#E8F5E9', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  verifiedBadgeText: { fontSize: 11, fontWeight: '700', color: '#16A34A' },

  infoRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 13,
  },
  infoRowBorder: { borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  infoLabel: { fontSize: 13, color: Colors.textGray },
  infoValue: { fontSize: 13, fontWeight: '700', color: Colors.textDark },

  // Payouts
  payoutsCard: {
    backgroundColor: Colors.white, marginHorizontal: 14,
    borderRadius: 14, marginBottom: 14, overflow: 'hidden',
    elevation: 1, shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4,
  },
  payoutRow:   { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, gap: 12 },
  payoutEmoji: { fontSize: 20 },
  payoutInfo:  { flex: 1 },
  payoutDate:  { fontSize: 13, fontWeight: '600', color: Colors.textDark, marginBottom: 2 },
  payoutStatus:{ fontSize: 12, color: '#22C55E' },
  payoutAmount:{ fontSize: 15, fontWeight: '800', color: Colors.textDark },

  // Footer
  footer: { padding: 16, backgroundColor: Colors.white, borderTopWidth: 1, borderTopColor: Colors.borderGray },
  editBtn: {
    backgroundColor: Colors.secondary, borderRadius: 12,
    paddingVertical: 16, alignItems: 'center',
  },
  editBtnText: { color: Colors.white, fontSize: 16, fontWeight: '700' },
});

export default BankPaymentScreen;
