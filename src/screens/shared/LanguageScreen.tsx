import React, { useState } from 'react';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {
  View,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  FlatList,
  TextInput,
} from 'react-native';
import { Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { Colors } from '../../theme/theme';

type LanguageScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Language'>;
};

type Language = {
  code: string;
  name: string;
  nativeName: string;
};

const LANGUAGES: Language[] = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ' },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം' },
  { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ' },
  { code: 'ur', name: 'Urdu', nativeName: 'اردو' },
  { code: 'or', name: 'Odia', nativeName: 'ଓଡ଼ିଆ' },
  { code: 'as', name: 'Assamese', nativeName: 'অসমীয়া' },
];

const LanguageScreen: React.FC<LanguageScreenProps> = ({ navigation }) => {
  const [selected, setSelected] = useState('en');
  const [search, setSearch] = useState('');

  const filtered = LANGUAGES.filter(lang =>
    lang.name.toLowerCase().includes(search.toLowerCase()) ||
    lang.nativeName.toLowerCase().includes(search.toLowerCase()),
  );

  const renderItem = ({ item }: { item: Language }) => {
    const isSelected = item.code === selected;
    return (
      <TouchableOpacity
        style={styles.langItem}
        activeOpacity={0.7}
        onPress={() => setSelected(item.code)}>
        <View style={styles.langText}>
          <Text style={[styles.langName, isSelected && styles.langNameSelected]}>
            {item.name}
          </Text>
          {isSelected && (
            <Text style={styles.langNative}>{item.nativeName}</Text>
          )}
        </View>
        {isSelected && (
          <View style={styles.checkBadge}>
            <MaterialIcons name="check" size={14} color={Colors.white} />
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.secondary} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} activeOpacity={0.7}>
          <Text style={styles.backArrow}>{'←'}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Language</Text>
        <View style={{ width: 36 }} />
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search language..."
          placeholderTextColor="#AAAAAA"
          value={search}
          onChangeText={setSearch}
          autoCorrect={false}
        />
      </View>

      {/* Language List */}
      <FlatList
        data={filtered}
        keyExtractor={item => item.code}
        renderItem={renderItem}
        style={styles.list}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.secondary,
    paddingHorizontal: 16,
    paddingVertical: 14,
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
  headerTitle: {
    fontSize: 18,
    lineHeight: 22,
    fontWeight: '800',
    color: Colors.white,
    includeFontPadding: false,
  },

  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    margin: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.borderGray,
    paddingHorizontal: 12,
    height: 44,
  },
  searchIcon: {
    fontSize: 14,
    marginRight: 8,
    color: Colors.textGray,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: Colors.textDark,
    paddingVertical: 0,
  },

  list: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  langItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 18,
  },
  langText: {
    flex: 1,
  },
  langName: {
    fontSize: 15,
    color: Colors.secondary,
    fontWeight: '500',
  },
  langNameSelected: {
    color: Colors.primary,
    fontWeight: '700',
  },
  langNative: {
    fontSize: 12,
    color: Colors.textGray,
    marginTop: 2,
  },
  checkBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkIcon: {
    fontSize: 14,
    color: Colors.white,
    fontWeight: '800',
  },
  separator: {
    height: 1,
    backgroundColor: Colors.borderGray,
    marginHorizontal: 20,
  },
});

export default LanguageScreen;
