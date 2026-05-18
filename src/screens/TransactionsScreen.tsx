import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
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

type Navigation = NativeStackNavigationProp<TransactionsStackParamList, 'TransactionsList'>;

export function TransactionsScreen() {
  const navigation = useNavigation<Navigation>();
  const { state } = useFinance();
  const { colors } = useAppTheme();

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

      <Card style={styles.card}>
        {state.transactions.map((transaction) => (
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
});
