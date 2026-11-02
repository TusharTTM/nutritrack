import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useApp } from '../context/AppContext';
import { typography, radius, spacing } from '../utils/theme';

export default function Badge({ label, color, icon, size = 'md' }) {
  const { colors } = useApp();
  const c = color || colors.primary;
  const small = size === 'sm';
  return (
    <View style={[
      styles.badge,
      { backgroundColor: c + '20', borderColor: c + '40' },
      small && styles.badgeSm,
    ]}>
      {icon ? <Text style={small ? styles.iconSm : styles.icon}>{icon}</Text> : null}
      <Text style={[
        small ? typography.micro : typography.label,
        { color: c },
      ]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  badgeSm: {
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  icon: { fontSize: 12 },
  iconSm: { fontSize: 10 },
});
