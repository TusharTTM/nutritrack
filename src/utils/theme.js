// NutriTrack — "Verdant Glow" fresh palette.
// A vibrant green → teal → aqua identity with deep, rich dark surfaces and a
// bright, airy light mode. Signature gradients live in `gradients` / `brand`.
export const gradients = {
  brand: ['#57E39E', '#2FD3A6', '#26C6D9'],
  brandStrong: ['#3FD98A', '#17BE9E', '#16A9C4'],
  brandSoft: ['rgba(87, 227, 158, 0.22)', 'rgba(38, 198, 217, 0.06)'],
  accent: ['#FFC24D', '#FF7A66'],
  aqua: ['#3ED0E6', '#5C8CFF'],
  sheen: ['rgba(255, 255, 255, 0.16)', 'rgba(255, 255, 255, 0.04)'],
};

export const brand = {
  markFrom: '#57E39E',
  markVia: '#2FD3A6',
  markTo: '#26C6D9',
  glow: 'rgba(87, 227, 158, 0.45)',
};

export const darkColors = {
  bg: '#0B1712', bgSecondary: '#10201A', bgTertiary: '#172A21', shadow: '#03130C',
  card: 'rgba(226, 252, 238, 0.055)', cardBorder: 'rgba(150, 235, 195, 0.16)', cardElevated: 'rgba(205, 245, 226, 0.09)',
  primary: '#4FD98A', primaryLight: '#8BF0B8', primaryDark: '#2BA96C', primaryMuted: 'rgba(79, 217, 138, 0.16)', primarySurface: 'rgba(79, 217, 138, 0.13)',
  accent: '#38D6D0', accentPink: '#FF8FB0',
  glassHighlight: ['rgba(255, 255, 255, 0.16)', 'rgba(190, 245, 214, 0.06)', 'rgba(255, 255, 255, 0.012)'],
  backgroundGradient: ['#0B1712', '#122A20', '#0C1B17'],
  text: '#EBF7EF', textSecondary: '#BCD2C4', textMuted: '#7E9287', textInverse: '#052018',
  success: '#4FD98A', error: '#FF6F61', warning: '#FFB13D', info: '#38D6D0',
  protein: '#5CA8FF', carbs: '#FFC24D', fat: '#FF8FB0', fiber: '#57DE8B', water: '#3FD0E6',
  border: 'rgba(150, 235, 195, 0.16)', borderLight: 'rgba(150, 235, 195, 0.08)', divider: 'rgba(150, 235, 195, 0.12)',
  overlay: 'rgba(3, 16, 11, 0.74)', tabBar: 'rgba(13, 26, 21, 0.9)', statusBar: 'light',
};
export const lightColors = {
  bg: '#EDF6F0', bgSecondary: '#F8FCF9', bgTertiary: '#E0EEE6', shadow: '#0A1F15',
  card: 'rgba(255, 255, 255, 0.9)', cardBorder: 'rgba(35, 120, 85, 0.20)', cardElevated: 'rgba(255, 255, 255, 0.98)',
  primary: '#0FA05B', primaryLight: '#0B7E48', primaryDark: '#0A6438', primaryMuted: 'rgba(15, 160, 91, 0.12)', primarySurface: 'rgba(15, 160, 91, 0.10)',
  accent: '#0FA5A0', accentPink: '#C24A6E',
  glassHighlight: ['rgba(255, 255, 255, 0.98)', 'rgba(220, 245, 231, 0.5)', 'rgba(255, 255, 255, 0.16)'],
  backgroundGradient: ['#E8F4ED', '#FBFDF9', '#E0F1EA'],
  text: '#10251B', textSecondary: '#3F584B', textMuted: '#5B6F63', textInverse: '#FFFFFF',
  success: '#0F8A4E', error: '#C24A42', warning: '#9A6A0A', info: '#127C82',
  protein: '#2F6FB2', carbs: '#B27A12', fat: '#C2557A', fiber: '#2E8B4F', water: '#127C82',
  border: 'rgba(35, 120, 85, 0.16)', borderLight: 'rgba(35, 120, 85, 0.08)', divider: 'rgba(35, 120, 85, 0.12)',
  overlay: 'rgba(10, 31, 21, 0.44)', tabBar: 'rgba(248, 252, 249, 0.94)', statusBar: 'dark',
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
  sm: { shadowColor: darkColors.shadow, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.14, shadowRadius: 12, elevation: 3 },
  md: { shadowColor: darkColors.shadow, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.18, shadowRadius: 18, elevation: 4 },
  lg: { shadowColor: darkColors.shadow, shadowOffset: { width: 0, height: 9 }, shadowOpacity: 0.22, shadowRadius: 24, elevation: 6 },
  glow: (color) => ({ shadowColor: color, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.32, shadowRadius: 16, elevation: 5 }),
};
export const colors = darkColors;
