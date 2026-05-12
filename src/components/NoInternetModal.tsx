import React, { useEffect, useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ScrollView,
} from 'react-native';
import NetInfo from '@react-native-community/netinfo';

const NoInternetModal: React.FC = () => {
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsOffline(!(state.isConnected && state.isInternetReachable !== false));
    });
    return () => unsubscribe();
  }, []);

  const handleTryAgain = () => {
    NetInfo.fetch().then(state => {
      setIsOffline(!(state.isConnected && state.isInternetReachable !== false));
    });
  };

  if (!isOffline) return null;

  return (
    <Modal visible animationType="fade" onRequestClose={() => {}}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <ScrollView
        style={styles.screen}
        contentContainerStyle={styles.scrollContent}
        bounces={false}
        showsVerticalScrollIndicator={false}>

        {/* ── Illustration ─────────────────────────────────────────── */}
        <View style={styles.illustration}>
          {/* Concentric rings — centered absolutely */}
          <View style={styles.ringsContainer}>
            <View style={styles.ring220} />
            <View style={styles.ring170} />
            <View style={styles.ring120} />
            <View style={styles.ring74} />
          </View>

          {/* Satellite + X badge */}
          <View style={styles.satelliteWrapper}>
            <View style={styles.satelliteCircle}>
              <Text style={styles.satelliteEmoji}>📡</Text>
            </View>
            <View style={styles.xBadge}>
              <Text style={styles.xText}>✕</Text>
            </View>
          </View>

          {/* Signal wave lines */}
          <View style={styles.wave1} />
          <View style={styles.wave2} />

          {/* Signal bars */}
          <View style={styles.signalBars}>
            <View style={[styles.bar, { height: 12 }]} />
            <View style={[styles.bar, { height: 18 }]} />
            <View style={[styles.bar, { height: 24 }]} />
            <View style={[styles.bar, { height: 30 }]} />
          </View>

          <Text style={styles.noSignalText}>No Signal</Text>
        </View>

        {/* ── Content ───────────────────────────────────────────────── */}
        <View style={styles.content}>

          <Text style={styles.title}>No Internet Connection</Text>
          <Text style={styles.subtitle}>
            {"Oops! It seems you're offline.\nPlease check your connection and try again."}
          </Text>

          {/* Tips card */}
          <View style={styles.tipsCard}>
            <Text style={styles.tipsTitle}>Try these steps:</Text>
            <View style={styles.tipRow}>
              <Text style={styles.tipIcon}>📶</Text>
              <Text style={styles.tipText}>Turn on Mobile Data or connect to WiFi</Text>
            </View>
            <View style={styles.tipRow}>
              <Text style={styles.tipIcon}>✈</Text>
              <Text style={styles.tipText}>Disable Airplane Mode if enabled</Text>
            </View>
            <View style={styles.tipRow}>
              <Text style={styles.tipIcon}>🔄</Text>
              <Text style={styles.tipText}>Move to an area with better signal</Text>
            </View>
          </View>

          {/* Try Again */}
          <TouchableOpacity
            style={styles.tryAgainBtn}
            onPress={handleTryAgain}
            activeOpacity={0.85}>
            <Text style={styles.tryAgainText}>🔄{'   '}Try Again</Text>
          </TouchableOpacity>

          {/* Connection Lost pill */}
          <View style={styles.pill}>
            <View style={styles.pillDot} />
            <Text style={styles.pillText}>Connection Lost</Text>
          </View>

        </View>
      </ScrollView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    flexGrow: 1,
  },

  // ── Illustration ──────────────────────────────────────────────
  illustration: {
    height: 320,
    backgroundColor: '#f7f7f7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringsContainer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring220: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(247,85,34,0.06)',
  },
  ring170: {
    position: 'absolute',
    width: 170,
    height: 170,
    borderRadius: 85,
    backgroundColor: 'rgba(247,85,34,0.09)',
  },
  ring120: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(247,85,34,0.13)',
  },
  ring74: {
    position: 'absolute',
    width: 74,
    height: 74,
    borderRadius: 37,
    backgroundColor: 'rgba(247,85,34,0.16)',
  },

  satelliteWrapper: {
    position: 'relative',
    marginBottom: 14,
  },
  satelliteCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(247,85,34,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  satelliteEmoji: {
    fontSize: 44,
  },
  xBadge: {
    position: 'absolute',
    bottom: -2,
    right: -6,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#ef4444',
    alignItems: 'center',
    justifyContent: 'center',
  },
  xText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },

  wave1: {
    width: 60,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(247,85,34,0.15)',
    marginBottom: 6,
  },
  wave2: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(247,85,34,0.10)',
    marginBottom: 10,
  },

  signalBars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 5,
    marginBottom: 8,
  },
  bar: {
    width: 10,
    borderRadius: 3,
    backgroundColor: '#e1e1e1',
  },

  noSignalText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#a6a6a6',
  },

  // ── Content ───────────────────────────────────────────────────
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 32,
    paddingBottom: 24,
    alignItems: 'center',
  },

  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1c1c1c',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    color: '#737373',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },

  tipsCard: {
    width: '100%',
    backgroundColor: '#f7f7f7',
    borderWidth: 1,
    borderColor: '#e1e1e1',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 24,
    gap: 10,
  },
  tipsTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1c1c1c',
    marginBottom: 4,
  },
  tipRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  tipIcon: {
    fontSize: 14,
    lineHeight: 20,
    width: 20,
  },
  tipText: {
    flex: 1,
    fontSize: 12,
    color: '#737373',
    lineHeight: 20,
  },

  tryAgainBtn: {
    width: '100%',
    height: 54,
    backgroundColor: '#f75522',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  tryAgainText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
  },

  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239,68,68,0.08)',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 7,
    gap: 8,
  },
  pillDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ef4444',
  },
  pillText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ef4444',
  },
});

export default NoInternetModal;
