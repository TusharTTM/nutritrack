import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, useWindowDimensions, Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useApp } from '../context/AppContext';
import { typography, spacing, radius, shadow, ctaGradient } from '../utils/theme';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import AuroraBackground from '../components/AuroraBackground';
import Logo, { LogoMark } from '../components/Logo';
import Card from '../components/Card';
import CalorieRing from '../components/CalorieRing';
import MacroBar from '../components/MacroBar';
import GradientButton from '../components/GradientButton';

// Marketing entry point for the web build. Native builds skip this entirely
// (see src/app/index.js) and open straight into the tracker.
//
// Everything here is built from the app's own design system and real
// components, and every claim is backed by a screen that actually exists —
// no invented features.

const FEATURES = [
  {
    icon: 'flame-outline',
    title: 'Calories at a glance',
    body: 'A live ring shows what is left today, with eaten and burned side by side.',
  },
  {
    icon: 'pie-chart-outline',
    title: 'Macros that add up',
    body: 'Protein, carbs, fat and fibre tracked against the goals you set.',
  },
  {
    icon: 'water-outline',
    title: 'Water, one tap away',
    body: 'Add 250, 500 or 1000 ml and watch the day’s total climb.',
  },
  {
    icon: 'trending-up-outline',
    title: 'Trends over time',
    body: 'Weight history, day streaks and a chart that draws itself as you log.',
  },
  {
    icon: 'barbell-outline',
    title: 'Activity & burn',
    body: 'Log a run, a walk or a session and the burn total updates instantly.',
  },
  {
    icon: 'people-outline',
    title: 'Share with your circle',
    body: 'Optional community sharing of daily summaries — never meal-level logs.',
  },
];

const STEPS = [
  { n: '1', title: 'Tell us about you', body: 'A short onboarding sets your goals from your body and activity level.' },
  { n: '2', title: 'Log as you eat', body: 'Search foods, tap to add, and your day fills itself in.' },
  { n: '3', title: 'Watch it compound', body: 'Streaks, trends and macros keep you honest, every single day.' },
];

// Real numbers from the dashboard screen, rendered with the app's own
// components so the preview is the product rather than a picture of it.
function PhonePreview() {
  const { colors } = useApp();
  return (
    <View style={[styles.phone, { backgroundColor: colors.bgSecondary, borderColor: colors.cardBorder }]}>
      <View style={styles.notch} />
      <View style={styles.phoneHead}>
        <View style={[styles.avatar, { backgroundColor: colors.primaryMuted, borderColor: colors.cardBorder }]}>
          <Ionicons name="person" size={14} color={colors.primary} />
        </View>
        <View style={styles.phoneHeadText}>
          <Text style={[styles.eyebrow, { color: colors.primary }]}>GOOD MORNING</Text>
          <Text style={[typography.h4, { color: colors.text }]}>Aarav</Text>
        </View>
      </View>

      <CalorieRing consumed={1486} goal={2200} burned={412} size={168} />

      <View style={styles.macroList}>
        <MacroBar label="Protein" value={96} goal={150} color={colors.protein} />
        <MacroBar label="Carbs" value={180} goal={250} color={colors.carbs} />
        <MacroBar label="Fat" value={52} goal={70} color={colors.fat} />
        <MacroBar label="Fiber" value={24} goal={30} color={colors.fiber} />
      </View>

      <View style={[styles.tabStrip, { borderTopColor: colors.divider }]}>
        {['home', 'restaurant', 'stats-chart', 'fitness', 'person'].map((ic, i) => (
          <Ionicons
            key={ic}
            name={i === 0 ? ic : `${ic}-outline`}
            size={18}
            color={i === 0 ? colors.primary : colors.textMuted}
          />
        ))}
      </View>
    </View>
  );
}

export default function LandingScreen() {
  const { colors, theme } = useApp();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const wide = width > 900;
  const grad = ctaGradient(theme);

  return (
    <View style={[styles.root, { backgroundColor: colors.bg }]}>
      <AuroraBackground />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={[styles.shell, wide && { maxWidth: 1120 }]}>

          {/* nav */}
          <View style={styles.nav}>
            <Logo size={34} />
            <View style={styles.navRight}>
              <Ionicons name="log-in-outline" size={16} color={colors.textSecondary} />
              <Text
                style={[typography.label, { color: colors.textSecondary }]}
                onPress={() => router.push('/login')}
                accessibilityRole="link"
              >
                Sign in
              </Text>
            </View>
          </View>

          {/* hero */}
          <View style={[styles.hero, wide && styles.heroWide]}>
            <View style={styles.heroCopy}>
              <View style={[styles.pill, { backgroundColor: colors.primarySurface, borderColor: colors.cardBorder }]}>
                <Ionicons name="leaf" size={13} color={colors.primary} />
                <Text style={[styles.pillText, { color: colors.primary }]}>NUTRITION &amp; ACTIVITY TRACKER</Text>
              </View>

              <Text style={[styles.h1, { color: colors.text }]}>
                Eat Better.{'\n'}
                <Text style={{ color: colors.primary }}>Live Healthier.</Text>
              </Text>

              <Text style={[styles.lede, { color: colors.textSecondary }]}>
                Track meals, macros, water and habits — all in one calm,
                beautiful place. Your data stays on your device unless you
                choose to share it.
              </Text>

              <View style={styles.ctas}>
                <GradientButton
                  label="Get started"
                  colors={grad}
                  onPress={() => router.push('/app')}
                  icon="arrow-forward"
                />
                <Text
                  style={[styles.ghost, { color: colors.textSecondary, borderColor: colors.cardBorder }]}
                  onPress={() => router.push('/login')}
                  accessibilityRole="link"
                >
                  I already have an account
                </Text>
              </View>

              <View style={styles.trust}>
                {['Works offline', 'No card needed', 'Free to start'].map((t) => (
                  <View key={t} style={styles.trustItem}>
                    <Ionicons name="checkmark-circle" size={15} color={colors.primary} />
                    <Text style={[styles.trustText, { color: colors.textMuted }]}>{t}</Text>
                  </View>
                ))}
              </View>
            </View>

            <View style={styles.heroArt}>
              <PhonePreview />
            </View>
          </View>

          {/* features */}
          <View style={styles.section}>
            <Text style={[styles.h2, { color: colors.text }]}>Everything you need, nothing you don’t</Text>
            <Text style={[styles.sectionLede, { color: colors.textSecondary }]}>
              Six things the app actually does — each one a screen you can open today.
            </Text>
            <View style={styles.grid}>
              {FEATURES.map((f) => (
                <Card key={f.title} style={[styles.feature, wide && { width: '31.5%' }]}>
                  <View style={[styles.featureIcon, { backgroundColor: colors.primaryMuted }]}>
                    <Ionicons name={f.icon} size={20} color={colors.primary} />
                  </View>
                  <Text style={[typography.h3, { color: colors.text }]}>{f.title}</Text>
                  <Text style={[typography.bodySm, { color: colors.textSecondary }]}>{f.body}</Text>
                </Card>
              ))}
            </View>
          </View>

          {/* how it works */}
          <View style={styles.section}>
            <Text style={[styles.h2, { color: colors.text }]}>How it works</Text>
            <View style={[styles.steps, wide && styles.stepsWide]}>
              {STEPS.map((s) => (
                <View key={s.n} style={[styles.step, wide && { width: '31.5%' }]}>
                  <LinearGradient
                    colors={grad}
                    style={styles.stepBadge}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <Text style={[styles.stepBadgeText, { color: colors.textInverse }]}>{s.n}</Text>
                  </LinearGradient>
                  <Text style={[typography.h3, { color: colors.text }]}>{s.title}</Text>
                  <Text style={[typography.bodySm, { color: colors.textSecondary }]}>{s.body}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* closing cta */}
          <Card elevated style={styles.closing}>
            <LogoMark size={52} variant="mono" />
            <Text style={[styles.h2, { color: colors.text, textAlign: 'center' }]}>
              Start tracking in under a minute
            </Text>
            <Text style={[styles.sectionLede, { color: colors.textSecondary, textAlign: 'center' }]}>
              Onboarding takes six short steps. No account required to begin.
            </Text>
            <GradientButton
              label="Open NutriTrack"
              colors={grad}
              onPress={() => router.push('/app')}
              icon="arrow-forward"
            />
          </Card>

          <View style={[styles.footer, { borderTopColor: colors.divider }]}>
            <Text style={[styles.footerText, { color: colors.textMuted }]}>
              NutriTrack · Built with Expo and React Native
            </Text>
            <Text style={[styles.footerText, { color: colors.textMuted }]}>
              {Platform.OS === 'web' ? 'Web build' : 'Mobile build'}
            </Text>
          </View>

        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { flexGrow: 1, paddingBottom: spacing.xxl },
  shell: { width: '100%', alignSelf: 'center', paddingHorizontal: spacing.lg },

  nav: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: spacing.lg,
  },
  navRight: { flexDirection: 'row', alignItems: 'center', gap: 6 },

  hero: { paddingTop: spacing.xl, paddingBottom: spacing.xxl, gap: spacing.xl },
  heroWide: { flexDirection: 'row', alignItems: 'center', gap: spacing.xxl },
  heroCopy: { flex: 1, gap: spacing.lg },
  heroArt: { flex: 1, alignItems: 'center' },

  pill: {
    flexDirection: 'row', alignItems: 'center', gap: 7, alignSelf: 'flex-start',
    paddingHorizontal: spacing.md, paddingVertical: 7,
    borderRadius: radius.full, borderWidth: 1,
  },
  pillText: { fontSize: 11, fontWeight: '700', letterSpacing: 1.2 },

  h1: { fontSize: 52, fontWeight: '800', letterSpacing: -2, lineHeight: 56 },
  lede: { ...typography.body, fontSize: 17, lineHeight: 26, maxWidth: 520 },

  ctas: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, flexWrap: 'wrap' },
  ghost: {
    ...typography.label, paddingHorizontal: spacing.lg, paddingVertical: 13,
    borderRadius: radius.full, borderWidth: 1, overflow: 'hidden',
  },

  trust: { flexDirection: 'row', gap: spacing.lg, flexWrap: 'wrap' },
  trustItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  trustText: { ...typography.caption },

  section: { paddingVertical: spacing.xxl, gap: spacing.md },
  h2: { ...typography.displayMd, fontSize: 30 },
  sectionLede: { ...typography.body, maxWidth: 620 },

  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md, marginTop: spacing.sm },
  feature: { flexGrow: 1, flexBasis: '100%', gap: spacing.sm, padding: spacing.lg },
  featureIcon: {
    width: 42, height: 42, borderRadius: radius.md,
    alignItems: 'center', justifyContent: 'center', marginBottom: spacing.xs,
  },

  steps: { gap: spacing.lg, marginTop: spacing.sm },
  stepsWide: { flexDirection: 'row' },
  step: { gap: spacing.sm },
  stepBadge: { width: 34, height: 34, borderRadius: radius.full, alignItems: 'center', justifyContent: 'center' },
  stepBadgeText: { fontSize: 15, fontWeight: '800' },

  closing: { alignItems: 'center', gap: spacing.md, padding: spacing.xxl, marginTop: spacing.lg },

  footer: {
    flexDirection: 'row', justifyContent: 'space-between', flexWrap: 'wrap', gap: spacing.sm,
    marginTop: spacing.xxl, paddingTop: spacing.lg, borderTopWidth: StyleSheet.hairlineWidth,
  },
  footerText: { ...typography.caption },

  // phone preview
  phone: {
    width: 268, borderRadius: 38, borderWidth: 1,
    paddingTop: spacing.lg, paddingBottom: spacing.sm, paddingHorizontal: spacing.md,
    alignItems: 'center', gap: spacing.md, ...shadow.lg,
  },
  notch: {
    position: 'absolute', top: 10, width: 74, height: 6,
    borderRadius: radius.full, backgroundColor: 'rgba(0,0,0,0.5)',
  },
  phoneHead: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, alignSelf: 'stretch' },
  avatar: { width: 30, height: 30, borderRadius: radius.full, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  phoneHeadText: { gap: 1 },
  eyebrow: { fontSize: 9, fontWeight: '700', letterSpacing: 1 },
  macroList: { alignSelf: 'stretch', gap: 7 },
  tabStrip: {
    alignSelf: 'stretch', flexDirection: 'row', justifyContent: 'space-around',
    paddingTop: spacing.sm, marginTop: spacing.xs, borderTopWidth: StyleSheet.hairlineWidth,
  },
});
