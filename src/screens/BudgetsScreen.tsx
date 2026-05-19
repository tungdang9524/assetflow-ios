import React, { useState } from 'react';
import { Alert, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';

import { AppText } from '../components/AppText';
import { Card } from '../components/Card';
import { PrimaryButton } from '../components/PrimaryButton';
import { ProgressBar } from '../components/ProgressBar';
import { Screen } from '../components/Screen';
import { PlanningStackParamList } from '../navigation/types';
import { useFinance } from '../store/FinanceStore';
import { useAppTheme } from '../theme/AppThemeProvider';
import { getBudgetProgress } from '../utils/calculations';
import { formatCurrency } from '../utils/currency';
import { formatMonthLabel, getMonthKey } from '../utils/dates';

function parseAmount(value: string) {
  return Number(value.replace(/,/g, '.'));
}

type BudgetsNavigation = NativeStackNavigationProp<PlanningStackParamList, 'Budgets'>;
type AddBudgetNavigation = NativeStackNavigationProp<PlanningStackParamList, 'AddBudget'>;
type BudgetDetailNavigation = NativeStackNavigationProp<PlanningStackParamList, 'BudgetDetail'>;
type BudgetDetailRoute = RouteProp<PlanningStackParamList, 'BudgetDetail'>;

export function BudgetsScreen() {
  const navigation = useNavigation<BudgetsNavigation>();
  const { state } = useFinance();
  const { colors } = useAppTheme();
  const monthKey = getMonthKey(new Date());
  const budgets = state.budgets.filter((budget) => budget.month === monthKey);

  return (
    <Screen>
      <View style={styles.titleRow}>
        <View>
          <AppText variant="caption">{formatMonthLabel(monthKey)}</AppText>
          <AppText variant="title">Budgets</AppText>
        </View>
        <Pressable
          accessibilityLabel="Add budget"
          style={({ pressed }) => [styles.iconButton, { backgroundColor: colors.primary, opacity: pressed ? 0.82 : 1 }]}
          onPress={() => navigation.navigate('AddBudget')}
        >
          <Ionicons name="add" size={24} color="#FFFFFF" />
        </Pressable>
      </View>

      <View style={styles.list}>
        {budgets.map((budget) => {
          const category = state.categories.find((item) => item.id === budget.categoryId);
          const progress = getBudgetProgress(budget, state.transactions, state.settings.usdToVndRate);
          const alertText = progress.percent >= 1 ? 'Over budget' : progress.percent >= 0.8 ? 'Close to limit' : undefined;

          return (
            <Pressable key={budget.id} onPress={() => navigation.navigate('BudgetDetail', { budgetId: budget.id })}>
              <Card style={[styles.budgetCard, { borderColor: colors.border }]}>
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

export function AddBudgetScreen() {
  const navigation = useNavigation<AddBudgetNavigation>();
  const { state, addBudget } = useFinance();
  const { colors } = useAppTheme();
  const monthKey = getMonthKey(new Date());
  const expenseCategories = state.categories.filter((category) => category.type === 'expense');
  const budgets = state.budgets.filter((budget) => budget.month === monthKey);
  const [categoryId, setCategoryId] = useState('');
  const [amount, setAmount] = useState('');
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const budgetedCategoryIds = new Set(budgets.map((budget) => budget.categoryId));
  const availableCategories = expenseCategories.filter((category) => !budgetedCategoryIds.has(category.id));
  const selectedCategory = expenseCategories.find((category) => category.id === categoryId);

  function saveBudget() {
    const parsedAmount = parseAmount(amount);

    if (!categoryId) {
      Alert.alert('Choose category', availableCategories.length > 0 ? 'Select a category for this budget.' : 'Every expense category already has a budget.');
      return;
    }

    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      Alert.alert('Invalid budget', 'Enter a budget amount greater than zero.');
      return;
    }

    addBudget({
      categoryId,
      amount: parsedAmount,
      currency: 'VND',
      month: monthKey,
    });

    navigation.goBack();
  }

  return (
    <Screen>
      <Card style={styles.formCard}>
        <View>
          <AppText variant="heading">Add budget</AppText>
          <AppText variant="caption">Set a monthly limit for one expense category.</AppText>
        </View>

        <View style={styles.field}>
          <AppText variant="caption">Category</AppText>
          <Pressable
            style={[styles.dropdownButton, { borderColor: colors.border, backgroundColor: colors.surface }]}
            onPress={() => setIsCategoryDropdownOpen((value) => !value)}
          >
            <View style={styles.dropdownValue}>
              {selectedCategory ? <View style={[styles.dot, { backgroundColor: selectedCategory.color }]} /> : null}
              <AppText color={selectedCategory ? colors.text : colors.muted} style={styles.dropdownText}>
                {selectedCategory?.name ?? (availableCategories.length > 0 ? 'Choose category' : 'No categories available')}
              </AppText>
            </View>
            <Ionicons name={isCategoryDropdownOpen ? 'chevron-up' : 'chevron-down'} size={18} color={colors.muted} />
          </Pressable>
          {isCategoryDropdownOpen ? (
            <View style={[styles.dropdownList, { borderColor: colors.border, backgroundColor: colors.surface }]}>
              {availableCategories.map((category, index) => (
                <Pressable
                  key={category.id}
                  style={[styles.dropdownItem, { borderBottomColor: colors.border, borderBottomWidth: index === availableCategories.length - 1 ? 0 : StyleSheet.hairlineWidth }]}
                  onPress={() => {
                    setCategoryId(category.id);
                    setIsCategoryDropdownOpen(false);
                  }}
                >
                  <View style={[styles.dot, { backgroundColor: category.color }]} />
                  <AppText style={styles.dropdownItemText}>{category.name}</AppText>
                  {category.id === categoryId ? <Ionicons name="checkmark" size={18} color={colors.primary} /> : null}
                </Pressable>
              ))}
            </View>
          ) : null}
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
          <PrimaryButton label="Add budget" icon="save-outline" onPress={saveBudget} disabled={availableCategories.length === 0} />
        </View>
      </Card>
    </Screen>
  );
}

export function BudgetDetailScreen() {
  const route = useRoute<BudgetDetailRoute>();
  const navigation = useNavigation<BudgetDetailNavigation>();
  const { state, updateBudget, deleteBudget } = useFinance();
  const { colors } = useAppTheme();
  const monthKey = getMonthKey(new Date());
  const budget = state.budgets.find((item) => item.id === route.params.budgetId);
  const budgets = state.budgets.filter((item) => item.month === monthKey);
  const expenseCategories = state.categories.filter((category) => category.type === 'expense');
  const [categoryId, setCategoryId] = useState(budget?.categoryId ?? '');
  const [amount, setAmount] = useState(budget ? String(budget.amount) : '');
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const budgetedCategoryIds = new Set(budgets.filter((item) => item.id !== budget?.id).map((item) => item.categoryId));
  const availableCategories = expenseCategories.filter((category) => !budgetedCategoryIds.has(category.id));
  const selectedCategory = expenseCategories.find((category) => category.id === categoryId);

  if (!budget) {
    return (
      <Screen>
        <Card style={styles.formCard}>
          <AppText variant="heading">Budget not found</AppText>
        </Card>
      </Screen>
    );
  }

  const selectedBudget = budget;

  function saveBudget() {
    const parsedAmount = parseAmount(amount);

    if (!categoryId) {
      Alert.alert('Choose category', 'Select a category for this budget.');
      return;
    }

    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      Alert.alert('Invalid budget', 'Enter a budget amount greater than zero.');
      return;
    }

    updateBudget(selectedBudget.id, {
      categoryId,
      amount: parsedAmount,
      currency: 'VND',
      month: selectedBudget.month,
    });
    navigation.goBack();
  }

  function confirmDeleteBudget() {
    Alert.alert('Delete budget', 'Remove this monthly budget?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          deleteBudget(selectedBudget.id);
          navigation.goBack();
        },
      },
    ]);
  }

  return (
    <Screen>
      <Card style={styles.formCard}>
        <View>
          <AppText variant="heading">Edit budget</AppText>
          <AppText variant="caption">{formatMonthLabel(selectedBudget.month)}</AppText>
        </View>

        <View style={styles.field}>
          <AppText variant="caption">Category</AppText>
          <Pressable
            style={[styles.dropdownButton, { borderColor: colors.border, backgroundColor: colors.surface }]}
            onPress={() => setIsCategoryDropdownOpen((value) => !value)}
          >
            <View style={styles.dropdownValue}>
              {selectedCategory ? <View style={[styles.dot, { backgroundColor: selectedCategory.color }]} /> : null}
              <AppText color={selectedCategory ? colors.text : colors.muted} style={styles.dropdownText}>
                {selectedCategory?.name ?? 'Choose category'}
              </AppText>
            </View>
            <Ionicons name={isCategoryDropdownOpen ? 'chevron-up' : 'chevron-down'} size={18} color={colors.muted} />
          </Pressable>
          {isCategoryDropdownOpen ? (
            <View style={[styles.dropdownList, { borderColor: colors.border, backgroundColor: colors.surface }]}>
              {availableCategories.map((category, index) => (
                <Pressable
                  key={category.id}
                  style={[styles.dropdownItem, { borderBottomColor: colors.border, borderBottomWidth: index === availableCategories.length - 1 ? 0 : StyleSheet.hairlineWidth }]}
                  onPress={() => {
                    setCategoryId(category.id);
                    setIsCategoryDropdownOpen(false);
                  }}
                >
                  <View style={[styles.dot, { backgroundColor: category.color }]} />
                  <AppText style={styles.dropdownItemText}>{category.name}</AppText>
                  {category.id === categoryId ? <Ionicons name="checkmark" size={18} color={colors.primary} /> : null}
                </Pressable>
              ))}
            </View>
          ) : null}
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
          <PrimaryButton label="Save changes" icon="save-outline" onPress={saveBudget} />
          <Pressable style={[styles.secondaryButton, { borderColor: colors.danger }]} onPress={confirmDeleteBudget}>
            <AppText color={colors.danger} style={styles.buttonText}>Delete</AppText>
          </Pressable>
        </View>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  titleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  iconButton: {
    alignItems: 'center',
    borderRadius: 16,
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  formCard: {
    gap: 14,
  },
  field: {
    gap: 8,
  },
  dropdownButton: {
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 50,
    paddingHorizontal: 12,
  },
  dropdownValue: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    gap: 8,
  },
  dropdownText: {
    fontWeight: '800',
  },
  dropdownList: {
    borderRadius: 14,
    borderWidth: 1,
    overflow: 'hidden',
  },
  dropdownItem: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    minHeight: 46,
    paddingHorizontal: 12,
  },
  dropdownItemText: {
    flex: 1,
    fontWeight: '800',
  },
  dot: {
    borderRadius: 999,
    height: 10,
    width: 10,
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
