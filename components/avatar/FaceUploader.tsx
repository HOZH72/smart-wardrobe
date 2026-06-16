/**
 * FaceUploader - رفع الصورة الشخصية للوجه
 * Handles face photo selection via image picker or camera
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Colors, BorderRadius, FontSize, Spacing } from '../../constants/Colors';
import type { FacePhoto } from '../../models/BodyProfile';

interface Props {
  currentUri?: string;
  onPhotoSelected: (photo: FacePhoto) => void;
  onClear: () => void;
}

export default function FaceUploader({
  currentUri,
  onPhotoSelected,
  onClear,
}: Props) {
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    // Request permission
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'صلاحية الوصول',
        'نحتاج إلى صلاحية الوصول لمعرض الصور لاختيار صورة الوجه.'
      );
      return;
    }

    setLoading(true);
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets.length > 0) {
        const asset = result.assets[0];
        onPhotoSelected({
          uri: asset.uri,
          position: { x: 0, y: 0, scale: 1 },
        });
      }
    } catch (error) {
      console.error('Face photo pick error:', error);
      Alert.alert('خطأ', 'حدث خطأ أثناء اختيار الصورة.');
    } finally {
      setLoading(false);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'صلاحية الكاميرا',
        'نحتاج إلى صلاحية الكاميرا لالتقاط صورة الوجه.'
      );
      return;
    }

    setLoading(true);
    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets.length > 0) {
        const asset = result.assets[0];
        onPhotoSelected({
          uri: asset.uri,
          position: { x: 0, y: 0, scale: 1 },
        });
      }
    } catch (error) {
      console.error('Face photo capture error:', error);
      Alert.alert('خطأ', 'حدث خطأ أثناء التقاط الصورة.');
    } finally {
      setLoading(false);
    }
  };

  if (currentUri) {
    return (
      <View style={styles.container}>
        <View style={styles.previewContainer}>
          <Image source={{ uri: currentUri }} style={styles.previewImage} />
          <View style={styles.previewOverlay}>
            <Text style={styles.previewLabel}>الصورة الشخصية</Text>
          </View>
        </View>
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.changeBtn}
            onPress={pickImage}
            activeOpacity={0.7}
          >
            <Text style={styles.changeBtnText}>🔄 تغيير</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.clearBtn}
            onPress={onClear}
            activeOpacity={0.7}
          >
            <Text style={styles.clearBtnText}>🗑️ إزالة</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>جاري تحميل الصورة...</Text>
        </View>
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>📸</Text>
          <Text style={styles.emptyText}>
            أضف صورة وجهك لتظهر على الهيئة
          </Text>
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={styles.optionBtn}
              onPress={pickImage}
              activeOpacity={0.7}
            >
              <Text style={styles.optionIcon}>🖼️</Text>
              <Text style={styles.optionText}>من المعرض</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.optionBtn}
              onPress={takePhoto}
              activeOpacity={0.7}
            >
              <Text style={styles.optionIcon}>📷</Text>
              <Text style={styles.optionText}>تصوير</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    overflow: 'hidden',
  },
  previewContainer: {
    alignItems: 'center',
    padding: Spacing.lg,
    position: 'relative',
  },
  previewImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: Colors.primary,
  },
  previewOverlay: {
    position: 'absolute',
    bottom: Spacing.lg,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  previewLabel: {
    color: Colors.primary,
    fontSize: FontSize.xs,
    fontWeight: '600',
    fontFamily: 'Tajawal',
  },
  actionRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: Colors.cardBorder,
  },
  changeBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderRightWidth: 1,
    borderRightColor: Colors.cardBorder,
  },
  changeBtnText: {
    color: Colors.primary,
    fontSize: FontSize.sm,
    fontWeight: '600',
    fontFamily: 'Tajawal',
  },
  clearBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  clearBtnText: {
    color: Colors.error,
    fontSize: FontSize.sm,
    fontWeight: '600',
    fontFamily: 'Tajawal',
  },
  loadingContainer: {
    alignItems: 'center',
    padding: Spacing.xxl,
  },
  loadingText: {
    color: Colors.textTertiary,
    fontSize: FontSize.sm,
    marginTop: Spacing.sm,
    fontFamily: 'Tajawal',
  },
  emptyContainer: {
    alignItems: 'center',
    padding: Spacing.lg,
  },
  emptyIcon: {
    fontSize: 40,
    marginBottom: Spacing.sm,
  },
  emptyText: {
    color: Colors.textTertiary,
    fontSize: FontSize.sm,
    textAlign: 'center',
    marginBottom: Spacing.md,
    fontFamily: 'Tajawal',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  optionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: 'rgba(108,99,255,0.1)',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(108,99,255,0.2)',
  },
  optionIcon: {
    fontSize: 20,
  },
  optionText: {
    color: Colors.primary,
    fontSize: FontSize.sm,
    fontWeight: '600',
    fontFamily: 'Tajawal',
  },
});
