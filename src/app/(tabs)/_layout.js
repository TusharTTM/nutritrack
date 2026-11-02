import React from 'react';
import { Platform, StyleSheet } from 'react-native';
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
    tabBarIcon: ({ focused, color }) => { const [active, inactive] = TAB_ICONS[route.name] || ['ellipse', 'ellipse-outline']; return <Ionicons name={focused ? active : inactive} size={21} color={color} />; },
  })}>
    <Tabs.Screen name="index" options={{ title: 'Home' }} /><Tabs.Screen name="nutrition" options={{ title: 'Nutrition' }} /><Tabs.Screen name="progress" options={{ title: 'Progress' }} /><Tabs.Screen name="activity" options={{ title: 'Activity' }} /><Tabs.Screen name="profile" options={{ title: 'Profile' }} />
  </Tabs>;
}
const styles = StyleSheet.create({ tabBar: { height: Platform.OS === 'ios' ? 84 : 68, paddingBottom: Platform.OS === 'ios' ? 26 : 8, paddingTop: 8, borderTopWidth: StyleSheet.hairlineWidth, borderTopLeftRadius: 24, borderTopRightRadius: 24, overflow: 'hidden', ...shadow.sm }, tabLabel: { fontSize: 10, fontWeight: '600', letterSpacing: 0.2 } });
