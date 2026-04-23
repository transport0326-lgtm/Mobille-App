import React from 'react';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {
  View,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors } from '../../theme/theme';
import { RootStackParamList } from '../../navigation/AppNavigator';

const { width } = Dimensions.get('window');

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'TripCompleted'>;
};
const TripCompletedScreen: React.FC<Props> = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.secondary} />

      {/* Top green banner */}
      <View style={styles.topBanner}>
        <Text style={styles.timeText}>9:41</Text>
        <View style={styles.checkCircle}>
          <MaterialIcons name="check" size={28} color={Colors.white} />
        </View>
        <Text style={styles.tripTitle}>Trip Completed!</Text>
        <Text style={styles.tripSub}>BK-1042 delivered successfully</Text>
      </View>

      {/* White content area */}
      <View style={styles.content}>

        {/* Trip Earnings */}
        <Text style={styles.sectionTitle}>Trip Earnings</Text>

        {/* Earned amount card */}
        <View style={styles.earningsCard}>
          <Text style={styles.earnedLabel}>You Earned</Text>
          <Text style={styles.earnedAmount}>₹ 55</Text>
        </View>

        {/* Trip details */}
        <View style={styles.detailsCard}>
          {[
            { label: 'Distance', value: '3.2 km' },
            { label: 'Duration', value: '18 min' },
            { label: 'Vehicle', value: 'Bike' },
            { label: 'Payment', value: 'Online Pay' },
          ].map((row, i, arr) => (
            <View
              key={i}
              style={[
                styles.detailRow,
                i === arr.length - 1 && { borderBottomWidth: 0 },
              ]}>
              <Text style={styles.detailLabel}>{row.label}</Text>
              <Text style={styles.detailValue}>{row.value}</Text>
            </View>
          ))}
        </View>

        {/* Route */}
        <View style={styles.routeCard}>
          <View style={styles.routeRow}>
            <View style={[styles.routeDot, { backgroundColor: '#22C55E' }]} />
            <Text style={styles.routeText}>Salt Lake Sector V, Kolkata</Text>
          </View>
          <View style={styles.routeRow}>
            <View style={[styles.routeDot, { backgroundColor: Colors.primary }]} />
            <Text style={styles.routeText}>Park Street, Kolkata</Text>
          </View>
        </View>

      </View>

      {/* Back to Home Button */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.homeBtn}
          onPress={() => navigation.reset({ index: 0, routes: [{ name: 'RiderDashboard' }] })}
          activeOpacity={0.85}>
          <Text style={styles.homeBtnText}>Back to Home</Text>
        </TouchableOpacity>
      </View>

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F5F5F0' },

  // Top green banner
  topBanner: {
    backgroundColor: '#1A2B6D',
    paddingTop: 10,
    paddingBottom: 28,
    alignItems: 'center',
    gap: 8,
  },
  timeText: { fontSize: 13, color: 'rgba(255,255,255,0.7)', marginBottom: 4 },
  checkCircle: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#22C55E', alignItems: 'center', justifyContent: 'center' },
  checkMark: { fontSize: 28, color: Colors.white, fontWeight: '800' },
  tripTitle: { fontSize: 22, fontWeight: '800', color: Colors.white },
  tripSub: { fontSize: 13, color: 'rgba(255,255,255,0.75)' },

  // Content
  content: {
    flex: 1,
    backgroundColor: Colors.white,
    paddingHorizontal: 20,
    paddingTop: 24,
  },

  sectionTitle: { fontSize: 16, fontWeight: '800', color: Colors.textDark, marginBottom: 12 },

  // Earnings card
  earningsCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F0F4FF',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 4,
  },
  earnedLabel: { fontSize: 14, color: Colors.textGray },
  earnedAmount: { fontSize: 32, fontWeight: '800', color: '#22C55E' },

  // Details card
  detailsCard: {
    backgroundColor: Colors.white,
    borderRadius: 10,
    marginBottom: 4,
    marginTop: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  detailLabel: { fontSize: 13, color: Colors.textGray },
  detailValue: { fontSize: 13, fontWeight: '600', color: Colors.textDark },

  // Route
  routeCard: {
    marginTop: 8,
    gap: 10,
  },
  routeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  routeDot: { width: 10, height: 10, borderRadius: 5 },
  routeText: { fontSize: 14, fontWeight: '500', color: Colors.textDark },

  // Bottom
  bottomBar: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  homeBtn: {
    backgroundColor: Colors.secondary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    elevation: 2,
    shadowColor: Colors.secondary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  homeBtnText: { color: Colors.white, fontSize: 16, fontWeight: '700' },
});

export default TripCompletedScreen;
