import React from 'react';
import { StyleSheet, View } from 'react-native';

import { AppText } from '../components/AppText';
import { Card } from '../components/Card';
import { ProgressBar } from '../components/ProgressBar';
import { Screen } from '../components/Screen';
import { useFinance } from '../store/FinanceStore';
import { getBudgetProgress } from '../utils/calculations';
import { formatCurrency } from '../utils/currency';
import { formatMonthLabel, getMonthKey } from '../utils/dates';

export function BudgetsScreen() {
  const { state } = useFinance();
  const monthKey = getMonthKey(new Date());
  const budgets = state.budgets.filter((budget) => budget.month === monthKey);

  return (
    <Screen>
      <View>
        <AppText variant="caption">{formatMonthLabel(monthKey)}</AppText>
        <AppText variant="title">Budgets</AppText>
      </View>

      {budgets.map((budget) => {
        const category = state.categories.find((item) => item.id === budget.categoryId);
        const progress = getBudgetProgress(budget, state.transactions, state.settings.usdToVndRate);
        const alertText = progress.percent >= 1 ? 'Over budget' : progress.percent >= 0.8 ? 'Close to limit' : undefined;

        return (
          <Card key={budget.id} style={styles.budgetCard}>
            <View style={styles.row}>
              <View style={styles.copy}>
                <AppText variant="body" style={styles.category}>
                  {category?.name ?? 'Category'}
                </AppText>
                <AppText variant="caption">
                  {formatCurrency(progress.spent, 'VND')} spent - {formatCurrency(Math.max(progress.remaining, 0), 'VND')} left
                </AppText>
                {alertText ? <AppText color={progress.percent >= 1 ? '#D94841' : '#D98A1B'} variant="caption">{alertText}</AppText> : null}
              </View>
              <AppText variant="body" style={styles.amount}>
                {Math.round(progress.percent * 100)}%
              </AppText>
            </View>
            <ProgressBar percent={progress.percent} color={category?.color} />
          </Card>
        );
      })}
    </Screen>
  );
}

const styles = StyleSheet.create({
  budgetCard: {
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
  amount: {
    fontWeight: '800',
  },
});
