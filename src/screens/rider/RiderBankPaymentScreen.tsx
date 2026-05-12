import React, { useEffect } from 'react';
import {
  View,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  ScrollView,
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
import { fetchBankDetails } from '../../redux/sagas/bank/fetchBankDetailsAction';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'RiderBankPayment'>;
};

const fmt = (amount: number) =>
  `₹${amount.toLocaleString('en-IN')}`;

const fmtDate = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

const RiderBankPaymentScreen: React.FC<Props> = ({ navigation }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { data, loading } = useSelector((state: RootState) => state.riderBankDetails);

  useEffect(() => {
    dispatch(fetchBankDetails());
  }, []);

  const balance = data?.availableBalance ?? 0;
  const thisWeek = data?.earnings?.thisWeek ?? 0;
  const thisMonth = data?.earnings?.thisMonth ?? 0;
  const pending = data?.earnings?.pending ?? 0;

  const bank = data?.bankAccount;
  const hasBankData = !!(bank?.accountNumber || bank?.bankName);
  const bankName = bank?.bankName ?? '—';
  const accNo = bank?.accountNumber ? `●●●● ●●●● ${String(bank.accountNumber).slice(-4)}` : '—';
  const ifsc = bank?.ifscCode ?? '—';
  const upiId = data?.upiId || '—';
  const hasUpi = !!(data?.upiId);
  const payouts: any[] = data?.recentPayouts ?? [];

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
        <Text style={styles.headerTitle}>Bank & Payment Details</Text>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Balance Card */}
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Available Balance</Text>
          {loading
            ? <ActivityIndicator size="large" color={Colors.white} style={{ marginBottom: 18 }} />
            : <Text style={styles.balanceAmount}>{fmt(balance)}</Text>
          }

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>This Week</Text>
              <Text style={styles.statValue}>{fmt(thisWeek)}</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>This Month</Text>
              <Text style={styles.statValue}>{fmt(thisMonth)}</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Pending</Text>
              <Text style={styles.statValue}>{fmt(pending)}</Text>
            </View>
          </View>

        </View>

        {/* Linked Bank Account */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Linked Bank Account</Text>
            {!loading && hasBankData && (
              <TouchableOpacity
                onPress={() => navigation.navigate('EditBankDetails')}
                activeOpacity={0.7}
                style={styles.editBtn}>
                <Text style={styles.editBtnText}>Edit ✏️</Text>
              </TouchableOpacity>
            )}
          </View>

          {loading ? (
            <ActivityIndicator size="small" color={Colors.primary} style={{ marginVertical: 12 }} />
          ) : hasBankData ? (
            <View style={styles.bankCard}>
              <View style={styles.bankCardLeft}>
                <View style={styles.bankIconBox}>
                  <Text style={styles.bankIconEmoji}>🏦</Text>
                </View>
                <View>
                  <Text style={styles.bankName}>{bankName}</Text>
                  <Text style={styles.bankAccNo}>A/C: {accNo}</Text>
                  <Text style={styles.bankIfsc}>IFSC: {ifsc}</Text>
                </View>
              </View>
              {/* <Text style={styles.verifiedIcon}>✅</Text> */}
            </View>
          ) : (
            <Text style={styles.emptyMsg}>No bank account linked yet. Add one to receive payments.</Text>
          )}

          {!loading && !hasBankData && (
            <TouchableOpacity
              style={styles.addBankBtn}
              activeOpacity={0.8}
              onPress={() => navigation.navigate('EditBankDetails')}>
              <Text style={styles.addBankBtnText}>+ Add Bank Account</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* UPI ID */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>UPI ID</Text>

          {loading ? (
            <ActivityIndicator size="small" color={Colors.primary} style={{ marginTop: 12 }} />
          ) : hasUpi ? (
            <View style={[styles.upiRow, { marginTop: 12 }]}>
              <Text style={styles.upiIcon}>📱</Text>
              <Text style={styles.upiId}>{upiId}</Text>
            </View>
          ) : (
            <Text style={styles.emptyMsg}>No UPI ID linked yet.</Text>
          )}
        </View>

        {/* Recent Payouts */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Payouts</Text>

          {loading ? (
            <ActivityIndicator size="small" color={Colors.primary} style={{ marginVertical: 12 }} />
          ) : payouts.length === 0 ? (
            <Text style={styles.emptyPayouts}>No payouts yet.</Text>
          ) : (
            payouts.map((item: any, index: number) => (
              <View
                key={index}
                style={[styles.payoutRow, index < payouts.length - 1 && styles.payoutRowBorder]}>
                <View>
                  <Text style={styles.payoutDate}>{fmtDate(item.date ?? item.createdAt)}</Text>
                  <Text style={styles.payoutStatus}>✓ Completed</Text>
                </View>
                <Text style={styles.payoutAmount}>{fmt(item.amount)}</Text>
              </View>
            ))
          )}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },

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
  scrollContent: { paddingBottom: 32 },

  // Balance card
  balanceCard: {
    backgroundColor: Colors.secondary,
    margin: 16,
    borderRadius: 16,
    padding: 20,
  },
  balanceLabel: { fontSize: 13, color: 'rgba(255,255,255,0.7)', marginBottom: 6 },
  balanceAmount: { fontSize: 36, fontWeight: '900', color: Colors.white, marginBottom: 18 },

  statsRow: { flexDirection: 'row', marginBottom: 20 },
  statItem: { flex: 1, alignItems: 'center' },
  statLabel: { fontSize: 11, color: 'rgba(255,255,255,0.6)', marginBottom: 4 },
  statValue: { fontSize: 14, fontWeight: '800', color: Colors.white },
  statDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.15)', marginVertical: 2 },

  withdrawBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  withdrawBtnText: { color: Colors.white, fontSize: 15, fontWeight: '800' },

  // Sections
  section: {
    backgroundColor: Colors.white,
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 15, fontWeight: '800', color: Colors.textDark },
  editBtn: { paddingHorizontal: 4 },
  editBtnText: { fontSize: 13, fontWeight: '600', color: Colors.primary },

  // Bank card
  bankCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: Colors.borderGray,
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
  },
  bankCardLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  bankIconBox: {
    width: 40, height: 40, borderRadius: 10,
    backgroundColor: '#F0F4FF',
    alignItems: 'center', justifyContent: 'center',
  },
  bankIconEmoji: { fontSize: 20 },
  bankName: { fontSize: 14, fontWeight: '800', color: Colors.textDark, marginBottom: 2 },
  bankAccNo: { fontSize: 12, color: Colors.textGray, marginBottom: 1 },
  bankIfsc: { fontSize: 12, color: Colors.textGray },
  verifiedIcon: { fontSize: 20 },

  addBankBtn: {
    borderWidth: 1.5,
    borderColor: Colors.primary,
    borderStyle: 'dashed',
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
  },
  addBankBtnText: { fontSize: 14, fontWeight: '700', color: Colors.primary },

  // UPI
  upiRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  upiIcon: { fontSize: 22 },
  upiId: { fontSize: 15, fontWeight: '600', color: Colors.textDark },

  // Payouts
  payoutRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  payoutRowBorder: { borderBottomWidth: 1, borderBottomColor: Colors.borderGray },
  payoutDate: { fontSize: 13, fontWeight: '600', color: Colors.textDark, marginBottom: 3 },
  payoutStatus: { fontSize: 12, color: '#16A34A', fontWeight: '600' },
  payoutAmount: { fontSize: 15, fontWeight: '800', color: Colors.textDark },
  emptyPayouts: { fontSize: 13, color: Colors.textGray, paddingVertical: 12, textAlign: 'center' },
  emptyMsg: { fontSize: 13, color: Colors.textGray, paddingVertical: 10 },
});

export default RiderBankPaymentScreen;
