import React, { useEffect } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, interpolate } from 'react-native-reanimated';
import { useApp } from '../../context/AppContext';
import { ctaGradient, shadow } from '../../utils/theme';

const TAB_ICONS = {
  index: ['home', 'home-outline'], nutrition: ['restaurant', 'restaurant-outline'],
  progress: ['stats-chart', 'stats-chart-outline'], activity: ['fitness', 'fitness-outline'],
  profile: ['person', 'person-outline'],
};

function TabIcon({ focused, color, activeIcon, inactiveIcon, grad, textInverse }) {
  const pop = useSharedValue(focused ? 1 : 0);
  useEffect(() => { pop.value = withSpring(focused ? 1 : 0, { damping: 13, stiffness: 240 }); }, [focused, pop]);
  const fillAnim = useAnimatedStyle(() => ({
    opacity: pop.value,
    transform: [{ scale: interpolate(pop.value, [0, 1], [0.8, 1]) }],
  }));
  return (
    <View style={styles.iconPill}>
      <Ionicons name={inactiveIcon} size={20} color={color} />
      <Animated.View style={[StyleSheet.absoluteFillObject, styles.pillFill, fillAnim]}>
        <LinearGradient colors={grad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[StyleSheet.absoluteFillObject, { borderRadius: 12 }]} />
        <Ionicons name={activeIcon} size={20} color={textInverse} />
      </Animated.View>
    </View>
  );
}

export default function TabLayout() {
  const { colors, theme } = useApp();
  const activeGrad = ctaGradient(theme);
  return (
    <Tabs screenOptions={({ route }) => ({
      headerShown: false,
      tabBarActiveTintColor: colors.primary,
      tabBarInactiveTintColor: colors.textMuted,
      tabBarStyle: [styles.tabBar, { backgroundColor: colors.tabBar, borderTopColor: colors.cardBorder }],
      tabBarLabelStyle: styles.tabLabel,
      tabBarItemStyle: styles.tabItem,
      tabBarIcon: ({ focused, color }) => {
        const [active, inactive] = TAB_ICONS[route.name] || ['ellipse', 'ellipse-outline'];
        return (
          <TabIcon
            focused={focused}
            color={color}
            activeIcon={active}
            inactiveIcon={inactive}
            grad={activeGrad}
            textInverse={colors.textInverse}
          />
        );
      },
    })}
    >
      <Tabs.Screen name="index" options={{ title: 'Home' }} />
      <Tabs.Screen name="nutrition" options={{ title: 'Nutrition' }} />
      <Tabs.Screen name="progress" options={{ title: 'Progress' }} />
      <Tabs.Screen name="activity" options={{ title: 'Activity' }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile' }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    height: Platform.OS === 'ios' ? 88 : 76,
    paddingBottom: Platform.OS === 'ios' ? 26 : 8,
    paddingTop: 5,
    paddingHorizontal: 4,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
    ...shadow.sm,
  },
  tabItem: { minWidth: 0, marginHorizontal: 2, borderRadius: 16 },
  iconPill: {
    width: 38, height: 30, alignItems: 'center', justifyContent: 'center', borderRadius: 12,
  },
  pillFill: { alignItems: 'center', justifyContent: 'center', borderRadius: 12, overflow: 'hidden' },
  tabLabel: { fontSize: 11, fontWeight: '600' },
});
