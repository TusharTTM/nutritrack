import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { Redirect } from 'expo-router';
import { useApp } from '../context/AppContext';
import OnboardingScreen from '../screens/OnboardingScreen';
export default function IndexRoute() {
  const { profile, loading, authLoading, colors } = useApp();
  if (loading || authLoading) return <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg }}><ActivityIndicator size="large" color={colors.primary} /></View>;
  if (!profile.onboardingDone) return <OnboardingScreen />;
  return <Redirect href="/(tabs)" />;
}
