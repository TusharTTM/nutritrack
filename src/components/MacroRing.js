import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';
import { useApp } from '../context/AppContext';
import { typography, spacing } from '../utils/theme';

export default function MacroRing({ value = 0, goal = 100, color, label, unit = 'g', size = 72 }) {
  const { colors } = useApp();
  const sw = 5;
  const r = (size - sw * 2) / 2;
  const circ = 2 * Math.PI * r;
  const prog = Math.min(value / (goal || 1), 1);
  const offset = circ * (1 - prog);
  const over = value > goal;

  return (
    <View style={styles.wrap}>
      <Svg width={size} height={size}>
        <G rotation="-90" origin={`${size / 2},${size / 2}`}>
          <Circle cx={size/2} cy={size/2} r={r} stroke={colors.cardBorder} strokeWidth={sw} fill="none" />
          <Circle
            cx={size/2} cy={size/2} r={r}
            stroke={over ? colors.error : color}
            strokeWidth={sw} fill="none"
            strokeDasharray={circ} strokeDashoffset={offset}
            strokeLinecap="round"
          />
        </G>
      </Svg>
      <View style={[StyleSheet.absoluteFill, styles.center]}>
        <Text style={[styles.val, { color: over ? colors.error : color }]}>{Math.round(value)}</Text>
        <Text style={[typography.micro, { color: colors.textMuted }]}>{unit}</Text>
      </View>
      <Text style={[typography.micro, { color: colors.textSecondary, marginTop: spacing.xs, textTransform: 'uppercase' }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center' },
  center: { alignItems: 'center', justifyContent: 'center' },
  val: { fontSize: 15, fontWeight: '700', lineHeight: 18 },
});
