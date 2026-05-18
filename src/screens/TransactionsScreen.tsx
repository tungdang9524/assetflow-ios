import React from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
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

export function TransactionsScreen() {
  const navigation = useNavigation<Navigation>();
  const { state } = useFinance();
  const { colors } = useAppTheme();
  const [query, setQuery] = React.useState('');
  const [typeFilter, setTypeFilter] = React.useState<TransactionType | 'all'>('all');
  const filteredTransactions = state.transactions.filter((transaction) => {
    const account = state.accounts.find((item) => item.id === transaction.accountId);
    const category = state.categories.find((item) => item.id === transaction.categoryId);
    const haystack = `${transaction.note ?? ''} ${account?.name ?? ''} ${category?.name ?? ''}`.toLowerCase();
    const matchesQuery = query.trim().length === 0 || haystack.includes(query.trim().toLowerCase());
    const matchesType = typeFilter === 'all' || transaction.type === typeFilter;

    return matchesQuery && matchesType;
  });

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
          <Ionicons name="add" size={26} color="#FFFFFF" />
        </Pressable>
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
      </View>

      <Card style={styles.card}>
        {filteredTransactions.map((transaction) => (
          <Pressable key={transaction.id} onPress={() => navigation.navigate('AddTransaction', { transactionId: transaction.id })}>
            <TransactionRow
              transaction={transaction}
              account={state.accounts.find((account) => account.id === transaction.accountId)}
              toAccount={state.accounts.find((account) => account.id === transaction.toAccountId)}
              category={state.categories.find((category) => category.id === transaction.categoryId)}
            />
          </Pressable>
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
  iconButton: {
    alignItems: 'center',
    borderRadius: 18,
    height: 52,
    justifyContent: 'center',
    width: 52,
  },
  card: {
    gap: 16,
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
});
