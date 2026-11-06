import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import AppTouchable from './AppTouchable';
import { useApp } from '../context/AppContext';
import { typography, spacing } from '../utils/theme';

export default function SectionHeader({ title, action, onAction, subtitle, style }) {
  const { colors } = useApp();
  return (
    <View style={[styles.row, style]}>
      <View style={styles.left}>
        <Text style={[typography.h3, { color: colors.text }]}>{title}</Text>
        {subtitle ? <Text style={[typography.caption, { color: colors.textMuted, marginTop: 2 }]}>{subtitle}</Text> : null}
      </View>
      {action ? (
        <AppTouchable style={styles.action} onPress={onAction} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Text style={[typography.bodySmMed, { color: colors.primary }]}>{action}</Text>
        </AppTouchable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    minWidth: 0,
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  left: { flex: 1, minWidth: 0, marginRight: spacing.md },
  action: { flexShrink: 0 },
});
