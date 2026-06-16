import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors, BorderRadius, FontSize, Spacing } from '../../constants/Colors';
import { typeIcon } from '../../constants/types';
import OutfitItemsRow from './OutfitItemsRow';

interface OutfitItem {
  type: string;
  colorHex: string;
}

interface Props {
  name: string;
  items: OutfitItem[];
  score?: number;
  onPress?: () => void;
}

export default function OutfitCard({ name, items, score, onPress }: Props) {
  const scorePercent = score !== undefined ? Math.round(score * 100) : undefined;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.header}>
        <Text style={styles.name}>{name}</Text>
        {scorePercent !== undefined && (
          <View style={styles.scoreBadge}>
            <Text style={styles.scoreText}>{scorePercent}%</Text>
          </View>
        )}
      </View>

      <OutfitItemsRow items={items} />

      {scorePercent !== undefined && (
        <View style={styles.scoreBarOuter}>
          <View
            style={[
              styles.scoreBarInner,
              { width: `${Math.min(scorePercent, 100)}%` },
              scorePercent >= 80
                ? { backgroundColor: Colors.success }
                : scorePercent >= 50
                ? { backgroundColor: Colors.warning }
                : { backgroundColor: Colors.error },
            ]}
          />
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    padding: Spacing.lg,
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  name: {
    color: Colors.text,
    fontSize: FontSize.lg,
    fontWeight: '600',
    flex: 1,
  },
  scoreBadge: {
    backgroundColor: 'rgba(108,99,255,0.15)',
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  scoreText: {
    color: Colors.primary,
    fontSize: FontSize.xs,
    fontWeight: '700',
  },
  scoreBarOuter: {
    height: 4,
    backgroundColor: Colors.cardBorder,
    borderRadius: 2,
    marginTop: Spacing.md,
    overflow: 'hidden',
  },
  scoreBarInner: {
    height: '100%',
    borderRadius: 2,
  },
});
