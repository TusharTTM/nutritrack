import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import AppTouchable from './AppTouchable';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useApp } from '../context/AppContext';
import Card from './Card';
import EmptyState from './EmptyState';
import { isSupabaseConfigured } from '../lib/supabase';
import {
  getAllCommunityProfiles, getCommunityRequests, getCommunitySession, getMySharingPreference,
  isCommunityAdmin,
  removeCommunityMember, respondToCommunityRequest, searchCommunityProfiles,
  sendCommunityRequest, setMySharingPreference, signInToCommunity,
  signOutOfCommunity, signUpForCommunity, subscribeToCommunityAuth,
  syncOwnCommunityReports,
} from '../services/communityService';
import { radius, spacing, typography } from '../utils/theme';

const MIN_SIGNUP_PASSWORD_LENGTH = 1;
const MAX_SIGNUP_PASSWORD_LENGTH = 16;

const messageForError = error => error?.code === '23505'
  ? 'A request with this person is already pending or accepted.'
  : 'Something went wrong. Check your connection and try again.';

function otherMember(request, userId) {
  const sent = request.requester_id === userId;
  return {
    id: sent ? request.recipient_id : request.requester_id,
    name: sent ? request.recipient_name : request.requester_name,
    code: sent ? request.recipient_code : request.requester_code,
  };
}

export default function CommunityReports() {
  const { colors, getDateRangeTotals } = useApp();
  const reports = useMemo(() => getDateRangeTotals(30), [getDateRangeTotals]);
  const [session, setSession] = useState(null);
  const [authLoading, setAuthLoading] = useState(isSupabaseConfigured);
  const [authBusy, setAuthBusy] = useState(false);
  const [busy, setBusy] = useState(false);
  const [requests, setRequests] = useState([]);
  const [adminProfiles, setAdminProfiles] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [shareBusy, setShareBusy] = useState(false);
  const [name, setName] = useState('');
  const [matches, setMatches] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [register, setRegister] = useState(false);
  const [notice, setNotice] = useState('');

  const refresh = useCallback(async () => {
    if (!session?.user?.id) {
      setRequests([]);
      setSharing(false);
      return;
    }
    setBusy(true);
    try {
      const [next, enabled, admin] = await Promise.all([
        getCommunityRequests(), getMySharingPreference(), isCommunityAdmin(),
      ]);
      setRequests(next);
      setSharing(enabled);
      setIsAdmin(admin);
      setAdminProfiles(admin ? await getAllCommunityProfiles() : []);
      setNotice('');
    } catch (error) {
      setNotice(messageForError(error));
    } finally {
      setBusy(false);
    }
  }, [session?.user?.id]);

  useEffect(() => {
    if (!isSupabaseConfigured) return undefined;
    let cancelled = false;
    let unsubscribe;
    getCommunitySession().then(value => {
      if (!cancelled) setSession(value);
    }).catch(() => {
      if (!cancelled) setNotice('Could not restore your session. Sign in again.');
    }).finally(() => {
      if (!cancelled) setAuthLoading(false);
    });
    Promise.resolve(subscribeToCommunityAuth(value => setSession(value))).then(stop => {
      if (cancelled) stop?.();
      else unsubscribe = stop;
    }).catch(() => {});
    return () => {
      cancelled = true;
      unsubscribe?.();
    };
  }, []);

  useEffect(() => {
    const timer = setTimeout(refresh, 0);
    return () => clearTimeout(timer);
  }, [refresh]);
  useEffect(() => {
    if (!session?.user?.id || !sharing) return undefined;
    let cancelled = false;
    syncOwnCommunityReports(reports).catch(() => {
      if (!cancelled) setNotice('Your daily summary could not sync. Check your connection.');
    });
    return () => { cancelled = true; };
  }, [session?.user?.id, sharing, reports]);

  const incoming = requests.filter(r => r.status === 'pending' && r.recipient_id === session?.user?.id);
  const outgoing = requests.filter(r => r.status === 'pending' && r.requester_id === session?.user?.id);
  const members = requests.filter(r => r.status === 'accepted')
    .map(r => ({ requestId: r.request_id, ...otherMember(r, session?.user?.id) }));

  const authenticate = async () => {
    setNotice('');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return setNotice('Enter a valid email address.');
    if (!password) return setNotice('Enter your password.');
    if (register && displayName.trim().length < 2) return setNotice('Display name must have at least 2 characters.');
    if (register && (password.length < MIN_SIGNUP_PASSWORD_LENGTH || password.length > MAX_SIGNUP_PASSWORD_LENGTH)) {
      return setNotice(`Use a password with ${MIN_SIGNUP_PASSWORD_LENGTH} to ${MAX_SIGNUP_PASSWORD_LENGTH} characters.`);
    }
    setAuthBusy(true);
    try {
      if (register) {
        const result = await signUpForCommunity({ displayName, email, password });
        setNotice(result.session ? 'Account created. Search for people by their exact display name.' : 'Check your email to confirm, then sign in.');
      } else {
        await signInToCommunity(email, password);
        setPassword('');
      }
    } catch (_error) {
      setNotice(register ? 'Could not create the account. Check your details and try again.' : 'Could not sign in. Check your email and password.');
    } finally {
      setAuthBusy(false);
    }
  };

  const search = async () => {
    if (name.trim().length < 2 || name.trim().length > 60) return setNotice('Enter a name between 2 and 60 characters.');
    setBusy(true);
    setNotice('');
    setMatches([]);
    try { setMatches(await searchCommunityProfiles(name)); }
    catch (error) { setNotice(messageForError(error)); }
    finally { setBusy(false); }
  };

  const requestMember = async id => {
    setBusy(true);
    setNotice('');
    try {
      await sendCommunityRequest(id);
      setShowAdd(false);
      setName('');
      setMatches([]);
      await refresh();
      setNotice('Joining request sent.');
    } catch (error) {
      setNotice(messageForError(error));
    } finally { setBusy(false); }
  };

  const reply = async (id, accept) => {
    setBusy(true);
    setNotice('');
    try { await respondToCommunityRequest(id, accept); await refresh(); }
    catch (error) { setNotice(messageForError(error)); }
    finally { setBusy(false); }
  };

  const remove = member => Alert.alert(
    'Remove group member?',
    'You will no longer see each other’s shared summaries.',
    [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: async () => {
        setBusy(true);
        try { await removeCommunityMember(member.id); await refresh(); }
        catch (error) { setNotice(messageForError(error)); }
        finally { setBusy(false); }
      } },
    ],
  );

  const changeSharing = async value => {
    const previous = sharing;
    setSharing(value);
    setShareBusy(true);
    setNotice('');
    try {
      const result = await setMySharingPreference(value);
      if (result?.cleanupPending) setNotice('Sharing is off, but some saved summaries could not be deleted yet.');
    }
    catch (error) { setSharing(previous); setNotice(messageForError(error)); }
    finally { setShareBusy(false); }
  };

  if (!isSupabaseConfigured) {
    return <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <Card style={styles.authCard} elevated>
        <Ionicons name="people-outline" size={24} color={colors.primary} />
        <Text style={[typography.h3, styles.heading, { color: colors.text }]}>Community is not connected</Text>
        <Text style={[typography.bodySm, { color: colors.textSecondary }]}>
          This project has no Supabase URL or publishable key configured, so sign-in, requests, and shared reports cannot run yet.
        </Text>
        <Text style={[typography.caption, { color: colors.textSecondary, marginTop: spacing.sm }]}>
          To connect it: create a Supabase Free project, copy .env.example to .env, add the project URL and publishable key, run the included Community migration, then restart Expo.
        </Text>
        <Text style={[typography.caption, { color: colors.textMuted, marginTop: spacing.sm }]}>
          No paid plan is needed. Never add a service-role or secret key to the app. Personal progress works without Community.
        </Text>
      </Card>
    </View>;
  }

  if (authLoading) return <View style={[styles.container, styles.center, { backgroundColor: colors.bg }]}>
    <ActivityIndicator color={colors.primary} />
  </View>;

  if (!session) return <KeyboardAvoidingView
    style={[styles.container, { backgroundColor: colors.bg }]}
    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
  >
    <ScrollView contentContainerStyle={styles.authContent} keyboardShouldPersistTaps="handled">
      <Card style={styles.authCard} elevated>
        <Ionicons name="people-outline" size={24} color={colors.primary} />
        <Text style={[typography.h2, styles.heading, { color: colors.text }]}>{register ? 'Join your community' : 'Community sign in'}</Text>
        <Text style={[typography.bodySm, { color: colors.textSecondary, marginBottom: spacing.md }]}>
          {register ? 'Names can repeat; use a unique email. Friends can find you by display name.' : 'Sign in to send and accept group requests.'}
        </Text>
        {register && <Field label="Display name" value={displayName} onChangeText={setDisplayName} placeholder="Name friends will search" colors={colors} maxLength={60} autoCapitalize="words" />}
        <Field label="Email" value={email} onChangeText={setEmail} placeholder="you@example.com" colors={colors} keyboardType="email-address" autoCapitalize="none" autoComplete="email" maxLength={254} />
        <Field label="Password" value={password} onChangeText={setPassword} placeholder={register ? '1–16 characters' : 'Your password'} colors={colors} secureTextEntry maxLength={register ? MAX_SIGNUP_PASSWORD_LENGTH : 128} autoComplete={register ? 'new-password' : 'current-password'} />
        <Text style={[typography.caption, { color: colors.textMuted, marginBottom: spacing.md }]}>
          Accepted members can see daily calories, macros, and water only when sharing is enabled. Meal details, weight, and profile information stay private.
        </Text>
        {notice ? <Notice message={notice} colors={colors} /> : null}
        <Action label={authBusy ? 'Please wait…' : register ? 'Create account' : 'Sign in'} onPress={authenticate} disabled={authBusy} colors={colors} />
        <AppTouchable style={styles.link} onPress={() => { setRegister(v => !v); setNotice(''); }} accessibilityRole="button">
          <Text style={[typography.bodySmMed, { color: colors.primary }]}>{register ? 'Already registered? Sign in' : 'Create a Community account'}</Text>
        </AppTouchable>
      </Card>
    </ScrollView>
  </KeyboardAvoidingView>;

  return <ScrollView
    style={[styles.container, { backgroundColor: colors.bg }]}
    contentContainerStyle={styles.content}
    keyboardShouldPersistTaps="handled"
  >
    <View style={styles.titleRow}>
      <View style={styles.flex}>
        <Text style={[typography.h2, { color: colors.text }]}>Your group</Text>
        <Text numberOfLines={1} style={[typography.caption, { color: colors.textMuted, marginTop: 3 }]}>{session.user.email}</Text>
      </View>
      <AppTouchable onPress={async () => {
        setAuthBusy(true);
        try { await signOutOfCommunity(); setRequests([]); setPassword(''); }
        catch (_error) { setNotice('Could not sign out. Try again.'); }
        finally { setAuthBusy(false); }
      }} disabled={authBusy} accessibilityRole="button" accessibilityLabel="Log out" style={[styles.logoutButton, { borderColor: colors.cardBorder, opacity: authBusy ? 0.6 : 1 }]}>
        <Ionicons name="log-out-outline" size={18} color={colors.textSecondary} />
        <Text style={[typography.caption, { color: colors.textSecondary }]}>Log out</Text>
      </AppTouchable>
    </View>

    <Card style={styles.sharingCard} elevated>
      <View style={styles.sharingRow}>
        <View style={styles.flex}>
          <Text style={[typography.bodySmMed, { color: colors.text }]}>Share daily summaries</Text>
          <Text style={[typography.caption, { color: colors.textMuted, marginTop: 3 }]}>Accepted members can see your last 30 days of calories, macros, and water.</Text>
        </View>
        <Switch value={sharing} onValueChange={changeSharing} disabled={shareBusy} trackColor={{ false: colors.cardBorder, true: colors.primary }} thumbColor={colors.textInverse} accessibilityLabel="Share daily summaries" />
      </View>
    </Card>

    {notice ? <Notice message={notice} colors={colors} /> : null}
    <View style={styles.sectionTitle}>
      <Text style={[typography.h4, { color: colors.text }]}>People</Text>
      <AppTouchable style={[styles.addButton, { backgroundColor: colors.primarySurface }]} onPress={() => { setShowAdd(v => !v); setMatches([]); setNotice(''); }} accessibilityRole="button">
        <Ionicons name={showAdd ? 'close' : 'person-add-outline'} size={16} color={colors.primary} />
        <Text style={[typography.caption, { color: colors.primary, marginLeft: 5 }]}>{showAdd ? 'Close' : 'Add person'}</Text>
      </AppTouchable>
    </View>

    {showAdd && <Card style={styles.addCard}>
      <Text style={[typography.caption, { color: colors.textSecondary, marginBottom: spacing.xs }]}>Search by their exact display name</Text>
      <View style={styles.searchRow}>
        <TextInput value={name} onChangeText={setName} placeholder="Person’s name" placeholderTextColor={colors.textMuted} autoCapitalize="words" maxLength={60} returnKeyType="search" onSubmitEditing={search} style={[styles.input, styles.flex, { color: colors.text, backgroundColor: colors.bgSecondary, borderColor: colors.cardBorder }]} accessibilityLabel="Search by name" />
        <Action compact label={busy ? '…' : 'Search'} onPress={search} disabled={busy} colors={colors} />
      </View>
      {matches.map(person => {
        const linked = requests.some(r => [r.requester_id, r.recipient_id].includes(person.user_id) && ['pending', 'accepted'].includes(r.status));
        return <View key={person.user_id} style={[styles.matchRow, { borderTopColor: colors.cardBorder }]}>
          <View style={styles.flex}>
            <Text numberOfLines={1} style={[typography.bodySmMed, { color: colors.text }]}>{person.display_name}</Text>
            <Text style={[typography.caption, { color: colors.textMuted }]}>Member code {person.member_code}</Text>
          </View>
          <Action compact label={linked ? 'In group' : 'Request'} onPress={() => requestMember(person.user_id)} disabled={linked || busy} colors={colors} />
        </View>;
      })}
      {matches.length === 0 && name.trim().length >= 2 && !busy ? <Text style={[typography.caption, { color: colors.textMuted, marginTop: spacing.sm }]}>No match found for that exact name.</Text> : null}
    </Card>}

    {incoming.length > 0 && <Section label="Requests for you" colors={colors}>
      {incoming.map(r => <Card key={r.request_id} style={styles.requestCard}>
        <View style={styles.memberRow}>
          <Avatar name={otherMember(r, session.user.id).name} colors={colors} />
          <View style={[styles.flex, { marginHorizontal: spacing.sm }]}>
            <Text numberOfLines={1} style={[typography.bodySmMed, { color: colors.text }]}>{otherMember(r, session.user.id).name}</Text>
            <Text style={[typography.caption, { color: colors.textMuted }]}>Wants to join your group</Text>
          </View>
          <AppTouchable style={[styles.smallOutline, { borderColor: colors.cardBorder }]} onPress={() => reply(r.request_id, false)} accessibilityRole="button"><Text style={[typography.caption, { color: colors.textSecondary }]}>Decline</Text></AppTouchable>
          <AppTouchable style={[styles.acceptButton, { backgroundColor: colors.primary }]} onPress={() => reply(r.request_id, true)} accessibilityRole="button"><Text style={[typography.caption, { color: colors.textInverse }]}>Accept</Text></AppTouchable>
        </View>
      </Card>)}
    </Section>}

    {outgoing.length > 0 && <Section label="Sent requests" colors={colors}>
      {outgoing.map(r => <Card key={r.request_id} style={styles.requestCard}>
        <View style={styles.memberRow}>
          <Avatar name={otherMember(r, session.user.id).name} colors={colors} />
          <View style={[styles.flex, { marginHorizontal: spacing.sm }]}>
            <Text numberOfLines={1} style={[typography.bodySmMed, { color: colors.text }]}>{otherMember(r, session.user.id).name}</Text>
            <Text style={[typography.caption, { color: colors.warning }]}>Waiting for acceptance</Text>
          </View>
        </View>
      </Card>)}
    </Section>}

    <Section label="Accepted members" colors={colors}>
      {busy && requests.length === 0 ? <ActivityIndicator style={{ padding: spacing.lg }} color={colors.primary} /> :
        members.length === 0 ? <EmptyState icon="people-outline" title="Your group is empty" subtitle="Add someone by their exact name. Their reports appear after they accept and enable sharing." /> :
        members.map(member => <Card key={member.id} style={styles.memberCard} elevated>
          <View style={styles.memberRow}>
            <AppTouchable style={[styles.memberPress, styles.flex]} onPress={() => router.push({ pathname: '/community/[userId]', params: { userId: member.id } })} accessibilityRole="button" accessibilityLabel={'View ' + member.name + ' report'}>
              <Avatar name={member.name} colors={colors} />
              <View style={[styles.flex, { marginHorizontal: spacing.sm }]}>
                <Text numberOfLines={1} style={[typography.bodySmMed, { color: colors.text }]}>{member.name}</Text>
                <Text style={[typography.caption, { color: colors.textMuted }]}>View shared report</Text>
              </View>
              <Ionicons name="chevron-forward" size={17} color={colors.textMuted} />
            </AppTouchable>
            <AppTouchable onPress={() => remove(member)} hitSlop={8} accessibilityRole="button" accessibilityLabel={'Remove ' + member.name} style={styles.removeButton}><Ionicons name="person-remove-outline" size={18} color={colors.textMuted} /></AppTouchable>
          </View>
        </Card>)
      }
    </Section>
    {isAdmin && <Section label="All community reports" colors={colors}>
      <Text style={[typography.caption, { color: colors.textMuted, marginBottom: spacing.sm }]}>
        Admin access · daily summaries from all accounts, when present. Meal details and device-only logs are not stored here.
      </Text>
      {adminProfiles.length === 0 ? <EmptyState icon="clipboard-outline" title="No Community accounts yet" subtitle="New accounts will appear here." /> :
        adminProfiles.map(person => <Card key={person.user_id} style={styles.memberCard} elevated>
          <AppTouchable style={styles.memberRow} onPress={() => router.push({ pathname: '/community/[userId]', params: { userId: person.user_id } })} accessibilityRole="button" accessibilityLabel={'View admin report for ' + person.display_name}>
            <Avatar name={person.display_name} colors={colors} />
            <View style={[styles.flex, { marginHorizontal: spacing.sm }]}>
              <Text numberOfLines={1} style={[typography.bodySmMed, { color: colors.text }]}>{person.display_name}</Text>
              <Text style={[typography.caption, { color: colors.textMuted }]}>{person.share_reports ? 'Sharing enabled · view summary' : 'Sharing off · no stored summary'}</Text>
            </View>
            <Ionicons name="chevron-forward" size={17} color={colors.textMuted} />
          </AppTouchable>
        </Card>)
      }
    </Section>}
    <AppTouchable onPress={refresh} disabled={busy} style={styles.refresh} accessibilityRole="button">
      {busy ? <ActivityIndicator size="small" color={colors.primary} /> : <Ionicons name="refresh-outline" size={16} color={colors.primary} />}
      <Text style={[typography.caption, { color: colors.primary, marginLeft: 6 }]}>Refresh group</Text>
    </AppTouchable>
  </ScrollView>;
}

function Field({ label, colors, ...props }) {
  return <View style={styles.field}>
    <Text style={[typography.caption, styles.fieldLabel, { color: colors.textSecondary }]}>{label}</Text>
    <TextInput {...props} maxFontSizeMultiplier={1.3} style={[styles.input, { color: colors.text, backgroundColor: colors.bgSecondary, borderColor: colors.cardBorder }]} placeholderTextColor={colors.textMuted} />
  </View>;
}

function Action({ label, onPress, disabled, colors, compact }) {
  return <AppTouchable onPress={onPress} disabled={disabled} accessibilityRole="button" style={[styles.action, compact && styles.compactAction, { backgroundColor: disabled ? colors.cardBorder : colors.primary }]}>
    <Text style={[typography.bodySmMed, { color: disabled ? colors.textMuted : colors.textInverse }]}>{label}</Text>
  </AppTouchable>;
}

function Avatar({ name, colors }) {
  return <View style={[styles.avatar, { backgroundColor: colors.primarySurface }]}>
    <Text style={[typography.h4, { color: colors.primary }]}>{(name || '?').slice(0, 1).toUpperCase()}</Text>
  </View>;
}

function Section({ label, colors, children }) {
  return <View style={styles.section}>
    <Text style={[typography.caption, styles.sectionLabel, { color: colors.textMuted }]}>{label}</Text>
    {children}
  </View>;
}

function Notice({ message, colors }) {
  return <View style={[styles.notice, { backgroundColor: colors.primarySurface, borderColor: colors.cardBorder }]}>
    <Text style={[typography.caption, { color: colors.textSecondary }]}>{message}</Text>
  </View>;
}

const styles = StyleSheet.create({
  container: { flex: 1, minWidth: 0, width: '100%' },
  content: { paddingHorizontal: spacing.md, paddingTop: spacing.sm, paddingBottom: spacing.xxl, minWidth: 0 },
  authContent: { flexGrow: 1, justifyContent: 'center', padding: spacing.md, paddingBottom: spacing.xxl },
  authCard: { width: '100%', maxWidth: 480, alignSelf: 'center', minWidth: 0 },
  heading: { marginTop: spacing.md, marginBottom: spacing.xs },
  center: { alignItems: 'center', justifyContent: 'center' },
  field: { marginBottom: spacing.sm, minWidth: 0 },
  fieldLabel: { marginBottom: spacing.xs },
  input: { width: '100%', minWidth: 0, borderWidth: 1, borderRadius: radius.md, paddingHorizontal: spacing.md, paddingVertical: spacing.sm + 3, ...typography.bodySm },
  action: { minHeight: 40, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  compactAction: { minHeight: 36, paddingHorizontal: spacing.md, paddingVertical: spacing.xs + 3 },
  link: { alignSelf: 'center', paddingVertical: spacing.md, minHeight: 44, justifyContent: 'center' },
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.md, minWidth: 0 },
  flex: { flex: 1, minWidth: 0 },
  logoutButton: { minHeight: 40, borderWidth: 1, borderRadius: radius.md, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.xs, paddingHorizontal: spacing.sm, marginLeft: spacing.sm },
  sharingCard: { marginBottom: spacing.lg },
  sharingRow: { flexDirection: 'row', alignItems: 'center', minWidth: 0, gap: spacing.sm },
  sectionTitle: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.sm, minWidth: 0 },
  addButton: { minHeight: 36, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderRadius: radius.full, paddingHorizontal: spacing.md },
  addCard: { marginBottom: spacing.md },
  searchRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, minWidth: 0 },
  matchRow: { flexDirection: 'row', alignItems: 'center', borderTopWidth: 1, marginTop: spacing.sm, paddingTop: spacing.sm, minWidth: 0, gap: spacing.sm },
  section: { marginTop: spacing.md },
  sectionLabel: { marginBottom: spacing.xs },
  requestCard: { marginBottom: spacing.xs },
  memberCard: { marginBottom: spacing.xs, minWidth: 0 },
  memberRow: { flexDirection: 'row', alignItems: 'center', minWidth: 0 },
  memberPress: { flexDirection: 'row', alignItems: 'center', minWidth: 0 },
  avatar: { width: 40, height: 40, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  smallOutline: { minHeight: 36, borderWidth: 1, borderRadius: radius.md, justifyContent: 'center', paddingHorizontal: spacing.sm, marginRight: spacing.xs, flexShrink: 0 },
  acceptButton: { minHeight: 36, borderRadius: radius.md, justifyContent: 'center', paddingHorizontal: spacing.md, flexShrink: 0 },
  removeButton: { width: 36, height: 40, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  notice: { borderWidth: 1, borderRadius: radius.md, padding: spacing.sm, marginBottom: spacing.sm, minWidth: 0 },
  refresh: { alignSelf: 'center', minHeight: 44, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.md, marginTop: spacing.sm },
});







