import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Colors, BorderRadius, FontSize, Spacing } from '../../constants/Colors';

interface ColorBadgeProps {
  colorHex: string;
  colorName: string;
  size?: 'sm' | 'md' | 'lg';
  showName?: boolean;
  style?: ViewStyle;
}

export default function ColorBadge({
  colorHex,
  colorName,
  size = 'md',
  showName = true,
  style,
}: ColorBadgeProps) {
  const dotSize = size === 'sm' ? 12 : size === 'lg' ? 24 : 16;
  const fSize = size === 'sm' ? FontSize.xs : size === 'lg' ? FontSize.base : FontSize.sm;

  return (
    <View style={[styles.container, style]}>
      <View
        style={[
          styles.dot,
          {
            width: dotSize,
            height: dotSize,
            borderRadius: dotSize / 2,
            backgroundColor: colorHex,
          },
        ]}
      />
      {showName && (
        <Text style={[styles.name, { fontSize: fSize }]}>{colorName}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  name: {
    color: Colors.textSecondary,
    fontFamily: 'Tajawal',
    fontWeight: '500',
  },
});
