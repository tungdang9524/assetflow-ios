import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Dimensions,
  LayoutChangeEvent,
  NativeScrollEvent,
  NativeSyntheticEvent,
  PanResponder,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
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

const defaultRowHeight = 88;
const listGap = 12;
const reorderThresholdRatio = 0.72;
const autoScrollEdgeSize = 120;
const autoScrollStep = 18;

interface DraggableAccountRowProps {
  account: Account;
  index: number;
  isReordering: boolean;
  accountCount: number;
  convertedBalance?: string;
  getAdjacentStep: (fromIndex: number, direction: 1 | -1) => number;
  getMoveDistance: (fromIndex: number, toIndex: number) => number;
  getScrollY: () => number;
  onDragMove: (moveY: number) => number;
  onOrderCommit: () => void;
  onRowHeightChange: (accountId: string, height: number) => void;
  onDragStateChange: (isDragging: boolean) => void;
  onOpen: (accountId: string) => void;
  onReorder: (accountId: string, targetIndex: number) => number;
}

function DraggableAccountRow({
  account,
  index,
  isReordering,
  accountCount,
  convertedBalance,
  getAdjacentStep,
  getMoveDistance,
  getScrollY,
  onDragMove,
  onOrderCommit,
  onRowHeightChange,
  onDragStateChange,
  onOpen,
  onReorder,
}: DraggableAccountRowProps) {
  const { colors } = useAppTheme();
  const dragY = useRef(new Animated.Value(0)).current;
  const latest = useRef({ accountCount, accountId: account.id, index, isReordering });
  const startGestureDy = useRef(0);
  const startIndex = useRef(index);
  const startScrollY = useRef(0);
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
        startGestureDy.current = 0;
        startIndex.current = latest.current.index;
        startScrollY.current = getScrollY();
        dragY.stopAnimation();
        dragY.setValue(0);
      },
      onPanResponderMove: (_, gestureState) => {
        const currentScrollY = onDragMove(gestureState.moveY);
        let effectiveDy = gestureState.dy - startGestureDy.current + currentScrollY - startScrollY.current;
        const direction = effectiveDy > 0 ? 1 : -1;
        const reorderThreshold = getAdjacentStep(startIndex.current, direction) * reorderThresholdRatio;
        const indexDelta = effectiveDy > reorderThreshold ? 1 : effectiveDy < -reorderThreshold ? -1 : 0;

        if (indexDelta !== 0) {
          const targetIndex = Math.max(0, Math.min(latest.current.accountCount - 1, startIndex.current + indexDelta));
          const layoutDistance = getMoveDistance(startIndex.current, targetIndex);
          const reorderedIndex = onReorder(latest.current.accountId, targetIndex);
          const movedDelta = reorderedIndex - startIndex.current;

          if (movedDelta !== 0) {
            const nextEffectiveDy = effectiveDy - layoutDistance;
            startGestureDy.current = gestureState.dy - nextEffectiveDy;
            startIndex.current = reorderedIndex;
            startScrollY.current = currentScrollY;
            effectiveDy = nextEffectiveDy;
          }
        }

        dragY.setValue(effectiveDy);
      },
      onPanResponderRelease: (_, gestureState) => {
        setIsDragging(false);
        onDragStateChange(false);
        const effectiveDy = gestureState.dy - startGestureDy.current + getScrollY() - startScrollY.current;
        const direction = effectiveDy > 0 ? 1 : -1;
        const targetIndex =
          Math.abs(effectiveDy) > getAdjacentStep(startIndex.current, direction) / 2
            ? Math.max(0, Math.min(latest.current.accountCount - 1, startIndex.current + direction))
            : startIndex.current;

        if (targetIndex !== startIndex.current) {
          onReorder(latest.current.accountId, targetIndex);
          dragY.setValue(0);
          onOrderCommit();
          return;
        }

        onOrderCommit();
        Animated.spring(dragY, { toValue: 0, useNativeDriver: true }).start();
      },
      onPanResponderTerminate: () => {
        setIsDragging(false);
        onDragStateChange(false);
        onOrderCommit();
        Animated.spring(dragY, { toValue: 0, useNativeDriver: true }).start();
      },
    }),
  ).current;

  return (
    <Animated.View
      onLayout={(event) => onRowHeightChange(account.id, event.nativeEvent.layout.height)}
      style={[
        styles.accountRow,
        {
          elevation: isDragging ? 8 : 0,
          opacity: isDragging ? 0.96 : 1,
          transform: [{ translateY: dragY }],
          zIndex: isDragging ? 10 : 0,
        },
      ]}
    >
      <Pressable disabled={isReordering} style={styles.accountCardPressable} onPress={() => onOpen(account.id)}>
        <AccountCard account={account} convertedBalance={convertedBalance} />
      </Pressable>
      {isReordering ? (
        <View
          accessibilityLabel={`Drag ${account.name}`}
          style={[styles.dragHandle, { borderColor: colors.border, backgroundColor: colors.surface }]}
          {...panResponder.panHandlers}
        >
          <Ionicons name="reorder-three-outline" size={24} color={colors.primary} />
        </View>
      ) : null}
    </Animated.View>
  );
}

export function AccountsScreen() {
  const navigation = useNavigation<Navigation>();
  const { state, refreshMarketRates, isRefreshingRates, reorderAccounts } = useFinance();
  const { colors } = useAppTheme();
  const scrollRef = useRef<ScrollView>(null);
  const contentHeight = useRef(0);
  const viewportHeight = useRef(0);
  const scrollY = useRef(0);
  const orderedAccountsRef = useRef(state.accounts);
  const rowHeights = useRef<Record<string, number>>({});
  const [isReordering, setIsReordering] = useState(false);
  const [isDraggingAccount, setIsDraggingAccount] = useState(false);
  const [orderedAccounts, setOrderedAccounts] = useState(state.accounts);
  const netWorth = getNetWorthVnd(state.accounts, state.settings.usdToVndRate);

  useEffect(() => {
    orderedAccountsRef.current = state.accounts;
    setOrderedAccounts(state.accounts);
  }, [state.accounts]);

  function handleRefreshRates() {
    refreshMarketRates()
      .then(() => Alert.alert('Rates updated', 'USD/VND, crypto, fund, and ETF prices were refreshed.'))
      .catch(() => Alert.alert('Update failed', 'Could not refresh rates right now. Check your internet connection and try again.'));
  }

  function getConvertedBalance(account: Account) {
    if (account.type === 'crypto') {
      const usdValue = account.cryptoHoldings?.length
        ? account.cryptoHoldings.reduce((sum, holding) => sum + holding.quantity * (holding.priceUsd ?? 0), 0)
        : account.balance * (account.cryptoPriceUsd ?? 0);
      const vndValue = convertCurrency(usdValue, 'USD', 'VND', state.settings.usdToVndRate);
      return `${formatCurrency(usdValue, 'USD')} - ${formatCurrency(vndValue, 'VND')}`;
    }

    if (account.type === 'stock' || account.type === 'bond' || account.type === 'etf') {
      if (account.currency !== 'USD') {
        return undefined;
      }

      const usdValue = account.investmentHoldings?.length
        ? account.investmentHoldings.reduce((sum, holding) => sum + holding.quantity * (holding.priceUsd ?? 0), 0)
        : account.balance;
      const vndValue = convertCurrency(usdValue, 'USD', 'VND', state.settings.usdToVndRate);
      return `${formatCurrency(usdValue, 'USD')} - ${formatCurrency(vndValue, 'VND')}`;
    }

    if (account.currency === 'USD') {
      return `${formatCurrency(convertCurrency(account.balance, 'USD', 'VND', state.settings.usdToVndRate), 'VND')} converted`;
    }

    return undefined;
  }

  function reorderAccount(accountId: string, targetIndex: number) {
    const currentAccounts = orderedAccountsRef.current;
    const currentIndex = currentAccounts.findIndex((account) => account.id === accountId);

    if (currentIndex < 0) {
      return targetIndex;
    }

    const nextIndex = Math.max(0, Math.min(currentAccounts.length - 1, targetIndex));

    if (currentIndex === nextIndex) {
      return currentIndex;
    }

    const nextAccounts = [...currentAccounts];
    const [account] = nextAccounts.splice(currentIndex, 1);
    nextAccounts.splice(nextIndex, 0, account);
    orderedAccountsRef.current = nextAccounts;
    setOrderedAccounts(nextAccounts);
    return nextIndex;
  }

  function commitAccountOrder() {
    reorderAccounts(orderedAccountsRef.current.map((item) => item.id));
  }

  function handleRowHeightChange(accountId: string, height: number) {
    rowHeights.current[accountId] = height;
  }

  function getStepForIndex(index: number) {
    const account = orderedAccountsRef.current[index];

    if (!account) {
      return defaultRowHeight + listGap;
    }

    return (rowHeights.current[account.id] ?? defaultRowHeight) + listGap;
  }

  function getAdjacentStep(fromIndex: number, direction: 1 | -1) {
    const adjacentIndex = Math.max(0, Math.min(orderedAccountsRef.current.length - 1, fromIndex + direction));
    return getStepForIndex(adjacentIndex);
  }

  function getMoveDistance(fromIndex: number, toIndex: number) {
    if (fromIndex === toIndex) {
      return 0;
    }

    if (toIndex > fromIndex) {
      let distance = 0;

      for (let index = fromIndex + 1; index <= toIndex; index += 1) {
        distance += getStepForIndex(index);
      }

      return distance;
    }

    let distance = 0;

    for (let index = toIndex; index < fromIndex; index += 1) {
      distance += getStepForIndex(index);
    }

    return -distance;
  }

  function handleScroll(event: NativeSyntheticEvent<NativeScrollEvent>) {
    scrollY.current = event.nativeEvent.contentOffset.y;
  }

  function handleContentSizeChange(_: number, height: number) {
    contentHeight.current = height;
  }

  function handleLayout(event: LayoutChangeEvent) {
    viewportHeight.current = event.nativeEvent.layout.height;
  }

  function handleDragMove(moveY: number) {
    const windowHeight = Dimensions.get('window').height;
    const maxScrollY = Math.max(0, contentHeight.current - viewportHeight.current);
    let nextY = scrollY.current;

    if (moveY > windowHeight - autoScrollEdgeSize) {
      nextY = Math.min(maxScrollY, scrollY.current + autoScrollStep);
    } else if (moveY < autoScrollEdgeSize) {
      nextY = Math.max(0, scrollY.current - autoScrollStep);
    }

    if (nextY !== scrollY.current) {
      scrollY.current = nextY;
      scrollRef.current?.scrollTo({ y: nextY, animated: false });
    }

    return scrollY.current;
  }

  return (
    <Screen
      onContentSizeChange={handleContentSizeChange}
      onLayout={handleLayout}
      onScroll={handleScroll}
      scrollEnabled={!isDraggingAccount}
      scrollEventThrottle={16}
      scrollViewRef={scrollRef}
    >
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
            getAdjacentStep={getAdjacentStep}
            getMoveDistance={getMoveDistance}
            getScrollY={() => scrollY.current}
            index={index}
            isReordering={isReordering}
            onDragMove={handleDragMove}
            onOrderCommit={commitAccountOrder}
            onRowHeightChange={handleRowHeightChange}
            onDragStateChange={setIsDraggingAccount}
            onOpen={(accountId) => navigation.navigate('AddAccount', { accountId })}
            onReorder={reorderAccount}
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
