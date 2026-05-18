import React from 'react';
import {
  View,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  Linking,
} from 'react-native';
import { Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { Colors } from '../../theme/theme';
import { clearToken } from '../../utils/tokenStorage';

type RiderSuspendedScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'RiderSuspended'>;
  route: RouteProp<RootStackParamList, 'RiderSuspended'>;
};

const formatDate = (dateStr?: string) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
};

const RiderSuspendedScreen: React.FC<RiderSuspendedScreenProps> = ({
  navigation,
  route,
}) => {
  const {
    suspendedOn,
    suspendedBy,
    reason,
    suspensionType,
    reviewDate,
  } = route.params ?? {};

  const handleSignOut = async () => {
    await clearToken();
    navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
  };

  const handleContactSupport = () => {
    Linking.openURL('mailto:support@transpport.com');
  };

  const detailRows = [
    { label: 'Suspended On', value: formatDate(suspendedOn), valueStyle: styles.detailValue },
    { label: 'Suspended By', value: suspendedBy ?? '—', valueStyle: styles.detailValue },
    { label: 'Reason', value: reason ?? '—', valueStyle: styles.detailValueRed },
    { label: 'Type', value: suspensionType ?? '—', valueStyle: styles.detailValue },
    { label: 'Review Date', value: reviewDate ?? '—', valueStyle: styles.detailValue },
  ];

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* AppBar */}
      <View style={styles.appBar}>
        <View style={styles.logoRow}>
          <Text style={styles.logoT}>T</Text>
          <Text style={styles.logoName}>TRANSPPORT</Text>
        </View>
        <View style={styles.lockedBadge}>
          <Text style={styles.lockedBadgeText}>🔒 Account Locked</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>

        {/* Illustration */}
        <View style={styles.illustrationCard}>
          <View style={styles.shieldCircle}>
            <Text style={styles.shieldEmoji}>🛡️</Text>
          </View>
          <View style={styles.suspendedBadge}>
            <Text style={styles.suspendedBadgeText}>⛔  Account Suspended</Text>
          </View>
        </View>

        {/* Title & Subtitle */}
        <View style={styles.titleBlock}>
          <Text style={styles.title}>Your Account Has Been{'\n'}Suspended</Text>
          <Text style={styles.subtitle}>
            Access to the Transpport rider app has been{'\n'}
            temporarily restricted by the admin team.
          </Text>
        </View>

        {/* Suspension Details Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📋  Suspension Details</Text>
          <View style={styles.divider} />
          {detailRows.map((row, i) => (
            <View key={i} style={styles.detailRow}>
              <Text style={styles.detailLabel}>{row.label}</Text>
              <Text style={[styles.detailValue, row.valueStyle]}>{row.value}</Text>
            </View>
          ))}
        </View>

        {/* What You Can Do Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>💡  What You Can Do</Text>
          <View style={styles.divider} />

          <TouchableOpacity
            style={styles.actionRow}
            activeOpacity={0.7}
            onPress={handleContactSupport}>
            <View style={[styles.actionIconBg, { backgroundColor: '#d9dde4' }]}>
              <Text style={styles.actionEmoji}>📞</Text>
            </View>
            <View style={styles.actionText}>
              <Text style={styles.actionTitle}>Contact Support</Text>
              <Text style={styles.actionSub}>Speak with our team to resolve the issue</Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionRow}
            activeOpacity={0.7}
            onPress={handleContactSupport}>
            <View style={[styles.actionIconBg, { backgroundColor: '#fee5de' }]}>
              <Text style={styles.actionEmoji}>📝</Text>
            </View>
            <View style={styles.actionText}>
              <Text style={[styles.actionTitle, { color: Colors.primary }]}>Submit an Appeal</Text>
              <Text style={styles.actionSub}>File a formal appeal to review this decision</Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Warning Banner */}
        <View style={styles.warningBanner}>
          <Text style={styles.warningIcon}>⚠️</Text>
          <Text style={styles.warningText}>
            If you believe this is a mistake, please contact support within 7 days.
            Unresolved suspensions may become permanent.
          </Text>
        </View>

        {/* Sign Out */}
        <TouchableOpacity
          style={styles.signOutBtn}
          activeOpacity={0.7}
          onPress={handleSignOut}>
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#faf9f6' },

  appBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e5',
    paddingHorizontal: 20,
    height: 60,
  },
  logoRow: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  logoT: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.primary,
    marginRight: 4,
  },
  logoName: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.secondary,
    letterSpacing: 0.5,
  },
  lockedBadge: {
    backgroundColor: '#fff1f1',
    borderWidth: 1,
    borderColor: '#e5b2b2',
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  lockedBadgeText: {
    color: '#e53939',
    fontSize: 11,
    fontWeight: '600',
  },

  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 28,
    paddingBottom: 24,
    gap: 16,
  },

  illustrationCard: {
    backgroundColor: '#fff1f1',
    borderWidth: 1.5,
    borderColor: '#ebc7c7',
    borderRadius: 20,
    height: 160,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  shieldCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#e53939',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shieldEmoji: { fontSize: 30 },
  suspendedBadge: {
    backgroundColor: '#e53939',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  suspendedBadgeText: { color: '#fff', fontSize: 12, fontWeight: '600' },

  titleBlock: { alignItems: 'center', gap: 6 },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1a1a1f',
    textAlign: 'center',
    lineHeight: 28,
  },
  subtitle: {
    fontSize: 13,
    color: '#73737a',
    textAlign: 'center',
    lineHeight: 20,
  },

  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e0e0e5',
    padding: 16,
    gap: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1a1a1f',
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e5',
  },

  detailRow: {
    flexDirection: 'row',
    gap: 8,
  },
  detailLabel: {
    width: 110,
    fontSize: 12,
    color: '#73737a',
  },
  detailValue: {
    flex: 1,
    fontSize: 12,
    fontWeight: '500',
    color: '#1a1a1f',
  },
  detailValueRed: {
    color: '#e53939',
    fontWeight: '600',
  },

  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f7',
    borderRadius: 10,
    paddingHorizontal: 14,
    height: 52,
    gap: 12,
  },
  actionIconBg: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionEmoji: { fontSize: 16 },
  actionText: { flex: 1, gap: 2 },
  actionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.secondary,
  },
  actionSub: {
    fontSize: 11,
    color: '#73737a',
  },
  chevron: { fontSize: 18, color: '#73737a' },

  warningBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#fff7eb',
    borderWidth: 1,
    borderColor: '#e5bf66',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 8,
  },
  warningIcon: { fontSize: 13 },
  warningText: {
    flex: 1,
    fontSize: 11,
    color: '#994d00',
    lineHeight: 16,
  },

  signOutBtn: {
    borderWidth: 1.5,
    borderColor: '#e0e0e5',
    borderRadius: 14,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  signOutText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#73737a',
  },
});

export default RiderSuspendedScreen;
