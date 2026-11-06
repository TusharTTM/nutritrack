import React, { useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, useWindowDimensions, Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useApp } from '../context/AppContext';
import { typography, spacing, radius, shadow, ctaGradient } from '../utils/theme';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue, useAnimatedStyle, withTiming, withDelay, interpolate, Easing,
  useReducedMotion,
} from 'react-native-reanimated';
import AuroraBackground from '../components/AuroraBackground';
import Logo, { LogoMark } from '../components/Logo';
import Card from '../components/Card';
import CalorieRing from '../components/CalorieRing';
import MacroBar from '../components/MacroBar';
import GradientButton from '../components/GradientButton';
import AppTouchable from '../components/AppTouchable';

// Marketing entry point for the web build. Native builds skip this entirely
// (see src/app/index.js) and open straight into the tracker.
//
// Everything here is built from the app's own design system and real
// components, and every claim is backed by a screen that actually exists —
// no invented features.
//
// Motion is deliberately rationed to one authored moment: the hero settling
// in. Nothing else on the page moves because the page scrolled, and every
// hover/press answer is a transition on the touchable itself so it can be
// interrupted mid-flight.

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
  { n: '01', title: 'Tell us about you', body: 'A short onboarding sets your goals from your body and activity level.' },
  { n: '02', title: 'Log as you eat', body: 'Search foods, tap to add, and your day fills itself in.' },
  { n: '03', title: 'Watch it compound', body: 'Streaks, trends and macros keep you honest, every single day.' },
];

const TRUST = ['On-device storage', 'No card needed', 'Free to start'];

// Real numbers from the dashboard screen, rendered with the app's own
// components so the preview is the product rather than a picture of it.
function PhonePreview({ enter }) {
  const { colors } = useApp();
  const rise = useAnimatedStyle(() => ({
    opacity: interpolate(enter.value, [0.1, 0.78], [0, 1]),
    transform: [
      { perspective: 1000 },
      { translateY: interpolate(enter.value, [0.1, 0.78], [26, 0]) },
      { scale: interpolate(enter.value, [0.1, 0.78], [0.97, 1]) },
    ],
  }));

  return (
    <Animated.View style={[styles.heroArtInner, rise]}>
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
    </Animated.View>
  );
}

// The water card lifted straight off the dashboard — same component shape, the
// same 250/500/1000 quick-add, the real 2 L goal from the app defaults.
function WaterLead() {
  const { colors } = useApp();
  const goalMl = 2000;
  const loggedMl = 1500;
  const pct = Math.min(loggedMl / goalMl, 1);

  return (
    <Card style={[styles.feature, styles.lead]}>
      <View style={styles.leadTop}>
        <View style={[styles.featureIcon, { backgroundColor: colors.primaryMuted }]}>
          <Ionicons name="water-outline" size={20} color={colors.primary} />
        </View>
        <View style={styles.leadHead}>
          <Text style={[typography.h3, { color: colors.text }]}>Water, one tap away</Text>
          <Text style={[typography.bodySm, { color: colors.textSecondary }]}>
            Add 250, 500 or 1000 ml and watch the day’s total climb.
          </Text>
        </View>
      </View>

      <View style={[styles.leadPanel, { backgroundColor: colors.primarySurface, borderColor: colors.cardBorder }]}>
        <View style={styles.leadPanelHead}>
          <Ionicons name="water" size={16} color={colors.water} />
          <Text style={[typography.micro, { color: colors.textMuted, marginLeft: 6 }]}>Today</Text>
        </View>
        <Text style={[styles.leadFigure, { color: colors.water }]}>1.5 L</Text>
        <Text style={[typography.micro, { color: colors.textMuted }]}>/ 2.0 L goal</Text>
        <View style={[styles.leadBar, { backgroundColor: colors.cardBorder }]}>
          <View style={[styles.leadBarFill, { width: `${pct * 100}%`, backgroundColor: colors.water }]} />
        </View>
        <View style={styles.leadBtns}>
          {[250, 500, 1000].map((ml) => (
            <AppTouchable
              key={ml}
              hoverLift={-2}
              hoverScale={1}
              maxTilt={0}
              hoverDuration={140}
              style={[styles.leadBtn, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
              accessibilityLabel={`Add ${ml} millilitres of water`}
            >
              <Text numberOfLines={1} style={[typography.micro, { color: colors.water }]}>+{ml}ml</Text>
            </AppTouchable>
          ))}
        </View>
      </View>
    </Card>
  );
}

// One rise-and-settle, staggered across the hero blocks. Decorative only —
// nothing here is gated behind it, so the page is usable the instant it paints.
function Rise({ enter, from, children, style }) {
  const anim = useAnimatedStyle(() => ({
    opacity: interpolate(enter.value, [from, from + 0.34], [0, 1]),
    transform: [{ translateY: interpolate(enter.value, [from, from + 0.34], [16, 0]) }],
  }));
  return <Animated.View style={style ? [style, anim] : anim}>{children}</Animated.View>;
}

// Secondary call to action. The gradient button owns the primary look, so this
// is a quiet bordered pill that still answers the pointer like a real button.
function GhostButton({ label, onPress }) {
  const { colors } = useApp();
  const [hover, setHover] = React.useState(false);
  return (
    <AppTouchable
      onPress={onPress}
      hoverLift={-2}
      hoverScale={1}
      maxTilt={0}
      hoverDuration={150}
      accessibilityRole="button"
      accessibilityLabel={label}
      onHoverIn={() => setHover(true)}
      onHoverOut={() => setHover(false)}
      style={[
        styles.ghost,
        {
          borderColor: hover ? colors.primary : colors.cardBorder,
          backgroundColor: hover ? colors.primarySurface : 'transparent',
        },
      ]}
    >
      <Text style={[typography.label, { color: hover ? colors.primary : colors.textSecondary }]}>{label}</Text>
    </AppTouchable>
  );
}

export default function LandingScreen() {
  const { colors, theme } = useApp();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const wide = width > 900;
  const grad = ctaGradient(theme);
  const reduced = useReducedMotion();
  const enter = useSharedValue(0);

  useEffect(() => {
    if (reduced) {
      enter.value = 1;
      return;
    }
    enter.value = withDelay(
      60,
      withTiming(1, { duration: 680, easing: Easing.bezier(0.23, 1, 0.32, 1) }),
    );
  }, [reduced, enter]);

  return (
    <View style={[styles.root, { backgroundColor: colors.bg }]}>
      <AuroraBackground />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={[styles.shell, wide && { maxWidth: 1120 }]}>

          {/* nav */}
          <View style={styles.nav}>
            <Logo size={34} />
            <AppTouchable
              onPress={() => router.push('/login')}
              hoverLift={-2}
              hoverScale={1}
              maxTilt={0}
              hoverDuration={150}
              accessibilityRole="link"
              accessibilityLabel="Sign in"
              style={[styles.navLink, { borderColor: colors.cardBorder }]}
            >
              <Ionicons name="log-in-outline" size={15} color={colors.textSecondary} />
              <Text style={[typography.label, { color: colors.textSecondary }]}>Sign in</Text>
            </AppTouchable>
          </View>

          {/* hero */}
          <View style={[styles.hero, wide && styles.heroWide]}>
            <View style={styles.heroCopy}>
              <Rise enter={enter} from={0}>
                <Text style={[styles.h1, { color: colors.text }]}>
                  Eat Better.{'\n'}
                  <Text style={{ color: colors.primary }}>Live Healthier.</Text>
                </Text>
              </Rise>

              <Rise enter={enter} from={0.07}>
                <Text style={[styles.lede, { color: colors.textSecondary }]}>
                  NutriTrack is the nutrition and activity tracker that keeps
                  calories, macros, water and habits in one calm, beautiful
                  place. Your data stays on your device unless you choose to
                  share it.
                </Text>
              </Rise>

              <Rise enter={enter} from={0.14}>
                <View style={styles.ctas}>
                  <GradientButton
                    label="Get started"
                    colors={grad}
                    onPress={() => router.push('/app')}
                    icon="arrow-forward"
                  />
                  <GhostButton
                    label="I already have an account"
                    onPress={() => router.push('/login')}
                  />
                </View>
              </Rise>

              <Rise enter={enter} from={0.21}>
                <View style={styles.trust}>
                  {TRUST.map((t) => (
                    <View key={t} style={styles.trustItem}>
                      <Ionicons name="checkmark-circle" size={15} color={colors.primary} />
                      <Text style={[styles.trustText, { color: colors.textMuted }]}>{t}</Text>
                    </View>
                  ))}
                </View>
              </Rise>
            </View>

            <View style={styles.heroArt}>
              <PhonePreview enter={enter} />
            </View>
          </View>

          {/* features */}
          <View style={styles.section}>
            <Text style={[styles.h2, { color: colors.text }]}>Everything you need, nothing you don’t</Text>
            <Text style={[styles.sectionLede, { color: colors.textSecondary }]}>
              Six things the app actually does — each one a screen you can open today.
            </Text>
            <View style={styles.grid}>
              <WaterLead />
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

          {/* how it works — a different composition from the card grid above */}
          <View style={styles.section}>
            <Text style={[styles.h2, { color: colors.text }]}>How it works</Text>
            <Card style={styles.flow}>
              <View style={[styles.flowRow, wide && styles.flowRowWide]}>
                {STEPS.map((s, i) => (
                  <View
                    key={s.n}
                    style={[
                      styles.flowCol,
                      wide && styles.flowColWide,
                      wide && i > 0 && styles.flowColRule,
                      wide && { borderLeftColor: colors.divider },
                    ]}
                  >
                    <Text style={[styles.flowNum, { color: colors.primary }]}>{s.n}</Text>
                    <Text style={[typography.h3, { color: colors.text }]}>{s.title}</Text>
                    <Text style={[typography.bodySm, { color: colors.textSecondary }]}>{s.body}</Text>
                  </View>
                ))}
              </View>
            </Card>
          </View>

          {/* closing cta */}
          <Card style={styles.closing}>
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
  navLink: {
    flexDirection: 'row', alignItems: 'center', gap: 7,
    paddingHorizontal: spacing.md, paddingVertical: 9,
    borderRadius: radius.full, borderWidth: 1, overflow: 'hidden',
  },

  hero: { paddingTop: spacing.xl, paddingBottom: spacing.xxl, gap: spacing.xl },
  heroWide: { flexDirection: 'row', alignItems: 'center', gap: spacing.xxl },
  heroCopy: { flex: 1, gap: spacing.lg },
  heroArt: { flex: 1, alignItems: 'center' },
  heroArtInner: { alignItems: 'center' },

  h1: { fontSize: 52, fontWeight: '800', letterSpacing: -2, lineHeight: 56 },
  lede: { ...typography.body, fontSize: 17, lineHeight: 26, maxWidth: 620 },

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
  sectionLede: { ...typography.body, maxWidth: 560 },

  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md, marginTop: spacing.sm },
  feature: { flexGrow: 1, flexBasis: '100%', gap: spacing.sm, padding: spacing.lg },
  featureIcon: {
    width: 42, height: 42, borderRadius: radius.md,
    alignItems: 'center', justifyContent: 'center', marginBottom: spacing.xs,
  },

  // lead card: wide, with the real water panel inside
  lead: { gap: spacing.lg },
  leadTop: { flexDirection: 'row', gap: spacing.md, alignItems: 'flex-start' },
  leadHead: { flex: 1, gap: 4 },
  leadPanel: {
    borderRadius: radius.lg, borderWidth: 1, padding: spacing.md, gap: 4,
  },
  leadPanelHead: { flexDirection: 'row', alignItems: 'center' },
  leadFigure: { fontSize: 28, fontWeight: '800', letterSpacing: -0.8 },
  leadBar: { height: 6, borderRadius: radius.full, overflow: 'hidden', marginTop: spacing.sm },
  leadBarFill: { height: '100%', borderRadius: radius.full },
  leadBtns: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm },
  leadBtn: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    paddingVertical: 9, borderRadius: radius.sm, borderWidth: 1, overflow: 'hidden',
  },

  // how it works
  flow: { marginTop: spacing.sm, padding: spacing.lg },
  flowRow: { gap: spacing.lg },
  flowRowWide: { flexDirection: 'row' },
  flowCol: { gap: spacing.sm, flex: 1 },
  flowColWide: { paddingLeft: spacing.lg, paddingRight: spacing.lg },
  flowColRule: { borderLeftWidth: StyleSheet.hairlineWidth },
  flowNum: { fontSize: 26, fontWeight: '800', letterSpacing: -1 },

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
