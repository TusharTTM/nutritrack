// NutriTrack — "Cloud & Teal" (2026 wellness direction).
// Warm cloud/bone neutrals + Transformative Teal accent, high-contrast type,
// tinted (never pure black/white) surfaces, WCAG-minded contrast. Signature
// gradients live in `gradients`; CTA gradients are theme-aware for contrast.
export const gradients = {
  brand: ['#3AC6A8', '#1FAE8A', '#129C9E'], // decorative teal→green→aqua
  brandSoft: ['rgba(47, 184, 158, 0.20)', 'rgba(18, 156, 158, 0.05)'],
  ctaDark: ['#3AC6A8', '#1FAE8A'], // bright teal — dark-theme buttons (dark label)
  ctaLight: ['#0E8C78', '#0A6E5C'], // deep teal — light-theme buttons (white label)
  accent: ['#E08A4A', '#C85A2E'],
  aqua: ['#2FB3CC', '#3A7FD5'],
  sheen: ['rgba(255, 255, 255, 0.7)', 'rgba(255, 255, 255, 0.18)'],
};

export const ctaGradient = (theme) => (theme === 'dark' ? gradients.ctaDark : gradients.ctaLight);

export const brand = {
  markFrom: '#57E39E',
  markVia: '#2FD3A6',
  markTo: '#26C6D9',
  glow: 'rgba(47, 184, 158, 0.4)',
};

export const darkColors = {
  bg: '#0E1512', bgSecondary: '#131C18', bgTertiary: '#1A2521', shadow: '#000000',
  card: 'rgba(220, 235, 228, 0.05)', cardBorder: 'rgba(170, 215, 195, 0.15)', cardElevated: 'rgba(220, 235, 228, 0.085)',
  primary: '#2FB89E', primaryLight: '#5FD3BC', primaryDark: '#1E8C78', primaryMuted: 'rgba(47, 184, 158, 0.16)', primarySurface: 'rgba(47, 184, 158, 0.13)',
  accent: '#E87A4A', accentPink: '#F08CA8',
  glassHighlight: ['rgba(255, 255, 255, 0.10)', 'rgba(190, 230, 215, 0.05)', 'rgba(255, 255, 255, 0.01)'],
  backgroundGradient: ['#0E1512', '#132019', '#0F1714'],
  text: '#ECEFE9', textSecondary: '#B6C1B7', textMuted: '#7C887E', textInverse: '#04120D',
  success: '#4FBF7B', error: '#F2705F', warning: '#E0A94E', info: '#38B5CC',
  protein: '#5C9BD6', carbs: '#E0A94E', fat: '#E5839E', fiber: '#4FBF7B', water: '#38B5CC',
  border: 'rgba(170, 215, 195, 0.15)', borderLight: 'rgba(170, 215, 195, 0.08)', divider: 'rgba(170, 215, 195, 0.11)',
  overlay: 'rgba(2, 8, 6, 0.72)', tabBar: 'rgba(14, 21, 18, 0.9)', statusBar: 'light',
};
export const lightColors = {
  bg: '#F1EFE8', bgSecondary: '#F7F5EF', bgTertiary: '#E7E2D7', shadow: '#2A2A22',
  card: '#FCFAF5', cardBorder: 'rgba(70, 60, 45, 0.14)', cardElevated: '#FFFFFF',
  primary: '#0C7D6B', primaryLight: '#0A6A5A', primaryDark: '#08584A', primaryMuted: 'rgba(12, 125, 107, 0.12)', primarySurface: 'rgba(12, 125, 107, 0.10)',
  accent: '#C85A2E', accentPink: '#C2557A',
  glassHighlight: ['rgba(255, 255, 255, 0.75)', 'rgba(255, 255, 255, 0.22)', 'rgba(255, 255, 255, 0.05)'],
  backgroundGradient: ['#F1EFE8', '#F7F5EF', '#EAE6DC'],
  text: '#17211C', textSecondary: '#4C5A51', textMuted: '#6C786F', textInverse: '#FFFFFF',
  success: '#2E8B57', error: '#C0453B', warning: '#9A6B12', info: '#1E88A8',
  protein: '#3A6EA5', carbs: '#A9761A', fat: '#BC4F73', fiber: '#2F8A52', water: '#1E88A8',
  border: 'rgba(70, 60, 45, 0.14)', borderLight: 'rgba(70, 60, 45, 0.07)', divider: 'rgba(70, 60, 45, 0.10)',
  overlay: 'rgba(30, 28, 20, 0.42)', tabBar: 'rgba(247, 245, 239, 0.94)', statusBar: 'dark',
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
  sm: { shadowColor: '#2A2A22', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.08, shadowRadius: 10, elevation: 2 },
  md: { shadowColor: '#2A2A22', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.12, shadowRadius: 16, elevation: 4 },
  lg: { shadowColor: '#2A2A22', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.16, shadowRadius: 24, elevation: 6 },
  glow: (color) => ({ shadowColor: color, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.28, shadowRadius: 16, elevation: 5 }),
};
export const colors = darkColors;
