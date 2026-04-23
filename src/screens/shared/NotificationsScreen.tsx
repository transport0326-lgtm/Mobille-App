import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Text } from 'react-native-paper';
import { Colors } from '../../theme/theme';

type Notification = {
  id: string;
  icon: string;
  iconBg: string;
  title: string;
  subtitle: string;
  time: string;
  unread: boolean;
  section: 'Today' | 'Earlier';
};

const NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    icon: '✓',
    iconBg: '#16A34A',
    title: 'Delivery Completed',
    subtitle: 'BK-1042 delivered to Park Street. Rate your experience!',
    time: '2 min ago',
    unread: true,
    section: 'Today',
  },
  {
    id: '2',
    icon: '🛺',
    iconBg: Colors.primary,
    title: 'Rider On The Way',
    subtitle: 'Jahid Hasan is heading to your drop-off location',
    time: '15 min ago',
    unread: true,
    section: 'Today',
  },
  {
    id: '3',
    icon: '📦',
    iconBg: '#92400E',
    title: 'Parcel Picked Up',
    subtitle: 'Your parcel has been picked up from Salt Lake Sector V',
    time: '28 min ago',
    unread: true,
    section: 'Today',
  },
  {
    id: '4',
    icon: '🏍️',
    iconBg: '#64748B',
    title: 'Rider Assigned',
    subtitle: 'Jahid Hasan (★4.8) assigned to BK-1042',
    time: '32 min ago',
    unread: false,
    section: 'Today',
  },
  {
    id: '5',
    icon: '✓',
    iconBg: '#16A34A',
    title: 'Booking Confirmed',
    subtitle: 'BK-1042 confirmed. Finding nearby rider...',
    time: '35 min ago',
    unread: false,
    section: 'Today',
  },
  {
    id: '6',
    icon: '💳',
    iconBg: '#374151',
    title: 'Payment Processed',
    subtitle: '₹60.60 charged for BK-1039',
    time: 'Yesterday',
    unread: false,
    section: 'Earlier',
  },
  {
    id: '7',
    icon: '⭐',
    iconBg: '#B45309',
    title: 'You Rated 5 Stars',
    subtitle: 'Thanks for rating your delivery experience!',
    time: 'Yesterday',
    unread: false,
    section: 'Earlier',
  },
];

type NotificationsScreenProps = {
  onBack: () => void;
};

const NotificationsScreen: React.FC<NotificationsScreenProps> = ({ onBack }) => {
  const [notifications, setNotifications] = useState(NOTIFICATIONS);

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
  };

  const todayItems = notifications.filter(n => n.section === 'Today');
  const earlierItems = notifications.filter(n => n.section === 'Earlier');

  const renderItem = (item: Notification) => (
    <TouchableOpacity
      key={item.id}
      style={[styles.notifCard, item.unread && styles.notifCardUnread]}
      activeOpacity={0.8}>
      <View style={[styles.iconCircle, { backgroundColor: item.iconBg }]}>
        <Text style={styles.iconText}>{item.icon}</Text>
      </View>
      <View style={styles.notifBody}>
        <Text style={styles.notifTitle}>{item.title}</Text>
        <Text style={styles.notifSubtitle} numberOfLines={1}>{item.subtitle}</Text>
        <Text style={[styles.notifTime, item.unread && styles.notifTimeUnread]}>
          {item.time}
        </Text>
      </View>
      {item.unread && <View style={styles.unreadDot} />}
    </TouchableOpacity>
  );

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor={Colors.secondary} />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Notifications</Text>
        <TouchableOpacity onPress={markAllRead} activeOpacity={0.7}>
          <Text style={styles.markAllRead}>Mark all read</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.list}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}>

        {/* Today */}
        <Text style={styles.sectionLabel}>Today</Text>
        {todayItems.map(renderItem)}

        {/* Earlier */}
        <Text style={[styles.sectionLabel, { marginTop: 8 }]}>Earlier</Text>
        {earlierItems.map(renderItem)}

        <View style={{ height: 16 }} />
      </ScrollView>
    </>
  );
};

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
  iconText: {
    fontSize: 18,
    color: Colors.white,
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
});

export default NotificationsScreen;
