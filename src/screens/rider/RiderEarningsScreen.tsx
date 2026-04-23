import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { Text } from 'react-native-paper';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { Colors } from '../../theme/theme';

const { width } = Dimensions.get('window');
const CHART_HEIGHT = 110;

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList>;
};

const DAILY_DATA = [
  { day: 'Mon', amount: 280 },
  { day: 'Tue', amount: 350 },
  { day: 'Wed', amount: 210 },
  { day: 'Thu', amount: 390 },
  { day: 'Fri', amount: 320 },
  { day: 'Sat', amount: 520 },  // highest — orange
  { day: 'Sun', amount: 180 },
];

const maxAmount = Math.max(...DAILY_DATA.map(d => d.amount));

const RiderEarningsScreen: React.FC<Props> = ({ navigation }) => {
  return (
    <View style={styles.safeArea}>

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Earnings</Text>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>

        {/* ── This Week Banner ── */}
        <View style={styles.weekBanner}>
          <Text style={styles.weekLabel}>This Week's Earnings</Text>
          <Text style={styles.weekAmount}>₹ 2,450</Text>
          <Text style={styles.weekTrips}>42 trips completed</Text>
        </View>

        {/* ── Daily Breakdown Chart ── */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Daily Breakdown</Text>

          <View style={styles.chartArea}>
            {DAILY_DATA.map((item, i) => {
              const barH = (item.amount / maxAmount) * CHART_HEIGHT;
              const isHighest = item.amount === maxAmount;
              return (
                <View key={i} style={styles.barCol}>
                  <View style={styles.barWrapper}>
                    <View
                      style={[
                        styles.bar,
                        { height: barH },
                        isHighest ? styles.barActive : styles.barInactive,
                      ]}
                    />
                  </View>
                  <Text style={[styles.dayLabel, isHighest && styles.dayLabelActive]}>
                    {item.day}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* ── Earnings Summary ── */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Earnings Summary</Text>

          {[
            { label: 'Trip Fares', value: '₹ 2,180', color: Colors.textDark },
            { label: 'Bonuses', value: '₹ 150', color: Colors.textDark },
            { label: 'Tips', value: '₹ 120', color: Colors.textDark },
            { label: 'Platform Deductions', value: '− ₹ 0', color: Colors.textGray },
          ].map((row, i, arr) => (
            <View
              key={i}
              style={[
                styles.summaryRow,
                i === arr.length - 1 && { borderBottomWidth: 0 },
              ]}>
              <Text style={styles.summaryLabel}>{row.label}</Text>
              <Text style={[styles.summaryValue, { color: row.color }]}>{row.value}</Text>
            </View>
          ))}
        </View>

        {/* ── Withdraw Button ── */}
        <TouchableOpacity
          style={styles.withdrawBtn}
          activeOpacity={0.85}
          onPress={() => navigation.navigate('BankPayment')}>
          <Text style={styles.withdrawBtnText}>Withdraw ₹2,450</Text>
        </TouchableOpacity>

        <View style={{ height: 10 }} />
      </ScrollView>

    </View>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },

  header: {
    paddingHorizontal: 20, paddingVertical: 16, backgroundColor: Colors.secondary, alignItems: 'center',
  },
  headerTitle: { fontSize: 17, lineHeight: 22, fontWeight: '700', color: Colors.white, includeFontPadding: false },

  scrollContent: { paddingBottom: 16 },

  // Week banner
  weekBanner: {
    backgroundColor: '#22C55E',
    paddingVertical: 24,
    paddingHorizontal: 20,
    alignItems: 'center',
    gap: 6,
  },
  weekLabel: { fontSize: 13, color: 'rgba(255,255,255,0.85)', fontWeight: '500' },
  weekAmount: { fontSize: 36, fontWeight: '800', color: Colors.white },
  weekTrips: { fontSize: 13, color: 'rgba(255,255,255,0.85)' },

  // Card
  card: {
    backgroundColor: Colors.white,
    marginHorizontal: 14,
    marginTop: 14,
    borderRadius: 14,
    padding: 16,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  cardTitle: { fontSize: 15, fontWeight: '800', color: Colors.textDark, marginBottom: 16 },

  // Chart
  chartArea: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: CHART_HEIGHT + 24,
    paddingBottom: 0,
  },
  barCol: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 6,
  },
  barWrapper: {
    width: '65%',
    height: CHART_HEIGHT,
    justifyContent: 'flex-end',
  },
  bar: {
    width: '100%',
    borderRadius: 6,
  },
  barActive: { backgroundColor: Colors.primary },
  barInactive: { backgroundColor: '#C8D6E8' },
  dayLabel: { fontSize: 11, color: Colors.textGray, fontWeight: '500' },
  dayLabelActive: { color: Colors.primary, fontWeight: '700' },

  // Summary
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 13, borderBottomWidth: 1, borderBottomColor: '#F5F5F5' },
  summaryLabel: { fontSize: 14, color: Colors.textGray },
  summaryValue: { fontSize: 14, fontWeight: '700' },

  // Withdraw
  withdrawBtn: {
    marginHorizontal: 14,
    marginTop: 18,
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    elevation: 2,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  withdrawBtnText: { color: Colors.white, fontSize: 16, fontWeight: '800' },

});

export default RiderEarningsScreen;
