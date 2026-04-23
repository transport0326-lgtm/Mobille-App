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

type LiveChatScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'LiveChat'>;
};

type Message = {
  id: string;
  text: string;
  sender: 'user' | 'support';
  time: string;
};

const INITIAL_MESSAGES: Message[] = [
  { id: '1', text: 'Hi! 👋 Welcome to Transpport Support. How can I help you?', sender: 'support', time: '2:30 PM' },
  { id: '2', text: "Hi, I booked a parcel but rider hasn't picked it up. It's been 20 minutes.", sender: 'user', time: '2:31 PM' },
  { id: '3', text: "I'm sorry for the delay! Let me check your booking. Could you share your ID?", sender: 'support', time: '2:31 PM' },
  { id: '4', text: "Sure, it's #TRP-28451", sender: 'user', time: '2:32 PM' },
  { id: '5', text: 'The rider Amit Kumar is on his way — about 3 min away. 🏍️', sender: 'support', time: '2:33 PM' },
  { id: '6', text: 'Thanks! Can you ask him to hurry?', sender: 'user', time: '2:33 PM' },
];

const LiveChatScreen: React.FC<LiveChatScreenProps> = ({ navigation }) => {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: false }), 100);
  }, []);

  const getTime = () => {
    const now = new Date();
    const h = now.getHours();
    const m = now.getMinutes().toString().padStart(2, '0');
    const ampm = h >= 12 ? 'PM' : 'AM';
    return `${h % 12 || 12}:${m} ${ampm}`;
  };

  const sendMessage = () => {
    const text = inputText.trim();
    if (!text) return;
    const newMsg: Message = { id: Date.now().toString(), text, sender: 'user', time: getTime() };
    setMessages(prev => [...prev, newMsg]);
    setInputText('');
    setIsTyping(true);
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
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

          <Text style={styles.dateSeparator}>Today, 2:30 PM</Text>

          {messages.map(msg => (
            <View
              key={msg.id}
              style={[
                styles.bubbleRow,
                msg.sender === 'user' ? styles.bubbleRowUser : styles.bubbleRowSupport,
              ]}>
              <View style={[
                styles.bubble,
                msg.sender === 'user' ? styles.bubbleUser : styles.bubbleSupport,
              ]}>
                <Text style={[
                  styles.bubbleText,
                  msg.sender === 'user' ? styles.bubbleTextUser : styles.bubbleTextSupport,
                ]}>
                  {msg.text}
                </Text>
                <Text style={[
                  styles.bubbleTime,
                  msg.sender === 'user' ? styles.bubbleTimeUser : styles.bubbleTimeSupport,
                ]}>
                  {msg.time}
                </Text>
              </View>
            </View>
          ))}

          {/* Typing indicator */}
          {isTyping && (
            <View style={styles.bubbleRowSupport}>
              <View style={[styles.bubble, styles.bubbleSupport, styles.typingBubble]}>
                <Text style={styles.typingDots}>● ● ●</Text>
              </View>
            </View>
          )}
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
            onSubmitEditing={sendMessage}
          />
          <TouchableOpacity
            style={[styles.sendBtn, !inputText.trim() && styles.sendBtnDisabled]}
            onPress={sendMessage}
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
  safeArea: {
    flex: 1,
    backgroundColor: '#F0F0F0',
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.secondary,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backArrow: {
    fontSize: 22,
    lineHeight: 22,
    color: Colors.white,
    fontWeight: '700',
    includeFontPadding: false,
  },
  agentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  agentLogo: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  agentLogoText: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.white,
  },
  agentName: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.white,
  },
  onlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 2,
  },
  onlineDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#22C55E',
  },
  onlineText: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.75)',
  },

  messages: {
    flex: 1,
    backgroundColor: '#F0F0F0',
  },
  messagesContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },

  dateSeparator: {
    alignSelf: 'center',
    fontSize: 12,
    color: Colors.textGray,
    marginBottom: 16,
  },

  bubbleRow: {
    marginBottom: 10,
  },
  bubbleRowUser: {
    alignItems: 'flex-end',
  },
  bubbleRowSupport: {
    alignItems: 'flex-start',
  },
  bubble: {
    maxWidth: '78%',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  bubbleUser: {
    backgroundColor: Colors.primary,
    borderBottomRightRadius: 4,
  },
  bubbleSupport: {
    backgroundColor: Colors.white,
    borderBottomLeftRadius: 4,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  bubbleText: {
    fontSize: 14,
    lineHeight: 20,
  },
  bubbleTextUser: {
    color: Colors.white,
  },
  bubbleTextSupport: {
    color: Colors.textDark,
  },
  bubbleTime: {
    fontSize: 10,
    marginTop: 4,
  },
  bubbleTimeUser: {
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'right',
  },
  bubbleTimeSupport: {
    color: Colors.textGray,
  },

  typingBubble: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  typingDots: {
    fontSize: 10,
    color: Colors.textGray,
    letterSpacing: 3,
  },

  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.borderGray,
    gap: 8,
  },
  attachBtn: {
    padding: 4,
  },
  attachIcon: {
    fontSize: 20,
    color: Colors.textGray,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: Colors.textDark,
    maxHeight: 100,
    paddingVertical: 0,
  },
  sendBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: {
    backgroundColor: Colors.borderGray,
  },
  sendIcon: {
    fontSize: 24,
    color: Colors.white,
    fontWeight: '800',
    lineHeight: 28,
  },
});

export default LiveChatScreen;
