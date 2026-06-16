import React, { ReactNode } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Colors, BorderRadius } from '../../constants/Colors';

interface CardProps {
  children: ReactNode;
  style?: ViewStyle;
  variant?: 'default' | 'gradient' | 'elevated';
  onPress?: () => void;
}

export default function Card({ children, style, variant = 'default' }: CardProps) {
  const bgColor = variant === 'gradient' ? 'rgba(108,99,255,0.08)' : Colors.card;
  const border = Colors.cardBorder;

  return (
    <View style={[{
      backgroundColor: bgColor,
      borderRadius: BorderRadius.xl,
      borderWidth: 1,
      borderColor: border,
      padding: 16,
      ...(variant === 'elevated' ? {
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 8,
      } : {}),
    }, style]}>
      {children}
    </View>
  );
}
