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
import { DebtType } from '../models/finance';
import { PlanningStackParamList } from '../navigation/types';
import { useFinance } from '../store/FinanceStore';
import { useAppTheme } from '../theme/AppThemeProvider';
import { formatCurrency } from '../utils/currency';

type PlanningNavigation = NativeStackNavigationProp<PlanningStackParamList, 'PlanningHome'>;
type SavingsGoalsNavigation = NativeStackNavigationProp<PlanningStackParamList, 'SavingsGoals'>;
type AddSavingsGoalNavigation = NativeStackNavigationProp<PlanningStackParamList, 'AddSavingsGoal'>;
type DebtsLoansNavigation = NativeStackNavigationProp<PlanningStackParamList, 'DebtsLoans'>;
type AddDebtLoanNavigation = NativeStackNavigationProp<PlanningStackParamList, 'AddDebtLoan'>;

function parseAmount(value: string) {
  return Number(value.replace(/,/g, '.'));
}

export function PlanningScreen() {
  const navigation = useNavigation<PlanningNavigation>();
  const { colors } = useAppTheme();

  function renderToolRow(icon: keyof typeof Ionicons.glyphMap, title: string, subtitle: string, onPress: () => void) {
    return (
      <Pressable style={({ pressed }) => [styles.toolRow, { borderColor: colors.border, opacity: pressed ? 0.75 : 1 }]} onPress={onPress}>
        <View style={[styles.toolIcon, { backgroundColor: colors.primarySoft }]}>
          <Ionicons name={icon} size={19} color={colors.primary} />
        </View>
        <View style={styles.flex}>
          <AppText style={styles.itemTitle}>{title}</AppText>
          <AppText variant="caption">{subtitle}</AppText>
        </View>
        <Ionicons name="chevron-forward" size={18} color={colors.muted} />
      </Pressable>
    );
  }

  return (
    <Screen scroll={false}>
      <View>
        <AppText variant="caption">Planning</AppText>
        <AppText variant="title">Plan ahead</AppText>
      </View>

      <Card style={[styles.card, styles.menuCard]}>
        <View style={styles.toolList}>
          {renderToolRow('flag-outline', 'Savings Goals', 'Targets and saved amounts', () => navigation.navigate('SavingsGoals'))}
          {renderToolRow('people-outline', 'Debts & Loans', 'Money owed to you or by you', () => navigation.navigate('DebtsLoans'))}
          {renderToolRow('pie-chart-outline', 'Budgets', 'Category limits for this month', () => navigation.navigate('Budgets'))}
          {renderToolRow('calendar-outline', 'Calendar', 'Daily income, expenses, and transfers', () => navigation.navigate('Calendar'))}
          {renderToolRow('bar-chart-outline', 'Reports', 'Trends and category breakdowns', () => navigation.navigate('Reports'))}
        </View>
      </Card>
    </Screen>
  );
}

export function SavingsGoalsScreen() {
  const navigation = useNavigation<SavingsGoalsNavigation>();
  const { state, updateSavingsGoal, deleteSavingsGoal } = useFinance();
  const { colors } = useAppTheme();
  const [goalAdjustments, setGoalAdjustments] = useState<Record<string, string>>({});
  const sortedGoals = [...state.savingsGoals].sort((firstGoal, secondGoal) => {
    const firstCompleted = firstGoal.targetAmount > 0 && firstGoal.currentAmount >= firstGoal.targetAmount;
    const secondCompleted = secondGoal.targetAmount > 0 && secondGoal.currentAmount >= secondGoal.targetAmount;

    if (firstCompleted === secondCompleted) {
      return 0;
    }

    return firstCompleted ? 1 : -1;
  });

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

  function confirmDeleteGoal(goalId: string, goalName: string) {
    Alert.alert('Delete savings goal', `Delete ${goalName}?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteSavingsGoal(goalId) },
    ]);
  }

  return (
    <Screen>
      <View style={styles.titleRow}>
        <View>
          <AppText variant="caption">Planning</AppText>
          <AppText variant="title">Savings goals</AppText>
        </View>
        <Pressable
          accessibilityLabel="Add savings goal"
          style={({ pressed }) => [styles.addButton, { backgroundColor: colors.primary, opacity: pressed ? 0.82 : 1 }]}
          onPress={() => navigation.navigate('AddSavingsGoal')}
        >
          <Ionicons name="add" size={20} color="#FFFFFF" />
          <AppText color="#FFFFFF" style={styles.addButtonText}>Add</AppText>
        </Pressable>
      </View>

      <View style={styles.itemList}>
          {sortedGoals.map((goal) => {
            const percent = goal.targetAmount <= 0 ? 0 : goal.currentAmount / goal.targetAmount;
            const isCompleted = percent >= 1;
            const remaining = Math.max(goal.targetAmount - goal.currentAmount, 0);
            return (
              <View key={goal.id} style={[styles.goalItem, { borderColor: isCompleted ? colors.border : colors.warning }]}>
                <View style={styles.itemTop}>
                  <View style={[styles.goalIcon, { backgroundColor: `${goal.color}20` }]}>
                    <Ionicons name="flag" size={18} color={goal.color} />
                  </View>
                  <View style={styles.flex}>
                    <AppText style={[styles.itemTitle, isCompleted ? styles.paid : undefined]}>{goal.name}</AppText>
                    <AppText variant="caption">{Math.round(Math.min(percent, 1) * 100)}% complete</AppText>
                  </View>
                  <Pressable style={styles.iconTap} onPress={() => confirmDeleteGoal(goal.id, goal.name)}>
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
      </View>
    </Screen>
  );
}

export function AddSavingsGoalScreen() {
  const navigation = useNavigation<AddSavingsGoalNavigation>();
  const { addSavingsGoal } = useFinance();
  const { colors } = useAppTheme();
  const [goalName, setGoalName] = useState('');
  const [goalTarget, setGoalTarget] = useState('');
  const [goalCurrent, setGoalCurrent] = useState('');

  function addGoal() {
    const target = parseAmount(goalTarget);
    const current = parseAmount(goalCurrent || '0');

    if (!goalName.trim() || !Number.isFinite(target) || target <= 0 || !Number.isFinite(current) || current < 0) {
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
    navigation.goBack();
  }

  return (
    <Screen>
      <Card style={styles.card}>
        <View style={styles.panelHeader}>
          <View style={[styles.toolIcon, { backgroundColor: colors.primarySoft }]}>
            <Ionicons name="flag-outline" size={19} color={colors.primary} />
          </View>
          <View style={styles.flex}>
            <AppText variant="heading">Add savings goal</AppText>
          </View>
        </View>
        <TextInput placeholder="Goal name" placeholderTextColor={colors.muted} value={goalName} onChangeText={setGoalName} style={[styles.input, { borderColor: colors.border, color: colors.text }]} />
        <View style={styles.inputRow}>
          <TextInput placeholder="Target" placeholderTextColor={colors.muted} value={goalTarget} onChangeText={setGoalTarget} keyboardType="decimal-pad" style={[styles.input, styles.flex, { borderColor: colors.border, color: colors.text }]} />
          <TextInput placeholder="Current" placeholderTextColor={colors.muted} value={goalCurrent} onChangeText={setGoalCurrent} keyboardType="decimal-pad" style={[styles.input, styles.flex, { borderColor: colors.border, color: colors.text }]} />
        </View>
        <PrimaryButton label="Add goal" icon="flag-outline" onPress={addGoal} />
      </Card>
    </Screen>
  );
}

export function DebtsLoansScreen() {
  const navigation = useNavigation<DebtsLoansNavigation>();
  const { state, toggleDebtPaid, deleteDebt } = useFinance();
  const { colors } = useAppTheme();
  const [selectedDebtType, setSelectedDebtType] = useState<DebtType>('lent');
  const sortedDebts = [...state.debts].sort((firstDebt, secondDebt) => {
    if (firstDebt.isPaid === secondDebt.isPaid) {
      return 0;
    }

    return firstDebt.isPaid ? 1 : -1;
  });
  const visibleDebts = sortedDebts.filter((debt) => debt.type === selectedDebtType);

  function confirmDeleteDebt(debtId: string, debtName: string) {
    Alert.alert('Delete debt or loan', `Delete ${debtName}?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteDebt(debtId) },
    ]);
  }

  return (
    <Screen>
      <View style={styles.titleRow}>
        <View>
          <AppText variant="caption">Planning</AppText>
          <AppText variant="title">Debts & loans</AppText>
        </View>
        <Pressable
          accessibilityLabel="Add debt or loan"
          style={({ pressed }) => [styles.addButton, { backgroundColor: colors.primary, opacity: pressed ? 0.82 : 1 }]}
          onPress={() => navigation.navigate('AddDebtLoan')}
        >
          <Ionicons name="add" size={20} color="#FFFFFF" />
          <AppText color="#FFFFFF" style={styles.addButtonText}>Add</AppText>
        </Pressable>
      </View>

      <View style={styles.segment}>
        {(['lent', 'borrowed'] as DebtType[]).map((item) => {
          const selected = selectedDebtType === item;

          return (
            <Pressable
              key={item}
              style={[styles.segmentItem, { borderColor: colors.border, backgroundColor: selected ? colors.primary : colors.surface }]}
              onPress={() => setSelectedDebtType(item)}
            >
              <AppText color={selected ? '#FFFFFF' : colors.text} style={styles.segmentText}>{item === 'lent' ? 'Lent' : 'Borrowed'}</AppText>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.itemList}>
          {visibleDebts.map((debt) => (
            <View key={debt.id} style={[styles.debtCard, { borderColor: debt.isPaid ? colors.border : debt.type === 'lent' ? colors.primary : colors.warning }]}>
              <View style={styles.itemTop}>
                <View style={[styles.goalIcon, { backgroundColor: debt.type === 'lent' ? colors.primarySoft : `${colors.warning}20` }]}>
                  <Ionicons name={debt.type === 'lent' ? 'arrow-up-outline' : 'arrow-down-outline'} size={18} color={debt.type === 'lent' ? colors.primary : colors.warning} />
                </View>
                <Pressable style={styles.flex} onPress={() => toggleDebtPaid(debt.id)}>
                  <AppText style={[styles.itemTitle, debt.isPaid ? styles.paid : undefined]}>{debt.name}</AppText>
                  <AppText variant="caption">
                    {debt.type === 'lent' ? 'Lent to' : 'Borrowed from'} {debt.person}
                  </AppText>
                </Pressable>
                <Pressable style={styles.iconTap} onPress={() => confirmDeleteDebt(debt.id, debt.name)}>
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
      </View>
    </Screen>
  );
}

export function AddDebtLoanScreen() {
  const navigation = useNavigation<AddDebtLoanNavigation>();
  const { addDebt } = useFinance();
  const { colors } = useAppTheme();
  const [debtType, setDebtType] = useState<DebtType>('lent');
  const [debtName, setDebtName] = useState('');
  const [debtPerson, setDebtPerson] = useState('');
  const [debtAmount, setDebtAmount] = useState('');

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
    navigation.goBack();
  }

  return (
    <Screen>
      <Card style={styles.card}>
        <View style={styles.panelHeader}>
          <View style={[styles.toolIcon, { backgroundColor: colors.primarySoft }]}>
            <Ionicons name="people-outline" size={19} color={colors.primary} />
          </View>
          <View style={styles.flex}>
            <AppText variant="heading">Add debt or loan</AppText>
          </View>
        </View>
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
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: 14,
  },
  titleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  addButton: {
    alignItems: 'center',
    borderRadius: 16,
    flexDirection: 'row',
    gap: 6,
    justifyContent: 'center',
    minHeight: 48,
    paddingHorizontal: 16,
  },
  addButtonText: {
    fontWeight: '800',
  },
  menuCard: {
    flex: 1,
  },
  toolList: {
    flex: 1,
    gap: 8,
  },
  toolRow: {
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    flex: 1,
    flexDirection: 'row',
    gap: 10,
    minHeight: 72,
    paddingHorizontal: 12,
  },
  toolIcon: {
    alignItems: 'center',
    borderRadius: 13,
    height: 38,
    justifyContent: 'center',
    width: 38,
  },
  panelHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
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
  itemList: {
    gap: 12,
  },
  goalItem: {
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
    padding: 14,
  },
  itemTop: {
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
    gap: 12,
    justifyContent: 'space-between',
  },
  goalStatRight: {
    alignItems: 'flex-end',
  },
  iconTap: {
    padding: 8,
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
