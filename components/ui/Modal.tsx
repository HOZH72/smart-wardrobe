import React, { ReactNode, useEffect, useRef } from 'react';
import {
  Modal as RNModal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ViewStyle,
} from 'react-native';
import { Colors, BorderRadius, FontSize, Spacing } from '../../constants/Colors';

interface ModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  style?: ViewStyle;
  showCloseButton?: boolean;
  animationType?: 'fade' | 'slide' | 'none';
  avoidKeyboard?: boolean;
}

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function Modal({
  visible,
  onClose,
  title,
  children,
  style,
  showCloseButton = true,
  animationType = 'fade',
  avoidKeyboard = true,
}: ModalProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      fadeAnim.setValue(0);
      slideAnim.setValue(SCREEN_HEIGHT);
    }
  }, [visible]);

  const Container = avoidKeyboard ? KeyboardAvoidingView : View;

  return (
    <RNModal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <Container
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Animated.View
          style={[
            styles.backdrop,
            {
              opacity: fadeAnim,
            },
          ]}
        >
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={onClose}
          />
        </Animated.View>

        <Animated.View
          style={[
            styles.content,
            style,
            animationType === 'slide'
              ? { transform: [{ translateY: slideAnim }] }
              : { opacity: fadeAnim },
          ]}
        >
          {(title || showCloseButton) && (
            <View style={styles.header}>
              {title ? (
                <Text style={styles.title}>{title}</Text>
              ) : (
                <View style={{ flex: 1 }} />
              )}
              {showCloseButton && (
                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                  <Text style={styles.closeIcon}>✕</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
          <View style={styles.body}>{children}</View>
        </Animated.View>
      </Container>
    </RNModal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  content: {
    width: '88%',
    maxHeight: '80%',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    paddingVertical: Spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 24,
    elevation: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.cardBorder,
  },
  title: {
    flex: 1,
    color: Colors.text,
    fontSize: FontSize.xl,
    fontWeight: '600',
    fontFamily: 'Tajawal',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: Spacing.sm,
  },
  closeIcon: {
    color: Colors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
  body: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
  },
});
