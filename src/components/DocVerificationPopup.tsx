import React from 'react';
import { Modal, View, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { Text } from 'react-native-paper';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { Colors } from '../theme/theme';

type Props = {
  visible: boolean;
  onDismiss: () => void;
  rejectionReason?: string | null;
};

const DocVerificationPopup: React.FC<Props> = ({ visible, onDismiss, rejectionReason }) => {
  const isRejected = !!rejectionReason;

  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent>
      <View style={styles.overlay}>
        <View style={styles.card}>

          <View style={[styles.iconCircle, isRejected && styles.iconCircleRejected]}>
            <Image
              source={require('../assets/icons/hourglass_top.png')}
              style={{ width: 32, height: 32, resizeMode: 'contain' }}
            />
          </View>

          <Text style={styles.title}>
            {isRejected ? 'Documents Rejected' : 'Document Verification\nPending'}
          </Text>

          <Text style={styles.body}>
            {isRejected
              ? rejectionReason
              : "Your documents (DL & RC) are being reviewed by our team. You'll be able to go online and receive orders once your documents are verified."}
          </Text>

          <View style={styles.statusBox}>
            <View style={[styles.statusRow, styles.statusRowBorder]}>
              <View style={styles.statusLeft}>
                <MaterialIcons name="badge" size={18} color={Colors.secondary} />
                <Text style={styles.statusLabel}>Driving License (DL)</Text>
              </View>
              <View style={[styles.badge, isRejected && styles.badgeRejected]}>
                <Text style={[styles.badgeText, isRejected && styles.badgeTextRejected]}>
                  {isRejected ? 'Rejected' : 'Under Review'}
                </Text>
              </View>
            </View>
            <View style={styles.statusRow}>
              <View style={styles.statusLeft}>
                <MaterialIcons name="description" size={18} color={Colors.secondary} />
                <Text style={styles.statusLabel}>RC Card</Text>
              </View>
              <View style={[styles.badge, isRejected && styles.badgeRejected]}>
                <Text style={[styles.badgeText, isRejected && styles.badgeTextRejected]}>
                  {isRejected ? 'Rejected' : 'Under Review'}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.infoRow}>
            <MaterialIcons name="info" size={16} color={isRejected ? '#E53E3E' : '#4D80E5'} />
            <Text style={styles.infoText}>
              {isRejected
                ? 'Please re-upload your documents to get verified.'
                : "Usually takes 24-48 hours. We'll notify you once verified."}
            </Text>
          </View>

          <TouchableOpacity style={styles.btn} onPress={onDismiss} activeOpacity={0.85}>
            <Text style={styles.btnText}>OK, I understand</Text>
          </TouchableOpacity>

        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: Colors.white,
    borderRadius: 20,
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 24,
    alignItems: 'center',
    gap: 16,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
  },

  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FFF2E0',
    alignItems: 'center',
    justifyContent: 'center',
  },

  title: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.secondary,
    textAlign: 'center',
    lineHeight: 26,
  },

  body: {
    fontSize: 13,
    color: '#666B73',
    textAlign: 'center',
    lineHeight: 20,
  },

  statusBox: {
    width: '100%',
    backgroundColor: '#F7F7FA',
    borderRadius: 12,
    overflow: 'hidden',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 13,
  },
  statusRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#E5E8EB',
  },
  statusLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#262633',
  },
  badge: {
    backgroundColor: 'rgba(229,140,0,0.12)',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#E58C00',
  },

  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    alignSelf: 'flex-start',
  },
  infoText: {
    flex: 1,
    fontSize: 11,
    color: '#737880',
    lineHeight: 16,
  },

  btn: {
    width: '100%',
    backgroundColor: Colors.secondary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  btnText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.white,
  },

  iconCircleRejected: {
    backgroundColor: '#FFE5E5',
  },
  badgeRejected: {
    backgroundColor: 'rgba(229,62,62,0.12)',
  },
  badgeTextRejected: {
    color: '#E53E3E',
  },
});

export default DocVerificationPopup;
