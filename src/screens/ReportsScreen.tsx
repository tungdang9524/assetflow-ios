import React from 'react';
import { StyleSheet, View } from 'react-native';

import { AppText } from '../components/AppText';
import { Card } from '../components/Card';
import { ProgressBar } from '../components/ProgressBar';
import { Screen } from '../components/Screen';
import { SectionHeader } from '../components/SectionHeader';
import { useFinance } from '../store/FinanceStore';
import { useAppTheme } from '../theme/AppThemeProvider';
import { getMonthlyTotals, getMonthlyTrend, getNetWorthVnd, getTopExpenseCategories } from '../utils/calculations';
import { compactCurrency, convertCurrency, formatCurrency } from '../utils/currency';
import { getMonthKey } from '../utils/dates';

function DonutSegment({ color, end, start }: { color: string; end: number; start: number }) {
  const startDegrees = start * 360;
  const sweepDegrees = Math.max((end - start) * 360, 0);

  if (sweepDegrees <= 0) {
    return null;
  }

  if (sweepDegrees > 180) {
    return (
      <>
        <DonutSegment color={color} start={start} end={start + 0.5} />
        <DonutSegment color={color} start={start + 0.5} end={end} />
      </>
    );
  }

  return (
    <View style={[styles.segmentContainer, { transform: [{ rotate: `${startDegrees}deg` }] }]}>
      <View style={[styles.segmentClip, sweepDegrees > 90 ? styles.segmentClipWide : undefined]}>
        <View style={[styles.segment, { backgroundColor: color, transform: [{ rotate: `${sweepDegrees}deg` }] }]} />
      </View>
    </View>
  );
}

export function ReportsScreen() {
  const { state } = useFinance();
  const { colors } = useAppTheme();
  const monthKey = getMonthKey(new Date());
  const totals = getMonthlyTotals(state.transactions, state.settings.usdToVndRate, monthKey);
  const categories = getTopExpenseCategories(state.categories, state.transactions, state.settings.usdToVndRate, monthKey);
  const trend = getMonthlyTrend(state.transactions, state.settings.usdToVndRate);
  const maxTrend = Math.max(...trend.map((item) => Math.max(item.income, item.expense)), 1);
  const categoryTotal = categories.reduce((sum, item) => sum + item.amount, 0);
  const netWorth = getNetWorthVnd(state.accounts, state.settings.usdToVndRate);
  const accountAllocation = state.accounts
    .map((account) => {
      const value =
        account.type === 'crypto'
          ? account.cryptoHoldings?.length
            ? account.cryptoHoldings.reduce((sum, holding) => sum + holding.quantity * (holding.priceUsd ?? 0) * state.settings.usdToVndRate, 0)
            : account.balance * (account.cryptoPriceUsd ?? 0) * state.settings.usdToVndRate
          : convertCurrency(account.balance, account.currency, 'VND', state.settings.usdToVndRate);

      return { account, value };
    })
    .filter((item) => item.value > 0)
    .sort((a, b) => b.value - a.value);
  const outstandingDebt = state.debts
    .filter((debt) => !debt.isPaid)
    .reduce((sum, debt) => sum + convertCurrency(debt.amount, debt.currency, 'VND', state.settings.usdToVndRate), 0);
  const goalTarget = state.savingsGoals.reduce(
    (sum, goal) => sum + convertCurrency(goal.targetAmount, goal.currency, 'VND', state.settings.usdToVndRate),
    0,
  );
  const goalCurrent = state.savingsGoals.reduce(
    (sum, goal) => sum + convertCurrency(goal.currentAmount, goal.currency, 'VND', state.settings.usdToVndRate),
    0,
  );

  return (
    <Screen>
      <View>
        <AppText variant="caption">Reports</AppText>
        <AppText variant="title">Monthly view</AppText>
      </View>

      <Card style={styles.summary}>
        <View>
          <AppText variant="caption">Net worth</AppText>
          <AppText variant="number">{formatCurrency(netWorth, 'VND')}</AppText>
        </View>
        <View>
          <AppText variant="caption">Income</AppText>
          <AppText variant="number">{formatCurrency(totals.income, 'VND')}</AppText>
        </View>
        <View>
          <AppText variant="caption">Expenses</AppText>
          <AppText variant="number">{formatCurrency(totals.expense, 'VND')}</AppText>
        </View>
      </Card>

      <SectionHeader title="Account allocation" />
      <Card style={styles.card}>
        {accountAllocation.map((item) => (
          <View key={item.account.id} style={styles.rowBlock}>
            <View style={styles.line}>
              <AppText style={styles.label}>{item.account.name}</AppText>
              <AppText variant="caption">{compactCurrency(item.value, 'VND')}</AppText>
            </View>
            <ProgressBar percent={netWorth <= 0 ? 0 : item.value / netWorth} color={item.account.color} />
          </View>
        ))}
      </Card>

      <SectionHeader title="Plans snapshot" />
      <Card style={styles.card}>
        <View style={styles.line}>
          <AppText style={styles.label}>Outstanding debts</AppText>
          <AppText variant="caption">{formatCurrency(outstandingDebt, 'VND')}</AppText>
        </View>
        <View style={styles.rowBlock}>
          <View style={styles.line}>
            <AppText style={styles.label}>Savings goals</AppText>
            <AppText variant="caption">
              {formatCurrency(goalCurrent, 'VND')} / {formatCurrency(goalTarget, 'VND')}
            </AppText>
          </View>
          <ProgressBar percent={goalTarget <= 0 ? 0 : goalCurrent / goalTarget} />
        </View>
      </Card>

      <SectionHeader title="Expense chart" />
      <Card style={styles.card}>
        {categories.length === 0 ? (
          <AppText variant="caption">No category spending this month.</AppText>
        ) : (
          <View style={styles.donutSection}>
            <View style={styles.donut}>
              {categories.reduce<React.ReactNode[]>((segments, item, index) => {
                const start = categories.slice(0, index).reduce((sum, categoryItem) => sum + categoryItem.amount, 0) / categoryTotal;
                const end = start + item.amount / categoryTotal;
                segments.push(<DonutSegment key={item.category.id} color={item.category.color} start={start} end={end} />);
                return segments;
              }, [])}
              <View style={[styles.donutHole, { backgroundColor: colors.surface }]}>
                <AppText style={styles.donutValue}>{compactCurrency(categoryTotal, 'VND')}</AppText>
                <AppText variant="caption">Spent</AppText>
              </View>
            </View>
            <View style={styles.legend}>
              {categories.map((item) => (
                <View key={item.category.id} style={styles.legendRow}>
                  <View style={[styles.legendDot, { backgroundColor: item.category.color }]} />
                  <AppText style={styles.legendLabel}>{item.category.name}</AppText>
                  <AppText variant="caption">{Math.round((item.amount / categoryTotal) * 100)}%</AppText>
                  <AppText variant="caption" style={styles.legendAmount}>
                    {compactCurrency(item.amount, 'VND')}
                  </AppText>
                </View>
              ))}
            </View>
          </View>
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
  donutSection: {
    alignItems: 'center',
    gap: 16,
  },
  donut: {
    borderRadius: 80,
    height: 160,
    overflow: 'hidden',
    position: 'relative',
    width: 160,
  },
  segmentContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  segmentClip: {
    height: 160,
    overflow: 'hidden',
    position: 'absolute',
    right: 0,
    top: 0,
    width: 80,
  },
  segmentClipWide: {
    left: 0,
    right: undefined,
    width: 160,
  },
  segment: {
    borderBottomLeftRadius: 80,
    borderTopLeftRadius: 80,
    height: 160,
    left: -80,
    position: 'absolute',
    top: 0,
    transformOrigin: 'right center',
    width: 80,
  },
  donutHole: {
    alignItems: 'center',
    borderRadius: 52,
    height: 104,
    justifyContent: 'center',
    left: 28,
    position: 'absolute',
    top: 28,
    width: 104,
  },
  donutValue: {
    fontSize: 13,
    fontWeight: '800',
  },
  legend: {
    alignSelf: 'stretch',
    gap: 10,
  },
  legendRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  legendDot: {
    borderRadius: 999,
    height: 10,
    width: 10,
  },
  legendLabel: {
    flex: 1,
    fontWeight: '800',
  },
  legendAmount: {
    textAlign: 'right',
    width: 72,
  },
});
