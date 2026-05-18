import React, { useState } from 'react';
import { Alert, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';

import { AppText } from '../components/AppText';
import { Card } from '../components/Card';
import { PrimaryButton } from '../components/PrimaryButton';
import { ProgressBar } from '../components/ProgressBar';
import { Screen } from '../components/Screen';
import { SectionHeader } from '../components/SectionHeader';
import { DebtType } from '../models/finance';
import { PlanningStackParamList } from '../navigation/types';
import { useFinance } from '../store/FinanceStore';
import { useAppTheme } from '../theme/AppThemeProvider';
import { formatCurrency } from '../utils/currency';

type Navigation = NativeStackNavigationProp<PlanningStackParamList, 'PlanningHome'>;

function parseAmount(value: string) {
  return Number(value.replace(/,/g, '.'));
}

export function PlanningScreen() {
  const navigation = useNavigation<Navigation>();
  const {
    state,
    addDebt,
    toggleDebtPaid,
    deleteDebt,
    addSavingsGoal,
    updateSavingsGoal,
    deleteSavingsGoal,
  } = useFinance();
  const { colors } = useAppTheme();
  const [goalName, setGoalName] = useState('');
  const [goalTarget, setGoalTarget] = useState('');
  const [goalCurrent, setGoalCurrent] = useState('');
  const [goalAdjustments, setGoalAdjustments] = useState<Record<string, string>>({});
  const [debtType, setDebtType] = useState<DebtType>('lent');
  const [debtName, setDebtName] = useState('');
  const [debtPerson, setDebtPerson] = useState('');
  const [debtAmount, setDebtAmount] = useState('');

  function addGoal() {
    const target = parseAmount(goalTarget);
    const current = parseAmount(goalCurrent || '0');

    if (!goalName.trim() || !Number.isFinite(target) || target <= 0 || !Number.isFinite(current)) {
      Alert.alert('Invalid goal', 'Enter a goal name and valid target amount.');
      return;
    }

    addSavingsGoal({
      name: goalName.trim(),
      targetAmount: target,
      currentAmount: current,
      currency: 'VND',
      color: colors.primary,
    });
    setGoalName('');
    setGoalTarget('');
    setGoalCurrent('');
  }

  function addDebtItem() {
    const amount = parseAmount(debtAmount);

    if (!debtName.trim() || !debtPerson.trim() || !Number.isFinite(amount) || amount <= 0) {
      Alert.alert('Invalid debt', 'Enter name, person, and amount.');
      return;
    }

    addDebt({
      type: debtType,
      name: debtName.trim(),
      person: debtPerson.trim(),
      amount,
      currency: 'VND',
    });
    setDebtName('');
    setDebtPerson('');
    setDebtAmount('');
  }

  function adjustGoal(goalId: string, direction: 1 | -1) {
    const goal = state.savingsGoals.find((item) => item.id === goalId);
    const amount = parseAmount(goalAdjustments[goalId] ?? '');

    if (!goal || !Number.isFinite(amount) || amount <= 0) {
      Alert.alert('Invalid amount', 'Enter an amount to add or remove.');
      return;
    }

    updateSavingsGoal(goal.id, {
      currentAmount: Math.max(goal.currentAmount + amount * direction, 0),
    });
    setGoalAdjustments((current) => ({ ...current, [goalId]: '' }));
  }

  return (
    <Screen>
      <View>
        <AppText variant="caption">Planning</AppText>
        <AppText variant="title">Future money</AppText>
      </View>

      <View style={styles.shortcutRow}>
        <Pressable style={[styles.shortcut, { borderColor: colors.border, backgroundColor: colors.surface }]} onPress={() => navigation.navigate('Budgets')}>
          <Ionicons name="pie-chart-outline" size={20} color={colors.primary} />
          <AppText style={styles.shortcutText}>Budgets</AppText>
        </Pressable>
        <Pressable style={[styles.shortcut, { borderColor: colors.border, backgroundColor: colors.surface }]} onPress={() => navigation.navigate('Reports')}>
          <Ionicons name="bar-chart-outline" size={20} color={colors.primary} />
          <AppText style={styles.shortcutText}>Reports</AppText>
        </Pressable>
        <Pressable style={[styles.shortcut, { borderColor: colors.border, backgroundColor: colors.surface }]} onPress={() => navigation.navigate('Calendar')}>
          <Ionicons name="calendar-outline" size={20} color={colors.primary} />
          <AppText style={styles.shortcutText}>Calendar</AppText>
        </Pressable>
      </View>

      <SectionHeader title="Savings goals" />
      <Card style={styles.card}>
        <View style={styles.formHeader}>
          <Ionicons name="flag-outline" size={20} color={colors.primary} />
          <AppText style={styles.itemTitle}>New goal</AppText>
        </View>
        <TextInput placeholder="Goal name" placeholderTextColor={colors.muted} value={goalName} onChangeText={setGoalName} style={[styles.input, { borderColor: colors.border, color: colors.text }]} />
        <View style={styles.inputRow}>
          <TextInput placeholder="Target" placeholderTextColor={colors.muted} value={goalTarget} onChangeText={setGoalTarget} keyboardType="decimal-pad" style={[styles.input, styles.flex, { borderColor: colors.border, color: colors.text }]} />
          <TextInput placeholder="Current" placeholderTextColor={colors.muted} value={goalCurrent} onChangeText={setGoalCurrent} keyboardType="decimal-pad" style={[styles.input, styles.flex, { borderColor: colors.border, color: colors.text }]} />
        </View>
        <PrimaryButton label="Add goal" icon="flag-outline" onPress={addGoal} />
        {state.savingsGoals.map((goal) => {
          const percent = goal.targetAmount <= 0 ? 0 : goal.currentAmount / goal.targetAmount;
          const remaining = Math.max(goal.targetAmount - goal.currentAmount, 0);
          return (
            <View key={goal.id} style={[styles.goalItem, { borderColor: colors.border }]}>
              <View style={styles.goalTop}>
                <View style={[styles.goalIcon, { backgroundColor: `${goal.color}20` }]}>
                  <Ionicons name="flag" size={18} color={goal.color} />
                </View>
                <View style={styles.flex}>
                  <AppText style={styles.itemTitle}>{goal.name}</AppText>
                  <AppText variant="caption">{Math.round(Math.min(percent, 1) * 100)}% complete</AppText>
                </View>
                <Pressable style={styles.iconTap} onPress={() => deleteSavingsGoal(goal.id)}>
                  <Ionicons name="trash-outline" size={19} color={colors.danger} />
                </Pressable>
              </View>
              <ProgressBar percent={percent} color={goal.color} />
              <View style={styles.goalStats}>
                <View>
                  <AppText variant="caption">Saved</AppText>
                  <AppText style={styles.itemTitle}>{formatCurrency(goal.currentAmount, goal.currency)}</AppText>
                </View>
                <View style={styles.goalStatRight}>
                  <AppText variant="caption">Remaining</AppText>
                  <AppText style={styles.itemTitle}>{formatCurrency(remaining, goal.currency)}</AppText>
                </View>
              </View>
              <View style={styles.quickActions}>
                <TextInput
                  placeholder="Amount"
                  placeholderTextColor={colors.muted}
                  value={goalAdjustments[goal.id] ?? ''}
                  onChangeText={(value) => setGoalAdjustments((current) => ({ ...current, [goal.id]: value }))}
                  keyboardType="decimal-pad"
                  style={[styles.adjustInput, { borderColor: colors.border, color: colors.text }]}
                />
                <Pressable style={[styles.adjustButton, { backgroundColor: colors.primary }]} onPress={() => adjustGoal(goal.id, 1)}>
                  <Ionicons name="add" size={18} color="#FFFFFF" />
                  <AppText color="#FFFFFF" style={styles.adjustText}>Add</AppText>
                </Pressable>
                <Pressable style={[styles.adjustButton, { backgroundColor: colors.danger }]} onPress={() => adjustGoal(goal.id, -1)}>
                  <Ionicons name="remove" size={18} color="#FFFFFF" />
                  <AppText color="#FFFFFF" style={styles.adjustText}>Remove</AppText>
                </Pressable>
              </View>
            </View>
          );
        })}
      </Card>

      <SectionHeader title="Debts and loans" />
      <Card style={styles.card}>
        <View style={styles.segment}>
          {(['lent', 'borrowed'] as DebtType[]).map((item) => {
            const selected = debtType === item;
            return (
              <Pressable key={item} style={[styles.segmentItem, { borderColor: colors.border, backgroundColor: selected ? colors.primary : colors.surface }]} onPress={() => setDebtType(item)}>
                <AppText color={selected ? '#FFFFFF' : colors.text} style={styles.segmentText}>{item === 'lent' ? 'Lent' : 'Borrowed'}</AppText>
              </Pressable>
            );
          })}
        </View>
        <TextInput placeholder="Label" placeholderTextColor={colors.muted} value={debtName} onChangeText={setDebtName} style={[styles.input, { borderColor: colors.border, color: colors.text }]} />
        <View style={styles.inputRow}>
          <TextInput placeholder="Person" placeholderTextColor={colors.muted} value={debtPerson} onChangeText={setDebtPerson} style={[styles.input, styles.flex, { borderColor: colors.border, color: colors.text }]} />
          <TextInput placeholder="Amount" placeholderTextColor={colors.muted} value={debtAmount} onChangeText={setDebtAmount} keyboardType="decimal-pad" style={[styles.input, styles.flex, { borderColor: colors.border, color: colors.text }]} />
        </View>
        <PrimaryButton label="Add debt" icon="person-add-outline" onPress={addDebtItem} />
        {state.debts.map((debt) => (
          <View key={debt.id} style={[styles.debtCard, { borderColor: debt.isPaid ? colors.border : debt.type === 'lent' ? colors.primary : colors.warning }]}>
            <View style={styles.goalTop}>
              <View style={[styles.goalIcon, { backgroundColor: debt.type === 'lent' ? colors.primarySoft : `${colors.warning}20` }]}>
                <Ionicons name={debt.type === 'lent' ? 'arrow-up-outline' : 'arrow-down-outline'} size={18} color={debt.type === 'lent' ? colors.primary : colors.warning} />
              </View>
              <Pressable style={styles.flex} onPress={() => toggleDebtPaid(debt.id)}>
                <AppText style={[styles.itemTitle, debt.isPaid ? styles.paid : undefined]}>{debt.name}</AppText>
                <AppText variant="caption">
                  {debt.type === 'lent' ? 'Lent to' : 'Borrowed from'} {debt.person}
                </AppText>
              </Pressable>
              <Pressable style={styles.iconTap} onPress={() => deleteDebt(debt.id)}>
                <Ionicons name="trash-outline" size={19} color={colors.danger} />
              </Pressable>
            </View>
            <View style={styles.debtFooter}>
              <AppText style={styles.itemTitle}>{formatCurrency(debt.amount, debt.currency)}</AppText>
              <Pressable style={[styles.statusPill, { borderColor: debt.isPaid ? colors.primary : colors.border }]} onPress={() => toggleDebtPaid(debt.id)}>
                <AppText variant="caption" color={debt.isPaid ? colors.primary : colors.muted}>
                  {debt.isPaid ? 'Paid' : 'Open'}
                </AppText>
              </Pressable>
            </View>
          </View>
        ))}
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: 14,
  },
  shortcutRow: {
    flexDirection: 'row',
    gap: 10,
  },
  shortcut: {
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    flex: 1,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    minHeight: 50,
  },
  shortcutText: {
    fontWeight: '800',
    fontSize: 12,
  },
  formHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  input: {
    borderRadius: 14,
    borderWidth: 1,
    fontSize: 15,
    minHeight: 48,
    paddingHorizontal: 12,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 10,
  },
  flex: {
    flex: 1,
  },
  listItem: {
    gap: 8,
  },
  goalItem: {
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
    padding: 14,
  },
  goalTop: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  goalIcon: {
    alignItems: 'center',
    borderRadius: 14,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  goalStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  goalStatRight: {
    alignItems: 'flex-end',
  },
  iconTap: {
    padding: 8,
  },
  listHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
  },
  itemTitle: {
    fontWeight: '800',
  },
  quickActions: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  adjustInput: {
    borderRadius: 14,
    borderWidth: 1,
    flex: 1,
    minHeight: 42,
    paddingHorizontal: 10,
  },
  adjustButton: {
    alignItems: 'center',
    borderRadius: 14,
    flexDirection: 'row',
    gap: 4,
    minHeight: 42,
    paddingHorizontal: 10,
  },
  adjustText: {
    fontWeight: '800',
  },
  optionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  pill: {
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  paid: {
    opacity: 0.45,
    textDecorationLine: 'line-through',
  },
  debtCard: {
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
    padding: 14,
  },
  debtFooter: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statusPill: {
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  segment: {
    flexDirection: 'row',
    gap: 8,
  },
  segmentItem: {
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    flex: 1,
    justifyContent: 'center',
    minHeight: 44,
  },
  segmentText: {
    fontWeight: '800',
  },
});
