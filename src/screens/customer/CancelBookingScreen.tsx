import React, { useState } from 'react';
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
import { RootStackParamList } from '../../navigation/AppNavigator';
import { Colors } from '../../theme/theme';

type CancelBookingScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'CancelBooking'>;
};

const REASONS = [
  'Waiting too long for rider',
  'Changed my mind',
  'Found an alternative',
  'Wrong pickup/drop-off location',
  'Price too high',
  'Other',
];

const CancelBookingScreen: React.FC<CancelBookingScreenProps> = ({ navigation }) => {
  const [selectedReason, setSelectedReason] = useState<string>(REASONS[0]);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.secondary} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Cancel Booking</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>

        {/* Warning icon */}
        <View style={styles.iconWrapper}>
          <Text style={styles.warningIcon}>⚠</Text>
        </View>

        <Text style={styles.title}>Are you sure you want to cancel?</Text>
        <Text style={styles.subtitle}>
          Please let us know why you're cancelling so we can improve our service.
        </Text>

        {/* Reason list */}
        <View style={styles.reasonList}>
          {REASONS.map(reason => {
            const isSelected = selectedReason === reason;
            return (
              <TouchableOpacity
                key={reason}
                style={[styles.reasonRow, isSelected && styles.reasonRowSelected]}
                onPress={() => setSelectedReason(reason)}
                activeOpacity={0.7}>
                <View style={[styles.radio, isSelected && styles.radioSelected]}>
                  {isSelected && <View style={styles.radioDot} />}
                </View>
                <Text style={[styles.reasonText, isSelected && styles.reasonTextSelected]}>
                  {reason}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* Bottom buttons */}
      <View style={styles.bottomActions}>
        <TouchableOpacity
          style={styles.confirmBtn}
          activeOpacity={0.85}
          onPress={() => navigation.navigate('CustomerDashboard')}>
          <Text style={styles.confirmBtnText}>Confirm Cancellation</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.keepBtn}
          activeOpacity={0.85}
          onPress={() => navigation.goBack()}>
          <Text style={styles.keepBtnText}>Keep My Booking</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.white,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.secondary,
  },
  backBtn: { width: 40, height: 40, justifyContent: 'center' },
  backArrow: { fontSize: 22, lineHeight: 22, color: Colors.white, fontWeight: '600', includeFontPadding: false },
  headerTitle: { fontSize: 17, lineHeight: 22, fontWeight: '700', color: Colors.white, includeFontPadding: false },

  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 28,
    paddingBottom: 16,
  },

  iconWrapper: {
    alignItems: 'center',
    marginBottom: 16,
  },
  warningIcon: {
    fontSize: 36,
    color: Colors.secondary,
  },

  title: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.secondary,
    textAlign: 'left',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 13,
    color: Colors.textGray,
    lineHeight: 20,
    marginBottom: 24,
  },

  reasonList: {
    gap: 12,
  },
  reasonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: Colors.borderGray,
    backgroundColor: Colors.white,
    gap: 14,
  },
  reasonRowSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.white,
  },

  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: Colors.borderGray,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: {
    borderColor: Colors.primary,
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.primary,
  },

  reasonText: {
    fontSize: 14,
    color: Colors.textDark,
    flex: 1,
  },
  reasonTextSelected: {
    fontWeight: '600',
    color: Colors.textDark,
  },

  bottomActions: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
    gap: 12,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.borderGray,
  },
  confirmBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: 'center',
    elevation: 3,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  confirmBtnText: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: '800',
  },
  keepBtn: {
    borderWidth: 1.5,
    borderColor: Colors.secondary,
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: 'center',
    backgroundColor: Colors.white,
  },
  keepBtnText: {
    color: Colors.secondary,
    fontSize: 15,
    fontWeight: '700',
  },
});

export default CancelBookingScreen;
