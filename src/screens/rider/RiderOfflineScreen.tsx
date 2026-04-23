import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import { Colors } from '../../theme/theme';

type TodaySummary = {
  earnings: number;
  trips: number;
  distanceKm: number;
};

type RiderOfflineScreenProps = {
  onGoOnline: () => void;
  todaySummary?: TodaySummary;
};

const RiderOfflineScreen: React.FC<RiderOfflineScreenProps> = ({ onGoOnline, todaySummary }) => {
  return (
    <View style={styles.container}>

      {/* Centered offline message */}
      <View style={styles.center}>
        <Text style={styles.emoji}>😴</Text>
        <Text style={styles.title}>You're currently offline</Text>
        <Text style={styles.sub}>
          Toggle the switch above to start{'\n'}receiving delivery requests
        </Text>
        <TouchableOpacity style={styles.goOnlineBtn} onPress={onGoOnline} activeOpacity={0.85}>
          <Text style={styles.goOnlineDot}>🟢</Text>
          <Text style={styles.goOnlineBtnText}>Go Online</Text>
        </TouchableOpacity>
      </View>

      {/* Today's Summary at bottom */}
      <View style={styles.summarySection}>
        <Text style={styles.sectionTitle}>Today's Summary</Text>
        <View style={styles.summaryRow}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryValue}>₹ {todaySummary?.earnings ?? 0}</Text>
            <Text style={styles.summaryLabel}>Earnings</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryValue}>{todaySummary?.trips ?? 0}</Text>
            <Text style={styles.summaryLabel}>Trips</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryValue}>{todaySummary?.distanceKm ?? 0} km</Text>
            <Text style={styles.summaryLabel}>Distance</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
  },

  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  emoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.textDark,
    marginBottom: 10,
    textAlign: 'center',
  },
  sub: {
    fontSize: 14,
    color: Colors.textGray,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 28,
  },
  goOnlineBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#22C55E',
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 48,
    gap: 8,
    elevation: 3,
    shadowColor: '#22C55E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  goOnlineDot: {
    fontSize: 16,
  },
  goOnlineBtnText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '800',
  },

  summarySection: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textDark,
    marginBottom: 10,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: 10,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textDark,
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 11,
    color: Colors.textGray,
  },
});

export default RiderOfflineScreen;
