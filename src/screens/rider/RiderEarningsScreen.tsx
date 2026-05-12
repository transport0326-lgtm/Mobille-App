import React, { useEffect } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Text } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { Colors } from '../../theme/theme';
import { fetchEarnings } from '../../redux/sagas/rider/earningsAction';
import type { RootState, AppDispatch } from '../../redux/store';

const CHART_HEIGHT = 110;

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList>;
};

const RiderEarningsScreen: React.FC<Props> = (_props) => {
  const dispatch = useDispatch<AppDispatch>();
  const { loading, data, error } = useSelector((state: RootState) => state.earnings);

  useEffect(() => {
    dispatch(fetchEarnings());
  }, []);

  const dailyData = data?.dailyBreakdown ?? [];
  const maxAmount = dailyData.length > 0 ? Math.max(...dailyData.map(d => d.earnings), 1) : 1;
  const thisWeek = data?.thisWeek ?? { total: 0, trips: 0 };
  const summary = data?.summary ?? { tripFares: 0, bonuses: 0, tips: 0, platformDeductions: 0 };

  return (
    <View style={styles.safeArea}>

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Earnings</Text>
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : error ? (
        <View style={styles.centered}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={() => dispatch(fetchEarnings())}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          style={{ flex: 1 }}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}>

          {/* ── This Week Banner ── */}
          <View style={styles.weekBanner}>
            <Text style={styles.weekLabel}>This Week's Earnings</Text>
            <Text style={styles.weekAmount}>₹ {thisWeek.total.toLocaleString('en-IN')}</Text>
            <Text style={styles.weekTrips}>{thisWeek.trips} trips completed</Text>
          </View>

          {/* ── Daily Breakdown Chart ── */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Daily Breakdown</Text>

            <View style={styles.chartArea}>
              {dailyData.map((item, i) => {
                const barH = Math.max((item.earnings / maxAmount) * CHART_HEIGHT, 4);
                const isHighest = item.earnings === maxAmount && item.earnings > 0;
                return (
                  <View key={i} style={styles.barCol}>
                    <Text style={styles.barAmount}>
                      {item.earnings > 0 ? `₹${item.earnings}` : ''}
                    </Text>
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
                    {item.trips > 0 && (
                      <Text style={styles.tripCount}>{item.trips}t</Text>
                    )}
                  </View>
                );
              })}
            </View>
          </View>

          {/* ── Earnings Summary ── */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Earnings Summary</Text>

            {[
              { label: 'Trip Fares',           value: `₹ ${summary.tripFares.toLocaleString('en-IN')}`,          color: Colors.textDark },
              { label: 'Bonuses',              value: `₹ ${summary.bonuses.toLocaleString('en-IN')}`,            color: Colors.textDark },
              { label: 'Tips',                 value: `₹ ${summary.tips.toLocaleString('en-IN')}`,               color: Colors.textDark },
              { label: 'Platform Deductions',  value: `− ₹ ${summary.platformDeductions.toLocaleString('en-IN')}`, color: Colors.textGray },
            ].map((row, i, arr) => (
              <View
                key={i}
                style={[styles.summaryRow, i === arr.length - 1 && { borderBottomWidth: 0 }]}>
                <Text style={styles.summaryLabel}>{row.label}</Text>
                <Text style={[styles.summaryValue, { color: row.color }]}>{row.value}</Text>
              </View>
            ))}
          </View>

          <View style={{ height: 10 }} />
        </ScrollView>
      )}

    </View>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },

  header: {
    paddingHorizontal: 20, paddingVertical: 16,
    backgroundColor: Colors.secondary, alignItems: 'center',
  },
  headerTitle: { fontSize: 17, lineHeight: 22, fontWeight: '700', color: Colors.white, includeFontPadding: false },

  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  errorText: { fontSize: 14, color: Colors.textGray, textAlign: 'center', paddingHorizontal: 24 },
  retryBtn: { backgroundColor: Colors.primary, borderRadius: 8, paddingHorizontal: 24, paddingVertical: 10 },
  retryText: { color: Colors.white, fontSize: 14, fontWeight: '700' },

  scrollContent: { paddingBottom: 16 },

  weekBanner: {
    backgroundColor: '#22C55E',
    paddingVertical: 24, paddingHorizontal: 20,
    alignItems: 'center', gap: 6,
  },
  weekLabel:  { fontSize: 13, color: 'rgba(255,255,255,0.85)', fontWeight: '500' },
  weekAmount: { fontSize: 36, fontWeight: '800', color: Colors.white },
  weekTrips:  { fontSize: 13, color: 'rgba(255,255,255,0.85)' },

  card: {
    backgroundColor: Colors.white,
    marginHorizontal: 14, marginTop: 14,
    borderRadius: 14, padding: 16,
    elevation: 1, shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4,
  },
  cardTitle: { fontSize: 15, fontWeight: '800', color: Colors.textDark, marginBottom: 16 },

  chartArea: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: CHART_HEIGHT + 48,
  },
  barCol:    { flex: 1, alignItems: 'center', justifyContent: 'flex-end', gap: 4 },
  barAmount: { fontSize: 9, color: Colors.textGray, fontWeight: '600' },
  barWrapper: { width: '65%', height: CHART_HEIGHT, justifyContent: 'flex-end' },
  bar:       { width: '100%', borderRadius: 6 },
  barActive:   { backgroundColor: Colors.primary },
  barInactive: { backgroundColor: '#C8D6E8' },
  dayLabel:       { fontSize: 11, color: Colors.textGray, fontWeight: '500' },
  dayLabelActive: { color: Colors.primary, fontWeight: '700' },
  tripCount:      { fontSize: 9, color: Colors.textGray },

  summaryRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 13, borderBottomWidth: 1, borderBottomColor: '#F5F5F5',
  },
  summaryLabel: { fontSize: 14, color: Colors.textGray },
  summaryValue: { fontSize: 14, fontWeight: '700' },

  withdrawBtn: {
    marginHorizontal: 14, marginTop: 18,
    backgroundColor: Colors.primary,
    borderRadius: 12, paddingVertical: 16, alignItems: 'center',
    elevation: 2, shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8,
    opacity: 0.55,
  },
  withdrawBtnText: { color: Colors.white, fontSize: 16, fontWeight: '800' },
});

export default RiderEarningsScreen;
