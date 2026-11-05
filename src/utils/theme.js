// NutriTrack — "Sunset" palette (warm coral / peach / amber).
// Energetic, appetite-friendly warm neutrals with a single coral accent,
// tinted (never pure black/white) surfaces, WCAG-minded contrast, and
// theme-aware CTA gradients so labels stay readable in both themes.
export const gradients = {
  brand: ['#FFB067', '#FF7A59', '#F0594A'], // decorative peach→coral→deep
  brandSoft: ['rgba(255, 122, 89, 0.22)', 'rgba(240, 89, 74, 0.05)'],
  ctaDark: ['#FF8A63', '#FF6B45'], // bright coral — dark-theme buttons (dark label)
  ctaLight: ['#D64524', '#B93A1B'], // deep coral — light-theme buttons (white label)
  accent: ['#F5A04A', '#E8792B'],
  aqua: ['#FF9E80', '#FF7A59'],
  sheen: ['rgba(255, 255, 255, 0.7)', 'rgba(255, 255, 255, 0.18)'],
};

export const ctaGradient = (theme) => (theme === 'dark' ? gradients.ctaDark : gradients.ctaLight);

export const brand = {
  markFrom: '#FFC38A',
  markVia: '#FF8A63',
  markTo: '#F0594A',
  glow: 'rgba(255, 122, 89, 0.42)',
};

export const darkColors = {
  bg: '#17100C', bgSecondary: '#20150F', bgTertiary: '#2B1C14', shadow: '#000000',
  card: 'rgba(255, 220, 200, 0.055)', cardBorder: 'rgba(255, 190, 160, 0.16)', cardElevated: 'rgba(255, 220, 200, 0.09)',
  primary: '#FF7A59', primaryLight: '#FFA088', primaryDark: '#E85A3C', primaryMuted: 'rgba(255, 122, 89, 0.16)', primarySurface: 'rgba(255, 122, 89, 0.13)',
  accent: '#FFA14A', accentPink: '#FF8FA8',
  glassHighlight: ['rgba(255, 255, 255, 0.10)', 'rgba(255, 220, 200, 0.05)', 'rgba(255, 255, 255, 0.01)'],
  backgroundGradient: ['#17100C', '#221610', '#1A110C'],
  text: '#F7EDE6', textSecondary: '#C9B6A8', textMuted: '#9C8878', textInverse: '#1A0E07',
  success: '#58C57E', error: '#FF6B5C', warning: '#F0B44E', info: '#4FBBD4',
  protein: '#FF7A66', carbs: '#F5B14E', fat: '#FF8FA8', fiber: '#6FCB7C', water: '#4FBBD4',
  border: 'rgba(255, 190, 160, 0.16)', borderLight: 'rgba(255, 190, 160, 0.08)', divider: 'rgba(255, 190, 160, 0.12)',
  overlay: 'rgba(10, 5, 2, 0.72)', tabBar: 'rgba(23, 16, 12, 0.9)', statusBar: 'light',
};
export const lightColors = {
  bg: '#FFF5EE', bgSecondary: '#FFEDE3', bgTertiary: '#F7DCCB', shadow: '#4A2A1A',
  card: 'rgba(255, 255, 255, 0.62)', cardBorder: 'rgba(180, 90, 60, 0.18)', cardElevated: 'rgba(255, 255, 255, 0.85)',
  primary: '#D64524', primaryLight: '#B93A1B', primaryDark: '#9C2E12', primaryMuted: 'rgba(214, 69, 36, 0.12)', primarySurface: 'rgba(214, 69, 36, 0.10)',
  accent: '#E8792B', accentPink: '#E8718F',
  glassHighlight: ['rgba(255, 255, 255, 0.7)', 'rgba(255, 255, 255, 0.2)', 'rgba(255, 255, 255, 0.05)'],
  backgroundGradient: ['#FFF5EE', '#FFEDE3', '#FFE1D2'],
  text: '#2E1A11', textSecondary: '#6B4E3F', textMuted: '#987362', textInverse: '#FFFFFF',
  success: '#2F8A52', error: '#C62B1E', warning: '#B7791A', info: '#2A8AB0',
  protein: '#D6553F', carbs: '#DE9A2B', fat: '#E0718F', fiber: '#4F9A57', water: '#2FA0BE',
  border: 'rgba(180, 90, 60, 0.18)', borderLight: 'rgba(180, 90, 60, 0.09)', divider: 'rgba(180, 90, 60, 0.13)',
  overlay: 'rgba(60, 30, 20, 0.42)', tabBar: 'rgba(255, 245, 238, 0.9)', statusBar: 'dark',
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
  sm: { shadowColor: '#4A2A1A', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.10, shadowRadius: 10, elevation: 2 },
  md: { shadowColor: '#4A2A1A', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.14, shadowRadius: 16, elevation: 4 },
  lg: { shadowColor: '#4A2A1A', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.18, shadowRadius: 24, elevation: 6 },
  glow: (color) => ({ shadowColor: color, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.3, shadowRadius: 16, elevation: 5 }),
};
export const colors = darkColors;
