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
import { Colors } from '../../theme/theme';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { useSelector } from 'react-redux';
import type { RootState } from '../../redux/store';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'DeliveryComplete'>;
};

const DeliveryCompleteScreen: React.FC<Props> = ({ navigation }) => {
  const etaMinutes = useSelector((state: RootState) => state.acceptBooking.data?.etaMinutes as number | null | undefined);
  const baseFare     = 30;
  const distanceKm   = 3.2;
  const perKm        = 8;
  const distanceFare = parseFloat((distanceKm * perKm).toFixed(2));
  const platformFee  = 5;
  const total        = (baseFare + distanceFare + platformFee).toFixed(2);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.secondary} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Review Booking</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>

        {/* Route */}
        <Text style={styles.sectionTitle}>Route</Text>
        <View style={styles.card}>
          <View style={styles.routeRow}>
            <View style={[styles.routeDot, { backgroundColor: '#22C55E' }]} />
            <View>
              <Text style={styles.routeType}>Pickup</Text>
              <Text style={styles.routeAddr}>Salt Lake Sector V, Kolkata</Text>
            </View>
          </View>
          <View style={styles.routeDivider} />
          <View style={styles.routeRow}>
            <View style={[styles.routeDot, { backgroundColor: Colors.primary }]} />
            <View>
              <Text style={styles.routeType}>Drop-off</Text>
              <Text style={styles.routeAddr}>Park Street, Kolkata</Text>
            </View>
          </View>
          <View style={styles.etaPill}>
            <Text style={styles.etaText}>{distanceKm} km · {etaMinutes != null ? `~${etaMinutes} min` : '—'}</Text>
          </View>
        </View>

        {/* Fare Breakdown */}
        <Text style={styles.sectionTitle}>Fare Breakdown</Text>
        <View style={styles.card}>
          {[
            { label: 'Vehicle',                                  value: 'Bike' },
            { label: 'Base Fare',                                value: `₹ ${baseFare}` },
            { label: `Distance (${distanceKm} km × ₹${perKm})`, value: `₹ ${distanceFare}` },
            { label: 'Platform Fee',                             value: `₹ ${platformFee}` },
            { label: 'Payment',                                  value: 'Pay After Delivery' },
          ].map((row, i, arr) => (
            <View key={i} style={[styles.fareRow, i === arr.length - 1 && { borderBottomWidth: 0 }]}>
              <Text style={styles.fareLabel}>{row.label}</Text>
              <Text style={styles.fareValue}>{row.value}</Text>
            </View>
          ))}

          {/* Total */}
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>₹ {total}</Text>
          </View>
        </View>

        <View style={{ height: 10 }} />
      </ScrollView>

      {/* Pay Button */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.payBtn}
          activeOpacity={0.85}
          onPress={() => navigation.navigate('RateDelivery')}>
          <Text style={styles.payBtnText}>Pay</Text>
        </TouchableOpacity>
      </View>

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea:      { flex: 1, backgroundColor: Colors.white },
  header:        { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: Colors.secondary },
  backBtn:       { width: 40, height: 40, justifyContent: 'center' },
  backArrow: { fontSize: 22, lineHeight: 22, color: Colors.white, fontWeight: '600', includeFontPadding: false },
  headerTitle: { fontSize: 17, lineHeight: 22, fontWeight: '700', color: Colors.white, includeFontPadding: false },

  scrollContent: { paddingHorizontal: 16, paddingTop: 20, paddingBottom: 20 },
  sectionTitle:  { fontSize: 15, fontWeight: '700', color: Colors.textDark, marginBottom: 10 },

  card: {
    backgroundColor: Colors.white, borderRadius: 12, padding: 16, marginBottom: 20,
    borderWidth: 1, borderColor: '#EEEEEE',
    elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4,
  },

  routeRow:     { flexDirection: 'row', alignItems: 'flex-start', gap: 12, paddingVertical: 6 },
  routeDot:     { width: 10, height: 10, borderRadius: 5, marginTop: 4 },
  routeType:    { fontSize: 11, color: Colors.textGray, marginBottom: 2 },
  routeAddr:    { fontSize: 14, fontWeight: '600', color: Colors.textDark },
  routeDivider: { height: 1, backgroundColor: '#F0F0F0', marginLeft: 22, marginVertical: 4 },
  etaPill:      { alignSelf: 'flex-start', backgroundColor: '#EEF2FF', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6, marginTop: 12 },
  etaText:      { fontSize: 13, fontWeight: '600', color: Colors.secondary },

  fareRow:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 11, borderBottomWidth: 1, borderBottomColor: '#F5F5F5' },
  fareLabel:  { fontSize: 13, color: Colors.textGray },
  fareValue:  { fontSize: 13, fontWeight: '500', color: Colors.textDark },
  totalRow:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 14, marginTop: 4, borderTopWidth: 1.5, borderTopColor: '#EEEEEE' },
  totalLabel: { fontSize: 16, fontWeight: '800', color: Colors.textDark },
  totalValue: { fontSize: 20, fontWeight: '800', color: Colors.secondary },

  bottomBar:  { paddingHorizontal: 16, paddingVertical: 12, backgroundColor: Colors.white, borderTopWidth: 1, borderTopColor: '#F0F0F0' },
  payBtn:     { backgroundColor: Colors.primary, borderRadius: 12, paddingVertical: 16, alignItems: 'center', elevation: 2, shadowColor: Colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 },
  payBtnText: { color: Colors.white, fontSize: 16, fontWeight: '700', letterSpacing: 0.5 },
});

export default DeliveryCompleteScreen;
