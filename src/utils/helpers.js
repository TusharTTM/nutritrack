export const formatDate = (dateString) => {
  const d = new Date(dateString + 'T12:00:00');
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
};

export const formatDateLong = (dateString) => {
  const d = new Date(dateString + 'T12:00:00');
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
};

export const getGreeting = (name) => {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  return name ? `${greeting}, ${name.split(' ')[0]}` : greeting;
};

export const getDateKey = (date = new Date()) => [date.getFullYear(), String(date.getMonth() + 1).padStart(2, '0'), String(date.getDate()).padStart(2, '0')].join('-');

export const getTodayKey = () => getDateKey();

export const getLast7Keys = () => {
  const keys = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    keys.push(getDateKey(d));
  }
  return keys;
};

export const getDayLabel = (dateString) => {
  const d = new Date(dateString + 'T12:00:00');
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (dateString === getTodayKey()) return 'Today';
  if (dateString === getDateKey(yesterday)) return 'Yesterday';
  return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d.getDay()];
};

export const mlToDisplay = (ml, unit = 'ml') => {
  if (unit === 'fl oz') return `${(ml / 29.574).toFixed(0)} fl oz`;
  if (ml >= 1000) return `${(ml / 1000).toFixed(1)} L`;
  return `${ml} ml`;
};

export const kgToDisplay = (kg, unit = 'kg') => {
  if (unit === 'lb') return `${(kg * 2.205).toFixed(1)} lb`;
  return `${kg} kg`;
};

export const calcBMR = (profile) => {
  const weight = parseFloat(profile.weight) || 70;
  const height = parseFloat(profile.height) || 170;
  const age = parseInt(profile.age) || 25;
  const gender = profile.gender || 'male';
  // Mifflin-St Jeor
  if (gender === 'female') return Math.round(10 * weight + 6.25 * height - 5 * age - 161);
  return Math.round(10 * weight + 6.25 * height - 5 * age + 5);
};

export const calcTDEE = (profile) => {
  const bmr = calcBMR(profile);
  const multipliers = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    veryActive: 1.9,
  };
  return Math.round(bmr * (multipliers[profile.activityLevel] || 1.55));
};

export const calcMacros = (calories, goal) => {
  // Returns suggested macro targets based on calorie goal
  const proteinCals = calories * 0.30;
  const carbsCals = calories * 0.45;
  const fatCals = calories * 0.25;
  return {
    calories,
    protein: Math.round(proteinCals / 4),
    carbs: Math.round(carbsCals / 4),
    fat: Math.round(fatCals / 9),
    fiber: 25,
    water: 2000,
  };
};

export const pct = (value, goal) => {
  if (!goal || goal === 0) return 0;
  return Math.min(value / goal, 1);
};

export const clamp = (val, min, max) => Math.min(Math.max(val, min), max);

export const roundMacro = (val) => Math.round(val * 10) / 10;

