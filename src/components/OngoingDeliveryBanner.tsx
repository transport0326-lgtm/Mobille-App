import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { Colors } from '../theme/theme';

type Props = {
  pickup: string;
  dropoff: string;
  distanceKm?: number | null;
  etaMinutes?: number | null;
  onPress: () => void;
};

const shorten = (address: string) => address.split(',')[0].trim();

const OngoingDeliveryBanner: React.FC<Props> = ({
  pickup, dropoff, distanceKm, etaMinutes, onPress,
}) => (
  <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.85}>
    <View style={styles.accentBar} />
    <View style={styles.content}>
      <View style={styles.liveRow}>
        <View style={styles.liveDot} />
        <Text style={styles.liveText}>LIVE</Text>
        <Text style={styles.dot}> · </Text>
        <Text style={styles.title}>Ongoing Delivery</Text>
      </View>
      <Text style={styles.route} numberOfLines={1}>
        {shorten(pickup)} → {shorten(dropoff)}
      </Text>
      {(distanceKm != null || etaMinutes != null) && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>
            📍 {distanceKm != null ? `${distanceKm.toFixed(1)} km` : ''}
            {distanceKm != null && etaMinutes != null ? ' · ' : ''}
            {etaMinutes != null ? `${etaMinutes} min` : ''}
          </Text>
        </View>
      )}
    </View>
    <View style={styles.arrowWrap}>
      <View style={styles.arrowCircle}>
        <Text style={styles.arrowText}>›</Text>
      </View>
      <Text style={styles.tapText}>Tap to</Text>
    </View>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F2547',
    borderRadius: 14,
    marginHorizontal: 16,
    marginBottom: 8,
    overflow: 'hidden',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
  },
  accentBar: {
    width: 5,
    alignSelf: 'stretch',
    backgroundColor: Colors.primary,
  },
  content: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 11,
  },
  liveRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 3,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#22C55E',
    marginRight: 5,
  },
  liveText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#22C55E',
    letterSpacing: 0.5,
  },
  dot: {
    fontSize: 11,
    color: '#8899AA',
  },
  title: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  route: {
    fontSize: 12,
    color: '#AABBCC',
    marginBottom: 6,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,77,77,0.15)',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: 'rgba(255,77,77,0.35)',
  },
  badgeText: {
    fontSize: 11,
    color: '#FF9999',
    fontWeight: '600',
  },
  arrowWrap: {
    alignItems: 'center',
    paddingRight: 14,
    gap: 3,
  },
  arrowCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowText: {
    fontSize: 22,
    color: '#FFFFFF',
    fontWeight: '900',
    lineHeight: 26,
  },
  tapText: {
    fontSize: 10,
    color: '#8899AA',
  },
});

export default OngoingDeliveryBanner;
