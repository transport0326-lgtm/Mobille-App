import React, { useState } from 'react';
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
import { RootStackParamList } from '../../navigation/AppNavigator';
import { Colors } from '../../theme/theme';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'HelpSupport'>;
};

const SUPPORT_PHONE = '+918001234567';
const SUPPORT_EMAIL = 'support@transpport.com';

const CONTACT_OPTIONS = [
  { id: 'chat',  icon: '💬', label: 'Live Chat', onPress: (nav: Props['navigation']) => nav.navigate('LiveChat') },
  { id: 'call',  icon: '📞', label: 'Call Us',   onPress: () => Linking.openURL(`tel:${SUPPORT_PHONE}`) },
  { id: 'email', icon: '📧', label: 'Email',     onPress: () => Linking.openURL(`mailto:${SUPPORT_EMAIL}`) },
];

const FAQS = [
  {
    question: 'How do I update my bank details?',
    answer: 'Go to Profile → Bank & Payment Details. Enter your account number, IFSC code, and account holder name, then tap Save. Changes are reviewed within 24 hours.',
  },
  {
    question: 'What to do if customer is unavailable?',
    answer: 'Wait at least 5 minutes at the pickup location. If the customer is still unreachable, tap "Customer Unavailable" on the trip screen. Our support team will guide you on next steps.',
  },
  {
    question: 'How are earnings calculated?',
    answer: 'You earn a base fare for each trip plus a per-km distance charge. Bonuses may apply during peak hours. Your full breakdown is visible in the Earnings section after every completed trip.',
  },
  {
    question: 'How to report a safety incident?',
    answer: 'Tap the Emergency button on the active trip screen to alert our team instantly. You can also email support@transpport.com with the trip ID and a description of the incident.',
  },
  {
    question: 'What if the parcel is damaged?',
    answer: 'Take clear photos of the damage before touching the parcel. Report it through the app using "Report Issue" on the trip screen or email us. Do not attempt to deliver a visibly damaged parcel.',
  },
  {
    question: 'How do I take a break / go offline?',
    answer: 'Tap the "Go Offline" button on your dashboard. You will stop receiving new delivery requests immediately. Tap "Go Online" whenever you are ready to start accepting trips again.',
  },
];

const HelpSupportScreen: React.FC<Props> = ({ navigation }) => {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const toggle = (i: number) => setExpandedIndex(prev => (prev === i ? null : i));

  return (
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
          {FAQS.map((faq, i) => {
            const isOpen = expandedIndex === i;
            return (
              <View key={i} style={[i < FAQS.length - 1 && styles.faqItemBorder]}>
                <TouchableOpacity
                  style={styles.faqItem}
                  activeOpacity={0.7}
                  onPress={() => toggle(i)}>
                  <Text style={[styles.faqText, isOpen && styles.faqTextOpen]}>{faq.question}</Text>
                  <Text style={[styles.chevron, isOpen && styles.chevronOpen]}>›</Text>
                </TouchableOpacity>
                {isOpen && (
                  <View style={styles.answerBox}>
                    <Text style={styles.answerText}>{faq.answer}</Text>
                  </View>
                )}
              </View>
            );
          })}
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

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
  faqText:     { flex: 1, fontSize: 14, color: Colors.textDark },
  faqTextOpen: { color: Colors.secondary, fontWeight: '700' },
  chevron:     { fontSize: 20, color: Colors.textGray, lineHeight: 22 },
  chevronOpen: { transform: [{ rotate: '90deg' }], color: Colors.secondary },
  answerBox:   { paddingHorizontal: 18, paddingBottom: 16, paddingTop: 2 },
  answerText:  { fontSize: 13, color: Colors.textGray, lineHeight: 20 },
});

export default HelpSupportScreen;
