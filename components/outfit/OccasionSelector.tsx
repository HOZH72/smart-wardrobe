import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors, BorderRadius, FontSize, Spacing } from '../../constants/Colors';

interface OccasionOption {
  id: string;
  nameAr: string;
  icon: string;
}

interface Props {
  occasions: OccasionOption[];
  selectedId?: string | null;
  onSelect: (id: string) => void;
}

export default function OccasionSelector({ occasions, selectedId, onSelect }: Props) {
  return (
    <View style={styles.grid}>
      {occasions.map((occ) => {
        const isSelected = occ.id === selectedId;
        return (
          <TouchableOpacity
            key={occ.id}
            style={[styles.card, isSelected && styles.cardSelected]}
            onPress={() => onSelect(occ.id)}
            activeOpacity={0.7}
          >
            <Text style={styles.icon}>{occ.icon}</Text>
            <Text style={[styles.label, isSelected && styles.labelSelected]}>
              {occ.nameAr}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
  },
  card: {
    width: '30%',
    flexGrow: 1,
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    paddingVertical: Spacing.lg,
    alignItems: 'center',
    gap: Spacing.sm,
    minWidth: 90,
  },
  cardSelected: {
    backgroundColor: 'rgba(108,99,255,0.1)',
    borderColor: Colors.primary,
  },
  icon: {
    fontSize: 28,
  },
  label: {
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
    fontWeight: '500',
    textAlign: 'center',
  },
  labelSelected: {
    color: Colors.primary,
    fontWeight: '700',
  },
});
