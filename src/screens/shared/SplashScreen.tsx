import React, { useEffect } from 'react';
import {
  View,
  Image,
  StyleSheet,
  StatusBar,
  Animated,
  Dimensions,
} from 'react-native';
import { Text } from 'react-native-paper';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { Colors } from '../../theme/theme';
import { loadToken, loadRole } from '../../utils/tokenStorage';

const { width } = Dimensions.get('window');

type SplashScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Splash'>;
};

const SplashScreen: React.FC<SplashScreenProps> = ({ navigation }) => {
  const logoOpacity = new Animated.Value(0);
  const logoScale = new Animated.Value(0.8);
  const taglineOpacity = new Animated.Value(0);
  const lineWidth = new Animated.Value(0);

  useEffect(() => {
    // Logo fade + scale in
    Animated.parallel([
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
      Animated.spring(logoScale, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Tagline fade in
      Animated.timing(taglineOpacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }).start();

      // Bottom line animation
      Animated.timing(lineWidth, {
        toValue: 80,
        duration: 500,
        useNativeDriver: false,
      }).start();
    });

    // Navigate to Login after 2.5 seconds
    const timer = setTimeout(async () => {
      const [token, role] = await Promise.all([loadToken(), loadRole()]);
      if (token && role) {
        if (role === 'rider') {
          navigation.replace('RiderDashboard');
        } else {
          navigation.replace('CustomerDashboard');
        }
      } else {
        navigation.replace('Login');
      }
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />

      {/* Center Content */}
      <View style={styles.centerContent}>
        <Animated.View
          style={[
            styles.logoContainer,
            {
              opacity: logoOpacity,
              transform: [{ scale: logoScale }],
            },
          ]}>
          <Image
            source={require('../../assets/images/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </Animated.View>

        <Animated.View style={{ opacity: taglineOpacity }}>
          <Text style={styles.tagline}>You Are Transpport.</Text>
        </Animated.View>
      </View>

      {/* Bottom Section */}
      <View style={styles.bottomSection}>
        <Animated.View
          style={[
            styles.bottomLine,
            {
              width: lineWidth,
            },
          ]}
        />
        <Text style={styles.bottomText}>Delivery Fleet Management</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    marginBottom: 24,
    alignItems: 'center',
  },
  logo: {
    width: width * 0.55,
    height: 80,
  },
  tagline: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.textDark,
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  bottomSection: {
    paddingBottom: 40,
    alignItems: 'center',
    gap: 10,
  },
  bottomLine: {
    height: 3,
    backgroundColor: Colors.primary,
    borderRadius: 2,
  },
  bottomText: {
    fontSize: 13,
    color: Colors.primary,
    letterSpacing: 1,
    fontWeight: '500',
  },
});

export default SplashScreen;
