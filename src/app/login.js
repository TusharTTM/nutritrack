import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, SafeAreaView, StatusBar,
  TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useApp } from '../context/AppContext';
import Logo from '../components/Logo';
import GradientButton from '../components/GradientButton';
import { isMongoConfigured } from '../lib/mongodb';
import { typography, spacing, radius } from '../utils/theme';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginScreen() {
  const router = useRouter();
  const { colors, theme, signInAccount, signUpAccount } = useApp();
  const [mode, setMode] = useState('signin'); // 'signin' | 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const submit = async () => {
    setError('');
    const cleanEmail = email.trim();
    if (!EMAIL_RE.test(cleanEmail)) { setError('Enter a valid email address.'); return; }
    if (!password) { setError('Enter your password.'); return; }
    if (mode === 'signup' && displayName.trim().length < 2) { setError('Display name must have at least 2 characters.'); return; }
    if (mode === 'signup' && (password.length < 6 || password.length > 16)) { setError('Use a password with 6 to 16 characters.'); return; }
    setBusy(true);
    try {
      if (mode === 'signup') await signUpAccount({ email: cleanEmail, password, displayName });
      else await signInAccount({ email: cleanEmail, password });
      router.replace('/');
    } catch (_e) {
      setError(mode === 'signup'
        ? 'Could not create the account. That email may already be in use.'
        : 'Could not sign in. Check your email and password.');
    } finally {
      setBusy(false);
    }
  };

  const switchMode = () => { setMode(m => (m === 'signin' ? 'signup' : 'signin')); setError(''); };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]}>
      <StatusBar barStyle={theme === 'dark' ? 'light-content' : 'dark-content'} backgroundColor={colors.bg} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.hero}>
            <Logo size={92} markVariant="gradient" />
            <Text style={[typography.h1, { color: colors.text, marginTop: spacing.lg, textAlign: 'center' }]}>
              {mode === 'signup' ? 'Create your account' : 'Welcome back'}
            </Text>
            <Text style={[typography.body, { color: colors.textSecondary, marginTop: spacing.xs, textAlign: 'center' }]}>
              {mode === 'signup'
                ? 'Sign up to back up your goals and progress.'
                : 'Sign in to sync your nutrition journey.'}
            </Text>
          </View>

          {/* Mode toggle */}
          <View style={[styles.segment, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            {[{ k: 'signin', l: 'Sign in' }, { k: 'signup', l: 'Create account' }].map(o => (
              <TouchableOpacity
                key={o.k}
                style={[styles.segmentBtn, mode === o.k && { backgroundColor: colors.primary }]}
                onPress={() => switchMode(o.k)}
                activeOpacity={0.85}
              >
                <Text style={[typography.bodySmMed, { color: mode === o.k ? colors.textInverse : colors.textSecondary }]}>{o.l}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.form}>
            {mode === 'signup' && (
              <Field
                label="Display name"
                icon="person-outline"
                placeholder="Name to show"
                value={displayName}
                onChangeText={setDisplayName}
                colors={colors}
                autoCapitalize="words"
                maxLength={40}
              />
            )}
            <Field
              label="Email"
              icon="mail-outline"
              placeholder="you@example.com"
              value={email}
              onChangeText={setEmail}
              colors={colors}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              maxLength={120}
            />
            <View>
              <Field
                label="Password"
                icon="lock-closed-outline"
                placeholder={mode === 'signup' ? '6–16 characters' : 'Your password'}
                value={password}
                onChangeText={setPassword}
                colors={colors}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                maxLength={16}
                right={
                  <TouchableOpacity onPress={() => setShowPassword(s => !s)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                    <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={18} color={colors.textMuted} />
                  </TouchableOpacity>
                }
              />
            </View>

            {error ? (
              <View style={[styles.errorBox, { backgroundColor: colors.error + '18', borderColor: colors.error + '40' }]}>
                <Ionicons name="alert-circle-outline" size={15} color={colors.error} />
                <Text style={[typography.bodySm, { color: colors.error, marginLeft: 6, flex: 1 }]}>{error}</Text>
              </View>
            ) : null}

            <GradientButton
              label={mode === 'signup' ? 'Create account' : 'Sign in'}
              onPress={submit}
              loading={busy}
              disabled={busy}
              size="lg"
              style={styles.cta}
            />

            <View style={[styles.modeNote, { backgroundColor: colors.primarySurface, borderColor: colors.cardBorder }]}>
              <Ionicons name={isMongoConfigured ? 'cloud-outline' : 'phone-portrait-outline'} size={16} color={colors.primary} />
              <Text style={[typography.caption, { color: colors.textSecondary, flex: 1, marginLeft: 8 }]}>
                {isMongoConfigured
                  ? 'Connected to your MongoDB account. Your data syncs securely to the cloud.'
                  : 'Local mode — your account and data stay on this device. Add a MongoDB API URL to enable cloud accounts.'}
              </Text>
            </View>
          </View>

          <Pressable style={styles.skip} onPress={() => router.replace('/')} accessibilityRole="button">
            <Text style={[typography.bodySmMed, { color: colors.textSecondary }]}>Skip for now</Text>
            <Ionicons name="arrow-forward" size={15} color={colors.textSecondary} style={{ marginLeft: 4 }} />
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function Field({ label, icon, colors, right, ...props }) {
  return (
    <View style={styles.field}>
      <Text style={[typography.caption, styles.fieldLabel, { color: colors.textSecondary }]}>{label}</Text>
      <View style={[styles.inputRow, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
        <Ionicons name={icon} size={18} color={colors.textMuted} />
        <TextInput
          {...props}
          style={[styles.input, { color: colors.text }]}
          placeholderTextColor={colors.textMuted}
          selectionColor={colors.primary}
        />
        {right}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, minWidth: 0, width: '100%' },
  flex: { flex: 1 },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: spacing.lg, gap: spacing.lg },
  hero: { alignItems: 'center', marginBottom: spacing.sm },
  segment: {
    flexDirection: 'row', padding: 4, borderRadius: radius.full, borderWidth: 1, minWidth: 0,
  },
  segmentBtn: {
    flex: 1, paddingVertical: spacing.sm + 2, borderRadius: radius.full,
    alignItems: 'center', justifyContent: 'center',
  },
  form: { gap: spacing.md },
  field: { gap: spacing.xs },
  fieldLabel: { marginLeft: spacing.xs },
  inputRow: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    borderWidth: 1, borderRadius: radius.lg, paddingHorizontal: spacing.md, paddingVertical: spacing.sm + 3,
  },
  input: { flex: 1, ...typography.body, padding: 0 },
  errorBox: {
    flexDirection: 'row', alignItems: 'center', borderWidth: 1,
    borderRadius: radius.md, padding: spacing.sm,
  },
  cta: { marginTop: spacing.xs },
  modeNote: {
    flexDirection: 'row', alignItems: 'flex-start',
    borderWidth: 1, borderRadius: radius.md, padding: spacing.sm,
  },
  skip: { flexDirection: 'row', alignItems: 'center', alignSelf: 'center', padding: spacing.sm, minHeight: 44 },
});
