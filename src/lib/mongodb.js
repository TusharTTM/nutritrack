import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

// NutriTrack talks to MongoDB through a small REST API (see server/README.md).
// It is completely optional: when EXPO_PUBLIC_MONGODB_API_URL is not set the app
// runs in local-only mode and nothing here is used.
const API_URL = (process.env.EXPO_PUBLIC_MONGODB_API_URL || '').trim().replace(/\/$/, '');
export const isMongoConfigured = /^https?:\/\/[^\s/]+/.test(API_URL);

const TOKEN_KEY = 'nt_mongo_token';

const storage = {
  get: key => (Platform.OS === 'web' ? AsyncStorage.getItem(key) : SecureStore.getItemAsync(key)),
  set: (key, value) => (Platform.OS === 'web'
    ? AsyncStorage.setItem(key, value)
    : SecureStore.setItemAsync(key, value)),
  remove: key => (Platform.OS === 'web' ? AsyncStorage.removeItem(key) : SecureStore.deleteItemAsync(key)),
};

async function request(path, { method = 'GET', body, token } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  const data = text ? JSON.parse(text) : {};
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data;
}

export async function getToken() {
  try { return await storage.get(TOKEN_KEY); } catch (_e) { return null; }
}

async function setToken(token) {
  try {
    if (token) await storage.set(TOKEN_KEY, token);
    else await storage.remove(TOKEN_KEY);
  } catch (_e) { /* ignore */ }
}

export async function mongoSignUp({ email, password, displayName }) {
  const data = await request('/auth/signup', { method: 'POST', body: { email, password, displayName } });
  await setToken(data.token);
  return data.user;
}

export async function mongoSignIn({ email, password }) {
  const data = await request('/auth/signin', { method: 'POST', body: { email, password } });
  await setToken(data.token);
  return data.user;
}

export async function mongoSignOut() {
  await setToken(null);
}

export async function mongoGetProfile() {
  const token = await getToken();
  if (!token) return null;
  const data = await request('/me', { token });
  return data.profile || null;
}

export async function mongoSaveProfile(profile) {
  const token = await getToken();
  if (!token) return null;
  const data = await request('/me', { method: 'PUT', token, body: { profile } });
  return data.profile || null;
}

export async function mongoGetSnapshot() {
  const token = await getToken();
  if (!token) return null;
  return request('/snapshot', { token });
}

export async function mongoSaveSnapshot(snapshot) {
  const token = await getToken();
  if (!token) return null;
  return request('/snapshot', { method: 'PUT', token, body: snapshot });
}
