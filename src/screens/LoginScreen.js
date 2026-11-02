import React, { useState } from 'react';
import {
  ActivityIndicator, KeyboardAvoidingView, Platform, Pressable,
  SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TextInput, View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { isSupabaseConfigured } from '../lib/supabase';
import Card from '../components/Card';
import { radius, spacing, typography } from '../utils/theme';

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function messageForAuthError(error) {
  const message = String(error?.message || '').toLowerCase();
  if (message.includes('invalid login credentials')) return 'Email or password is incorrect.';
  if (message.includes('already registered') || message.includes('already been registered')) return 'An account with this email already exists. Sign in instead.';
  if (message.includes('email not confirmed')) return 'Please confirm your email before signing in.';
  if (message.includes('password should be')) return 'Choose a password that meets the account security requirements.';
  if (message.includes('network') || message.includes('fetch')) return 'Could not connect. Check your internet and try again.';
  return 'We could not complete that request. Check your details and try again.';
}

export default function LoginScreen() {
  const { colors, theme, signIn, signUp, authLoading } = useApp();
  const actionTextColor = theme === 'dark' ? colors.bg : colors.textInverse;
  const [registering, setRegistering] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState(null);

  const submit = async () => {
    if (busy || authLoading) return;
    const cleanEmail = email.trim().toLowerCase();
    const cleanName = displayName.trim();
    if (!isSupabaseConfigured) {
      setNotice({ type: 'error', text: 'Sign in is not available right now. The account service is not configured.' });
      return;
    }
    if (registering && (cleanName.length < 2 || cleanName.length > 60)) {
      setNotice({ type: 'error', text: 'Enter a name between 2 and 60 characters.' });
      return;
    }
    if (!emailPattern.test(cleanEmail) || cleanEmail.length > 254) {
      setNotice({ type: 'error', text: 'Enter a valid email address.' });
      return;
    }
    if (password.length < 1 || password.length > 16) {
      setNotice({ type: 'error', text: 'Password must be between 1 and 16 characters.' });
      return;
    }

    setBusy(true);
    setNotice(null);
    try {
      if (registering) {
        const { data } = await signUp({ displayName: cleanName, email: cleanEmail, password });
        if (!data?.session) {
          setNotice({ type: 'success', text: 'Account created. Check your email to confirm it, then sign in.' });
          setRegistering(false);
          setPassword('');
        }
      } else {
        await signIn(cleanEmail, password);
      }
    } catch (error) {
      setNotice({ type: 'error', text: messageForAuthError(error) });
    } finally {
      setBusy(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]}>
      <StatusBar barStyle={theme === 'dark' ? 'light-content' : 'dark-content'} backgroundColor={colors.bg} />
      <LinearGradient colors={colors.backgroundGradient} style={StyleSheet.absoluteFillObject} />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.content}>
            <View style={[styles.brandMark, { backgroundColor: colors.primarySurface, borderColor: colors.cardBorder }]}>
              <Ionicons name="leaf" size={27} color={colors.primary} />
            </View>
            <Text style={[typography.label, styles.eyebrow, { color: colors.primary }]}>NUTRITRACK</Text>
            <Text style={[typography.displayMd, styles.title, { color: colors.text }]}>
              {registering ? 'Start your journey' : 'Welcome back'}
            </Text>
            <Text style={[typography.body, styles.subtitle, { color: colors.textSecondary }]}>
              {registering
                ? 'Create an account to begin tracking your health.'
                : 'Sign in to continue with your nutrition and progress.'}
            </Text>

            <Card style={styles.card} elevated>
              <View style={[styles.segment, { backgroundColor: colors.bgTertiary }]}>
                {[
                  { value: false, label: 'Sign in' },
                  { value: true, label: 'Create account' },
                ].map(option => {
                  const active = registering === option.value;
                  return (
                    <Pressable
                      key={option.label}
                      onPress={() => { setRegistering(option.value); setNotice(null); }}
                      accessibilityRole="button"
                      accessibilityState={{ selected: active }}
                      style={[styles.segmentOption, active && { backgroundColor: colors.cardElevated }]}
                    >
                      <Text style={[typography.bodySmMed, { color: active ? colors.text : colors.textMuted }]}>
                        {option.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              {registering && (
                <Field
                  label="Name"
                  icon="person-outline"
                  value={displayName}
                  onChangeText={value => { setDisplayName(value); setNotice(null); }}
                  placeholder="Your name"
                  colors={colors}
                  autoCapitalize="words"
                  autoComplete="name"
                  maxLength={60}
                  returnKeyType="next"
                />
              )}
              <Field
                label="Email"
                icon="mail-outline"
                value={email}
                onChangeText={value => { setEmail(value); setNotice(null); }}
                placeholder="you@example.com"
                colors={colors}
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="email"
                keyboardType="email-address"
                maxLength={254}
                returnKeyType="next"
              />
              <View style={styles.fieldWrap}>
                <Text style={[typography.caption, styles.fieldLabel, { color: colors.textSecondary }]}>PASSWORD</Text>
                <View style={[styles.inputShell, { backgroundColor: colors.bgSecondary, borderColor: colors.cardBorder }]}>
                  <Ionicons name="lock-closed-outline" size={18} color={colors.textMuted} />
                  <TextInput
                    value={password}
                    onChangeText={value => { setPassword(value); setNotice(null); }}
                    placeholder="Enter password"
                    placeholderTextColor={colors.textMuted}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                    autoComplete={registering ? 'new-password' : 'current-password'}
                    textContentType={registering ? 'newPassword' : 'password'}
                    maxLength={16}
                    returnKeyType="done"
                    onSubmitEditing={submit}
                    style={[typography.body, styles.input, { color: colors.text }]}
                    accessibilityLabel="Password"
                  />
                  <Pressable
                    onPress={() => setShowPassword(value => !value)}
                    hitSlop={10}
                    accessibilityRole="button"
                    accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
                  >
                    <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={19} color={colors.textMuted} />
                  </Pressable>
                </View>
              </View>

              {notice && (
                <View style={[styles.notice, {
                  backgroundColor: notice.type === 'error' ? `${colors.error}18` : `${colors.success}18`,
                  borderColor: notice.type === 'error' ? `${colors.error}45` : `${colors.success}45`,
                }]}>
                  <Ionicons
                    name={notice.type === 'error' ? 'alert-circle-outline' : 'checkmark-circle-outline'}
                    size={18}
                    color={notice.type === 'error' ? colors.error : colors.success}
                  />
                  <Text style={[typography.bodySm, styles.noticeText, { color: notice.type === 'error' ? colors.error : colors.success }]}>
                    {notice.text}
                  </Text>
                </View>
              )}

              <Pressable
                onPress={submit}
                disabled={busy || authLoading || !isSupabaseConfigured}
                accessibilityRole="button"
                style={({ pressed }) => [
                  styles.submitButton,
                  { backgroundColor: colors.primary, opacity: busy || authLoading || !isSupabaseConfigured ? 0.55 : pressed ? 0.85 : 1 },
                ]}
              >
                {busy || authLoading
                  ? <ActivityIndicator color={actionTextColor} />
                  : <Text style={[typography.bodyMed, { color: actionTextColor }]}>{registering ? 'Create account' : 'Sign in'}</Text>}
                {!busy && !authLoading && <Ionicons name="arrow-forward" size={18} color={actionTextColor} />}
              </Pressable>
            </Card>

            <View style={styles.privacyNote}>
              <Ionicons name="shield-checkmark-outline" size={16} color={colors.textMuted} />
              <Text style={[typography.caption, styles.privacyText, { color: colors.textMuted }]}>Your nutrition tracker data stays on this device.</Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function Field({ label, icon, value, onChangeText, placeholder, colors, ...inputProps }) {
  return (
    <View style={styles.fieldWrap}>
      <Text style={[typography.caption, styles.fieldLabel, { color: colors.textSecondary }]}>{label.toUpperCase()}</Text>
      <View style={[styles.inputShell, { backgroundColor: colors.bgSecondary, borderColor: colors.cardBorder }]}>
        <Ionicons name={icon} size={18} color={colors.textMuted} />
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.textMuted}
          style={[typography.body, styles.input, { color: colors.text }]}
          {...inputProps}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, minWidth: 0 },
  flex: { flex: 1 },
  scrollContent: { flexGrow: 1, justifyContent: 'center', padding: spacing.md },
  content: { width: '100%', maxWidth: 460, alignSelf: 'center', paddingVertical: spacing.xl },
  brandMark: { alignSelf: 'center', width: 58, height: 58, borderRadius: 20, borderWidth: 1, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.md },
  eyebrow: { textAlign: 'center', letterSpacing: 2.2, marginBottom: spacing.sm },
  title: { textAlign: 'center', marginBottom: spacing.sm },
  subtitle: { textAlign: 'center', marginBottom: spacing.xl, paddingHorizontal: spacing.sm },
  card: { width: '100%' },
  segment: { flexDirection: 'row', padding: 4, borderRadius: radius.md, marginBottom: spacing.lg, gap: 4 },
  segmentOption: { flex: 1, minHeight: 42, alignItems: 'center', justifyContent: 'center', borderRadius: radius.sm },
  fieldWrap: { marginBottom: spacing.md },
  fieldLabel: { marginBottom: spacing.xs, marginLeft: 2, fontWeight: '700', letterSpacing: 0.7 },
  inputShell: { minHeight: 52, borderWidth: 1, borderRadius: radius.md, paddingHorizontal: spacing.md, flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  input: { flex: 1, minWidth: 0, paddingVertical: spacing.sm },
  notice: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm, padding: spacing.sm, borderWidth: 1, borderRadius: radius.md, marginBottom: spacing.md },
  noticeText: { flex: 1 },
  submitButton: { minHeight: 52, borderRadius: radius.md, paddingHorizontal: spacing.md, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, marginTop: spacing.xs },
  privacyNote: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.xs, marginTop: spacing.lg },
  privacyText: { textAlign: 'center' },
});
