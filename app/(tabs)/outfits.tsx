import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  StyleSheet,
} from 'react-native';
import { Colors, Spacing, FontSize, BorderRadius } from '../../constants/Colors';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import ClothingGrid from '../../components/wardrobe/ClothingGrid';
import OutfitCard from '../../components/outfit/OutfitCard';
import OccasionSelector from '../../components/outfit/OccasionSelector';
import OutfitSuggestion from '../../components/outfit/OutfitSuggestion';
import { useWardrobe } from '../../hooks/useWardrobe';
import { useOutfitRecommendation } from '../../hooks/useOutfitRecommendation';
import { OutfitSuggestion as OutfitSuggestionType } from '../../models/ClothingItem';

/**
 * شاشة الإطلالات - توليد توصيات بناءً على قطعة، مناسبة، أو عشوائي
 * Outfits Screen - Generate outfit recommendations by item, occasion, or random
 */

type ModeTab = 'by-item' | 'by-occasion' | 'random';

const MODE_TABS: { id: ModeTab; label: string; icon: string }[] = [
  { id: 'by-item', label: 'حسب قطعة', icon: '🎯' },
  { id: 'by-occasion', label: 'حسب مناسبة', icon: '🎉' },
  { id: 'random', label: 'عشوائي', icon: '🔀' },
];

const MOCK_OCCASIONS = [
  { id: 'casual', nameAr: 'كاجوال', icon: '😊' },
  { id: 'formal', nameAr: 'رسمي', icon: '🤵' },
  { id: 'sport', nameAr: 'رياضي', icon: '🏃' },
  { id: 'party', nameAr: 'حفلة', icon: '🎉' },
  { id: 'work', nameAr: 'دوام', icon: '💼' },
  { id: 'date', nameAr: 'موعد', icon: '💕' },
  { id: 'travel', nameAr: 'سفر', icon: '✈️' },
  { id: 'home', nameAr: 'منزل', icon: '🏠' },
];

export default function OutfitsScreen() {
  const { items, loading: itemsLoading, refresh: refreshItems } = useWardrobe();
  const {
    suggestions,
    suggestion,
    state: recoState,
    error: recoError,
    recommendForItem,
    recommendForOccasion,
    getRandom,
    getDaily,
    reset,
  } = useOutfitRecommendation();

  const [activeMode, setActiveMode] = useState<ModeTab>('random');
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [selectedOccasion, setSelectedOccasion] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // تشغيل التوصيات تلقائياً حسب الوضع المختار
  useEffect(() => {
    switch (activeMode) {
      case 'by-item':
        if (selectedItemId) {
          recommendForItem(selectedItemId);
        }
        break;
      case 'by-occasion':
        if (selectedOccasion) {
          recommendForOccasion(selectedOccasion);
        } else {
          setSelectedOccasion('casual');
          recommendForOccasion('casual');
        }
        break;
      case 'random':
        getRandom();
        break;
    }
  }, [activeMode, selectedItemId]);

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshItems();
    setRefreshing(false);
  };

  const handleModeChange = (mode: ModeTab) => {
    setActiveMode(mode);
    reset();
    setSelectedItemId(null);
    setSelectedOccasion(null);
  };

  // واجهة اختيار القطعة (وضع by-item)
  const renderItemSelector = () => (
    <View style={styles.selectorSection}>
      <Text style={styles.selectorTitle}>اختر قطعة</Text>
      <Text style={styles.selectorSubtitle}>
        سنقترح لك إطلالات تتناسب مع هذه القطعة
      </Text>

      {itemsLoading ? (
        <LoadingSpinner text="جاري تحميل القطع..." />
      ) : items.length === 0 ? (
        <Card style={styles.emptySelectorCard}>
          <Text style={styles.emptySelectorIcon}>📭</Text>
          <Text style={styles.emptySelectorText}>
            خزانتك فارغة. أضف بعض القطع أولاً!
          </Text>
        </Card>
      ) : (
        <ClothingGrid
          items={items.map((item) => ({
            id: item.id,
            type: item.type,
            colorName: item.colorName,
            colorHex: item.colorHex,
          }))}
          onItemPress={(id) => setSelectedItemId(id)}
          numColumns={4}
        />
      )}

      {selectedItemId && (
        <View style={styles.selectedHint}>
          <Text style={styles.selectedHintText}>
            ✓ تم اختيار قطعة. جاري البحث عن إطلالات مناسبة...
          </Text>
        </View>
      )}
    </View>
  );

  // واجهة اختيار المناسبة (وضع by-occasion)
  const renderOccasionSelector = () => (
    <View style={styles.selectorSection}>
      <Text style={styles.selectorTitle}>اختر المناسبة</Text>
      <Text style={styles.selectorSubtitle}>
        سنقترح إطلالات تناسب هذه المناسبة
      </Text>
      <OccasionSelector
        occasions={MOCK_OCCASIONS}
        selectedId={selectedOccasion}
        onSelect={(id) => {
          setSelectedOccasion(id);
          recommendForOccasion(id);
        }}
      />
    </View>
  );

  // عرض التوصيات
  const renderSuggestions = () => {
    if (recoState === 'loading') {
      return (
        <View style={styles.loadingSection}>
          <LoadingSpinner text="جاري إنشاء التوصيات..." />
        </View>
      );
    }

    if (recoState === 'error') {
      return (
        <Card style={styles.errorCard}>
          <Text style={styles.errorIcon}>⚠️</Text>
          <Text style={styles.errorText}>{recoError}</Text>
          <Button
            title="إعادة المحاولة"
            onPress={() => {
              switch (activeMode) {
                case 'by-item':
                  if (selectedItemId) recommendForItem(selectedItemId);
                  break;
                case 'by-occasion':
                  if (selectedOccasion) recommendForOccasion(selectedOccasion);
                  break;
                case 'random':
                  getRandom();
                  break;
              }
            }}
            variant="outline"
            size="sm"
          />
        </Card>
      );
    }

    if (recoState === 'done' && suggestions.length === 0) {
      return (
        <Card style={styles.emptyCard}>
          <Text style={styles.emptyIcon}>🤔</Text>
          <Text style={styles.emptyTitle}>لا توجد اقتراحات</Text>
          <Text style={styles.emptyText}>
            لم نجد إطلالات مناسبة. حاول اختيار قطعة أو مناسبة مختلفة.
          </Text>
        </Card>
      );
    }

    if (recoState === 'done' && suggestions.length > 0) {
      return (
        <View style={styles.suggestionsSection}>
          <View style={styles.suggestionsHeader}>
            <Text style={styles.suggestionsTitle}>
              الاقتراحات ({suggestions.length})
            </Text>
            {activeMode === 'random' && (
              <TouchableOpacity
                style={styles.refreshBtn}
                onPress={getRandom}
                activeOpacity={0.7}
              >
                <Text style={styles.refreshBtnIcon}>🔄</Text>
                <Text style={styles.refreshBtnText}>جديد</Text>
              </TouchableOpacity>
            )}
          </View>

          {suggestions.map((suggestion, index) => (
            <View key={index} style={styles.suggestionItem}>
              <OutfitSuggestion suggestion={suggestion} />
            </View>
          ))}
        </View>
      );
    }

    // Idle
    return (
      <View style={styles.idleSection}>
        <Card style={styles.idleCard}>
          <Text style={styles.idleIcon}>
            {activeMode === 'by-item'
              ? '👕'
              : activeMode === 'by-occasion'
              ? '🎉'
              : '🔀'}
          </Text>
          <Text style={styles.idleText}>
            {activeMode === 'by-item'
              ? 'اختر قطعة من الخزانة لنقترح لك إطلالات متناسقة'
              : activeMode === 'by-occasion'
              ? 'اختر المناسبة لنقترح لك إطلالات مناسبة'
              : 'اضغط على زر التوليد للحصول على إطلالة عشوائية'}
          </Text>
        </Card>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* رأس الصفحة */}
      <View style={styles.header}>
        <Text style={styles.title}>الإطلالات</Text>
        <Text style={styles.subtitle}>اكتشف إطلالات جديدة ومتناسقة</Text>
      </View>

      {/* أزرار الأوضاع */}
      <View style={styles.modeTabs}>
        {MODE_TABS.map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={[
              styles.modeTab,
              activeMode === tab.id && styles.modeTabActive,
            ]}
            onPress={() => handleModeChange(tab.id)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.modeTabIcon,
                activeMode === tab.id && styles.modeTabIconActive,
              ]}
            >
              {tab.icon}
            </Text>
            <Text
              style={[
                styles.modeTabLabel,
                activeMode === tab.id && styles.modeTabLabelActive,
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* المحتوى الرئيسي */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.primary}
            colors={[Colors.primary]}
          />
        }
      >
        {/* اختيار القطعة أو المناسبة */}
        {activeMode === 'by-item' && renderItemSelector()}
        {activeMode === 'by-occasion' && renderOccasionSelector()}

        {/* التوصيات */}
        {renderSuggestions()}

        <View style={styles.bottomSpacer} />
      </ScrollView>
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

  // ── Mode Tabs ──
  modeTabs: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
  },
  modeTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  modeTabActive: {
    backgroundColor: 'rgba(108, 99, 255, 0.1)',
    borderColor: 'rgba(108, 99, 255, 0.25)',
  },
  modeTabIcon: {
    fontSize: 18,
    opacity: 0.6,
  },
  modeTabIconActive: {
    opacity: 1,
  },
  modeTabLabel: {
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
    fontWeight: '600',
    fontFamily: 'Tajawal',
  },
  modeTabLabelActive: {
    color: Colors.primary,
  },

  // ── Selectors ──
  selectorSection: {
    paddingTop: Spacing.md,
  },
  selectorTitle: {
    color: Colors.text,
    fontSize: FontSize.lg,
    fontWeight: '700',
    fontFamily: 'Tajawal',
    paddingHorizontal: Spacing.lg,
    marginBottom: 4,
  },
  selectorSubtitle: {
    color: Colors.textTertiary,
    fontSize: FontSize.sm,
    fontFamily: 'Tajawal',
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  emptySelectorCard: {
    marginHorizontal: Spacing.lg,
    alignItems: 'center',
    paddingVertical: Spacing.xl,
  },
  emptySelectorIcon: {
    fontSize: 40,
    marginBottom: Spacing.md,
  },
  emptySelectorText: {
    color: Colors.textSecondary,
    fontSize: FontSize.base,
    fontFamily: 'Tajawal',
    textAlign: 'center',
  },
  selectedHint: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
  },
  selectedHintText: {
    color: Colors.success,
    fontSize: FontSize.sm,
    fontFamily: 'Tajawal',
    fontWeight: '500',
  },

  // ── Suggestions ──
  suggestionsSection: {
    paddingTop: Spacing.lg,
  },
  suggestionsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  suggestionsTitle: {
    color: Colors.text,
    fontSize: FontSize.xl,
    fontWeight: '700',
    fontFamily: 'Tajawal',
  },
  refreshBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    backgroundColor: 'rgba(108, 99, 255, 0.1)',
  },
  refreshBtnIcon: {
    fontSize: 14,
  },
  refreshBtnText: {
    color: Colors.primary,
    fontSize: FontSize.sm,
    fontWeight: '600',
    fontFamily: 'Tajawal',
  },
  suggestionItem: {
    marginBottom: 0,
  },

  // ── States ──
  loadingSection: {
    paddingVertical: Spacing.xxxl,
  },
  errorCard: {
    marginHorizontal: Spacing.lg,
    alignItems: 'center',
    paddingVertical: Spacing.xl,
  },
  errorIcon: {
    fontSize: 36,
    marginBottom: Spacing.md,
  },
  errorText: {
    color: Colors.error,
    fontSize: FontSize.base,
    fontFamily: 'Tajawal',
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  emptyCard: {
    marginHorizontal: Spacing.lg,
    alignItems: 'center',
    paddingVertical: Spacing.xxl,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: Spacing.md,
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
  idleSection: {
    paddingTop: Spacing.xl,
  },
  idleCard: {
    marginHorizontal: Spacing.lg,
    alignItems: 'center',
    paddingVertical: Spacing.xxl,
  },
  idleIcon: {
    fontSize: 56,
    marginBottom: Spacing.md,
  },
  idleText: {
    color: Colors.textSecondary,
    fontSize: FontSize.base,
    fontFamily: 'Tajawal',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: Spacing.lg,
  },

  // ── Scroll ──
  scrollContent: {
    paddingBottom: 20,
  },
  bottomSpacer: {
    height: 30,
  },
});
