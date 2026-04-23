import React from 'react';
import {
  View,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { Colors } from '../../theme/theme';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'DocumentsKYC'>;
};

type DocStatus = 'Verified' | 'Expiring Soon' | 'Pending';

type Document = {
  id: string;
  icon: string;
  name: string;
  number: string;
  expiry: string;
  status: DocStatus;
};

const DOCUMENTS: Document[] = [
  { id: '1', icon: '🪪', name: 'Driving License',           number: 'DL-5678-XXXX-1234', expiry: '12 Aug 2028', status: 'Verified'      },
  { id: '2', icon: '📄', name: 'RC Card',                   number: 'RC-2022-87654',     expiry: '15 Mar 2027', status: 'Verified'      },
  { id: '3', icon: '🪪', name: 'Aadhaar Card',              number: 'XXXX-XXXX-5678',    expiry: 'N/A',         status: 'Verified'      },
  { id: '4', icon: '📋', name: 'PAN Card',                  number: 'XXXXX-1234-X',      expiry: 'N/A',         status: 'Verified'      },
  { id: '5', icon: '🛡️', name: 'Insurance Certificate',    number: 'INS-456789',         expiry: '20 Sep 2026', status: 'Expiring Soon' },
  { id: '6', icon: '🔧', name: 'Vehicle Fitness Certificate', number: 'FIT-2024-001',    expiry: '10 Jan 2027', status: 'Verified'      },
];

const STATUS_STYLE: Record<DocStatus, { bg: string; text: string }> = {
  'Verified':      { bg: '#E8F5E9', text: '#16A34A' },
  'Expiring Soon': { bg: '#FFF3E0', text: '#D97706' },
  'Pending':       { bg: '#FFF0ED', text: Colors.primary },
};

const DocumentsKYCScreen: React.FC<Props> = ({ navigation }) => (
  <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
    <StatusBar barStyle="light-content" backgroundColor={Colors.secondary} />

    {/* Header */}
    <View style={styles.header}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} activeOpacity={0.7}>
        <Text style={styles.backArrow}>←</Text>
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Documents & KYC</Text>
      <View style={{ width: 36 }} />
    </View>

    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

      {/* KYC status banner */}
      <View style={styles.kycBanner}>
        <Text style={styles.kycIcon}>🛡️</Text>
        <View style={styles.kycText}>
          <Text style={styles.kycTitle}>KYC Verified</Text>
          <Text style={styles.kycSub}>All documents are up to date</Text>
        </View>
      </View>

      {/* Document list */}
      <View style={styles.list}>
        {DOCUMENTS.map((doc, index) => {
          const badge = STATUS_STYLE[doc.status];
          return (
            <View
              key={doc.id}
              style={[styles.docCard, index < DOCUMENTS.length - 1 && styles.docCardBorder]}>
              <Text style={styles.docIcon}>{doc.icon}</Text>
              <View style={styles.docInfo}>
                <Text style={styles.docName}>{doc.name}</Text>
                <Text style={styles.docNumber}>{doc.number}</Text>
                <Text style={styles.docExpiry}>Exp: {doc.expiry}</Text>
              </View>
              <View style={[styles.badge, { backgroundColor: badge.bg }]}>
                <Text style={[styles.badgeText, { color: badge.text }]}>{doc.status}</Text>
              </View>
            </View>
          );
        })}
      </View>

      {/* Upload button */}
      <TouchableOpacity style={styles.uploadBtn} activeOpacity={0.7}>
        <Text style={styles.uploadText}>+ Upload New Document</Text>
      </TouchableOpacity>

    </ScrollView>
  </SafeAreaView>
);

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: Colors.secondary, paddingHorizontal: 16, paddingVertical: 14,
  },
  backBtn:     { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  backArrow: { fontSize: 22, lineHeight: 22, color: Colors.white, fontWeight: '700', includeFontPadding: false },
  headerTitle: { fontSize: 18, lineHeight: 22, fontWeight: '800', color: Colors.white, includeFontPadding: false },

  scroll: { paddingBottom: 32 },

  // KYC banner
  kycBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: '#F0FFF4', borderBottomWidth: 1, borderBottomColor: '#BBF7D0',
    paddingHorizontal: 20, paddingVertical: 16,
  },
  kycIcon:  { fontSize: 28 },
  kycText:  { flex: 1 },
  kycTitle: { fontSize: 15, fontWeight: '800', color: '#16A34A' },
  kycSub:   { fontSize: 12, color: '#4B8B5E', marginTop: 2 },

  // Document list
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
  docExpiry: { fontSize: 12, color: Colors.textGray, marginTop: 1 },

  badge:     { borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  badgeText: { fontSize: 11, fontWeight: '700' },

  // Upload button
  uploadBtn: {
    marginHorizontal: 16, marginTop: 16,
    borderWidth: 1.5, borderColor: Colors.secondary, borderStyle: 'dashed',
    borderRadius: 12, paddingVertical: 16, alignItems: 'center',
  },
  uploadText: { fontSize: 15, fontWeight: '700', color: Colors.secondary },
});

export default DocumentsKYCScreen;
