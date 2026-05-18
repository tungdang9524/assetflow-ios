import React from 'react';
import { StyleSheet, View } from 'react-native';

import { AppText } from '../components/AppText';
import { Card } from '../components/Card';
import { ProgressBar } from '../components/ProgressBar';
import { Screen } from '../components/Screen';
import { SectionHeader } from '../components/SectionHeader';
import { useFinance } from '../store/FinanceStore';
import { getMonthlyTotals, getMonthlyTrend, getTopExpenseCategories } from '../utils/calculations';
import { compactCurrency, formatCurrency } from '../utils/currency';
import { getMonthKey } from '../utils/dates';

export function ReportsScreen() {
  const { state } = useFinance();
  const monthKey = getMonthKey(new Date());
  const totals = getMonthlyTotals(state.transactions, state.settings.usdToVndRate, monthKey);
  const categories = getTopExpenseCategories(state.categories, state.transactions, state.settings.usdToVndRate, monthKey);
  const trend = getMonthlyTrend(state.transactions, state.settings.usdToVndRate);
  const maxTrend = Math.max(...trend.map((item) => Math.max(item.income, item.expense)), 1);
  const maxCategory = categories[0]?.amount ?? 1;

  return (
    <Screen>
      <View>
        <AppText variant="caption">Reports</AppText>
        <AppText variant="title">Monthly view</AppText>
      </View>

      <Card style={styles.summary}>
        <View>
          <AppText variant="caption">Income</AppText>
          <AppText variant="number">{formatCurrency(totals.income, 'VND')}</AppText>
        </View>
        <View>
          <AppText variant="caption">Expenses</AppText>
          <AppText variant="number">{formatCurrency(totals.expense, 'VND')}</AppText>
        </View>
      </Card>

      <SectionHeader title="Category breakdown" />
      <Card style={styles.card}>
        {categories.length === 0 ? (
          <AppText variant="caption">No category spending this month.</AppText>
        ) : (
          categories.map((item) => (
            <View key={item.category.id} style={styles.rowBlock}>
              <View style={styles.line}>
                <AppText style={styles.label}>{item.category.name}</AppText>
                <AppText variant="caption">{compactCurrency(item.amount, 'VND')}</AppText>
              </View>
              <ProgressBar percent={item.amount / maxCategory} color={item.category.color} />
            </View>
          ))
        )}
      </Card>

      <SectionHeader title="Spending trend" />
      <Card style={styles.card}>
        {trend.map((item) => (
          <View key={item.monthKey} style={styles.trendRow}>
            <AppText variant="caption" style={styles.monthLabel}>
              {item.label}
            </AppText>
            <View style={styles.trendBars}>
              <ProgressBar percent={item.income / maxTrend} />
              <ProgressBar percent={item.expense / maxTrend} color="#D94841" />
            </View>
            <AppText variant="caption" style={styles.trendAmount}>
              {compactCurrency(item.expense, 'VND')}
            </AppText>
          </View>
        ))}
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  summary: {
    gap: 16,
  },
  card: {
    gap: 16,
  },
  rowBlock: {
    gap: 8,
  },
  line: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  label: {
    fontWeight: '800',
  },
  trendRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  monthLabel: {
    width: 34,
  },
  trendBars: {
    flex: 1,
    gap: 4,
  },
  trendAmount: {
    textAlign: 'right',
    width: 72,
  },
});
