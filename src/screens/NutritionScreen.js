import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  SafeAreaView, StatusBar, FlatList, Modal, TextInput, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import Card from '../components/Card';
import SectionHeader from '../components/SectionHeader';
import EmptyState from '../components/EmptyState';
import ScreenHeader from '../components/ScreenHeader';
import MacroBar from '../components/MacroBar';
import { typography, spacing, radius } from '../utils/theme';
import { foodDatabase, mealTypes, mealIcons } from '../data/foods';
import { getLast7Keys, getDayLabel, getTodayKey } from '../utils/helpers';

export default function NutritionScreen() {
  const {
    colors, theme, goals, getLogsForDate, calcTotals,
    addFoodLog, removeFoodLog, customFoods, addCustomFood,
    profile,
  } = useApp();

  const [selectedDate, setSelectedDate] = useState(getTodayKey());
  const [activeMealFilter, setActiveMealFilter] = useState('All');
  const [customFoodModal, setCustomFoodModal] = useState(false);
  const [addToMealModal, setAddToMealModal] = useState(false);
  const [addMeal, setAddMeal] = useState('Breakfast');
  const [search, setSearch] = useState('');
  const [selectedFood, setSelectedFood] = useState(null);
  const [qty, setQty] = useState('1');
  const [customForm, setCustomForm] = useState({
    name: '', calories: '', protein: '', carbs: '', fat: '', fiber: '', serving: '100g',
  });

  const last7 = getLast7Keys();
  const dayLogs = getLogsForDate(selectedDate);
  const totals = calcTotals(dayLogs);
  const allFoods = [...foodDatabase, ...customFoods];
  const isToday = selectedDate === getTodayKey();

  const visibleItems = activeMealFilter === 'All'
    ? Object.entries(dayLogs).flatMap(([meal, items]) => items.map(i => ({ ...i, meal })))
    : (dayLogs[activeMealFilter] || []).map(i => ({ ...i, meal: activeMealFilter }));

  const filteredForModal = allFoods.filter(f =>
    f.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleAddCustomFood = () => {
    const { name, calories } = customForm;
    if (!name || !calories) { Alert.alert('Required', 'Name and calories are required.'); return; }
    addCustomFood({
      name,
      category: 'Custom',
      calories: parseFloat(calories) || 0,
      protein: parseFloat(customForm.protein) || 0,
      carbs: parseFloat(customForm.carbs) || 0,
      fat: parseFloat(customForm.fat) || 0,
      fiber: parseFloat(customForm.fiber) || 0,
      serving: customForm.serving || '100g',
    });
    setCustomForm({ name: '', calories: '', protein: '', carbs: '', fat: '', fiber: '', serving: '100g' });
    setCustomFoodModal(false);
  };

  const handleAddToMeal = () => {
    if (!selectedFood) return;
    addFoodLog(addMeal, selectedFood, parseFloat(qty) || 1);
    setAddToMealModal(false);
    setSelectedFood(null);
    setQty('1');
    setSearch('');
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]}>
      <StatusBar barStyle={theme === 'dark' ? 'light-content' : 'dark-content'} backgroundColor={colors.bg} />
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Header */}
        <ScreenHeader title="Nutrition">
          <TouchableOpacity
            style={[styles.iconBtn, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
            onPress={() => setCustomFoodModal(true)}
            accessibilityRole="button"
            accessibilityLabel="Add a custom food"
          >
            <Ionicons name="add-circle-outline" size={22} color={colors.primary} />
          </TouchableOpacity>
        </ScreenHeader>

        {/* Date strip */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dateStrip}>
          {last7.map(date => {
            const isSelected = date === selectedDate;
            const hasFoods = Object.values(getLogsForDate(date)).flat().length > 0;
            const d = new Date(date + 'T12:00:00');
            return (
              <TouchableOpacity
                key={date}
                style={[styles.dateChip, {
                  backgroundColor: isSelected ? colors.primary : colors.card,
                  borderColor: isSelected ? colors.primary : colors.cardBorder,
                }]}
                onPress={() => setSelectedDate(date)}
              >
                <Text style={[typography.micro, { color: isSelected ? colors.textInverse : colors.textMuted }]}>
                  {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][d.getDay()]}
                </Text>
                <Text style={[typography.h3, { color: isSelected ? colors.textInverse : colors.text, marginTop: 2 }]}>
                  {d.getDate()}
                </Text>
                {hasFoods && <View style={[styles.dateDot, { backgroundColor: isSelected ? colors.textInverse : colors.primary }]} />}
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Daily macro summary */}
        <Card style={styles.summaryCard} elevated>
          <Text style={[typography.bodySmMed, { color: colors.textSecondary, marginBottom: spacing.md }]}>
            {getDayLabel(selectedDate)} · {Math.round(totals.calories)} / {goals.calories} kcal
          </Text>
          <MacroBar label="Protein" value={totals.protein} goal={goals.protein} color={colors.protein} />
          <MacroBar label="Carbohydrates" value={totals.carbs} goal={goals.carbs} color={colors.carbs} />
          <MacroBar label="Fat" value={totals.fat} goal={goals.fat} color={colors.fat} />
          <MacroBar label="Fiber" value={totals.fiber} goal={goals.fiber} color={colors.fiber} />
        </Card>

        {/* Meal filter pills */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
          {['All', ...mealTypes].map(f => (
            <TouchableOpacity
              key={f}
              style={[styles.filterChip, {
                backgroundColor: activeMealFilter === f ? colors.primary : colors.card,
                borderColor: activeMealFilter === f ? colors.primary : colors.cardBorder,
              }]}
              onPress={() => setActiveMealFilter(f)}
            >
              {f !== 'All' && <Text style={{ marginRight: 4 }}>{mealIcons[f]}</Text>}
              <Text style={[typography.bodySmMed, { color: activeMealFilter === f ? colors.textInverse : colors.textSecondary }]}>
                {f}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Add food button */}
        <View style={styles.logList}>
          {isToday && (
            <TouchableOpacity
              style={[styles.addFoodGlobalBtn, { backgroundColor: colors.primaryMuted, borderColor: colors.primary + '40' }]}
              onPress={() => {
                setAddMeal(activeMealFilter === 'All' ? 'Breakfast' : activeMealFilter);
                setSearch('');
                setSelectedFood(null);
                setQty('1');
                setAddToMealModal(true);
              }}
            >
              <Ionicons name="add" size={18} color={colors.primary} />
              <Text style={[typography.bodyMed, { color: colors.primary, marginLeft: 6 }]}>Add Food</Text>
            </TouchableOpacity>
          )}

          {visibleItems.length === 0 ? (
            <EmptyState icon="restaurant-outline" title="No food logged" subtitle={isToday ? "Start tracking your meals today" : "Nothing was logged on this day"} />
          ) : (
            visibleItems.map(item => (
              <Card key={item.logId} style={styles.logItem} elevated>
                <View style={styles.logItemRow}>
                  <Text style={{ fontSize: 22, marginRight: spacing.sm }}>{mealIcons[item.meal]}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={[typography.bodyMed, { color: colors.text }]}>{item.name}</Text>
                    <Text style={[typography.caption, { color: colors.textMuted }]}>
                      {item.meal} · {item.serving} × {item.quantity}
                    </Text>
                    <View style={styles.macroChips}>
                      <MacroChip label={`P ${Math.round(item.protein * item.quantity)}g`} color={colors.protein} />
                      <MacroChip label={`C ${Math.round(item.carbs * item.quantity)}g`} color={colors.carbs} />
                      <MacroChip label={`F ${Math.round(item.fat * item.quantity)}g`} color={colors.fat} />
                    </View>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={[typography.h3, { color: colors.primaryLight }]}>
                      {Math.round(item.calories * item.quantity)}
                    </Text>
                    <Text style={[typography.micro, { color: colors.textMuted }]}>kcal</Text>
                    {isToday && (
                      <TouchableOpacity
                        onPress={() => removeFoodLog(item.meal, item.logId)}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        style={{ marginTop: 6 }}
                      >
                        <Ionicons name="trash-outline" size={14} color={colors.textMuted} />
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              </Card>
            ))
          )}
        </View>

        {/* Recent foods */}
        {(profile.recentFoods?.length > 0) && (
          <View style={{ paddingHorizontal: spacing.md, marginBottom: spacing.xl }}>
            <SectionHeader title="Recent Foods" />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: spacing.sm }}>
              {profile.recentFoods.slice(0, 8).map(food => (
                <TouchableOpacity
                  key={food.id}
                  style={[styles.recentChip, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
                  onPress={() => {
                    setSelectedFood(food);
                    setAddMeal('Breakfast');
                    setQty('1');
                    setSearch('');
                    setAddToMealModal(true);
                  }}
                >
                  <Text style={[typography.bodySmMed, { color: colors.text }]}>{food.name}</Text>
                  <Text style={[typography.caption, { color: colors.primary }]}>{food.calories} kcal</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* ── Add to meal modal ── */}
      <Modal visible={addToMealModal} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={[styles.modal, { backgroundColor: colors.bg }]}>
          <View style={[styles.modalHeader, { borderBottomColor: colors.cardBorder }]}>
            <TouchableOpacity onPress={() => { setAddToMealModal(false); setSelectedFood(null); }}>
              <Text style={[typography.bodyMed, { color: colors.textSecondary }]}>Cancel</Text>
            </TouchableOpacity>
            <Text style={[typography.h3, { color: colors.text }]}>Add Food</Text>
            <TouchableOpacity onPress={handleAddToMeal} disabled={!selectedFood}>
              <Text style={[typography.bodyMed, { color: selectedFood ? colors.primary : colors.textMuted }]}>Add</Text>
            </TouchableOpacity>
          </View>

          {/* Meal selector */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.mealSelector}>
            {mealTypes.map(m => (
              <TouchableOpacity
                key={m}
                style={[styles.mealChip, {
                  backgroundColor: addMeal === m ? colors.primary : colors.card,
                  borderColor: addMeal === m ? colors.primary : colors.cardBorder,
                }]}
                onPress={() => setAddMeal(m)}
              >
                <Text>{mealIcons[m]}</Text>
                <Text style={[typography.bodySmMed, { color: addMeal === m ? colors.textInverse : colors.textSecondary, marginLeft: 4 }]}>{m}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Search */}
          <View style={[styles.searchRow, { backgroundColor: colors.card, borderColor: colors.cardBorder, margin: spacing.md }]}>
            <Ionicons name="search" size={16} color={colors.textMuted} style={{ marginRight: 8 }} />
            <TextInput
              style={[{ flex: 1, ...typography.body, color: colors.text, padding: 0 }]}
              placeholder="Search foods..."
              placeholderTextColor={colors.textMuted}
              value={search}
              onChangeText={setSearch}
            />
          </View>

          {/* Selected food mini card */}
          {selectedFood && (
            <View style={[styles.selectedMini, { backgroundColor: colors.primarySurface, borderColor: colors.primary + '40' }]}>
              <Text style={[typography.h4, { color: colors.primaryLight }]}>{selectedFood.name}</Text>
              <View style={styles.qtyRow}>
                <TouchableOpacity
                  style={[styles.qtyBtn, { backgroundColor: colors.primary }]}
                  onPress={() => setQty(q => String(Math.max(0.5, parseFloat(q) - 0.5)))}
                >
                  <Ionicons name="remove" size={14} color={colors.textInverse} />
                </TouchableOpacity>
                <TextInput
                  style={[styles.qtyInput, { color: colors.text, borderBottomColor: colors.primary }]}
                  value={qty} onChangeText={setQty} keyboardType="decimal-pad" selectTextOnFocus
                />
                <TouchableOpacity
                  style={[styles.qtyBtn, { backgroundColor: colors.primary }]}
                  onPress={() => setQty(q => String(parseFloat(q) + 0.5))}
                >
                  <Ionicons name="add" size={14} color={colors.textInverse} />
                </TouchableOpacity>
                <Text style={[typography.bodySm, { color: colors.textMuted, marginLeft: spacing.sm }]}>× serving</Text>
              </View>
            </View>
          )}

          <FlatList
            data={filteredForModal}
            keyExtractor={i => i.id}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.foodRow, {
                  backgroundColor: selectedFood?.id === item.id ? colors.primarySurface : 'transparent',
                  borderBottomColor: colors.cardBorder,
                }]}
                onPress={() => setSelectedFood(item)}
              >
                <View style={{ flex: 1 }}>
                  <Text style={[typography.bodyMed, { color: colors.text }]}>{item.name}</Text>
                  <Text style={[typography.caption, { color: colors.textMuted }]}>{item.serving} · {item.category}</Text>
                </View>
                <Text style={[typography.bodySmMed, { color: colors.primary }]}>{item.calories} kcal</Text>
              </TouchableOpacity>
            )}
            ListEmptyComponent={<EmptyState icon="search-outline" title="No foods found" />}
          />
        </SafeAreaView>
      </Modal>

      {/* ── Custom food modal ── */}
      <Modal visible={customFoodModal} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={[styles.modal, { backgroundColor: colors.bg }]}>
          <View style={[styles.modalHeader, { borderBottomColor: colors.cardBorder }]}>
            <TouchableOpacity onPress={() => setCustomFoodModal(false)}>
              <Text style={[typography.bodyMed, { color: colors.textSecondary }]}>Cancel</Text>
            </TouchableOpacity>
            <Text style={[typography.h3, { color: colors.text }]}>Create Food</Text>
            <TouchableOpacity onPress={handleAddCustomFood}>
              <Text style={[typography.bodyMed, { color: colors.primary }]}>Save</Text>
            </TouchableOpacity>
          </View>
          <ScrollView contentContainerStyle={{ padding: spacing.md, gap: spacing.md }}>
            {[
              { key: 'name', label: 'Food Name *', placeholder: 'e.g. My Smoothie', kb: 'default' },
              { key: 'serving', label: 'Serving Size', placeholder: 'e.g. 1 cup (250g)', kb: 'default' },
              { key: 'calories', label: 'Calories (kcal) *', placeholder: '0', kb: 'numeric' },
              { key: 'protein', label: 'Protein (g)', placeholder: '0', kb: 'numeric' },
              { key: 'carbs', label: 'Carbs (g)', placeholder: '0', kb: 'numeric' },
              { key: 'fat', label: 'Fat (g)', placeholder: '0', kb: 'numeric' },
              { key: 'fiber', label: 'Fiber (g)', placeholder: '0', kb: 'numeric' },
            ].map(field => (
              <View key={field.key}>
                <Text style={[typography.bodySmMed, { color: colors.textSecondary, marginBottom: spacing.xs }]}>{field.label}</Text>
                <TextInput
                  style={[styles.formInput, { color: colors.text, backgroundColor: colors.card, borderColor: colors.cardBorder }]}
                  placeholder={field.placeholder}
                  placeholderTextColor={colors.textMuted}
                  value={customForm[field.key]}
                  onChangeText={v => setCustomForm(f => ({ ...f, [field.key]: v }))}
                  keyboardType={field.kb}
                />
              </View>
            ))}
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

function MacroChip({ label, color }) {
  return (
    <View style={{ backgroundColor: color + '18', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, marginRight: 4 }}>
      <Text style={[typography.micro, { color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, minWidth: 0, width: '100%' },
  pageHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: spacing.md, paddingTop: spacing.md, paddingBottom: spacing.sm,
  },
  iconBtn: { padding: spacing.sm, borderRadius: radius.md, borderWidth: 1 },
  dateStrip: { paddingHorizontal: spacing.md, paddingBottom: spacing.md, gap: spacing.sm },
  dateChip: {
    alignItems: 'center', paddingVertical: spacing.sm, paddingHorizontal: spacing.md,
    borderRadius: radius.lg, minWidth: 52, borderWidth: 1,
  },
  dateDot: { width: 5, height: 5, borderRadius: 3, marginTop: 4 },
  summaryCard: { marginHorizontal: spacing.md, marginBottom: spacing.md },
  filterRow: { paddingHorizontal: spacing.md, paddingBottom: spacing.md, gap: spacing.xs },
  filterChip: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radius.full, borderWidth: 1,
  },
  logList: { paddingHorizontal: spacing.md },
  addFoodGlobalBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    padding: spacing.md, borderRadius: radius.lg, borderWidth: 1, marginBottom: spacing.sm,
  },
  logItem: { marginBottom: spacing.sm },
  logItemRow: { flexDirection: 'row', alignItems: 'center' },
  macroChips: { flexDirection: 'row', marginTop: 4 },
  recentChip: { padding: spacing.sm, borderRadius: radius.md, borderWidth: 1, minWidth: 100, gap: 2 },
  modal: { flex: 1 },
  modalHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: spacing.md, paddingVertical: spacing.md, borderBottomWidth: 1,
  },
  mealSelector: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, gap: spacing.sm },
  mealChip: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radius.full, borderWidth: 1,
  },
  searchRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: spacing.md, paddingVertical: spacing.sm + 2,
    borderRadius: radius.md, borderWidth: 1,
  },
  selectedMini: {
    marginHorizontal: spacing.md, marginBottom: spacing.sm,
    padding: spacing.md, borderRadius: radius.lg, borderWidth: 1,
  },
  qtyRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing.sm },
  qtyBtn: { width: 30, height: 30, borderRadius: radius.full, alignItems: 'center', justifyContent: 'center' },
  qtyInput: { width: 44, textAlign: 'center', ...typography.h4, borderBottomWidth: 2, paddingBottom: 2 },
  foodRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: spacing.md, paddingVertical: spacing.md, borderBottomWidth: 1,
  },
  formInput: {
    borderWidth: 1, borderRadius: radius.md,
    paddingHorizontal: spacing.md, paddingVertical: spacing.sm + 4, ...typography.body,
  },
});
