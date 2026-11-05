import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  isMongoConfigured, mongoSignIn, mongoSignUp, mongoSignOut,
} from '../lib/mongodb';

const ACCOUNT_KEY = 'nt_account';

const parse = (value) => { try { return value ? JSON.parse(value) : null; } catch (_e) { return null; } };

export async function getStoredAccount() {
  return parse(await AsyncStorage.getItem(ACCOUNT_KEY));
}

async function storeAccount(account) {
  if (account) await AsyncStorage.setItem(ACCOUNT_KEY, JSON.stringify(account));
  else await AsyncStorage.removeItem(ACCOUNT_KEY);
  return account;
}

function localAccountFrom(email, displayName) {
  const name = (displayName || '').trim() || email.split('@')[0];
  return {
    id: `local_${email.toLowerCase()}`,
    email: email.toLowerCase(),
    displayName: name,
    mode: 'local',
  };
}

/** Sign in. Uses MongoDB when configured, otherwise a device-only local account. */
export async function signIn({ email, password }) {
  const clean = email.trim().toLowerCase();
  if (isMongoConfigured) {
    const user = await mongoSignIn({ email: clean, password });
    return { id: user.id, email: user.email, displayName: user.displayName, mode: 'mongodb' };
  }
  const existing = await getStoredAccount();
  if (existing && existing.email === clean) return storeAccount(existing);
  return storeAccount(localAccountFrom(clean));
}

/** Create an account. MongoDB when configured, otherwise a device-only local account. */
export async function signUp({ email, password, displayName }) {
  const clean = email.trim().toLowerCase();
  if (isMongoConfigured) {
    const user = await mongoSignUp({ email: clean, password, displayName });
    return { id: user.id, email: user.email, displayName: user.displayName, mode: 'mongodb' };
  }
  return storeAccount(localAccountFrom(clean, displayName));
}

export async function signOut() {
  if (isMongoConfigured) { try { await mongoSignOut(); } catch (_e) { /* ignore */ } }
  await storeAccount(null);
}

export const accountMode = () => (isMongoConfigured ? 'mongodb' : 'local');
