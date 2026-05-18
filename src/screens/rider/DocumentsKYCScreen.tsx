import React, { useEffect } from 'react';
import {
  View,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
} from 'react-native';
import { Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useDispatch, useSelector } from 'react-redux';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { Colors } from '../../theme/theme';
import { fetchRiderDocuments } from '../../redux/sagas/rider/riderDocumentsAction';
import type { AppDispatch, RootState } from '../../redux/store';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'DocumentsKYC'>;
};

type DocStatus = 'Verified' | 'Expiring Soon' | 'Pending';

const STATUS_MAP: Record<string, DocStatus> = {
  approved:      'Verified',
  verified:      'Verified',
  expiring_soon: 'Expiring Soon',
  pending:       'Pending',
};

const STATUS_STYLE: Record<DocStatus, { bg: string; text: string }> = {
  'Verified':      { bg: '#E8F5E9', text: '#16A34A' },
  'Expiring Soon': { bg: '#FFF3E0', text: '#D97706' },
  'Pending':       { bg: '#FFF0ED', text: Colors.primary },
};

const DocumentsKYCScreen: React.FC<Props> = ({ navigation }) => {
  console.log('SCREEN RENDERED =====>');
  const dispatch = useDispatch<AppDispatch>();
  const { loading, data, error } = useSelector((state: RootState) => state.riderDocuments);

  useEffect(() => {
  const action = fetchRiderDocuments();
  console.log('ACTION TYPE ====>', action.type); // ← ADD THIS
  dispatch(action);
}, []);

  const docs = data
    ? [
        data.drivingLicense && {
          id: '1',
          icon: '🪪',
          name: 'Driving License',
          number: data.drivingLicense.number,
          status: STATUS_MAP[data.drivingLicense.status] ?? 'Pending',
        },
        data.rcCard && {
          id: '2',
          icon: '📄',
          name: 'RC Card',
          number: data.rcCard.number,
          status: STATUS_MAP[data.rcCard.status] ?? 'Pending',
        },
      ].filter(Boolean)
    : [];

  const allVerified = docs.length > 0 && docs.every(d => d && d.status === 'Verified');
  const anyPending  = docs.some(d => d && d.status === 'Pending');

  const kycTitle = allVerified ? 'KYC Verified' : anyPending ? 'KYC Pending' : 'KYC Under Review';
  const kycSub   = allVerified
    ? 'All documents are up to date'
    : 'Some documents are awaiting verification';
  const kycIcon  = allVerified ? '🛡️' : '⏳';
  const kycColor = allVerified ? '#16A34A' : '#D97706';
  const kycBg    = allVerified ? '#F0FFF4' : '#FFFBEB';
  const kycBorder = allVerified ? '#BBF7D0' : '#FDE68A';

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.secondary} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Image
            source={require('../../assets/icons/arrow.png')}
            style={styles.backArrow}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Documents & KYC</Text>
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors.secondary} />
        </View>
      ) : error ? (
        <View style={styles.centered}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={() => dispatch(fetchRiderDocuments())} style={styles.retryBtn}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

          {/* KYC status banner */}
          <View style={[styles.kycBanner, { backgroundColor: kycBg, borderBottomColor: kycBorder }]}>
            <Text style={styles.kycIcon}>{kycIcon}</Text>
            <View style={styles.kycText}>
              <Text style={[styles.kycTitle, { color: kycColor }]}>{kycTitle}</Text>
              <Text style={styles.kycSub}>{kycSub}</Text>
            </View>
          </View>

          {/* Document list */}
          <View style={styles.list}>
            {docs.map((doc, index) => {
              if (!doc) return null;
              const badge = STATUS_STYLE[doc.status];
              return (
                <View
                  key={doc.id}
                  style={[styles.docCard, index < docs.length - 1 && styles.docCardBorder]}>
                  <Text style={styles.docIcon}>{doc.icon}</Text>
                  <View style={styles.docInfo}>
                    <Text style={styles.docName}>{doc.name}</Text>
                    <Text style={styles.docNumber}>{doc.number}</Text>
                  </View>
                  <View style={[styles.badge, { backgroundColor: badge.bg }]}>
                    <Text style={[styles.badgeText, { color: badge.text }]}>{doc.status}</Text>
                  </View>
                </View>
              );
            })}
          </View>

        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.secondary,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  backArrow: { width: 20, height: 20, resizeMode: 'contain', tintColor: '#fff' },
  headerTitle: { fontSize: 18, color: Colors.white, fontWeight: '700', marginLeft: 12 },

  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  errorText: { fontSize: 14, color: Colors.textGray, textAlign: 'center', marginBottom: 16 },
  retryBtn: {
    backgroundColor: Colors.secondary,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryText: { color: Colors.white, fontWeight: '700' },

  scroll: { paddingBottom: 32 },

  kycBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    borderBottomWidth: 1,
    paddingHorizontal: 20, paddingVertical: 16,
  },
  kycIcon:  { fontSize: 28 },
  kycText:  { flex: 1 },
  kycTitle: { fontSize: 15, fontWeight: '800', marginBottom: 2 },
  kycSub:   { fontSize: 12, color: '#4B8B5E', marginTop: 2 },

  list: { backgroundColor: Colors.white, marginTop: 12 },
  docCard: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 20, paddingVertical: 16, gap: 14,
  },
  docCardBorder: { borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  docIcon:   { fontSize: 28, width: 36, textAlign: 'center' },
  docInfo:   { flex: 1 },
  docName:   { fontSize: 14, fontWeight: '700', color: Colors.textDark, marginBottom: 2 },
  docNumber: { fontSize: 12, color: Colors.textGray },

  badge:     { borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  badgeText: { fontSize: 11, fontWeight: '700' },
});

export default DocumentsKYCScreen;
