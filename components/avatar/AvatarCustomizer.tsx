/**
 * AvatarCustomizer - محرر مواصفات الهيئة
 * Full body profile editor — gender, shape, measurements, skin color
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Colors, BorderRadius, FontSize, Spacing } from '../../constants/Colors';
import Card from '../ui/Card';
import Button from '../ui/Button';
import BodyModel from './BodyModel';
import FaceUploader from './FaceUploader';
import BodyPhotoCapture from './BodyPhotoCapture';
import {
  BodyProfile,
  Gender,
  BodyShape,
  SkinColor,
  SKIN_COLORS,
  BodyMeasurements,
  FacePhoto,
  AgeRange,
  AGE_RANGES,
  calcBMI,
  bmiCategory,
} from '../../models/BodyProfile';

interface Props {
  profile?: Partial<BodyProfile>;
  onSave: (profile: BodyProfile) => void;
  onCancel?: () => void;
}

export default function AvatarCustomizer({ profile, onSave, onCancel }: Props) {
  const [gender, setGender] = useState<Gender>(profile?.gender || 'male');
  const [shape, setShape] = useState<BodyShape>(profile?.shape || 'average');
  const [height, setHeight] = useState(
    String(profile?.measurements?.height || 170)
  );
  const [weight, setWeight] = useState(
    String(profile?.measurements?.weight || 70)
  );
  const [skinColor, setSkinColor] = useState<SkinColor>(
    profile?.skinColor || SKIN_COLORS[2]
  );
  const [facePhoto, setFacePhoto] = useState<FacePhoto | undefined>(
    profile?.facePhoto
  );
  const [ageRange, setAgeRange] = useState<AgeRange>(profile?.ageRange || '25_34');
  const [showBodyCapture, setShowBodyCapture] = useState(false);

  // Live preview profile
  const heightNum = Number(height) || 170;
  const weightNum = Number(weight) || 70;
  const previewProfile: BodyProfile = {
    id: 'preview',
    gender,
    ageRange,
    shape,
    measurements: { height: heightNum, weight: weightNum },
    skinColor,
    facePhoto,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  const bmi = calcBMI(previewProfile.measurements);

  const handleBodyCaptureComplete = (result: {
    bodyPhotoUri?: string;
    facePhoto?: FacePhoto;
    autoFill: { estimatedHeight?: number; estimatedWeight?: number; shape?: BodyShape; skinColor?: SkinColor; gender?: Gender; ageRange?: AgeRange };
  }) => {
    if (result.autoFill.estimatedHeight) setHeight(String(result.autoFill.estimatedHeight));
    if (result.autoFill.estimatedWeight) setWeight(String(result.autoFill.estimatedWeight));
    if (result.autoFill.shape) setShape(result.autoFill.shape);
    if (result.autoFill.skinColor) setSkinColor(result.autoFill.skinColor);
    if (result.autoFill.gender) setGender(result.autoFill.gender);
    if (result.autoFill.ageRange) setAgeRange(result.autoFill.ageRange);
    if (result.facePhoto) setFacePhoto(result.facePhoto);
    setShowBodyCapture(false);
  };

  const handleSave = () => {
    const newProfile: BodyProfile = {
      id: profile?.id || Date.now().toString(),
      gender,
      ageRange,
      shape,
      measurements: {
        height: heightNum,
        weight: weightNum,
      },
      skinColor,
      facePhoto,
      createdAt: profile?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    onSave(newProfile);
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {showBodyCapture ? (
        <BodyPhotoCapture
          onComplete={handleBodyCaptureComplete}
          onCancel={() => setShowBodyCapture(false)}
        />
      ) : (
        <>
          <Text style={styles.title}>🦸 إنشاء الهيئة</Text>
          <Text style={styles.subtitle}>
            حدد مواصفات جسمك لعرض الملابس بشكل واقعي
          </Text>

          {/* 📸 Body capture button */}
          <Button title="📸 تصوير الجسم لملء البيانات" onPress={() => setShowBodyCapture(true)} variant="outline" fullWidth />

          {/* ── Preview ── */}
          <Card style={styles.previewCard}>
            <BodyModel profile={previewProfile} height={350} width={180} />
            <View style={styles.bmiRow}>
              <Text style={styles.bmiValue}>BMI {bmi.toFixed(1)}</Text>
              <Text style={styles.bmiLabel}>{bmiCategory(bmi)}</Text>
            </View>
          </Card>

      {/* ── Gender ── */}
      <View style={styles.section}>
        <Text style={styles.label}>الجنس</Text>
        <View style={styles.genderRow}>
          {(['male', 'female', 'other'] as Gender[]).map((g) => (
            <TouchableOpacity
              key={g}
              style={[styles.genderBtn, gender === g && styles.selectedGender]}
              onPress={() => setGender(g)}
              activeOpacity={0.7}
            >
              <Text style={styles.genderIcon}>
                {g === 'male' ? '👨' : g === 'female' ? '👩' : '🧑'}
              </Text>
              <Text
                style={[
                  styles.genderText,
                  gender === g && styles.selectedText,
                ]}
              >
                {g === 'male' ? 'ذكر' : g === 'female' ? 'أنثى' : 'آخر'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* ── Age Range ── */}
      <View style={styles.section}>
        <Text style={styles.label}>الفئة العمرية</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.ageRow}
        >
          {AGE_RANGES.map((ar) => (
            <TouchableOpacity
              key={ar.range}
              style={[styles.ageChip, ageRange === ar.range && styles.selectedAgeChip]}
              onPress={() => setAgeRange(ar.range)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.ageChipText,
                  ageRange === ar.range && styles.selectedAgeChipText,
                ]}
              >
                {ar.labelAr}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* ── Body Shape ── */}
      <View style={styles.section}>
        <Text style={styles.label}>شكل الجسم</Text>
        <View style={styles.shapeRow}>
          {(
            ['slim', 'athletic', 'average', 'curvy', 'plus'] as BodyShape[]
          ).map((s) => (
            <TouchableOpacity
              key={s}
              style={[styles.chip, shape === s && styles.selectedChip]}
              onPress={() => setShape(s)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.chipText,
                  shape === s && styles.selectedChipText,
                ]}
              >
                {s === 'slim'
                  ? 'نحيف'
                  : s === 'athletic'
                    ? 'رياضي'
                    : s === 'average'
                      ? 'متوسط'
                      : s === 'curvy'
                        ? 'ممتلئ'
                        : 'مقوس'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* ── Measurements ── */}
      <View style={styles.section}>
        <Text style={styles.label}>القياسات</Text>
        <View style={styles.measureRow}>
          <View style={styles.measureInput}>
            <Text style={styles.measureLabel}>الطول (سم)</Text>
            <TextInput
              style={styles.input}
              value={height}
              onChangeText={setHeight}
              keyboardType="numeric"
              placeholderTextColor={Colors.textTertiary}
              placeholder="170"
            />
          </View>
          <View style={styles.measureInput}>
            <Text style={styles.measureLabel}>الوزن (كجم)</Text>
            <TextInput
              style={styles.input}
              value={weight}
              onChangeText={setWeight}
              keyboardType="numeric"
              placeholderTextColor={Colors.textTertiary}
              placeholder="70"
            />
          </View>
        </View>
      </View>

      {/* ── Skin Color ── */}
      <View style={styles.section}>
        <Text style={styles.label}>لون البشرة</Text>
        <View style={styles.skinRow}>
          {SKIN_COLORS.map((sc) => (
            <TouchableOpacity
              key={sc.name}
              style={[
                styles.skinCircle,
                { backgroundColor: sc.hex },
                skinColor.name === sc.name && styles.selectedSkin,
              ]}
              onPress={() => setSkinColor(sc)}
              activeOpacity={0.7}
            />
          ))}
        </View>
        <Text style={styles.skinName}>{skinColor.labelAr}</Text>
      </View>

      {/* ── Face Photo ── */}
      <View style={styles.section}>
        <Text style={styles.label}>الصورة الشخصية (اختياري)</Text>
        <FaceUploader
          currentUri={facePhoto?.uri}
          onPhotoSelected={(photo) => setFacePhoto(photo)}
          onClear={() => setFacePhoto(undefined)}
        />
      </View>

      {/* ── Actions ── */}
      <View style={styles.actions}>
        {onCancel && (
          <Button title="إلغاء" variant="outline" onPress={onCancel} />
        )}
        <Button title="💾 حفظ الهيئة" onPress={handleSave} fullWidth />
      </View>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: Spacing.lg,
    paddingBottom: 100,
  },
  title: {
    fontSize: FontSize.xl,
    fontWeight: 'bold',
    color: Colors.text,
    textAlign: 'center',
    fontFamily: 'Tajawal',
  },
  subtitle: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.lg,
    fontFamily: 'Tajawal',
  },
  previewCard: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
    paddingBottom: Spacing.lg,
  },
  bmiRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.md,
    backgroundColor: 'rgba(108,99,255,0.1)',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
  bmiValue: {
    color: Colors.primary,
    fontSize: FontSize.sm,
    fontWeight: '700',
    fontFamily: 'Tajawal',
  },
  bmiLabel: {
    color: Colors.textSecondary,
    fontSize: FontSize.xs,
    fontFamily: 'Tajawal',
  },
  section: {
    marginBottom: Spacing.lg,
  },
  label: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.sm,
    fontFamily: 'Tajawal',
  },
  genderRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  genderBtn: {
    flex: 1,
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  selectedGender: {
    borderColor: Colors.primary,
    backgroundColor: 'rgba(108,99,255,0.1)',
  },
  genderIcon: {
    fontSize: 28,
    marginBottom: 4,
  },
  genderText: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    fontFamily: 'Tajawal',
  },
  selectedText: {
    color: Colors.primary,
    fontWeight: '600',
  },
  ageRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
    paddingVertical: Spacing.xs,
  },
  ageChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 999,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    marginBottom: Spacing.xs,
  },
  selectedAgeChip: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  ageChipText: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    fontFamily: 'Tajawal',
  },
  selectedAgeChipText: {
    color: '#fff',
    fontWeight: '600',
  },
  shapeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
  chip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 999,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  selectedChip: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  chipText: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    fontFamily: 'Tajawal',
  },
  selectedChipText: {
    color: '#fff',
    fontWeight: '600',
  },
  measureRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  measureInput: {
    flex: 1,
  },
  measureLabel: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    marginBottom: 4,
    fontFamily: 'Tajawal',
  },
  input: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    color: Colors.text,
    fontSize: FontSize.md,
    textAlign: 'center',
    fontFamily: 'Tajawal',
  },
  skinRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.sm,
    flexWrap: 'wrap',
  },
  skinCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedSkin: {
    borderColor: Colors.primary,
    transform: [{ scale: 1.15 }],
  },
  skinName: {
    textAlign: 'center',
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
    marginTop: Spacing.sm,
    fontFamily: 'Tajawal',
  },
  actions: {
    gap: Spacing.md,
    marginTop: Spacing.lg,
  },
});
