import React from 'react';
import { View, StyleSheet, useWindowDimensions } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppProvider, useApp } from '../context/AppContext';
import { shadow } from '../utils/theme';

const FRAME_MAX = 520;

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

// On tablets/desktop/web, center the phone-width app in a framed column so it
// reads as an intentional product surface instead of a stretched mobile screen.
function Frame({ children }) {
  const { colors } = useApp();
  const { width } = useWindowDimensions();
  const framed = width > FRAME_MAX + 24;
  return (
    <View style={[styles.frame, { backgroundColor: framed ? colors.bgTertiary : colors.bg }]}>
      <View
        collapsable={false}
        style={[
          styles.frameInner,
          framed && {
            maxWidth: FRAME_MAX,
            borderLeftWidth: 1,
            borderRightWidth: 1,
            borderColor: colors.cardBorder,
            ...shadow.lg,
          },
        ]}
      >
        {children}
      </View>
    </View>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AppProvider>
        <Frame>
          <RootNavigator />
        </Frame>
      </AppProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  frame: { flex: 1 },
  frameInner: { flex: 1, width: '100%', alignSelf: 'center' },
});
