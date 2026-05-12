import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { Colors } from '../../theme/theme';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import { fetchUserSupportMessages , sendUserSupportMessage } from '../../redux/sagas/supportChat/userSupportAction';

type LiveChatScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'LiveChat'>;
};

const QUICK_REPLIES = ['Track my order', 'Cancel booking', 'Payment issue', 'Other issue'];

const getTime = () => {
  const now = new Date();
  const h = now.getHours();
  const m = now.getMinutes().toString().padStart(2, '0');
  const ampm = h >= 12 ? 'PM' : 'AM';
  return `${h % 12 || 12}:${m} ${ampm}`;
};

const LiveChatScreen: React.FC<LiveChatScreenProps> = ({ navigation }) => {
  const dispatch = useDispatch();

  // ── Redux state ──
  const { messages, loading } = useSelector((state: RootState) => state.userSupportMessages);
  const userName = useSelector((state: RootState) =>
    state.profile.data?.name ?? state.riderProfile.data?.name ?? 'User'
  );

  // ── Local state ──
  const [inputText, setInputText] = useState('');
  const [isFirstMessage, setIsFirstMessage] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  // ── 1. Page load pe messages fetch karo ──
  useEffect(() => {
    dispatch(fetchUserSupportMessages());
  }, [dispatch]);

  // ── 2. Naye message aane par scroll to end ──
  useEffect(() => {
    if (messages?.length) {
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [messages?.length]);

  // ── 3. Pehli baar fetch hone par check karo ──
  useEffect(() => {
    if (!loading && messages?.length === 0) {
      setIsFirstMessage(true); // pehla message hai — name bhejna hoga
    } else {
      setIsFirstMessage(false);
    }
  }, [loading, messages]);

  // ── 4. Message send karo ──
  const sendMessage = (quickText?: string) => {
    const text = (quickText ?? inputText).trim();
    if (!text) return;

    dispatch(
      sendUserSupportMessage({
        text,
        ...(isFirstMessage && { name: userName }),
      })
    );

    if (!quickText) setInputText('');
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.secondary} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} activeOpacity={0.7}>
          <Text style={styles.backArrow}>{'←'}</Text>
        </TouchableOpacity>
        <View style={styles.agentInfo}>
          <View style={styles.agentLogo}>
            <Text style={styles.agentLogoText}>T</Text>
          </View>
          <View>
            <Text style={styles.agentName}>Transpport Support</Text>
            <View style={styles.onlineRow}>
              <View style={styles.onlineDot} />
              <Text style={styles.onlineText}>Online · Replies in 2 min</Text>
            </View>
          </View>
        </View>
        <View style={{ width: 36 }} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}>

        {/* Messages */}
        <ScrollView
          ref={scrollRef}
          style={styles.messages}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}>

          <Text style={styles.dateSeparator}>Today, {getTime()}</Text>

          {/* Loading / empty state */}
          {loading && messages?.length === 0 && (
            <Text style={styles.dateSeparator}>Loading...</Text>
          )}
          {!loading && messages?.length === 0 && (
            <Text style={styles.emptyText}>No messages yet. Say hello!</Text>
          )}

          {/* Messages API se ──────────────────── */}
          {(messages ?? []).map((msg: any) => {
            const isUser = msg.senderType === 'user' || msg.senderType === 'rider';
            return (
              <View
                key={msg._id}
                style={[
                  styles.bubbleRow,
                  isUser ? styles.bubbleRowUser : styles.bubbleRowSupport,
                ]}>
                <View style={[
                  styles.bubble,
                  isUser ? styles.bubbleUser : styles.bubbleSupport,
                ]}>
                  <Text style={[
                    styles.bubbleText,
                    isUser ? styles.bubbleTextUser : styles.bubbleTextSupport,
                  ]}>
                    {msg.text}
                  </Text>
                  <Text style={[
                    styles.bubbleTime,
                    isUser ? styles.bubbleTimeUser : styles.bubbleTimeSupport,
                  ]}>
                    {msg.createdAt
                      ? new Date(msg.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
                      : ''}
                  </Text>
                </View>
              </View>
            );
          })}

          {/* Typing indicator */}
          {loading && messages?.length > 0 && (
            <View style={styles.bubbleRowSupport}>
              <View style={[styles.bubble, styles.bubbleSupport, styles.typingBubble]}>
                <Text style={styles.typingDots}>● ● ●</Text>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Quick Replies */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.quickReplies}
          contentContainerStyle={styles.quickRepliesContent}>
          {QUICK_REPLIES.map(reply => (
            <TouchableOpacity
              key={reply}
              style={styles.chip}
              onPress={() => sendMessage(reply)}
              activeOpacity={0.7}>
              <Text style={styles.chipText}>{reply}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Input Bar */}
        <View style={styles.inputBar}>
          <TouchableOpacity style={styles.attachBtn} activeOpacity={0.7}>
            <Text style={styles.attachIcon}>📎</Text>
          </TouchableOpacity>
          <TextInput
            style={styles.input}
            placeholder="Type a message..."
            placeholderTextColor="#AAAAAA"
            value={inputText}
            onChangeText={setInputText}
            multiline
            returnKeyType="send"
            onSubmitEditing={() => sendMessage()}
          />
          <TouchableOpacity
            style={[styles.sendBtn, !inputText.trim() && styles.sendBtnDisabled]}
            onPress={() => sendMessage()}
            activeOpacity={0.8}
            disabled={!inputText.trim()}>
            <Text style={styles.sendIcon}>›</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F0F0F0' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: Colors.secondary, paddingHorizontal: 16, paddingVertical: 12 },
  backBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  backArrow: { fontSize: 22, lineHeight: 22, color: Colors.white, fontWeight: '700', includeFontPadding: false },
  agentInfo: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  agentLogo: { width: 38, height: 38, borderRadius: 19, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
  agentLogoText: { fontSize: 18, fontWeight: '800', color: Colors.white },
  agentName: { fontSize: 15, fontWeight: '700', color: Colors.white },
  onlineRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 2 },
  onlineDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#22C55E' },
  onlineText: { fontSize: 11, color: 'rgba(255,255,255,0.75)' },
  messages: { flex: 1, backgroundColor: '#F0F0F0' },
  messagesContent: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 },
  dateSeparator: { alignSelf: 'center', fontSize: 12, color: Colors.textGray, marginBottom: 16 },
  bubbleRow: { marginBottom: 10 },
  bubbleRowUser: { alignItems: 'flex-end' },
  bubbleRowSupport: { alignItems: 'flex-start' },
  bubble: { maxWidth: '78%', borderRadius: 16, paddingHorizontal: 14, paddingVertical: 10 },
  bubbleUser: { backgroundColor: Colors.primary, borderBottomRightRadius: 4 },
  bubbleSupport: { backgroundColor: Colors.white, borderBottomLeftRadius: 4, elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2 },
  bubbleText: { fontSize: 14, lineHeight: 20 },
  bubbleTextUser: { color: Colors.white },
  bubbleTextSupport: { color: Colors.textDark },
  bubbleTime: { fontSize: 10, marginTop: 4 },
  bubbleTimeUser: { color: 'rgba(255,255,255,0.7)', textAlign: 'right' },
  bubbleTimeSupport: { color: Colors.textGray },
  emptyText: { textAlign: 'center', color: Colors.textGray, fontSize: 13, marginTop: 32 },
  typingBubble: { paddingVertical: 12, paddingHorizontal: 16 },
  typingDots: { fontSize: 10, color: Colors.textGray, letterSpacing: 3 },
  quickReplies: { backgroundColor: Colors.white, maxHeight: 52 },
  quickRepliesContent: { paddingHorizontal: 12, paddingVertical: 10, gap: 8, flexDirection: 'row' },
  chip: { borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6 },
  chipText: { fontSize: 13, color: Colors.textDark, fontWeight: '500' },
  inputBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.white, paddingHorizontal: 12, paddingVertical: 10, borderTopWidth: 1, borderTopColor: Colors.borderGray, gap: 8 },
  attachBtn: { padding: 4 },
  attachIcon: { fontSize: 20, color: Colors.textGray },
  input: { flex: 1, fontSize: 14, color: Colors.textDark, maxHeight: 100, paddingVertical: 0 },
  sendBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
  sendBtnDisabled: { backgroundColor: Colors.borderGray },
  sendIcon: { fontSize: 24, color: Colors.white, fontWeight: '800', lineHeight: 28 },
});

export default LiveChatScreen;