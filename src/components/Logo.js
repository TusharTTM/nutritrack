import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Path, Stop } from 'react-native-svg';
import { useApp } from '../context/AppContext';
import { brand } from '../utils/theme';

/**
 * NutriTrack brand mark — a fresh sprout resting in a bowl, drawn as SVG so it
 * stays crisp at any size and matches the app icon. `variant="mono"` renders the
 * glyph only (no gradient plate) for use on coloured or dark backgrounds.
 */
export function LogoMark({ size = 44, variant = 'gradient', rounded = true }) {
  const gid = `ntLogo${variant}${Math.round(size)}`;
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64">
      {variant === 'gradient' && (
        <Defs>
          <LinearGradient id={gid} x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={brand.markFrom} />
            <Stop offset="0.5" stopColor={brand.markVia} />
            <Stop offset="1" stopColor={brand.markTo} />
          </LinearGradient>
        </Defs>
      )}
      {variant === 'gradient' && (
        <Rect x="2" y="2" width="60" height="60" rx={rounded ? 18 : 0} fill={`url(#${gid})`} />
      )}
      {/* bowl */}
      <Path d="M13 46 Q32 60 51 46" stroke="#FFFFFF" strokeWidth="4.6" fill="none" strokeLinecap="round" opacity="0.96" />
      {/* stem */}
      <Path d="M32 47 V29" stroke="#FFFFFF" strokeWidth="4.6" fill="none" strokeLinecap="round" />
      {/* leaves */}
      <Path d="M32 34 C23 34 17 28 17 19 C27 19 32 25 32 34 Z" fill="#FFFFFF" />
      <Path d="M32 34 C41 34 47 28 47 19 C37 19 32 25 32 34 Z" fill="#FFFFFF" />
    </Svg>
  );
}

/**
 * Full logo: brand mark + wordmark. Pass `layout="stack"` for a vertical
 * (icon above text) arrangement, e.g. the onboarding hero.
 */
export default function Logo({ size = 40, layout = 'row', markVariant = 'gradient', wordmarkColor, style }) {
  const { colors } = useApp();
  const markColor = wordmarkColor || colors.text;
  const accent = colors.primaryLight;

  const wordmark = (
    <View style={layout === 'stack' ? styles.wordStack : styles.wordRow}>
      <Text style={[layout === 'stack' ? styles.wordStackText : styles.wordText, { color: markColor }]} numberOfLines={1}>
        Nutri<Text style={{ color: accent }}>Track</Text>
      </Text>
    </View>
  );

  if (layout === 'stack') {
    return (
      <View style={[styles.stack, style]}>
        <LogoMark size={size} variant={markVariant} />
        {wordmark}
      </View>
    );
  }
  return (
    <View style={[styles.row, style]}>
      <LogoMark size={size} variant={markVariant} />
      {wordmark}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  stack: { alignItems: 'center', gap: 14 },
  wordRow: { flexShrink: 1, minWidth: 0 },
  wordStack: { alignItems: 'center' },
  wordText: { fontSize: 21, fontWeight: '800', letterSpacing: -0.5 },
  wordStackText: { fontSize: 32, fontWeight: '800', letterSpacing: -0.8 },
});
