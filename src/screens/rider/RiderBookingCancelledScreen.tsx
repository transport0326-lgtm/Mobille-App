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
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { Colors } from '../../theme/theme';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'RiderBookingCancelled'>;
  route: RouteProp<RootStackParamList, 'RiderBookingCancelled'>;
};

const RiderBookingCancelledScreen: React.FC<Props> = ({ navigation, route }) => {
  const cancelled = route.params?.cancelled;

  const bookingNumber  = cancelled?.bookingNumber  ?? '—';
  const pickupAddress  = cancelled?.pickupAddress  ?? '—';
  const dropoffAddress = cancelled?.dropoffAddress ?? '—';
  const cancelReason   = cancelled?.cancelReason   ?? '—';
  const receiverName   = cancelled?.receiver?.name ?? '—';
  const fare           = cancelled?.fare ? `₹${cancelled.fare.toFixed(2)}` : '—';

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.secondary} />

      {/* ── Header ─────────────────────────────────────────────── */}
      <View style={styles.header}>
        {/* <TouchableOpacity
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={22} color={Colors.white} />
        </TouchableOpacity> */}

        <Text style={styles.headerTitle}>Delivery Cancelled</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* ── Top Icon + Title ───────────────────────────────────── */}
        <View style={styles.heroSection}>
          <View style={styles.iconCircle}>
            <Ionicons name="close" size={38} color="#EF4444" />
          </View>
          <Text style={styles.heroTitle}>Booking Cancelled</Text>
          <Text style={styles.heroSub}>The customer has cancelled this delivery</Text>
        </View>

        {/* ── Booking Card ───────────────────────────────────────── */}
        <View style={styles.card}>
          <View style={styles.cardTopRow}>
            <View style={styles.cancelledBadge}>
              <View style={styles.badgeDot} />
              <Text style={styles.cancelledBadgeText}>Cancelled</Text>
            </View>
            <Text style={styles.bookingNumber}>{bookingNumber}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.routeRow}>
            <View style={styles.routeIcons}>
              <View style={styles.greenDot} />
              <View style={styles.routeLine} />
              <View style={styles.redSquare} />
            </View>
            <View style={styles.routeAddresses}>
              <Text style={styles.addressText}>{pickupAddress}</Text>
              <View style={styles.addressGap} />
              <Text style={styles.addressText}>{dropoffAddress}</Text>
            </View>
          </View>
        </View>

        {/* ── Reason for Cancellation ────────────────────────────── */}
        <View style={styles.section}>
          <View style={styles.sectionTitleRow}>
            <MaterialCommunityIcons name="comment-text-outline" size={16} color={Colors.textGray} />
            <Text style={styles.sectionTitle}>Reason for Cancellation</Text>
          </View>
          <View style={styles.reasonTag}>
            <Text style={styles.reasonTagText}>{cancelReason}</Text>
          </View>
        </View>

        {/* ── Cancellation Compensation ──────────────────────────── */}
        {/* <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cancellation Compensation</Text>
          <Text style={styles.compensationDesc}>
            Rider was already in-transit — compensation applied
          </Text>
          <View style={styles.compensationRow}>
            <Text style={styles.compensationLabel}>Cancellation Fee Earned</Text>
            <Text style={styles.compensationAmount}>{fare}</Text>
          </View>
        </View> */}

        {/* ── What Happens Next ──────────────────────────────────── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What Happens Next</Text>

          <View style={styles.nextItem}>
            <View style={[styles.nextIcon, { backgroundColor: '#DCFCE7' }]}>
              <Ionicons name="checkmark" size={14} color="#16A34A" />
            </View>
            <Text style={styles.nextText}>Your trip distance & waiting time recorded</Text>
          </View>

          {/* <View style={styles.nextItem}>
            <View style={[styles.nextIcon, { backgroundColor: '#FEF3C7' }]}>
              <MaterialCommunityIcons name="refresh" size={14} color="#D97706" />
            </View>
            <Text style={styles.nextText}>Payment processed within 1–2 business days</Text>
          </View> */}

          <View style={styles.nextItem}>
            <View style={[styles.nextIcon, { backgroundColor: '#DBEAFE' }]}>
              <Ionicons name="arrow-forward" size={14} color="#2563EB" />
            </View>
            <Text style={styles.nextText}>You're back online — ready for new orders</Text>
          </View>
        </View>

        {/* ── Receiver Card ──────────────────────────────────────── */}
        <View style={[styles.section, styles.receiverCard]}>
          <View style={styles.receiverLeft}>
            <View style={styles.receiverAvatar}>
              <Text style={styles.receiverAvatarText}>
                {receiverName.split(' ').map((w: string) => w[0]).join('')}
              </Text>
            </View>
            <View>
              <Text style={styles.receiverName}>{receiverName}</Text>
              <Text style={styles.receiverSub}>
                Cancelled · {bookingNumber} · Receiver
              </Text>
            </View>
          </View>
          <View style={styles.cancelledSmallBadge}>
            <Text style={styles.cancelledSmallBadgeText}>Cancelled</Text>
          </View>
        </View>

        {/* bottom spacing for the fixed button */}
        <View style={{ height: 90 }} />
      </ScrollView>

      {/* ── Return to Home Button ──────────────────────────────── */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.returnBtn}
          activeOpacity={0.85}
          onPress={() => navigation.reset({ index: 0, routes: [{ name: 'RiderDashboard' }] })}>
          <Text style={styles.returnBtnText}>Return to Home</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.secondary,
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  headerTitle: {
    fontSize: 18,
    color: Colors.white,
    fontWeight: '700',
    marginLeft: 12,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#7C3AED',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: Colors.white, fontWeight: '700', fontSize: 14 },

  scroll: { paddingHorizontal: 16, paddingTop: 8 },

  // Hero
  heroSection: { alignItems: 'center', paddingVertical: 24 },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#FEE2E2',
    borderWidth: 2,
    borderColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.textDark,
    marginBottom: 6,
  },
  heroSub: { fontSize: 13, color: Colors.textGray, textAlign: 'center' },

  // Card
  card: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    padding: 14,
    marginBottom: 12,
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  cancelledBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    gap: 5,
  },
  badgeDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#EF4444' },
  cancelledBadgeText: { fontSize: 12, fontWeight: '700', color: '#EF4444' },
  bookingNumber: { fontSize: 13, fontWeight: '600', color: Colors.textGray },
  divider: { height: 1, backgroundColor: '#F3F4F6', marginBottom: 12 },

  // Route
  routeRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  routeIcons: { alignItems: 'center', paddingTop: 3, width: 14 },
  greenDot: {
    width: 11,
    height: 11,
    borderRadius: 6,
    backgroundColor: '#22C55E',
  },
  routeLine: { width: 1.5, height: 22, backgroundColor: '#D1D5DB', marginVertical: 3 },
  redSquare: {
    width: 10,
    height: 10,
    borderRadius: 2,
    backgroundColor: '#EF4444',
  },
  routeAddresses: { flex: 1 },
  addressText: { fontSize: 13, color: Colors.textDark, fontWeight: '500' },
  addressGap: { height: 18 },

  // Sections
  section: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
  },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textDark,
    marginBottom: 10,
  },

  // Reason
  reasonTag: {
    alignSelf: 'flex-start',
    backgroundColor: '#FEE2E2',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
    marginBottom: 10,
  },
  reasonTagText: { fontSize: 12, fontWeight: '600', color: '#EF4444' },
  noteLabel: { fontSize: 12, fontWeight: '600', color: Colors.textGray, marginBottom: 3 },
  noteText: { fontSize: 13, color: Colors.textDark, lineHeight: 19 },

  // Compensation
  compensationDesc: {
    fontSize: 12,
    color: Colors.textGray,
    marginBottom: 10,
    marginTop: -4,
  },
  compensationRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  compensationLabel: { fontSize: 13, color: Colors.textDark, fontWeight: '500' },
  compensationAmount: { fontSize: 16, fontWeight: '800', color: '#16A34A' },

  // What happens next
  nextItem: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  nextIcon: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextText: { flex: 1, fontSize: 13, color: Colors.textDark },

  // Receiver card
  receiverCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  receiverLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  receiverAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  receiverAvatarText: { color: Colors.white, fontWeight: '700', fontSize: 13 },
  receiverName: { fontSize: 14, fontWeight: '700', color: Colors.textDark },
  receiverSub: { fontSize: 11, color: Colors.textGray, marginTop: 2 },
  cancelledSmallBadge: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  cancelledSmallBadgeText: { fontSize: 11, fontWeight: '700', color: '#EF4444' },

  // Footer
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.white,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    marginBottom:50,
  },
  returnBtn: {
    backgroundColor: '#22C55E',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  returnBtnText: { color: Colors.white, fontSize: 16, fontWeight: '700' },
});

export default RiderBookingCancelledScreen;
