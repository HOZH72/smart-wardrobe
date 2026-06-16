import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, BorderRadius, FontSize, Spacing } from '../../constants/Colors';

interface Score {
  total: number;
  reasons: string[];
}

interface Props {
  suggestion: {
    items: Array<{ type: string; colorName: string }>;
    score: Score;
  };
}

export default function OutfitSuggestion({ suggestion }: Props) {
  const { score } = suggestion;
  const scorePercent = Math.round(Math.min(score.total, 1) * 100);

  const barColor =
    scorePercent >= 80
      ? Colors.success
      : scorePercent >= 50
      ? Colors.warning
      : Colors.error;

  return (
    <View style={styles.card}>
      <View style={styles.scoreRow}>
        <Text style={styles.scoreLabel}>نسبة التوافق</Text>
        <Text style={[styles.scoreValue, { color: barColor }]}>{scorePercent}%</Text>
      </View>

      <View style={styles.barOuter}>
        <View
          style={[
            styles.barInner,
            { width: `${scorePercent}%`, backgroundColor: barColor },
          ]}
        />
      </View>

      {score.reasons.length > 0 && (
        <View style={styles.reasons}>
          {score.reasons.map((reason, i) => (
            <View key={i} style={styles.reasonRow}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.reasonText}>{reason}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
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
  scoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  scoreLabel: {
    color: Colors.textSecondary,
    fontSize: FontSize.base,
    fontWeight: '500',
  },
  scoreValue: {
    fontSize: FontSize.xxl,
    fontWeight: '800',
  },
  barOuter: {
    height: 8,
    backgroundColor: Colors.cardBorder,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: Spacing.md,
  },
  barInner: {
    height: '100%',
    borderRadius: 4,
  },
  reasons: {
    gap: Spacing.xs,
  },
  reasonRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },
  bullet: {
    color: Colors.primary,
    fontSize: FontSize.base,
    lineHeight: 20,
  },
  reasonText: {
    color: Colors.textTertiary,
    fontSize: FontSize.sm,
    flex: 1,
    lineHeight: 20,
  },
});
