import React from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
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

export function TransactionsScreen() {
  const navigation = useNavigation<Navigation>();
  const { state } = useFinance();
  const { colors } = useAppTheme();
  const [query, setQuery] = React.useState('');
  const [typeFilter, setTypeFilter] = React.useState<TransactionType | 'all'>('all');
  const [fromDate, setFromDate] = React.useState('');
  const [toDate, setToDate] = React.useState('');
  const fromFilterDate = parseDateFilter(fromDate);
  const toFilterDate = parseDateFilter(toDate, true);
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

  return (
    <Screen>
      <View style={styles.header}>
        <View>
          <AppText variant="caption">Ledger</AppText>
          <AppText variant="title">Transactions</AppText>
        </View>
      </View>

      <PrimaryButton label="Add transaction" icon="add-circle-outline" onPress={() => navigation.navigate('AddTransaction')} />

      <View style={styles.filters}>
        <TextInput
          placeholder="Search note, account, category"
          placeholderTextColor={colors.muted}
          value={query}
          onChangeText={setQuery}
          style={[styles.searchInput, { borderColor: colors.border, color: colors.text, backgroundColor: colors.surface }]}
        />
        <View style={styles.segment}>
          {[
            ['all', 'All'],
            ['income', 'Income'],
            ['expense', 'Expense'],
            ['transfer', 'Transfer'],
          ].map(([value, label]) => {
            const selected = typeFilter === value;
            return (
              <Pressable
                key={value}
                style={[styles.segmentItem, { borderColor: selected ? colors.primary : colors.border, backgroundColor: selected ? colors.primary : colors.surface }]}
                onPress={() => setTypeFilter(value as TransactionType | 'all')}
              >
                <AppText color={selected ? '#FFFFFF' : colors.text} style={styles.segmentText}>
                  {label}
                </AppText>
              </Pressable>
            );
          })}
        </View>
        <View style={styles.dateFilters}>
          <TextInput
            placeholder="From YYYY-MM-DD"
            placeholderTextColor={colors.muted}
            value={fromDate}
            onChangeText={setFromDate}
            style={[styles.dateInput, { borderColor: colors.border, color: colors.text, backgroundColor: colors.surface }]}
          />
          <TextInput
            placeholder="To YYYY-MM-DD"
            placeholderTextColor={colors.muted}
            value={toDate}
            onChangeText={setToDate}
            style={[styles.dateInput, { borderColor: colors.border, color: colors.text, backgroundColor: colors.surface }]}
          />
        </View>
        {fromDate || toDate ? (
          <Pressable style={[styles.clearButton, { borderColor: colors.border }]} onPress={() => {
            setFromDate('');
            setToDate('');
          }}>
            <AppText color={colors.primary} style={styles.clearButtonText}>Clear date filter</AppText>
          </Pressable>
        ) : null}
      </View>

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
  segment: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  segmentItem: {
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 40,
    paddingHorizontal: 12,
  },
  segmentText: {
    fontWeight: '800',
  },
  dateFilters: {
    flexDirection: 'row',
    gap: 8,
  },
  dateInput: {
    borderRadius: 14,
    borderWidth: 1,
    flex: 1,
    fontSize: 13,
    minHeight: 44,
    paddingHorizontal: 10,
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
});
