import React from 'react';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
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
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { Colors } from '../../theme/theme';
import ChatBottomSheet from '../../components/ChatBottomSheet';

type BookingConfirmedScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'BookingConfirmed'>;
  route: RouteProp<RootStackParamList, 'BookingConfirmed'>;
};

const PROGRESS_STEPS = [
  { label: 'Booking Placed', time: '10:32 AM', done: true, active: false },
  { label: 'Rider Assigned – Jahid Hasan', time: '10:34 AM', done: true, active: false },
  { label: 'Pickup In Progress', time: 'Now', done: false, active: true },
  { label: 'On The Way', time: '', done: false, active: false },
  { label: 'Delivered', time: '', done: false, active: false },
];

const BookingConfirmedScreen: React.FC<BookingConfirmedScreenProps> = ({ navigation }) => {
  const [chatVisible, setChatVisible] = React.useState(false);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.secondary} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Booking Details</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Scrollable Content */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>

        {/* ── Booking Confirmed Banner ── */}
        <View style={styles.confirmedBanner}>
          <View style={styles.checkCircle}>
            <MaterialIcons name="check" size={24} color={Colors.white} />
          </View>
          <Text style={styles.confirmedTitle}>Booking Confirmed!</Text>
          <Text style={styles.bookingId}>Booking ID: BK-1042</Text>
        </View>

        {/* ── Rider Card ── */}
        <View style={styles.card}>
          <View style={styles.riderRow}>
            {/* Avatar */}
            <View style={styles.riderAvatar}>
              <Text style={styles.riderAvatarText}>JH</Text>
            </View>
            {/* Info */}
            <View style={styles.riderInfo}>
              <Text style={styles.riderName}>Jahid Hasan</Text>
              <View style={styles.riderMeta}>
                <Text style={styles.riderStar}>★ 4.9</Text>
                <Text style={styles.riderDot}> · </Text>
                <Text style={styles.riderVehicle}>Bike</Text>
              </View>
            </View>
            {/* Call Button */}
            <TouchableOpacity style={styles.callBtn} activeOpacity={0.8}>
              <Text style={styles.callBtnText}>📞 Call</Text>
            </TouchableOpacity>
          </View>

          {/* Vehicle Number */}
          <View style={styles.vehicleBox}>
            <Text style={styles.vehicleIcon}>🏍️</Text>
            <Text style={styles.vehicleNumber}>Vehicle No: WB-02-AB-3456</Text>
          </View>
        </View>

        {/* ── Delivery OTP ── */}
        <View style={styles.card}>
          <Text style={styles.cardSectionLabel}>Delivery OTP</Text>
          <View style={styles.otpRow}>
            {['4', '8', '2', '9'].map((digit, i) => (
              <View key={i} style={styles.otpBox}>
                <Text style={styles.otpDigit}>{digit}</Text>
              </View>
            ))}
          </View>
          <Text style={styles.otpNote}>Share this OTP with rider at delivery</Text>
        </View>
        <TouchableOpacity
          style={styles.otpVerifyBtn}
          onPress={() => navigation.navigate('DeliveryComplete')}>
          <Text style={styles.otpVerifyBtnText}>✅ Payment (Test)</Text>
        </TouchableOpacity>

        {/* ── Live Tracking ── */}
        <View style={styles.card}>
          <Text style={styles.cardSectionLabel}>Live Tracking</Text>
          <View style={styles.trackingBar}>
            {/* Progress line */}
            <View style={styles.trackingLine} />
            <View style={[styles.trackingLineFilled, { width: '45%' }]} />
            {/* Start dot */}
            <View style={[styles.trackingDot, styles.trackingDotDone, { left: 0 }]} />
            {/* Middle dot (rider position) */}
            <View style={[styles.trackingDot, styles.trackingDotActive, { left: '43%' }]} />
            {/* End dot */}
            <View style={[styles.trackingDot, styles.trackingDotPending, { right: 0 }]} />
          </View>
          <View style={styles.etaBox}>
            <Text style={styles.etaText}>ETA: 12 min</Text>
          </View>
        </View>

        {/* ── Delivery Progress ── */}
        <View style={styles.card}>
          <Text style={styles.deliveryProgressTitle}>Delivery Progress</Text>
          {PROGRESS_STEPS.map((step, i) => (
            <View key={i} style={styles.progressRow}>
              {/* Dot */}
              <View style={styles.progressDotCol}>
                <View style={[
                  styles.progressDot,
                  step.done && styles.progressDotDone,
                  step.active && styles.progressDotActive,
                  !step.done && !step.active && styles.progressDotPending,
                ]} />
                {i < PROGRESS_STEPS.length - 1 && (
                  <View style={[
                    styles.progressLine,
                    (step.done || step.active) && styles.progressLineDone,
                  ]} />
                )}
              </View>
              {/* Label + time */}
              <View style={styles.progressTextCol}>
                <Text style={[
                  styles.progressLabel,
                  !step.done && !step.active && styles.progressLabelPending,
                ]}>
                  {step.label}
                </Text>
                {step.time !== '' && (
                  <Text style={[
                    styles.progressTime,
                    step.active && styles.progressTimeActive,
                  ]}>
                    {step.time}
                  </Text>
                )}
              </View>
            </View>
          ))}
        </View>

        {/* ── Chat Button ── */}
        <TouchableOpacity
          style={styles.chatBtn}
          activeOpacity={0.85}
          onPress={() => setChatVisible(true)}>
          <Text style={styles.chatBtnText}>💬  Chat with Rider</Text>
        </TouchableOpacity>

        {/* Bottom sheet — tab bar se pehle add karo */}
        <ChatBottomSheet
          visible={chatVisible}
          onClose={() => setChatVisible(false)}
        />

        <View style={{ height: 10 }} />
      </ScrollView>

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F5F5F0' },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12, backgroundColor: Colors.secondary,
  },
  backBtn: { width: 40, height: 40, justifyContent: 'center' },
  backArrow: { fontSize: 22, lineHeight: 22, color: Colors.white, fontWeight: '600', includeFontPadding: false },
  headerTitle: { fontSize: 17, lineHeight: 22, fontWeight: '700', color: Colors.white, includeFontPadding: false },

  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 14, paddingTop: 16, paddingBottom: 16 },

  // Confirmed Banner
  confirmedBanner: {
    alignItems: 'center', backgroundColor: '#E8F5E9',
    borderRadius: 14, paddingVertical: 20, marginBottom: 14,
  },
  checkCircle: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: '#22C55E', alignItems: 'center', justifyContent: 'center',
    marginBottom: 10,
  },
  checkMark: { fontSize: 24, color: Colors.white, fontWeight: '800' },
  confirmedTitle: { fontSize: 20, fontWeight: '800', color: Colors.textDark, marginBottom: 4 },
  bookingId: { fontSize: 13, color: Colors.textGray },

  // Card
  card: {
    backgroundColor: Colors.white, borderRadius: 14,
    padding: 16, marginBottom: 14,
    elevation: 1, shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4,
  },

  // Rider
  riderRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  riderAvatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.secondary, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  riderAvatarText: { fontSize: 15, fontWeight: '700', color: Colors.white },
  riderInfo: { flex: 1 },
  riderName: { fontSize: 15, fontWeight: '700', color: Colors.textDark },
  riderMeta: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  riderStar: { fontSize: 12, color: '#F59E0B', fontWeight: '600' },
  riderDot: { fontSize: 12, color: Colors.textGray },
  riderVehicle: { fontSize: 12, color: Colors.textGray },
  callBtn: { backgroundColor: '#E8F5E9', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6 },
  callBtnText: { fontSize: 13, fontWeight: '700', color: '#16A34A' },
  vehicleBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F5F5F5', borderRadius: 8, paddingHorizontal: 14, paddingVertical: 10, gap: 10 },
  vehicleIcon: { fontSize: 18 },
  vehicleNumber: { fontSize: 13, fontWeight: '600', color: Colors.textDark },

  // OTP
  cardSectionLabel: { fontSize: 13, fontWeight: '700', color: Colors.textGray, textAlign: 'center', marginBottom: 14, letterSpacing: 0.3 },
  otpRow: { flexDirection: 'row', justifyContent: 'center', gap: 12, marginBottom: 10 },
  otpBox: { width: 54, height: 58, borderRadius: 10, borderWidth: 1.5, borderColor: '#E0E0E0', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FAFAFA' },
  otpDigit: { fontSize: 26, fontWeight: '800', color: Colors.textDark },
  otpNote: { fontSize: 12, color: Colors.primary, textAlign: 'center', fontWeight: '500' },

  // Live Tracking
  trackingBar: { height: 6, marginVertical: 14, position: 'relative', justifyContent: 'center' },
  trackingLine: { position: 'absolute', left: 0, right: 0, height: 4, backgroundColor: '#E0E0E0', borderRadius: 2 },
  trackingLineFilled: { position: 'absolute', left: 0, height: 4, backgroundColor: '#22C55E', borderRadius: 2 },
  trackingDot: { position: 'absolute', width: 14, height: 14, borderRadius: 7, top: -5 },
  trackingDotDone: { backgroundColor: '#22C55E' },
  trackingDotActive: { backgroundColor: Colors.primary, width: 18, height: 18, borderRadius: 9, top: -7, borderWidth: 3, borderColor: '#FFF' },
  trackingDotPending: { backgroundColor: '#E0E0E0' },
  etaBox: { alignSelf: 'center', backgroundColor: Colors.white, borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 6, marginTop: 6 },
  etaText: { fontSize: 13, fontWeight: '700', color: Colors.textDark },

  // Delivery Progress
  deliveryProgressTitle: { fontSize: 15, fontWeight: '800', color: Colors.textDark, marginBottom: 16 },
  progressRow: { flexDirection: 'row', marginBottom: 0 },
  progressDotCol: { width: 24, alignItems: 'center' },
  progressDot: { width: 12, height: 12, borderRadius: 6, marginTop: 3 },
  progressDotDone: { backgroundColor: '#22C55E' },
  progressDotActive: { backgroundColor: Colors.primary },
  progressDotPending: { backgroundColor: '#E0E0E0' },
  progressLine: { width: 2, flex: 1, minHeight: 28, backgroundColor: '#E0E0E0', marginVertical: 2 },
  progressLineDone: { backgroundColor: '#22C55E' },
  progressTextCol: { flex: 1, paddingBottom: 20, paddingLeft: 8 },
  progressLabel: { fontSize: 14, fontWeight: '600', color: Colors.textDark },
  progressLabelPending: { color: '#AAAAAA' },
  progressTime: { fontSize: 12, color: Colors.textGray, marginTop: 2 },
  progressTimeActive: { color: Colors.primary, fontWeight: '700' },

  // Chat Button
  chatBtn: {
    backgroundColor: Colors.secondary, borderRadius: 12,
    paddingVertical: 16, alignItems: 'center',
    elevation: 2, shadowColor: Colors.secondary,
    shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8,
  },
  chatBtnText: { color: Colors.white, fontSize: 16, fontWeight: '700' },

  // Tab Bar
  otpVerifyBtn: {
    backgroundColor: '#22C55E',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  otpVerifyBtnText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '700',
  },
});

export default BookingConfirmedScreen;
