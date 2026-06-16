import { Tabs } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, FontSize, Spacing } from '../../constants/Colors';

/**
 * شريط التبويبات الرئيسي - 5 أقسام
 */

type TabIcon = { focused: boolean; color: string; size: number };

function TabIcon({ icon, focused }: { icon: string; focused: boolean }) {
  return (
    <Text style={{ fontSize: focused ? 24 : 22, opacity: focused ? 1 : 0.5 }}>
      {icon}
    </Text>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: 'rgba(15, 15, 26, 0.95)',
          borderTopColor: 'rgba(255,255,255,0.05)',
          borderTopWidth: 1,
          height: 85,
          paddingBottom: 25,
          paddingTop: 8,
          direction: 'rtl',
        },
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: 'rgba(255,255,255,0.4)',
        tabBarLabelStyle: {
          fontFamily: 'Tajawal',
          fontSize: FontSize.xs,
          fontWeight: '600',
        },
        tabBarItemStyle: {
          gap: 2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'الرئيسية',
          tabBarIcon: ({ focused }) => (
            <TabIcon icon="🏠" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="wardrobe"
        options={{
          title: 'الخزانة',
          tabBarIcon: ({ focused }) => (
            <TabIcon icon="📋" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="add"
        options={{
          title: 'إضافة',
          tabBarIcon: ({ focused }) => (
            <View style={styles.addIconWrapper}>
              <View style={[styles.addIconBg, focused && styles.addIconBgActive]}>
                <Text style={styles.addIconText}>+</Text>
              </View>
            </View>
          ),
          tabBarLabelStyle: {
            fontFamily: 'Tajawal',
            fontSize: FontSize.xs,
            fontWeight: '700',
            color: Colors.primary,
            marginTop: 2,
          },
        }}
      />
      <Tabs.Screen
        name="outfits"
        options={{
          title: 'الإطلالات',
          tabBarIcon: ({ focused }) => (
            <TabIcon icon="👔" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'ملفي',
          tabBarIcon: ({ focused }) => (
            <TabIcon icon="👤" focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  addIconWrapper: {
    width: 48,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addIconBg: {
    width: 40,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(108, 99, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addIconBgActive: {
    backgroundColor: 'rgba(108, 99, 255, 0.3)',
  },
  addIconText: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.primary,
    lineHeight: 24,
  },
});
