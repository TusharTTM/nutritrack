import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';

const ICON_BY_MEAL = {
  Breakfast: 'sunny',
  Lunch: 'restaurant',
  Dinner: 'moon',
  Snacks: 'nutrition',
};
// Rotating set for user-created meal types.
const CUSTOM_ICONS = ['fast-food', 'cafe', 'ice-cream', 'pizza', 'wine', 'flame', 'leaf'];

export function mealColor(meal, colors) {
  const c = colors;
  const map = { Breakfast: c.warning, Lunch: c.primary, Dinner: c.info, Snacks: c.fiber };
  return map[meal] || c.primary;
}

export default function MealGlyph({ meal, index = 0, size = 22, color }) {
  const { colors } = useApp();
  const tint = color || mealColor(meal, colors);
  const glyph = ICON_BY_MEAL[meal] || CUSTOM_ICONS[index % CUSTOM_ICONS.length];
  return <Ionicons name={glyph} size={size} color={tint} />;
}
