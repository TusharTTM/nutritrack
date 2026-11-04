import React from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../../context/AppContext';
import { shadow } from '../../utils/theme';
const TAB_ICONS = { index: ['home', 'home-outline'], nutrition: ['restaurant', 'restaurant-outline'], progress: ['stats-chart', 'stats-chart-outline'], activity: ['fitness', 'fitness-outline'], profile: ['person', 'person-outline'] };
export default function TabLayout() {
  const { colors } = useApp();
  return <Tabs screenOptions={({ route }) => ({
    headerShown: false, tabBarActiveTintColor: colors.primary, tabBarInactiveTintColor: colors.textMuted,
    tabBarStyle: [styles.tabBar, { backgroundColor: colors.tabBar, borderTopColor: colors.cardBorder }],
    tabBarLabelStyle: styles.tabLabel,
    tabBarItemStyle: styles.tabItem,
    tabBarIcon: ({ focused, color }) => {
      const [active, inactive] = TAB_ICONS[route.name] || ['ellipse', 'ellipse-outline'];
      return (
        <View style={[styles.iconPill, {
          backgroundColor: focused ? colors.primarySurface : 'transparent',
          borderColor: focused ? colors.cardBorder : 'transparent',
        }]}>
          <Ionicons name={focused ? active : inactive} size={20} color={color} />
        </View>
      );
    },
  })}>
    <Tabs.Screen name="index" options={{ title: 'Home' }} /><Tabs.Screen name="nutrition" options={{ title: 'Nutrition' }} /><Tabs.Screen name="progress" options={{ title: 'Progress' }} /><Tabs.Screen name="activity" options={{ title: 'Activity' }} /><Tabs.Screen name="profile" options={{ title: 'Profile' }} />
  </Tabs>;
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
    width: 36,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    borderWidth: 1,
  },
  tabLabel: { fontSize: 11, fontWeight: '600' },
});
