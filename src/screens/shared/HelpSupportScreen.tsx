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
  navigation: NativeStackNavigationProp<RootStackParamList, 'HelpSupport'>;
};

const CONTACT_OPTIONS = [
  { id: 'chat',  icon: '💬', label: 'Live Chat', onPress: (nav: Props['navigation']) => nav.navigate('LiveChat') },
  { id: 'call',  icon: '📞', label: 'Call Us',   onPress: () => {} },
  { id: 'email', icon: '📧', label: 'Email',     onPress: () => {} },
];

const FAQS = [
  'How do I update my bank details?',
  'What to do if customer is unavailable?',
  'How are earnings calculated?',
  'How to report a safety incident?',
  'What if the parcel is damaged?',
  'How do I take a break / go offline?',
];

const HelpSupportScreen: React.FC<Props> = ({ navigation }) => (
  <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
    <StatusBar barStyle="light-content" backgroundColor={Colors.secondary} />

    {/* Header */}
    <View style={styles.header}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} activeOpacity={0.7}>
        <Text style={styles.backArrow}>←</Text>
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Help & Support</Text>
      <View style={{ width: 36 }} />
    </View>

    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

      {/* Contact options */}
      <View style={styles.contactCard}>
        {CONTACT_OPTIONS.map(option => (
          <TouchableOpacity
            key={option.id}
            style={styles.contactItem}
            activeOpacity={0.7}
            onPress={() => option.onPress(navigation)}>
            <View style={styles.iconBox}>
              <Text style={styles.iconEmoji}>{option.icon}</Text>
            </View>
            <Text style={styles.contactLabel}>{option.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* FAQ */}
      <Text style={styles.faqTitle}>Frequently Asked Questions</Text>

      <View style={styles.faqList}>
        {FAQS.map((question, i) => (
          <TouchableOpacity
            key={i}
            style={[styles.faqItem, i < FAQS.length - 1 && styles.faqItemBorder]}
            activeOpacity={0.7}>
            <Text style={styles.faqText}>{question}</Text>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={{ height: 24 }} />
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

  scroll: { paddingTop: 16, paddingHorizontal: 16 },

  // Contact card
  contactCard: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderRadius: 14, padding: 16, marginBottom: 24,
    elevation: 1, shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4,
  },
  contactItem:  { flex: 1, alignItems: 'center', gap: 8 },
  iconBox: {
    width: 52, height: 52, borderRadius: 12,
    backgroundColor: '#F0F4FF',
    alignItems: 'center', justifyContent: 'center',
  },
  iconEmoji:    { fontSize: 22 },
  contactLabel: { fontSize: 12, fontWeight: '600', color: Colors.textDark },

  // FAQ
  faqTitle: {
    fontSize: 16, fontWeight: '800', color: Colors.secondary, marginBottom: 12,
  },
  faqList: {
    backgroundColor: Colors.white, borderRadius: 14,
    elevation: 1, shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4,
    overflow: 'hidden',
  },
  faqItem: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 18, paddingVertical: 18,
  },
  faqItemBorder: { borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  faqText:  { flex: 1, fontSize: 14, color: Colors.textDark },
  chevron:  { fontSize: 20, color: Colors.textGray, lineHeight: 22 },
});

export default HelpSupportScreen;
