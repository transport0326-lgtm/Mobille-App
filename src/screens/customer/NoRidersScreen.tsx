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
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { Colors } from '../../theme/theme';

type NoRidersScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'NoRiders'>;
  route: RouteProp<RootStackParamList, 'NoRiders'>;
};

const NoRidersScreen: React.FC<NoRidersScreenProps> = ({ navigation, route }) => {
  const { pickup, dropoff } = route.params;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.secondary} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Booking Status</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Body */}
      <View style={styles.body}>
        {/* Prohibition icon */}
        <Text style={styles.prohibitionIcon}>🚫</Text>

        {/* Title */}
        <Text style={styles.title}>No Riders Available</Text>

        {/* Subtitle */}
        <Text style={styles.subtitle}>
          All riders in your area are currently busy.{'\n'}
          Please try again in a few minutes or{'\n'}
          expand your pickup area.
        </Text>

        {/* Estimated wait card */}
        <View style={styles.waitCard}>
          <View style={styles.waitRow}>
            {/* Clock icon */}
            <View style={styles.clockFace}>
              {/* Minute hand — points to 12 */}
              <View style={styles.clockHandMinute} />
              {/* Hour hand — points to 3 */}
              <View style={styles.clockHandHour} />
            </View>
            <View>
              <Text style={styles.waitLabel}>Estimated availab</Text>
              <Text style={styles.waitTime}>5–10 minutes</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.tryAgainBtn}
          activeOpacity={0.85}
          onPress={() => navigation.replace('FindingRider', { pickup, dropoff })}>
          <Text style={styles.tryAgainText}>Try Again</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.navigate('CancelBooking')}
          activeOpacity={0.7}>
          <Text style={styles.cancelText}>Cancel Booking</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F0F0F0' },

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

  body: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingBottom: 20,
  },

  prohibitionIcon: {
    fontSize: 64,
    marginBottom: 24,
  },

  title: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.textDark,
    textAlign: 'center',
    marginBottom: 12,
  },

  subtitle: {
    fontSize: 14,
    color: Colors.textGray,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },

  // Estimated wait card
  waitCard: {
    borderRadius: 15,
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#FFF7ED',
  },
  waitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  clockFace: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2.5,
    borderColor: Colors.textGray,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Minute hand: tall, anchored at bottom-center, points to 12
  clockHandMinute: {
    position: 'absolute',
    width: 2,
    height: 8,
    borderRadius: 1,
    backgroundColor: Colors.textGray,
    bottom: '50%',
    left: '50%',
    marginLeft: -1,
  },
  // Hour hand: short, extends rightward from center, points to 3
  clockHandHour: {
    position: 'absolute',
    width: 6,
    height: 2,
    borderRadius: 1,
    backgroundColor: Colors.textGray,
    top: '50%',
    left: '50%',
    marginTop: -1,
  },
  waitLabel: {
    fontSize: 12,
    color: Colors.textGray,
    marginBottom: 2,
  },
  waitTime: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.primary,
  },

  // Footer
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    gap: 12,
    alignItems: 'center',
  },
  tryAgainBtn: {
    width: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: 'center',
  },
  tryAgainText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
  cancelText: {
    color: Colors.primary,
    fontSize: 15,
    fontWeight: '600',
  },
});

export default NoRidersScreen;
