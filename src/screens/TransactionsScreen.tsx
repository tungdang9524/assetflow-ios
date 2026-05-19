import React from 'react';
import { Modal, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';

import { AppText } from '../components/AppText';
import { Card } from '../components/Card';
import { PrimaryButton } from '../components/PrimaryButton';
import { Screen } from '../components/Screen';
import { TransactionRow } from '../components/TransactionRow';
import { TransactionsStackParamList } from '../navigation/types';
import { useFinance } from '../store/FinanceStore';
import { useAppTheme } from '../theme/AppThemeProvider';
import { TransactionType } from '../models/finance';

type Navigation = NativeStackNavigationProp<TransactionsStackParamList, 'TransactionsList'>;
const transactionTypeOptions: Array<{ label: string; value: TransactionType | 'all' }> = [
  { label: 'All', value: 'all' },
  { label: 'Income', value: 'income' },
  { label: 'Expense', value: 'expense' },
  { label: 'Transfer', value: 'transfer' },
];

function getDateKey(date: Date) {
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

function parseDateFilter(value: string, endOfDay = false) {
  const trimmed = value.trim();

  if (!trimmed) {
    return undefined;
  }

  const [year, month, day] = trimmed.split('-').map(Number);

  if (!year || !month || !day) {
    return undefined;
  }

  return new Date(year, month - 1, day, endOfDay ? 23 : 0, endOfDay ? 59 : 0, endOfDay ? 59 : 0, endOfDay ? 999 : 0);
}

function formatDateHeader(dateKey: string) {
  const [year, month, day] = dateKey.split('-').map(Number);

  return new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(year, month - 1, day));
}

function formatMonthLabel(date: Date) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    year: 'numeric',
  }).format(date);
}

export function TransactionsScreen() {
  const navigation = useNavigation<Navigation>();
  const { state } = useFinance();
  const { colors } = useAppTheme();
  const [query, setQuery] = React.useState('');
  const [typeFilter, setTypeFilter] = React.useState<TransactionType | 'all'>('all');
  const [isTypeDropdownOpen, setIsTypeDropdownOpen] = React.useState(false);
  const [fromDate, setFromDate] = React.useState('');
  const [toDate, setToDate] = React.useState('');
  const [isDatePickerOpen, setIsDatePickerOpen] = React.useState(false);
  const [pickerMonth, setPickerMonth] = React.useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [draftFromDate, setDraftFromDate] = React.useState('');
  const [draftToDate, setDraftToDate] = React.useState('');
  const fromFilterDate = parseDateFilter(fromDate);
  const toFilterDate = parseDateFilter(toDate, true);
  const rangeLabel = fromDate && toDate ? `${fromDate} to ${toDate}` : fromDate ? `${fromDate} onward` : 'Choose date range';
  const selectedTypeLabel = transactionTypeOptions.find((option) => option.value === typeFilter)?.label ?? 'All';
  const firstPickerDay = new Date(pickerMonth.getFullYear(), pickerMonth.getMonth(), 1);
  const pickerDaysInMonth = new Date(pickerMonth.getFullYear(), pickerMonth.getMonth() + 1, 0).getDate();
  const pickerLeadingBlankDays = (firstPickerDay.getDay() + 6) % 7;
  const pickerDayKeys = Array.from({ length: pickerDaysInMonth }, (_, index) => getDateKey(new Date(pickerMonth.getFullYear(), pickerMonth.getMonth(), index + 1)));
  const filteredTransactions = state.transactions.filter((transaction) => {
    const account = state.accounts.find((item) => item.id === transaction.accountId);
    const category = state.categories.find((item) => item.id === transaction.categoryId);
    const transactionDate = new Date(transaction.date);
    const haystack = `${transaction.note ?? ''} ${account?.name ?? ''} ${category?.name ?? ''}`.toLowerCase();
    const matchesQuery = query.trim().length === 0 || haystack.includes(query.trim().toLowerCase());
    const matchesType = typeFilter === 'all' || transaction.type === typeFilter;
    const matchesFromDate = !fromFilterDate || transactionDate >= fromFilterDate;
    const matchesToDate = !toFilterDate || transactionDate <= toFilterDate;

    return matchesQuery && matchesType && matchesFromDate && matchesToDate;
  }).sort((first, second) => new Date(second.date).getTime() - new Date(first.date).getTime());
  const groupedTransactions = filteredTransactions.reduce<Array<{ dateKey: string; transactions: typeof filteredTransactions }>>((groups, transaction) => {
    const dateKey = getDateKey(new Date(transaction.date));
    const existingGroup = groups.find((group) => group.dateKey === dateKey);

    if (existingGroup) {
      existingGroup.transactions.push(transaction);
      return groups;
    }

    groups.push({ dateKey, transactions: [transaction] });
    return groups;
  }, []);

  function openDateRangePicker() {
    setDraftFromDate(fromDate);
    setDraftToDate(toDate);
    setPickerMonth(parseDateFilter(fromDate) ?? new Date(new Date().getFullYear(), new Date().getMonth(), 1));
    setIsDatePickerOpen(true);
  }

  function selectRangeDate(dateKey: string) {
    if (!draftFromDate || draftToDate || dateKey < draftFromDate) {
      setDraftFromDate(dateKey);
      setDraftToDate('');
      return;
    }

    if (dateKey === draftFromDate) {
      setDraftToDate('');
      return;
    }

    setDraftToDate(dateKey);
  }

  function applyDateRange() {
    setFromDate(draftFromDate);
    setToDate(draftToDate);
    setIsDatePickerOpen(false);
  }

  function clearDateRange() {
    setFromDate('');
    setToDate('');
    setDraftFromDate('');
    setDraftToDate('');
  }

  return (
    <Screen>
      <View style={styles.header}>
        <View>
          <AppText variant="caption">Ledger</AppText>
          <AppText variant="title">Transactions</AppText>
        </View>
        <Pressable
          accessibilityLabel="Add transaction"
          style={({ pressed }) => [styles.iconButton, { backgroundColor: colors.primary, opacity: pressed ? 0.82 : 1 }]}
          onPress={() => navigation.navigate('AddTransaction')}
        >
          <Ionicons name="add" size={24} color="#FFFFFF" />
        </Pressable>
      </View>

      <View style={styles.filters}>
        <TextInput
          placeholder="Search note, account, category"
          placeholderTextColor={colors.muted}
          value={query}
          onChangeText={setQuery}
          style={[styles.searchInput, { borderColor: colors.border, color: colors.text, backgroundColor: colors.surface }]}
        />
        <View style={styles.filterRow}>
          <View style={styles.typeFilter}>
            <Pressable style={[styles.typeButton, { borderColor: colors.border, backgroundColor: colors.surface }]} onPress={() => setIsTypeDropdownOpen((value) => !value)}>
              <View>
                <AppText variant="caption">Type</AppText>
                <AppText style={styles.typeText}>{selectedTypeLabel}</AppText>
              </View>
              <Ionicons name={isTypeDropdownOpen ? 'chevron-up' : 'chevron-down'} size={18} color={colors.primary} />
            </Pressable>
            {isTypeDropdownOpen ? (
              <View style={[styles.typeDropdown, { borderColor: colors.border, backgroundColor: colors.surface }]}>
                {transactionTypeOptions.map((option, index) => {
                  const selected = typeFilter === option.value;

                  return (
                    <Pressable
                      key={option.value}
                      style={[styles.typeOption, { borderBottomColor: colors.border, borderBottomWidth: index === transactionTypeOptions.length - 1 ? 0 : StyleSheet.hairlineWidth }]}
                      onPress={() => {
                        setTypeFilter(option.value);
                        setIsTypeDropdownOpen(false);
                      }}
                    >
                      <AppText color={selected ? colors.primary : colors.text} style={styles.typeOptionText}>{option.label}</AppText>
                    </Pressable>
                  );
                })}
              </View>
            ) : null}
          </View>
          <Pressable style={[styles.rangeButton, { borderColor: colors.border, backgroundColor: colors.surface }]} onPress={() => {
            setIsTypeDropdownOpen(false);
            openDateRangePicker();
          }}>
            <View style={styles.rangeCopy}>
              <AppText variant="caption">Date range</AppText>
              <AppText color={fromDate ? colors.text : colors.muted} numberOfLines={1} style={styles.rangeText}>{rangeLabel}</AppText>
            </View>
            <Ionicons name="calendar-outline" size={18} color={colors.primary} />
          </Pressable>
        </View>
        {fromDate || toDate ? (
          <Pressable style={[styles.clearButton, { borderColor: colors.border }]} onPress={clearDateRange}>
            <AppText color={colors.primary} style={styles.clearButtonText}>Clear date filter</AppText>
          </Pressable>
        ) : null}
      </View>

      <Modal animationType="fade" transparent visible={isDatePickerOpen} onRequestClose={() => setIsDatePickerOpen(false)}>
        <View style={styles.modalScrim}>
          <View style={[styles.rangeCard, { backgroundColor: colors.surface }]}>
            <View style={styles.rangeHeader}>
              <AppText variant="heading">Date range</AppText>
              <Pressable style={[styles.closeButton, { borderColor: colors.border }]} onPress={() => setIsDatePickerOpen(false)}>
                <AppText style={styles.closeButtonText}>Close</AppText>
              </Pressable>
            </View>
            <View style={styles.monthNav}>
              <Pressable style={[styles.monthButton, { borderColor: colors.border }]} onPress={() => setPickerMonth((month) => new Date(month.getFullYear(), month.getMonth() - 1, 1))}>
                <AppText style={styles.monthButtonText}>‹</AppText>
              </Pressable>
              <AppText style={styles.monthTitle}>{formatMonthLabel(pickerMonth)}</AppText>
              <Pressable style={[styles.monthButton, { borderColor: colors.border }]} onPress={() => setPickerMonth((month) => new Date(month.getFullYear(), month.getMonth() + 1, 1))}>
                <AppText style={styles.monthButtonText}>›</AppText>
              </Pressable>
            </View>
            <View style={styles.weekHeader}>
              {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, index) => (
                <AppText key={`${day}-${index}`} variant="caption" style={styles.weekLabel}>{day}</AppText>
              ))}
            </View>
            <View style={styles.dateGrid}>
              {Array.from({ length: pickerLeadingBlankDays }).map((_, index) => (
                <View key={`blank-${index}`} style={styles.dateCell} />
              ))}
              {pickerDayKeys.map((dateKey) => {
                const day = Number(dateKey.slice(-2));
                const isStart = dateKey === draftFromDate;
                const isEnd = dateKey === draftToDate;
                const inRange = Boolean(draftFromDate && draftToDate && dateKey > draftFromDate && dateKey < draftToDate);
                const selected = isStart || isEnd;

                return (
                  <Pressable
                    key={dateKey}
                    style={[
                      styles.dateCell,
                      {
                        backgroundColor: selected ? colors.primary : inRange ? colors.primarySoft : colors.surface,
                        borderColor: selected || inRange ? colors.primary : colors.border,
                      },
                    ]}
                    onPress={() => selectRangeDate(dateKey)}
                  >
                    <AppText color={selected ? '#FFFFFF' : colors.text} style={styles.dateCellText}>{day}</AppText>
                  </Pressable>
                );
              })}
            </View>
            <AppText variant="caption">{draftFromDate ? (draftToDate ? `${draftFromDate} to ${draftToDate}` : `Start: ${draftFromDate}`) : 'Select a start date, then an end date.'}</AppText>
            <View style={styles.rangeActions}>
              <Pressable style={[styles.secondaryRangeButton, { borderColor: colors.border }]} onPress={() => {
                setDraftFromDate('');
                setDraftToDate('');
              }}>
                <AppText style={styles.clearButtonText}>Clear</AppText>
              </Pressable>
              <Pressable style={[styles.applyButton, { backgroundColor: colors.primary }]} onPress={applyDateRange}>
                <AppText color="#FFFFFF" style={styles.applyButtonText}>Apply</AppText>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <View style={styles.groupList}>
        {groupedTransactions.map((group) => (
          <Card key={group.dateKey} style={styles.card}>
            <AppText variant="caption" style={styles.dateHeader}>{formatDateHeader(group.dateKey)}</AppText>
            {group.transactions.map((transaction) => (
              <Pressable key={transaction.id} onPress={() => navigation.navigate('AddTransaction', { transactionId: transaction.id })}>
                <TransactionRow
                  transaction={transaction}
                  account={state.accounts.find((account) => account.id === transaction.accountId)}
                  toAccount={state.accounts.find((account) => account.id === transaction.toAccountId)}
                  category={state.categories.find((category) => category.id === transaction.categoryId)}
                  hideDate
                />
              </Pressable>
            ))}
          </Card>
        ))}
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
  iconButton: {
    alignItems: 'center',
    borderRadius: 16,
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  card: {
    gap: 16,
  },
  groupList: {
    gap: 12,
  },
  dateHeader: {
    fontWeight: '800',
  },
  filters: {
    gap: 10,
  },
  searchInput: {
    borderRadius: 14,
    borderWidth: 1,
    fontSize: 15,
    minHeight: 48,
    paddingHorizontal: 12,
  },
  filterRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 8,
  },
  typeFilter: {
    flex: 0.82,
    position: 'relative',
    zIndex: 2,
  },
  typeButton: {
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 54,
    paddingHorizontal: 12,
  },
  typeText: {
    fontWeight: '800',
  },
  typeDropdown: {
    borderRadius: 14,
    borderWidth: 1,
    left: 0,
    overflow: 'hidden',
    position: 'absolute',
    right: 0,
    top: 60,
  },
  typeOption: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 44,
    paddingHorizontal: 12,
  },
  typeOptionText: {
    fontWeight: '800',
  },
  rangeButton: {
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    flex: 1.18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 54,
    paddingHorizontal: 12,
  },
  rangeCopy: {
    flex: 1,
    minWidth: 0,
  },
  rangeText: {
    fontWeight: '800',
  },
  clearButton: {
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 40,
  },
  clearButtonText: {
    fontWeight: '800',
  },
  modalScrim: {
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.42)',
    flex: 1,
    justifyContent: 'center',
    padding: 18,
  },
  rangeCard: {
    borderRadius: 18,
    gap: 14,
    padding: 16,
    width: '100%',
  },
  rangeHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  closeButton: {
    alignItems: 'center',
    borderRadius: 999,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 36,
    paddingHorizontal: 12,
  },
  closeButtonText: {
    fontWeight: '800',
  },
  monthNav: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  monthButton: {
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    height: 38,
    justifyContent: 'center',
    width: 38,
  },
  monthButtonText: {
    fontSize: 24,
    fontWeight: '800',
    lineHeight: 28,
  },
  monthTitle: {
    fontWeight: '900',
  },
  weekHeader: {
    flexDirection: 'row',
  },
  weekLabel: {
    flex: 1,
    textAlign: 'center',
  },
  dateGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 0,
  },
  dateCell: {
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 1,
    height: 42,
    justifyContent: 'center',
    width: `${100 / 7}%`,
  },
  dateCellText: {
    fontWeight: '800',
  },
  rangeActions: {
    flexDirection: 'row',
    gap: 10,
  },
  secondaryRangeButton: {
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    flex: 1,
    justifyContent: 'center',
    minHeight: 46,
  },
  applyButton: {
    alignItems: 'center',
    borderRadius: 14,
    flex: 1,
    justifyContent: 'center',
    minHeight: 46,
  },
  applyButtonText: {
    fontWeight: '800',
  },
});
