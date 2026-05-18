import React, { useCallback, useState } from 'react';
import { Alert, Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import DraggableFlatList, { RenderItemParams, ScaleDecorator } from 'react-native-draggable-flatlist';

import { AccountCard } from '../components/AccountCard';
import { AppText } from '../components/AppText';
import { Card } from '../components/Card';
import { Screen } from '../components/Screen';
import { SectionHeader } from '../components/SectionHeader';
import { Account } from '../models/finance';
import { AccountsStackParamList } from '../navigation/types';
import { useFinance } from '../store/FinanceStore';
import { useAppTheme } from '../theme/AppThemeProvider';
import { getNetWorthVnd } from '../utils/calculations';
import { convertCurrency, formatCurrency } from '../utils/currency';

type Navigation = NativeStackNavigationProp<AccountsStackParamList, 'AccountsList'>;

export function AccountsScreen() {
  const navigation = useNavigation<Navigation>();
  const { state, refreshMarketRates, isRefreshingRates, reorderAccounts } = useFinance();
  const { colors } = useAppTheme();
  const [isReordering, setIsReordering] = useState(false);
  const netWorth = getNetWorthVnd(state.accounts, state.settings.usdToVndRate);

  function handleRefreshRates() {
    refreshMarketRates()
      .then(() => Alert.alert('Rates updated', 'USD/VND and crypto prices were refreshed.'))
      .catch(() => Alert.alert('Update failed', 'Could not refresh rates right now. Check your internet connection and try again.'));
  }

  function getConvertedBalance(account: Account) {
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

  const renderHeader = useCallback(
    () => (
      <View style={styles.header}>
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
            style={({ pressed }) => [
              styles.secondaryButton,
              { borderColor: colors.border, backgroundColor: colors.surface, opacity: pressed ? 0.78 : 1 },
            ]}
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
                <Ionicons name={isReordering ? 'checkmark' : 'reorder-three-outline'} size={18} color={colors.primary} />
                <AppText color={colors.primary} style={styles.orderToggleLabel}>
                  {isReordering ? 'Done' : 'Order'}
                </AppText>
              </Pressable>
            ) : null
          }
        />
      </View>
    ),
    [colors, isRefreshingRates, isReordering, navigation, netWorth, state.accounts.length],
  );

  const renderAccount = useCallback(
    ({ item, drag, isActive }: RenderItemParams<Account>) => (
      <ScaleDecorator>
        <View style={[styles.accountRow, { opacity: isActive ? 0.92 : 1 }]}>
          {isReordering ? (
            <Pressable
              accessibilityLabel={`Drag ${item.name}`}
              onLongPress={drag}
              onPressIn={drag}
              style={({ pressed }) => [
                styles.dragHandle,
                {
                  borderColor: colors.border,
                  backgroundColor: colors.surface,
                  opacity: pressed || isActive ? 0.72 : 1,
                },
              ]}
            >
              <Ionicons name="reorder-three-outline" size={24} color={colors.primary} />
            </Pressable>
          ) : null}
          <Pressable
            disabled={isReordering}
            style={styles.accountCardPressable}
            onLongPress={isReordering ? drag : undefined}
            onPress={() => navigation.navigate('AddAccount', { accountId: item.id })}
          >
            <AccountCard account={item} convertedBalance={getConvertedBalance(item)} />
          </Pressable>
        </View>
      </ScaleDecorator>
    ),
    [colors, isReordering, navigation, state.settings.usdToVndRate],
  );

  return (
    <Screen scroll={false}>
      <DraggableFlatList
        activationDistance={8}
        autoscrollSpeed={120}
        autoscrollThreshold={80}
        containerStyle={styles.listContainer}
        contentContainerStyle={styles.listContent}
        data={state.accounts}
        extraData={{ isReordering, usdToVndRate: state.settings.usdToVndRate }}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        onDragEnd={({ data }) => reorderAccounts(data.map((account) => account.id))}
        renderItem={renderAccount}
        scrollEnabled
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  listContainer: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 2,
  },
  header: {
    gap: 16,
    paddingBottom: 12,
  },
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
  dragHandle: {
    alignItems: 'center',
    alignSelf: 'stretch',
    borderRadius: 14,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 64,
    width: 42,
  },
  separator: {
    height: 12,
  },
});
