import React, { useEffect } from 'react';
import {
  View,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '../../redux/store';
import { getNotifications } from '../../redux/sagas/notifications/riderNotificationsAction';
import { markNotificationRead, markAllNotificationsRead } from '../../redux/sagas/notifications/markNotificationsReadAction';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { Colors } from '../../theme/theme';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Notifications'>;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const isToday = (dateStr: string) => {
  const d = new Date(dateStr);
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
};

const formatTime = (dateStr: string): string => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins} min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hr`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return 'Yesterday';
  return `${days} days ago`;
};

type PillConfig = { label: string; color: string };
type IconConfig = { name: string; lib: 'ionicons' | 'mci'; bg: string };

const getPillConfig = (type: string): PillConfig => {
  const t = type?.toLowerCase() ?? '';
  if (t.includes('payment') || t.includes('withdrawal') || t.includes('earning'))
    return { label: 'Payment', color: '#16A34A' };
  if (t.includes('cancel'))
    return { label: 'Cancelled', color: '#EF4444' };
  if (t.includes('verif') || t.includes('document') || t.includes('kyc'))
    return { label: 'Verification', color: '#6366F1' };
  if (t.includes('booking') || t.includes('order'))
    return { label: 'Booking', color: '#F59E0B' };
  return { label: type ?? 'Update', color: '#64748B' };
};

const getIconConfig = (type: string): IconConfig => {
  const t = type?.toLowerCase() ?? '';
  if (t.includes('payment_received') || t.includes('earning'))
    return { name: 'cash-outline', lib: 'ionicons', bg: '#16A34A' };
  if (t.includes('withdrawal'))
    return { name: 'bank-transfer-out', lib: 'mci', bg: '#16A34A' };
  if (t.includes('cancel') && t.includes('fee'))
    return { name: 'alert-outline', lib: 'ionicons', bg: '#F97316' };
  if (t.includes('cancel'))
    return { name: 'close-circle-outline', lib: 'ionicons', bg: '#EF4444' };
  if (t.includes('verif') || t.includes('document') || t.includes('kyc'))
    return { name: 'checkmark-circle-outline', lib: 'ionicons', bg: '#16A34A' };
  if (t.includes('pending'))
    return { name: 'time-outline', lib: 'ionicons', bg: '#374151' };
  if (t.includes('payment'))
    return { name: 'wallet-outline', lib: 'ionicons', bg: '#16A34A' };
  return { name: 'notifications-outline', lib: 'ionicons', bg: '#64748B' };
};

// ─── Icon component ───────────────────────────────────────────────────────────

const NotifIcon: React.FC<{ config: IconConfig }> = ({ config }) => (
  <View style={[styles.iconCircle, { backgroundColor: config.bg }]}>
    {config.lib === 'ionicons' ? (
      <Ionicons name={config.name} size={20} color="#fff" />
    ) : (
      <MaterialCommunityIcons name={config.name} size={20} color="#fff" />
    )}
  </View>
);

// ─── Main Screen ──────────────────────────────────────────────────────────────

const RiderNotificationsScreen: React.FC<Props> = ({ navigation }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { notifications, loading } = useSelector(
    (state: RootState) => state.notifications,
  );

  useEffect(() => {
    dispatch(getNotifications());
  }, []);

  const todayItems = notifications.filter(n => isToday(n.createdAt));
  const earlierItems = notifications.filter(n => !isToday(n.createdAt));
  const todayUnread = todayItems.filter(n => !n.isRead).length;

  const renderItem = ({ item }: { item: (typeof notifications)[0] }) => {
    const pill = getPillConfig(item.type);
    const icon = getIconConfig(item.type);
    const unread = !item.isRead;

    return (
      <TouchableOpacity
        style={[styles.card, unread && styles.cardUnread]}
        activeOpacity={0.75}
        onPress={() => dispatch(markNotificationRead(item._id))}>

        <NotifIcon config={icon} />

        <View style={styles.cardBody}>
          <View style={styles.cardTopRow}>
            <View style={[styles.pill, { backgroundColor: pill.color + '20' }]}>
              <Text style={[styles.pillText, { color: pill.color }]}>{pill.label}</Text>
            </View>
            <View style={styles.timeRow}>
              <Text style={styles.timeText}>{formatTime(item.createdAt)}</Text>
              {unread && <View style={styles.unreadDot} />}
            </View>
          </View>
          <Text style={styles.cardTitle}>{item.title}</Text>
          <Text style={styles.cardMessage} numberOfLines={2}>{item.message}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const ListHeader = () => (
    <>
      {/* TODAY */}
      {todayItems.length > 0 && (
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionLabel}>TODAY</Text>
          {todayUnread > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{todayUnread}</Text>
            </View>
          )}
        </View>
      )}
    </>
  );

  const EarlierHeader = () =>
    earlierItems.length > 0 ? (
      <View style={[styles.sectionHeader, { marginTop: 8 }]}>
        <Text style={styles.sectionLabel}>EARLIER</Text>
      </View>
    ) : null;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.secondary} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Ionicons name="arrow-back" size={22} color={Colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <TouchableOpacity onPress={() => dispatch(markAllNotificationsRead())} style={styles.markAllBtn} activeOpacity={0.7}>
          <Ionicons name="checkmark-done-outline" size={16} color="rgba(255,255,255,0.85)" />
          <Text style={styles.markAllText}>Mark all read</Text>
        </TouchableOpacity>
      </View>

      {loading && notifications.length === 0 ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors.secondary} />
        </View>
      ) : notifications.length === 0 ? (
        <View style={styles.centered}>
          <Ionicons name="notifications-off-outline" size={48} color={Colors.borderGray} />
          <Text style={styles.emptyText}>No notifications yet</Text>
        </View>
      ) : (
        <FlatList
          data={[
            ...todayItems,
            ...(earlierItems.length > 0 ? [{ _id: '__earlier_divider__' } as any] : []),
            ...earlierItems,
          ]}
          keyExtractor={item => item._id}
          ListHeaderComponent={<ListHeader />}
          renderItem={({ item }) => {
            if (item._id === '__earlier_divider__') return <EarlierHeader />;
            return renderItem({ item });
          }}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={styles.divider} />}
        />
      )}
    </SafeAreaView>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F5F5F0' },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.secondary,
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 10,
  },
  backBtn: { width: 32, alignItems: 'center' },
  headerTitle: {
    flex: 1,
    fontSize: 17,
    fontWeight: '800',
    color: Colors.white,
  },
  markAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  markAllText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.85)',
    fontWeight: '500',
  },

  // List
  listContent: { paddingBottom: 20 },
  divider: { height: 1, backgroundColor: '#F0F0F0', marginLeft: 70 },

  // Section header
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#F5F5F0',
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textGray,
    letterSpacing: 1,
  },
  badge: {
    backgroundColor: Colors.primary,
    borderRadius: 10,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  badgeText: { fontSize: 11, fontWeight: '700', color: Colors.white },

  // Card
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.white,
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  cardUnread: { backgroundColor: '#F0F4FF' },

  // Icon
  iconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },

  // Card body
  cardBody: { flex: 1 },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  pill: {
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  pillText: { fontSize: 10, fontWeight: '700' },
  timeRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  timeText: { fontSize: 11, color: Colors.textGray },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#3B82F6',
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textDark,
    marginBottom: 3,
  },
  cardMessage: {
    fontSize: 12,
    color: Colors.textGray,
    lineHeight: 17,
  },

  // Empty / loading
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  emptyText: { fontSize: 15, color: Colors.textGray, fontWeight: '500' },
});

export default RiderNotificationsScreen;
