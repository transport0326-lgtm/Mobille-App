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
import { useDispatch, useSelector } from 'react-redux';
import { Colors } from '../../theme/theme';
import { fetchOrders } from '../../redux/sagas/booking/ordersAction';
import { AppDispatch, RootState } from '../../redux/store';
import { Booking } from '../../redux/slices/ordersSlice';

const STATUS_LABEL: Record<string, string> = {
  pending: 'In Progress',
  accepted: 'In Progress',
  in_progress: 'In Transit',
  completed: 'Delivered',
  cancelled: 'Cancelled',
};

const STATUS_COLORS: Record<string, string> = {
  'In Transit': '#1A6DFF',
  'In Progress': Colors.primary,
  'Delivered': '#16A34A',
  'Cancelled': '#DC2626',
};

function formatDate(iso?: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function getStatusLabel(status?: string): string {
  if (!status) return 'In Progress';
  return STATUS_LABEL[status.toLowerCase()] ?? status;
}

type MyOrdersScreenProps = {
  onBack: () => void;
};

const MyOrdersScreen: React.FC<MyOrdersScreenProps> = ({ onBack }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { loading, bookings, stats, error } = useSelector((state: RootState) => state.orders);

  useEffect(() => {
    dispatch(fetchOrders());
  }, [dispatch]);

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor={Colors.secondary} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn} activeOpacity={0.7}>
          <Image
            source={require('../../assets/icons/arrow.png')}
            style={styles.backArrow}
          />
        </TouchableOpacity>
        <Text style={styles.title}>My Orders</Text>
      </View>

      {/* Stats Row */}
      <View style={styles.statsRow}>
        {[
          { label: 'Total Orders', value: stats.totalOrders },
          { label: 'Delivered', value: stats.delivered },
          { label: 'Cancelled', value: stats.cancelled },
        ].map(stat => (
          <View key={stat.label} style={styles.statBoxWrapper}>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>{String(stat.value).padStart(2, '0')}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* Content */}
      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors.secondary} />
        </View>
      ) : error ? (
        <View style={styles.centered}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={() => dispatch(fetchOrders())} style={styles.retryBtn}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : bookings.length === 0 ? (
        <View style={styles.centered}>
          <Text style={styles.emptyText}>No orders yet.</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.list}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}>
          {bookings.map((order: Booking) => {
            const statusLabel = getStatusLabel(order.status);
            const statusColor = STATUS_COLORS[statusLabel] ?? Colors.primary;
            const fare = order.fare ?? order.total;
            const from = order.pickupLocation?.address ?? 'Unknown pickup';
            const to = order.dropoffLocation?.address ?? 'Unknown dropoff';

            return (
              <TouchableOpacity key={order._id} style={styles.orderCard} activeOpacity={0.85}>
                <View style={styles.cardRow}>
                  <Text style={styles.orderId}>{order.bookingNumber ?? `#${order._id.slice(-6).toUpperCase()}`}</Text>
                  <View style={[
                    styles.statusBadge,
                    { backgroundColor: statusColor + '1A', borderColor: statusColor + '44' },
                  ]}>
                    <Text style={[styles.statusText, { color: statusColor }]}>{statusLabel}</Text>
                  </View>
                </View>
                <Text style={styles.route} numberOfLines={2} ellipsizeMode="tail">{from} → {to}</Text>
                <View style={styles.cardRow}>
                  <Text style={styles.meta}>{order.vehicleType}{fare != null ? ` · ₹${fare}` : ''}</Text>
                  <Text style={styles.meta}>{formatDate(order.createdAt)}</Text>
                </View>
              </TouchableOpacity>
            );
          })}
          <View style={{ height: 16 }} />
        </ScrollView>
      )}
    </>
  );
};

const styles = StyleSheet.create({
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

  title: {
    fontSize: 18,
    color: Colors.white,
    fontWeight: '700',
    marginLeft: 12,
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 10,
  },
  statBoxWrapper: {
    flex: 1,
    borderRadius: 10,
    overflow: 'hidden',
  },
  statBox: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  statNumber: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.textGray,
  },
  statLabel: {
    fontSize: 11,
    color: Colors.textGray,
    marginTop: 2,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  errorText: {
    fontSize: 14,
    color: '#DC2626',
    textAlign: 'center',
    paddingHorizontal: 24,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textGray,
  },
  retryBtn: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    backgroundColor: Colors.secondary,
    borderRadius: 8,
  },
  retryText: {
    color: Colors.white,
    fontWeight: '700',
    fontSize: 14,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  orderCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  orderId: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.textDark,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
  },
  route: {
    fontSize: 13,
    color: Colors.textDark,
    marginTop: 6,
    marginBottom: 6,
  },
  meta: {
    fontSize: 12,
    color: Colors.textGray,
  },
});

export default MyOrdersScreen;
