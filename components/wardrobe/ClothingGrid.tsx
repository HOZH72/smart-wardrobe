import React from 'react';
import { FlatList, View, StyleSheet } from 'react-native';
import { Colors, Spacing } from '../../constants/Colors';
import ClothingItem from './ClothingItem';

interface ClothingItemData {
  id: string;
  type: string;
  colorName: string;
  colorHex: string;
}

interface Props {
  items: ClothingItemData[];
  onItemPress?: (id: string) => void;
  numColumns?: number;
  ListHeaderComponent?: React.ReactElement;
  ListEmptyComponent?: React.ReactElement;
}

export default function ClothingGrid({
  items,
  onItemPress,
  numColumns = 2,
  ListHeaderComponent,
  ListEmptyComponent,
}: Props) {
  return (
    <FlatList
      data={items}
      keyExtractor={(item) => item.id}
      numColumns={numColumns}
      contentContainerStyle={styles.grid}
      columnWrapperStyle={numColumns > 1 ? styles.row : undefined}
      ListHeaderComponent={ListHeaderComponent}
      ListEmptyComponent={
        ListEmptyComponent ?? (
          <View style={styles.empty}>
            <View style={styles.emptyContent}>
              <View style={styles.emptyIcon}>
                <View style={styles.emptyIconInner} />
              </View>
              <View style={styles.emptyText} />
              <View style={styles.emptySubtext} />
            </View>
          </View>
        )
      }
      renderItem={({ item }) => (
        <View style={styles.itemWrapper}>
          <ClothingItem
            type={item.type}
            colorName={item.colorName}
            colorHex={item.colorHex}
            onPress={() => onItemPress?.(item.id)}
          />
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  grid: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  row: {
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  itemWrapper: {
    flex: 1,
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyContent: {
    alignItems: 'center',
    gap: Spacing.md,
  },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(108,99,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyIconInner: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(108,99,255,0.2)',
  },
  emptyText: {
    width: 120,
    height: 16,
    borderRadius: 4,
    backgroundColor: Colors.textMuted,
  },
  emptySubtext: {
    width: 180,
    height: 12,
    borderRadius: 4,
    backgroundColor: Colors.textMuted,
  },
});
