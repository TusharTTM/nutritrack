// NutriTrack — "Ink & Lime" (bold, high-contrast, energetic).
// Off-white paper + near-black ink, with vivid lime as the hero/glow accent
// and a deep, readable lime for text & fills on light surfaces. Lime always
// pairs with ink text; deep lime pairs with white text on light.
export const gradients = {
  brand: ['#DFFA8A', '#C6F24E', '#A3E635'], // decorative pale→lime→deep
  brandSoft: ['rgba(198, 242, 78, 0.22)', 'rgba(120, 200, 40, 0.05)'],
  ctaDark: ['#D4F75E', '#A8D62E'], // vivid lime — dark surfaces (ink label)
  ctaLight: ['#5E8F0C', '#4A7508'], // deep lime — light surfaces (white label)
  accent: ['#E8C64E', '#D9A21E'],
  aqua: ['#A8D62E', '#2FB89E'],
  sheen: ['rgba(255, 255, 255, 0.7)', 'rgba(255, 255, 255, 0.18)'],
};

export const ctaGradient = (theme) => (theme === 'dark' ? gradients.ctaDark : gradients.ctaLight);

export const brand = {
  markFrom: '#E4FF9E',
  markVia: '#C6F24E',
  markTo: '#7CB82A',
  glow: 'rgba(198, 242, 78, 0.45)',
};

export const darkColors = {
  bg: '#0E100B', bgSecondary: '#14170F', bgTertiary: '#1C2015', shadow: '#000000',
  card: 'rgba(220, 235, 180, 0.05)', cardBorder: 'rgba(200, 225, 140, 0.14)', cardElevated: 'rgba(220, 235, 180, 0.085)',
  primary: '#C6F24E', primaryLight: '#DAFB8E', primaryDark: '#A3E635', primaryMuted: 'rgba(198, 242, 78, 0.16)', primarySurface: 'rgba(198, 242, 78, 0.12)',
  accent: '#F0B44E', accentPink: '#F58BBE',
  glassHighlight: ['rgba(255, 255, 255, 0.10)', 'rgba(230, 250, 190, 0.05)', 'rgba(255, 255, 255, 0.01)'],
  backgroundGradient: ['#0E100B', '#141810', '#10130C'],
  text: '#F2F4EC', textSecondary: '#C3C8B6', textMuted: '#8A9078', textInverse: '#0E100B',
  success: '#5FD07A', error: '#FF6B5C', warning: '#F0B44E', info: '#5AB4F0',
  protein: '#9A9AF5', carbs: '#F2C14E', fat: '#F58BBE', fiber: '#4FD6C6', water: '#5AB4F0',
  border: 'rgba(200, 225, 140, 0.14)', borderLight: 'rgba(200, 225, 140, 0.07)', divider: 'rgba(200, 225, 140, 0.10)',
  overlay: 'rgba(5, 7, 3, 0.72)', tabBar: 'rgba(14, 16, 11, 0.9)', statusBar: 'light',
};
export const lightColors = {
  bg: '#F5F5F0', bgSecondary: '#FFFFFF', bgTertiary: '#E7E8DE', shadow: '#1A1C14',
  card: 'rgba(255, 255, 255, 0.66)', cardBorder: 'rgba(20, 22, 14, 0.13)', cardElevated: 'rgba(255, 255, 255, 0.9)',
  primary: '#4A7508', primaryLight: '#3E6606', primaryDark: '#33570A', primaryMuted: 'rgba(74, 117, 8, 0.12)', primarySurface: 'rgba(74, 117, 8, 0.10)',
  accent: '#B7791A', accentPink: '#D6538A',
  glassHighlight: ['rgba(255, 255, 255, 0.72)', 'rgba(255, 255, 255, 0.22)', 'rgba(255, 255, 255, 0.05)'],
  backgroundGradient: ['#F5F5F0', '#FBFBF6', '#EDEEE4'],
  text: '#14170E', textSecondary: '#4A4F42', textMuted: '#74796A', textInverse: '#FFFFFF',
  success: '#2F9E5A', error: '#C62B1E', warning: '#A9690F', info: '#2A7AB8',
  protein: '#5B5BD6', carbs: '#B47A12', fat: '#C24A7C', fiber: '#17857A', water: '#2A7AB8',
  border: 'rgba(20, 22, 14, 0.13)', borderLight: 'rgba(20, 22, 14, 0.06)', divider: 'rgba(20, 22, 14, 0.10)',
  overlay: 'rgba(20, 22, 14, 0.42)', tabBar: 'rgba(245, 245, 240, 0.92)', statusBar: 'dark',
};
export const spacing = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48 };
export const radius = { xs: 6, sm: 10, md: 14, lg: 20, xl: 28, full: 999 };
const textFit = { flexShrink: 1, minWidth: 0 };
export const typography = {
  displayLg: { ...textFit, fontSize: 34, fontWeight: '800', letterSpacing: -1 },
  displayMd: { ...textFit, fontSize: 28, fontWeight: '800', letterSpacing: -0.8 },
  h1: { ...textFit, fontSize: 24, fontWeight: '700', letterSpacing: -0.5 },
  h2: { ...textFit, fontSize: 20, fontWeight: '700', letterSpacing: -0.3 },
  h3: { ...textFit, fontSize: 17, fontWeight: '600', letterSpacing: -0.2 },
  h4: { ...textFit, fontSize: 15, fontWeight: '600' },
  body: { ...textFit, fontSize: 15, fontWeight: '400', lineHeight: 22 },
  bodyMed: { ...textFit, fontSize: 15, fontWeight: '500' },
  bodySm: { ...textFit, fontSize: 13, fontWeight: '400', lineHeight: 18 },
  bodySmMed: { ...textFit, fontSize: 13, fontWeight: '500' },
  caption: { ...textFit, fontSize: 12, fontWeight: '400' },
  label: { ...textFit, fontSize: 12, fontWeight: '600' },
  micro: { ...textFit, fontSize: 11, fontWeight: '500' },
};
export const shadow = {
  sm: { shadowColor: '#1A1C14', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.10, shadowRadius: 10, elevation: 2 },
  md: { shadowColor: '#1A1C14', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.14, shadowRadius: 16, elevation: 4 },
  lg: { shadowColor: '#1A1C14', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.18, shadowRadius: 24, elevation: 6 },
  glow: (color) => ({ shadowColor: color, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.3, shadowRadius: 16, elevation: 5 }),
};
export const colors = darkColors;
