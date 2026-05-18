import React, { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { AppText } from '../components/AppText';
import { Screen } from '../components/Screen';
import { Transaction } from '../models/finance';
import { useFinance } from '../store/FinanceStore';
import { useAppTheme } from '../theme/AppThemeProvider';
import { convertCurrency, formatCurrency } from '../utils/currency';
import { formatMonthLabel, getMonthKey } from '../utils/dates';

interface DaySummary {
  day: number;
  dateKey: string;
  income: number;
  expense: number;
  transfer: number;
  transactions: Transaction[];
}

function getDateKey(date: Date) {
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

export function CalendarScreen() {
  const { state } = useFinance();
  const { colors } = useAppTheme();
  const [visibleMonth, setVisibleMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const monthKey = getMonthKey(visibleMonth);
  const firstDay = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), 1);
  const daysInMonth = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 0).getDate();
  const leadingBlankDays = firstDay.getDay();
  const daySummaries = Array.from({ length: daysInMonth }).map<DaySummary>((_, index) => {
    const day = index + 1;
    const date = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), day);
    const dateKey = getDateKey(date);
    const transactions = state.transactions.filter((transaction) => getDateKey(new Date(transaction.date)) === dateKey);

    return transactions.reduce<DaySummary>(
      (summary, transaction) => {
        const amount = convertCurrency(transaction.amount, transaction.currency, 'VND', state.settings.usdToVndRate);

        if (transaction.type === 'income') {
          summary.income += amount;
        }

        if (transaction.type === 'expense') {
          summary.expense += amount;
        }

        if (transaction.type === 'transfer') {
          summary.transfer += amount;
        }

        return summary;
      },
      { day, dateKey, income: 0, expense: 0, transfer: 0, transactions },
    );
  });

  return (
    <Screen>
      <View style={styles.header}>
        <View>
          <AppText variant="caption">{formatMonthLabel(monthKey)}</AppText>
          <AppText variant="title">Calendar</AppText>
        </View>
        <View style={styles.monthActions}>
          <Pressable
            style={[styles.monthButton, { borderColor: colors.border, backgroundColor: colors.surface }]}
            onPress={() => setVisibleMonth((month) => new Date(month.getFullYear(), month.getMonth() - 1, 1))}
          >
            <Ionicons name="chevron-back" size={20} color={colors.text} />
          </Pressable>
          <Pressable
            style={[styles.monthButton, { borderColor: colors.border, backgroundColor: colors.surface }]}
            onPress={() => setVisibleMonth((month) => new Date(month.getFullYear(), month.getMonth() + 1, 1))}
          >
            <Ionicons name="chevron-forward" size={20} color={colors.text} />
          </Pressable>
        </View>
      </View>

      <View style={styles.weekHeader}>
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <AppText key={day} variant="caption" style={styles.weekLabel}>
            {day}
          </AppText>
        ))}
      </View>

      <View style={styles.grid}>
        {Array.from({ length: leadingBlankDays }).map((_, index) => (
          <View key={`blank-${index}`} style={styles.dayCell} />
        ))}

        {daySummaries.map((summary) => {
          const hasActivity = summary.transactions.length > 0;

          return (
            <View
              key={summary.dateKey}
              style={[
                styles.dayCell,
                {
                  backgroundColor: colors.surface,
                  borderColor: hasActivity ? colors.primary : colors.border,
                },
              ]}
            >
              <AppText style={styles.dayNumber}>{summary.day}</AppText>
              <View style={styles.amounts}>
                {summary.income > 0 ? (
                  <AppText variant="caption" color={colors.primary} style={styles.amountText}>
                    +{formatCurrency(summary.income, 'VND')}
                  </AppText>
                ) : null}
                {summary.expense > 0 ? (
                  <AppText variant="caption" color={colors.danger} style={styles.amountText}>
                    -{formatCurrency(summary.expense, 'VND')}
                  </AppText>
                ) : null}
                {summary.transfer > 0 ? (
                  <AppText variant="caption" color={colors.accent} style={styles.amountText}>
                    {formatCurrency(summary.transfer, 'VND')}
                  </AppText>
                ) : null}
              </View>
            </View>
          );
        })}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  monthActions: {
    flexDirection: 'row',
    gap: 8,
  },
  monthButton: {
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  weekHeader: {
    flexDirection: 'row',
  },
  weekLabel: {
    flex: 1,
    textAlign: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    borderRadius: 10,
    borderWidth: 1,
    minHeight: 92,
    padding: 6,
    width: `${100 / 7}%`,
  },
  dayNumber: {
    fontSize: 13,
    fontWeight: '800',
    lineHeight: 17,
  },
  amounts: {
    gap: 2,
    marginTop: 4,
  },
  amountText: {
    fontSize: 8,
    lineHeight: 10,
  },
});
