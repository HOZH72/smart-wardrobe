/**
 * شاشة الملف الشخصي - الإحصائيات، توزيع الخزانة، الهيئة، الإعدادات
 * Profile Screen - User stats, wardrobe distribution, avatar, settings
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Switch,
  StyleSheet,
  Alert,
} from 'react-native';
import { Colors, Spacing, FontSize, BorderRadius } from '../../constants/Colors';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import BodyModel from '../../components/avatar/BodyModel';
import AvatarCustomizer from '../../components/avatar/AvatarCustomizer';
import { useWardrobe } from '../../hooks/useWardrobe';
import { useBodyProfile } from '../../hooks/useBodyProfile';
import { ClothingTypes } from '../../constants/types';
import type { BodyProfile } from '../../models/BodyProfile';

// ── Distribution types ──
interface DistributionItem {
  label: string;
  icon: string;
  count: number;
  color: string;
  percentage: number;
}

const CATEGORY_COLORS: Record<string, string> = {
  top: '#6C63FF',
  bottom: '#FF6584',
  full: '#FF9800',
  footwear: '#4CAF50',
  accessories: '#00BCD4',
  other: 'rgba(255,255,255,0.4)',
};

const CATEGORY_LABELS: Record<string, string> = {
  top: 'أعلى',
  bottom: 'أسفل',
  full: 'كامل',
  footwear: 'أحذية',
  accessories: 'إكسسوارات',
  other: 'أخرى',
};

const CATEGORY_ICONS: Record<string, string> = {
  top: '👕',
  bottom: '👖',
  full: '👗',
  footwear: '👟',
  accessories: '💍',
  other: '📦',
};

// ── Settings ──
interface SettingItem {
  id: string;
  label: string;
  icon: string;
  type: 'toggle' | 'navigate' | 'action';
  value?: boolean;
  color?: string;
}

export default function ProfileScreen() {
  const { stats, loading } = useWardrobe();
  const {
    profile: bodyProfile,
    loaded: bodyLoaded,
    bmi,
    bmiLabel,
    hasProfile,
    saveProfile,
    resetProfile,
  } = useBodyProfile();
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [showCustomizer, setShowCustomizer] = useState(false);

  // ── Wardrobe distribution ──
  const distribution: DistributionItem[] = React.useMemo(() => {
    if (!stats.byType || Object.keys(stats.byType).length === 0) {
      return [];
    }

    const byCategory: Record<string, number> = {};
    Object.entries(stats.byType).forEach(([typeId, count]) => {
      const typeDef = ClothingTypes.find((t) => t.id === typeId);
      const category = typeDef?.category ?? 'other';
      byCategory[category] = (byCategory[category] || 0) + count;
    });

    const total = Object.values(byCategory).reduce((sum, c) => sum + c, 0) || 1;

    return Object.entries(byCategory).map(([category, count]) => ({
      label: CATEGORY_LABELS[category] ?? category,
      icon: CATEGORY_ICONS[category] ?? '📦',
      count,
      color: CATEGORY_COLORS[category] ?? 'rgba(255,255,255,0.4)',
      percentage: Math.round((count / total) * 100),
    }));
  }, [stats.byType]);

  // ── Settings ──
  const settings: SettingItem[] = [
    {
      id: 'dark_mode',
      label: 'الوضع المظلم',
      icon: '🌙',
      type: 'toggle',
      value: isDarkMode,
    },
    {
      id: 'language',
      label: 'اللغة',
      icon: '🌐',
      type: 'navigate',
      value: undefined,
    },
    {
      id: 'export',
      label: 'تصدير البيانات',
      icon: '📤',
      type: 'action',
      value: undefined,
    },
    {
      id: 'import',
      label: 'استيراد البيانات',
      icon: '📥',
      type: 'action',
      value: undefined,
    },
    {
      id: 'delete',
      label: 'حذف جميع البيانات',
      icon: '🗑️',
      type: 'action',
      value: undefined,
      color: Colors.error,
    },
  ];

  const handleSettingPress = (setting: SettingItem) => {
    switch (setting.id) {
      case 'export':
        Alert.alert('تصدير البيانات', 'سيتم تصدير جميع بيانات خزانتك قريباً');
        break;
      case 'import':
        Alert.alert('استيراد البيانات', 'سيتم استيراد البيانات من ملف قريباً');
        break;
      case 'delete':
        Alert.alert(
          'حذف جميع البيانات',
          'هل أنت متأكد؟ هذا الإجراء لا يمكن التراجع عنه!',
          [
            { text: 'إلغاء', style: 'cancel' },
            {
              text: 'حذف',
              style: 'destructive',
              onPress: () => {
                resetProfile();
              },
            },
          ]
        );
        break;
    }
  };

  const handleSaveAvatar = async (profile: BodyProfile) => {
    await saveProfile(profile);
    setShowCustomizer(false);
  };

  return (
    <View style={styles.container}>
      {/* رأس الصفحة - البروفايل */}
      <View style={styles.header}>
        <View style={styles.avatarSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>👤</Text>
          </View>
          <View style={styles.avatarInfo}>
            <Text style={styles.userName}>خزانتي الذكية</Text>
            <Text style={styles.userStat}>
              {stats.total > 0
                ? `${stats.total} قطعة في الخزانة`
                : 'ابدأ بإضافة القطع'}
            </Text>
          </View>
        </View>

        {/* Quick stats */}
        <View style={styles.quickStats}>
          <View style={styles.quickStatItem}>
            <Text style={styles.quickStatValue}>{stats.total}</Text>
            <Text style={styles.quickStatLabel}>القطع</Text>
          </View>
          <View style={styles.quickStatDivider} />
          <View style={styles.quickStatItem}>
            <Text style={styles.quickStatValue}>12</Text>
            <Text style={styles.quickStatLabel}>الإطلالات</Text>
          </View>
          <View style={styles.quickStatDivider} />
          <View style={styles.quickStatItem}>
            <Text style={styles.quickStatValue}>
              {distribution.length > 0
                ? Math.max(...distribution.map((d) => d.percentage))
                : 0}
              %
            </Text>
            <Text style={styles.quickStatLabel}>التنوع</Text>
          </View>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* ── Body Avatar Section ── */}
        {bodyLoaded && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🧑 الهيئة الشخصية</Text>
            <Card style={styles.bodyProfileCard}>
              {hasProfile && bodyProfile ? (
                <View style={styles.bodyProfileContent}>
                  <BodyModel
                    profile={bodyProfile}
                    height={180}
                    width={100}
                  />
                  <View style={styles.bodyInfo}>
                    <Text style={styles.bodyInfoTitle}>
                      {bodyProfile.gender === 'male'
                        ? 'ذكر'
                        : bodyProfile.gender === 'female'
                          ? 'أنثى'
                          : 'آخر'}{' '}
                      ·{' '}
                      {bodyProfile.shape === 'slim'
                        ? 'نحيف'
                        : bodyProfile.shape === 'athletic'
                          ? 'رياضي'
                          : bodyProfile.shape === 'average'
                            ? 'متوسط'
                            : bodyProfile.shape === 'curvy'
                              ? 'ممتلئ'
                              : 'مقوس'}
                    </Text>
                    <Text style={styles.bodyInfoDetail}>
                      {bodyProfile.measurements.height} سم ·{' '}
                      {bodyProfile.measurements.weight} كجم
                    </Text>
                    <View style={styles.bodyInfoBMI}>
                      <Text style={styles.bodyInfoBMILabel}>BMI</Text>
                      <Text style={styles.bodyInfoBMIValue}>
                        {bmi.toFixed(1)} ({bmiLabel})
                      </Text>
                    </View>
                    <Text style={styles.bodyInfoSkin}>
                      🎨 {bodyProfile.skinColor.labelAr}
                    </Text>
                    <Button
                      title="تعديل الهيئة"
                      variant="outline"
                      onPress={() => setShowCustomizer(true)}
                      fullWidth
                    />
                  </View>
                </View>
              ) : (
                <View style={styles.bodyProfileEmpty}>
                  <Text style={styles.bodyProfileEmptyIcon}>🦸</Text>
                  <Text style={styles.bodyProfileEmptyText}>
                    لم يتم إنشاء هيئة بعد
                  </Text>
                  <Text style={styles.bodyProfileEmptyHint}>
                    أنشئ هيئة لعرض الملابس عليها بشكل واقعي
                  </Text>
                  <Button
                    title="+ إنشاء الهيئة"
                    onPress={() => setShowCustomizer(true)}
                    fullWidth
                  />
                </View>
              )}
            </Card>
          </View>
        )}

        {/* ── Wardrobe Distribution ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>توزيع الخزانة 📊</Text>
          <Card style={styles.distributionCard}>
            {distribution.length === 0 ? (
              <View style={styles.distributionEmpty}>
                <Text style={styles.distributionEmptyText}>
                  لا توجد قطع بعد. أضف بعض القطع لرؤية التوزيع.
                </Text>
              </View>
            ) : (
              distribution.map((item, index) => (
                <View key={index} style={styles.distributionItem}>
                  <View style={styles.distributionHeader}>
                    <View style={styles.distributionLabel}>
                      <Text style={styles.distributionIcon}>{item.icon}</Text>
                      <Text style={styles.distributionName}>{item.label}</Text>
                    </View>
                    <Text style={styles.distributionCount}>
                      {item.count} ({item.percentage}%)
                    </Text>
                  </View>
                  <View style={styles.progressBarOuter}>
                    <View
                      style={[
                        styles.progressBarInner,
                        {
                          width: `${item.percentage}%`,
                          backgroundColor: item.color,
                        },
                      ]}
                    />
                  </View>
                </View>
              ))
            )}
          </Card>
        </View>

        {/* ── Settings ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>الإعدادات ⚙️</Text>
          <Card style={styles.settingsCard}>
            {settings.map((setting, index) => (
              <React.Fragment key={setting.id}>
                {index > 0 && <View style={styles.settingDivider} />}
                <TouchableOpacity
                  style={styles.settingItem}
                  onPress={() => {
                    if (setting.type === 'toggle') {
                      setIsDarkMode(!isDarkMode);
                    } else {
                      handleSettingPress(setting);
                    }
                  }}
                  activeOpacity={0.7}
                >
                  <View style={styles.settingLeft}>
                    <Text style={styles.settingIcon}>{setting.icon}</Text>
                    <Text
                      style={[
                        styles.settingLabel,
                        setting.color ? { color: setting.color } : undefined,
                      ]}
                    >
                      {setting.label}
                    </Text>
                  </View>
                  {setting.type === 'toggle' ? (
                    <Switch
                      value={isDarkMode}
                      onValueChange={setIsDarkMode}
                      trackColor={{
                        false: 'rgba(255,255,255,0.1)',
                        true: 'rgba(108, 99, 255, 0.4)',
                      }}
                      thumbColor={isDarkMode ? Colors.primary : '#555'}
                    />
                  ) : (
                    <Text style={styles.settingArrow}>
                      {setting.type === 'navigate' ? '›' : ''}
                    </Text>
                  )}
                </TouchableOpacity>
              </React.Fragment>
            ))}
          </Card>
        </View>

        {/* App Info */}
        <View style={styles.appInfo}>
          <Text style={styles.appInfoText}>Smart Wardrobe v1.0.0</Text>
          <Text style={styles.appInfoSubtext}>Developed with ❤️</Text>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Avatar Customizer Modal */}
      <Modal
        visible={showCustomizer}
        onClose={() => setShowCustomizer(false)}
        title="تعديل الهيئة"
      >
        <AvatarCustomizer
          profile={bodyProfile || undefined}
          onSave={handleSaveAvatar}
          onCancel={() => setShowCustomizer(false)}
        />
      </Modal>
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
  avatarSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(108, 99, 255, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(108, 99, 255, 0.25)',
  },
  avatarText: {
    fontSize: 30,
  },
  avatarInfo: {
    flex: 1,
  },
  userName: {
    color: Colors.text,
    fontSize: FontSize.xxl,
    fontWeight: '700',
    fontFamily: 'Tajawal',
  },
  userStat: {
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
    fontFamily: 'Tajawal',
    marginTop: 4,
  },
  quickStats: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.md,
  },
  quickStatItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  quickStatValue: {
    color: Colors.text,
    fontSize: FontSize.xxl,
    fontWeight: '800',
  },
  quickStatLabel: {
    color: Colors.textTertiary,
    fontSize: FontSize.xs,
    fontFamily: 'Tajawal',
  },
  quickStatDivider: {
    width: 1,
    height: 36,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignSelf: 'center',
  },

  // ── Sections ──
  scrollContent: {
    paddingBottom: 20,
  },
  section: {
    marginTop: Spacing.xl,
  },
  sectionTitle: {
    color: Colors.text,
    fontSize: FontSize.xl,
    fontWeight: '700',
    fontFamily: 'Tajawal',
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },

  // ── Body Profile ──
  bodyProfileCard: {
    marginHorizontal: Spacing.lg,
  },
  bodyProfileContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.lg,
  },
  bodyInfo: {
    flex: 1,
    gap: Spacing.xs,
  },
  bodyInfoTitle: {
    color: Colors.text,
    fontSize: FontSize.md,
    fontWeight: '600',
    fontFamily: 'Tajawal',
  },
  bodyInfoDetail: {
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
    fontFamily: 'Tajawal',
  },
  bodyInfoBMI: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  bodyInfoBMILabel: {
    backgroundColor: 'rgba(108,99,255,0.15)',
    color: Colors.primary,
    fontSize: FontSize.xs,
    fontWeight: '700',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    overflow: 'hidden',
    fontFamily: 'Tajawal',
  },
  bodyInfoBMIValue: {
    color: Colors.textSecondary,
    fontSize: FontSize.xs,
    fontFamily: 'Tajawal',
  },
  bodyInfoSkin: {
    color: Colors.textSecondary,
    fontSize: FontSize.xs,
    fontFamily: 'Tajawal',
  },
  bodyProfileEmpty: {
    alignItems: 'center',
    paddingVertical: Spacing.lg,
    gap: Spacing.sm,
  },
  bodyProfileEmptyIcon: {
    fontSize: 40,
  },
  bodyProfileEmptyText: {
    color: Colors.text,
    fontSize: FontSize.md,
    fontWeight: '600',
    fontFamily: 'Tajawal',
  },
  bodyProfileEmptyHint: {
    color: Colors.textTertiary,
    fontSize: FontSize.sm,
    textAlign: 'center',
    fontFamily: 'Tajawal',
    marginBottom: Spacing.sm,
  },

  // ── Distribution ──
  distributionCard: {
    marginHorizontal: Spacing.lg,
  },
  distributionEmpty: {
    alignItems: 'center',
    paddingVertical: Spacing.lg,
  },
  distributionEmptyText: {
    color: Colors.textTertiary,
    fontSize: FontSize.sm,
    fontFamily: 'Tajawal',
    textAlign: 'center',
  },
  distributionItem: {
    marginBottom: Spacing.md,
  },
  distributionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  distributionLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  distributionIcon: {
    fontSize: 16,
  },
  distributionName: {
    color: Colors.text,
    fontSize: FontSize.sm,
    fontWeight: '600',
    fontFamily: 'Tajawal',
  },
  distributionCount: {
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
    fontFamily: 'Tajawal',
  },
  progressBarOuter: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarInner: {
    height: '100%',
    borderRadius: 4,
  },

  // ── Settings ──
  settingsCard: {
    marginHorizontal: Spacing.lg,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  settingIcon: {
    fontSize: 20,
  },
  settingLabel: {
    color: Colors.text,
    fontSize: FontSize.base,
    fontFamily: 'Tajawal',
    fontWeight: '500',
  },
  settingArrow: {
    color: Colors.textTertiary,
    fontSize: 22,
    fontWeight: '300',
  },
  settingDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },

  // ── App Info ──
  appInfo: {
    alignItems: 'center',
    paddingVertical: Spacing.xxl,
  },
  appInfoText: {
    color: Colors.textTertiary,
    fontSize: FontSize.sm,
    fontFamily: 'Tajawal',
  },
  appInfoSubtext: {
    color: Colors.textMuted || 'rgba(255,255,255,0.2)',
    fontSize: FontSize.xs,
    fontFamily: 'Tajawal',
    marginTop: 4,
  },
  bottomSpacer: {
    height: 30,
  },
});
