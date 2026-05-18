import React, { useState } from 'react';
import { Alert, Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';

import { AccountCard } from '../components/AccountCard';
import { AppText } from '../components/AppText';
import { Card } from '../components/Card';
import { Screen } from '../components/Screen';
import { SectionHeader } from '../components/SectionHeader';
import { AccountsStackParamList } from '../navigation/types';
import { useFinance } from '../store/FinanceStore';
import { getNetWorthVnd } from '../utils/calculations';
import { convertCurrency, formatCurrency } from '../utils/currency';
import { useAppTheme } from '../theme/AppThemeProvider';

type Navigation = NativeStackNavigationProp<AccountsStackParamList, 'AccountsList'>;

export function AccountsScreen() {
  const navigation = useNavigation<Navigation>();
  const { state, refreshMarketRates, isRefreshingRates, moveAccount } = useFinance();
  const { colors } = useAppTheme();
  const [isReordering, setIsReordering] = useState(false);
  const netWorth = getNetWorthVnd(state.accounts, state.settings.usdToVndRate);

  function handleRefreshRates() {
    refreshMarketRates()
      .then(() => Alert.alert('Rates updated', 'USD/VND and crypto prices were refreshed.'))
      .catch(() => Alert.alert('Update failed', 'Could not refresh rates right now. Check your internet connection and try again.'));
  }

  function getConvertedBalance(account: (typeof state.accounts)[number]) {
    if (account.type === 'crypto') {
      const usdValue = account.balance * (account.cryptoPriceUsd ?? 0);
      const vndValue = convertCurrency(usdValue, 'USD', 'VND', state.settings.usdToVndRate);
      return `${formatCurrency(usdValue, 'USD')} - ${formatCurrency(vndValue, 'VND')}`;
    }

    if (account.currency === 'USD') {
      return `${formatCurrency(convertCurrency(account.balance, 'USD', 'VND', state.settings.usdToVndRate), 'VND')} converted`;
    }

    return undefined;
  }

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

      <View style={styles.actions}>
        <Pressable
          style={({ pressed }) => [styles.secondaryButton, { borderColor: colors.border, backgroundColor: colors.surface, opacity: pressed ? 0.78 : 1 }]}
          onPress={handleRefreshRates}
          disabled={isRefreshingRates}
        >
          <Ionicons name="refresh-outline" size={18} color={colors.primary} />
          <AppText color={colors.primary} style={styles.buttonLabel}>
            {isRefreshingRates ? 'Updating' : 'Refresh rates'}
          </AppText>
        </Pressable>
        <Pressable
          style={({ pressed }) => [styles.primaryButton, { backgroundColor: colors.primary, opacity: pressed ? 0.82 : 1 }]}
          onPress={() => navigation.navigate('AddAccount')}
        >
          <Ionicons name="add" size={20} color="#FFFFFF" />
          <AppText color="#FFFFFF" style={styles.buttonLabel}>
            Add
          </AppText>
        </Pressable>
      </View>

      <SectionHeader
        title="All accounts"
        action={
          state.accounts.length > 1 ? (
            <Pressable
              style={({ pressed }) => [
                styles.orderToggle,
                {
                  borderColor: isReordering ? colors.primary : colors.border,
                  backgroundColor: isReordering ? colors.primarySoft : colors.surface,
                  opacity: pressed ? 0.78 : 1,
                },
              ]}
              onPress={() => setIsReordering((value) => !value)}
            >
              <Ionicons name={isReordering ? 'checkmark' : 'swap-vertical-outline'} size={18} color={colors.primary} />
              <AppText color={colors.primary} style={styles.orderToggleLabel}>
                {isReordering ? 'Done' : 'Order'}
              </AppText>
            </Pressable>
          ) : null
        }
      />
      <View style={styles.list}>
        {state.accounts.map((account, index) => (
          <View key={account.id} style={styles.accountRow}>
            {isReordering ? (
              <View style={styles.orderControls}>
                <Pressable
                  accessibilityLabel={`Move ${account.name} up`}
                  disabled={index === 0}
                  style={({ pressed }) => [
                    styles.orderButton,
                    {
                      borderColor: colors.border,
                      backgroundColor: colors.surface,
                      opacity: index === 0 ? 0.35 : pressed ? 0.72 : 1,
                    },
                  ]}
                  onPress={() => moveAccount(account.id, 'up')}
                >
                  <Ionicons name="chevron-up" size={18} color={colors.primary} />
                </Pressable>
                <Pressable
                  accessibilityLabel={`Move ${account.name} down`}
                  disabled={index === state.accounts.length - 1}
                  style={({ pressed }) => [
                    styles.orderButton,
                    {
                      borderColor: colors.border,
                      backgroundColor: colors.surface,
                      opacity: index === state.accounts.length - 1 ? 0.35 : pressed ? 0.72 : 1,
                    },
                  ]}
                  onPress={() => moveAccount(account.id, 'down')}
                >
                  <Ionicons name="chevron-down" size={18} color={colors.primary} />
                </Pressable>
              </View>
            ) : null}
            <Pressable
              disabled={isReordering}
              style={styles.accountCardPressable}
              onPress={() => navigation.navigate('AddAccount', { accountId: account.id })}
            >
              <AccountCard account={account} convertedBalance={getConvertedBalance(account)} />
            </Pressable>
          </View>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  totalCard: {
    gap: 8,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
  },
  primaryButton: {
    alignItems: 'center',
    borderRadius: 16,
    flexDirection: 'row',
    gap: 6,
    justifyContent: 'center',
    minHeight: 48,
    paddingHorizontal: 16,
  },
  secondaryButton: {
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    flex: 1,
    flexDirection: 'row',
    gap: 6,
    justifyContent: 'center',
    minHeight: 48,
    paddingHorizontal: 14,
  },
  buttonLabel: {
    fontWeight: '800',
  },
  list: {
    gap: 12,
  },
  orderToggle: {
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 6,
    minHeight: 38,
    paddingHorizontal: 12,
  },
  orderToggleLabel: {
    fontWeight: '800',
  },
  accountRow: {
    alignItems: 'stretch',
    flexDirection: 'row',
    gap: 10,
  },
  accountCardPressable: {
    flex: 1,
  },
  orderControls: {
    gap: 8,
    justifyContent: 'center',
  },
  orderButton: {
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    height: 38,
    justifyContent: 'center',
    width: 38,
  },
});
