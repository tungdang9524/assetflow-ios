import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { Account, Category, Transaction } from '../models/finance';
import { useAppTheme } from '../theme/AppThemeProvider';
import { formatCurrency } from '../utils/currency';
import { formatShortDate } from '../utils/dates';
import { AppText } from './AppText';
import { IconBadge } from './IconBadge';

interface TransactionRowProps {
  transaction: Transaction;
  account?: Account;
  toAccount?: Account;
  category?: Category;
}

export function TransactionRow({ transaction, account, toAccount, category }: TransactionRowProps) {
  const { colors } = useAppTheme();
  const isIncome = transaction.type === 'income';
  const isTransfer = transaction.type === 'transfer';
  const title = isTransfer ? `${account?.name ?? 'Account'} to ${toAccount?.name ?? 'Account'}` : category?.name ?? 'Uncategorized';
  const icon = isTransfer ? 'swap-horizontal-outline' : category?.icon ?? 'ellipse-outline';
  const iconColor = isTransfer ? colors.accent : category?.color ?? colors.muted;
  const amountPrefix = isIncome ? '+' : transaction.type === 'expense' ? '-' : '';
  const amountColor = isIncome ? colors.primary : transaction.type === 'expense' ? colors.danger : colors.text;

  return (
    <View style={styles.row}>
      <IconBadge name={icon as keyof typeof Ionicons.glyphMap} color={iconColor} size={20} />
      <View style={styles.content}>
        <AppText variant="body" style={styles.title}>
          {title}
        </AppText>
        <AppText variant="caption">
          {formatShortDate(transaction.date)} - {transaction.note || account?.name || 'No note'}
        </AppText>
      </View>
      <AppText variant="body" color={amountColor} style={styles.amount}>
        {amountPrefix}
        {formatCurrency(transaction.amount, transaction.currency)}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    minHeight: 58,
  },
  content: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontWeight: '700',
  },
  amount: {
    fontWeight: '800',
    maxWidth: 124,
    textAlign: 'right',
  },
});
