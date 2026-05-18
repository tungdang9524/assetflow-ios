import React from 'react';
import { StyleSheet, View } from 'react-native';

import { AccountCard } from '../components/AccountCard';
import { AppText } from '../components/AppText';
import { Card } from '../components/Card';
import { Screen } from '../components/Screen';
import { SectionHeader } from '../components/SectionHeader';
import { useFinance } from '../store/FinanceStore';
import { getNetWorthVnd } from '../utils/calculations';
import { convertCurrency, formatCurrency } from '../utils/currency';

export function AccountsScreen() {
  const { state } = useFinance();
  const netWorth = getNetWorthVnd(state.accounts, state.settings.usdToVndRate);

  return (
    <Screen>
      <View>
        <AppText variant="caption">Accounts</AppText>
        <AppText variant="title">Money buckets</AppText>
      </View>

      <Card style={styles.totalCard}>
        <AppText variant="caption">Total converted value</AppText>
        <AppText variant="title">{formatCurrency(netWorth, 'VND')}</AppText>
      </Card>

      <SectionHeader title="All accounts" />
      <View style={styles.list}>
        {state.accounts.map((account) => (
          <AccountCard
            key={account.id}
            account={account}
            convertedBalance={
              account.currency === 'USD'
                ? `${formatCurrency(convertCurrency(account.balance, 'USD', 'VND', state.settings.usdToVndRate), 'VND')} converted`
                : undefined
            }
          />
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  totalCard: {
    gap: 8,
  },
  list: {
    gap: 12,
  },
});
