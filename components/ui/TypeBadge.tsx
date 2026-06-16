import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Colors, BorderRadius, FontSize, Spacing } from '../../constants/Colors';
import { typeIcon, typeNameAr, typeCategory } from '../../constants/types';
import { ClothingCategory } from '../../models/ClothingItem';

interface TypeBadgeProps {
  typeId: string;
  showName?: boolean;
  size?: 'sm' | 'md';
  style?: ViewStyle;
}

const categoryColors: Record<ClothingCategory, string> = {
  top: '#6C63FF',
  bottom: '#FF6584',
  full: '#FF9800',
  footwear: '#4CAF50',
  accessories: '#00BCD4',
  other: 'rgba(255,255,255,0.4)',
};

const categoryLabels: Record<ClothingCategory, string> = {
  top: 'أعلى',
  bottom: 'أسفل',
  full: 'كامل',
  footwear: 'أحذية',
  accessories: 'إكسسوارات',
  other: 'أخرى',
};

export default function TypeBadge({
  typeId,
  showName = true,
  size = 'md',
  style,
}: TypeBadgeProps) {
  const icon = typeIcon(typeId);
  const nameAr = typeNameAr(typeId);
  const category = typeCategory(typeId) as ClothingCategory;
  const catColor = categoryColors[category] ?? 'rgba(255,255,255,0.4)';

  const isSmall = size === 'sm';
  const paddingV = isSmall ? 4 : 6;
  const paddingH = isSmall ? 8 : 10;
  const iconSize = isSmall ? 12 : 14;
  const fSize = isSmall ? FontSize.xs : FontSize.sm;

  return (
    <View
      style={[
        styles.container,
        {
          paddingVertical: paddingV,
          paddingHorizontal: paddingH,
          backgroundColor: catColor + '20',
          borderColor: catColor + '40',
        },
        style,
      ]}
    >
      <Text style={[styles.icon, { fontSize: iconSize }]}>{icon}</Text>
      {showName && (
        <Text style={[styles.name, { fontSize: fSize, color: catColor }]}>
          {nameAr}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  icon: {
    textAlign: 'center',
  },
  name: {
    fontFamily: 'Tajawal',
    fontWeight: '500',
  },
});
