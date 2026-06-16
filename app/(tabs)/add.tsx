import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Animated,
  StyleSheet,
} from 'react-native';
import { router } from 'expo-router';
import { Colors, Spacing, FontSize, BorderRadius } from '../../constants/Colors';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import TypeBadge from '../../components/ui/TypeBadge';
import ColorBadge from '../../components/ui/ColorBadge';
import { SeasonData } from '../../constants/seasons';
import { useCamera } from '../../hooks/useCamera';
import { useImagePicker } from '../../hooks/useImagePicker';
import { useImageClassification } from '../../hooks/useImageClassification';
import { typeNameAr } from '../../constants/types';
import { colorNameAr } from '../../constants/Colors';

/**
 * شاشة إضافة قطعة جديدة - الكاميرا، التحليل، والحفظ
 * Add Item Screen - Camera, AI analysis, and save new clothing item
 */

type Step = 'capture' | 'analyzing' | 'result' | 'saving' | 'saved';

export default function AddScreen() {
  const camera = useCamera();
  const imagePicker = useImagePicker();
  const classifier = useImageClassification();
  const [step, setStep] = useState<Step>('capture');
  const [imageUri, setImageUri] = useState<string | null>(null);

  // Animation for progress bar
  const progressAnim = useRef(new Animated.Value(0)).current;
  const [progressText, setProgressText] = useState('');

  // تحريك شريط التقدم أثناء التحليل
  useEffect(() => {
    if (step === 'analyzing') {
      setProgressText('جاري تحليل الصورة...');
      Animated.timing(progressAnim, {
        toValue: 1,
        duration: 2500,
        useNativeDriver: false,
      }).start(() => {
        if (classifier.state === 'done') {
          setStep('result');
        }
      });
    } else {
      progressAnim.setValue(0);
    }
  }, [step, classifier.state]);

  // مراقبة نتائج التصنيف
  useEffect(() => {
    if (classifier.state === 'done' && classifier.result) {
      setStep('result');
    }
    if (classifier.state === 'error') {
      setStep('capture');
    }
  }, [classifier.state, classifier.result]);

  const handlePickFromGallery = async () => {
    const uri = await imagePicker.pickImage();
    if (uri) {
      setImageUri(uri);
      setStep('analyzing');
      await classifier.classify(uri);
    }
  };

  const handleTakePhoto = async () => {
    const uri = await camera.takePicture();
    if (uri) {
      setImageUri(uri);
      setStep('analyzing');
      await classifier.classify(uri);
    }
  };

  const handleSave = () => {
    setStep('saving');
    // محاكاة عملية الحفظ
    setTimeout(() => {
      setStep('saved');
    }, 1200);
  };

  const handleDone = () => {
    classifier.reset();
    imagePicker.reset();
    camera.reset();
    setImageUri(null);
    setStep('capture');
    router.push('/(tabs)/wardrobe');
  };

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  // عرض شاشة الالتقاط
  const renderCaptureStep = () => (
    <View style={styles.captureContainer}>
      {/* منطقة الكاميرا (placeholder) */}
      <View style={styles.cameraPlaceholder}>
        <Text style={styles.cameraPlaceholderIcon}>📷</Text>
        <Text style={styles.cameraPlaceholderTitle}>التقط صورة لقطعة الملابس</Text>
        <Text style={styles.cameraPlaceholderText}>
          ضع القطعة على خلفية سادة للحصول على أفضل نتيجة
        </Text>
      </View>

      {/* أزرار الإجراءات */}
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={styles.galleryButton}
          activeOpacity={0.7}
          onPress={handlePickFromGallery}
        >
          <Text style={styles.galleryIcon}>🖼️</Text>
          <View>
            <Text style={styles.galleryButtonTitle}>من المعرض</Text>
            <Text style={styles.galleryButtonSub}>اختر صورة من جهازك</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.cameraButton}
          activeOpacity={0.7}
          onPress={handleTakePhoto}
        >
          <Text style={styles.galleryIcon}>📸</Text>
          <View>
            <Text style={styles.galleryButtonTitle}>تصوير مباشر</Text>
            <Text style={styles.galleryButtonSub}>استخدم كاميرا الجهاز</Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );

  // عرض شاشة التحليل
  const renderAnalyzingStep = () => (
    <View style={styles.centerContainer}>
      <LoadingSpinner
        text={progressText}
        size="large"
        color={Colors.primary}
      />

      {/* شريط تقدم التحليل */}
      <View style={styles.progressBarOuter}>
        <Animated.View
          style={[styles.progressBarInner, { width: progressWidth }]}
        />
      </View>

      <Text style={styles.analyzingHint}>
        جاري استخراج النوع واللون والموسم...
      </Text>
    </View>
  );

  // عرض نتيجة التحليل
  const renderResultStep = () => {
    const result = classifier.result;
    if (!result) return renderCaptureStep();

    const seasonInfo = SeasonData[result.season];

    return (
      <ScrollView
        style={styles.resultContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* معاينة الصورة */}
        <View style={styles.previewContainer}>
          <View style={styles.previewPlaceholder}>
            <Text style={styles.previewIcon}>📷</Text>
          </View>
          <Text style={styles.previewLabel}>تم تحليل الصورة بنجاح ✓</Text>
        </View>

        {/* بطاقة نتيجة التحليل */}
        <Card style={styles.resultCard}>
          <Text style={styles.resultCardTitle}>نتيجة التحليل</Text>

          {/* النوع */}
          <View style={styles.resultRow}>
            <Text style={styles.resultLabel}>النوع</Text>
            <TypeBadge typeId={result.type} />
          </View>

          {/* اللون */}
          <View style={styles.resultRow}>
            <Text style={styles.resultLabel}>اللون</Text>
            <ColorBadge
              colorHex={result.colorHex}
              colorName={colorNameAr(result.colorName)}
            />
          </View>

          {/* الموسم */}
          <View style={styles.resultRow}>
            <Text style={styles.resultLabel}>الموسم</Text>
            <View style={styles.seasonBadge}>
              <Text style={styles.seasonIcon}>{seasonInfo.icon}</Text>
              <Text style={styles.seasonText}>{seasonInfo.nameAr}</Text>
            </View>
          </View>

          {/* المناسبة */}
          <View style={styles.resultRow}>
            <Text style={styles.resultLabel}>المناسبة</Text>
            <Text style={styles.resultValue}>
              {result.occasion === 'formal'
                ? 'رسمي'
                : result.occasion === 'sport'
                ? 'رياضي'
                : 'كاجوال'}
            </Text>
          </View>

          {/* الوسوم */}
          <View style={styles.tagsSection}>
            <Text style={styles.tagsLabel}>الوسوم</Text>
            <View style={styles.tagsRow}>
              {result.tags.map((tag, i) => (
                <View key={i} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>
          </View>
        </Card>

        {/* درجة الثقة */}
        <Card style={styles.confidenceCard}>
          <Text style={styles.confidenceTitle}>درجة الثقة في التحليل</Text>
          <View style={styles.confidenceRow}>
            <View style={styles.confidenceItem}>
              <Text style={styles.confidenceValue}>
                {Math.round(result.typeConfidence * 100)}%
              </Text>
              <Text style={styles.confidenceLabel}>النوع</Text>
            </View>
            <View style={styles.confidenceDivider} />
            <View style={styles.confidenceItem}>
              <Text style={styles.confidenceValue}>
                {Math.round(result.colorConfidence * 100)}%
              </Text>
              <Text style={styles.confidenceLabel}>اللون</Text>
            </View>
          </View>
        </Card>

        {/* أزرار الحفظ */}
        <View style={styles.saveButtons}>
          <Button
            title="حفظ القطعة في الخزانة"
            onPress={handleSave}
            variant="primary"
            size="lg"
            fullWidth
            icon="💾"
          />
          <Button
            title="إعادة التصوير"
            onPress={() => {
              classifier.reset();
              setImageUri(null);
              setStep('capture');
            }}
            variant="outline"
            size="md"
            fullWidth
            style={styles.retakeButton}
          />
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    );
  };

  // عرض شاشة الحفظ
  const renderSavingStep = () => (
    <View style={styles.centerContainer}>
      <LoadingSpinner
        text="جاري حفظ القطعة..."
        size="large"
        color={Colors.success}
      />
    </View>
  );

  // عرض شاشة الحفظ بنجاح
  const renderSavedStep = () => (
    <View style={styles.centerContainer}>
      <View style={styles.successIcon}>
        <Text style={styles.successIconText}>✅</Text>
      </View>
      <Text style={styles.successTitle}>تمت الإضافة بنجاح!</Text>
      <Text style={styles.successText}>
        تم إضافة القطعة إلى خزانتك. يمكنك الآن استخدامها في الإطلالات.
      </Text>
      <Button
        title="العودة إلى الخزانة"
        onPress={handleDone}
        variant="primary"
        size="lg"
        icon="📋"
        style={styles.successButton}
      />
    </View>
  );

  // تقديم الشاشة حسب الخطوة
  const renderStep = () => {
    switch (step) {
      case 'capture':
        return renderCaptureStep();
      case 'analyzing':
        return renderAnalyzingStep();
      case 'result':
        return renderResultStep();
      case 'saving':
        return renderSavingStep();
      case 'saved':
        return renderSavedStep();
      default:
        return renderCaptureStep();
    }
  };

  return (
    <View style={styles.container}>
      {/* رأس الصفحة */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>إضافة قطعة جديدة</Text>
        <Text style={styles.headerSubtitle}>
          {step === 'capture'
            ? 'صور أو اختر صورة لتحليلها'
            : step === 'analyzing'
            ? 'جار التحليل'
            : step === 'result'
            ? 'تأكيد النتائج'
            : 'جاري الحفظ'}
        </Text>
      </View>

      {/* المحتوى */}
      <View style={styles.content}>
        {renderStep()}
      </View>
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
  },
  headerTitle: {
    color: Colors.text,
    fontSize: FontSize.xxxl,
    fontWeight: '700',
    fontFamily: 'Tajawal',
  },
  headerSubtitle: {
    color: Colors.textSecondary,
    fontSize: FontSize.md,
    fontFamily: 'Tajawal',
    marginTop: 4,
  },
  content: {
    flex: 1,
  },

  // ── Capture Step ──
  captureContainer: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    justifyContent: 'center',
  },
  cameraPlaceholder: {
    alignItems: 'center',
    paddingVertical: Spacing.xxxl,
    backgroundColor: 'rgba(108, 99, 255, 0.04)',
    borderRadius: BorderRadius.xl,
    borderWidth: 2,
    borderColor: 'rgba(108, 99, 255, 0.1)',
    borderStyle: 'dashed',
    marginBottom: Spacing.xxl,
  },
  cameraPlaceholderIcon: {
    fontSize: 64,
    marginBottom: Spacing.lg,
  },
  cameraPlaceholderTitle: {
    color: Colors.text,
    fontSize: FontSize.xl,
    fontWeight: '700',
    fontFamily: 'Tajawal',
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  cameraPlaceholderText: {
    color: Colors.textTertiary,
    fontSize: FontSize.sm,
    fontFamily: 'Tajawal',
    textAlign: 'center',
    paddingHorizontal: Spacing.xl,
    lineHeight: 20,
  },
  actionButtons: {
    gap: Spacing.md,
  },
  galleryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  cameraButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(108, 99, 255, 0.06)',
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: 'rgba(108, 99, 255, 0.15)',
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  galleryIcon: {
    fontSize: 28,
  },
  galleryButtonTitle: {
    color: Colors.text,
    fontSize: FontSize.lg,
    fontWeight: '600',
    fontFamily: 'Tajawal',
  },
  galleryButtonSub: {
    color: Colors.textTertiary,
    fontSize: FontSize.sm,
    fontFamily: 'Tajawal',
    marginTop: 2,
  },

  // ── Analyzing Step ──
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },
  progressBarOuter: {
    width: '80%',
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 3,
    overflow: 'hidden',
    marginTop: Spacing.xl,
  },
  progressBarInner: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 3,
  },
  analyzingHint: {
    color: Colors.textTertiary,
    fontSize: FontSize.sm,
    fontFamily: 'Tajawal',
    marginTop: Spacing.lg,
  },

  // ── Result Step ──
  resultContainer: {
    flex: 1,
  },
  previewContainer: {
    alignItems: 'center',
    paddingVertical: Spacing.lg,
  },
  previewPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 20,
    backgroundColor: 'rgba(108, 99, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(108, 99, 255, 0.15)',
  },
  previewIcon: {
    fontSize: 48,
  },
  previewLabel: {
    color: Colors.success,
    fontSize: FontSize.sm,
    fontFamily: 'Tajawal',
    fontWeight: '600',
    marginTop: Spacing.sm,
  },
  resultCard: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  resultCardTitle: {
    color: Colors.text,
    fontSize: FontSize.lg,
    fontWeight: '700',
    fontFamily: 'Tajawal',
    marginBottom: Spacing.lg,
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.04)',
  },
  resultLabel: {
    color: Colors.textSecondary,
    fontSize: FontSize.base,
    fontFamily: 'Tajawal',
  },
  resultValue: {
    color: Colors.text,
    fontSize: FontSize.base,
    fontWeight: '600',
    fontFamily: 'Tajawal',
  },
  seasonBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  seasonIcon: {
    fontSize: 16,
  },
  seasonText: {
    color: Colors.text,
    fontSize: FontSize.base,
    fontWeight: '600',
    fontFamily: 'Tajawal',
  },
  tagsSection: {
    paddingTop: Spacing.md,
  },
  tagsLabel: {
    color: Colors.textSecondary,
    fontSize: FontSize.base,
    fontFamily: 'Tajawal',
    marginBottom: Spacing.sm,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  tag: {
    backgroundColor: 'rgba(108, 99, 255, 0.1)',
    paddingHorizontal: Spacing.md,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(108, 99, 255, 0.2)',
  },
  tagText: {
    color: Colors.primary,
    fontSize: FontSize.sm,
    fontFamily: 'Tajawal',
    fontWeight: '500',
  },
  confidenceCard: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  confidenceTitle: {
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
    fontFamily: 'Tajawal',
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  confidenceRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  confidenceItem: {
    alignItems: 'center',
    gap: 4,
  },
  confidenceValue: {
    color: Colors.primary,
    fontSize: FontSize.xxl,
    fontWeight: '800',
  },
  confidenceLabel: {
    color: Colors.textTertiary,
    fontSize: FontSize.xs,
    fontFamily: 'Tajawal',
  },
  confidenceDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  saveButtons: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
    marginTop: Spacing.md,
  },
  retakeButton: {
    marginBottom: Spacing.lg,
  },
  bottomSpacer: {
    height: 40,
  },

  // ── Saved Step ──
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  successIconText: {
    fontSize: 44,
  },
  successTitle: {
    color: Colors.text,
    fontSize: FontSize.xxl,
    fontWeight: '700',
    fontFamily: 'Tajawal',
    marginBottom: Spacing.sm,
  },
  successText: {
    color: Colors.textSecondary,
    fontSize: FontSize.base,
    fontFamily: 'Tajawal',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: Spacing.xxl,
    paddingHorizontal: Spacing.xl,
  },
  successButton: {
    minWidth: 200,
  },
});
