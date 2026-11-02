import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';
import { useApp } from '../context/AppContext';
import { typography } from '../utils/theme';

export default function ProgressRing({ value = 0, max = 100, size = 56, strokeWidth = 5, color, label, sublabel }) {
  const { colors } = useApp();
  const c = color || colors.primary;
  const r = (size - strokeWidth * 2) / 2;
  const circ = 2 * Math.PI * r;
  const prog = Math.min(value / (max || 1), 1);
  const offset = circ * (1 - prog);

  return (
    <View style={styles.wrap}>
      <Svg width={size} height={size}>
        <G rotation="-90" origin={`${size/2},${size/2}`}>
          <Circle cx={size/2} cy={size/2} r={r} stroke={colors.cardBorder} strokeWidth={strokeWidth} fill="none" />
          <Circle
            cx={size/2} cy={size/2} r={r}
            stroke={c} strokeWidth={strokeWidth} fill="none"
            strokeDasharray={circ} strokeDashoffset={offset}
            strokeLinecap="round"
          />
        </G>
      </Svg>
      {(label || sublabel) && (
        <View style={[StyleSheet.absoluteFill, styles.center]}>
          {label ? <Text style={[typography.bodySmMed, { color: c }]}>{label}</Text> : null}
          {sublabel ? <Text style={[typography.micro, { color: colors.textMuted }]}>{sublabel}</Text> : null}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center' },
  center: { alignItems: 'center', justifyContent: 'center' },
});
