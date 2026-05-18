import React, { useEffect, useRef, useState } from 'react';
import { Alert, Animated, PanResponder, Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';

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

const dragStep = 88;

interface DraggableAccountRowProps {
  account: Account;
  index: number;
  isReordering: boolean;
  accountCount: number;
  convertedBalance?: string;
  onDrop: (accountId: string, targetIndex: number) => void;
  onDragStateChange: (isDragging: boolean) => void;
  onOpen: (accountId: string) => void;
}

function DraggableAccountRow({
  account,
  index,
  isReordering,
  accountCount,
  convertedBalance,
  onDrop,
  onDragStateChange,
  onOpen,
}: DraggableAccountRowProps) {
  const { colors } = useAppTheme();
  const dragY = useRef(new Animated.Value(0)).current;
  const latest = useRef({ accountCount, accountId: account.id, index, isReordering });
  const startIndex = useRef(index);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    latest.current = { accountCount, accountId: account.id, index, isReordering };
  }, [account.id, accountCount, index, isReordering]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => latest.current.isReordering,
      onStartShouldSetPanResponderCapture: () => latest.current.isReordering,
      onMoveShouldSetPanResponder: (_, gestureState) => latest.current.isReordering && Math.abs(gestureState.dy) > 4,
      onMoveShouldSetPanResponderCapture: (_, gestureState) => latest.current.isReordering && Math.abs(gestureState.dy) > 4,
      onPanResponderTerminationRequest: () => false,
      onShouldBlockNativeResponder: () => latest.current.isReordering,
      onPanResponderGrant: () => {
        setIsDragging(true);
        onDragStateChange(true);
        startIndex.current = latest.current.index;
        dragY.stopAnimation();
        dragY.setValue(0);
      },
      onPanResponderMove: (_, gestureState) => {
        dragY.setValue(gestureState.dy);
      },
      onPanResponderRelease: (_, gestureState) => {
        setIsDragging(false);
        onDragStateChange(false);
        const targetIndex = Math.max(0, Math.min(latest.current.accountCount - 1, startIndex.current + Math.round(gestureState.dy / dragStep)));

        if (targetIndex !== startIndex.current) {
          onDrop(latest.current.accountId, targetIndex);
          dragY.setValue(0);
          return;
        }

        Animated.spring(dragY, { toValue: 0, useNativeDriver: true }).start();
      },
      onPanResponderTerminate: () => {
        setIsDragging(false);
        onDragStateChange(false);
        Animated.spring(dragY, { toValue: 0, useNativeDriver: true }).start();
      },
    }),
  ).current;

  return (
    <Animated.View
      style={[
        styles.accountRow,
        {
          opacity: isDragging ? 0.9 : 1,
          transform: [{ translateY: dragY }],
          zIndex: isDragging ? 10 : 0,
        },
      ]}
    >
      {isReordering ? (
        <View
          accessibilityLabel={`Drag ${account.name}`}
          style={[styles.dragHandle, { borderColor: colors.border, backgroundColor: colors.surface }]}
          {...panResponder.panHandlers}
        >
          <Ionicons name="reorder-three-outline" size={24} color={colors.primary} />
        </View>
      ) : null}
      <Pressable disabled={isReordering} style={styles.accountCardPressable} onPress={() => onOpen(account.id)}>
        <AccountCard account={account} convertedBalance={convertedBalance} />
      </Pressable>
    </Animated.View>
  );
}

export function AccountsScreen() {
  const navigation = useNavigation<Navigation>();
  const { state, refreshMarketRates, isRefreshingRates, reorderAccounts } = useFinance();
  const { colors } = useAppTheme();
  const [isReordering, setIsReordering] = useState(false);
  const [isDraggingAccount, setIsDraggingAccount] = useState(false);
  const [orderedAccounts, setOrderedAccounts] = useState(state.accounts);
  const netWorth = getNetWorthVnd(state.accounts, state.settings.usdToVndRate);

  useEffect(() => {
    setOrderedAccounts(state.accounts);
  }, [state.accounts]);

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

  function dropAccount(accountId: string, targetIndex: number) {
    setOrderedAccounts((currentAccounts) => {
      const currentIndex = currentAccounts.findIndex((account) => account.id === accountId);

      if (currentIndex < 0 || currentIndex === targetIndex) {
        return currentAccounts;
      }

      const nextAccounts = [...currentAccounts];
      const [account] = nextAccounts.splice(currentIndex, 1);
      nextAccounts.splice(targetIndex, 0, account);
      reorderAccounts(nextAccounts.map((item) => item.id));
      return nextAccounts;
    });
  }

  return (
    <Screen scrollEnabled={!isDraggingAccount}>
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
              <Ionicons name={isReordering ? 'checkmark' : 'reorder-three-outline'} size={18} color={colors.primary} />
              <AppText color={colors.primary} style={styles.orderToggleLabel}>
                {isReordering ? 'Done' : 'Order'}
              </AppText>
            </Pressable>
          ) : null
        }
      />

      <View style={styles.list}>
        {orderedAccounts.map((account, index) => (
          <DraggableAccountRow
            key={account.id}
            account={account}
            accountCount={orderedAccounts.length}
            convertedBalance={getConvertedBalance(account)}
            index={index}
            isReordering={isReordering}
            onDragStateChange={setIsDraggingAccount}
            onDrop={dropAccount}
            onOpen={(accountId) => navigation.navigate('AddAccount', { accountId })}
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
  list: {
    gap: 12,
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
});
