import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';

// Map each built-in activity to a crisp vector icon (replacing emoji) plus a
// category colour. Unknown/custom activities fall back by category.
const ICON_BY_NAME = {
  Walking: 'walk', Running: 'flash', Cycling: 'bicycle', Swimming: 'water',
  HIIT: 'flame', 'Jump Rope': 'repeat', Dancing: 'musical-notes', Hiking: 'walk',
  Rowing: 'boat', Yoga: 'accessibility', Pilates: 'body', 'Weight Training': 'barbell',
  Basketball: 'basketball', Football: 'american-football', Tennis: 'tennisball',
  Custom: 'sparkles',
};
const ICON_BY_CATEGORY = {
  Cardio: 'fitness', Strength: 'barbell', Flexibility: 'body', Sport: 'trophy', Other: 'sparkles',
};

export function activityColor(category, colors) {
  const c = colors;
  const map = { Cardio: c.warning, Strength: c.primary, Flexibility: c.info, Sport: c.accent, Other: c.textSecondary };
  return map[category] || c.warning;
}

export default function ActivityIcon({ name, category, size = 24, color }) {
  const { colors } = useApp();
  const glyph = ICON_BY_NAME[name] || ICON_BY_CATEGORY[category] || 'fitness';
  const tint = color || activityColor(category, colors);
  return <Ionicons name={glyph} size={size} color={tint} />;
}
