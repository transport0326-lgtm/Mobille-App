import React from 'react';
import {
  View,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
} from 'react-native';
import { Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { Colors } from '../../theme/theme';

type DeliveringParcelScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'DeliveringParcel'>;
};

const PROGRESS_STEPS = [
  { label: 'Order Accepted', time: '10:12 AM', done: true, active: false },
  { label: 'Picked Up from Customer', time: '10:24 AM', done: true, active: false },
  { label: 'On the Way to Drop-off', time: 'Now', done: false, active: true },
  { label: 'Delivered', time: '', done: false, active: false },
];

const MockMap: React.FC = () => (
  <View style={map.container}>
    {/* Grid — horizontal */}
    {[0.18, 0.36, 0.54, 0.72, 0.88].map((p, i) => (
      <View key={`h${i}`} style={[map.hLine, { top: `${p * 100}%` as any }]} />
    ))}
    {/* Grid — vertical */}
    {[0.18, 0.34, 0.52, 0.68, 0.84].map((p, i) => (
      <View key={`v${i}`} style={[map.vLine, { left: `${p * 100}%` as any }]} />
    ))}

    {/* Block fills */}
    <View style={map.blockBlue} />
    <View style={map.blockGray1} />
    <View style={map.blockGray2} />

    {/* Route — horizontal then vertical */}
    <View style={map.routeH} />
    <View style={map.routeV} />

    {/* Rider marker */}
    <View style={map.riderMarker}>
      <Text style={map.riderIcon}>▶</Text>
    </View>

    {/* Drop-off marker */}
    <View style={map.dropoffWrapper}>
      <View style={map.dropoffLabel}>
        <Text style={map.dropoffLabelText}>Drop-off</Text>
      </View>
      <View style={map.dropoffDot} />
    </View>

    {/* ETA card */}
    <View style={map.etaCard}>
      <Text style={map.etaTime}>12 min</Text>
      <Text style={map.etaDist}>3.2 km</Text>
    </View>

    {/* Locate button */}
    <View style={map.locateBtn}>
      <Text style={map.locateIcon}>◎</Text>
    </View>
  </View>
);

const DeliveringParcelScreen: React.FC<DeliveringParcelScreenProps> = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.secondary} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} activeOpacity={0.7}>
          <Text style={styles.backArrow}>{'←'}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Delivering Parcel</Text>
        <View style={styles.inTransitBadge}>
          <Text style={styles.inTransitText}>In Transit</Text>
        </View>
      </View>

      {/* Mock Map */}
      <MockMap />

      {/* Bottom Panel */}
      <View style={styles.panel}>
        <Text style={styles.progressTitle}>Delivery Progress</Text>

        {/* Progress Steps */}
        <View style={styles.stepsList}>
          {PROGRESS_STEPS.map((step, index) => (
            <View key={index} style={styles.stepRow}>
              <View style={styles.stepIndicator}>
                <View style={[
                  styles.stepDot,
                  step.done && styles.stepDotDone,
                  step.active && styles.stepDotActive,
                  !step.done && !step.active && styles.stepDotPending,
                ]} />
                {index < PROGRESS_STEPS.length - 1 && (
                  <View style={[styles.stepLine, step.done && styles.stepLineDone]} />
                )}
              </View>
              <View style={styles.stepContent}>
                <Text style={[
                  styles.stepLabel,
                  step.active && styles.stepLabelActive,
                  !step.done && !step.active && styles.stepLabelPending,
                ]}>
                  {step.label}
                </Text>
                {step.time ? (
                  <Text style={[styles.stepTime, step.active && styles.stepTimeActive]}>
                    {step.time}
                  </Text>
                ) : null}
              </View>
            </View>
          ))}
        </View>

        {/* Drop-off location */}
        <View style={styles.locationRow}>
          <View style={styles.locationDot} />
          <View>
            <Text style={styles.locationLabel}>Drop-off Location</Text>
            <Text style={styles.locationValue}>Park Street, Road 4, Kolkata</Text>
          </View>
        </View>

        {/* Complete Delivery */}
        <TouchableOpacity
          style={styles.completeBtn}
          activeOpacity={0.85}
          onPress={() => navigation.navigate('VerifyDeliveryOTP')}>
          <Text style={styles.completeBtnText}>Complete Delivery</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

// ─── Mock map styles ───────────────────────────────────────────────────────────
const map = StyleSheet.create({
  container: {
    maxHeight: '50%',
    flex: 1,
    backgroundColor: '#E8EFF5',
    overflow: 'hidden',
    position: 'relative',
  },
  hLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: '#CBD5DC',
  },
  vLine: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: '#CBD5DC',
  },
  blockBlue: {
    position: 'absolute',
    top: '52%',
    left: '2%',
    width: '28%',
    height: '35%',
    backgroundColor: '#B0D4E8',
    borderRadius: 4,
  },
  blockGray1: {
    position: 'absolute',
    top: '10%',
    left: '35%',
    width: '22%',
    height: '28%',
    backgroundColor: '#D5DDE3',
    borderRadius: 4,
  },
  blockGray2: {
    position: 'absolute',
    top: '10%',
    left: '62%',
    width: '32%',
    height: '28%',
    backgroundColor: '#D5DDE3',
    borderRadius: 4,
  },
  routeH: {
    position: 'absolute',
    top: '41%',
    left: '18%',
    width: '50%',
    height: 4,
    backgroundColor: Colors.primary,
    borderRadius: 2,
  },
  routeV: {
    position: 'absolute',
    top: '41%',
    left: '68%',
    width: 4,
    height: '26%',
    backgroundColor: Colors.primary,
    borderRadius: 2,
  },
  riderMarker: {
    position: 'absolute',
    top: '35%',
    left: '13%',
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
  },
  riderIcon: {
    color: '#FFFFFF',
    fontSize: 13,
  },
  dropoffWrapper: {
    position: 'absolute',
    top: '60%',
    left: '62%',
    alignItems: 'center',
  },
  dropoffLabel: {
    backgroundColor: Colors.primary,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginBottom: 4,
  },
  dropoffLabelText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  dropoffDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: Colors.primary,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  etaCard: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  etaTime: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textDark,
  },
  etaDist: {
    fontSize: 12,
    color: Colors.textGray,
    marginTop: 1,
  },
  locateBtn: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
  },
  locateIcon: {
    fontSize: 18,
    color: Colors.textGray,
  },
});

// ─── Screen styles ─────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.secondary,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
  },
  backBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backArrow: {
    fontSize: 22,
    lineHeight: 22,
    color: Colors.white,
    fontWeight: '700',
    includeFontPadding: false,
  },
  headerTitle: {
    flex: 1,
    fontSize: 17,
    lineHeight: 22,
    fontWeight: '800',
    color: Colors.white,
    includeFontPadding: false,
  },
  inTransitBadge: {
    backgroundColor: Colors.primary,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  inTransitText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.white,
  },

  // Panel
  panel: {
    flex: 1,
    backgroundColor: Colors.white,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
    justifyContent: 'space-between',
  },
  progressTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.textDark,
    marginBottom: 12,
  },

  // Steps
  stepsList: {
    marginBottom: 4,
  },
  stepRow: {
    flexDirection: 'row',
    gap: 12,
  },
  stepIndicator: {
    alignItems: 'center',
    width: 14,
  },
  stepDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginTop: 2,
  },
  stepDotDone: {
    backgroundColor: '#22C55E',
  },
  stepDotActive: {
    backgroundColor: Colors.primary,
  },
  stepDotPending: {
    backgroundColor: '#D1D5DB',
  },
  stepLine: {
    width: 2,
    flex: 1,
    minHeight: 18,
    backgroundColor: '#D1D5DB',
    marginVertical: 2,
  },
  stepLineDone: {
    backgroundColor: '#22C55E',
  },
  stepContent: {
    flex: 1,
    paddingBottom: 14,
  },
  stepLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textDark,
  },
  stepLabelActive: {
    color: Colors.textDark,
    fontWeight: '700',
  },
  stepLabelPending: {
    color: Colors.textGray,
    fontWeight: '400',
  },
  stepTime: {
    fontSize: 12,
    color: Colors.textGray,
    marginTop: 1,
  },
  stepTimeActive: {
    color: Colors.primary,
    fontWeight: '600',
  },

  // Location
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: Colors.background,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 4,
  },
  locationDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.primary,
  },
  locationLabel: {
    fontSize: 11,
    color: Colors.textGray,
    marginBottom: 2,
  },
  locationValue: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textDark,
  },

  // Complete button
  completeBtn: {
    backgroundColor: '#22C55E',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#22C55E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  completeBtnText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '800',
  },
});

export default DeliveringParcelScreen;
