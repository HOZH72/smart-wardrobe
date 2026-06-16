import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors, BorderRadius, FontSize, Spacing } from '../../constants/Colors';

export default function CameraView() {
  return (
    <View style={styles.container}>
      <View style={styles.viewfinder}>
        <Text style={styles.icon}>📷</Text>
        <Text style={styles.title}>الكاميرا</Text>
        <Text style={styles.subtitle}>قم بتصوير قطعة ملابس لإضافتها</Text>
      </View>

      <TouchableOpacity style={styles.captureButton} activeOpacity={0.7}>
        <View style={styles.captureOuter}>
          <View style={styles.captureInner} />
        </View>
      </TouchableOpacity>

      <Text style={styles.hint}>اضغط على الزر لالتقاط صورة</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.xxl,
  },
  viewfinder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: Spacing.xl,
  },
  icon: {
    fontSize: 64,
    marginBottom: Spacing.lg,
  },
  title: {
    color: Colors.text,
    fontSize: FontSize.xxl,
    fontWeight: '700',
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    color: Colors.textSecondary,
    fontSize: FontSize.base,
    textAlign: 'center',
    lineHeight: 22,
  },
  captureButton: {
    marginBottom: Spacing.xxxl,
    alignItems: 'center',
  },
  captureOuter: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    borderColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  captureInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.primary,
  },
  hint: {
    color: Colors.textTertiary,
    fontSize: FontSize.sm,
    marginBottom: Spacing.lg,
  },
});
