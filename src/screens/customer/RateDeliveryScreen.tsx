import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  TextInput as RNTextInput,
  Image,
} from 'react-native';
import { Text } from 'react-native-paper';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { Colors } from '../../theme/theme';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { useDispatch } from 'react-redux';
import { submitRating } from '../../redux/sagas/rating/ratingAction';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'RateDelivery'>;
  route: RouteProp<RootStackParamList, 'RateDelivery'>;
};

const TAGS = ['Fast Delivery', 'Polite Rider', 'Safe Handling', 'On Time', 'Good Communication'];

const RATING_LABELS: Record<number, string> = {
  1: 'Poor',
  2: 'Fair',
  3: 'Good',
  4: 'Great!',
  5: 'Excellent!',
};

const getInitials = (name?: string) => {
  if (!name) return '?';
  const parts = name.trim().split(' ').filter(Boolean);
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const RateDeliveryScreen: React.FC<Props> = ({ navigation, route }) => {
  const dispatch = useDispatch();
  const { bookingId, riderName, vehicleNumber, vehicleType, bookingNumber, total } = route.params;
  const [rating, setRating] = useState(4);
  const [selectedTags, setSelectedTags] = useState<string[]>(['Fast Delivery']);
  const [comment, setComment] = useState('');

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = () => {
    dispatch(submitRating({ bookingId, stars: rating, tags: selectedTags, comment }));
    navigation.reset({ index: 0, routes: [{ name: 'CustomerDashboard' }] });
  };

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
        <Text style={styles.headerTitle}>Rate Your Delivery</Text>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">

        {/* Success Icon */}
        <View style={styles.successIconWrap}>
          <View style={styles.successCircle}>
            <MaterialIcons name="check" size={26} color="#22C55E" />
          </View>
        </View>

        {/* Delivered Title */}
        <Text style={styles.deliveredTitle}>Delivered Successfully!</Text>
        <Text style={styles.deliveredSub}>
          {[bookingNumber, total != null ? `₹${Number(total).toFixed(0)}` : null, vehicleType]
            .filter(Boolean)
            .join(' · ')}
        </Text>

        {/* Rider Card */}
        <View style={styles.riderCard}>
          <View style={styles.riderAvatar}>
            <Text style={styles.riderAvatarText}>{getInitials(riderName)}</Text>
          </View>
          <View>
            <Text style={styles.riderName}>{riderName || '—'}</Text>
            <Text style={styles.riderMeta}>
              {[vehicleType, vehicleNumber].filter(Boolean).join(' · ') || '—'}
            </Text>
          </View>
        </View>

        {/* How was your delivery */}
        <Text style={styles.rateQuestion}>How was your delivery?</Text>

        {/* Stars */}
        <View style={styles.starsRow}>
          {[1, 2, 3, 4, 5].map(star => (
            <TouchableOpacity
              key={star}
              onPress={() => setRating(star)}
              activeOpacity={0.7}
              style={styles.starBtn}>
              <MaterialIcons
                name={star <= rating ? 'star' : 'star-outline'}
                size={40}
                color={star <= rating ? '#F59E0B' : '#DDDDDD'}
              />
            </TouchableOpacity>
          ))}
        </View>

        {/* Rating Label */}
        {rating > 0 && (
          <Text style={styles.ratingLabel}>{RATING_LABELS[rating]}</Text>
        )}

        {/* What went well */}
        <Text style={styles.tagQuestion}>What went well?</Text>

        {/* Tags */}
        <View style={styles.tagsWrap}>
          {TAGS.map(tag => (
            <TouchableOpacity
              key={tag}
              style={[styles.tag, selectedTags.includes(tag) && styles.tagActive]}
              onPress={() => toggleTag(tag)}
              activeOpacity={0.8}>
              <Text style={[styles.tagText, selectedTags.includes(tag) && styles.tagTextActive]}>
                {tag}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Comment Box */}
        <View style={styles.commentBox}>
          <RNTextInput
            style={styles.commentInput}
            placeholder="Add a comment (optional)..."
            placeholderTextColor="#AAAAAA"
            value={comment}
            onChangeText={setComment}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={styles.submitBtn}
          onPress={handleSubmit}
          activeOpacity={0.85}>
          <Text style={styles.submitBtnText}>Submit Rating</Text>
        </TouchableOpacity>

        {/* Skip */}
        <TouchableOpacity
          style={styles.skipBtn}
          onPress={() => navigation.reset({ index: 0, routes: [{ name: 'CustomerDashboard' }] })}
          activeOpacity={0.7}>
          <Text style={styles.skipBtnText}>Skip for now</Text>
        </TouchableOpacity>

        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F5F5F0' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.secondary,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },

  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },

  backArrow: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
    tintColor: '#fff',
  },

  headerTitle: {
    fontSize: 18,
    color: Colors.white,
    fontWeight: '700',
    marginLeft: 12,
  },

  scrollContent: { paddingHorizontal: 20, paddingTop: 28, paddingBottom: 20, alignItems: 'center' },

  // Success icon
  successIconWrap: { marginBottom: 16 },
  successCircle: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#E8F5E9', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#22C55E' },
  successCheck: { fontSize: 26, color: '#22C55E', fontWeight: '800' },

  deliveredTitle: { fontSize: 20, fontWeight: '800', color: Colors.textDark, marginBottom: 6, textAlign: 'center' },
  deliveredSub: { fontSize: 13, color: Colors.textGray, marginBottom: 20, textAlign: 'center' },

  // Rider card
  riderCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.white, borderRadius: 12, padding: 14, gap: 14, width: '100%', marginBottom: 24, elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4 },
  riderAvatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.secondary, alignItems: 'center', justifyContent: 'center' },
  riderAvatarText: { fontSize: 15, fontWeight: '700', color: Colors.white },
  riderName: { fontSize: 15, fontWeight: '700', color: Colors.textDark },
  riderMeta: { fontSize: 12, color: Colors.textGray, marginTop: 2 },

  // Stars
  rateQuestion: { fontSize: 15, fontWeight: '700', color: Colors.textDark, marginBottom: 14, textAlign: 'center' },
  starsRow: { flexDirection: 'row', gap: 8, marginBottom: 10 },
  starBtn: { padding: 4 },
  ratingLabel: { fontSize: 15, fontWeight: '600', color: Colors.textDark, marginBottom: 20 },

  // Tags
  tagQuestion: { fontSize: 14, fontWeight: '700', color: Colors.textDark, marginBottom: 12, alignSelf: 'flex-start' },
  tagsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, width: '100%', marginBottom: 20 },
  tag: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: Colors.white, borderWidth: 1.5, borderColor: '#DDDDDD' },
  tagActive: { backgroundColor: Colors.secondary, borderColor: Colors.secondary },
  tagText: { fontSize: 13, color: Colors.textDark, fontWeight: '500' },
  tagTextActive: { color: Colors.white, fontWeight: '600' },

  // Comment
  commentBox: { width: '100%', backgroundColor: Colors.white, borderRadius: 10, borderWidth: 1, borderColor: '#EEEEEE', marginBottom: 24, padding: 4 },
  commentInput: { fontSize: 14, color: Colors.textDark, minHeight: 80, paddingHorizontal: 12, paddingTop: 10 },

  // Buttons
  submitBtn: { width: '100%', backgroundColor: Colors.primary, borderRadius: 12, paddingVertical: 16, alignItems: 'center', elevation: 2, shadowColor: Colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, marginBottom: 14 },
  submitBtnText: { color: Colors.white, fontSize: 16, fontWeight: '700' },
  skipBtn: { paddingVertical: 6 },
  skipBtnText: { fontSize: 14, color: Colors.textGray, textDecorationLine: 'underline' },
});

export default RateDeliveryScreen;
