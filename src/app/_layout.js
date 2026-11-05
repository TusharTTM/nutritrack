import React from 'react';
import { View, StyleSheet, useWindowDimensions } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppProvider, useApp } from '../context/AppContext';

const CONTENT_MAX = 1120;

function RootNavigator() {
  const { colors, theme } = useApp();
  return (
    <>
      <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg } }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="community/[userId]" />
        <Stack.Screen name="login" />
      </Stack>
    </>
  );
}

// Center the app in a wide column on large screens (reads as a site), full
// width on phones. No phone-style borders — the backdrop frames the content.
function ContentFrame({ children }) {
  const { colors } = useApp();
  const { width } = useWindowDimensions();
  const framed = width > CONTENT_MAX + 24;
  return (
    <View style={[styles.frame, { backgroundColor: framed ? colors.bgTertiary : colors.bg }]}>
      <View collapsable={false} style={[styles.inner, framed && { maxWidth: CONTENT_MAX }]}>
        {children}
      </View>
    </View>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AppProvider>
        <ContentFrame>
          <RootNavigator />
        </ContentFrame>
      </AppProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  frame: { flex: 1 },
  inner: { flex: 1, width: '100%', alignSelf: 'center' },
});
