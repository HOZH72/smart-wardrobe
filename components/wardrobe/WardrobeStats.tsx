import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, BorderRadius, FontSize, Spacing } from '../../constants/Colors';

interface StatItem {
  label: string;
  count: number;
  icon: string;
}

interface Props {
  stats: StatItem[];
}

export default function WardrobeStats({ stats }: Props) {
  return (
    <View style={styles.container}>
      {stats.map((stat, index) => (
        <View key={index} style={styles.card}>
          <Text style={styles.icon}>{stat.icon}</Text>
          <Text style={styles.count}>{stat.count}</Text>
          <Text style={styles.label}>{stat.label}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
  },
  card: {
    flex: 1,
    minWidth: 80,
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
    alignItems: 'center',
    gap: 4,
  },
  icon: {
    fontSize: 22,
  },
  count: {
    color: Colors.text,
    fontSize: FontSize.xl,
    fontWeight: '700',
  },
  label: {
    color: Colors.textTertiary,
    fontSize: FontSize.xs,
    textAlign: 'center',
  },
});
