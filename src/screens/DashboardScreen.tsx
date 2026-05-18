import React from 'react';
import { StyleSheet, View } from 'react-native';

import { AppText } from '../components/AppText';
import { BalanceTrendChart } from '../components/BalanceTrendChart';
import { Card } from '../components/Card';
import { ProgressBar } from '../components/ProgressBar';
import { Screen } from '../components/Screen';
import { SectionHeader } from '../components/SectionHeader';
import { StatCard } from '../components/StatCard';
import { TransactionRow } from '../components/TransactionRow';
import { useFinance } from '../store/FinanceStore';
import { useAppTheme } from '../theme/AppThemeProvider';
import { getBalanceTrend, getMonthlyTotals, getNetWorthVnd, getTopExpenseCategories } from '../utils/calculations';
import { compactCurrency, formatCurrency } from '../utils/currency';
import { formatMonthLabel, getMonthKey } from '../utils/dates';

export function DashboardScreen() {
  const { state } = useFinance();
  const { colors } = useAppTheme();
  const monthKey = getMonthKey(new Date());
  const totals = getMonthlyTotals(state.transactions, state.settings.usdToVndRate, monthKey);
  const netWorth = getNetWorthVnd(state.accounts, state.settings.usdToVndRate);
  const topCategories = getTopExpenseCategories(state.categories, state.transactions, state.settings.usdToVndRate, monthKey);
  const largestSpend = topCategories[0]?.amount ?? 1;
  const recentTransactions = state.transactions.slice(0, 5);
  const balanceTrend = getBalanceTrend(state.accounts, state.transactions, state.settings.usdToVndRate);

  return (
    <Screen>
      <View style={styles.header}>
        <View>
          <AppText variant="caption">{formatMonthLabel(monthKey)}</AppText>
          <AppText variant="title">AssetFlow</AppText>
        </View>
      </View>

      <Card style={[styles.hero, { backgroundColor: colors.primary }]}>
        <AppText color="#FFFFFF" variant="caption">
          Total net worth
        </AppText>
        <AppText color="#FFFFFF" variant="title" style={styles.heroAmount}>
          {formatCurrency(netWorth, 'VND')}
        </AppText>
        <AppText color="#DDF2E6" variant="caption">
          USD balances use your manual rate of {formatCurrency(state.settings.usdToVndRate, 'VND')} per USD.
        </AppText>
      </Card>

      <View style={styles.statGrid}>
        <StatCard label="Income" value={compactCurrency(totals.income, 'VND')} tone="positive" />
        <StatCard label="Expenses" value={compactCurrency(totals.expense, 'VND')} tone="negative" />
      </View>
      <StatCard label="Monthly balance" value={formatCurrency(totals.balance, 'VND')} tone={totals.balance >= 0 ? 'positive' : 'negative'} />

      <Card style={styles.trendCard}>
        <BalanceTrendChart points={balanceTrend} />
      </Card>

      <SectionHeader title="Spending summary" />
      <Card style={styles.summaryCard}>
        {topCategories.length === 0 ? (
          <AppText variant="caption">No expense data for this month yet.</AppText>
        ) : (
          topCategories.slice(0, 4).map((item) => (
            <View key={item.category.id} style={styles.summaryRow}>
              <View style={styles.summaryLine}>
                <AppText variant="body" style={styles.summaryName}>
                  {item.category.name}
                </AppText>
                <AppText variant="caption">{compactCurrency(item.amount, 'VND')}</AppText>
              </View>
              <ProgressBar percent={item.amount / largestSpend} color={item.category.color} />
            </View>
          ))
        )}
      </Card>

      <SectionHeader title="Recent transactions" />
      <Card style={styles.transactionsCard}>
        {recentTransactions.map((transaction) => (
          <TransactionRow
            key={transaction.id}
            transaction={transaction}
            account={state.accounts.find((account) => account.id === transaction.accountId)}
            toAccount={state.accounts.find((account) => account.id === transaction.toAccountId)}
            category={state.categories.find((category) => category.id === transaction.categoryId)}
          />
        ))}
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  hero: {
    gap: 8,
    padding: 20,
  },
  heroAmount: {
    fontSize: 33,
  },
  statGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  trendCard: {
    gap: 12,
  },
  summaryCard: {
    gap: 14,
  },
  summaryRow: {
    gap: 8,
  },
  summaryLine: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryName: {
    fontWeight: '700',
  },
  transactionsCard: {
    gap: 14,
  },
});
