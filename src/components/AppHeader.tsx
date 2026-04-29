import React from 'react';
import { View, Image, TouchableOpacity, StyleSheet } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Text } from 'react-native-paper';
import { Colors } from '../theme/theme';

type AppHeaderProps = {
  name?: string;
  subtitle?: string;
  showBell?: boolean;
  onBellPress?: () => void;
};

const AppHeader: React.FC<AppHeaderProps> = ({
  name,
  subtitle,
  showBell = false,
  onBellPress,
}) => (
  <View style={styles.container}>
    <View style={styles.logoRow}>
      <Image
        source={require('../assets/images/logo2.png')}
        style={styles.logo}
        resizeMode="contain"
      />
      {showBell && (
        <TouchableOpacity
          onPress={onBellPress}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          activeOpacity={0.7}>
          <Ionicons name="notifications-outline" size={26} color={Colors.white} />
        </TouchableOpacity>
      )}
    </View>

    {(name || subtitle) && (
      <View style={styles.greetingRow}>
        {name ? (
          <Text style={styles.greeting}>Hello, {name}!</Text>
        ) : null}
        {subtitle ? (
          <Text style={styles.subtitle}>{subtitle}</Text>
        ) : null}
      </View>
    )}
  </View>
);

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.secondary,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logo: {
    height: 38,
    width: 150,
  },
  greetingRow: {
    marginTop: 10,
  },
  greeting: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.white,
  },
  subtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 2,
  },
});

export default AppHeader;
