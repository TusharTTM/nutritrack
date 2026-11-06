import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import AppTouchable from './AppTouchable';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { typography, spacing, radius } from '../utils/theme';

export default function EmptyState({ icon = 'file-tray-outline', title, subtitle, action, onAction }) {
  const { colors } = useApp();
  return (
    <View style={styles.container}>
      <View style={[styles.iconWrap, { backgroundColor: colors.primarySurface, borderColor: colors.cardBorder }]}>
        <Ionicons name={icon} size={30} color={colors.primary} accessibilityElementsHidden importantForAccessibility="no-hide-descendants" />
      </View>
      <Text style={[typography.h3, styles.text, { color: colors.text, marginTop: spacing.md }]}>{title}</Text>
      {subtitle ? (
        <Text style={[typography.bodySm, styles.text, { color: colors.textSecondary, marginTop: spacing.sm }]}>{subtitle}</Text>
      ) : null}
      {action ? (
        <AppTouchable
          style={[styles.btn, { backgroundColor: colors.primary }]}
          onPress={onAction}
          accessibilityRole="button"
        >
          <Text style={[typography.bodyMed, { color: colors.textInverse }]}>{action}</Text>
        </AppTouchable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignSelf: 'stretch',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
  },
  text: {
    maxWidth: 300,
    minWidth: 0,
    textAlign: 'center',
  },
  iconWrap: {
    width: 68,
    height: 68,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 24,
    borderWidth: 1,
  },
  btn: {
    marginTop: spacing.lg,
    paddingHorizontal: spacing.xl,
    minHeight: 44,
    justifyContent: 'center',
    borderRadius: radius.full,
  },
});
