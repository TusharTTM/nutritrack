// NutriTrack's premium jade and warm-ivory glass palette.
export const darkColors = {
  bg: '#101A17', bgSecondary: '#17231E', bgTertiary: '#223129', shadow: '#102019',
  card: 'rgba(245, 255, 249, 0.055)', cardBorder: 'rgba(210, 235, 219, 0.14)', cardElevated: 'rgba(225, 245, 232, 0.08)',
  primary: '#79C9A2', primaryLight: '#A9E2C4', primaryDark: '#43896A', primaryMuted: 'rgba(121, 201, 162, 0.15)', primarySurface: 'rgba(121, 201, 162, 0.12)',
  accentPink: '#ECA2B7',
  glassHighlight: ['rgba(255, 255, 255, 0.14)', 'rgba(204, 238, 216, 0.055)', 'rgba(255, 255, 255, 0.012)'],
  backgroundGradient: ['#101A17', '#172722', '#111F1C'],
  text: '#F2F7F2', textSecondary: '#C1D0C5', textMuted: '#89988E', textInverse: '#FFFFFF',
  success: '#84D6A7', error: '#F28A83', warning: '#EBC777', info: '#78C9D9',
  protein: '#87BDE8', carbs: '#E5B967', fat: '#E99AAF', fiber: '#85CF99', water: '#75C9DA',
  border: 'rgba(210, 235, 219, 0.14)', borderLight: 'rgba(210, 235, 219, 0.075)', divider: 'rgba(210, 235, 219, 0.11)',
  overlay: 'rgba(6, 13, 10, 0.72)', tabBar: 'rgba(18, 29, 24, 0.9)', statusBar: 'light',
};
export const lightColors = {
  bg: '#F1F5EF', bgSecondary: '#FAFBF8', bgTertiary: '#E7EEE7', shadow: '#102019',
  card: 'rgba(255, 255, 255, 0.88)', cardBorder: 'rgba(83, 111, 93, 0.20)', cardElevated: 'rgba(255, 255, 255, 0.96)',
  primary: '#327654', primaryLight: '#326E51', primaryDark: '#28644A', primaryMuted: 'rgba(61, 135, 102, 0.12)', primarySurface: 'rgba(83, 155, 119, 0.11)',
  accentPink: '#B74663',
  glassHighlight: ['rgba(255, 255, 255, 0.97)', 'rgba(223, 240, 226, 0.52)', 'rgba(255, 255, 255, 0.16)'],
  backgroundGradient: ['#EEF5EF', '#FBFCF8', '#EAF2F1'],
  text: '#20342A', textSecondary: '#52655A', textMuted: '#637167', textInverse: '#FFFFFF',
  success: '#26784E', error: '#B64E4B', warning: '#906518', info: '#246F7E',
  protein: '#3F6D8A', carbs: '#865A15', fat: '#A74E68', fiber: '#427B51', water: '#246F7E',
  border: 'rgba(83, 111, 93, 0.16)', borderLight: 'rgba(83, 111, 93, 0.08)', divider: 'rgba(83, 111, 93, 0.12)',
  overlay: 'rgba(17, 29, 22, 0.46)', tabBar: 'rgba(250, 252, 248, 0.92)', statusBar: 'dark',
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
  sm: { shadowColor: darkColors.shadow, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.09, shadowRadius: 12, elevation: 3 },
  md: { shadowColor: darkColors.shadow, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.13, shadowRadius: 18, elevation: 4 },
  lg: { shadowColor: darkColors.shadow, shadowOffset: { width: 0, height: 9 }, shadowOpacity: 0.17, shadowRadius: 24, elevation: 6 },
  glow: (color) => ({ shadowColor: color, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.2, shadowRadius: 14, elevation: 4 }),
};
export const colors = darkColors;
