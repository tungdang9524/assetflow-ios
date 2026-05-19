import React, { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
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

const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export function CalendarScreen() {
  const { state } = useFinance();
  const { colors } = useAppTheme();
  const [visibleMonth, setVisibleMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [pickerMonth, setPickerMonth] = useState(visibleMonth.getMonth());
  const [pickerYear, setPickerYear] = useState(visibleMonth.getFullYear());
  const monthKey = getMonthKey(visibleMonth);
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 101 }, (_, index) => currentYear - 50 + index);
  const firstDay = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), 1);
  const daysInMonth = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 0).getDate();
  const leadingBlankDays = (firstDay.getDay() + 6) % 7;
  const todayKey = getDateKey(new Date());
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

  function openMonthPicker() {
    setPickerMonth(visibleMonth.getMonth());
    setPickerYear(visibleMonth.getFullYear());
    setIsPickerOpen(true);
  }

  function applyMonthPicker() {
    setVisibleMonth(new Date(pickerYear, pickerMonth, 1));
    setIsPickerOpen(false);
  }

  return (
    <Screen>
      <View style={styles.header}>
        <Pressable style={({ pressed }) => [styles.titleButton, { opacity: pressed ? 0.72 : 1 }]} onPress={openMonthPicker}>
          <View style={styles.titleText}>
            <AppText variant="caption">{formatMonthLabel(monthKey)}</AppText>
            <AppText variant="title">Calendar</AppText>
          </View>
          <Ionicons name="chevron-down" size={18} color={colors.muted} />
        </Pressable>
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

      <Modal animationType="fade" transparent visible={isPickerOpen} onRequestClose={() => setIsPickerOpen(false)}>
        <View style={styles.modalScrim}>
          <View style={[styles.pickerCard, { backgroundColor: colors.surface }]}>
            <View style={styles.pickerHeader}>
              <AppText variant="heading">Select month</AppText>
              <Pressable style={[styles.pickerClose, { borderColor: colors.border }]} onPress={() => setIsPickerOpen(false)}>
                <AppText style={styles.pickerCloseText}>Close</AppText>
              </Pressable>
            </View>
            <View style={styles.pickerColumns}>
              <ScrollView style={styles.pickerColumn} showsVerticalScrollIndicator={false}>
                {monthNames.map((month, index) => {
                  const selected = pickerMonth === index;

                  return (
                    <Pressable
                      key={month}
                      style={[styles.pickerOption, { backgroundColor: selected ? colors.primarySoft : colors.surface }]}
                      onPress={() => setPickerMonth(index)}
                    >
                      <AppText color={selected ? colors.primary : colors.text} style={styles.pickerOptionText}>
                        {month}
                      </AppText>
                    </Pressable>
                  );
                })}
              </ScrollView>
              <ScrollView style={styles.pickerColumn} showsVerticalScrollIndicator={false}>
                {yearOptions.map((year) => {
                  const selected = pickerYear === year;

                  return (
                    <Pressable
                      key={year}
                      style={[styles.pickerOption, { backgroundColor: selected ? colors.primarySoft : colors.surface }]}
                      onPress={() => setPickerYear(year)}
                    >
                      <AppText color={selected ? colors.primary : colors.text} style={styles.pickerOptionText}>
                        {year}
                      </AppText>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>
            <Pressable style={({ pressed }) => [styles.applyButton, { backgroundColor: colors.primary, opacity: pressed ? 0.82 : 1 }]} onPress={applyMonthPicker}>
              <AppText color="#FFFFFF" style={styles.applyButtonText}>
                Apply
              </AppText>
            </Pressable>
          </View>
        </View>
      </Modal>

      <View style={styles.weekHeader}>
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
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
          const isToday = summary.dateKey === todayKey;

          return (
            <View
              key={summary.dateKey}
              style={[
                styles.dayCell,
                {
                  backgroundColor: colors.surface,
                  borderColor: isToday ? colors.primary : hasActivity ? colors.accent : colors.border,
                  borderWidth: isToday ? 2 : 1,
                },
              ]}
            >
              <AppText color={isToday ? colors.primary : colors.text} style={[styles.dayNumber, isToday ? styles.todayNumber : undefined]}>
                {summary.day}
              </AppText>
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
  titleButton: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  titleText: {
    gap: 0,
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
  todayNumber: {
    fontSize: 16,
    fontWeight: '900',
  },
  amounts: {
    gap: 2,
    marginTop: 4,
  },
  amountText: {
    fontSize: 8,
    lineHeight: 10,
  },
  modalScrim: {
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.42)',
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  pickerCard: {
    borderRadius: 18,
    gap: 14,
    maxHeight: '78%',
    padding: 16,
    width: '100%',
  },
  pickerHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  pickerClose: {
    alignItems: 'center',
    borderRadius: 999,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 36,
    paddingHorizontal: 12,
  },
  pickerCloseText: {
    fontWeight: '800',
  },
  pickerColumns: {
    flexDirection: 'row',
    gap: 10,
    minHeight: 260,
  },
  pickerColumn: {
    flex: 1,
  },
  pickerOption: {
    borderRadius: 12,
    justifyContent: 'center',
    marginBottom: 6,
    minHeight: 44,
    paddingHorizontal: 12,
  },
  pickerOptionText: {
    fontWeight: '800',
  },
  applyButton: {
    alignItems: 'center',
    borderRadius: 16,
    justifyContent: 'center',
    minHeight: 50,
  },
  applyButtonText: {
    fontWeight: '800',
  },
});
