import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useApp } from '../context/AppContext';
import { LogoMark } from './Logo';
import { spacing, typography } from '../utils/theme';

export default function ScreenHeader({ title, subtitle, children, showLogo = true }) {
  const { colors } = useApp();
  return (
    <View style={styles.wrap}>
      <LinearGradient
        pointerEvents="none"
        colors={[colors.primarySurface, 'transparent']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.6, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />
      <View style={styles.header}>
        {showLogo && (
          <View style={styles.logoWrap}>
            <LogoMark size={36} />
          </View>
        )}
        <View style={styles.titleWrap}>
          <Text numberOfLines={1} ellipsizeMode="tail" style={[typography.h1, styles.title, { color: colors.text }]}>
            {title}
          </Text>
          {subtitle ? (
            <Text numberOfLines={1} style={[typography.caption, { color: colors.textMuted, marginTop: 1 }]}>{subtitle}</Text>
          ) : null}
        </View>
        {children ? <View style={styles.actions}>{children}</View> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { overflow: 'hidden' },
  header: {
    minWidth: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    gap: spacing.sm,
  },
  logoWrap: { marginRight: spacing.xs },
  titleWrap: { flex: 1, minWidth: 0 },
  title: {},
  actions: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
});
