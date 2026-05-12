import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Text } from 'react-native-paper';
import { Colors } from '../../theme/theme';
import RejectReasonModal from './RejectReasonModal';

type DeliveryRequest = {
  bookingId: string;
  distance: string;
  fare: number;
  vehicle: string;
  pickup: string;
  dropoff: string;
  customerName: string;
  customerInitials: string;
  parcelType: string;
};

type DeliveryRequestModalProps = {
  visible: boolean;
  request: DeliveryRequest;
  onAccept: () => void;
  onReject: (reason: string) => void;
  accepting?: boolean;
  rejecting?: boolean; 
  countdownSeconds?: number;
};

const DeliveryRequestModal: React.FC<DeliveryRequestModalProps> = ({
  visible,
  request,
  onAccept,
  onReject,
  accepting = false,
  rejecting = false,
  countdownSeconds = 15,
}) => {
  const [timeLeft, setTimeLeft] = useState(countdownSeconds);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!visible) {
      setTimeLeft(countdownSeconds);
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    setTimeLeft(countdownSeconds);
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          timerRef.current = null;
          onReject('Timeout'); // auto-reject on timeout
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [visible]);

  const formatTime = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  const handleReasonSelect = (reason: string) => {
    setShowRejectModal(false);
    onReject(reason);
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={() => onReject('Dismissed')}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>

          {/* Header */}
          <View style={styles.handle} />
          <View style={styles.header}>
            <Text style={styles.headerTitle}>New Delivery Request</Text>
            <View style={styles.timerBadge}>
              <Text style={styles.timerText}>{formatTime(timeLeft)}</Text>
            </View>
          </View>

          {/* Stats */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Distance</Text>
              <Text style={styles.statValue}>{request.distance}</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Estimated Fare</Text>
              <Text style={[styles.statValue, styles.fareValue]}>₹{request.fare}</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Vehicle</Text>
              <Text style={styles.statValue}>{request.vehicle}</Text>
            </View>
          </View>

          {/* Pickup */}
          <View style={styles.locationSection}>
            <View style={styles.locationRow}>
              <View style={[styles.locationDot, { backgroundColor: '#22C55E' }]} />
              <View>
                <Text style={styles.locationLabel}>Pickup</Text>
                <Text style={styles.locationValue}>{request.pickup}</Text>
              </View>
            </View>

            <View style={styles.locationLine} />

            <View style={styles.locationRow}>
              <View style={[styles.locationDot, { backgroundColor: Colors.primary }]} />
              <View>
                <Text style={styles.locationLabel}>Drop-off</Text>
                <Text style={styles.locationValue}>{request.dropoff}</Text>
              </View>
            </View>
          </View>

          {/* Customer Info */}
          <View style={styles.customerRow}>
            <View style={styles.customerAvatar}>
              <Text style={styles.customerInitials}>{request.customerInitials}</Text>
            </View>
            <View>
              <Text style={styles.customerName}>{request.customerName}</Text>
              <Text style={styles.customerMeta}>{request.parcelType} • 1</Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.rejectBtn}
              onPress={() => setShowRejectModal(true)}
              disabled={rejecting}   // ← reject hote waqt disable
              activeOpacity={0.8}
            >
              {rejecting
                ? <ActivityIndicator size="small" color={Colors.primary} />
                : <Text style={styles.rejectText}>Reject</Text>}
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.acceptBtn}
              onPress={onAccept}
              disabled={accepting || rejecting}  // ← dono me disable
              activeOpacity={0.8}
            >
              {accepting
                ? <ActivityIndicator size="small" color="#fff" />
                : <Text style={styles.acceptText}>Accept</Text>}
            </TouchableOpacity>
          </View>

        </View>
      </View>

      <RejectReasonModal
        visible={showRejectModal}
        onSelectReason={handleReasonSelect}  // ← reason string milegi yahan
        onGoBack={() => setShowRejectModal(false)}
      />
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
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.borderGray,
    alignSelf: 'center',
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: Colors.textDark,
  },
  timerBadge: {
    backgroundColor: '#FFF0E8',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  timerText: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.primary,
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: Colors.background,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 12,
    marginBottom: 16,
    alignItems: 'center',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 11,
    color: Colors.textGray,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textDark,
  },
  fareValue: {
    color: '#16A34A',
    fontSize: 16,
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: Colors.borderGray,
  },
  locationSection: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 16,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  locationDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
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
  locationLine: {
    width: 1,
    height: 18,
    backgroundColor: Colors.borderGray,
    marginLeft: 4,
    marginVertical: 4,
  },
  customerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.background,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 20,
  },
  customerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  customerInitials: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.white,
  },
  customerName: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textDark,
    marginBottom: 2,
  },
  customerMeta: {
    fontSize: 12,
    color: Colors.textGray,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  rejectBtn: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
  },
  rejectText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.primary,
  },
  acceptBtn: {
    flex: 1,
    backgroundColor: '#22C55E',
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
  },
  acceptText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.white,
  },
});

export default DeliveryRequestModal;
