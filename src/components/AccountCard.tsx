import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { Account } from '../models/finance';
import { formatCryptoAmount, formatCurrency } from '../utils/currency';
import { formatAccountType } from '../utils/labels';
import { AppText } from './AppText';
import { Card } from './Card';
import { IconBadge } from './IconBadge';
import { ProgressBar } from './ProgressBar';

interface AccountCardProps {
  account: Account;
  convertedBalance?: string;
}

export function AccountCard({ account, convertedBalance }: AccountCardProps) {
  const primaryBalance =
    account.type === 'crypto' ? formatCryptoAmount(account.balance, account.cryptoSymbol) : formatCurrency(account.balance, account.currency);
  const typeLabel = account.type === 'crypto' && account.cryptoName ? account.cryptoName : formatAccountType(account.type);
  const creditDebt = account.type === 'credit' ? Math.max(-account.balance, 0) : 0;
  const creditUtilization = account.type === 'credit' && account.creditLimit ? creditDebt / account.creditLimit : 0;

  return (
    <Card style={styles.card}>
      <View style={styles.row}>
        <IconBadge name={account.icon as keyof typeof Ionicons.glyphMap} color={account.color} />
        <View style={styles.details}>
          <AppText variant="body" style={styles.name}>
            {account.name}
          </AppText>
          <AppText variant="caption">{typeLabel}</AppText>
        </View>
        <View style={styles.amounts}>
          <AppText variant="body" style={styles.balance}>
            {primaryBalance}
          </AppText>
          {convertedBalance ? <AppText variant="caption">{convertedBalance}</AppText> : null}
        </View>
      </View>
      {account.type === 'credit' ? (
        <View style={styles.creditBlock}>
          <View style={styles.creditLine}>
            <AppText variant="caption">Used {formatCurrency(creditDebt, account.currency)}</AppText>
            <AppText variant="caption">
              Limit {account.creditLimit ? formatCurrency(account.creditLimit, account.currency) : 'Not set'}
            </AppText>
          </View>
          <ProgressBar percent={creditUtilization} color={account.color} />
          <View style={styles.creditLine}>
            <AppText variant="caption">Statement day {account.statementDay ?? '-'}</AppText>
            <AppText variant="caption">Due day {account.paymentDueDay ?? '-'}</AppText>
          </View>
        </View>
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: 12,
    padding: 14,
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
  },
  details: {
    flex: 1,
    gap: 2,
  },
  name: {
    fontWeight: '700',
  },
  amounts: {
    alignItems: 'flex-end',
    gap: 2,
  },
  balance: {
    fontWeight: '800',
  },
  creditBlock: {
    gap: 8,
  },
  creditLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
});
