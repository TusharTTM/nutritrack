import React from 'react';
import Svg, { Path, Circle } from 'react-native-svg';
import { useApp } from '../context/AppContext';

// Clean, hand-drawn line/solid glyphs for each food group so the app has a
// consistent branded icon set instead of platform emoji.
const GLYPHS = {
  fruits: (c) => [
    <Path key="b" d="M12 8.4c-2.4 0-3.9 2-3.9 4.6 0 2.8 2 5.3 3.9 5.3s3.9-2.5 3.9-5.3c0-2.6-1.5-4.6-3.9-4.6z" fill={c} />,
    <Path key="v" d="M12 8.6C12 6 13.4 4 15.6 3.4c.5 2.4-1 4.6-3.2 5.3z" fill={c} />,
    <Path key="s" d="M12 8.4V5.6" stroke={c} strokeWidth="1.7" strokeLinecap="round" fill="none" />,
  ],
  vegetables: (c) => [
    <Path key="l" d="M12 21c-5.2-3.2-6.7-10.4 0-18 6.7 7.6 5.2 14.8 0 18z" fill={c} />,
    <Path key="v" d="M12 21V6.5" stroke="rgba(0,0,0,0.28)" strokeWidth="1.5" strokeLinecap="round" fill="none" />,
  ],
  protein: (c) => [
    <Path key="b" d="M3.6 12c2.9-3.7 8.4-3.7 11.3 0-2.9 3.7-8.4 3.7-11.3 0z" fill={c} />,
    <Path key="t" d="M14.9 12 19 9.3v5.4z" fill={c} />,
    <Circle key="e" cx="7.6" cy="11" r="0.95" fill="rgba(0,0,0,0.4)" />,
  ],
  dairy: (c) => [
    <Path key="b" d="M7.6 9.2h8.8l1.3 10.6a1 1 0 0 1-1 1.1H7.3a1 1 0 0 1-1-1.1z" stroke={c} strokeWidth="1.7" strokeLinejoin="round" fill="none" />,
    <Path key="r" d="M7.6 9.2 9.1 4.4h5.8l1.5 4.8" stroke={c} strokeWidth="1.7" strokeLinejoin="round" fill="none" />,
    <Path key="l" d="M7.9 13.4h8.2" stroke={c} strokeWidth="1.4" strokeLinecap="round" fill="none" />,
  ],
  grains: (c) => [
    <Path key="s" d="M12 21.5V7" stroke={c} strokeWidth="1.7" strokeLinecap="round" fill="none" />,
    <Path key="t" d="M12 7c1.3 1.3 1.3 2.9 0 4.2-1.3-1.3-1.3-2.9 0-4.2z" fill={c} />,
    <Path key="p1" d="M12 11.6 9.2 9.8M12 11.6l2.8-1.8" stroke={c} strokeWidth="1.6" strokeLinecap="round" fill="none" />,
    <Path key="p2" d="M12 15.4 9.2 13.6M12 15.4l2.8-1.8" stroke={c} strokeWidth="1.6" strokeLinecap="round" fill="none" />,
    <Path key="p3" d="M12 19 9.2 17.2M12 19l2.8-1.8" stroke={c} strokeWidth="1.6" strokeLinecap="round" fill="none" />,
  ],
  legumes: (c) => [
    <Circle key="a" cx="8.6" cy="8.6" r="2.5" fill={c} />,
    <Circle key="b" cx="15.6" cy="10.4" r="2.3" fill={c} opacity="0.92" />,
    <Circle key="d" cx="11.4" cy="15.4" r="2.7" fill={c} opacity="0.84" />,
  ],
  nuts: (c) => [
    <Path key="p" d="M12 3.6c2.9 0 5 3.2 4.2 6.6 2.6 2.4 2.2 6.6-.9 8.6-1.4.9-3 .9-4.4.2-2.9 1-6-.8-6.5-3.9-.4-2.6 1-5 3.4-6 .2-3.2 1.8-5.5 4.2-5.5z" stroke={c} strokeWidth="1.6" strokeLinejoin="round" fill="none" />,
    <Path key="w" d="M8.2 11.6c2.4 1.2 5.2 1.2 7.6 0" stroke={c} strokeWidth="1.4" strokeLinecap="round" fill="none" />,
  ],
  snacks: (c) => [
    <Circle key="c" cx="12" cy="12" r="8.2" stroke={c} strokeWidth="1.7" fill="none" />,
    <Circle key="a" cx="9.3" cy="9.4" r="1.15" fill={c} />,
    <Circle key="b" cx="14.9" cy="10.4" r="1.05" fill={c} />,
    <Circle key="d" cx="10.6" cy="14.8" r="1.1" fill={c} />,
    <Circle key="e" cx="14.6" cy="15.1" r="0.95" fill={c} />,
  ],
  beverages: (c) => [
    <Path key="g" d="M6.6 6.2h10.8l-1.3 12.4a1.4 1.4 0 0 1-1.4 1.3H9.3a1.4 1.4 0 0 1-1.4-1.3z" stroke={c} strokeWidth="1.7" strokeLinejoin="round" fill="none" />,
    <Path key="l" d="M6.2 6.2h11.6" stroke={c} strokeWidth="1.7" strokeLinecap="round" fill="none" />,
    <Path key="s" d="M14.4 5.6 16 2.6" stroke={c} strokeWidth="1.5" strokeLinecap="round" fill="none" />,
  ],
  indian: (c) => [
    <Path key="bowl" d="M3.8 13.4h16.4a8.2 7.4 0 0 1-16.4 0z" stroke={c} strokeWidth="1.7" strokeLinejoin="round" fill="none" />,
    <Path key="rim" d="M3 13.4h18" stroke={c} strokeWidth="1.7" strokeLinecap="round" fill="none" />,
    <Path key="s1" d="M8.6 9.4c0-1.2.9-1.3.9-2.6M12 8.2c0-1.2.9-1.3.9-2.6M15.4 9.4c0-1.2.9-1.3.9-2.6" stroke={c} strokeWidth="1.5" strokeLinecap="round" fill="none" />,
  ],
  custom: (c) => [
    <Path key="sp" d="M12 3.4 13.7 8l4.9 1.4-3.6 3.3.9 4.8-4-2.3-4 2.3.9-4.8L4.9 9.4 9.8 8z" stroke={c} strokeWidth="1.6" strokeLinejoin="round" fill="none" />,
  ],
  bowl: (c) => [
    <Path key="b" d="M3.6 12.4h16.8a8.4 7.6 0 0 1-16.8 0z" stroke={c} strokeWidth="1.7" strokeLinejoin="round" fill="none" />,
    <Path key="s" d="M9 6.6c0-1.4 1.4-1.6 1.4-3M13.4 6.6c0-1.4 1.4-1.6 1.4-3" stroke={c} strokeWidth="1.5" strokeLinecap="round" fill="none" />,
  ],
};

const KEY_BY_CATEGORY = {
  fruits: 'fruits', vegetables: 'vegetables', protein: 'protein', dairy: 'dairy',
  grains: 'grains', legumes: 'legumes', 'nuts & seeds': 'nuts', snacks: 'snacks',
  beverages: 'beverages', indian: 'indian', custom: 'custom',
};

/** Brand colour for a food category. Pass the themed `colors` object. */
export function categoryColor(category, colors) {
  const c = colors;
  const map = {
    Fruits: c.error, Vegetables: c.fiber, Protein: c.info, Dairy: c.protein,
    Grains: c.carbs, Legumes: c.success, 'Nuts & Seeds': c.fat, Snacks: c.accentPink,
    Beverages: c.water, Indian: c.warning, Custom: c.primary,
  };
  return map[category] || c.primary;
}

export default function CategoryIcon({ category, size = 24, color }) {
  const { colors } = useApp();
  const tint = color || categoryColor(category, colors);
  const key = KEY_BY_CATEGORY[String(category || '').toLowerCase()] || 'bowl';
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {GLYPHS[key](tint)}
    </Svg>
  );
}
