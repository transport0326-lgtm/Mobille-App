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
  Linking,
} from 'react-native';
import { Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { Colors } from '../../theme/theme';
import { fetchMessages, sendMessage } from '../../redux/sagas/chat/chatAction';
import { clearChat } from '../../redux/slices/chatSlice';
import type { RootState, AppDispatch } from '../../redux/store';

type RiderChatScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'RiderChat'>;
  route: RouteProp<RootStackParamList, 'RiderChat'>;
};

const QUICK_REPLIES = ['On my way!', 'Reached!', '5 more mins', "Can't find location"];
const POLL_INTERVAL_MS = 5000;

const formatTime = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const RiderChatScreen: React.FC<RiderChatScreenProps> = ({ navigation, route }) => {
  const { customerName, bookingNumber, bookingStatus, customerPhone, bookingId } = route.params;
  const dispatch = useDispatch<AppDispatch>();
  const { messages, sending } = useSelector((state: RootState) => state.chat);

  const [inputText, setInputText] = useState('');
  const scrollRef = useRef<ScrollView>(null);
  const pollRef = useRef<any>(null);

  const initials = customerName
    ? customerName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
    : '??';

  useEffect(() => {
    if (!bookingId) return;

    dispatch(clearChat());
    dispatch(fetchMessages({ bookingId }));

    pollRef.current = setInterval(() => {
      dispatch(fetchMessages({ bookingId }));
    }, POLL_INTERVAL_MS);

    return () => {
      clearInterval(pollRef.current);
      dispatch(clearChat());
    };
  }, [bookingId]);

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [messages.length]);

  const handleSend = (text?: string) => {
    const msgText = (text ?? inputText).trim();
    if (!msgText || sending || !bookingId) return;
    if (!text) setInputText('');
    dispatch(sendMessage({ bookingId, text: msgText, senderRole: 'rider' }));
  };

  const handleCall = () => {
    if (customerPhone) Linking.openURL(`tel:${customerPhone}`);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.secondary} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} activeOpacity={0.7}>
          <Text style={styles.backArrow}>{'←'}</Text>
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <View style={styles.headerMeta}>
            <Text style={styles.headerName}>{customerName}</Text>
            <Text style={styles.headerSub}>{bookingNumber} · {bookingStatus}</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.callBtn} onPress={handleCall} activeOpacity={0.8}>
          <Text style={styles.callIcon}>📞</Text>
        </TouchableOpacity>
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

          {messages.length === 0 ? (
            <Text style={styles.emptyText}>No messages yet. Start the conversation!</Text>
          ) : (
            messages.map(msg => {
              const isMe = msg.senderRole === 'rider';
              return (
                <View
                  key={msg._id}
                  style={[styles.bubbleRow, isMe ? styles.bubbleRowRider : styles.bubbleRowCustomer]}>
                  <View style={[styles.bubble, isMe ? styles.bubbleRider : styles.bubbleCustomer]}>
                    <Text style={[styles.bubbleText, isMe ? styles.bubbleTextRider : styles.bubbleTextCustomer]}>
                      {msg.text}
                    </Text>
                    <Text style={[styles.bubbleTime, isMe ? styles.bubbleTimeRider : styles.bubbleTimeCustomer]}>
                      {formatTime(msg.createdAt)}
                    </Text>
                  </View>
                </View>
              );
            })
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
              onPress={() => handleSend(reply)}
              activeOpacity={0.7}>
              <Text style={styles.chipText}>{reply}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Input Bar */}
        <View style={styles.inputBar}>
          <TextInput
            style={styles.input}
            placeholder="Type a message..."
            placeholderTextColor="#AAAAAA"
            value={inputText}
            onChangeText={setInputText}
            multiline
            returnKeyType="send"
            onSubmitEditing={() => handleSend()}
          />
          <TouchableOpacity
            style={[styles.sendBtn, (!inputText.trim() || sending) && styles.sendBtnDisabled]}
            onPress={() => handleSend()}
            activeOpacity={0.8}
            disabled={!inputText.trim() || sending}>
            <Text style={styles.sendIcon}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Location Banner */}
        <View style={styles.locationBanner}>
          <Text style={styles.locationPin}>📍</Text>
          <Text style={styles.locationText}>Share your live location with customer</Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F0F4F8' },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.secondary,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 10,
  },
  backBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  backArrow: { fontSize: 22, lineHeight: 22, color: Colors.white, fontWeight: '700', includeFontPadding: false },

  headerCenter: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#8C9AB0', alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 14, fontWeight: '800', color: Colors.white },
  headerMeta: { flex: 1 },
  headerName: { fontSize: 15, fontWeight: '700', color: Colors.white },
  headerSub: { fontSize: 11, color: 'rgba(255,255,255,0.7)', marginTop: 1 },

  callBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#22C55E', alignItems: 'center', justifyContent: 'center' },
  callIcon: { fontSize: 18 },

  messages: { flex: 1, backgroundColor: '#F0F4F8' },
  messagesContent: { paddingHorizontal: 16, paddingVertical: 16 },
  emptyText: { textAlign: 'center', color: Colors.textGray, fontSize: 13, marginTop: 32 },

  bubbleRow: { marginBottom: 8 },
  bubbleRowRider: { alignItems: 'flex-end' },
  bubbleRowCustomer: { alignItems: 'flex-start' },
  bubble: { maxWidth: '78%', borderRadius: 16, paddingHorizontal: 14, paddingVertical: 10 },
  bubbleRider: { backgroundColor: Colors.primary, borderBottomRightRadius: 4 },
  bubbleCustomer: { backgroundColor: Colors.white, borderBottomLeftRadius: 4, elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2 },
  bubbleText: { fontSize: 14, lineHeight: 20 },
  bubbleTextRider: { color: Colors.white },
  bubbleTextCustomer: { color: Colors.textDark },
  bubbleTime: { fontSize: 10, marginTop: 4 },
  bubbleTimeRider: { color: 'rgba(255,255,255,0.7)', textAlign: 'right' },
  bubbleTimeCustomer: { color: Colors.textGray },

  quickReplies: { backgroundColor: Colors.white, maxHeight: 52 },
  quickRepliesContent: { paddingHorizontal: 12, paddingVertical: 10, gap: 8, flexDirection: 'row' },
  chip: { borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6 },
  chipText: { fontSize: 13, color: Colors.textDark, fontWeight: '500' },

  inputBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.white, paddingHorizontal: 12, paddingVertical: 10, borderTopWidth: 1, borderTopColor: Colors.borderGray, gap: 8 },
  input: { flex: 1, fontSize: 14, color: Colors.textDark, maxHeight: 100, paddingVertical: 0 },
  sendBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
  sendBtnDisabled: { backgroundColor: Colors.borderGray },
  sendIcon: { fontSize: 24, color: Colors.white, fontWeight: '800', lineHeight: 28 },

  locationBanner: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F0FDF4', paddingHorizontal: 16, paddingVertical: 10, gap: 8, borderTopWidth: 1, borderTopColor: '#BBF7D0' },
  locationPin: { fontSize: 16 },
  locationText: { fontSize: 13, color: '#16A34A', fontWeight: '500' },
});

export default RiderChatScreen;
