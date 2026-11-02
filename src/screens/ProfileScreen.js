import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator,
  SafeAreaView, StatusBar, TextInput, Switch, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import Card from '../components/Card';
import SectionHeader from '../components/SectionHeader';
import { typography, spacing, radius } from '../utils/theme';
import { kgToDisplay } from '../utils/helpers';

export default function ProfileScreen() {
  const { colors, theme, toggleTheme, goals, saveGoals, profile, saveProfile, weight, getStreak, session, signOut } = useApp();
  const [editingProfile, setEditingProfile] = useState(false);
  const [editingGoals, setEditingGoals] = useState(false);
  const [localProfile, setLocalProfile] = useState({ ...profile });
  const [localGoals, setLocalGoals] = useState({ ...goals });
  const [logoutBusy, setLogoutBusy] = useState(false);

  const streak = getStreak();
  const latestWeight = weight.length ? weight[weight.length - 1].value : null;
  const initials = profile.name
    ? profile.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  const handleSaveProfile = async () => {
    await saveProfile(localProfile);
    setEditingProfile(false);
  };

  const handleSaveGoals = async () => {
    const parsed = {
      calories: parseFloat(localGoals.calories) || 2000,
      protein: parseFloat(localGoals.protein) || 150,
      carbs: parseFloat(localGoals.carbs) || 250,
      fat: parseFloat(localGoals.fat) || 65,
      fiber: parseFloat(localGoals.fiber) || 25,
      water: parseFloat(localGoals.water) || 2000,
      steps: parseFloat(localGoals.steps) || 8000,
      activeMinutes: parseFloat(localGoals.activeMinutes) || 30,
    };
    await saveGoals(parsed);
    setEditingGoals(false);
  };

  const handleLogout = async () => {
    setLogoutBusy(true);
    try {
      if (!session) {
        Alert.alert('Already signed out', 'There is no account signed in on this device.');
        return;
      }
      await signOut();
    } catch (_error) {
      Alert.alert('Could not log out', 'Check your connection and try again.');
    } finally {
      setLogoutBusy(false);
    }
  };

  const activityLevels = [
    { key: 'sedentary', label: 'Sedentary', desc: 'Little or no exercise' },
    { key: 'light', label: 'Light', desc: '1–3 days/week' },
    { key: 'moderate', label: 'Moderate', desc: '3–5 days/week' },
    { key: 'active', label: 'Active', desc: '6–7 days/week' },
    { key: 'veryActive', label: 'Very Active', desc: 'Twice/day' },
  ];

  const dietaryPrefs = ['Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free', 'Keto', 'Paleo', 'Halal', 'Kosher'];

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]}>
      <StatusBar barStyle={theme === 'dark' ? 'light-content' : 'dark-content'} backgroundColor={colors.bg} />
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.pageHeader}>
          <Text style={[typography.h1, { color: colors.text }]}>Profile</Text>
          <TouchableOpacity
            style={[styles.themeBtn, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
            onPress={toggleTheme}
          >
            <Ionicons name={theme === 'dark' ? 'sunny' : 'moon'} size={18} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Avatar card */}
        <Card style={styles.avatarCard} elevated>
          <View style={styles.avatarRow}>
            <View style={[styles.avatar, { backgroundColor: colors.primarySurface, borderColor: colors.primary + '50' }]}>
              <Text style={[typography.h1, { color: colors.primaryLight }]}>{initials}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[typography.h2, { color: colors.text }]}>{profile.name || 'Your Name'}</Text>
              {latestWeight && (
                <Text style={[typography.bodySm, { color: colors.textSecondary, marginTop: 2 }]}>
                  {kgToDisplay(latestWeight)}
                  {profile.age ? ` · ${profile.age} yrs` : ''}
                  {profile.height ? ` · ${profile.height} cm` : ''}
                </Text>
              )}
              <View style={styles.badgeRow}>
                {streak > 0 && (
                  <View style={[styles.statBadge, { backgroundColor: colors.warning + '20', borderColor: colors.warning + '30' }]}>
                    <Text style={[typography.micro, { color: colors.warning }]}>🔥 {streak} day streak</Text>
                  </View>
                )}

              </View>
            </View>
          </View>
        </Card>

        {/* Personal info */}
        <SectionHeader
          title="Personal Info"
          action={editingProfile ? 'Save' : 'Edit'}
          onAction={editingProfile
            ? handleSaveProfile
            : () => { setLocalProfile({ ...profile }); setEditingProfile(true); }
          }
          style={styles.sectionPad}
        />
        <Card style={styles.sectionCard} elevated>
          <ProfileField
            label="Name" value={localProfile.name} editable={editingProfile}
            onChange={v => setLocalProfile(p => ({ ...p, name: v }))} placeholder="Full name"
          />
          <ProfileField
            label="Age" value={localProfile.age} editable={editingProfile}
            onChange={v => setLocalProfile(p => ({ ...p, age: v }))} placeholder="Years" keyboard="numeric"
          />
          <ProfileField
            label="Height (cm)" value={localProfile.height} editable={editingProfile}
            onChange={v => setLocalProfile(p => ({ ...p, height: v }))} placeholder="e.g. 175" keyboard="numeric"
          />
          <ProfileField
            label="Weight (kg)" value={localProfile.weight} editable={editingProfile}
            onChange={v => setLocalProfile(p => ({ ...p, weight: v }))} placeholder="e.g. 70" keyboard="decimal-pad"
          />
          {editingProfile ? (
            <View style={styles.fieldRow}>
              <Text style={[typography.bodySmMed, { color: colors.textSecondary }]}>Gender</Text>
              <View style={styles.genderRow}>
                {['Male', 'Female', 'Other'].map(g => (
                  <TouchableOpacity
                    key={g}
                    style={[styles.genderBtn, {
                      backgroundColor: localProfile.gender === g.toLowerCase() ? colors.primary : colors.cardElevated,
                      borderColor: localProfile.gender === g.toLowerCase() ? colors.primary : colors.cardBorder,
                    }]}
                    onPress={() => setLocalProfile(p => ({ ...p, gender: g.toLowerCase() }))}
                  >
                    <Text style={[typography.caption, {
                      color: localProfile.gender === g.toLowerCase() ? '#fff' : colors.textSecondary,
                    }]}>
                      {g}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ) : (
            <ProfileField
              label="Gender"
              value={profile.gender ? profile.gender.charAt(0).toUpperCase() + profile.gender.slice(1) : ''}
              editable={false}
              placeholder="Not set"
            />
          )}
        </Card>

        {/* Activity level — shown only when editing */}
        {editingProfile && (
          <>
            <Text style={[typography.h4, { color: colors.textSecondary, paddingHorizontal: spacing.md, marginBottom: spacing.sm }]}>
              Activity Level
            </Text>
            <Card style={styles.sectionCard} elevated>
              {activityLevels.map(level => (
                <TouchableOpacity
                  key={level.key}
                  style={[styles.levelRow, { borderBottomColor: colors.cardBorder }]}
                  onPress={() => setLocalProfile(p => ({ ...p, activityLevel: level.key }))}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={[typography.bodyMed, { color: colors.text }]}>{level.label}</Text>
                    <Text style={[typography.caption, { color: colors.textMuted }]}>{level.desc}</Text>
                  </View>
                  {localProfile.activityLevel === level.key && (
                    <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </Card>
          </>
        )}

        {/* Dietary prefs — shown only when editing */}
        {editingProfile && (
          <>
            <Text style={[typography.h4, { color: colors.textSecondary, paddingHorizontal: spacing.md, marginBottom: spacing.sm }]}>
              Dietary Preferences
            </Text>
            <Card style={styles.sectionCard} elevated>
              <View style={styles.prefGrid}>
                {dietaryPrefs.map(pref => {
                  const active = (localProfile.dietaryPrefs || []).includes(pref);
                  return (
                    <TouchableOpacity
                      key={pref}
                      style={[styles.prefChip, {
                        backgroundColor: active ? colors.primarySurface : colors.cardElevated,
                        borderColor: active ? colors.primary : colors.cardBorder,
                      }]}
                      onPress={() => {
                        const prefs = localProfile.dietaryPrefs || [];
                        setLocalProfile(p => ({
                          ...p,
                          dietaryPrefs: active
                            ? prefs.filter(x => x !== pref)
                            : [...prefs, pref],
                        }));
                      }}
                    >
                      <Text style={[typography.caption, {
                        color: active ? colors.primaryLight : colors.textSecondary,
                      }]}>
                        {pref}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </Card>
          </>
        )}

        {/* Nutrition goals */}
        <SectionHeader
          title="Nutrition Goals"
          action={editingGoals ? 'Save' : 'Edit'}
          onAction={editingGoals
            ? handleSaveGoals
            : () => { setLocalGoals({ ...goals }); setEditingGoals(true); }
          }
          style={styles.sectionPad}
        />
        <Card style={styles.sectionCard} elevated>
          {[
            { key: 'calories', label: 'Daily Calories', unit: 'kcal', color: colors.primaryLight },
            { key: 'protein',  label: 'Protein',        unit: 'g',    color: colors.protein },
            { key: 'carbs',    label: 'Carbohydrates',  unit: 'g',    color: colors.carbs },
            { key: 'fat',      label: 'Fat',            unit: 'g',    color: colors.fat },
            { key: 'fiber',    label: 'Fiber',          unit: 'g',    color: colors.fiber },
            { key: 'water',    label: 'Water',          unit: 'ml',   color: colors.water },
          ].map(({ key, label, unit, color }) => (
            <View key={key} style={[styles.goalRow, { borderBottomColor: colors.cardBorder }]}>
              <View style={[styles.goalDot, { backgroundColor: color }]} />
              <Text style={[typography.bodyMed, { color: colors.text, flex: 1 }]}>{label}</Text>
              {editingGoals ? (
                <TextInput
                  style={[styles.goalInput, { color: colors.text, borderBottomColor: colors.primary }]}
                  value={String(localGoals[key] || '')}
                  onChangeText={v => setLocalGoals(g => ({ ...g, [key]: v }))}
                  keyboardType="numeric"
                  selectTextOnFocus
                />
              ) : (
                <Text style={[typography.bodyMed, { color }]}>{goals[key]} {unit}</Text>
              )}
            </View>
          ))}
        </Card>

        {/* Settings */}
        <SectionHeader title="Settings" style={styles.sectionPad} />
        <Card style={styles.sectionCard} elevated>
          <View style={[styles.settingRow, { borderBottomColor: colors.cardBorder }]}>
            <View style={styles.settingLeft}>
              <Ionicons name={theme === 'dark' ? 'moon' : 'sunny'} size={20} color={colors.textSecondary} />
              <Text style={[typography.bodyMed, { color: colors.text, marginLeft: spacing.sm }]}>Dark Mode</Text>
            </View>
            <Switch
              value={theme === 'dark'}
              onValueChange={toggleTheme}
              trackColor={{ false: colors.cardBorder, true: colors.primary }}
              thumbColor="#fff"
            />
          </View>
          {session && <TouchableOpacity
            style={[styles.settingRow, { borderBottomColor: colors.cardBorder }]}
            onPress={handleLogout}
            disabled={logoutBusy}
            accessibilityRole="button"
            accessibilityLabel="Log out"
            accessibilityState={{ disabled: logoutBusy }}
          >
            <View style={styles.settingLeft}>
              <Ionicons name="log-out-outline" size={20} color={colors.error} />
              <View style={{ marginLeft: spacing.sm, flexShrink: 1 }}>
                <Text style={[typography.bodyMed, { color: colors.error }]}>Log out</Text>
                <Text numberOfLines={1} style={[typography.caption, { color: colors.textMuted, maxWidth: 220 }]}>
                  {session.user.email}
                </Text>
              </View>
            </View>
            {logoutBusy
              ? <ActivityIndicator size="small" color={colors.error} />
              : <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />}
          </TouchableOpacity>}
        </Card>

        <Text style={[typography.caption, { color: colors.textMuted, textAlign: 'center', marginVertical: spacing.lg }]}>
          NutriTrack v2.0 · Eat Better. Live Healthier.
        </Text>

        <View style={{ height: 100 }} />
      </ScrollView>

    </SafeAreaView>
  );
}

function ProfileField({ label, value, editable, onChange, placeholder, keyboard }) {
  const { colors } = useApp();
  return (
    <View style={[styles.fieldRow, { borderBottomColor: colors.cardBorder }]}>
      <Text style={[typography.bodySmMed, { color: colors.textSecondary, width: 110 }]}>{label}</Text>
      {editable ? (
        <TextInput
          style={[styles.fieldInput, { color: colors.text, borderBottomColor: colors.primary }]}
          value={value || ''}
          onChangeText={onChange}
          placeholder={placeholder}
          placeholderTextColor={colors.textMuted}
          keyboardType={keyboard || 'default'}
        />
      ) : (
        <Text style={[typography.bodyMed, { color: colors.text, flex: 1, textAlign: 'right' }]}>
          {value || '—'}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, minWidth: 0, width: '100%' },
  pageHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: spacing.md, paddingTop: spacing.md, paddingBottom: spacing.sm,
  },
  themeBtn: { padding: spacing.sm, borderRadius: radius.md, borderWidth: 1 },
  avatarCard: { marginHorizontal: spacing.md, marginBottom: spacing.lg },
  avatarRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  avatar: {
    width: 72, height: 72, borderRadius: 36,
    alignItems: 'center', justifyContent: 'center', borderWidth: 2,
  },
  badgeRow: { flexDirection: 'row', gap: spacing.xs, marginTop: spacing.xs, flexWrap: 'wrap' },
  statBadge: {
    paddingHorizontal: spacing.sm, paddingVertical: 3,
    borderRadius: radius.full, borderWidth: 1,
  },
  sectionPad: { paddingHorizontal: spacing.md },
  sectionCard: { marginHorizontal: spacing.md, marginBottom: spacing.md },
  fieldRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: spacing.sm + 2, borderBottomWidth: 1,
  },
  fieldInput: {
    flex: 1, textAlign: 'right', ...typography.bodyMed,
    borderBottomWidth: 1, paddingBottom: 2, marginLeft: spacing.sm,
  },
  genderRow: { flexDirection: 'row', gap: spacing.xs },
  genderBtn: {
    paddingHorizontal: spacing.sm, paddingVertical: 5,
    borderRadius: radius.full, borderWidth: 1,
  },
  levelRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: spacing.sm + 2, borderBottomWidth: 1,
  },
  prefGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  prefChip: {
    paddingHorizontal: spacing.sm, paddingVertical: 5,
    borderRadius: radius.full, borderWidth: 1,
  },
  goalRow: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    paddingVertical: spacing.sm + 2, borderBottomWidth: 1,
  },
  goalDot: { width: 10, height: 10, borderRadius: 5 },
  goalInput: {
    width: 70, textAlign: 'right', ...typography.bodyMed,
    borderBottomWidth: 1, paddingBottom: 2,
  },
  settingRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: spacing.md, borderBottomWidth: 1,
  },
  settingLeft: { flexDirection: 'row', alignItems: 'center' },
});
