import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  StyleSheet,
} from 'react-native';
import { router } from 'expo-router';
import { Colors, Spacing, FontSize, BorderRadius } from '../../constants/Colors';
import Card from '../../components/ui/Card';
import WardrobeStats from '../../components/wardrobe/WardrobeStats';
import OutfitCard from '../../components/outfit/OutfitCard';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { useWardrobe } from '../../hooks/useWardrobe';
import { useOutfitRecommendation } from '../../hooks/useOutfitRecommendation';

/**
 * الشاشة الرئيسية - الصفحة الأولى
 * Home Screen - Main dashboard with stats, daily suggestion, and recent outfits
 */

// ── نماذج بيانات وهمية للعرض قبل ربط قاعدة البيانات ──

const MOCK_RECENT_OUTFITS = [
  {
    id: '1',
    name: 'إطلالة كاجوال',
    items: [
      { type: 't-shirt', colorHex: '#333333' },
      { type: 'pants', colorHex: '#1a1a2e' },
      { type: 'shoes', colorHex: '#ffffff' },
    ],
    score: 0.92,
  },
  {
    id: '2',
    name: 'إطلالة رسمية',
    items: [
      { type: 'shirt', colorHex: '#ffffff' },
      { type: 'pants', colorHex: '#0d0d1a' },
      { type: 'shoes', colorHex: '#1a1a1a' },
    ],
    score: 0.85,
  },
  {
    id: '3',
    name: 'إطلالة شتوية',
    items: [
      { type: 'coat', colorHex: '#2c2c3e' },
      { type: 'pants', colorHex: '#1a1a2e' },
      { type: 'shoes', colorHex: '#333333' },
    ],
    score: 0.78,
  },
];

export default function HomeScreen() {
  const { loading, stats, refresh } = useWardrobe();
  const { suggestion, state: recoState, getDaily } = useOutfitRecommendation();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    getDaily();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await refresh();
    await getDaily();
    setRefreshing(false);
  };

  const statItems = [
    { label: 'قطعة في الخزانة', count: stats.total, icon: '👕' },
    { label: 'إطلالة محفوظة', count: 12, icon: '👔' },
    { label: 'التوافق اليومي', count: 92, icon: '⭐' },
  ];

  const dailySuggestion = suggestion
    ? {
        name: 'اقتراح اليوم',
        items: suggestion.items.map((item) => ({
          type: item.type,
          colorHex: item.colorHex,
        })),
        score: suggestion.score.total,
      }
    : null;

  return (
    <View style={styles.container}>
      {/* رأس الصفحة */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.greeting}>مرحباً بك في خزانتك 👋</Text>
            <Text style={styles.subtitle}>اكتشف إطلالاتك المثالية اليوم</Text>
          </View>
          <TouchableOpacity style={styles.avatarButton} activeOpacity={0.7}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>👤</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {loading && recoState === 'loading' ? (
        <LoadingSpinner text="جاري التحميل..." />
      ) : (
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
          {/* إحصائيات سريعة */}
          <WardrobeStats stats={statItems} />

          {/* إطلالة اليوم */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>إطلالة اليوم ✨</Text>
            <View style={styles.sectionActions}>
              <TouchableOpacity style={styles.actionBtn} activeOpacity={0.7}>
                <Text style={styles.actionBtnText}>💾</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionBtn}
                activeOpacity={0.7}
                onPress={() => getDaily()}
              >
                <Text style={styles.actionBtnText}>🔄</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionBtn} activeOpacity={0.7}>
                <Text style={styles.actionBtnText}>❌</Text>
              </TouchableOpacity>
            </View>
          </View>

          {dailySuggestion ? (
            <View style={styles.outfitSection}>
              <OutfitCard
                name={dailySuggestion.name}
                items={dailySuggestion.items}
                score={dailySuggestion.score}
                onPress={() => router.push('/outfits')}
              />
            </View>
          ) : (
            <Card style={styles.emptyCard}>
              <Text style={styles.emptyIcon}>🤔</Text>
              <Text style={styles.emptyText}>
                {recoState === 'loading'
                  ? 'جاري البحث عن أفضل إطلالة...'
                  : 'لم نجد إطلالة مناسبة اليوم. أضف المزيد من القطع!'}
              </Text>
            </Card>
          )}

          {/* آخر الإطلالات */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>آخر الإطلالات 📋</Text>
            <TouchableOpacity onPress={() => router.push('/outfits')}>
              <Text style={styles.viewAllText}>عرض الكل</Text>
            </TouchableOpacity>
          </View>

          {MOCK_RECENT_OUTFITS.map((outfit) => (
            <OutfitCard
              key={outfit.id}
              name={outfit.name}
              items={outfit.items}
              score={outfit.score}
              onPress={() => router.push('/outfits')}
            />
          ))}

          <View style={styles.bottomSpacer} />
        </ScrollView>
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
    paddingBottom: Spacing.lg,
    backgroundColor: Colors.background,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    color: Colors.text,
    fontSize: FontSize.xxl,
    fontWeight: '700',
    fontFamily: 'Tajawal',
  },
  subtitle: {
    color: Colors.textSecondary,
    fontSize: FontSize.md,
    fontFamily: 'Tajawal',
    marginTop: 4,
  },
  avatarButton: {
    padding: 2,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(108, 99, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(108, 99, 255, 0.3)',
  },
  avatarText: {
    fontSize: 22,
  },
  scrollContent: {
    paddingTop: Spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.md,
  },
  sectionTitle: {
    color: Colors.text,
    fontSize: FontSize.xl,
    fontWeight: '700',
    fontFamily: 'Tajawal',
  },
  sectionActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  actionBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.04)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  actionBtnText: {
    fontSize: 16,
  },
  outfitSection: {
    marginBottom: Spacing.sm,
  },
  emptyCard: {
    marginHorizontal: Spacing.lg,
    alignItems: 'center',
    paddingVertical: Spacing.xxl,
  },
  emptyIcon: {
    fontSize: 40,
    marginBottom: Spacing.md,
  },
  emptyText: {
    color: Colors.textSecondary,
    fontSize: FontSize.base,
    fontFamily: 'Tajawal',
    textAlign: 'center',
    lineHeight: 22,
  },
  viewAllText: {
    color: Colors.primary,
    fontSize: FontSize.sm,
    fontWeight: '600',
    fontFamily: 'Tajawal',
  },
  bottomSpacer: {
    height: 30,
  },
});
