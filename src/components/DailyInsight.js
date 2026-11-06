import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import Card from './Card';
import { NUTRITION_TIPS, NUDGES } from '../data/insights';
import { typography, spacing, radius } from '../utils/theme';

// Rotates the featured tip once per day (evaluated at module load, not render).
const TODAY_INDEX = Math.floor(Date.now() / 86400000) % NUTRITION_TIPS.length;

/**
 * Surfaces a data-driven nudge when today's intake is notably off-goal, and
 * otherwise a rotating evidence-based nutrition tip.
 */
export default function DailyInsight({ totals, goals, waterMl = 0 }) {
  const { colors } = useApp();
  const insight = useMemo(() => {
    const t = { protein: totals.protein, fiber: totals.fiber, calories: totals.calories, water: waterMl };
    const nudge = NUDGES.find(n => n.when(t, goals));
    if (nudge) return { tag: nudge.tag, icon: nudge.icon, title: nudge.title, body: nudge.body, isNudge: true };
    const tip = NUTRITION_TIPS[TODAY_INDEX];
    return { tag: tip.tag, icon: tip.icon, title: tip.title, body: tip.body, isNudge: false };
  }, [totals.protein, totals.fiber, totals.calories, waterMl, goals]);

  const accent = insight.isNudge ? colors.accent : colors.primary;

  return (
    <Card style={styles.card} elevated>
      <View style={[styles.iconBadge, { backgroundColor: accent + '1f' }]}>
        <Ionicons name={insight.icon} size={20} color={accent} />
      </View>
      <View style={styles.body}>
        <View style={[styles.tag, { backgroundColor: accent + '1a', borderColor: accent + '33' }]}>
          <Text style={[typography.micro, { color: accent }]}>{insight.tag}</Text>
        </View>
        <Text style={[typography.h4, { color: colors.text, marginTop: 6 }]}>{insight.title}</Text>
        <Text style={[typography.bodySm, { color: colors.textSecondary, marginTop: 3 }]}>{insight.body}</Text>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.lg, alignItems: 'flex-start' },
  iconBadge: { width: 44, height: 44, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  body: { flex: 1, minWidth: 0 },
  tag: { alignSelf: 'flex-start', paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: radius.full, borderWidth: 1 },
});
