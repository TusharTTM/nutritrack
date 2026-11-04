import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  SafeAreaView, StatusBar, Modal, TextInput, FlatList, useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn, FadeInDown, FadeOut, LinearTransition, useReducedMotion } from 'react-native-reanimated';
import { useApp } from '../context/AppContext';
import CalorieRing from '../components/CalorieRing';

import Card from '../components/Card';
import SectionHeader from '../components/SectionHeader';
import EmptyState from '../components/EmptyState';
import { typography, spacing, radius } from '../utils/theme';
import { foodDatabase, mealTypes, mealIcons } from '../data/foods';
import { getGreeting, mlToDisplay, pct } from '../utils/helpers';

const HOME_ENTRANCE = {
  header: FadeInDown.duration(300),
  calorie: FadeInDown.duration(360).delay(60),
  macros: FadeInDown.duration(360).delay(130),
  actions: FadeInDown.duration(360).delay(200),
};
const PROGRESS_LAYOUT = LinearTransition.duration(360);
const MEAL_LAYOUT = LinearTransition.duration(220);
const MEAL_ENTER = FadeIn.duration(160);
const MEAL_EXIT = FadeOut.duration(120);
export default function HomeScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const reduceMotion = useReducedMotion();
  const {
    colors, theme, goals, getTodayLogs, addFoodLog, removeFoodLog,
    calcTotals, getTodayWater, addWater,
    getStreak, calcActivityCalories, getTodayActivities,
    customFoods, isFavorite, toggleFavorite, profile,
  } = useApp();

  const [foodModal, setFoodModal] = useState(false);
  const [selectedMeal, setSelectedMeal] = useState('Breakfast');
  const [search, setSearch] = useState('');
  const [selectedFood, setSelectedFood] = useState(null);
  const [qty, setQty] = useState('1');
  const [activeCategory, setActiveCategory] = useState('All');

  const todayLogs = getTodayLogs();
  const totals = calcTotals(todayLogs);
  const waterMl = getTodayWater();
  const streak = getStreak();
  const todayActivities = getTodayActivities();
  const caloriesBurned = calcActivityCalories(todayActivities);
  const allFoods = [...foodDatabase, ...customFoods];

  const categories = ['All', 'Recent', ...new Set(allFoods.map(f => f.category))];
  const recentFoods = profile.recentFoods || [];

  const filteredFoods = allFoods.filter(f => {
    const matchSearch = f.name.toLowerCase().includes(search.toLowerCase());
    if (activeCategory === 'All') return matchSearch;
    if (activeCategory === 'Recent') return recentFoods.some(r => r.id === f.id) && matchSearch;
    return f.category === activeCategory && matchSearch;
  });

  const openAddFood = useCallback((meal) => {
    setSelectedMeal(meal);
    setSearch('');
    setSelectedFood(null);
    setQty('1');
    setActiveCategory('All');
    setFoodModal(true);
  }, []);

  const handleAdd = useCallback(() => {
    if (!selectedFood) return;
    addFoodLog(selectedMeal, selectedFood, parseFloat(qty) || 1);
    setFoodModal(false);
  }, [selectedFood, selectedMeal, qty, addFoodLog]);

  const greeting = getGreeting(profile.name);
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });


  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]}>
      <StatusBar barStyle={theme === 'dark' ? 'light-content' : 'dark-content'} backgroundColor={colors.bg} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        <LinearGradient
          pointerEvents="none"
          colors={colors.backgroundGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 0.15, y: 1 }}
          style={StyleSheet.absoluteFillObject}
        />
        <Animated.View style={styles.header} entering={reduceMotion ? undefined : HOME_ENTRANCE.header}>
          <View style={styles.headerGreeting}>
            <Text numberOfLines={1} style={[typography.caption, styles.headerDate, { color: colors.textMuted }]}>{today}</Text>
            <Text numberOfLines={1} ellipsizeMode="tail" style={[styles.headerTitle, { color: colors.text }]}>{greeting}</Text>
          </View>
          <View style={styles.headerActions}>
            {streak > 0 && (
              <View style={[styles.streakBadge, { backgroundColor: colors.primarySurface, borderColor: colors.cardBorder }]}>
                <Ionicons name="flame" size={15} color={colors.warning} />
                <Text style={[typography.micro, { color: colors.primaryLight }]}>{streak} day streak</Text>
              </View>
            )}
          </View>
        </Animated.View>
        <Animated.View entering={reduceMotion ? undefined : HOME_ENTRANCE.calorie}>
        <Card style={styles.calorieCard} elevated>
          <View style={styles.cardTitleRow}>
            <View>
              <Text style={[typography.h3, { color: colors.text }]}>Daily calories</Text>
            </View>
            <View style={[styles.goalBadge, { backgroundColor: colors.primarySurface, borderColor: colors.cardBorder }]}>
              <Ionicons name="flag-outline" size={13} color={colors.primary} />
              <Text style={[typography.micro, { color: colors.primaryLight }]}>Goal {goals.calories} kcal</Text>
            </View>
          </View>

          <View style={styles.calorieRow}>
            <CalorieRing
              consumed={totals.calories}
              goal={goals.calories}
              burned={caloriesBurned}
              size={Math.min(142, Math.max(118, width - 224))}
            />
            <View style={styles.calorieSide}>
              <Text style={[typography.caption, { color: colors.textMuted }]}>From food</Text>
              <Text style={[typography.displayMd, styles.intakeValue, { color: colors.text }]}>{Math.round(totals.calories)}</Text>
              <Text style={[typography.bodySm, { color: colors.textMuted, marginTop: -2 }]}>kcal eaten</Text>
              <View style={styles.burnedRow}>
                <Ionicons name="flame-outline" size={13} color={colors.warning} />
                <Text style={[typography.caption, { color: colors.textSecondary, marginLeft: 4 }]}>{Math.round(caloriesBurned)} burned</Text>
              </View>
            </View>
          </View>
        </Card>

        </Animated.View>
        <Animated.View entering={reduceMotion ? undefined : HOME_ENTRANCE.macros}>
        <View style={styles.sectionIntro}>
          <View>
            <Text style={[typography.h3, { color: colors.text }]}>Nutrition</Text>
            <Text style={[typography.bodySm, { color: colors.textMuted, marginTop: 2 }]}>Daily macro progress</Text>
          </View>
          <Ionicons name="nutrition-outline" size={19} color={colors.primary} />
        </View>
        <View style={styles.macroGrid}>
          <View style={styles.macroCol}>
            <MacroTile label="Protein" value={totals.protein} goal={goals.protein} color={colors.protein} colors={colors} reduceMotion={reduceMotion} />
            <MacroTile label="Carbs" value={totals.carbs} goal={goals.carbs} color={colors.carbs} colors={colors} reduceMotion={reduceMotion} />
          </View>
          <View style={styles.macroCol}>
            <MacroTile label="Fat" value={totals.fat} goal={goals.fat} color={colors.fat} colors={colors} reduceMotion={reduceMotion} />
            <MacroTile label="Fiber" value={totals.fiber} goal={goals.fiber} color={colors.fiber} colors={colors} reduceMotion={reduceMotion} />
          </View>
        </View>

        </Animated.View>
        <Animated.View entering={reduceMotion ? undefined : HOME_ENTRANCE.actions}>
        <View style={[styles.statsRow, width < 380 && styles.statsStack]}>
          <Card style={[styles.halfCard, width < 380 && styles.halfCardStack]} elevated>
            <View style={styles.halfCardHeader}>
              <Ionicons name="water" size={18} color={colors.water} />
              <Text style={[typography.h4, { color: colors.text, marginLeft: 6 }]}>Water</Text>
            </View>
            <Text style={[typography.h2, { color: colors.water, marginTop: 4 }]}>
              {mlToDisplay(waterMl)}
            </Text>
            <Text style={[typography.micro, { color: colors.textMuted }]}>
              / {mlToDisplay(goals.water)} goal
            </Text>
            <View style={[styles.miniBar, { backgroundColor: colors.cardBorder, marginTop: 8 }]}>
              <Animated.View layout={reduceMotion ? undefined : PROGRESS_LAYOUT} style={[styles.miniBarFill, {
                width: (Math.min(pct(waterMl, goals.water), 1) * 100) + '%',
                backgroundColor: colors.water,
              }]} />
            </View>
            <View style={styles.waterBtns}>
              {[250, 500, 1000].map(ml => (
                <TouchableOpacity
                  key={ml}
                  style={[styles.waterBtn, { backgroundColor: colors.primarySurface, borderColor: colors.cardBorder }]}
                  onPress={() => addWater(ml)}
                >
                  <Text numberOfLines={1} style={[typography.micro, { color: colors.water }]}>+{ml}ml</Text>
                </TouchableOpacity>
              ))}
            </View>
          </Card>

          <Card style={[styles.halfCard, width < 380 && styles.halfCardStack]} elevated>
            <View style={styles.halfCardHeader}>
              <Ionicons name="flame" size={18} color={colors.warning} />
              <Text style={[typography.h4, { color: colors.text, marginLeft: 6 }]}>Activity</Text>
            </View>
            <Text style={[typography.h2, { color: colors.warning, marginTop: 4 }]}>
              {Math.round(caloriesBurned)}
            </Text>
            <Text style={[typography.micro, { color: colors.textMuted }]}>kcal burned</Text>
            <Text style={[typography.bodySm, { color: colors.textSecondary, marginTop: 8 }]} numberOfLines={1}>
              {todayActivities.length === 0
                ? 'No activity logged'
                : (todayActivities.length + ' workout' + (todayActivities.length > 1 ? 's' : '') + ' today')}
            </Text>
            <TouchableOpacity
              style={[styles.logActivityBtn, { backgroundColor: colors.primarySurface, borderColor: colors.cardBorder }]}
              onPress={() => router.navigate('/activity')}
            >
              <Text style={[typography.micro, { color: colors.primaryLight }]}>Log activity</Text>
            </TouchableOpacity>
          </Card>
        </View>

        </Animated.View>
        {/* ── Today's Meals ────────────────────────────────────── */}
        <SectionHeader title="Today's Meals" subtitle="Tap + to add food" />

        {mealTypes.map(meal => {
          const items = todayLogs[meal] || [];
          const mealCals = items.reduce((s, i) => s + (i.calories || 0) * (i.quantity || 1), 0);
          return (
            <MealSection
              key={meal}
              meal={meal}
              icon={mealIcons[meal]}
              items={items}
              mealCals={mealCals}
              colors={colors}
              onAdd={() => openAddFood(meal)}
              onRemove={(logId) => removeFoodLog(meal, logId)}
              reduceMotion={reduceMotion}
            />
          );
        })}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* ── Add Food Modal ───────────────────────────────────── */}
      <Modal visible={foodModal} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={[styles.modal, { backgroundColor: colors.bg }]}>
          {/* Modal header */}
          <View style={[styles.modalHeader, { borderBottomColor: colors.cardBorder }]}>
            <TouchableOpacity onPress={() => setFoodModal(false)}>
              <Text style={[typography.bodyMed, { color: colors.textSecondary }]}>Cancel</Text>
            </TouchableOpacity>
            <Text style={[typography.h3, { color: colors.text }]}>Add to {selectedMeal}</Text>
            <TouchableOpacity onPress={handleAdd} disabled={!selectedFood}>
              <Text style={[typography.bodyMed, { color: selectedFood ? colors.primary : colors.textMuted }]}>Add</Text>
            </TouchableOpacity>
          </View>

          {/* Search */}
          <View style={[styles.searchRow, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <Ionicons name="search" size={16} color={colors.textMuted} style={{ marginRight: 8 }} />
            <TextInput
              style={[styles.searchInput, { color: colors.text }]}
              placeholder="Search foods..."
              placeholderTextColor={colors.textMuted}
              value={search}
              onChangeText={setSearch}
            />
            {search.length > 0 && (
              <TouchableOpacity onPress={() => setSearch('')}>
                <Ionicons name="close-circle" size={16} color={colors.textMuted} />
              </TouchableOpacity>
            )}
          </View>

          {/* Category pills */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.catRow}>
            {categories.map(cat => (
              <TouchableOpacity
                key={cat}
                style={[styles.catPill, {
                  backgroundColor: activeCategory === cat ? colors.primary : colors.card,
                  borderColor: activeCategory === cat ? colors.primary : colors.cardBorder,
                }]}
                onPress={() => setActiveCategory(cat)}
              >
                <Text style={[typography.micro, { color: activeCategory === cat ? colors.textInverse : colors.textSecondary }]}>
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Selected food preview */}
          {selectedFood && (
            <View style={[styles.selectedCard, { backgroundColor: colors.primarySurface, borderColor: colors.primary + '40' }]}>
              <View style={styles.selectedTop}>
                <View style={{ flex: 1 }}>
                  <Text style={[typography.h4, { color: colors.primaryLight }]}>{selectedFood.name}</Text>
                  <Text style={[typography.bodySm, { color: colors.textSecondary, marginTop: 2 }]}>{selectedFood.serving}</Text>
                </View>
                <TouchableOpacity onPress={() => toggleFavorite(selectedFood.id)}>
                  <Ionicons
                    name={isFavorite(selectedFood.id) ? 'heart' : 'heart-outline'}
                    size={20}
                    color={isFavorite(selectedFood.id) ? '#FF6B9D' : colors.textMuted}
                  />
                </TouchableOpacity>
              </View>
              <View style={styles.qtyRow}>
                <TouchableOpacity
                  style={[styles.qtyBtn, { backgroundColor: colors.primary }]}
                  onPress={() => setQty(q => String(Math.max(0.5, parseFloat(q) - 0.5)))}
                >
                  <Ionicons name="remove" size={16} color={colors.textInverse} />
                </TouchableOpacity>
                <TextInput
                  style={[styles.qtyInput, { color: colors.text, borderBottomColor: colors.primary }]}
                  value={qty}
                  onChangeText={setQty}
                  keyboardType="decimal-pad"
                  selectTextOnFocus
                />
                <TouchableOpacity
                  style={[styles.qtyBtn, { backgroundColor: colors.primary }]}
                  onPress={() => setQty(q => String(parseFloat(q) + 0.5))}
                >
                  <Ionicons name="add" size={16} color={colors.textInverse} />
                </TouchableOpacity>
                <Text style={[typography.bodySm, { color: colors.textMuted, marginLeft: spacing.sm }]}>× serving</Text>
              </View>
              <View style={styles.nutriRow}>
                {[
                  { l: 'Cal', v: Math.round(selectedFood.calories * (parseFloat(qty)||1)), c: colors.primaryLight },
                  { l: 'Protein', v: `${Math.round(selectedFood.protein * (parseFloat(qty)||1))}g`, c: colors.protein },
                  { l: 'Carbs', v: `${Math.round(selectedFood.carbs * (parseFloat(qty)||1))}g`, c: colors.carbs },
                  { l: 'Fat', v: `${Math.round(selectedFood.fat * (parseFloat(qty)||1))}g`, c: colors.fat },
                ].map(n => (
                  <View key={n.l} style={[styles.nutriChip, { backgroundColor: n.c + '18' }]}>
                    <Text style={[typography.h4, { color: n.c }]}>{n.v}</Text>
                    <Text style={[typography.micro, { color: colors.textMuted }]}>{n.l}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Food list */}
          <FlatList
            data={filteredFoods}
            keyExtractor={item => item.id}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.foodRow, {
                  backgroundColor: selectedFood?.id === item.id ? colors.primarySurface : 'transparent',
                  borderBottomColor: colors.cardBorder,
                }]}
                onPress={() => setSelectedFood(item)}
              >
                <View style={{ flex: 1 }}>
                  <Text style={[typography.bodyMed, { color: colors.text }]}>{item.name}</Text>
                  <Text style={[typography.caption, { color: colors.textMuted, marginTop: 2 }]}>{item.serving} · {item.category}</Text>
                </View>
                <View style={styles.foodRowRight}>
                  <Text style={[typography.bodySmMed, { color: colors.primary }]}>{item.calories}</Text>
                  <Text style={[typography.micro, { color: colors.textMuted }]}>kcal</Text>
                </View>
                {isFavorite(item.id) && <Ionicons name="heart" size={12} color="#FF6B9D" style={{ marginLeft: 6 }} />}
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              <EmptyState icon="search-outline" title="No foods found" subtitle="Try a different search term" />
            }
          />
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────

function MacroTile({ label, value, goal, color, colors, reduceMotion }) {
  const progress = Math.min(value / (goal || 1), 1);
  const over = value > goal;
  return (
    <Card style={styles.macroTile} elevated noPad>
      <View style={styles.macroName}>
        <View style={[styles.macroDot, { backgroundColor: color }]} />
        <Text numberOfLines={1} style={[typography.bodySmMed, { color: colors.textSecondary }]}>{label}</Text>
      </View>
      <Text style={[typography.h3, { color, marginTop: 8 }]}>
        {Math.round(value)}
        <Text style={[typography.caption, { color: colors.textMuted }]}> / {goal}g</Text>
      </Text>
      <View style={[styles.miniBar, { backgroundColor: colors.cardBorder, marginTop: 8 }]}>
        <Animated.View layout={reduceMotion ? undefined : PROGRESS_LAYOUT} style={[styles.miniBarFill, {
          width: (progress * 100) + '%',
          backgroundColor: over ? colors.error : color,
        }]} />
      </View>
    </Card>
  );
}
function MealSection({ meal, icon, items, mealCals, colors, onAdd, onRemove, reduceMotion }) {
  const [expanded, setExpanded] = useState(true);
  return (
    <Animated.View layout={reduceMotion ? undefined : MEAL_LAYOUT}>
    <Card style={styles.mealCard} elevated>
      <TouchableOpacity style={styles.mealHeader} onPress={() => setExpanded(e => !e)} activeOpacity={0.7}>
        <Text style={{ fontSize: 22 }}>{icon}</Text>
        <View style={{ flex: 1, marginLeft: spacing.sm }}>
          <Text style={[typography.h4, { color: colors.text }]}>{meal}</Text>
          {items.length > 0 && (
            <Text style={[typography.caption, { color: colors.textMuted }]}>
              {items.length} item{items.length > 1 ? 's' : ''} · {Math.round(mealCals)} kcal
            </Text>
          )}
        </View>
        <TouchableOpacity
          style={[styles.addFoodBtn, { backgroundColor: colors.primaryMuted, borderColor: colors.primary + '40' }]}
          onPress={onAdd}
        >
          <Ionicons name="add" size={16} color={colors.primary} />
          <Text style={[typography.micro, { color: colors.primary, marginLeft: 3 }]}>ADD</Text>
        </TouchableOpacity>
        <Ionicons
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={16}
          color={colors.textMuted}
          style={{ marginLeft: 8 }}
        />
      </TouchableOpacity>

      {expanded && (
        <Animated.View entering={reduceMotion ? undefined : MEAL_ENTER} exiting={reduceMotion ? undefined : MEAL_EXIT}>
          {items.length === 0 ? (
            <Text style={[typography.bodySm, { color: colors.textMuted, fontStyle: 'italic', paddingVertical: spacing.sm }]}>
              Nothing logged yet
            </Text>
          ) : (
            items.map(item => (
              <View key={item.logId} style={[styles.foodLogItem, { borderTopColor: colors.cardBorder }]}>
                <View style={{ flex: 1 }}>
                  <Text style={[typography.bodyMed, { color: colors.text }]}>{item.name}</Text>
                  <Text style={[typography.caption, { color: colors.textMuted }]}>
                    {item.serving} × {item.quantity}
                  </Text>
                </View>
                <Text style={[typography.bodySmMed, { color: colors.primaryLight }]}>
                  {Math.round(item.calories * item.quantity)} kcal
                </Text>
                <TouchableOpacity
                  onPress={() => onRemove(item.logId)}
                  hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                  style={{ marginLeft: spacing.sm }}
                >
                  <Ionicons name="trash-outline" size={14} color={colors.textMuted} />
                </TouchableOpacity>
              </View>
            ))
          )}
        </Animated.View>
      )}
    </Card>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, minWidth: 0, width: '100%' },
  scroll: { paddingHorizontal: spacing.md, paddingTop: spacing.md, paddingBottom: spacing.lg },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  headerGreeting: { flex: 1, minWidth: 0, marginRight: spacing.sm },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  headerDate: { marginBottom: 3 },
  headerTitle: { fontSize: 25, fontWeight: '700', letterSpacing: -0.6 },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    borderWidth: 1,
  },
  calorieCard: { marginBottom: spacing.lg },
  cardTitleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.md },
  goalBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: spacing.sm, paddingVertical: 7, borderRadius: radius.full, borderWidth: 1 },
  calorieRow: { flexDirection: 'row', alignItems: 'center' },
  calorieSide: { flex: 1, minWidth: 0, marginLeft: spacing.md, alignItems: 'flex-start' },
  intakeValue: { marginTop: 2, lineHeight: 34 },
  burnedRow: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.sm },
  sectionIntro: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.sm },
  macroGrid: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.lg },
  macroCol: { flex: 1, minWidth: 0, gap: spacing.sm },
  macroTile: { padding: spacing.sm + 2 },
  macroName: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  macroDot: { width: 7, height: 7, borderRadius: radius.full },
  statsRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.lg },
  statsStack: { flexDirection: 'column' },
  halfCard: { flex: 1 },
  halfCardStack: { flex: 0, width: '100%' },
  halfCardHeader: { flexDirection: 'row', alignItems: 'center' },
  miniBar: { height: 5, borderRadius: radius.full, overflow: 'hidden' },
  miniBarFill: { height: 5, borderRadius: radius.full },
  waterBtns: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginTop: spacing.sm },
  waterBtn: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: radius.full,
    borderWidth: 1,
  },
  logActivityBtn: {
    marginTop: spacing.sm,
    paddingVertical: 8,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.full,
    borderWidth: 1,
    alignItems: 'center',
  },
  mealCard: { marginBottom: spacing.sm },
  mealHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addFoodBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: 5,
    borderRadius: radius.full,
    borderWidth: 1,
    marginLeft: spacing.sm,
  },
  foodLogItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: spacing.sm,
    marginTop: spacing.sm,
    borderTopWidth: 1,
  },
  // Modal
  modal: { flex: 1 },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  searchInput: { flex: 1, ...typography.body, padding: 0 },
  catRow: { paddingHorizontal: spacing.md, paddingBottom: spacing.sm, gap: spacing.xs },
  catPill: {
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radius.full,
    borderWidth: 1,
  },
  selectedCard: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
  },
  selectedTop: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: spacing.sm },
  qtyRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm },
  qtyBtn: { width: 32, height: 32, borderRadius: radius.full, alignItems: 'center', justifyContent: 'center' },
  qtyInput: {
    width: 48,
    textAlign: 'center',
    ...typography.h3,
    borderBottomWidth: 2,
    paddingBottom: 2,
  },
  nutriRow: { flexDirection: 'row', gap: spacing.xs },
  nutriChip: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.xs + 2,
    borderRadius: radius.sm,
  },
  foodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
  },
  foodRowRight: { alignItems: 'flex-end', marginLeft: spacing.sm },
});
