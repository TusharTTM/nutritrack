import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop, Path } from 'react-native-svg';
import { useApp } from '../context/AppContext';
import { typography } from '../utils/theme';

export default function CalorieRing({ consumed = 0, goal = 2000, burned = 0, size = 200 }) {
  const { colors } = useApp();
  const strokeWidth = 14;
  const radius = (size - strokeWidth * 2) / 2;
  const center = size / 2;
  const netCalories = Math.max(consumed - burned, 0);
  const progress = Math.min(netCalories / Math.max(goal, 1), 1);
  const over = netCalories > goal;
  const remaining = Math.max(goal - netCalories, 0);
  const startY = center - radius;
  const endAngle = -Math.PI / 2 + 2 * Math.PI * progress;
  const endX = center + radius * Math.cos(endAngle);
  const endY = center + radius * Math.sin(endAngle);
  const progressPath = progress >= 1
    ? ['M', center, startY, 'A', radius, radius, 0, 1, 1, center, center + radius,
      'A', radius, radius, 0, 1, 1, center, startY].join(' ')
    : ['M', center, startY, 'A', radius, radius, 0, progress > 0.5 ? 1 : 0, 1, endX, endY].join(' ');

  return (
    <View style={{ alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size}>
        <Defs>
          <LinearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={over ? colors.error : colors.primaryLight} />
            <Stop offset="1" stopColor={over ? colors.error : colors.primary} />
          </LinearGradient>
        </Defs>
        <Circle
          cx={center} cy={center} r={radius}
          stroke={colors.cardBorder} strokeWidth={strokeWidth} fill="none"
        />
        {progress > 0 && (
          <Path
            d={progressPath}
            stroke="url(#ringGrad)"
            strokeWidth={strokeWidth}
            fill="none"
            strokeLinecap="round"
          />
        )}
      </Svg>

      <View style={[StyleSheet.absoluteFill, { alignItems: 'center', justifyContent: 'center' }]}>
        <Text style={[typography.displayMd, { color: colors.text, lineHeight: 36 }]}>
          {Math.round(consumed)}
        </Text>
        <Text style={[typography.label, { color: colors.textMuted, marginTop: 2 }]}>CONSUMED</Text>
        <View style={[styles.divider, { backgroundColor: colors.border }]} />
        <Text style={[typography.label, { color: over ? colors.error : colors.textSecondary, fontSize: 10 }]}>
          {over ? 'OVER GOAL' : 'REMAINING'}
        </Text>
        <Text style={[typography.h3, { color: over ? colors.error : colors.primaryLight }]}>
          {over ? ('+' + Math.round(consumed - goal)) : Math.round(remaining)}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  divider: { width: 32, height: 1, marginVertical: 6 },
});