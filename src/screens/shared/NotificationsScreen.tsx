import React, { useEffect } from 'react';
import {
  View,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Image,
  ImageSourcePropType,
} from 'react-native';
import { Text } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { Colors } from '../../theme/theme';
import { getNotifications } from '../../redux/sagas/notifications/riderNotificationsAction';
import {
  markNotificationRead,
  markAllNotificationsRead,
} from '../../redux/sagas/notifications/markNotificationsReadAction';
import type { RootState, AppDispatch } from '../../redux/store';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getIconImage = (type: string): { image: ImageSourcePropType; bg: string } => {
  const t = type?.toLowerCase() ?? '';

  if (t.includes('delivery') || t.includes('completed'))
    return { image: require('../../assets/icons/tickIcon.png'), bg: '#16A34A' };   // .pgn → .png fix

  if (t.includes('booking') || t.includes('confirmed'))
    return { image: require('../../assets/icons/riderIcon.png'), bg: '#16A34A' };  // .pgn → .png fix

  if (t.includes('pickup'))
    return { image: require('../../assets/icons/riderIcon.png'), bg: '#92400E' };  // .pgn → .png fix

  if (t.includes('rider') || t.includes('assigned'))
    return { image: require('../../assets/icons/riderIcon.png'), bg: '#64748B' };

  if (t.includes('payment_received') || t.includes('earning'))
    return { image: require('../../assets/icons/wallet.png'), bg: '#374151' };

  if (t.includes('withdrawal'))
    return { image: require('../../assets/icons/paymentIcon.png'), bg: '#16A34A' };

  if (t.includes('cancel') && t.includes('fee'))
    return { image: require('../../assets/icons/fee_cancelIcon.png'), bg: '#F97316' };

  if (t.includes('cancel'))
    return { image: require('../../assets/icons/cancel.png'), bg: '#EF4444' };

  if (t.includes('verif') || t.includes('document') || t.includes('kyc'))
    return { image: require('../../assets/icons/documents.png'), bg: '#16A34A' };

  if (t.includes('payment'))
    return { image: require('../../assets/icons/paymentIcon.png'), bg: '#374151' };

  return { image: require('../../assets/icons/notifications.png'), bg: '#64748B' };
};

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
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hr ago`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return 'Yesterday';
  return `${days} days ago`;
};

// ─── Main Screen ──────────────────────────────────────────────────────────────

type NotificationsScreenProps = {
  onBack: () => void;
};

const NotificationsScreen: React.FC<NotificationsScreenProps> = ({ onBack }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { notifications, loading } = useSelector(
    (state: RootState) => state.notifications,
  );

  useEffect(() => {
    dispatch(getNotifications());
  }, []);

  const todayItems = notifications.filter(n => isToday(n.createdAt));
  const earlierItems = notifications.filter(n => !isToday(n.createdAt));

  // ─── Notification Card ───────────────────────────────────────────────────
  const renderNotificationCard = (item: typeof notifications[0]) => {
    const { image, bg } = getIconImage(item.type);
    return (
      <TouchableOpacity
        key={item._id}
        style={[styles.notifCard, !item.isRead && styles.notifCardUnread]}
        onPress={() => dispatch(markNotificationRead(item._id))}
        activeOpacity={0.7}>

        {/* Icon */}
        <View style={[styles.iconCircle, { backgroundColor: bg }]}>
          <Image
            source={image}
            style={{ width: 22, height: 22, tintColor: 'white' }}
            resizeMode="contain"
          />
        </View>

        {/* Body */}
        <View style={styles.notifBody}>
          <Text style={styles.notifTitle}>{item.title}</Text>
          {!!item.message && (
            <Text style={styles.notifSubtitle} numberOfLines={2}>
              {item.message}
            </Text>
          )}
          <Text style={[styles.notifTime, !item.isRead && styles.notifTimeUnread]}>
            {formatTime(item.createdAt)}
          </Text>
        </View>

        {/* Unread dot */}
        {!item.isRead && <View style={styles.unreadDot} />}
      </TouchableOpacity>
    );
  };

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor={Colors.secondary} />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Notifications</Text>
        <TouchableOpacity
          onPress={() => dispatch(markAllNotificationsRead())}
          activeOpacity={0.7}>
          <Text style={styles.markAllRead}>Mark all read</Text>
        </TouchableOpacity>
      </View>

      {loading && notifications.length === 0 ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors.secondary} />
        </View>
      ) : notifications.length === 0 ? (
        <View style={styles.centered}>
          <Text style={styles.emptyText}>No notifications yet</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.list}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}>

          {todayItems.length > 0 && (
            <>
              <Text style={styles.sectionLabel}>Today</Text>
              {todayItems.map(renderNotificationCard)}  {/* fix */}
            </>
          )}

          {earlierItems.length > 0 && (
            <>
              <Text style={[styles.sectionLabel, { marginTop: 8 }]}>Earlier</Text>
              {earlierItems.map(renderNotificationCard)}  {/* fix */}
            </>
          )}

          <View style={{ height: 16 }} />
        </ScrollView>
      )}
    </>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.secondary,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.white,
  },
  markAllRead: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.75)',
    fontWeight: '500',
  },
  list: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  listContent: {
    paddingTop: 16,
    paddingBottom: 8,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textGray,
    paddingHorizontal: 16,
    marginBottom: 6,
  },
  notifCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.white,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderGray,
  },
  notifCardUnread: {
    backgroundColor: '#FFF8F6',
  },
  iconCircle: {
    width: 42,
    height: 42,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    flexShrink: 0,
  },
  notifBody: {
    flex: 1,
  },
  notifTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textDark,
    marginBottom: 2,
  },
  notifSubtitle: {
    fontSize: 12,
    color: Colors.textGray,
    marginBottom: 4,
  },
  notifTime: {
    fontSize: 12,
    color: Colors.textGray,
  },
  notifTimeUnread: {
    color: Colors.primary,
    fontWeight: '600',
  },
  unreadDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: Colors.primary,
    marginTop: 4,
    flexShrink: 0,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  emptyText: {
    fontSize: 15,
    color: Colors.textGray,
    fontWeight: '500',
  },
});

export default NotificationsScreen;