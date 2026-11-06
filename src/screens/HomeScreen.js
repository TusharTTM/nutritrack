import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, Pressable,
  SafeAreaView, StatusBar, Modal, TextInput, FlatList, useWindowDimensions, Alert } from 'react-native';
import AppTouchable from '../components/AppTouchable';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  FadeIn, FadeInDown, FadeOut, LinearTransition, useReducedMotion,
  useSharedValue, useAnimatedStyle, useAnimatedScrollHandler, interpolate,
  withRepeat, withTiming, Easing,
} from 'react-native-reanimated';
import { useApp } from '../context/AppContext';
import CalorieRing from '../components/CalorieRing';
import Card from '../components/Card';
import SectionHeader from '../components/SectionHeader';
import EmptyState from '../components/EmptyState';
import { gradients, typography, spacing, radius } from '../utils/theme';
import { foodDatabase } from '../data/foods';
import { getGreeting, mlToDisplay, pct } from '../utils/helpers';
import MealGlyph, { mealColor } from '../components/MealGlyph';
import { LogoMark } from '../components/Logo';
import DailyInsight from '../components/DailyInsight';
import AuroraBackground from '../components/AuroraBackground';
import AnimatedNumber from '../components/AnimatedNumber';

const HOME_ENTRANCE = {
  header: FadeInDown.duration(320),
  calorie: FadeInDown.duration(380).delay(60),
  macros: FadeInDown.duration(380).delay(130),
  actions: FadeInDown.duration(380).delay(200),
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
    mealTypes, addMealType, renameMealType, removeMealType,
  } = useApp();

  const [foodModal, setFoodModal] = useState(false);
  const [selectedMeal, setSelectedMeal] = useState('Breakfast');
  const [search, setSearch] = useState('');
  const [selectedFood, setSelectedFood] = useState(null);
  const [qty, setQty] = useState('1');
  const [activeCategory, setActiveCategory] = useState('All');
  const [mealEditor, setMealEditor] = useState(null); // { mode, original, value }
  const [mealEditorError, setMealEditorError] = useState('');

  const defaultMeals = ['Breakfast', 'Lunch', 'Dinner', 'Snacks'];
  const isCustomMeal = (meal) => !defaultMeals.includes(meal);

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

  const submitMealEditor = useCallback(async () => {
    const value = (mealEditor?.value || '').trim();
    if (!value) { setMealEditorError('Enter a name for this meal.'); return; }
    const ok = mealEditor.mode === 'add'
      ? await addMealType(value)
      : await renameMealType(mealEditor.original, value);
    if (!ok) { setMealEditorError('That name is already used.'); return; }
    setMealEditor(null);
    setMealEditorError('');
  }, [mealEditor, addMealType, renameMealType]);

  const confirmDeleteMeal = useCallback((name) => {
    Alert.alert(
      'Delete meal?',
      `"${name}" and everything logged under it will be removed.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => removeMealType(name) },
      ],
    );
  }, [removeMealType]);

  const initials = profile.name
    ? profile.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : '';

  const greeting = getGreeting(profile.name);

  // Scroll-linked header parallax (fades + lifts as you scroll).
  const scrollY = useSharedValue(0);
  const onScroll = useAnimatedScrollHandler((e) => { scrollY.value = e.contentOffset.y; });
  const headerAnim = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY.value, [0, 90], [1, 0.12]),
    transform: [{ translateY: interpolate(scrollY.value, [0, 90], [0, -12]) }],
  }));

  const wide = width >= 900;
  const ringSize = Math.min(148, Math.max(118, width - 260));

  const enter = (key) => (reduceMotion ? undefined : HOME_ENTRANCE[key]);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]}>
      <StatusBar barStyle={theme === 'dark' ? 'light-content' : 'dark-content'} backgroundColor={colors.bg} />

      <Animated.ScrollView
        onScroll={onScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        <LinearGradient
          pointerEvents="none"
          colors={colors.backgroundGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 0.15, y: 1 }}
          style={StyleSheet.absoluteFillObject}
        />
        <AuroraBackground />

        {/* ── Top bar ────────────────────────────────────────── */}
        <Animated.View entering={enter('header')}>
          <Animated.View style={[styles.topBar, headerAnim]}>
            <LogoMark size={42} />
            <View style={styles.headerActions}>
              {streak > 0 && (
                <View style={[styles.streakBadge, { backgroundColor: colors.primarySurface, borderColor: colors.cardBorder }]}>
                  <Ionicons name="flame" size={15} color={colors.warning} />
                  <Text style={[typography.micro, { color: colors.primaryLight }]}>{streak} day streak</Text>
                </View>
              )}
              <AppTouchable
                style={[styles.avatarBtn, { backgroundColor: colors.primarySurface, borderColor: colors.primary + '55' }]}
                onPress={() => router.navigate('/profile')}
                accessibilityRole="button"
                accessibilityLabel="Open profile"
              >
                {initials
                  ? <Text style={[typography.h4, { color: colors.primaryLight }]}>{initials}</Text>
                  : <Ionicons name="person" size={18} color={colors.primary} />}
              </AppTouchable>
            </View>
          </Animated.View>
        </Animated.View>

        {/* ── Editorial hero ─────────────────────────────────── */}
        <Animated.View entering={enter('header')}>
          <HeroBanner
            greeting={greeting}
            streak={streak}
            onLogMeal={() => openAddFood('Breakfast')}
            onProgress={() => router.navigate('/progress')}
          />
        </Animated.View>

        {/* ── Dashboard (responsive) ─────────────────────────── */}
        {wide ? (
          <Animated.View entering={enter('calorie')} style={styles.wideWrap}>
            <View style={styles.wideMain}>
              <CalorieHero totals={totals} goals={goals} burned={caloriesBurned} ringSize={ringSize} colors={colors} />
              <DailyInsight totals={totals} goals={goals} waterMl={waterMl} />
            </View>
            <View style={styles.wideSide}>
              <NutritionMacros totals={totals} goals={goals} colors={colors} reduceMotion={reduceMotion} />
              <QuickStats
                waterMl={waterMl} goals={goals} addWater={addWater}
                burned={caloriesBurned} activities={todayActivities}
                router={router} colors={colors} reduceMotion={reduceMotion} stacked
              />
            </View>
          </Animated.View>
        ) : (
          <>
            <Animated.View entering={enter('calorie')}>
              <CalorieHero totals={totals} goals={goals} burned={caloriesBurned} ringSize={ringSize} colors={colors} />
            </Animated.View>
            <Animated.View entering={enter('macros')}>
              <NutritionMacros totals={totals} goals={goals} colors={colors} reduceMotion={reduceMotion} />
            </Animated.View>
            <Animated.View entering={enter('actions')}>
              <QuickStats
                waterMl={waterMl} goals={goals} addWater={addWater}
                burned={caloriesBurned} activities={todayActivities}
                router={router} colors={colors} reduceMotion={reduceMotion}
                stacked={width < 380}
              />
            </Animated.View>
            <DailyInsight totals={totals} goals={goals} waterMl={waterMl} />
          </>
        )}

        {/* ── Today's Meals ──────────────────────────────────── */}
        <SectionHeader title="Today's Meals" subtitle="Tap + to add food" />

        <View style={[styles.mealsWrap, wide && styles.mealsWrapWide]}>
          {mealTypes.map((meal, index) => {
            const items = todayLogs[meal] || [];
            const mealCals = items.reduce((s, i) => s + (i.calories || 0) * (i.quantity || 1), 0);
            return (
              <View key={meal} style={wide && styles.mealCol}>
                <MealSection
                  meal={meal}
                  index={index}
                  items={items}
                  mealCals={mealCals}
                  colors={colors}
                  onAdd={() => openAddFood(meal)}
                  onRemove={(logId) => removeFoodLog(meal, logId)}
                  onEdit={isCustomMeal(meal)
                    ? () => { setMealEditorError(''); setMealEditor({ mode: 'rename', original: meal, value: meal }); }
                    : undefined}
                  reduceMotion={reduceMotion}
                />
              </View>
            );
          })}
        </View>

        <AppTouchable
          onPress={() => { setMealEditorError(''); setMealEditor({ mode: 'add', original: null, value: '' }); }}
          style={[styles.addMealBtn, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
          accessibilityLabel="Add another meal"
        >
          <Ionicons name="add-circle-outline" size={20} color={colors.primary} />
          <Text style={[typography.bodyMed, { color: colors.primary, marginLeft: spacing.sm }]}>Add another meal</Text>
        </AppTouchable>

        <View style={{ height: 100 }} />
      </Animated.ScrollView>

      {/* ── Add Food Modal ───────────────────────────────────── */}
      <Modal visible={foodModal} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={[styles.modal, { backgroundColor: colors.bg }]}>
          <View style={[styles.modalHeader, { borderBottomColor: colors.cardBorder }]}>
            <AppTouchable onPress={() => setFoodModal(false)}>
              <Text style={[typography.bodyMed, { color: colors.textSecondary }]}>Cancel</Text>
            </AppTouchable>
            <Text style={[typography.h3, { color: colors.text }]}>Add to {selectedMeal}</Text>
            <AppTouchable onPress={handleAdd} disabled={!selectedFood}>
              <Text style={[typography.bodyMed, { color: selectedFood ? colors.primary : colors.textMuted }]}>Add</Text>
            </AppTouchable>
          </View>

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
              <AppTouchable onPress={() => setSearch('')}>
                <Ionicons name="close-circle" size={16} color={colors.textMuted} />
              </AppTouchable>
            )}
          </View>

          <Animated.ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.catRow}>
            {categories.map(cat => (
              <Pressable
                key={cat}
                style={({ hovered }) => [
                  styles.catPill,
                  {
                    backgroundColor: activeCategory === cat ? colors.primary : colors.card,
                    borderColor: activeCategory === cat
                      ? colors.primary
                      : hovered ? colors.primary + '66' : colors.cardBorder,
                  },
                  hovered && activeCategory !== cat && { transform: [{ translateY: -1 }] },
                ]}
                onPress={() => setActiveCategory(cat)}
              >
                <Text style={[typography.micro, { color: activeCategory === cat ? colors.textInverse : colors.textSecondary }]}>
                  {cat}
                </Text>
              </Pressable>
            ))}
          </Animated.ScrollView>

          {selectedFood && (
            <View style={[styles.selectedCard, { backgroundColor: colors.primarySurface, borderColor: colors.primary + '40' }]}>
              <View style={styles.selectedTop}>
                <View style={{ flex: 1 }}>
                  <Text style={[typography.h4, { color: colors.primaryLight }]}>{selectedFood.name}</Text>
                  <Text style={[typography.bodySm, { color: colors.textSecondary, marginTop: 2 }]}>{selectedFood.serving}</Text>
                </View>
                <AppTouchable onPress={() => toggleFavorite(selectedFood.id)}>
                  <Ionicons
                    name={isFavorite(selectedFood.id) ? 'heart' : 'heart-outline'}
                    size={20}
                    color={isFavorite(selectedFood.id) ? '#FF6B9D' : colors.textMuted}
                  />
                </AppTouchable>
              </View>
              <View style={styles.qtyRow}>
                <AppTouchable
                  style={[styles.qtyBtn, { backgroundColor: colors.primary }]}
                  onPress={() => setQty(q => String(Math.max(0.5, parseFloat(q) - 0.5)))}
                >
                  <Ionicons name="remove" size={16} color={colors.textInverse} />
                </AppTouchable>
                <TextInput
                  style={[styles.qtyInput, { color: colors.text, borderBottomColor: colors.primary }]}
                  value={qty}
                  onChangeText={setQty}
                  keyboardType="decimal-pad"
                  selectTextOnFocus
                />
                <AppTouchable
                  style={[styles.qtyBtn, { backgroundColor: colors.primary }]}
                  onPress={() => setQty(q => String(parseFloat(q) + 0.5))}
                >
                  <Ionicons name="add" size={16} color={colors.textInverse} />
                </AppTouchable>
                <Text style={[typography.bodySm, { color: colors.textMuted, marginLeft: spacing.sm }]}>× serving</Text>
              </View>
              <View style={styles.nutriRow}>
                {[
                  { l: 'Cal', v: Math.round(selectedFood.calories * (parseFloat(qty) || 1)), c: colors.primaryLight },
                  { l: 'Protein', v: `${Math.round(selectedFood.protein * (parseFloat(qty) || 1))}g`, c: colors.protein },
                  { l: 'Carbs', v: `${Math.round(selectedFood.carbs * (parseFloat(qty) || 1))}g`, c: colors.carbs },
                  { l: 'Fat', v: `${Math.round(selectedFood.fat * (parseFloat(qty) || 1))}g`, c: colors.fat },
                ].map(n => (
                  <View key={n.l} style={[styles.nutriChip, { backgroundColor: n.c + '18' }]}>
                    <Text style={[typography.h4, { color: n.c }]}>{n.v}</Text>
                    <Text style={[typography.micro, { color: colors.textMuted }]}>{n.l}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          <FlatList
            data={filteredFoods}
            keyExtractor={item => item.id}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item }) => (
              <Pressable
                style={({ hovered, pressed }) => [
                  styles.foodRow,
                  {
                    backgroundColor: selectedFood?.id === item.id
                      ? colors.primarySurface
                      : hovered ? colors.cardBorder : 'transparent',
                    borderBottomColor: colors.cardBorder,
                  },
                  pressed && { opacity: 0.85 },
                ]}
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
              </Pressable>
            )}
            ListEmptyComponent={
              <EmptyState icon="search-outline" title="No foods found" subtitle="Try a different search term" />
            }
          />
        </SafeAreaView>
      </Modal>

      {/* ── Meal type editor ─────────────────────────────────── */}
      <Modal visible={!!mealEditor} transparent animationType="fade">
        <View style={styles.mealEditorOverlay}>
          <View style={[styles.mealEditorCard, { backgroundColor: colors.cardElevated, borderColor: colors.cardBorder }]}>
            <Text style={[typography.h3, { color: colors.text, marginBottom: spacing.md }]}>
              {mealEditor?.mode === 'rename' ? 'Rename meal' : 'New meal'}
            </Text>
            <TextInput
              style={[styles.mealEditorInput, { color: colors.text, backgroundColor: colors.bgSecondary, borderColor: colors.cardBorder }]}
              placeholder="e.g. Brunch, Post-workout"
              placeholderTextColor={colors.textMuted}
              value={mealEditor?.value || ''}
              onChangeText={v => setMealEditor(m => (m ? { ...m, value: v } : m))}
              autoFocus
              maxLength={24}
              returnKeyType="done"
              onSubmitEditing={submitMealEditor}
            />
            {mealEditorError ? <Text style={[typography.caption, { color: colors.error, marginTop: spacing.xs }]}>{mealEditorError}</Text> : null}
            <View style={styles.mealEditorBtns}>
              <AppTouchable style={[styles.mealEditorBtn, { backgroundColor: colors.bgTertiary }]} onPress={() => setMealEditor(null)}>
                <Text style={[typography.bodyMed, { color: colors.textSecondary }]}>Cancel</Text>
              </AppTouchable>
              <AppTouchable style={[styles.mealEditorBtn, { backgroundColor: colors.primary }]} onPress={submitMealEditor}>
                <Text style={[typography.bodyMed, { color: colors.textInverse }]}>Save</Text>
              </AppTouchable>
            </View>
            {mealEditor?.mode === 'rename' && (
              <AppTouchable
                style={styles.mealEditorDelete}
                onPress={() => { const original = mealEditor.original; setMealEditor(null); confirmDeleteMeal(original); }}
              >
                <Ionicons name="trash-outline" size={15} color={colors.error} />
                <Text style={[typography.bodySmMed, { color: colors.error, marginLeft: 6 }]}>Delete this meal</Text>
              </AppTouchable>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// ── Editorial hero (dark ink panel + vivid lime, 3D tilt) ──────────────────
const HERO = { ink: '#0E100B', ink2: '#161A10', lime: '#C6F24E', paper: '#F2F4EC', sub: '#B9C0AC', teal: '#4FD6C6' };
function HeroBanner({ greeting, streak, onLogMeal, onProgress }) {
  const { width } = useWindowDimensions();
  const heroSize = Math.max(38, Math.min(52, Math.round(width * 0.115)));
  const titleLine = { fontSize: heroSize, lineHeight: heroSize * 1.03 };

  // Ambient loops: pulsing glow, 3D-floating deco ring, CTA shimmer sweep.
  const pulse = useSharedValue(0);
  const float = useSharedValue(0);
  const shimmer = useSharedValue(0);
  useEffect(() => {
    pulse.value = withRepeat(withTiming(1, { duration: 4200, easing: Easing.inOut(Easing.ease) }), -1, true);
    float.value = withRepeat(withTiming(1, { duration: 6500, easing: Easing.inOut(Easing.ease) }), -1, true);
    shimmer.value = withRepeat(withTiming(1, { duration: 2600, easing: Easing.linear }), -1, false);
  }, [pulse, float, shimmer]);
  const glowAnim = useAnimatedStyle(() => ({
    transform: [{ scale: interpolate(pulse.value, [0, 1], [1, 1.12]) }],
    opacity: interpolate(pulse.value, [0, 1], [0.82, 1]),
  }));
  const ringAnim = useAnimatedStyle(() => ({
    transform: [
      { translateY: interpolate(float.value, [0, 1], [0, 12]) },
      { rotateZ: `${interpolate(float.value, [0, 1], [0, 12])}deg` },
      { rotateY: `${interpolate(float.value, [0, 1], [-16, 16])}deg` },
    ],
  }));
  const shimmerAnim = useAnimatedStyle(() => ({
    transform: [{ translateX: interpolate(shimmer.value, [0, 1], [-170, 280]) }, { rotate: '18deg' }],
  }));

  // 3D mouse-follow tilt of the whole panel.
  const box = useRef({ w: 0, h: 0 });
  const [tilt, setTilt] = useState(null);
  const rotX = useSharedValue(0);
  const rotY = useSharedValue(0);
  useEffect(() => {
    rotX.value = withTiming(tilt ? -tilt.y * 7 : 0, { duration: 240, easing: Easing.out(Easing.cubic) });
    rotY.value = withTiming(tilt ? tilt.x * 8 : 0, { duration: 240, easing: Easing.out(Easing.cubic) });
  }, [tilt, rotX, rotY]);
  const tiltAnim = useAnimatedStyle(() => ({
    transform: [
      { perspective: 1200 },
      { rotateX: `${rotX.value}deg` },
      { rotateY: `${rotY.value}deg` },
    ],
  }));
  const onMove = useCallback((e) => {
    const ne = e.nativeEvent;
    const lx = ne.locationX != null ? ne.locationX : ne.offsetX;
    const ly = ne.locationY != null ? ne.locationY : ne.offsetY;
    const { w, h } = box.current;
    if (w && h && lx != null && ly != null) setTilt({ x: lx / w - 0.5, y: ly / h - 0.5 });
  }, []);
  const onLeave = useCallback(() => setTilt(null), []);

  return (
    <Animated.View
      style={[styles.hero, tiltAnim]}
      onLayout={(e) => { const l = e.nativeEvent.layout; box.current = { w: l.width, h: l.height }; }}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
    >
      <LinearGradient
        pointerEvents="none"
        colors={[HERO.ink, HERO.ink2]}
        start={{ x: 0.2, y: 0 }}
        end={{ x: 0.8, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />
      <Animated.View style={[styles.heroGlowWrap, glowAnim]} pointerEvents="none">
        <LinearGradient
          colors={[HERO.lime + '6b', HERO.lime + '00']}
          start={{ x: 0.5, y: 0.1 }}
          end={{ x: 0.5, y: 1 }}
          style={styles.heroGlow}
        />
      </Animated.View>
      <Animated.View style={[styles.decoRing, { borderColor: HERO.lime + '2e' }, ringAnim]} pointerEvents="none" />
      <View style={[styles.decoRing2, { borderColor: HERO.teal + '33' }]} pointerEvents="none" />

      <View style={styles.heroEyebrow}>
        {streak > 0 && <Ionicons name="flame" size={14} color={HERO.lime} />}
        <Text style={[styles.heroEyebrowText, { color: HERO.lime }]} numberOfLines={1}>
          {(greeting || 'Welcome').toUpperCase()}
        </Text>
      </View>

      <Text style={[styles.heroTitle, titleLine, { color: HERO.paper }]}>Eat Better.</Text>
      <Text style={[styles.heroTitle, titleLine, { color: HERO.lime }]}>Live Healthier.</Text>

      <Text style={[typography.body, styles.heroSub, { color: HERO.sub }]}>
        Track meals, macros, water and habits — all in one calm, beautiful place.
      </Text>

      <View style={styles.heroCtas}>
        <AppTouchable onPress={onLogMeal} style={styles.heroCtaPrimary} accessibilityLabel="Log a meal" tiltX={0} tiltY={0}>
          <LinearGradient
            colors={['#D4F75E', '#A8D62E']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroCtaPrimaryFill}
          >
            <Animated.View pointerEvents="none" style={[styles.heroShimmer, shimmerAnim]}>
              <LinearGradient
                colors={['rgba(255,255,255,0)', 'rgba(255,255,255,0.5)', 'rgba(255,255,255,0)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={StyleSheet.absoluteFillObject}
              />
            </Animated.View>
            <Ionicons name="add-circle" size={19} color={HERO.ink} />
            <Text style={[typography.bodyMed, { color: HERO.ink, marginLeft: 7 }]}>Log a meal</Text>
          </LinearGradient>
        </AppTouchable>
        <AppTouchable
          onPress={onProgress}
          style={[styles.heroCtaSecondary, { borderColor: HERO.lime + '59', backgroundColor: HERO.lime + '14' }]}
          accessibilityLabel="View progress"
          tiltX={0}
          tiltY={0}
        >
          <Text style={[typography.bodyMed, { color: HERO.lime }]}>View progress</Text>
          <Ionicons name="arrow-forward" size={16} color={HERO.lime} style={{ marginLeft: 6 }} />
        </AppTouchable>
      </View>
    </Animated.View>
  );
}

// ── Hero calorie card ──────────────────────────────────────────────────────
function CalorieHero({ totals, goals, burned, ringSize, colors }) {
  return (
    <Card style={styles.calorieCard} elevated>
      <LinearGradient
        pointerEvents="none"
        colors={gradients.brandSoft}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />
      <View style={styles.cardTitleRow}>
        <Text style={[typography.h3, { color: colors.text }]}>Daily calories</Text>
        <View style={[styles.goalBadge, { backgroundColor: colors.primarySurface, borderColor: colors.cardBorder }]}>
          <Ionicons name="flag-outline" size={13} color={colors.primary} />
          <Text style={[typography.micro, { color: colors.primaryLight }]}>Goal {goals.calories} kcal</Text>
        </View>
      </View>

      <View style={styles.calorieRow}>
        <CalorieRing consumed={totals.calories} goal={goals.calories} burned={burned} size={ringSize} />
        <View style={styles.calorieSide}>
          <Text style={[typography.caption, { color: colors.textMuted }]}>From food</Text>
          <AnimatedNumber value={totals.calories} style={[typography.displayMd, styles.intakeValue, { color: colors.text }]} />
          <Text style={[typography.bodySm, { color: colors.textMuted, marginTop: -2 }]}>kcal eaten</Text>
          <View style={styles.burnedRow}>
            <Ionicons name="flame-outline" size={13} color={colors.warning} />
            <Text style={[typography.caption, { color: colors.textSecondary, marginLeft: 4 }]}>{Math.round(burned)} burned</Text>
          </View>
        </View>
      </View>
    </Card>
  );
}

// ── Nutrition macros ───────────────────────────────────────────────────────
function NutritionMacros({ totals, goals, colors, reduceMotion }) {
  return (
    <View>
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
    </View>
  );
}

// ── Water + Activity ───────────────────────────────────────────────────────
function QuickStats({ waterMl, goals, addWater, burned, activities, router, colors, reduceMotion, stacked }) {
  return (
    <View style={[styles.statsRow, stacked && styles.statsStack]}>
      <Card style={[styles.halfCard, stacked && styles.halfCardStack]} elevated>
        <View style={styles.halfCardHeader}>
          <Ionicons name="water" size={18} color={colors.water} />
          <Text style={[typography.h4, { color: colors.text, marginLeft: 6 }]}>Water</Text>
        </View>
        <Text style={[typography.h2, { color: colors.water, marginTop: 4 }]}>{mlToDisplay(waterMl)}</Text>
        <Text style={[typography.micro, { color: colors.textMuted }]}>/ {mlToDisplay(goals.water)} goal</Text>
        <View style={[styles.miniBar, { backgroundColor: colors.cardBorder, marginTop: 8 }]}>
          <Animated.View layout={reduceMotion ? undefined : PROGRESS_LAYOUT} style={[styles.miniBarFill, {
            width: (Math.min(pct(waterMl, goals.water), 1) * 100) + '%',
            backgroundColor: colors.water,
          }]} />
        </View>
        <View style={styles.waterBtns}>
          {[250, 500, 1000].map(ml => (
            <AppTouchable
              key={ml}
              onPress={() => addWater(ml)}
              style={[styles.waterBtn, { backgroundColor: colors.primarySurface, borderColor: colors.cardBorder }]}
              accessibilityLabel={`Add ${ml} millilitres of water`}
            >
              <Text numberOfLines={1} style={[typography.micro, { color: colors.water }]}>+{ml}ml</Text>
            </AppTouchable>
          ))}
        </View>
      </Card>

      <Card style={[styles.halfCard, stacked && styles.halfCardStack]} elevated>
        <View style={styles.halfCardHeader}>
          <Ionicons name="flame" size={18} color={colors.warning} />
          <Text style={[typography.h4, { color: colors.text, marginLeft: 6 }]}>Activity</Text>
        </View>
        <Text style={[typography.h2, { color: colors.warning, marginTop: 4 }]}>{Math.round(burned)}</Text>
        <Text style={[typography.micro, { color: colors.textMuted }]}>kcal burned</Text>
        <Text style={[typography.bodySm, { color: colors.textSecondary, marginTop: 8 }]} numberOfLines={1}>
          {activities.length === 0
            ? 'No activity logged'
            : (activities.length + ' workout' + (activities.length > 1 ? 's' : '') + ' today')}
        </Text>
        <AppTouchable
          onPress={() => router.navigate('/activity')}
          style={[styles.logActivityBtn, { backgroundColor: colors.primarySurface, borderColor: colors.cardBorder }]}
          accessibilityLabel="Log activity"
        >
          <Text style={[typography.micro, { color: colors.primaryLight }]}>Log activity</Text>
        </AppTouchable>
      </Card>
    </View>
  );
}

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

function MealSection({ meal, index = 0, items, mealCals, colors, onAdd, onRemove, onEdit, reduceMotion }) {
  const [expanded, setExpanded] = useState(true);
  const tint = mealColor(meal, colors);
  return (
    <Animated.View layout={reduceMotion ? undefined : MEAL_LAYOUT}>
      <Card style={styles.mealCard} elevated>
        <AppTouchable style={styles.mealHeader} onPress={() => setExpanded(e => !e)} activeOpacity={0.7}>
          <View style={[styles.mealIconBox, { backgroundColor: tint + '22', borderColor: tint + '3a' }]}>
            <MealGlyph meal={meal} index={index} size={20} />
          </View>
          <View style={{ flex: 1, marginLeft: spacing.sm }}>
            <Text style={[typography.h4, { color: colors.text }]}>{meal}</Text>
            {items.length > 0 && (
              <Text style={[typography.caption, { color: colors.textMuted }]}>
                {items.length} item{items.length > 1 ? 's' : ''} · {Math.round(mealCals)} kcal
              </Text>
            )}
          </View>
          {onEdit && (
            <AppTouchable
              style={styles.mealEditBtn}
              onPress={onEdit}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              accessibilityLabel={`Edit ${meal}`}
            >
              <Ionicons name="create-outline" size={16} color={colors.textMuted} />
            </AppTouchable>
          )}
          <AppTouchable
            onPress={onAdd}
            style={[styles.addFoodBtn, { backgroundColor: colors.primaryMuted, borderColor: colors.primary + '40' }]}
            accessibilityLabel={`Add food to ${meal}`}
          >
            <Ionicons name="add" size={16} color={colors.primary} />
            <Text style={[typography.micro, { color: colors.primary, marginLeft: 3 }]}>ADD</Text>
          </AppTouchable>
          <Ionicons
            name={expanded ? 'chevron-up' : 'chevron-down'}
            size={16}
            color={colors.textMuted}
            style={{ marginLeft: 8 }}
          />
        </AppTouchable>

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
                  <AppTouchable
                    onPress={() => onRemove(item.logId)}
                    hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                    style={{ marginLeft: spacing.sm }}
                  >
                    <Ionicons name="trash-outline" size={14} color={colors.textMuted} />
                  </AppTouchable>
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
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  // Editorial hero
  hero: {
    backgroundColor: HERO.ink, borderRadius: radius.xl, borderWidth: 1,
    borderColor: 'rgba(198, 242, 78, 0.16)', paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg, alignItems: 'center', marginBottom: spacing.lg, overflow: 'hidden',
  },
  heroGlowWrap: { position: 'absolute', top: -40, left: 0, right: 0, alignItems: 'center' },
  heroGlow: { width: 620, height: 620, borderRadius: 310 },
  decoRing: { position: 'absolute', top: 6, right: -34, width: 150, height: 150, borderRadius: 75, borderWidth: 13, opacity: 0.6 },
  decoRing2: { position: 'absolute', top: 130, left: -44, width: 92, height: 92, borderRadius: 46, borderWidth: 10, opacity: 0.5 },
  heroEyebrow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: spacing.sm },
  heroEyebrowText: { letterSpacing: 2.4, fontSize: 12, fontWeight: '700' },
  heroTitle: { fontWeight: '800', letterSpacing: -1.4, textAlign: 'center' },
  heroSub: { marginTop: spacing.sm, maxWidth: 460, textAlign: 'center' },
  heroCtas: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: spacing.sm, marginTop: spacing.lg },
  heroCtaPrimary: { borderRadius: radius.full, overflow: 'hidden' },
  heroCtaPrimaryFill: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.lg, paddingVertical: spacing.sm + 5, borderRadius: radius.full },
  heroCtaSecondary: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.lg, paddingVertical: spacing.sm + 5, borderRadius: radius.full, borderWidth: 1 },
  heroShimmer: { position: 'absolute', top: -14, bottom: -14, left: 0, width: 40 },
  avatarBtn: {
    width: 42, height: 42, borderRadius: radius.full,
    alignItems: 'center', justifyContent: 'center', borderWidth: 1,
  },
  streakBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radius.full, borderWidth: 1,
  },
  // Responsive dashboard
  wideWrap: { flexDirection: 'row', gap: spacing.md, alignItems: 'flex-start', marginBottom: spacing.lg },
  wideMain: { flex: 1.7, minWidth: 0 },
  wideSide: { flex: 1, minWidth: 0, gap: spacing.md },
  mealsWrap: { marginBottom: spacing.xs },
  mealsWrapWide: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  mealCol: { width: '48%' },
  // Calorie hero
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
  waterBtn: { paddingHorizontal: spacing.sm, paddingVertical: 6, borderRadius: radius.full, borderWidth: 1 },
  logActivityBtn: {
    marginTop: spacing.sm, paddingVertical: 8, paddingHorizontal: spacing.sm,
    borderRadius: radius.full, borderWidth: 1, alignItems: 'center',
  },
  mealCard: { marginBottom: spacing.sm },
  mealIconBox: {
    width: 42, height: 42, borderRadius: radius.md,
    alignItems: 'center', justifyContent: 'center', borderWidth: 1,
  },
  mealEditBtn: { padding: spacing.xs, marginRight: spacing.xs },
  addMealBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    padding: spacing.md, borderRadius: radius.lg, borderWidth: 1,
    borderStyle: 'dashed', marginTop: spacing.xs, marginBottom: spacing.sm,
  },
  mealEditorOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center', justifyContent: 'center', padding: spacing.lg,
  },
  mealEditorCard: { width: '100%', maxWidth: 420, padding: spacing.lg, borderRadius: radius.xl, borderWidth: 1 },
  mealEditorInput: {
    borderWidth: 1, borderRadius: radius.md, paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 4, ...typography.h4, marginBottom: spacing.xs,
  },
  mealEditorBtns: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md },
  mealEditorBtn: { flex: 1, paddingVertical: spacing.sm + 4, borderRadius: radius.md, alignItems: 'center' },
  mealEditorDelete: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    marginTop: spacing.md, paddingVertical: spacing.sm,
  },
  mealHeader: { flexDirection: 'row', alignItems: 'center' },
  addFoodBtn: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: spacing.sm, paddingVertical: 5, borderRadius: radius.full,
    borderWidth: 1, marginLeft: spacing.sm,
  },
  foodLogItem: {
    flexDirection: 'row', alignItems: 'center',
    paddingTop: spacing.sm, marginTop: spacing.sm, borderTopWidth: 1,
  },
  // Modal
  modal: { flex: 1 },
  modalHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: spacing.md, paddingVertical: spacing.md, borderBottomWidth: 1,
  },
  searchRow: {
    flexDirection: 'row', alignItems: 'center', margin: spacing.md,
    paddingHorizontal: spacing.md, paddingVertical: spacing.sm + 2, borderRadius: radius.md, borderWidth: 1,
  },
  searchInput: { flex: 1, ...typography.body, padding: 0 },
  catRow: { paddingHorizontal: spacing.md, paddingBottom: spacing.sm, gap: spacing.xs },
  catPill: { paddingHorizontal: spacing.md, paddingVertical: 6, borderRadius: radius.full, borderWidth: 1 },
  selectedCard: {
    marginHorizontal: spacing.md, marginBottom: spacing.sm,
    padding: spacing.md, borderRadius: radius.lg, borderWidth: 1,
  },
  selectedTop: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: spacing.sm },
  qtyRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm },
  qtyBtn: { width: 32, height: 32, borderRadius: radius.full, alignItems: 'center', justifyContent: 'center' },
  qtyInput: { width: 48, textAlign: 'center', ...typography.h3, borderBottomWidth: 2, paddingBottom: 2 },
  nutriRow: { flexDirection: 'row', gap: spacing.xs },
  nutriChip: { flex: 1, alignItems: 'center', paddingVertical: spacing.xs + 2, borderRadius: radius.sm },
  foodRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: spacing.md, paddingVertical: spacing.md, borderBottomWidth: 1,
  },
  foodRowRight: { alignItems: 'flex-end', marginLeft: spacing.sm },
});
