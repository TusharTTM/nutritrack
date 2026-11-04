import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  SafeAreaView, StatusBar, useWindowDimensions, Alert, TextInput, Modal,
} from 'react-native';
import { LineChart, BarChart } from 'react-native-chart-kit';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import Card from '../components/Card';
import SectionHeader from '../components/SectionHeader';
import EmptyState from '../components/EmptyState';
import CommunityReports from '../components/CommunityReports';
import ScreenHeader from '../components/ScreenHeader';
import { typography, spacing, radius } from '../utils/theme';
import { mlToDisplay } from '../utils/helpers';

const TABS = ['Calories', 'Macros', 'Weight', 'Water'];
const RANGES = ['7 days', '30 days'];

export default function ProgressScreen() {
  const { colors, theme, getDateRangeTotals, goals, weight, addWeightEntry } = useApp();
  const { width } = useWindowDimensions();
  const chartW = Math.max(240, width - spacing.md * 2 - 32);
  const [activeTab, setActiveTab] = useState('Calories');
  const [range, setRange] = useState('7 days');
  const [weightModal, setWeightModal] = useState(false);
  const [newWeight, setNewWeight] = useState('');
  const [activeView, setActiveView] = useState('self');

  const days = range === '7 days' ? 7 : 30;
  const data = getDateRangeTotals(days);
  const last7 = data.slice(-7);

  const dayLabels = data.map((d, i) => {
    if (days <= 7) {
      const date = new Date(d.date + 'T12:00:00');
      return date.toLocaleDateString(undefined, { weekday: 'short' }).slice(0, 2);
    }
    // for 30D show every 5th label
    if (i % 5 === 0) {
      const dt = new Date(d.date + 'T12:00:00');
      return `${dt.getMonth()+1}/${dt.getDate()}`;
    }
    return '';
  });

  const calData = data.map(d => Math.round(d.calories) || 0);
  const protData = data.map(d => Math.round(d.protein) || 0);
  const carbData = data.map(d => Math.round(d.carbs) || 0);
  const fatData = data.map(d => Math.round(d.fat) || 0);
  const waterData = data.map(d => Math.round(d.water) || 0);

  const avgCal = calData.length ? Math.round(calData.reduce((a,b)=>a+b,0)/calData.filter(v=>v>0).length||1) : 0;
  const todayD = data[data.length - 1] || {};

  const chartConfig = {
    backgroundGradientFrom: colors.card,
    backgroundGradientTo: colors.card,
    color: () => colors.primary,
    labelColor: () => colors.textMuted,
    strokeWidth: 2,
    barPercentage: days <= 7 ? 0.65 : 0.4,
    decimalPlaces: 0,
    propsForDots: { r: '4', strokeWidth: '2', stroke: colors.primary },
  };

  const handleLogWeight = () => {
    const v = parseFloat(newWeight);
    if (!v || v < 20 || v > 500) { Alert.alert('Invalid', 'Please enter a valid weight.'); return; }
    addWeightEntry(v);
    setNewWeight('');
    setWeightModal(false);
  };

  const statCards = [
    { label: 'Avg Calories', value: avgCal, unit: 'kcal', color: colors.primaryLight, icon: 'flame' },
    { label: "Today's Protein", value: Math.round(todayD.protein||0), unit: 'g', color: colors.protein, icon: 'barbell' },
    { label: "Today's Carbs", value: Math.round(todayD.carbs||0), unit: 'g', color: colors.carbs, icon: 'leaf' },
    { label: "Today's Fat", value: Math.round(todayD.fat||0), unit: 'g', color: colors.fat, icon: 'water' },
  ];

  const weightEntries = weight.slice(-Math.max(days, 14));
  const weightLabels = weightEntries.map((w, i) => {
    if (weightEntries.length <= 7 || i % Math.ceil(weightEntries.length/7) === 0) {
      const d = new Date(w.date + 'T12:00:00');
      return `${d.getMonth()+1}/${d.getDate()}`;
    }
    return '';
  });
  const weightVals = weightEntries.map(w => w.value);
  const latestW = weight.length ? weight[weight.length-1].value : null;
  const firstW = weight.length >= 2 ? weight[0].value : null;
  const weightChange = latestW && firstW ? (latestW - firstW).toFixed(1) : null;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]}>
      <StatusBar barStyle={theme === 'dark' ? 'light-content' : 'dark-content'} backgroundColor={colors.bg} />
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <ScreenHeader title={activeView === 'self' ? 'Progress' : 'Community'}>
          {activeView === 'self' && (
            <View style={[styles.rangeToggle, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
              {RANGES.map(r => (
                <TouchableOpacity
                  key={r}
                  style={[styles.rangeBtn, range === r && { backgroundColor: colors.primary }]}
                  onPress={() => setRange(r)}
                >
                  <Text style={[typography.micro, { color: range === r ? colors.textInverse : colors.textSecondary }]}>{r}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </ScreenHeader>

        <View style={[styles.viewToggle, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          {[
            { key: 'self', label: 'Self' },
            { key: 'community', label: 'Community' },
          ].map(view => (
            <TouchableOpacity
              key={view.key}
              style={[styles.viewButton, activeView === view.key && { backgroundColor: colors.primary }]}
              onPress={() => setActiveView(view.key)}
              accessibilityRole="button"
              accessibilityState={{ selected: activeView === view.key }}
            >
              <Text style={[typography.bodySmMed, { color: activeView === view.key ? colors.textInverse : colors.textSecondary }]}>
                {view.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {activeView === 'self' ? (
          <>
        {/* Stat chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.statRow}>
          {statCards.map((s, i) => (
            <Card key={i} style={[styles.statCard, { borderLeftColor: s.color, borderLeftWidth: 3 }]} elevated>
              <Ionicons name={s.icon} size={20} color={s.color} style={{ marginBottom: 4 }} />
              <Text style={[typography.h2, { color: s.color }]}>{s.value}</Text>
              <Text style={[typography.micro, { color: colors.textMuted }]}>{s.unit}</Text>
              <Text style={[typography.caption, { color: colors.textSecondary, marginTop: 2 }]}>{s.label}</Text>
            </Card>
          ))}
        </ScrollView>

        {/* Tabs */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsRow}>
          {TABS.map(tab => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, {
                backgroundColor: activeTab === tab ? colors.primary : colors.card,
                borderColor: activeTab === tab ? colors.primary : colors.cardBorder,
              }]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[typography.bodySmMed, { color: activeTab === tab ? colors.textInverse : colors.textSecondary }]}>{tab}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Chart card */}
        <Card style={styles.chartCard} elevated>
          {activeTab === 'Calories' && (
            <>
              <View style={styles.chartHeader}>
                <Text style={[typography.h3, { color: colors.text }]}>Calorie Intake</Text>
                <View style={[styles.goalPill, { backgroundColor: colors.error + '20' }]}>
                  <Text style={[typography.micro, { color: colors.error }]}>Goal {goals.calories}</Text>
                </View>
              </View>
              <BarChart
                data={{ labels: dayLabels, datasets: [{ data: calData.map(v => v||0.01) }] }}
                width={chartW} height={200}
                chartConfig={chartConfig}
                style={styles.chart} fromZero showValuesOnTopOfBars={days <= 7}
              />
            </>
          )}

          {activeTab === 'Macros' && (
            <>
              <Text style={[typography.h3, { color: colors.text, marginBottom: spacing.sm }]}>Macronutrient Trends</Text>
              <View style={styles.legendRow}>
                {[{l:'Protein',c:colors.protein},{l:'Carbs',c:colors.carbs},{l:'Fat',c:colors.fat}].map(i=>(
                  <View key={i.l} style={styles.legendItem}>
                    <View style={[styles.legendDot,{backgroundColor:i.c}]}/>
                    <Text style={[typography.caption,{color:colors.textSecondary}]}>{i.l}</Text>
                  </View>
                ))}
              </View>
              <LineChart
                data={{
                  labels: dayLabels,
                  datasets: [
                    { data: protData, color: () => colors.protein, strokeWidth: 2 },
                    { data: carbData, color: () => colors.carbs, strokeWidth: 2 },
                    { data: fatData, color: () => colors.fat, strokeWidth: 2 },
                  ],
                }}
                width={chartW} height={200}
                chartConfig={chartConfig}
                style={styles.chart} withDots bezier
              />
            </>
          )}

          {activeTab === 'Weight' && (
            <>
              <View style={styles.chartHeader}>
                <Text style={[typography.h3, { color: colors.text }]}>Weight History</Text>
                <TouchableOpacity
                  style={[styles.addWeightBtn, { backgroundColor: colors.primaryMuted, borderColor: colors.primary + '40' }]}
                  onPress={() => setWeightModal(true)}
                >
                  <Ionicons name="add" size={14} color={colors.primary} />
                  <Text style={[typography.micro, { color: colors.primary, marginLeft: 3 }]}>LOG</Text>
                </TouchableOpacity>
              </View>
              {latestW && (
                <View style={styles.weightStats}>
                  <View style={styles.weightStat}>
                    <Text style={[typography.h2, { color: colors.primaryLight }]}>{latestW} kg</Text>
                    <Text style={[typography.micro, { color: colors.textMuted }]}>Current</Text>
                  </View>
                  {weightChange !== null && (
                    <View style={styles.weightStat}>
                      <Text style={[typography.h2, {
                        color: parseFloat(weightChange) > 0 ? colors.error : parseFloat(weightChange) < 0 ? colors.success : colors.textSecondary
                      }]}>
                        {parseFloat(weightChange) > 0 ? '+' : ''}{weightChange} kg
                      </Text>
                      <Text style={[typography.micro, { color: colors.textMuted }]}>Total change</Text>
                    </View>
                  )}
                </View>
              )}
              {weightVals.length >= 2 ? (
                <LineChart
                  data={{ labels: weightLabels, datasets: [{ data: weightVals }] }}
                  width={chartW} height={180}
                  chartConfig={{ ...chartConfig, color: () => colors.fiber }}
                  style={styles.chart} bezier withDots
                />
              ) : (
                <EmptyState icon="scale-outline" title="No weight data" subtitle="Log your weight to see trends" action="Log Weight" onAction={() => setWeightModal(true)} />
              )}
            </>
          )}

          {activeTab === 'Water' && (
            <>
              <Text style={[typography.h3, { color: colors.text, marginBottom: spacing.sm }]}>Hydration</Text>
              <BarChart
                data={{ labels: dayLabels, datasets: [{ data: waterData.map(v => v||0.01) }] }}
                width={chartW} height={200}
                chartConfig={{ ...chartConfig, color: () => colors.water }}
                style={styles.chart} fromZero showValuesOnTopOfBars={days <= 7}
              />
              <View style={[styles.goalPill, { backgroundColor: colors.water + '20', alignSelf: 'flex-start', marginTop: spacing.sm }]}>
                <Text style={[typography.micro, { color: colors.water }]}>Daily goal {mlToDisplay(goals.water)}</Text>
              </View>
            </>
          )}
        </Card>

        {/* Weekly summary */}
        <Card style={styles.weekCard} elevated>
          <SectionHeader title="Weekly Summary" />
          {last7.map((day, i) => {
            const calPct = Math.min((day.calories / goals.calories) * 100, 100);
            const isToday = i === last7.length - 1;
            return (
              <View key={day.date} style={styles.summaryRow}>
                <Text style={[typography.bodySmMed, { color: isToday ? colors.primary : colors.textSecondary, width: 38 }]}>
                  {new Date(day.date + 'T12:00:00').toLocaleDateString(undefined, { weekday: 'short' })}
                </Text>
                <View style={[styles.summaryTrack, { backgroundColor: colors.cardBorder }]}>
                  <View style={[styles.summaryFill, {
                    width: `${calPct}%`,
                    backgroundColor: calPct >= 85 ? colors.primary : calPct > 0 ? colors.warning : colors.cardBorder,
                  }]} />
                </View>
                <Text style={[typography.caption, { color: colors.textMuted, width: 48, textAlign: 'right' }]}>
                  {Math.round(day.calories)} kcal
                </Text>
              </View>
            );
          })}
        </Card>
          </>
        ) : (
          <CommunityReports />
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Log weight modal */}
      <Modal visible={weightModal} transparent animationType="fade">
        <View style={styles.overlay}>
          <View style={[styles.weightDialog, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <Text style={[typography.h3, { color: colors.text, marginBottom: spacing.md }]}>Log Weight</Text>
            <TextInput
              style={[styles.weightInput, { color: colors.text, borderColor: colors.cardBorder, backgroundColor: colors.cardElevated }]}
              placeholder="Weight in kg"
              placeholderTextColor={colors.textMuted}
              value={newWeight}
              onChangeText={setNewWeight}
              keyboardType="decimal-pad"
            />
            <View style={styles.dialogBtns}>
              <TouchableOpacity style={[styles.dialogBtn, { backgroundColor: colors.cardElevated }]} onPress={() => setWeightModal(false)}>
                <Text style={[typography.bodyMed, { color: colors.textSecondary }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.dialogBtn, { backgroundColor: colors.primary }]} onPress={handleLogWeight}>
                <Text style={[typography.bodyMed, { color: colors.textInverse }]}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, minWidth: 0, width: '100%' },
  viewToggle: {
    flexDirection: 'row',
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    padding: 4,
    borderRadius: radius.full,
    borderWidth: 1,
    minWidth: 0,
  },
  viewButton: {
    flex: 1,
    minWidth: 0,
    paddingVertical: spacing.sm + 2,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pageHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: spacing.md, paddingTop: spacing.md, paddingBottom: spacing.sm,
  },
  rangeToggle: {
    flexDirection: 'row', borderRadius: radius.full, borderWidth: 1,
    overflow: 'hidden', padding: 2,
  },
  rangeBtn: {
    paddingHorizontal: spacing.md, paddingVertical: 5, borderRadius: radius.full,
  },
  statRow: { paddingHorizontal: spacing.md, paddingBottom: spacing.md, gap: spacing.sm },
  statCard: { minWidth: 120 },
  tabsRow: { paddingHorizontal: spacing.md, paddingBottom: spacing.md, gap: spacing.sm },
  tab: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radius.full, borderWidth: 1 },
  chartCard: { marginHorizontal: spacing.md, marginBottom: spacing.md },
  chartHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  goalPill: { paddingHorizontal: spacing.sm, paddingVertical: 4, borderRadius: radius.full },
  chart: { borderRadius: radius.sm, marginLeft: -spacing.sm },
  legendRow: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.sm },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  addWeightBtn: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.sm,
    paddingVertical: 5, borderRadius: radius.full, borderWidth: 1,
  },
  weightStats: { flexDirection: 'row', gap: spacing.xl, marginBottom: spacing.md },
  weightStat: { alignItems: 'flex-start' },
  weekCard: { marginHorizontal: spacing.md, marginBottom: spacing.md },
  summaryRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm },
  summaryTrack: { flex: 1, height: 8, borderRadius: radius.full, overflow: 'hidden' },
  summaryFill: { height: 8, borderRadius: radius.full },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', alignItems: 'center', justifyContent: 'center' },
  weightDialog: {
    width: '80%', padding: spacing.lg, borderRadius: radius.xl, borderWidth: 1,
  },
  weightInput: {
    borderWidth: 1, borderRadius: radius.md,
    paddingHorizontal: spacing.md, paddingVertical: spacing.sm + 4,
    ...typography.h3, marginBottom: spacing.md,
  },
  dialogBtns: { flexDirection: 'row', gap: spacing.sm },
  dialogBtn: {
    flex: 1, paddingVertical: spacing.sm + 4, borderRadius: radius.md, alignItems: 'center',
  },
});



