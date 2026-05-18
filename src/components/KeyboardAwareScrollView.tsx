import React from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  type ScrollViewProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

type Props = ScrollViewProps & {
  children: React.ReactNode;
  containerStyle?: StyleProp<ViewStyle>;
  keyboardVerticalOffset?: number;
};

/**
 * Drop-in replacement for ScrollView that handles keyboard avoidance correctly
 * on both iOS and Android.
 *
 * On iOS  → KeyboardAvoidingView with behavior="padding"
 * On Android → behavior is omitted; the manifest's adjustResize handles it
 *
 * Usage (no fixed bottom button):
 *   <KeyboardAwareScrollView contentContainerStyle={styles.content}>
 *     ...form fields...
 *   </KeyboardAwareScrollView>
 *
 * Usage (with fixed bottom button — keep KAV manually):
 *   <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
 *     <ScrollView ...>...</ScrollView>
 *     <View style={styles.bottomBar}>...</View>
 *   </KeyboardAvoidingView>
 */
const KeyboardAwareScrollView: React.FC<Props> = ({
  children,
  containerStyle,
  contentContainerStyle,
  keyboardVerticalOffset = 0,
  ...scrollProps
}) => (
  <KeyboardAvoidingView
    style={[{ flex: 1 }, containerStyle]}
    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    keyboardVerticalOffset={keyboardVerticalOffset}
  >
    <ScrollView
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={[{ flexGrow: 1 }, contentContainerStyle]}
      {...scrollProps}
    >
      {children}
    </ScrollView>
  </KeyboardAvoidingView>
);

export default KeyboardAwareScrollView;
