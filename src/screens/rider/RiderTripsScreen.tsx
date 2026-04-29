import React, { useState } from 'react';
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
import { useDispatch, useSelector } from 'react-redux';
import { fetchRiderTrips } from '../../redux/sagas/rider/riderTripsAction';

const { width } = Dimensions.get('window');

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList>;
};

type FilterType = 'Today' | 'This Week' | 'All Time';

type Trip = {
  id: string;
  bookingId: string;
  from: string;
  to: string;
  distance: string;
  duration: string;
  time: string;
  fare: number;
  status: 'Completed' | 'Cancelled';
  filter: FilterType[];
};

const RiderTripsScreen: React.FC<Props> = ({ navigation: _navigation }) => {
  const dispatch = useDispatch();
  const { trips, loading } = useSelector((state: any) => state.riderTrips);
  const [activeFilter, setActiveFilter] = useState<FilterType>('Today');

  const getApiPeriod = (filter: FilterType) => {
    switch (filter) {
      case 'Today':
        return 'today';
      case 'This Week':
        return 'thisWeek';
      case 'All Time':
        return 'allTime';
      default:
        return 'today';
    }
  };

  React.useEffect(() => {
    dispatch(fetchRiderTrips({ period: getApiPeriod(activeFilter) }));
  }, [activeFilter]);

  const formattedTrips = (trips || []).map((t: any) => ({
    id: t.bookingNumber,
    bookingId: t.bookingNumber,
    from: t.pickup,
    to: t.dropoff,
    distance: `${t.distanceKm} km`,
    duration: '—',
    time: new Date(t.completedAt).toLocaleTimeString(),
    fare: t.earning,
    status: t.status === 'completed' ? 'Completed' : 'Cancelled',
  }));

  const filteredTrips = formattedTrips;

  const totalEarned = filteredTrips
  .filter((t: Trip) => t.status === 'Completed')
  .reduce((sum: number, t: Trip) => sum + t.fare, 0);

return (
  <View style={styles.safeArea}>

    {/* Header */}
    <View style={styles.header}>
      <Text style={styles.headerTitle}>My Trips</Text>
    </View>

    {/* Filter Tabs */}
    <View style={styles.filterRow}>
      {(['Today', 'This Week', 'All Time'] as FilterType[]).map(f => (
        <TouchableOpacity
          key={f}
          style={[styles.filterBtn, activeFilter === f && styles.filterBtnActive]}
          onPress={() => setActiveFilter(f)}
          activeOpacity={0.8}>
          <Text style={[styles.filterText, activeFilter === f && styles.filterTextActive]}>
            {f}
          </Text>
        </TouchableOpacity>
      ))}
    </View>

    {/* Summary */}
    <View style={styles.summaryRow}>
      <View style={styles.summaryItem}>
        <Text style={styles.summaryValue}>{filteredTrips.filter((t: Trip) => t.status === 'Completed').length}</Text>
        <Text style={styles.summaryLabel}>Completed</Text>
      </View>
      <View style={styles.summaryDivider} />
      <View style={styles.summaryItem}>
        <Text style={[styles.summaryValue, { color: '#22C55E' }]}>₹{totalEarned}</Text>
        <Text style={styles.summaryLabel}>Earned</Text>
      </View>
      <View style={styles.summaryDivider} />
      <View style={styles.summaryItem}>
        <Text style={[styles.summaryValue, { color: Colors.primary }]}>{filteredTrips.filter((t: any) => t.status === 'Cancelled').length}</Text>
        <Text style={styles.summaryLabel}>Cancelled</Text>
      </View>
    </View>

    {/* Trip List */}
    <ScrollView
      style={{ flex: 1 }}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.listContent}>
      {filteredTrips.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>🗒️</Text>
          <Text style={styles.emptyText}>No trips found</Text>
        </View>
      ) : (
        filteredTrips.map((trip:any, i:any) => (
          <TouchableOpacity
            key={trip.id}
            style={styles.tripCard}
            activeOpacity={0.8}>
            {/* Top row */}
            <View style={styles.tripTopRow}>
              <Text style={styles.tripBookingId}>{trip.bookingId}</Text>
              <View style={[
                styles.statusBadge,
                trip.status === 'Completed' ? styles.statusCompleted : styles.statusCancelled,
              ]}>
                <Text style={[
                  styles.statusText,
                  trip.status === 'Completed' ? styles.statusTextCompleted : styles.statusTextCancelled,
                ]}>
                  {trip.status}
                </Text>
              </View>
            </View>

            {/* Route */}
            <Text style={styles.tripRoute}>
              {trip.from} → {trip.to}
            </Text>

            {/* Meta */}
            <View style={styles.tripMetaRow}>
              <Text style={styles.tripMeta}>
                {trip.distance} · {trip.duration} · {trip.time}
              </Text>
              <Text style={[
                styles.tripFare,
                trip.status === 'Cancelled' && styles.tripFareCancelled,
              ]}>
                ₹{trip.fare}
              </Text>
            </View>
          </TouchableOpacity>
        ))
      )}
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

  // Filter
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  filterBtn: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
  },
  filterBtnActive: { backgroundColor: Colors.secondary },
  filterText: { fontSize: 13, fontWeight: '600', color: Colors.textGray },
  filterTextActive: { color: Colors.white },

  // Summary
  summaryRow: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    paddingVertical: 14,
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  summaryItem: { flex: 1, alignItems: 'center' },
  summaryValue: { fontSize: 20, fontWeight: '800', color: Colors.textDark },
  summaryLabel: { fontSize: 12, color: Colors.textGray, marginTop: 2 },
  summaryDivider: { width: 1, backgroundColor: '#EEEEEE', marginVertical: 4 },

  // List
  listContent: { paddingHorizontal: 14, paddingTop: 8, paddingBottom: 16 },

  tripCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  tripTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  tripBookingId: { fontSize: 14, fontWeight: '800', color: Colors.textDark },

  statusBadge: { borderRadius: 20, paddingHorizontal: 10, paddingVertical: 3 },
  statusCompleted: { backgroundColor: '#E8F5E9' },
  statusCancelled: { backgroundColor: '#FFF0ED' },
  statusText: { fontSize: 12, fontWeight: '700' },
  statusTextCompleted: { color: '#16A34A' },
  statusTextCancelled: { color: Colors.primary },

  tripRoute: { fontSize: 14, fontWeight: '600', color: Colors.textDark, marginBottom: 8 },
  tripMetaRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  tripMeta: { fontSize: 12, color: Colors.textGray },
  tripFare: { fontSize: 15, fontWeight: '800', color: '#22C55E' },
  tripFareCancelled: { color: Colors.textGray },

  // Empty
  emptyState: { alignItems: 'center', paddingTop: 60 },
  emptyEmoji: { fontSize: 48, marginBottom: 12 },
  emptyText: { fontSize: 15, color: Colors.textGray },

});

export default RiderTripsScreen;
