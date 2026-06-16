import { Link, Stack } from 'expo-router';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors, FontSize, Spacing, BorderRadius } from '../constants/Colors';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'الصفحة غير موجودة' }} />
      <View style={styles.container}>
        <Text style={styles.icon}>🤷</Text>
        <Text style={styles.title}>عذراً، الصفحة غير موجودة</Text>
        <Text style={styles.text}>
          الصفحة التي تبحث عنها غير متوفرة أو تم نقلها.
        </Text>
        <Link href="/" asChild>
          <TouchableOpacity style={styles.button} activeOpacity={0.8}>
            <Text style={styles.buttonIcon}>🏠</Text>
            <Text style={styles.buttonText}>العودة إلى الرئيسية</Text>
          </TouchableOpacity>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: Colors.background,
    gap: Spacing.md,
  },
  icon: {
    fontSize: 80,
    marginBottom: Spacing.lg,
  },
  title: {
    color: Colors.text,
    fontSize: FontSize.xl,
    fontWeight: '700',
    fontFamily: 'Tajawal',
    textAlign: 'center',
  },
  text: {
    color: Colors.textSecondary,
    fontSize: FontSize.base,
    fontFamily: 'Tajawal',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: Spacing.lg,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: BorderRadius.md,
  },
  buttonIcon: {
    fontSize: 18,
  },
  buttonText: {
    color: '#fff',
    fontSize: FontSize.lg,
    fontWeight: '600',
    fontFamily: 'Tajawal',
  },
});
