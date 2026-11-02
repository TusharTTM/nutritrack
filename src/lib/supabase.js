import 'react-native-url-polyfill/auto';
import { AppState, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (process.env.EXPO_PUBLIC_SUPABASE_URL || '').trim();
const publishableKey = (process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY || '').trim();
const validHttpsUrl = /^https:\/\/[^\s/]+(?:\/[^\s]*)?$/i.test(supabaseUrl);
const validLocalUrl = /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?\/?$/i.test(supabaseUrl);
const publicKeyOnly = publishableKey.startsWith('sb_publishable_')
  && publishableKey.length > 'sb_publishable_'.length;
export const isSupabaseConfigured = Boolean((validHttpsUrl || validLocalUrl) && publicKeyOnly);

const nativeAuthStorage = {
  getItem: key => SecureStore.getItemAsync(key),
  setItem: (key, value) => SecureStore.setItemAsync(key, value),
  removeItem: key => SecureStore.deleteItemAsync(key),
};

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, publishableKey, {
    auth: {
      storage: Platform.OS === 'web' ? AsyncStorage : nativeAuthStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  })
  : null;

if (supabase && Platform.OS !== 'web') {
  AppState.addEventListener('change', state => {
    if (state === 'active') supabase.auth.startAutoRefresh();
    else supabase.auth.stopAutoRefresh();
  });
}
