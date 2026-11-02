import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useApp } from '../context/AppContext';
import { radius, spacing, shadow } from '../utils/theme';

export default function Card({ children, style, onPress, elevated = false, noPad = false }) {
  const { colors } = useApp();
  const cardStyle = [
    styles.card,
    {
      backgroundColor: elevated ? colors.cardElevated : colors.card,
      borderColor: colors.cardBorder,
    },
    elevated && shadow.sm,
    !noPad && styles.pad,
    style,
  ];
  const content = (
    <>
      <LinearGradient
        pointerEvents="none"
        colors={colors.glassHighlight}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.9, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />
      {children}
    </>
  );

  if (onPress) {
    return (
      <TouchableOpacity style={cardStyle} onPress={onPress} activeOpacity={0.78}>
        {content}
      </TouchableOpacity>
    );
  }
  return <View style={cardStyle}>{content}</View>;
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.xl,
    borderWidth: 1,
    overflow: 'hidden',
  },
  pad: {
    padding: spacing.md,
  },
});