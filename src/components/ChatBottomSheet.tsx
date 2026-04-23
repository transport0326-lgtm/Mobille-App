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
import { Colors } from '../theme/theme';

const { height, width } = Dimensions.get('window');
const SHEET_HEIGHT = height * 0.72;

type Message = {
  id: string;
  text: string;
  sender: 'rider' | 'me';
  time: string;
};

const INITIAL_MESSAGES: Message[] = [
  { id: '1', text: "I'm on my way 🏍️",                   sender: 'rider', time: '10:33 AM' },
  { id: '2', text: 'Ok, parcel is ready at the counter',  sender: 'me',    time: '10:36 AM' },
  { id: '3', text: 'Picked up, heading to drop-off now',  sender: 'rider', time: '10:42 AM' },
  { id: '4', text: 'Great, thanks!',                      sender: 'me',    time: '10:45 AM' },
];

type Props = {
  visible: boolean;
  onClose: () => void;
};

const ChatBottomSheet: React.FC<Props> = ({ visible, onClose }) => {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [inputText, setInputText] = useState('');
  const slideAnim = useRef(new Animated.Value(SHEET_HEIGHT)).current;
  const scrollRef  = useRef<ScrollView>(null);

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

  const handleSend = () => {
    if (!inputText.trim()) return;
    const now  = new Date();
    const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setMessages(prev => [...prev, { id: Date.now().toString(), text: inputText.trim(), sender: 'me', time }]);
    setInputText('');
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  };

  const handleClose = () => {
    Keyboard.dismiss(); // Hide keyboard only on backdrop click
    Animated.timing(slideAnim, {
      toValue: SHEET_HEIGHT, duration: 250, useNativeDriver: true,
    }).start(() => onClose());
  };

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
              <Text style={styles.riderAvatarText}>JH</Text>
            </View>
            <View style={styles.riderInfo}>
              <Text style={styles.riderName}>Jahid Hasan</Text>
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
            keyboardShouldPersistTaps="handled" // allow send on first click
            onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: false })}>
            {messages.map(msg => (
              <View key={msg.id} style={[styles.messageRow, msg.sender === 'me' ? styles.messageRowMe : styles.messageRowRider]}>
                {msg.sender === 'rider' && (
                  <View style={styles.msgAvatar}>
                    <Text style={styles.msgAvatarText}>JH</Text>
                  </View>
                )}
                <View style={msg.sender === 'me' ? styles.bubbleMe : styles.bubbleRider}>
                  <Text style={msg.sender === 'me' ? styles.bubbleTextMe : styles.bubbleTextRider}>
                    {msg.text}
                  </Text>
                  <Text style={msg.sender === 'me' ? styles.timeMe : styles.timeRider}>
                    {msg.time}
                  </Text>
                </View>
              </View>
            ))}

            {/* Typing dots */}
            <View style={styles.typingRow}>
              <View style={styles.msgAvatar}>
                <Text style={styles.msgAvatarText}>JH</Text>
              </View>
              <View style={styles.typingBubble}>
                <View style={styles.typingDots}>
                  <View style={[styles.typingDot, { opacity: 0.35 }]} />
                  <View style={[styles.typingDot, { opacity: 0.65 }]} />
                  <View style={[styles.typingDot, { opacity: 1.0 }]} />
                </View>
              </View>
            </View>
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
              style={[styles.sendBtn, !inputText.trim() && styles.sendBtnDisabled]}
              onPress={handleSend}
              activeOpacity={0.8}
              disabled={!inputText.trim()}>
              <Text style={styles.sendBtnIcon}>➤</Text>
            </TouchableOpacity>
          </View>

        </KeyboardAvoidingView>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.45)' },
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

  typingRow:    { flexDirection: 'row', alignItems: 'flex-end', gap: 8 },
  typingBubble: { backgroundColor: '#F0F0F0', borderRadius: 16, borderBottomLeftRadius: 4, paddingHorizontal: 14, paddingVertical: 12 },
  typingDots:   { flexDirection: 'row', gap: 4 },
  typingDot:    { width: 7, height: 7, borderRadius: 4, backgroundColor: '#AAAAAA' },

  inputRow:        { flexDirection: 'row', alignItems: 'flex-end', paddingHorizontal: 14, paddingVertical: 10, borderTopWidth: 1, borderTopColor: '#F0F0F0', gap: 10, backgroundColor: Colors.white },
  chatInput:       { flex: 1, backgroundColor: '#F5F5F5', borderRadius: 22, paddingHorizontal: 16, paddingVertical: 10, fontSize: 14, color: Colors.textDark, maxHeight: 90 },
  sendBtn:         { width: 42, height: 42, borderRadius: 21, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
  sendBtnDisabled: { backgroundColor: '#E0E0E0' },
  sendBtnIcon:     { fontSize: 16, color: Colors.white, marginLeft: 2 },
});

export default ChatBottomSheet;
