import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import AppTouchable from '../components/AppTouchable';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useApp } from '../context/AppContext';
import Card from '../components/Card';
import EmptyState from '../components/EmptyState';
import { isSupabaseConfigured } from '../lib/supabase';
import { getCommunityProfile, getCommunityReports, isCommunityAdmin } from '../services/communityService';
import { radius, spacing, typography } from '../utils/theme';

const METRICS = [
  { key: 'calories', label: 'Calories', unit: 'kcal' },
  { key: 'protein', label: 'Protein', unit: 'g' },
  { key: 'carbs', label: 'Carbs', unit: 'g' },
  { key: 'fat', label: 'Fat', unit: 'g' },
  { key: 'fiber', label: 'Fiber', unit: 'g' },
  { key: 'water', label: 'Water', unit: 'ml' },
];

const dateCutoff = () => {
  const date = new Date();
  date.setDate(date.getDate() - 29);
  return [date.getFullYear(), String(date.getMonth() + 1).padStart(2, '0'), String(date.getDate()).padStart(2, '0')].join('-');
};

export default function CommunityMemberProfileScreen() {
  const { colors } = useApp();
  const { userId } = useLocalSearchParams();
  const memberId = Array.isArray(userId) ? userId[0] : userId;
  const [profile, setProfile] = useState(null);
  const [reports, setReports] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = useCallback(async () => {
    if (!memberId || !isSupabaseConfigured) {
      setError(true);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(false);
    try {
      const [admin, nextProfile] = await Promise.all([
        isCommunityAdmin(), getCommunityProfile(memberId),
      ]);
      setIsAdmin(admin);
      if (!nextProfile) {
        setProfile(null);
        setReports([]);
        setError(true);
        return;
      }
      setProfile(nextProfile);
      setReports(nextProfile.share_reports || admin
        ? await getCommunityReports(memberId, dateCutoff())
        : []);
    } catch (_loadError) {
      setError(true);
      setProfile(null);
      setReports([]);
    } finally {
      setLoading(false);
    }
  }, [memberId]);

  useEffect(() => {
    const timer = setTimeout(load, 0);
    return () => clearTimeout(timer);
  }, [load]);

  return <View style={[styles.screen, { backgroundColor: colors.bg }]}>
    <View style={[styles.header, { borderBottomColor: colors.cardBorder }]}>
      <AppTouchable onPress={() => router.back()} style={styles.headerButton} accessibilityRole="button" accessibilityLabel="Go back">
        <Ionicons name="arrow-back" size={21} color={colors.text} />
      </AppTouchable>
      <Text numberOfLines={1} style={[typography.h3, styles.title, { color: colors.text }]}>{profile?.display_name || 'Member report'}</Text>
      <AppTouchable onPress={load} style={styles.headerButton} accessibilityRole="button" accessibilityLabel="Refresh report">
        <Ionicons name="refresh-outline" size={19} color={colors.primary} />
      </AppTouchable>
    </View>
    <ScrollView contentContainerStyle={styles.content}>
      {loading ? <ActivityIndicator color={colors.primary} style={styles.loading} /> :
        error ? <Card style={styles.stateCard}>
          <EmptyState icon="lock-closed-outline" title="Report unavailable" subtitle="It is visible only while you are accepted group members and sharing is enabled." action="Try again" onAction={load} />
        </Card> :
        !profile?.share_reports && !isAdmin ? <Card style={styles.stateCard}>
          <EmptyState icon="stats-chart-outline" title={profile?.display_name + ' is not sharing reports'} subtitle="They can enable daily summary sharing from their Community screen." />
        </Card> :
        reports.length === 0 ? <Card style={styles.stateCard}>
          <EmptyState icon="calendar-outline" title="No shared reports yet" subtitle="Daily summaries appear after they log nutrition or water." />
        </Card> :
        <>
          <Card style={styles.privacy}>
            <View style={styles.privacyRow}>
              <Ionicons name="lock-closed-outline" size={17} color={colors.primary} />
              <Text style={[typography.caption, styles.privacyText, { color: colors.textSecondary }]}>
                {isAdmin
                  ? 'Admin view · available daily summaries, up to 30 days. Device-only meal details and logs are not stored here.'
                  : 'Daily summaries only · Last 30 days. Meal details, weight, and profile information stay private.'}
              </Text>
            </View>
          </Card>
          {reports.map(report => <Card key={report.report_date} style={styles.reportCard} elevated>
            <Text style={[typography.bodySmMed, { color: colors.text }]}>
              {new Date(report.report_date + 'T12:00:00').toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
            </Text>
            <View style={styles.grid}>
              {METRICS.map(metric => <View key={metric.key} style={[styles.tile, { backgroundColor: colors.cardElevated, borderColor: colors.cardBorder }]}>
                <Text style={[typography.micro, { color: colors.textMuted }]}>{metric.label}</Text>
                <Text numberOfLines={1} style={[typography.bodySmMed, { color: metric.key === 'calories' ? colors.primary : colors.text }]}>
                  {Math.round(Number(report[metric.key]) || 0).toLocaleString()} {metric.unit}
                </Text>
              </View>)}
            </View>
          </Card>)}
        </>
      }
    </ScrollView>
  </View>;
}

const styles = StyleSheet.create({
  screen: { flex: 1, minWidth: 0 },
  header: { flexDirection: 'row', alignItems: 'center', minWidth: 0, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderBottomWidth: StyleSheet.hairlineWidth },
  headerButton: { width: 42, height: 42, alignItems: 'center', justifyContent: 'center' },
  title: { flex: 1, minWidth: 0, textAlign: 'center' },
  content: { padding: spacing.md, paddingBottom: spacing.xxl, minWidth: 0 },
  loading: { marginTop: spacing.xxl },
  stateCard: { minWidth: 0 },
  privacy: { marginBottom: spacing.sm },
  privacyRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.xs, minWidth: 0 },
  privacyText: { flex: 1, minWidth: 0 },
  reportCard: { marginBottom: spacing.sm, minWidth: 0 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginTop: spacing.sm, minWidth: 0 },
  tile: { flexBasis: '48%', flexGrow: 1, minWidth: 112, padding: spacing.sm, borderRadius: radius.md, borderWidth: 1 },
});

