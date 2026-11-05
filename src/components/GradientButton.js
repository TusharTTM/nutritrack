import React from 'react';
import { Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { gradients, radius, spacing, shadow, typography } from '../utils/theme';

/**
 * Primary call-to-action with the NutriTrack brand gradient. Falls back to a
 * muted surface while disabled so it never looks broken.
 */
export default function GradientButton({
  label, onPress, disabled = false, loading = false, icon, iconPosition = 'right',
  size = 'lg', full = true, style, textStyle, accessibilityLabel,
}) {
  const { colors } = useApp();
  const pad = size === 'lg' ? spacing.md + 4 : spacing.sm + 6;
  const fontSize = size === 'lg' ? typography.h4.fontSize : typography.bodyMed.fontSize;

  const content = (
    <>
      {loading ? <ActivityIndicator size="small" color={colors.textInverse} /> : null}
      {!loading && icon && iconPosition === 'left' ? (
        <Ionicons name={icon} size={fontSize + 3} color={colors.textInverse} style={styles.iconLeft} />
      ) : null}
      <Text numberOfLines={1} style={[styles.label, { fontSize, color: colors.textInverse }, textStyle]}>{label}</Text>
      {!loading && icon && iconPosition === 'right' ? (
        <Ionicons name={icon} size={fontSize + 3} color={colors.textInverse} style={styles.iconRight} />
      ) : null}
    </>
  );

  if (disabled) {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel || label}
        style={[styles.btn, styles.muted, { paddingVertical: pad, backgroundColor: colors.cardBorder, borderRadius: radius.xl }, full && styles.full, style]}
      >
        <Text numberOfLines={1} style={[styles.label, { fontSize, color: colors.textMuted }, textStyle]}>{label}</Text>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || label}
      style={[styles.btn, { paddingVertical: pad, borderRadius: radius.xl }, full && styles.full, shadow.md, style]}
    >
      <LinearGradient
        colors={gradients.brandStrong}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />
      {content}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    overflow: 'hidden',
  },
  muted: { opacity: 0.8 },
  full: { alignSelf: 'stretch' },
  label: { fontWeight: '700', letterSpacing: -0.2 },
  iconLeft: { marginRight: spacing.sm },
  iconRight: { marginLeft: spacing.sm },
});
