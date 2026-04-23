import React from 'react';
import {
  View,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Text } from 'react-native-paper';
import { Colors } from '../../theme/theme';

const REJECT_REASONS = [
  { id: '1', icon: '📍', label: 'Too far from pickup' },
  { id: '2', icon: '🚗', label: 'Vehicle issue / breakdown' },
  { id: '3', icon: '⏰', label: 'Busy with another delivery' },
  { id: '4', icon: '🚧', label: 'Bad route / traffic' },
  { id: '5', icon: '💰', label: 'Fare too low' },
  { id: '6', icon: '🚫', label: 'Personal reason' },
];

type RejectReasonModalProps = {
  visible: boolean;
  onSelectReason: (reason: string) => void;
  onGoBack: () => void;
};

const RejectReasonModal: React.FC<RejectReasonModalProps> = ({
  visible,
  onSelectReason,
  onGoBack,
}) => {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onGoBack}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>

          <View style={styles.handle} />

          <Text style={styles.title}>Why are you rejecting?</Text>
          <Text style={styles.subtitle}>Help us improve by sharing your reason</Text>

          <ScrollView showsVerticalScrollIndicator={false} style={styles.list}>
            {REJECT_REASONS.map((item, index) => (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.reasonItem,
                  index < REJECT_REASONS.length - 1 && styles.reasonItemBorder,
                ]}
                activeOpacity={0.7}
                onPress={() => onSelectReason(item.label)}>
                <Text style={styles.reasonIcon}>{item.icon}</Text>
                <Text style={styles.reasonLabel}>{item.label}</Text>
                <Text style={styles.chevron}>{'›'}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <TouchableOpacity style={styles.goBackBtn} onPress={onGoBack} activeOpacity={0.7}>
            <Text style={styles.goBackText}>Go Back</Text>
          </TouchableOpacity>

        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingBottom: 28,
    paddingTop: 8,
    maxHeight: '85%',
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.borderGray,
    alignSelf: 'center',
    marginBottom: 20,
  },

  title: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.secondary,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 13,
    color: Colors.textGray,
    marginBottom: 16,
  },

  list: {
    marginBottom: 8,
  },
  reasonItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    gap: 14,
  },
  reasonItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderGray,
  },
  reasonIcon: {
    fontSize: 20,
    width: 28,
    textAlign: 'center',
  },
  reasonLabel: {
    flex: 1,
    fontSize: 15,
    color: Colors.textDark,
    fontWeight: '500',
  },
  chevron: {
    fontSize: 20,
    color: Colors.textGray,
    lineHeight: 22,
  },

  goBackBtn: {
    paddingVertical: 16,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: Colors.borderGray,
    marginTop: 4,
  },
  goBackText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textDark,
  },
});

export default RejectReasonModal;
