import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useApp } from '../context/AppContext';
import { typography, spacing, radius } from '../utils/theme';

export default function MacroBar({ label, value, goal, color, unit = 'g', compact = false }) {
  const { colors } = useApp();
  const progress = Math.min(value / (goal || 1), 1);
  const over = value > goal;

  if (compact) {
    return (
      <View style={styles.compact}>
        <View style={styles.compactHeader}>
          <Text style={[typography.bodySmMed, { color: colors.textSecondary }]}>{label}</Text>
          <Text style={[typography.bodySmMed, { color }]}>
            {Math.round(value)}<Text style={{ color: colors.textMuted }}>/{goal}{unit}</Text>
          </Text>
        </View>
        <View style={[styles.track, { backgroundColor: colors.cardBorder }]}>
          <View style={[styles.fill, { width: `${progress * 100}%`, backgroundColor: over ? colors.error : color }]} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={[typography.bodySmMed, { color: colors.text }]}>{label}</Text>
          <Text style={[typography.bodySm, { color: colors.textSecondary }]}>
            <Text style={{ color, fontWeight: '700' }}>{Math.round(value)}</Text>/{goal}{unit}
          </Text>
        </View>
        <View style={[styles.track, { backgroundColor: colors.cardBorder }]}>
          <View style={[styles.fill, { width: `${progress * 100}%`, backgroundColor: over ? colors.error : color }]} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  dot: { width: 8, height: 8, borderRadius: 4 },
  content: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  track: {
    height: 6,
    borderRadius: radius.full,
    overflow: 'hidden',
  },
  fill: { height: 6, borderRadius: radius.full },
  compact: { flex: 1 },
  compactHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
});
