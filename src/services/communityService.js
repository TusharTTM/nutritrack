import { supabase } from '../lib/supabase';

function getClient() {
  if (!supabase) {
    throw new Error('Community is not configured.');
  }
  return supabase;
}

function unwrap({ data, error }) {
  if (error) throw error;
  return data;
}

export async function getCommunitySession() {
  const { data, error } = await getClient().auth.getSession();
  if (error) throw error;
  return data.session;
}

export async function isCommunityAdmin() {
  const { data: { user }, error } = await getClient().auth.getUser();
  if (error) throw error;
  return user?.app_metadata?.nutritrack_role === 'admin';
}

export async function subscribeToCommunityAuth(onSession) {
  const { data: { subscription } } = getClient().auth.onAuthStateChange((_event, session) => {
    onSession(session);
  });
  return () => subscription.unsubscribe();
}

export async function signInToCommunity(email, password) {
  return unwrap(await getClient().auth.signInWithPassword({
    email: email.trim().toLowerCase(),
    password,
  }));
}

export async function signUpForCommunity({ displayName, email, password }) {
  return unwrap(await getClient().auth.signUp({
    email: email.trim().toLowerCase(),
    password,
    options: { data: { display_name: displayName.trim() } },
  }));
}

export async function signOutOfCommunity() {
  return unwrap(await getClient().auth.signOut());
}

export async function getCommunityRequests() {
  return unwrap(await getClient().rpc('get_my_community_requests')) || [];
}

export async function getMySharingPreference() {
  const { data, error } = await getClient()
    .from('community_profiles')
    .select('share_reports')
    .maybeSingle();
  if (error) throw error;
  return Boolean(data?.share_reports);
}

export async function setMySharingPreference(shareReports) {
  const client = getClient();
  const { data: { user }, error: userError } = await client.auth.getUser();
  if (userError) throw userError;
  if (!user) throw new Error('Sign in required.');
  const { error } = await client
    .from('community_profiles')
    .update({ share_reports: Boolean(shareReports) })
    .eq('user_id', user.id);
  if (error) throw error;
  if (shareReports) return { cleanupPending: false };
  const { error: cleanupError } = await client
    .from('community_daily_reports')
    .delete()
    .eq('user_id', user.id);
  return { cleanupPending: Boolean(cleanupError) };
}

export async function searchCommunityProfiles(name) {
  return unwrap(await getClient().rpc('search_community_profiles', {
    search_name: name.trim(),
  })) || [];
}

export async function sendCommunityRequest(memberId) {
  return unwrap(await getClient()
    .from('community_requests')
    .insert({ recipient_id: memberId })
    .select('id')
    .single());
}

export async function respondToCommunityRequest(requestId, accept) {
  return unwrap(await getClient().rpc('respond_to_community_request', {
    p_request_id: requestId,
    p_accept: Boolean(accept),
  }));
}

export async function removeCommunityMember(memberId) {
  return unwrap(await getClient().rpc('remove_community_member', {
    p_member_id: memberId,
  }));
}

export async function getCommunityProfile(userId) {
  const { data, error } = await getClient()
    .from('community_profiles')
    .select('user_id, display_name, share_reports')
    .eq('user_id', userId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function getAllCommunityProfiles() {
  const { data, error } = await getClient()
    .from('community_profiles')
    .select('user_id, display_name, share_reports')
    .order('display_name');
  if (error) throw error;
  return data || [];
}

export async function getCommunityReports(userId, sinceDate) {
  const { data, error } = await getClient()
    .from('community_daily_reports')
    .select('report_date, calories, protein, carbs, fat, fiber, water')
    .eq('user_id', userId)
    .gte('report_date', sinceDate)
    .order('report_date', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function syncOwnCommunityReports(reports) {
  const client = getClient();
  const { data: { user }, error: userError } = await client.auth.getUser();
  if (userError) throw userError;
  if (!user) return;

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 29);
  const sinceDate = [
    cutoff.getFullYear(),
    String(cutoff.getMonth() + 1).padStart(2, '0'),
    String(cutoff.getDate()).padStart(2, '0'),
  ].join('-');

  const recent = reports.filter(report => report.date >= sinceDate);
  const hasValues = report => (
    Number(report.calories) > 0 || Number(report.protein) > 0
    || Number(report.carbs) > 0 || Number(report.fat) > 0
    || Number(report.fiber) > 0 || Number(report.water) > 0
  );
  const rows = recent.filter(hasValues).map(report => ({
    user_id: user.id,
    report_date: report.date,
    calories: Math.max(0, Number(report.calories) || 0),
    protein: Math.max(0, Number(report.protein) || 0),
    carbs: Math.max(0, Number(report.carbs) || 0),
    fat: Math.max(0, Number(report.fat) || 0),
    fiber: Math.max(0, Number(report.fiber) || 0),
    water: Math.max(0, Number(report.water) || 0),
  }));

  if (rows.length) {
    const { error } = await client
      .from('community_daily_reports')
      .upsert(rows, { onConflict: 'user_id,report_date' });
    if (error) throw error;
  }

  const emptyDates = recent.filter(report => !hasValues(report)).map(report => report.date);
  if (emptyDates.length) {
    const { error } = await client
      .from('community_daily_reports')
      .delete()
      .eq('user_id', user.id)
      .in('report_date', emptyDates);
    if (error) throw error;
  }

  const { error: cleanupError } = await client
    .from('community_daily_reports')
    .delete()
    .eq('user_id', user.id)
    .lt('report_date', sinceDate);
  if (cleanupError) throw cleanupError;
}
