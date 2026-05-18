import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { apiRequest, BOOKING_BASE_URL } from '../config/api.config';

const REASONS = [
  { icon: '🔧', label: 'Vehicle breakdown / technical issue' },
  { icon: '🚨', label: 'Emergency situation' },
  { icon: '👤', label: 'Customer not available at pickup' },
  { icon: '📍', label: 'Wrong / unreachable address' },
  { icon: '📋', label: 'Order details incorrect' },
  { icon: '🙏', label: 'Personal reason' },
];

interface Props {
  visible: boolean;
  onClose: () => void;
  bookingId: string;
  onConfirm?: (cancelledBy: string, cancelled?: any) => void;
}

const CancelOrderSheet: React.FC<Props> = ({
  visible,
  onClose,
  bookingId,
  onConfirm,
}) => {
  const [selected, setSelected] = useState<number | null>(null);
  const [note, setNote] = useState('');
  const [cancelling, setCancelling] = useState(false);

  const handleClose = () => {
    if (cancelling) return;
    setSelected(null);
    setNote('');
    onClose();
  };

  const handleConfirm = async () => {
    const reason = note.trim() !== '' ? note.trim() : REASONS[selected!].label;
    setCancelling(true);
    try {
      const response = await apiRequest<any>(
        `bookings/${bookingId}/rider-cancel`,
        {
          method: 'PATCH',
          body: JSON.stringify({ reason }),
        },
        BOOKING_BASE_URL,
      );
      const cancelledBy: string = response.data?.cancelled?.cancelledBy ?? 'rider';
      const cancelled = response.data?.cancelled;
      setSelected(null);
      setNote('');
      onConfirm?.(cancelledBy, cancelled);
      onClose();
    } catch (err: any) {
      Alert.alert('Error', err?.message ?? 'Failed to cancel booking. Please try again.');
    } finally {
      setCancelling(false);
    }
  };

  const isDisabled = selected === null && note.trim() === '';

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={handleClose}
        />

        <View style={styles.sheet}>
          {/* Drag handle */}
          <View style={styles.handle} />

          {/* Title */}
          <Text style={styles.title}>Why are you cancelling?</Text>
          <Text style={styles.subtitle}>Please select a reason below</Text>

          {/* Divider */}
          <View style={styles.divider} />

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* Reason options */}
            {REASONS.map((reason, index) => {
              const isSelected = selected === index;
              return (
                <TouchableOpacity
                  key={index}
                  activeOpacity={0.8}
                  style={[
                    styles.reasonRow,
                    isSelected && styles.reasonRowSelected,
                  ]}
                  onPress={() => setSelected(index)}
                >
                  <Text style={styles.reasonIcon}>{reason.icon}</Text>
                  <Text
                    style={[
                      styles.reasonLabel,
                      isSelected && styles.reasonLabelSelected,
                    ]}
                  >
                    {reason.label}
                  </Text>
                  <View
                    style={[styles.radio, isSelected && styles.radioSelected]}
                  >
                    {isSelected && <View style={styles.radioInner} />}
                  </View>
                </TouchableOpacity>
              );
            })}

            {/* Note input */}
            <TextInput
              style={styles.noteInput}
              placeholder="Add a note (optional)…"
              placeholderTextColor="#a6a6a6"
              value={note}
              onChangeText={setNote}
              multiline
            />

            {/* Confirm button */}
            <TouchableOpacity
              style={[
                styles.confirmBtn,
                (isDisabled || cancelling) && styles.confirmBtnDisabled,
              ]}
              activeOpacity={0.85}
              disabled={isDisabled || cancelling}
              onPress={handleConfirm}
            >
              {cancelling
                ? <ActivityIndicator color="#fff" size="small" />
                : <Text style={styles.confirmBtnText}>Confirm Cancellation</Text>
              }
            </TouchableOpacity>

            {/* Go Back */}
            <TouchableOpacity
              style={styles.goBackBtn}
              activeOpacity={0.85}
              onPress={handleClose}
              disabled={cancelling}
            >
              <Text style={styles.goBackBtnText}>Go Back</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '92%',
  },

  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#e1e1e1',
    marginTop: 12,
    marginBottom: 20,
  },

  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1c1c1c',
    paddingHorizontal: 20,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: '#a6a6a6',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  divider: {
    height: 1,
    backgroundColor: '#e1e1e1',
    marginBottom: 12,
  },

  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    gap: 10,
  },

  // Reason row
  reasonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    borderWidth: 1,
    borderColor: '#e1e1e1',
    borderRadius: 12,
    paddingHorizontal: 12,
    gap: 12,
  },
  reasonRowSelected: {
    borderWidth: 1.5,
    borderColor: '#ef4444',
    backgroundColor: 'rgba(239,68,68,0.06)',
  },
  reasonIcon: {
    fontSize: 18,
    width: 22,
    textAlign: 'center',
  },
  reasonLabel: {
    flex: 1,
    fontSize: 13,
    color: '#1c1c1c',
  },
  reasonLabelSelected: {
    color: '#ef4444',
    fontWeight: '600',
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#e1e1e1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: {
    backgroundColor: '#ef4444',
  },
  radioInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#fff',
  },

  // Note input
  noteInput: {
    height: 60,
    borderWidth: 1,
    borderColor: '#e1e1e1',
    borderRadius: 12,
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 14,
    paddingTop: 16,
    fontSize: 13,
    color: '#1c1c1c',
    textAlignVertical: 'top',
  },

  // Buttons
  confirmBtn: {
    height: 54,
    backgroundColor: '#ef4444',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  confirmBtnDisabled: {
    backgroundColor: '#f5a5a5',
  },
  confirmBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
  },
  goBackBtn: {
    height: 54,
    borderWidth: 1.5,
    borderColor: '#e1e1e1',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  goBackBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1c1c1c',
  },
});

export default CancelOrderSheet;
