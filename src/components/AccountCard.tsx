import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { Account } from '../models/finance';
import { formatCurrency } from '../utils/currency';
import { AppText } from './AppText';
import { Card } from './Card';
import { IconBadge } from './IconBadge';

interface AccountCardProps {
  account: Account;
  convertedBalance?: string;
}

export function AccountCard({ account, convertedBalance }: AccountCardProps) {
  return (
    <Card style={styles.card}>
      <View style={styles.row}>
        <IconBadge name={account.icon as keyof typeof Ionicons.glyphMap} color={account.color} />
        <View style={styles.details}>
          <AppText variant="body" style={styles.name}>
            {account.name}
          </AppText>
          <AppText variant="caption">{account.type.toUpperCase()}</AppText>
        </View>
        <View style={styles.amounts}>
          <AppText variant="body" style={styles.balance}>
            {formatCurrency(account.balance, account.currency)}
          </AppText>
          {convertedBalance ? <AppText variant="caption">{convertedBalance}</AppText> : null}
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
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
});
