import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  TextInput as RNTextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Modal,
  Keyboard,
} from 'react-native';
import { Text } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { Colors } from '../theme/theme';
import { fetchMessages, sendMessage } from '../redux/sagas/chat/chatAction';
import { clearChat } from '../redux/slices/chatSlice';
import type { RootState, AppDispatch } from '../redux/store';

const { height, width } = Dimensions.get('window');
const SHEET_HEIGHT = height * 0.72;
const POLL_INTERVAL_MS = 5000;
const QUICK_REPLIES = ['Where is my parcel?', 'Running late?', 'Okay, thanks!', 'Be careful!'];

const getInitials = (name?: string) => {
  if (!name) return '?';
  const parts = name.trim().split(' ').filter(Boolean);
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const formatTime = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

type Props = {
  visible: boolean;
  onClose: () => void;
  bookingId: string;
  riderName?: string;
};

const ChatBottomSheet: React.FC<Props> = ({ visible, onClose, bookingId, riderName }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { messages, sending } = useSelector((state: RootState) => state.chat);

  const [inputText, setInputText] = useState('');
  const slideAnim = useRef(new Animated.Value(SHEET_HEIGHT)).current;
  const scrollRef = useRef<ScrollView>(null);
  const pollRef = useRef<any>(null);

  // Slide animation
  useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 0, tension: 65, friction: 11, useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: SHEET_HEIGHT, duration: 250, useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  // Start/stop polling when sheet opens or closes
  useEffect(() => {
    if (visible && bookingId) {
      dispatch(clearChat());
      dispatch(fetchMessages({ bookingId }));

      pollRef.current = setInterval(() => {
        dispatch(fetchMessages({ bookingId }));
      }, POLL_INTERVAL_MS);
    } else {
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
    }

    return () => {
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
    };
  }, [visible, bookingId]);

  // Scroll to bottom when messages update
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [messages.length]);

  const handleSend = (quickText?: string) => {
    const text = (quickText ?? inputText).trim();
    if (!text || sending) return;
    if (!quickText) setInputText('');
    dispatch(sendMessage({ bookingId, text, senderRole: 'customer' }));
  };

  const handleClose = () => {
    Keyboard.dismiss();
    Animated.timing(slideAnim, {
      toValue: SHEET_HEIGHT, duration: 250, useNativeDriver: true,
    }).start(() => onClose());
  };

  const initials = getInitials(riderName);

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={handleClose}>
      <TouchableOpacity style={styles.backdrop} onPress={handleClose} activeOpacity={1} />

      <Animated.View style={[styles.sheet, { transform: [{ translateY: slideAnim }] }]}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}>

          {/* Handle */}
          <View style={styles.handleBar} />

          {/* Header */}
          <View style={styles.chatHeader}>
            <View style={styles.riderAvatar}>
              <Text style={styles.riderAvatarText}>{initials}</Text>
            </View>
            <View style={styles.riderInfo}>
              <Text style={styles.riderName}>{riderName ?? 'Rider'}</Text>
              <View style={styles.onlineRow}>
                <View style={styles.onlineDot} />
                <Text style={styles.onlineText}>On the way</Text>
              </View>
            </View>
            <TouchableOpacity onPress={handleClose} style={styles.closeBtn}>
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Messages */}
          <ScrollView
            ref={scrollRef}
            style={styles.messageList}
            contentContainerStyle={styles.messageListContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: false })}>

            {messages.length === 0 ? (
              <Text style={styles.emptyText}>No messages yet. Say hello!</Text>
            ) : (
              messages.map(msg => {
                const isMe = msg.senderRole === 'customer';
                return (
                  <View
                    key={msg._id}
                    style={[styles.messageRow, isMe ? styles.messageRowMe : styles.messageRowRider]}>
                    {!isMe && (
                      <View style={styles.msgAvatar}>
                        <Text style={styles.msgAvatarText}>{initials}</Text>
                      </View>
                    )}
                    <View style={isMe ? styles.bubbleMe : styles.bubbleRider}>
                      <Text style={isMe ? styles.bubbleTextMe : styles.bubbleTextRider}>
                        {msg.text}
                      </Text>
                      <Text style={isMe ? styles.timeMe : styles.timeRider}>
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

          {/* Input */}
          <View style={styles.inputRow}>
            <RNTextInput
              style={styles.chatInput}
              placeholder="Type a message..."
              placeholderTextColor="#AAAAAA"
              value={inputText}
              onChangeText={setInputText}
              multiline
            />
            <TouchableOpacity
              style={[styles.sendBtn, (!inputText.trim() || sending) && styles.sendBtnDisabled]}
              onPress={() => handleSend()}
              activeOpacity={0.8}
              disabled={!inputText.trim() || sending}>
              <Text style={styles.sendBtnIcon}>➤</Text>
            </TouchableOpacity>
          </View>

        </KeyboardAvoidingView>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.45)' },
  sheet: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    height: SHEET_HEIGHT, backgroundColor: Colors.white,
    borderTopLeftRadius: 20, borderTopRightRadius: 20,
    elevation: 20, shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.15, shadowRadius: 12,
  },
  handleBar: { width: 40, height: 4, borderRadius: 2, backgroundColor: '#DDDDDD', alignSelf: 'center', marginTop: 10, marginBottom: 4 },

  chatHeader:      { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  riderAvatar:     { width: 42, height: 42, borderRadius: 21, backgroundColor: Colors.secondary, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  riderAvatarText: { fontSize: 14, fontWeight: '700', color: Colors.white },
  riderInfo:       { flex: 1 },
  riderName:       { fontSize: 15, fontWeight: '700', color: Colors.textDark },
  onlineRow:       { flexDirection: 'row', alignItems: 'center', marginTop: 2, gap: 5 },
  onlineDot:       { width: 7, height: 7, borderRadius: 4, backgroundColor: '#22C55E' },
  onlineText:      { fontSize: 12, color: Colors.textGray },
  closeBtn:        { width: 32, height: 32, borderRadius: 16, backgroundColor: '#F5F5F5', alignItems: 'center', justifyContent: 'center' },
  closeBtnText:    { fontSize: 14, color: Colors.textGray, fontWeight: '600' },

  messageList:        { flex: 1 },
  messageListContent: { paddingHorizontal: 14, paddingVertical: 14, gap: 12 },
  emptyText:          { textAlign: 'center', color: Colors.textGray, fontSize: 13, marginTop: 32 },
  messageRow:         { flexDirection: 'row', alignItems: 'flex-end', gap: 8 },
  messageRowMe:       { justifyContent: 'flex-end' },
  messageRowRider:    { justifyContent: 'flex-start' },
  msgAvatar:          { width: 30, height: 30, borderRadius: 15, backgroundColor: Colors.secondary, alignItems: 'center', justifyContent: 'center' },
  msgAvatarText:      { fontSize: 10, fontWeight: '700', color: Colors.white },

  bubbleRider:     { backgroundColor: '#F0F0F0', borderRadius: 16, borderBottomLeftRadius: 4,  paddingHorizontal: 14, paddingVertical: 10, maxWidth: width * 0.62 },
  bubbleMe:        { backgroundColor: Colors.primary, borderRadius: 16, borderBottomRightRadius: 4, paddingHorizontal: 14, paddingVertical: 10, maxWidth: width * 0.62 },
  bubbleTextRider: { fontSize: 14, color: Colors.textDark, lineHeight: 20 },
  bubbleTextMe:    { fontSize: 14, color: Colors.white,    lineHeight: 20 },
  timeRider:       { fontSize: 10, color: Colors.textGray,              marginTop: 4 },
  timeMe:          { fontSize: 10, color: 'rgba(255,255,255,0.75)',      marginTop: 4, textAlign: 'right' },

  quickReplies:        { backgroundColor: Colors.white, maxHeight: 52, borderTopWidth: 1, borderTopColor: '#F0F0F0' },
  quickRepliesContent: { paddingHorizontal: 12, paddingVertical: 10, gap: 8, flexDirection: 'row' },
  chip:                { borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6 },
  chipText:            { fontSize: 13, color: Colors.textDark, fontWeight: '500' },
  inputRow:        { flexDirection: 'row', alignItems: 'flex-end', paddingHorizontal: 14, paddingVertical: 10, borderTopWidth: 1, borderTopColor: '#F0F0F0', gap: 10, backgroundColor: Colors.white },
  chatInput:       { flex: 1, backgroundColor: '#F5F5F5', borderRadius: 22, paddingHorizontal: 16, paddingVertical: 10, fontSize: 14, color: Colors.textDark, maxHeight: 90 },
  sendBtn:         { width: 42, height: 42, borderRadius: 21, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
  sendBtnDisabled: { backgroundColor: '#E0E0E0' },
  sendBtnIcon:     { fontSize: 16, color: Colors.white, marginLeft: 2 },
});

export default ChatBottomSheet;
