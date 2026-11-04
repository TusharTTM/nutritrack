import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  SafeAreaView, StatusBar
} from 'react-native';
import { useApp } from '../context/AppContext';
import { colors, spacing, radius, shadow, typography } from '../utils/theme';
import { mealTypes } from '../data/foods';
import { getDateKey, getTodayKey } from '../utils/helpers';

const mealIcons = { Breakfast: '🌅', Lunch: '☀️', Dinner: '🌙', Snacks: '🍎' };

const getLast7Days = () => {
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(getDateKey(d));
  }
  return days;
};

export default function DiaryScreen() {
  const { colors, theme, getLogsForDate, calcTotals, goals } = useApp();
  const [selectedDate, setSelectedDate] = useState(getTodayKey());

  const last7 = getLast7Days();
  const dayLogs = getLogsForDate(selectedDate);
  const totals = calcTotals(dayLogs);

  const formattedDate = new Date(selectedDate + 'T12:00:00').toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric',
  });

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle={theme === 'dark' ? 'light-content' : 'dark-content'} backgroundColor={colors.bg} />
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.pageHeader}>
          <Text style={styles.pageTitle}>Food Diary</Text>
        </View>

        {/* Date Selector */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.datePicker}
        >
          {last7.map(date => {
            const d = new Date(date + 'T12:00:00');
            const isSelected = date === selectedDate;
            const isToday = date === getTodayKey();
            const dayLogs = getLogsForDate(date);
            const hasFoods = Object.values(dayLogs).flat().length > 0;
            return (
              <TouchableOpacity
                key={date}
                style={[styles.dateChip, isSelected && styles.dateChipActive]}
                onPress={() => setSelectedDate(date)}
              >
                <Text style={[styles.dateChipDay, isSelected && styles.dateChipTextActive]}>
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d.getDay()]}
                </Text>
                <Text style={[styles.dateChipNum, isSelected && styles.dateChipTextActive]}>
                  {d.getDate()}
                </Text>
                {hasFoods && <View style={[styles.dot, isSelected && styles.dotActive]} />}
                {isToday && !isSelected && <Text style={styles.todayLabel}>Today</Text>}
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Date Title */}
        <Text style={styles.selectedDateLabel}>{formattedDate}</Text>

        {/* Daily Summary */}
        <View style={styles.summaryCard}>
          <SummaryItem label="Calories" value={Math.round(totals.calories)} goal={goals.calories} unit="kcal" color={colors.primary} />
          <SummaryItem label="Protein" value={Math.round(totals.protein)} goal={goals.protein} unit="g" color={colors.protein} />
          <SummaryItem label="Carbs" value={Math.round(totals.carbs)} goal={goals.carbs} unit="g" color={colors.carbs} />
          <SummaryItem label="Fat" value={Math.round(totals.fat)} goal={goals.fat} unit="g" color={colors.fat} />
        </View>

        {/* Meal Breakdown */}
        <View style={styles.mealsSection}>
          {mealTypes.map(meal => {
            const items = dayLogs[meal] || [];
            const mealCals = items.reduce((acc, i) => acc + (i.calories || 0) * (i.quantity || 1), 0);
            return (
              <View key={meal} style={styles.mealGroup}>
                <View style={styles.mealGroupHeader}>
                  <Text style={styles.mealGroupIcon}>{mealIcons[meal]}</Text>
                  <Text style={styles.mealGroupTitle}>{meal}</Text>
                  <Text style={styles.mealGroupCals}>{Math.round(mealCals)} kcal</Text>
                </View>
                {items.length === 0 ? (
                  <Text style={styles.emptyMeal}>Nothing logged</Text>
                ) : (
                  items.map(item => (
                    <View key={item.logId} style={styles.diaryItem}>
                      <View style={styles.diaryItemLeft}>
                        <Text style={styles.diaryItemName}>{item.name}</Text>
                        <Text style={styles.diaryItemMeta}>
                          {item.serving} × {item.quantity}  ·  P {Math.round(item.protein * item.quantity)}g  C {Math.round(item.carbs * item.quantity)}g  F {Math.round(item.fat * item.quantity)}g
                        </Text>
                      </View>
                      <Text style={styles.diaryItemCals}>{Math.round(item.calories * item.quantity)}</Text>
                    </View>
                  ))
                )}
              </View>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const SummaryItem = ({ label, value, goal, unit, color }) => {
  const pct = Math.min((value / goal) * 100, 100);
  return (
    <View style={styles.summaryItem}>
      <View style={styles.summaryItemHeader}>
        <Text style={styles.summaryItemLabel}>{label}</Text>
        <Text style={[styles.summaryItemValue, { color }]}>{value}<Text style={styles.summaryItemGoal}>/{goal}{unit}</Text></Text>
      </View>
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${pct}%`, backgroundColor: color }]} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, minWidth: 0, width: '100%', backgroundColor: colors.background },
  pageHeader: { paddingHorizontal: spacing.lg, paddingTop: spacing.lg, paddingBottom: spacing.sm },
  pageTitle: { ...typography.h1, color: colors.text },
  datePicker: { paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, gap: spacing.sm },
  dateChip: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: colors.card,
    minWidth: 56,
    ...shadow.sm,
  },
  dateChipActive: { backgroundColor: colors.primary },
  dateChipDay: { ...typography.caption, color: colors.textSecondary },
  dateChipNum: { ...typography.h4, color: colors.text, marginTop: 2 },
  dateChipTextActive: { color: colors.textInverse },
  dot: { width: 5, height: 5, borderRadius: 3, backgroundColor: colors.primary, marginTop: 3 },
  dotActive: { backgroundColor: colors.textInverse },
  todayLabel: { ...typography.caption, color: colors.primary, marginTop: 2, fontWeight: '600' },
  selectedDateLabel: {
    ...typography.h4,
    color: colors.textSecondary,
    paddingHorizontal: spacing.lg,
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
  },
  summaryCard: {
    backgroundColor: colors.card,
    marginHorizontal: spacing.md,
    borderRadius: radius.lg,
    padding: spacing.md,
    ...shadow.sm,
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  summaryItem: {},
  summaryItemHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  summaryItemLabel: { ...typography.bodySmall, color: colors.textSecondary },
  summaryItemValue: { ...typography.bodySmall, fontWeight: '700' },
  summaryItemGoal: { fontWeight: '400', color: colors.textLight },
  progressTrack: {
    height: 6,
    backgroundColor: colors.border,
    borderRadius: radius.full,
    overflow: 'hidden',
  },
  progressFill: { height: 6, borderRadius: radius.full },
  mealsSection: { paddingHorizontal: spacing.md, paddingBottom: spacing.xl },
  mealGroup: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    marginBottom: spacing.md,
    overflow: 'hidden',
    ...shadow.sm,
  },
  mealGroupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.background,
    gap: spacing.sm,
  },
  mealGroupIcon: { fontSize: 20 },
  mealGroupTitle: { ...typography.h4, color: colors.text, flex: 1 },
  mealGroupCals: { ...typography.bodySmall, color: colors.primary, fontWeight: '600' },
  emptyMeal: {
    ...typography.bodySmall,
    color: colors.textLight,
    padding: spacing.md,
    fontStyle: 'italic',
  },
  diaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  diaryItemLeft: { flex: 1 },
  diaryItemName: { ...typography.body, color: colors.text, fontWeight: '500' },
  diaryItemMeta: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },
  diaryItemCals: { ...typography.body, color: colors.primary, fontWeight: '700' },
});

