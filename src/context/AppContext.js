import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { darkColors, lightColors } from '../utils/theme';
import { getDateKey } from '../utils/helpers';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { signOutOfCommunity } from '../services/communityService';
import {
  getStoredAccount, signIn as accountSignIn, signUp as accountSignUp, signOut as accountSignOut,
} from '../services/accountService';

const AppContext = createContext();
export const useApp = () => useContext(AppContext);

const getTodayKey = () => getDateKey();

const defaultGoals = {
  calories: 2000,
  protein: 150,
  carbs: 250,
  fat: 65,
  fiber: 25,
  water: 2000, // ml
  steps: 8000,
  activeMinutes: 30,
};

const defaultMealTypes = ['Breakfast', 'Lunch', 'Dinner', 'Snacks'];

const defaultProfile = {
  name: '',
  age: '',
  gender: '',
  height: '',
  weight: '',
  activityLevel: 'moderate',
  goal: 'maintain',
  dietaryPrefs: [],
  onboardingDone: false,
  units: { weight: 'kg', volume: 'ml' },
  mealTypes: defaultMealTypes,
};

const KEYS = {
  GOALS: 'nt_goals',
  LOGS: 'nt_logs',
  WATER: 'nt_water',
  WEIGHT: 'nt_weight',
  PROFILE: 'nt_profile',
  ACTIVITIES: 'nt_activities',
  CUSTOM_FOODS: 'nt_custom_foods',
  FAVORITES: 'nt_favorites',
  THEME: 'nt_theme',
};
const LEGACY_DATA_OWNER_KEY = 'nt_legacy_data_owner';
const LOCAL_GUEST_ID = 'local_guest';
const ACCOUNT_DATA_KEYS = Object.values(KEYS).filter(key => key !== KEYS.THEME);
const accountStorageKey = (key, userId) => `${key}_${userId}`;

function parseStoredValue(value) {
  if (!value) return null;
  try { return JSON.parse(value); }
  catch (_error) { return null; }
}

export const AppProvider = ({ children }) => {
  const [theme, setTheme] = useState('dark');
  const colors = theme === 'dark' ? darkColors : lightColors;

  const [goals, setGoals] = useState(defaultGoals);
  const [logs, setLogs] = useState({});
  const [water, setWater] = useState({});   // { 'YYYY-MM-DD': ml }
  const [weight, setWeight] = useState([]);
  const [profile, setProfile] = useState(defaultProfile);
  const [activities, setActivities] = useState({}); // { 'YYYY-MM-DD': [ activityEntry ] }
  const [customFoods, setCustomFoods] = useState([]);
  const [favorites, setFavorites] = useState([]); // food ids
  const [account, setAccount] = useState(null); // signed-in account (local or MongoDB)
  const [accountLoading, setAccountLoading] = useState(true);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);
  const [authLoading, setAuthLoading] = useState(isSupabaseConfigured);
  const activeUserId = useRef(null);
  const authResolved = useRef(false);
  const loadGeneration = useRef(0);

  // ── Dynamic meal types ("infinite meals") ─────────────────────────────────
  const mealTypes = (profile.mealTypes && profile.mealTypes.length) ? profile.mealTypes : defaultMealTypes;
  const emptyDay = useCallback(
    () => Object.fromEntries(mealTypes.map(m => [m, []])),
    [mealTypes],
  );

  const resetAccountData = useCallback(() => {
    setGoals(defaultGoals);
    setLogs({});
    setWater({});
    setWeight([]);
    setProfile(defaultProfile);
    setActivities({});
    setCustomFoods([]);
    setFavorites([]);
  }, []);

  const loadAccountData = useCallback(async (userId) => {
    const generation = ++loadGeneration.current;
    activeUserId.current = userId;
    setLoading(true);
    try {
      const themeValue = parseStoredValue(await AsyncStorage.getItem(KEYS.THEME));
      if (!userId) {
        if (generation === loadGeneration.current) {
          resetAccountData();
          if (themeValue) setTheme(themeValue);
        }
        return;
      }

      const userKeys = Object.fromEntries(ACCOUNT_DATA_KEYS.map(key => [key, accountStorageKey(key, userId)]));
      const scopedValues = await AsyncStorage.multiGet(Object.values(userKeys));
      const hasAccountData = scopedValues.some(([, value]) => value !== null);
      const legacyOwner = await AsyncStorage.getItem(LEGACY_DATA_OWNER_KEY);

      // Assign the old single-device data to only the first signed-in account.
      // Other accounts on the same phone never inherit that data.
      if (!hasAccountData && (!legacyOwner || legacyOwner === userId)) {
        const legacyValues = await AsyncStorage.multiGet(ACCOUNT_DATA_KEYS);
        const existingLegacy = legacyValues.filter(([, value]) => value !== null);
        if (existingLegacy.length) {
          await AsyncStorage.setItem(LEGACY_DATA_OWNER_KEY, userId);
          await AsyncStorage.multiSet(existingLegacy.map(([key, value]) => [userKeys[key], value]));
          await AsyncStorage.multiRemove(existingLegacy.map(([key]) => key));
        } else if (!legacyOwner) {
          await AsyncStorage.setItem(LEGACY_DATA_OWNER_KEY, userId);
        }
      }

      const values = await AsyncStorage.multiGet([
        ...Object.values(userKeys),
        KEYS.THEME,
      ]);
      const rawMap = Object.fromEntries(values.map(([key, value]) => [key, value]));
      const map = Object.fromEntries(ACCOUNT_DATA_KEYS.map(key => [
        key,
        parseStoredValue(rawMap[userKeys[key]]),
      ]));
      if (generation !== loadGeneration.current) return;

      setGoals(map[KEYS.GOALS] ? { ...defaultGoals, ...map[KEYS.GOALS] } : defaultGoals);
      setLogs(map[KEYS.LOGS] || {});
      setWater(map[KEYS.WATER] || {});
      setWeight(map[KEYS.WEIGHT] || []);
      setProfile(map[KEYS.PROFILE] ? { ...defaultProfile, ...map[KEYS.PROFILE] } : defaultProfile);
      setActivities(map[KEYS.ACTIVITIES] || {});
      setCustomFoods(map[KEYS.CUSTOM_FOODS] || []);
      setFavorites(map[KEYS.FAVORITES] || []);
      if (themeValue) setTheme(themeValue);
    } catch (e) {
      console.warn('AppContext load error:', e);
    } finally {
      if (generation === loadGeneration.current) setLoading(false);
    }
  }, [resetAccountData]);

  useEffect(() => {
    if (!supabase) return undefined;
    let active = true;
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!active) return;
      const nextUserId = nextSession?.user?.id || LOCAL_GUEST_ID;
      const accountChanged = !authResolved.current || activeUserId.current !== nextUserId;
      setSession(nextSession);
      setAuthLoading(false);
      if (accountChanged) {
        authResolved.current = true;
        resetAccountData();
        loadAccountData(nextUserId);
      }
    });
    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [loadAccountData, resetAccountData]);

  useEffect(() => {
    if (supabase) return undefined;
    let active = true;
    Promise.resolve().then(() => {
      if (!active) return;
      authResolved.current = true;
      loadAccountData(LOCAL_GUEST_ID);
    });
    return () => { active = false; };
  }, [loadAccountData]);

  // ── Account (login) ───────────────────────────────────────────────────────
  useEffect(() => {
    let active = true;
    getStoredAccount()
      .then(value => { if (active) setAccount(value); })
      .catch(() => {})
      .finally(() => { if (active) setAccountLoading(false); });
    return () => { active = false; };
  }, []);

  const signInAccount = useCallback(async ({ email, password }) => {
    const next = await accountSignIn({ email, password });
    setAccount(next);
    return next;
  }, []);

  const signUpAccount = useCallback(async ({ email, password, displayName }) => {
    const next = await accountSignUp({ email, password, displayName });
    setAccount(next);
    return next;
  }, []);

  const signOutAccount = useCallback(async () => {
    await accountSignOut();
    setAccount(null);
  }, []);

  const signOut = useCallback(() => signOutOfCommunity(), []);

  const persist = async (key, value) => {
    const userId = activeUserId.current;
    if (key !== KEYS.THEME && !userId) return;
    const storageKey = key === KEYS.THEME ? key : accountStorageKey(key, userId);
    try { await AsyncStorage.setItem(storageKey, JSON.stringify(value)); }
    catch (e) { console.warn('persist error:', e); }
  };
  // ── Theme ─────────────────────────────────────────────────────────────────
  const toggleTheme = useCallback(async () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    await persist(KEYS.THEME, next);
  }, [theme]);

  // ── Profile ───────────────────────────────────────────────────────────────
  const saveProfile = useCallback(async (updates) => {
    const next = { ...profile, ...updates };
    setProfile(next);
    await persist(KEYS.PROFILE, next);
  }, [profile]);

  const completeOnboarding = useCallback(async (data) => {
    const next = { ...profile, ...data, onboardingDone: true };
    setProfile(next);
    await persist(KEYS.PROFILE, next);
  }, [profile]);

  // ── Goals ─────────────────────────────────────────────────────────────────
  const saveGoals = useCallback(async (newGoals) => {
    const next = { ...goals, ...newGoals };
    setGoals(next);
    await persist(KEYS.GOALS, next);
  }, [goals]);

  // ── Food Logs ─────────────────────────────────────────────────────────────
  const getTodayLogs = useCallback(() => {
    const today = getTodayKey();
    return { ...emptyDay(), ...(logs[today] || {}) };
  }, [logs, emptyDay]);

  const getLogsForDate = useCallback((date) => {
    return { ...emptyDay(), ...(logs[date] || {}) };
  }, [logs, emptyDay]);

  const addFoodLog = useCallback(async (meal, food, quantity) => {
    const today = getTodayKey();
    const dayLogs = { ...emptyDay(), ...(logs[today] || {}) };
    const entry = {
      ...food,
      quantity,
      loggedAt: new Date().toISOString(),
      logId: `${Date.now()}_${Math.random().toString(36).slice(2)}`,
    };
    const next = {
      ...logs,
      [today]: { ...dayLogs, [meal]: [...(dayLogs[meal] || []), entry] },
    };
    setLogs(next);
    await persist(KEYS.LOGS, next);
    // auto-add to recents in profile
    const recents = profile.recentFoods || [];
    const filtered = recents.filter(f => f.id !== food.id).slice(0, 19);
    await saveProfile({ recentFoods: [food, ...filtered] });
  }, [logs, profile, saveProfile, emptyDay]);

  const removeFoodLog = useCallback(async (meal, logId, date) => {
    const key = date || getTodayKey();
    const dayLogs = { ...emptyDay(), ...(logs[key] || {}) };
    const next = {
      ...logs,
      [key]: { ...dayLogs, [meal]: (dayLogs[meal] || []).filter(i => i.logId !== logId) },
    };
    setLogs(next);
    await persist(KEYS.LOGS, next);
  }, [logs, emptyDay]);

  // ── Meal type management (add / rename / remove) ──────────────────────────
  const addMealType = useCallback(async (name) => {
    const trimmed = String(name || '').trim().slice(0, 24);
    if (!trimmed) return false;
    const current = mealTypes;
    if (current.some(m => m.toLowerCase() === trimmed.toLowerCase())) return false;
    await saveProfile({ mealTypes: [...current, trimmed] });
    return true;
  }, [mealTypes, saveProfile]);

  const renameMealType = useCallback(async (oldName, newName) => {
    const trimmed = String(newName || '').trim().slice(0, 24);
    if (!trimmed || trimmed === oldName) return false;
    const current = mealTypes;
    if (current.some(m => m !== oldName && m.toLowerCase() === trimmed.toLowerCase())) return false;
    const nextMeals = current.map(m => (m === oldName ? trimmed : m));
    const nextLogs = {};
    for (const [day, dayLogs] of Object.entries(logs)) {
      const copy = {};
      for (const [meal, items] of Object.entries(dayLogs)) copy[meal === oldName ? trimmed : meal] = items;
      nextLogs[day] = copy;
    }
    setLogs(nextLogs);
    await persist(KEYS.LOGS, nextLogs);
    await saveProfile({ mealTypes: nextMeals });
    return true;
  }, [mealTypes, logs, saveProfile]);

  const removeMealType = useCallback(async (name) => {
    if (mealTypes.length <= 1) return false;
    const nextMeals = mealTypes.filter(m => m !== name);
    const nextLogs = {};
    for (const [day, dayLogs] of Object.entries(logs)) {
      const copy = { ...dayLogs };
      delete copy[name];
      nextLogs[day] = copy;
    }
    setLogs(nextLogs);
    await persist(KEYS.LOGS, nextLogs);
    await saveProfile({ mealTypes: nextMeals });
    return true;
  }, [mealTypes, logs, saveProfile]);


  // ── Water ─────────────────────────────────────────────────────────────────
  const getTodayWater = useCallback(() => water[getTodayKey()] || 0, [water]);

  const getWaterForDate = useCallback((date) => water[date] || 0, [water]);

  const addWater = useCallback(async (ml = 250) => {
    const today = getTodayKey();
    const current = water[today] || 0;
    const next = { ...water, [today]: current + ml };
    setWater(next);
    await persist(KEYS.WATER, next);
  }, [water]);

  const removeWater = useCallback(async (ml = 250) => {
    const today = getTodayKey();
    const current = water[today] || 0;
    const next = { ...water, [today]: Math.max(0, current - ml) };
    setWater(next);
    await persist(KEYS.WATER, next);
  }, [water]);

  const setWaterForDate = useCallback(async (date, ml) => {
    const next = { ...water, [date]: Math.max(0, ml) };
    setWater(next);
    await persist(KEYS.WATER, next);
  }, [water]);

  // ── Weight ────────────────────────────────────────────────────────────────
  const addWeightEntry = useCallback(async (value) => {
    const entry = { date: getTodayKey(), value: parseFloat(value) };
    const next = [...weight.filter(w => w.date !== entry.date), entry]
      .sort((a, b) => a.date.localeCompare(b.date));
    setWeight(next);
    await persist(KEYS.WEIGHT, next);
  }, [weight]);

  // ── Activities ────────────────────────────────────────────────────────────
  const getTodayActivities = useCallback(() => activities[getTodayKey()] || [], [activities]);

  const getActivitiesForDate = useCallback((date) => activities[date] || [], [activities]);

  const addActivity = useCallback(async (activity) => {
    const today = getTodayKey();
    const dayActs = activities[today] || [];
    const entry = {
      ...activity,
      id: `${Date.now()}_${Math.random().toString(36).slice(2)}`,
      loggedAt: new Date().toISOString(),
    };
    const next = { ...activities, [today]: [...dayActs, entry] };
    setActivities(next);
    await persist(KEYS.ACTIVITIES, next);
  }, [activities]);

  const removeActivity = useCallback(async (id) => {
    const today = getTodayKey();
    const dayActs = activities[today] || [];
    const next = { ...activities, [today]: dayActs.filter(a => a.id !== id) };
    setActivities(next);
    await persist(KEYS.ACTIVITIES, next);
  }, [activities]);

  // ── Custom Foods ──────────────────────────────────────────────────────────
  const addCustomFood = useCallback(async (food) => {
    const entry = { ...food, id: `custom_${Date.now()}`, isCustom: true };
    const next = [entry, ...customFoods];
    setCustomFoods(next);
    await persist(KEYS.CUSTOM_FOODS, next);
  }, [customFoods]);

  // ── Favorites ─────────────────────────────────────────────────────────────
  const toggleFavorite = useCallback(async (foodId) => {
    const next = favorites.includes(foodId)
      ? favorites.filter(id => id !== foodId)
      : [foodId, ...favorites];
    setFavorites(next);
    await persist(KEYS.FAVORITES, next);
  }, [favorites]);

  const isFavorite = useCallback((foodId) => favorites.includes(foodId), [favorites]);

  // ── Calculations ──────────────────────────────────────────────────────────
  const calcTotals = useCallback((dayLogs) => {
    const all = Object.values(dayLogs).flat();
    return all.reduce(
      (acc, item) => {
        const q = item.quantity || 1;
        acc.calories += (item.calories || 0) * q;
        acc.protein += (item.protein || 0) * q;
        acc.carbs += (item.carbs || 0) * q;
        acc.fat += (item.fat || 0) * q;
        acc.fiber += (item.fiber || 0) * q;
        return acc;
      },
      { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 }
    );
  }, []);

  const calcActivityCalories = useCallback((dayActivities) => {
    return (dayActivities || []).reduce((acc, a) => acc + (a.caloriesBurned || 0), 0);
  }, []);

  const getStreak = useCallback(() => {
    let streak = 0;
    const today = new Date();
    for (let i = 0; i < 365; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const key = getDateKey(d);
      const dayLogs = logs[key];
      if (!dayLogs || Object.values(dayLogs).flat().length === 0) break;
      streak++;
    }
    return streak;
  }, [logs]);

  const getDayTotals = useCallback((date) => {
    const dayLogs = getLogsForDate(date);
    return calcTotals(dayLogs);
  }, [getLogsForDate, calcTotals]);

  const getDateRangeTotals = useCallback((days = 7) => {
    const result = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = getDateKey(d);
      const dayLogs = getLogsForDate(key);
      const dayActs = getActivitiesForDate(key);
      result.push({
        date: key,
        ...calcTotals(dayLogs),
        caloriesBurned: calcActivityCalories(dayActs),
        water: water[key] || 0,
      });
    }
    return result;
  }, [getLogsForDate, getActivitiesForDate, calcTotals, calcActivityCalories, water]);

  // Legacy alias
  const getLast7DaysTotals = useCallback(() => getDateRangeTotals(7), [getDateRangeTotals]);

  return (
    <AppContext.Provider value={{
      // Theme
      theme, colors, toggleTheme,
      // Authentication
      session, authLoading, signOut,
      account, accountLoading, signInAccount, signUpAccount, signOutAccount,
      // Profile
      profile, saveProfile, completeOnboarding,
      // Goals
      goals, saveGoals,
      // Food
      logs, getTodayLogs, getLogsForDate, addFoodLog, removeFoodLog,
      mealTypes, addMealType, renameMealType, removeMealType,
      // Water
      water, getTodayWater, getWaterForDate, addWater, removeWater, setWaterForDate,
      // Weight
      weight, addWeightEntry,
      // Activities
      activities, getTodayActivities, getActivitiesForDate, addActivity, removeActivity,
      // Custom foods & favorites
      customFoods, addCustomFood, favorites, toggleFavorite, isFavorite,
      // Calculations
      calcTotals, calcActivityCalories, getStreak, getDayTotals,
      getDateRangeTotals, getLast7DaysTotals,
      // State
      loading,
    }}>
      {children}
    </AppContext.Provider>
  );
};



