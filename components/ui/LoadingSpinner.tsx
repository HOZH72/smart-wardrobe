import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet, ViewStyle } from 'react-native';
import { Colors, FontSize, Spacing } from '../../constants/Colors';

interface LoadingSpinnerProps {
  text?: string;
  size?: 'small' | 'large';
  color?: string;
  overlay?: boolean;
  style?: ViewStyle;
}

export default function LoadingSpinner({
  text,
  size = 'large',
  color = Colors.primary,
  overlay = false,
  style,
}: LoadingSpinnerProps) {
  const content = (
    <View style={[styles.container, overlay && styles.overlay, style]}>
      <ActivityIndicator size={size} color={color} />
      {text && (
        <Text style={[styles.text, overlay && styles.overlayText]}>{text}</Text>
      )}
    </View>
  );

  if (overlay) {
    return (
      <View style={StyleSheet.absoluteFill}>
        <View style={styles.overlayBackdrop} />
        {content}
      </View>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
    gap: Spacing.md,
  },
  overlay: {
    ...StyleSheet.absoluteFill,
    zIndex: 999,
    backgroundColor: 'transparent',
  },
  overlayBackdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(15,15,26,0.7)',
  },
  overlayText: {
    color: Colors.text,
  },
  text: {
    color: Colors.textSecondary,
    fontSize: FontSize.base,
    fontFamily: 'Tajawal',
    textAlign: 'center',
  },
});
