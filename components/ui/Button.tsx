import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle } from 'react-native';
import { Colors, BorderRadius, FontSize, Spacing } from '../../constants/Colors';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  icon?: string;
  style?: ViewStyle;
  fullWidth?: boolean;
}

export default function Button({
  title, onPress, variant = 'primary', size = 'md',
  loading, disabled, icon, style, fullWidth,
}: ButtonProps) {
  const isPrimary = variant === 'primary';
  const bgColor = isPrimary ? Colors.primary : variant === 'secondary' ? Colors.secondary
    : variant === 'outline' ? 'transparent' : 'transparent';
  const txtColor = variant === 'ghost' ? Colors.primary : variant === 'outline' ? Colors.primary : '#fff';
  const borderColor = variant === 'outline' ? Colors.primary : 'transparent';
  const paddingV = size === 'sm' ? 8 : size === 'lg' ? 16 : 12;
  const paddingH = size === 'sm' ? 14 : size === 'lg' ? 24 : 20;
  const fSize = size === 'sm' ? 12 : size === 'lg' ? 16 : 14;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      style={[{
        backgroundColor: bgColor,
        paddingVertical: paddingV,
        paddingHorizontal: paddingH,
        borderRadius: BorderRadius.md,
        borderWidth: variant === 'outline' ? 1 : 0,
        borderColor,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        opacity: disabled ? 0.5 : 1,
        ...(fullWidth ? { width: '100%' } : {}),
      }, style]}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator size="small" color={txtColor} />
      ) : (
        <>
          {icon && <Text style={{ fontSize: 16 }}>{icon}</Text>}
          <Text style={{
            color: txtColor, fontSize: fSize, fontWeight: '600',
            fontFamily: 'Tajawal',
          }}>{title}</Text>
        </>
      )}
    </TouchableOpacity>
  );
}
