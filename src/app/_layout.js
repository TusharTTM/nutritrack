import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppProvider, useApp } from '../context/AppContext';
function RootNavigator() {
  const { colors, theme, session, authLoading } = useApp();
  return <>
    <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg } }}>
      <Stack.Protected guard={authLoading || Boolean(session)} redirectTo="/login">
        <Stack.Screen name="index" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="community/[userId]" />
      </Stack.Protected>
      <Stack.Protected guard={authLoading || !session} redirectTo="/">
        <Stack.Screen name="login" />
      </Stack.Protected>
    </Stack>
  </>;
}
export default function RootLayout() { return <SafeAreaProvider><AppProvider><RootNavigator /></AppProvider></SafeAreaProvider>; }
