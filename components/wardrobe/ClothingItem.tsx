import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { Colors, BorderRadius, FontSize, Spacing } from '../../constants/Colors';
import { typeIcon, typeNameAr } from '../../constants/types';
import { colorNameAr } from '../../constants/Colors';

interface Props {
  type: string;
  colorName: string;
  colorHex: string;
  onPress?: () => void;
  size?: 'sm' | 'md';
}

export default function ClothingItem({ type, colorName, colorHex, onPress, size = 'md' }: Props) {
  const dim = size === 'sm' ? 80 : '100%';
  return (
    <TouchableOpacity onPress={onPress} style={{
      backgroundColor: Colors.card,
      borderRadius: BorderRadius.lg,
      borderWidth: 1, borderColor: Colors.cardBorder,
      padding: size === 'sm' ? 8 : 14,
      width: typeof dim === 'number' ? dim : undefined,
      flex: typeof dim === 'string' ? 1 : undefined,
      alignItems: 'center',
      gap: 6,
    }} activeOpacity={0.7}>
      <View style={{
        width: size === 'sm' ? 48 : '100%',
        aspectRatio: 1,
        backgroundColor: 'rgba(108,99,255,0.05)',
        borderRadius: BorderRadius.md,
        alignItems: 'center', justifyContent: 'center',
      }}>
        <Text style={{ fontSize: size === 'sm' ? 20 : 28 }}>{typeIcon(type)}</Text>
      </View>
      <Text style={{ color: Colors.textSecondary, fontSize: size === 'sm' ? 11 : 13, fontWeight: '600' }}>
        {typeNameAr(type)}
      </Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
        <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: colorHex }} />
        <Text style={{ color: Colors.textTertiary, fontSize: 11 }}>{colorNameAr(colorName)}</Text>
      </View>
    </TouchableOpacity>
  );
}
