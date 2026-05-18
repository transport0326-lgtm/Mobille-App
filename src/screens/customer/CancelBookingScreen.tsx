import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { Colors } from '../../theme/theme';
import { cancelBooking } from '../../redux/sagas/booking/cancelBookingAction';
import { resetCancelBooking } from '../../redux/slices/cancelBookingSlice';
import { resetBooking } from '../../redux/slices/bookingSlice';
import type { AppDispatch, RootState } from '../../redux/store';

type CancelBookingScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'CancelBooking'>;
  route: RouteProp<RootStackParamList, 'CancelBooking'>;
};

const REASONS = [
  'Waiting too long for rider',
  'Changed my mind',
  'Found an alternative',
  'Wrong pickup/drop-off location',
  'Price too high',
  'Other',
];

const CancelBookingScreen: React.FC<CancelBookingScreenProps> = ({ navigation, route }) => {
  const { bookingId } = route.params;
  const dispatch = useDispatch<AppDispatch>();

  const { loading, success, error } = useSelector((state: RootState) => state.cancelBooking);

  const [selectedReason, setSelectedReason] = useState<string>(REASONS[0]);
  const [otherText, setOtherText] = useState('');

  useEffect(() => {
    if (success) {
      dispatch(resetCancelBooking());
      dispatch(resetBooking());
      navigation.reset({ index: 0, routes: [{ name: 'CustomerDashboard' }] });
    }
  }, [success]);

  useEffect(() => {
    if (error) {
      Alert.alert('Failed to cancel', error);
      dispatch(resetCancelBooking());
    }
  }, [error]);

  const handleConfirm = () => {
    const reason =
      selectedReason === 'Other'
        ? otherText.trim() || 'Other'
        : selectedReason;
    dispatch(cancelBooking({ bookingId, reason }));
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.secondary} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Image
            source={require('../../assets/icons/arrow.png')}
            style={styles.backArrow}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Cancel Booking</Text>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">

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
              <View key={reason}>
                <TouchableOpacity
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

                {reason === 'Other' && isSelected && (
                  <TextInput
                    style={styles.otherInput}
                    placeholder="Please describe your reason..."
                    placeholderTextColor={Colors.textGray}
                    value={otherText}
                    onChangeText={setOtherText}
                    multiline
                    maxLength={200}
                    textAlignVertical="top"
                  />
                )}
              </View>
            );
          })}
        </View>
      </ScrollView>

      {/* Bottom buttons */}
      <View style={styles.bottomActions}>
        <TouchableOpacity
          style={[styles.confirmBtn, loading && styles.confirmBtnDisabled]}
          activeOpacity={0.85}
          onPress={handleConfirm}
          disabled={loading}>
          {loading
            ? <ActivityIndicator size="small" color={Colors.white} />
            : <Text style={styles.confirmBtnText}>Confirm Cancellation</Text>}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.keepBtn}
          activeOpacity={0.85}
          disabled={loading}
          onPress={() => navigation.goBack()}>
          <Text style={styles.keepBtnText}>Keep My Booking</Text>
        </TouchableOpacity>
      </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.white,
  },

  // Header
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

  headerTitle: {
    fontSize: 18,
    color: Colors.white,
    fontWeight: '700',
    marginLeft: 12,
  },

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

  otherInput: {
    marginTop: 8,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: Colors.textDark,
    minHeight: 80,
    backgroundColor: Colors.white,
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
  confirmBtnDisabled: {
    opacity: 0.7,
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
