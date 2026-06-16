import React from 'react';
import { View, Text, Image, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { Colors, BorderRadius, FontSize, Spacing } from '../../constants/Colors';

interface Props {
  uri?: string;
  loading?: boolean;
  error?: string;
  onRetry?: () => void;
  onUse?: () => void;
}

export default function ImagePreview({ uri, loading = false, error, onRetry, onUse }: Props) {
  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>جاري معالجة الصورة...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorIcon}>⚠️</Text>
        <Text style={styles.errorText}>{error}</Text>
        {onRetry && (
          <TouchableOpacity style={styles.retryButton} onPress={onRetry} activeOpacity={0.7}>
            <Text style={styles.retryText}>إعادة المحاولة</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  if (!uri) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.placeholderIcon}>🖼️</Text>
        <Text style={styles.placeholderText}>لا توجد صورة</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Image source={{ uri }} style={styles.image} resizeMode="cover" />
      {onUse && (
        <TouchableOpacity style={styles.useButton} onPress={onUse} activeOpacity={0.7}>
          <Text style={styles.useText}>استخدام الصورة</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  image: {
    width: '100%',
    aspectRatio: 3 / 4,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  loadingText: {
    color: Colors.textSecondary,
    fontSize: FontSize.base,
    marginTop: Spacing.md,
  },
  errorIcon: {
    fontSize: 48,
    marginBottom: Spacing.md,
  },
  errorText: {
    color: Colors.error,
    fontSize: FontSize.base,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  retryButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.sm + 2,
    borderRadius: BorderRadius.md,
  },
  retryText: {
    color: Colors.text,
    fontSize: FontSize.base,
    fontWeight: '600',
  },
  placeholderIcon: {
    fontSize: 48,
    marginBottom: Spacing.md,
  },
  placeholderText: {
    color: Colors.textTertiary,
    fontSize: FontSize.base,
  },
  useButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.xxl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.lg,
  },
  useText: {
    color: Colors.text,
    fontSize: FontSize.base,
    fontWeight: '600',
  },
});
