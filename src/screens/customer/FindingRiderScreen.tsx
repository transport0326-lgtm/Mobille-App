import React, { useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  Animated,
  Dimensions,
  Easing,
} from 'react-native';
import { Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { Colors } from '../../theme/theme';

const { width, height } = Dimensions.get('window');
const RADAR_HEIGHT = height * 0.40;
const CENTER_X = width / 2;
const CENTER_Y = RADAR_HEIGHT / 2;

type FindingRiderScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'FindingRider'>;
  route: RouteProp<RootStackParamList, 'FindingRider'>;
};

// Riders at different distances from center (like real radar)
// distance: how far from center in pixels
const RIDERS = [
  { angle: 200, distance: width * 0.30 }, // far left-bottom
  { angle: 40, distance: width * 0.28 }, // far top-right
  { angle: 310, distance: width * 0.22 }, // mid right
  { angle: 150, distance: width * 0.18 }, // close left
];

// Convert angle+distance to x,y position
const getPosition = (angle: number, distance: number) => {
  const rad = (angle * Math.PI) / 180;
  return {
    left: CENTER_X + distance * Math.cos(rad) - 18,
    top: CENTER_Y + distance * Math.sin(rad) - 18,
  };
};

// Ripple wave — expands outward from center
const RippleWave: React.FC<{ delay: number }> = ({ delay }) => {
  const scale = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(scale, {
            toValue: 1,
            duration: 2600,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.sequence([
            Animated.timing(opacity, {
              toValue: 0.75,
              duration: 100,
              useNativeDriver: true,
            }),
            Animated.timing(opacity, {
              toValue: 0,
              duration: 2500,
              easing: Easing.out(Easing.ease),
              useNativeDriver: true,
            }),
          ]),
        ]),
        Animated.parallel([
          Animated.timing(scale, { toValue: 0, duration: 0, useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 0, duration: 0, useNativeDriver: true }),
        ]),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);

  const SIZE = width * 0.88;

  return (
    <Animated.View
      style={{
        position: 'absolute',
        width: SIZE,
        height: SIZE,
        borderRadius: SIZE / 2,
        backgroundColor: '#E8897A',
        opacity,
        transform: [{ scale }],
      }}
    />
  );
};

// Person icon rider dot with bounce
const RiderDot: React.FC<{ left: number; top: number; delay: number }> = ({ left, top, delay }) => {
  const bounce = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(bounce, {
          toValue: -5,
          duration: 600,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(bounce, {
          toValue: 0,
          duration: 600,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);

  return (
    <Animated.View
      style={[
        styles.riderDot,
        { left, top, transform: [{ translateY: bounce }] },
      ]}>
      {/* Person icon — head + body */}
      <View style={styles.personIcon}>
        <View style={styles.personHead} />
        <View style={styles.personBody} />
      </View>
    </Animated.View>
  );
};

// Loader — orange D/arc shape rotating like screenshot
// It's a circle with only right half colored = "D" shape rotating
const ArcLoader: React.FC = () => {
  const spin = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(spin, {
        toValue: 1,
        duration: 1600,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    loop.start();
    return () => loop.stop();
  }, []);

  const rotate = spin.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.loaderContainer}>
      {/* Outer gray ring */}
      <View style={styles.loaderGrayRing} />

      {/* Rotating wrapper */}
      <Animated.View style={[styles.loaderRotating, { transform: [{ rotate }] }]}>
        {/* Orange arc — covers ~200deg, looks like D/leaf shape */}
        {/* We achieve this by a circle with overflow hidden + colored half */}
        <View style={styles.loaderArcWrapper}>
          {/* Top half — orange */}
          <View style={[styles.loaderHalf, styles.loaderHalfTop]} />
          {/* Bottom half — transparent */}
          <View style={[styles.loaderHalf, styles.loaderHalfBottom]} />
        </View>
      </Animated.View>

      {/* White center circle to make it look like a ring */}
      <View style={styles.loaderInner} />
    </View>
  );
};

const FindingRiderScreen: React.FC<FindingRiderScreenProps> = ({ navigation, route }) => {
  const { pickup, dropoff } = route.params;

  useEffect(() => {
    const timeout = setTimeout(() => {
      navigation.replace('NoRiders', { pickup, dropoff });
    }, 100000);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.secondary} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Finding Rider</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Radar */}
      <View style={styles.radarArea}>
        {/* 4 staggered ripple waves */}
        <RippleWave delay={0} />
        <RippleWave delay={650} />
        <RippleWave delay={1300} />
        <RippleWave delay={1950} />

        {/* Orange center dot */}
        <View style={styles.centerDot} />

        {/* Riders at distance-based positions */}
        {RIDERS.map((r, i) => {
          const pos = getPosition(r.angle, r.distance);
          return (
            <RiderDot key={i} left={pos.left} top={pos.top} delay={i * 300} />
          );
        })}
      </View>

      {/* Bottom */}
      <View style={styles.bottomSheet}>
        <ArcLoader />

        <Text style={styles.findingTitle}>Finding your rider...</Text>
        <Text style={styles.findingSubtitle}>
          Looking for nearby riders to pick up{'\n'}your parcel. This usually takes 30-60 seconds.
        </Text>

        <View style={styles.locationCard}>
          <View style={styles.locationRow}>
            <View style={[styles.locDot, { backgroundColor: '#22C55E' }]} />
            <View>
              <Text style={styles.locType}>PICKUP</Text>
              <Text style={styles.locAddress}>{pickup || 'Salt Lake Sector V, Kolkata'}</Text>
            </View>
          </View>
          <View style={styles.locationDivider} />
          <View style={styles.locationRow}>
            <View style={[styles.locDot, { backgroundColor: Colors.primary }]} />
            <View>
              <Text style={styles.locType}>DROP-OFF</Text>
              <Text style={styles.locAddress}>{dropoff || 'Park Street, Kolkata'}</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={styles.cancelBtn}
          onPress={() => navigation.navigate('CancelBooking')}
          activeOpacity={0.8}>
          <Text style={styles.cancelBtnText}>Cancel Booking</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.riderFoundBtn}
          onPress={() => navigation.navigate('BookingConfirmed')}
          activeOpacity={0.85}>
          <Text style={styles.riderFoundBtnText}>✅ Rider Found (Test)</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.white },

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

  radarArea: {
    width: width,
    height: RADAR_HEIGHT,
    backgroundColor: '#D4EDDA',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    position: 'relative',
    borderBottomWidth: 1.5,
    borderBottomColor: '#B2D8BC',
  },

  centerDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: Colors.primary,
    zIndex: 30,
    elevation: 8,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 8,
  },

  // Rider dot
  riderDot: {
    position: 'absolute',
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#22C55E',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 20,
    elevation: 6,
  },

  // Person icon inside green dot
  personIcon: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 1,
  },
  personHead: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.white,
  },
  personBody: {
    width: 14,
    height: 8,
    borderTopLeftRadius: 7,
    borderTopRightRadius: 7,
    backgroundColor: Colors.white,
  },

  // Loader
  loaderContainer: {
    width: 58,
    height: 58,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  loaderGrayRing: {
    position: 'absolute',
    width: 58,
    height: 58,
    borderRadius: 29,
    borderWidth: 3,
    borderColor: '#E0E0E0',
  },
  loaderRotating: {
    position: 'absolute',
    width: 58,
    height: 58,
    borderRadius: 29,
    overflow: 'hidden',
  },
  loaderArcWrapper: {
    width: 58,
    height: 58,
  },
  loaderHalf: {
    width: 58,
    height: 29,
  },
  loaderHalfTop: {
    backgroundColor: Colors.primary,
    borderTopLeftRadius: 29,
    borderTopRightRadius: 29,
  },
  loaderHalfBottom: {
    backgroundColor: 'transparent',
  },
  loaderInner: {
    position: 'absolute',
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.white,
  },

  bottomSheet: {
    flex: 1,
    backgroundColor: Colors.white,
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 14,
  },

  findingTitle: {
    fontSize: 21,
    fontWeight: '800',
    color: Colors.textDark,
    marginBottom: 7,
    textAlign: 'center',
  },
  findingSubtitle: {
    fontSize: 13,
    color: Colors.textGray,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
  },

  locationCard: {
    width: '100%',
    backgroundColor: '#F8F8F8',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 2,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.borderGray,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 11,
    gap: 12,
  },
  locDot: { width: 10, height: 10, borderRadius: 5 },
  locType: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.textGray,
    letterSpacing: 1,
    marginBottom: 2,
  },
  locAddress: { fontSize: 14, fontWeight: '600', color: Colors.textDark },
  locationDivider: { height: 1, backgroundColor: Colors.borderGray, marginLeft: 22 },

  cancelBtn: {
    width: '100%',
    borderWidth: 1.5,
    borderColor: Colors.primary,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: Colors.white,
  },
  cancelBtnText: { color: Colors.primary, fontSize: 15, fontWeight: '700' },
  riderFoundBtn: {
  width: '100%',
  backgroundColor: '#22C55E',
  borderRadius: 10,
  paddingVertical: 14,
  alignItems: 'center',
  marginBottom: 12,
  marginTop:10,
},
riderFoundBtnText: {
  color: Colors.white,
  fontSize: 15,
  fontWeight: '700',
},
});

export default FindingRiderScreen;
