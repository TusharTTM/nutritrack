import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useApp } from '../context/AppContext';
import { spacing, typography } from '../utils/theme';

export default function ScreenHeader({ title, children }) {
  const { colors } = useApp();
  return (
    <View style={styles.header}>
      <Text numberOfLines={1} style={[typography.h1, styles.title, { color: colors.text }]}>
        {title}
      </Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    minWidth: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  title: { flex: 1, marginRight: spacing.sm },
});
