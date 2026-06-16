import { StatusBar } from 'expo-status-bar';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { Colors, FontSize, Spacing, BorderRadius } from '../constants/Colors';

/**
 * نافذة منبثقة عامة
 * Generic modal screen for various overlays
 */
export default function ModalScreen() {
  return (
    <View style={styles.container}>
      <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />
      <Text style={styles.icon}>ℹ️</Text>
      <Text style={styles.title}>معلومات</Text>
      <View style={styles.separator} />
      <Text style={styles.text}>
        هذه نافذة منبثقة. يمكن استخدامها لعرض معلومات إضافية أو تأكيد إجراءات.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background,
    padding: Spacing.xl,
  },
  icon: {
    fontSize: 48,
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: FontSize.xxl,
    fontWeight: '700',
    color: Colors.text,
    fontFamily: 'Tajawal',
  },
  separator: {
    marginVertical: Spacing.lg,
    height: 1,
    width: '60%',
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  text: {
    fontSize: FontSize.base,
    color: Colors.textSecondary,
    fontFamily: 'Tajawal',
    textAlign: 'center',
    lineHeight: 24,
  },
});
