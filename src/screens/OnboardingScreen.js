import React, { useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView,
  StatusBar, TextInput, ScrollView, Platform } from 'react-native';
import AppTouchable from '../components/AppTouchable';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { typography, spacing, radius } from '../utils/theme';
import { calcTDEE, calcMacros } from '../utils/helpers';
import { LogoMark } from '../components/Logo';

const STEPS = [
  { id: 'welcome' },
  { id: 'name' },
  { id: 'body' },
  { id: 'goal' },
  { id: 'activity' },
  { id: 'diet' },
  { id: 'summary' },
];

const GOALS = [
  { key: 'maintain', label: 'Maintain Weight', icon: '⚖️', desc: 'Keep my current weight' },
  { key: 'lose', label: 'Lose Weight', icon: '📉', desc: 'Reduce body fat gradually' },
  { key: 'gain', label: 'Build Muscle', icon: '💪', desc: 'Gain lean muscle mass' },
  { key: 'nutrition', label: 'Improve Nutrition', icon: '🥗', desc: 'Eat healthier overall' },
];

const ACTIVITY_LEVELS = [
  { key: 'sedentary', label: 'Sedentary', icon: '🪑', desc: 'Desk job, little exercise' },
  { key: 'light', label: 'Lightly Active', icon: '🚶', desc: '1–3 workouts/week' },
  { key: 'moderate', label: 'Moderately Active', icon: '🏃', desc: '3–5 workouts/week' },
  { key: 'active', label: 'Very Active', icon: '🏋️', desc: '6–7 workouts/week' },
  { key: 'veryActive', label: 'Athlete', icon: '⚡', desc: 'Training twice a day' },
];

const DIETARY_PREFS = [
  'Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free',
  'Keto', 'Paleo', 'Halal', 'Kosher',
];

export default function OnboardingScreen() {
  const { colors, theme, completeOnboarding, saveGoals } = useApp();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    name: '',
    age: '',
    height: '',
    weight: '',
    gender: 'male',
    goal: 'maintain',
    activityLevel: 'moderate',
    dietaryPrefs: [],
  });

  const update = (key, value) => setForm(f => ({ ...f, [key]: value }));

  const togglePref = (pref) => {
    setForm(f => ({
      ...f,
      dietaryPrefs: f.dietaryPrefs.includes(pref)
        ? f.dietaryPrefs.filter(p => p !== pref)
        : [...f.dietaryPrefs, pref],
    }));
  };

  const tdee = calcTDEE(form);
  const suggestedGoals = calcMacros(tdee, form.goal);

  const canProceed = () => {
    if (step === 1) return form.name.trim().length > 0;
    return true;
  };

  const next = async () => {
    if (step < STEPS.length - 1) {
      setStep(s => s + 1);
    } else {
      await completeOnboarding(form);
      await saveGoals(suggestedGoals);
    }
  };

  const back = () => {
    if (step > 0) setStep(s => s - 1);
  };

  const currentStep = STEPS[step];

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]}>
      <StatusBar barStyle={theme === 'dark' ? 'light-content' : 'dark-content'} backgroundColor={colors.bg} />

      {/* Progress bar */}
      {step > 0 && step < STEPS.length - 1 && (
        <View style={styles.progressRow}>
          {step > 0 && (
            <AppTouchable onPress={back} style={styles.backBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons name="chevron-back" size={22} color={colors.textSecondary} />
            </AppTouchable>
          )}
          <View style={[styles.progressTrack, { backgroundColor: colors.cardBorder }]}>
            <View style={[styles.progressFill, {
              width: `${((step) / (STEPS.length - 1)) * 100}%`,
              backgroundColor: colors.primary,
            }]} />
          </View>
          <Text style={[typography.caption, { color: colors.textMuted, width: 36, textAlign: 'right' }]}>
            {step}/{STEPS.length - 2}
          </Text>
        </View>
      )}

      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* ── WELCOME ─────────────────────────────────────── */}
        {currentStep.id === 'welcome' && (
          <View style={styles.centerContent}>
            <View style={[styles.welcomeGradient, { backgroundColor: colors.primarySurface }]}>
              <LogoMark size={100} />
            </View>
            <Text style={[typography.displayMd, { color: colors.text, textAlign: 'center', marginTop: spacing.xl }]}>
              Welcome to{'\n'}
              <Text style={{ color: colors.primaryLight }}>NutriTrack</Text>
            </Text>
            <Text style={[typography.body, { color: colors.textSecondary, textAlign: 'center', marginTop: spacing.md, lineHeight: 24 }]}>
              Your personal nutrition companion.{'\n'}
              Eat better. Live healthier.
            </Text>
            <View style={styles.featureList}>
              {[
                { ion: 'stats-chart', c: colors.primary, text: 'Track calories & macros' },
                { ion: 'water', c: colors.water, text: 'Monitor hydration' },
                { ion: 'fitness', c: colors.warning, text: 'Log activities' },
                { ion: 'flag-outline', c: colors.accentPink, text: 'Personalise your daily goals' },
              ].map(f => (
                <View key={f.text} style={[styles.featureItem, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
                  <View style={[styles.featureIcon, { backgroundColor: f.c + '1f' }]}>
                    <Ionicons name={f.ion} size={20} color={f.c} />
                  </View>
                  <Text style={[typography.bodyMed, { color: colors.text }]}>{f.text}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* ── NAME ────────────────────────────────────────── */}
        {currentStep.id === 'name' && (
          <View style={styles.stepContent}>
            <Text style={styles.stepEmoji}>👋</Text>
            <Text style={[typography.h1, { color: colors.text, marginTop: spacing.lg }]}>What&apos;s your name?</Text>
            <Text style={[typography.body, { color: colors.textSecondary, marginTop: spacing.sm }]}>
              We&apos;ll personalise your experience.
            </Text>
            <TextInput
              style={[styles.input, { color: colors.text, backgroundColor: colors.card, borderColor: form.name ? colors.primary : colors.cardBorder }]}
              placeholder="Your first name"
              placeholderTextColor={colors.textMuted}
              value={form.name}
              onChangeText={v => update('name', v)}
              autoCapitalize="words"
              returnKeyType="done"
            />
          </View>
        )}

        {/* ── BODY ────────────────────────────────────────── */}
        {currentStep.id === 'body' && (
          <View style={styles.stepContent}>
            <Text style={styles.stepEmoji}>📏</Text>
            <Text style={[typography.h1, { color: colors.text, marginTop: spacing.lg }]}>Your body stats</Text>
            <Text style={[typography.body, { color: colors.textSecondary, marginTop: spacing.sm, marginBottom: spacing.xl }]}>
              Used to calculate your personalised nutrition targets. Optional — skip if you prefer.
            </Text>

            {/* Gender */}
            <Text style={[typography.bodySmMed, { color: colors.textSecondary, marginBottom: spacing.sm }]}>Gender</Text>
            <View style={styles.genderRow}>
              {[{ key: 'male', label: '♂ Male' }, { key: 'female', label: '♀ Female' }, { key: 'other', label: '⚧ Other' }].map(g => (
                <AppTouchable
                  key={g.key}
                  style={[styles.genderBtn, {
                    backgroundColor: form.gender === g.key ? colors.primary : colors.card,
                    borderColor: form.gender === g.key ? colors.primary : colors.cardBorder,
                  }]}
                  onPress={() => update('gender', g.key)}
                >
                  <Text style={[typography.bodyMed, { color: form.gender === g.key ? colors.textInverse : colors.textSecondary }]}>{g.label}</Text>
                </AppTouchable>
              ))}
            </View>

            {/* Fields */}
            {[
              { key: 'age', label: 'Age', placeholder: 'Years', kb: 'number-pad', unit: 'yrs' },
              { key: 'height', label: 'Height', placeholder: 'e.g. 175', kb: 'decimal-pad', unit: 'cm' },
              { key: 'weight', label: 'Weight', placeholder: 'e.g. 70', kb: 'decimal-pad', unit: 'kg' },
            ].map(field => (
              <View key={field.key} style={styles.fieldRow}>
                <Text style={[typography.bodySmMed, { color: colors.textSecondary, width: 70 }]}>{field.label}</Text>
                <View style={[styles.inputRow, { backgroundColor: colors.card, borderColor: form[field.key] ? colors.primary : colors.cardBorder }]}>
                  <TextInput
                    style={[styles.inlineInput, { color: colors.text }]}
                    placeholder={field.placeholder}
                    placeholderTextColor={colors.textMuted}
                    value={form[field.key]}
                    onChangeText={v => update(field.key, v)}
                    keyboardType={field.kb}
                  />
                  <Text style={[typography.bodySm, { color: colors.textMuted }]}>{field.unit}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* ── GOAL ────────────────────────────────────────── */}
        {currentStep.id === 'goal' && (
          <View style={styles.stepContent}>
            <Text style={styles.stepEmoji}>🎯</Text>
            <Text style={[typography.h1, { color: colors.text, marginTop: spacing.lg }]}>What&apos;s your goal?</Text>
            <Text style={[typography.body, { color: colors.textSecondary, marginTop: spacing.sm, marginBottom: spacing.xl }]}>
              We&apos;ll tailor your calorie and macro targets.
            </Text>
            {GOALS.map(goal => (
              <AppTouchable
                key={goal.key}
                style={[styles.optionCard, {
                  backgroundColor: form.goal === goal.key ? colors.primarySurface : colors.card,
                  borderColor: form.goal === goal.key ? colors.primary : colors.cardBorder,
                }]}
                onPress={() => update('goal', goal.key)}
              >
                <Text style={{ fontSize: 28 }}>{goal.icon}</Text>
                <View style={{ flex: 1, marginLeft: spacing.md }}>
                  <Text style={[typography.h4, { color: colors.text }]}>{goal.label}</Text>
                  <Text style={[typography.bodySm, { color: colors.textSecondary }]}>{goal.desc}</Text>
                </View>
                {form.goal === goal.key && (
                  <Ionicons name="checkmark-circle" size={22} color={colors.primary} />
                )}
              </AppTouchable>
            ))}
          </View>
        )}

        {/* ── ACTIVITY ────────────────────────────────────── */}
        {currentStep.id === 'activity' && (
          <View style={styles.stepContent}>
            <Text style={styles.stepEmoji}>⚡</Text>
            <Text style={[typography.h1, { color: colors.text, marginTop: spacing.lg }]}>Activity level</Text>
            <Text style={[typography.body, { color: colors.textSecondary, marginTop: spacing.sm, marginBottom: spacing.xl }]}>
              Helps us calculate your daily energy needs.
            </Text>
            {ACTIVITY_LEVELS.map(level => (
              <AppTouchable
                key={level.key}
                style={[styles.optionCard, {
                  backgroundColor: form.activityLevel === level.key ? colors.primarySurface : colors.card,
                  borderColor: form.activityLevel === level.key ? colors.primary : colors.cardBorder,
                }]}
                onPress={() => update('activityLevel', level.key)}
              >
                <Text style={{ fontSize: 26 }}>{level.icon}</Text>
                <View style={{ flex: 1, marginLeft: spacing.md }}>
                  <Text style={[typography.h4, { color: colors.text }]}>{level.label}</Text>
                  <Text style={[typography.bodySm, { color: colors.textSecondary }]}>{level.desc}</Text>
                </View>
                {form.activityLevel === level.key && (
                  <Ionicons name="checkmark-circle" size={22} color={colors.primary} />
                )}
              </AppTouchable>
            ))}
          </View>
        )}

        {/* ── DIET ────────────────────────────────────────── */}
        {currentStep.id === 'diet' && (
          <View style={styles.stepContent}>
            <Text style={styles.stepEmoji}>🥗</Text>
            <Text style={[typography.h1, { color: colors.text, marginTop: spacing.lg }]}>Dietary preferences</Text>
            <Text style={[typography.body, { color: colors.textSecondary, marginTop: spacing.sm, marginBottom: spacing.xl }]}>
              Select all that apply. You can change this later.
            </Text>
            <View style={styles.prefGrid}>
              {DIETARY_PREFS.map(pref => {
                const active = form.dietaryPrefs.includes(pref);
                return (
                  <AppTouchable
                    key={pref}
                    style={[styles.prefChip, {
                      backgroundColor: active ? colors.primarySurface : colors.card,
                      borderColor: active ? colors.primary : colors.cardBorder,
                    }]}
                    onPress={() => togglePref(pref)}
                  >
                    {active && <Ionicons name="checkmark" size={14} color={colors.primary} style={{ marginRight: 4 }} />}
                    <Text style={[typography.bodyMed, { color: active ? colors.primaryLight : colors.textSecondary }]}>{pref}</Text>
                  </AppTouchable>
                );
              })}
            </View>
            <AppTouchable onPress={next} style={styles.skipBtn}>
              <Text style={[typography.bodySm, { color: colors.textMuted }]}>Skip this step →</Text>
            </AppTouchable>
          </View>
        )}

        {/* ── SUMMARY ─────────────────────────────────────── */}
        {currentStep.id === 'summary' && (
          <View style={styles.stepContent}>
            <Text style={styles.stepEmoji}>✅</Text>
            <Text style={[typography.h1, { color: colors.text, marginTop: spacing.lg }]}>
              You&apos;re all set{form.name ? `, ${form.name.split(' ')[0]}` : ''}!
            </Text>
            <Text style={[typography.body, { color: colors.textSecondary, marginTop: spacing.sm, marginBottom: spacing.xl }]}>
              Here are your personalised daily targets based on your profile.
            </Text>

            {/* Suggested goals */}
            <View style={[styles.summaryCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
              <Text style={[typography.h4, { color: colors.primaryLight, marginBottom: spacing.md }]}>
                Daily Nutrition Goals
              </Text>
              {[
                { label: 'Calories', value: `${suggestedGoals.calories} kcal`, color: colors.primaryLight },
                { label: 'Protein', value: `${suggestedGoals.protein}g`, color: colors.protein },
                { label: 'Carbohydrates', value: `${suggestedGoals.carbs}g`, color: colors.carbs },
                { label: 'Fat', value: `${suggestedGoals.fat}g`, color: colors.fat },
                { label: 'Water', value: '2000 ml', color: colors.water },
              ].map(item => (
                <View key={item.label} style={[styles.summaryRow, { borderBottomColor: colors.cardBorder }]}>
                  <Text style={[typography.bodyMed, { color: colors.textSecondary }]}>{item.label}</Text>
                  <Text style={[typography.h4, { color: item.color }]}>{item.value}</Text>
                </View>
              ))}
            </View>

            <View style={[styles.noteBox, { backgroundColor: colors.primarySurface, borderColor: colors.primary + '40' }]}>
              <Ionicons name="information-circle-outline" size={16} color={colors.primaryLight} />
              <Text style={[typography.caption, { color: colors.textSecondary, flex: 1, marginLeft: spacing.xs }]}>
                These targets are estimates based on the Mifflin-St Jeor formula. You can edit them anytime in Profile → Nutrition Goals.
              </Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* CTA Button */}
      <View style={[styles.footer, { backgroundColor: colors.bg }]}>
        <AppTouchable
          style={[styles.ctaBtn, {
            backgroundColor: canProceed() ? colors.primary : colors.cardBorder,
            opacity: canProceed() ? 1 : 0.6,
          }]}
          onPress={next}
          disabled={!canProceed()}
        >
          <Text style={[typography.h4, { color: colors.textInverse }]}>
            {step === 0 ? 'Get Started' : step === STEPS.length - 1 ? 'Start Tracking 🚀' : 'Continue'}
          </Text>
          {step !== STEPS.length - 1 && (
            <Ionicons name="arrow-forward" size={18} color={colors.textInverse} style={{ marginLeft: spacing.sm }} />
          )}
        </AppTouchable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, minWidth: 0, width: '100%' },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  backBtn: { padding: 4 },
  progressTrack: { flex: 1, height: 4, borderRadius: radius.full, overflow: 'hidden' },
  progressFill: { height: 4, borderRadius: radius.full },
  scroll: { flexGrow: 1, paddingBottom: 100 },
  centerContent: { flex: 1, alignItems: 'center', paddingHorizontal: spacing.lg, paddingTop: spacing.xl * 2 },
  welcomeGradient: {
    width: 148, height: 148, borderRadius: 74,
    alignItems: 'center', justifyContent: 'center',
  },
  featureList: { width: '100%', marginTop: spacing.xl, gap: spacing.sm },
  featureItem: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    padding: spacing.md, borderRadius: radius.lg, borderWidth: 1,
  },
  featureIcon: {
    width: 40, height: 40, borderRadius: radius.md,
    alignItems: 'center', justifyContent: 'center',
  },
  stepContent: { paddingHorizontal: spacing.lg, paddingTop: spacing.xl },
  stepEmoji: { fontSize: 52 },
  input: {
    marginTop: spacing.xl, borderWidth: 1.5, borderRadius: radius.lg,
    paddingHorizontal: spacing.lg, paddingVertical: spacing.md + 4,
    fontSize: 20, fontWeight: '600',
  },
  genderRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.lg },
  genderBtn: {
    flex: 1, paddingVertical: spacing.md, alignItems: 'center',
    borderRadius: radius.lg, borderWidth: 1,
  },
  fieldRow: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    marginBottom: spacing.md,
  },
  inputRow: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    borderWidth: 1.5, borderRadius: radius.lg,
    paddingHorizontal: spacing.md, paddingVertical: spacing.sm + 4,
  },
  inlineInput: { flex: 1, fontSize: 16, fontWeight: '500', padding: 0 },
  optionCard: {
    flexDirection: 'row', alignItems: 'center',
    padding: spacing.md, borderRadius: radius.lg, borderWidth: 1,
    marginBottom: spacing.sm,
  },
  prefGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  prefChip: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: spacing.md, paddingVertical: spacing.sm + 2,
    borderRadius: radius.full, borderWidth: 1,
  },
  skipBtn: { alignSelf: 'center', marginTop: spacing.xl, padding: spacing.sm },
  summaryCard: {
    borderRadius: radius.xl, borderWidth: 1, padding: spacing.md, marginBottom: spacing.md,
  },
  summaryRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingVertical: spacing.sm + 2, borderBottomWidth: 1,
  },
  noteBox: {
    flexDirection: 'row', alignItems: 'flex-start', gap: spacing.xs,
    padding: spacing.md, borderRadius: radius.lg, borderWidth: 1,
  },
  footer: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    paddingHorizontal: spacing.lg,
    paddingBottom: Platform.OS === 'ios' ? 34 : spacing.lg,
    paddingTop: spacing.sm,
  },
  ctaBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: spacing.md + 4, borderRadius: radius.xl,
  },
});
