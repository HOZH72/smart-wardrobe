import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  RefreshControl,
  StyleSheet,
} from 'react-native';
import { Colors, Spacing, FontSize, BorderRadius } from '../../constants/Colors';
import Card from '../../components/ui/Card';
import ClothingGrid from '../../components/wardrobe/ClothingGrid';
import FilterBar from '../../components/wardrobe/FilterBar';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { useWardrobe } from '../../hooks/useWardrobe';
import { typeNameAr } from '../../constants/types';

/**
 * شاشة الخزانة - عرض وتصفية قطع الملابس
 * Wardrobe Screen - Browse, search, and filter clothing items
 */

const FILTERS = [
  { id: 'all', label: 'الكل' },
  { id: 'shirt', label: 'قمصان' },
  { id: 'pants', label: 'بناطيل' },
  { id: 'shoes', label: 'أحذية' },
  { id: 'accessories', label: 'إكسسوارات' },
  { id: 'dress', label: 'فساتين' },
  { id: 'jacket', label: 'جواكت' },
];

export default function WardrobeScreen() {
  const { items, loading, refresh } = useWardrobe();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [refreshing, setRefreshing] = useState(false);

  // تصفية القطع حسب البحث والنوع
  const filteredItems = useMemo(() => {
    let result = items;

    // فلتر حسب النوع
    if (activeFilter !== 'all') {
      result = result.filter((item) => item.type === activeFilter);
    }

    // فلتر حسب البحث
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter(
        (item) =>
          item.type.toLowerCase().includes(q) ||
          item.colorName.toLowerCase().includes(q) ||
          typeNameAr(item.type).includes(q)
      );
    }

    return result;
  }, [items, activeFilter, searchQuery]);

  const onRefresh = async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  };

  const handleItemPress = (id: string) => {
    // سيتم إضافة التنقل لتفاصيل القطعة لاحقاً
    console.log('Item pressed:', id);
  };

  return (
    <View style={styles.container}>
      {/* رأس الصفحة */}
      <View style={styles.header}>
        <Text style={styles.title}>الخزانة</Text>
        <Text style={styles.subtitle}>
          {items.length > 0
            ? `${items.length} قطعة في خزانتك`
            : 'خزانتك فارغة، أضف بعض القطع!'}
        </Text>
      </View>

      {/* شريط البحث */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="ابحث في خزانتك..."
            placeholderTextColor={Colors.textTertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            textAlign="right"
          />
          {searchQuery.length > 0 && (
            <Text
              style={styles.clearButton}
              onPress={() => setSearchQuery('')}
            >
              ✕
            </Text>
          )}
        </View>
      </View>

      {/* أزرار التصفية */}
      <FilterBar
        filters={FILTERS}
        activeFilter={activeFilter}
        onFilterPress={setActiveFilter}
      />

      {/* محتوى الخزانة */}
      {loading ? (
        <LoadingSpinner text="جاري تحميل الخزانة..." />
      ) : filteredItems.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Card style={styles.emptyCard}>
            <Text style={styles.emptyIcon}>
              {items.length === 0 ? '📭' : '🔍'}
            </Text>
            <Text style={styles.emptyTitle}>
              {items.length === 0
                ? 'خزانتك فارغة'
                : 'لا توجد نتائج للبحث'}
            </Text>
            <Text style={styles.emptyText}>
              {items.length === 0
                ? 'ابدأ بإضافة قطع ملابس جديدة من قسم الإضافة'
                : 'حاول تغيير كلمة البحث أو إزالة الفلاتر'}
            </Text>
          </Card>
        </View>
      ) : (
        <ClothingGrid
          items={filteredItems.map((item) => ({
            id: item.id,
            type: item.type,
            colorName: item.colorName,
            colorHex: item.colorHex,
          }))}
          onItemPress={handleItemPress}
          numColumns={2}
          ListHeaderComponent={
            <View style={styles.resultCount}>
              <Text style={styles.resultCountText}>
                {filteredItems.length} نتيجة
              </Text>
            </View>
          }
        />
      )}

      {/* سحب للتحديث */}
      {!loading && (
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={Colors.primary}
          colors={[Colors.primary]}
          style={styles.refreshControl}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.sm,
  },
  title: {
    color: Colors.text,
    fontSize: FontSize.xxxl,
    fontWeight: '700',
    fontFamily: 'Tajawal',
  },
  subtitle: {
    color: Colors.textSecondary,
    fontSize: FontSize.md,
    fontFamily: 'Tajawal',
    marginTop: 4,
  },
  searchContainer: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    paddingHorizontal: Spacing.md,
    height: 46,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: Colors.text,
    fontSize: FontSize.base,
    fontFamily: 'Tajawal',
    height: '100%',
    padding: 0,
  },
  clearButton: {
    color: Colors.textTertiary,
    fontSize: 16,
    padding: 4,
  },
  resultCount: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: 4,
  },
  resultCountText: {
    color: Colors.textTertiary,
    fontSize: FontSize.sm,
    fontFamily: 'Tajawal',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
    paddingBottom: 60,
  },
  emptyCard: {
    alignItems: 'center',
    paddingVertical: Spacing.xxxl,
  },
  emptyIcon: {
    fontSize: 56,
    marginBottom: Spacing.lg,
  },
  emptyTitle: {
    color: Colors.text,
    fontSize: FontSize.xl,
    fontWeight: '700',
    fontFamily: 'Tajawal',
    marginBottom: Spacing.sm,
  },
  emptyText: {
    color: Colors.textSecondary,
    fontSize: FontSize.base,
    fontFamily: 'Tajawal',
    textAlign: 'center',
    lineHeight: 22,
  },
  refreshControl: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
});
