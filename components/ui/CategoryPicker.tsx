import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  LayoutChangeEvent,
} from 'react-native';
import { Colors, BorderRadius, FontSize, Spacing } from '../../constants/Colors';
import { ClothingCategory } from '../../models/ClothingItem';

interface CategoryOption {
  id: ClothingCategory;
  label: string;
  icon: string;
}

const CATEGORIES: CategoryOption[] = [
  { id: 'top', label: 'أعلى', icon: '👕' },
  { id: 'bottom', label: 'أسفل', icon: '👖' },
  { id: 'full', label: 'كامل', icon: '👗' },
  { id: 'footwear', label: 'أحذية', icon: '👟' },
  { id: 'accessories', label: 'إكسسوارات', icon: '💍' },
  { id: 'other', label: 'أخرى', icon: '📦' },
];

interface CategoryPickerProps {
  selected?: ClothingCategory;
  onSelect: (category: ClothingCategory) => void;
  style?: ViewStyle;
  itemStyle?: ViewStyle;
  showAllOption?: boolean;
}

export default function CategoryPicker({
  selected,
  onSelect,
  style,
  itemStyle,
  showAllOption = true,
}: CategoryPickerProps) {
  const scrollRef = useRef<ScrollView>(null);
  const [itemLayouts, setItemLayouts] = useState<Record<string, number>>({});

  const handleLayout = (id: string, event: LayoutChangeEvent) => {
    const { x, width } = event.nativeEvent.layout;
    setItemLayouts((prev) => ({
      ...prev,
      [id]: x + width / 2,
    }));
  };

  const handleSelect = (id: ClothingCategory) => {
    onSelect(id);
    // Scroll to selected item
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ x: Math.max(0, (itemLayouts[id] || 0) - 100), animated: true });
    }
  };

  const options = showAllOption
    ? [{ id: 'all' as ClothingCategory, label: 'الكل', icon: '📋' }, ...CATEGORIES]
    : CATEGORIES;

  return (
    <View style={[styles.wrapper, style]}>
      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {options.map((cat) => {
          const isSelected = selected === cat.id || (!selected && cat.id === ('all' as ClothingCategory));
          return (
            <TouchableOpacity
              key={cat.id}
              onPress={() => handleSelect(cat.id)}
              onLayout={(e) => handleLayout(cat.id, e)}
              style={[
                styles.item,
                isSelected && styles.itemSelected,
                itemStyle,
              ]}
              activeOpacity={0.7}
            >
              <Text style={styles.itemIcon}>{cat.icon}</Text>
              <Text
                style={[
                  styles.itemLabel,
                  isSelected && styles.itemLabelSelected,
                ]}
              >
                {cat.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginVertical: Spacing.sm,
  },
  scrollContent: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: Spacing.sm,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: BorderRadius.full,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  itemSelected: {
    backgroundColor: Colors.primary + '25',
    borderColor: Colors.primary + '50',
  },
  itemIcon: {
    fontSize: 14,
  },
  itemLabel: {
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
    fontFamily: 'Tajawal',
    fontWeight: '500',
  },
  itemLabelSelected: {
    color: Colors.primary,
    fontWeight: '700',
  },
});
