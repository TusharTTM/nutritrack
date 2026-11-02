import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  SafeAreaView, StatusBar, Modal, TextInput, Alert,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import Card from '../components/Card';
import SectionHeader from '../components/SectionHeader';
import EmptyState from '../components/EmptyState';
import { typography, spacing, radius } from '../utils/theme';
import { activityDatabase, calcActivityCalories } from '../data/foods';


export default function ActivityScreen() {
  const { width } = useWindowDimensions();
  const gridColumns = width < 375 ? 2 : 3;
  const { colors, theme, getTodayActivities, addActivity, removeActivity, profile } = useApp();

  const [addModal, setAddModal] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [duration, setDuration] = useState('30');
  const [customName, setCustomName] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const todayActivities = getTodayActivities();
  const totalBurned = todayActivities.reduce((s, a) => s + (a.caloriesBurned || 0), 0);
  const totalMinutes = todayActivities.reduce((s, a) => s + (a.duration || 0), 0);
  const weightKg = parseFloat(profile.weight) || 70;

  const actCategories = ['All', ...new Set(activityDatabase.map(a => a.category))];
  const filteredActivities = activityDatabase.filter(a =>
    activeCategory === 'All' || a.category === activeCategory
  );

  const handleAdd = () => {
    if (!selectedActivity) return;
    const dur = parseInt(duration) || 30;
    const name = selectedActivity.id === 'a16' && customName ? customName : selectedActivity.name;
    const burned = calcActivityCalories(selectedActivity.metValue, weightKg, dur);
    addActivity({
      activityId: selectedActivity.id,
      name,
      icon: selectedActivity.icon,
      category: selectedActivity.category,
      duration: dur,
      caloriesBurned: burned,
    });
    setAddModal(false);
    setSelectedActivity(null);
    setDuration('30');
    setCustomName('');
  };

  const confirmRemove = (id) => {
    Alert.alert('Remove Activity', "Remove this from today's log?", [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => removeActivity(id) },
    ]);
  };

  const previewCals = selectedActivity
    ? calcActivityCalories(selectedActivity.metValue, weightKg, parseInt(duration) || 30)
    : 0;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]}>
      <StatusBar barStyle={theme === 'dark' ? 'light-content' : 'dark-content'} backgroundColor={colors.bg} />
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.pageHeader}>
          <Text style={[typography.h1, { color: colors.text }]}>Activity</Text>
          <TouchableOpacity
            style={[styles.addBtn, { backgroundColor: colors.primary }]}
            onPress={() => { setSelectedActivity(null); setDuration('30'); setAddModal(true); }}
          >
            <Ionicons name="add" size={18} color="#fff" />
            <Text style={[typography.bodyMed, { color: '#fff', marginLeft: 4 }]}>Log</Text>
          </TouchableOpacity>
        </View>

        {/* Summary row */}
        <View style={styles.summaryRow}>
          <SummaryCard icon="flame" value={totalBurned} unit="kcal burned" color={colors.warning} colors={colors} />
          <SummaryCard icon="time" value={totalMinutes} unit="active min" color={colors.info} colors={colors} />
          <SummaryCard icon="barbell-outline" value={todayActivities.length} unit="workouts" color={colors.primary} colors={colors} />
        </View>

        {/* Today's logs */}
        <View style={{ paddingHorizontal: spacing.md }}>
          <SectionHeader
            title="Today"
            subtitle={new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
          />

          {todayActivities.length === 0 ? (
            <EmptyState
              icon="🏃"
              title="No activity logged"
              subtitle="Track your workouts to see calories burned"
              action="Log Activity"
              onAction={() => setAddModal(true)}
            />
          ) : (
            todayActivities.map(activity => (
              <Card key={activity.id} style={styles.actCard} elevated>
                <View style={styles.actRow}>
                  <View style={[styles.actIconBox, { backgroundColor: colors.warning + '18' }]}>
                    <Text style={{ fontSize: 24 }}>{activity.icon}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[typography.h4, { color: colors.text }]}>{activity.name}</Text>
                    <Text style={[typography.caption, { color: colors.textMuted }]}>
                      {activity.category} · {activity.duration} min
                    </Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={[typography.h3, { color: colors.warning }]}>{activity.caloriesBurned}</Text>
                    <Text style={[typography.micro, { color: colors.textMuted }]}>kcal</Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => confirmRemove(activity.id)}
                    hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                    style={{ marginLeft: spacing.sm }}
                  >
                    <Ionicons name="trash-outline" size={16} color={colors.textMuted} />
                  </TouchableOpacity>
                </View>
              </Card>
            ))
          )}
        </View>

        {/* Browse activities */}
        <View style={{ paddingHorizontal: spacing.md, marginTop: spacing.lg }}>
          <SectionHeader title="Browse Activities" />

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: spacing.xs, paddingBottom: spacing.sm }}>
            {actCategories.map(cat => (
              <TouchableOpacity
                key={cat}
                style={[styles.catPill, {
                  backgroundColor: activeCategory === cat ? colors.primary : colors.card,
                  borderColor: activeCategory === cat ? colors.primary : colors.cardBorder,
                }]}
                onPress={() => setActiveCategory(cat)}
              >
                <Text style={[typography.micro, { color: activeCategory === cat ? '#fff' : colors.textSecondary }]}>
                  {cat.toUpperCase()}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View style={styles.actGrid}>
            {filteredActivities.map(act => {
              const est = calcActivityCalories(act.metValue, weightKg, 30);
              return (
                <TouchableOpacity
                  key={act.id}
                  style={[styles.actGridCard, { width: (width - spacing.md * 2 - spacing.sm * (gridColumns - 1)) / gridColumns, backgroundColor: colors.card, borderColor: colors.cardBorder }]}
                  onPress={() => { setSelectedActivity(act); setDuration('30'); setAddModal(true); }}
                >
                  <Text style={{ fontSize: 28 }}>{act.icon}</Text>
                  <Text numberOfLines={2} style={[typography.caption, { color: colors.text, marginTop: 6, textAlign: 'center', flexShrink: 1 }]}>{act.name}</Text>
                  <Text style={[typography.micro, { color: colors.textMuted, marginTop: 2 }]}>~{est}/30m</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Disclaimer */}
        <View style={[styles.note, { backgroundColor: colors.cardElevated, borderColor: colors.cardBorder }]}>
          <Ionicons name="information-circle-outline" size={16} color={colors.textMuted} />
          <Text style={[typography.caption, { color: colors.textMuted, flex: 1, marginLeft: spacing.xs }]}>
            Calorie estimates use the MET formula based on your logged weight. These are approximations, not exact measurements.
          </Text>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Log Activity Modal */}
      <Modal visible={addModal} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={[styles.modal, { backgroundColor: colors.bg }]}>
          <View style={[styles.modalHeader, { borderBottomColor: colors.cardBorder }]}>
            <TouchableOpacity onPress={() => { setAddModal(false); setSelectedActivity(null); }}>
              <Text style={[typography.bodyMed, { color: colors.textSecondary }]}>Cancel</Text>
            </TouchableOpacity>
            <Text style={[typography.h3, { color: colors.text }]}>Log Activity</Text>
            <TouchableOpacity onPress={handleAdd} disabled={!selectedActivity}>
              <Text style={[typography.bodyMed, { color: selectedActivity ? colors.primary : colors.textMuted }]}>Save</Text>
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={{ padding: spacing.md, gap: spacing.lg }}>
            {/* Activity grid */}
            <Text style={[typography.h4, { color: colors.textSecondary }]}>Select Activity</Text>
            <View style={styles.actPickerGrid}>
              {activityDatabase.map(act => (
                <TouchableOpacity
                  key={act.id}
                  style={[styles.actPickerItem, { width: (width - spacing.md * 2 - spacing.sm * (gridColumns - 1)) / gridColumns,
                    backgroundColor: selectedActivity?.id === act.id ? colors.primarySurface : colors.card,
                    borderColor: selectedActivity?.id === act.id ? colors.primary : colors.cardBorder,
                  }]}
                  onPress={() => setSelectedActivity(act)}
                >
                  <Text style={{ fontSize: 24 }}>{act.icon}</Text>
                  <Text numberOfLines={2} style={[typography.caption, { flexShrink: 1,
                    color: selectedActivity?.id === act.id ? colors.primaryLight : colors.textSecondary,
                    textAlign: 'center', marginTop: 4,
                  }]}>{act.name}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Custom name */}
            {selectedActivity?.id === 'a16' && (
              <View>
                <Text style={[typography.bodySmMed, { color: colors.textSecondary, marginBottom: spacing.xs }]}>Activity Name</Text>
                <TextInput
                  style={[styles.input, { color: colors.text, backgroundColor: colors.card, borderColor: colors.cardBorder }]}
                  placeholder="e.g. Rock Climbing"
                  placeholderTextColor={colors.textMuted}
                  value={customName}
                  onChangeText={setCustomName}
                />
              </View>
            )}

            {/* Duration */}
            <View>
              <Text style={[typography.bodySmMed, { color: colors.textSecondary, marginBottom: spacing.sm }]}>Duration</Text>
              <View style={styles.durationRow}>
                {[15, 30, 45, 60, 90].map(d => (
                  <TouchableOpacity
                    key={d}
                    style={[styles.durChip, {
                      backgroundColor: duration === String(d) ? colors.primary : colors.card,
                      borderColor: duration === String(d) ? colors.primary : colors.cardBorder,
                    }]}
                    onPress={() => setDuration(String(d))}
                  >
                    <Text style={[typography.bodySmMed, { color: duration === String(d) ? '#fff' : colors.textSecondary }]}>{d}m</Text>
                  </TouchableOpacity>
                ))}
                <TextInput
                  style={[styles.durInput, { color: colors.text, backgroundColor: colors.card, borderColor: colors.cardBorder }]}
                  placeholder="min"
                  placeholderTextColor={colors.textMuted}
                  value={[15,30,45,60,90].includes(parseInt(duration)) ? '' : duration}
                  onChangeText={setDuration}
                  keyboardType="number-pad"
                />
              </View>
            </View>

            {/* Preview card */}
            {selectedActivity && (
              <Card style={{ borderColor: colors.primary + '40' }} elevated>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={{ fontSize: 36 }}>{selectedActivity.icon}</Text>
                  <View style={{ flex: 1, marginLeft: spacing.md }}>
                    <Text style={[typography.h4, { color: colors.text }]}>
                      {selectedActivity.id === 'a16' && customName ? customName : selectedActivity.name}
                    </Text>
                    <Text style={[typography.bodySm, { color: colors.textMuted }]}>{parseInt(duration) || 30} minutes</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={[typography.h1, { color: colors.warning }]}>~{previewCals}</Text>
                    <Text style={[typography.micro, { color: colors.textMuted }]}>kcal burned</Text>
                  </View>
                </View>
              </Card>
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

function SummaryCard({ icon, value, unit, color, colors }) {
  return (
    <Card style={{ flex: 1, alignItems: 'center' }} elevated>
      <Ionicons name={icon} size={22} color={color} />
      <Text style={[typography.h2, { color, marginTop: 6 }]}>{value}</Text>
      <Text style={[typography.micro, { color: colors.textMuted, textAlign: 'center' }]}>{unit}</Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, minWidth: 0, width: '100%' },
  pageHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: spacing.md, paddingTop: spacing.md, paddingBottom: spacing.sm,
  },
  addBtn: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radius.full,
  },
  summaryRow: { flexDirection: 'row', gap: spacing.sm, paddingHorizontal: spacing.md, marginBottom: spacing.lg },
  actCard: { marginBottom: spacing.sm },
  actRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  actIconBox: { width: 52, height: 52, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  catPill: { paddingHorizontal: spacing.md, paddingVertical: 6, borderRadius: radius.full, borderWidth: 1 },
  actGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  actGridCard: {
    alignItems: 'center', padding: spacing.sm, borderRadius: radius.md, borderWidth: 1,
  },
  note: {
    flexDirection: 'row', margin: spacing.md, padding: spacing.md,
    borderRadius: radius.md, borderWidth: 1, gap: spacing.xs,
  },
  modal: { flex: 1 },
  modalHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: spacing.md, paddingVertical: spacing.md, borderBottomWidth: 1,
  },
  actPickerGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  actPickerItem: {
    alignItems: 'center', padding: spacing.sm, borderRadius: radius.md, borderWidth: 1,
  },
  input: {
    borderWidth: 1, borderRadius: radius.md,
    paddingHorizontal: spacing.md, paddingVertical: spacing.sm + 4, ...typography.body,
  },
  durationRow: { flexDirection: 'row', gap: spacing.xs, flexWrap: 'wrap' },
  durChip: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radius.full, borderWidth: 1 },
  durInput: {
    borderWidth: 1, borderRadius: radius.md,
    paddingHorizontal: spacing.sm, paddingVertical: spacing.sm,
    width: 60, ...typography.body, textAlign: 'center',
  },
});
