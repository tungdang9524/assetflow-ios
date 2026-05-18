import React, { useState } from 'react';
import { Alert, Pressable, StyleSheet, TextInput, View } from 'react-native';

import { AppText } from '../components/AppText';
import { Card } from '../components/Card';
import { PrimaryButton } from '../components/PrimaryButton';
import { ProgressBar } from '../components/ProgressBar';
import { Screen } from '../components/Screen';
import { useFinance } from '../store/FinanceStore';
import { useAppTheme } from '../theme/AppThemeProvider';
import { getBudgetProgress } from '../utils/calculations';
import { formatCurrency } from '../utils/currency';
import { formatMonthLabel, getMonthKey } from '../utils/dates';

function parseAmount(value: string) {
  return Number(value.replace(/,/g, '.'));
}

export function BudgetsScreen() {
  const { state, addBudget, updateBudget, deleteBudget } = useFinance();
  const { colors } = useAppTheme();
  const monthKey = getMonthKey(new Date());
  const expenseCategories = state.categories.filter((category) => category.type === 'expense');
  const budgets = state.budgets.filter((budget) => budget.month === monthKey);
  const [editingBudgetId, setEditingBudgetId] = useState<string | undefined>();
  const [categoryId, setCategoryId] = useState(expenseCategories[0]?.id ?? '');
  const [amount, setAmount] = useState('');
  const editingBudget = budgets.find((budget) => budget.id === editingBudgetId);

  function resetForm() {
    setEditingBudgetId(undefined);
    setCategoryId(expenseCategories[0]?.id ?? '');
    setAmount('');
  }

  function saveBudget() {
    const selectedCategoryId = categoryId || expenseCategories[0]?.id;
    const parsedAmount = parseAmount(amount);

    if (!selectedCategoryId) {
      Alert.alert('No category', 'Create an expense category first.');
      return;
    }

    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      Alert.alert('Invalid budget', 'Enter a budget amount greater than zero.');
      return;
    }

    if (editingBudget) {
      updateBudget(editingBudget.id, {
        categoryId: selectedCategoryId,
        amount: parsedAmount,
        currency: 'VND',
        month: monthKey,
      });
    } else {
      addBudget({
        categoryId: selectedCategoryId,
        amount: parsedAmount,
        currency: 'VND',
        month: monthKey,
      });
    }

    resetForm();
  }

  function editBudget(budget: (typeof budgets)[number]) {
    setEditingBudgetId(budget.id);
    setCategoryId(budget.categoryId);
    setAmount(String(budget.amount));
  }

  function confirmDeleteBudget() {
    if (!editingBudget) {
      return;
    }

    Alert.alert('Delete budget', 'Remove this monthly budget?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          deleteBudget(editingBudget.id);
          resetForm();
        },
      },
    ]);
  }

  return (
    <Screen>
      <View>
        <AppText variant="caption">{formatMonthLabel(monthKey)}</AppText>
        <AppText variant="title">Budgets</AppText>
      </View>

      <Card style={styles.formCard}>
        <View>
          <AppText variant="heading">{editingBudget ? 'Edit budget' : 'Add budget'}</AppText>
          <AppText variant="caption">Set a monthly limit for one expense category.</AppText>
        </View>

        <View style={styles.field}>
          <AppText variant="caption">Category</AppText>
          <View style={styles.categoryGrid}>
            {expenseCategories.map((category) => {
              const selected = category.id === (categoryId || expenseCategories[0]?.id);
              return (
                <Pressable
                  key={category.id}
                  style={[styles.categoryChip, { borderColor: selected ? colors.primary : colors.border, backgroundColor: colors.surface }]}
                  onPress={() => setCategoryId(category.id)}
                >
                  <View style={[styles.dot, { backgroundColor: category.color }]} />
                  <AppText style={styles.chipText}>{category.name}</AppText>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.field}>
          <AppText variant="caption">Monthly limit (VND)</AppText>
          <TextInput
            keyboardType="decimal-pad"
            placeholder="0"
            placeholderTextColor={colors.muted}
            value={amount}
            onChangeText={setAmount}
            style={[styles.input, { borderColor: colors.border, color: colors.text }]}
          />
        </View>

        <View style={styles.actions}>
          <PrimaryButton label={editingBudget ? 'Save changes' : 'Add budget'} icon="save-outline" onPress={saveBudget} />
          {editingBudget ? (
            <>
              <Pressable style={[styles.secondaryButton, { borderColor: colors.border }]} onPress={resetForm}>
                <AppText style={styles.buttonText}>Cancel</AppText>
              </Pressable>
              <Pressable style={[styles.secondaryButton, { borderColor: colors.danger }]} onPress={confirmDeleteBudget}>
                <AppText color={colors.danger} style={styles.buttonText}>Delete</AppText>
              </Pressable>
            </>
          ) : null}
        </View>
      </Card>

      <View style={styles.list}>
        {budgets.map((budget) => {
          const category = state.categories.find((item) => item.id === budget.categoryId);
          const progress = getBudgetProgress(budget, state.transactions, state.settings.usdToVndRate);
          const alertText = progress.percent >= 1 ? 'Over budget' : progress.percent >= 0.8 ? 'Close to limit' : undefined;

          return (
            <Pressable key={budget.id} onPress={() => editBudget(budget)}>
              <Card style={[styles.budgetCard, { borderColor: editingBudgetId === budget.id ? colors.primary : colors.border }]}>
                <View style={styles.row}>
                  <View style={styles.copy}>
                    <AppText variant="body" style={styles.category}>
                      {category?.name ?? 'Category'}
                    </AppText>
                    <AppText variant="caption">
                      {formatCurrency(progress.spent, 'VND')} spent - {formatCurrency(Math.max(progress.remaining, 0), 'VND')} left
                    </AppText>
                    {alertText ? <AppText color={progress.percent >= 1 ? colors.danger : colors.warning} variant="caption">{alertText}</AppText> : null}
                  </View>
                  <View style={styles.amountBlock}>
                    <AppText variant="body" style={styles.amount}>
                      {Math.round(progress.percent * 100)}%
                    </AppText>
                    <AppText variant="caption">{formatCurrency(budget.amount, budget.currency)}</AppText>
                  </View>
                </View>
                <ProgressBar percent={progress.percent} color={category?.color} />
              </Card>
            </Pressable>
          );
        })}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  formCard: {
    gap: 14,
  },
  field: {
    gap: 8,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryChip: {
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 8,
    minHeight: 42,
    paddingHorizontal: 12,
  },
  dot: {
    borderRadius: 999,
    height: 10,
    width: 10,
  },
  chipText: {
    fontWeight: '800',
  },
  input: {
    borderRadius: 14,
    borderWidth: 1,
    fontSize: 18,
    fontWeight: '700',
    minHeight: 50,
    paddingHorizontal: 12,
  },
  actions: {
    gap: 10,
  },
  secondaryButton: {
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 48,
  },
  buttonText: {
    fontWeight: '800',
  },
  list: {
    gap: 12,
  },
  budgetCard: {
    borderWidth: 1,
    gap: 14,
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
  },
  copy: {
    flex: 1,
    gap: 2,
  },
  category: {
    fontWeight: '800',
  },
  amountBlock: {
    alignItems: 'flex-end',
    gap: 2,
  },
  amount: {
    fontWeight: '800',
  },
});
