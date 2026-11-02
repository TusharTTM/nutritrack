import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, spacing, radius, shadow, typography } from '../utils/theme';

const MealCard = ({ title, items, onAddFood, onRemoveFood, icon }) => {
  const total = items.reduce(
    (acc, item) => {
      const q = item.quantity || 1;
      acc.calories += (item.calories || 0) * q;
      acc.protein += (item.protein || 0) * q;
      acc.carbs += (item.carbs || 0) * q;
      acc.fat += (item.fat || 0) * q;
      return acc;
    },
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text style={styles.icon}>{icon}</Text>
          <View>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.subtitle}>{Math.round(total.calories)} kcal</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={onAddFood}>
          <Text style={styles.addBtnText}>+ Add</Text>
        </TouchableOpacity>
      </View>

      {items.length === 0 ? (
        <Text style={styles.emptyText}>No foods logged yet</Text>
      ) : (
        items.map((item) => (
          <View key={item.logId} style={styles.foodItem}>
            <View style={styles.foodInfo}>
              <Text style={styles.foodName}>{item.name}</Text>
              <Text style={styles.foodMeta}>
                {item.serving} × {item.quantity}
              </Text>
            </View>
            <View style={styles.foodRight}>
              <Text style={styles.foodCals}>{Math.round(item.calories * item.quantity)} kcal</Text>
              <TouchableOpacity onPress={() => onRemoveFood(item.logId)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Text style={styles.removeBtn}>✕</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))
      )}

      {items.length > 0 && (
        <View style={styles.macroRow}>
          <MacroPill label="P" value={total.protein} color={colors.protein} />
          <MacroPill label="C" value={total.carbs} color={colors.carbs} />
          <MacroPill label="F" value={total.fat} color={colors.fat} />
        </View>
      )}
    </View>
  );
};

const MacroPill = ({ label, value, color }) => (
  <View style={[styles.pill, { backgroundColor: color + '18' }]}>
    <Text style={[styles.pillText, { color }]}>
      {label} {Math.round(value)}g
    </Text>
  </View>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadow.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  icon: {
    fontSize: 26,
  },
  title: {
    ...typography.h4,
    color: colors.text,
  },
  subtitle: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  addBtn: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
  },
  addBtnText: {
    ...typography.label,
    color: colors.primary,
  },
  emptyText: {
    ...typography.bodySmall,
    color: colors.textLight,
    textAlign: 'center',
    paddingVertical: spacing.md,
    fontStyle: 'italic',
  },
  foodItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  foodInfo: {
    flex: 1,
  },
  foodName: {
    ...typography.body,
    color: colors.text,
    fontWeight: '500',
  },
  foodMeta: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  foodRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  foodCals: {
    ...typography.bodySmall,
    color: colors.primary,
    fontWeight: '600',
  },
  removeBtn: {
    color: colors.textLight,
    fontSize: 12,
  },
  macroRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginTop: spacing.sm,
    flexWrap: 'wrap',
  },
  pill: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.full,
  },
  pillText: {
    ...typography.caption,
    fontWeight: '600',
  },
});

export default MealCard;
