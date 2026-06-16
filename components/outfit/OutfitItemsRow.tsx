import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, BorderRadius, Spacing } from '../../constants/Colors';
import { typeIcon } from '../../constants/types';

interface OutfitItem {
  type: string;
  colorHex: string;
}

interface Props {
  items: OutfitItem[];
}

export default function OutfitItemsRow({ items }: Props) {
  return (
    <View style={styles.row}>
      {items.map((item, index) => (
        <React.Fragment key={index}>
          {index > 0 && <Text style={styles.separator}>+</Text>}
          <View style={styles.item}>
            <Text style={styles.icon}>{typeIcon(item.type)}</Text>
            <View style={[styles.dot, { backgroundColor: item.colorHex }]} />
          </View>
        </React.Fragment>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  item: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    backgroundColor: 'rgba(108,99,255,0.06)',
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    position: 'relative',
  },
  icon: {
    fontSize: 20,
  },
  dot: {
    position: 'absolute',
    bottom: 3,
    right: 3,
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  separator: {
    color: Colors.textTertiary,
    fontSize: 16,
    fontWeight: '300',
  },
});
