import React, { useEffect, useState } from 'react';
import { Alert, Modal, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { RouteProp, StackActions, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { AssetLineChart, AssetLineChartSeries } from '../components/AssetLineChart';
import { AppText } from '../components/AppText';
import { Card } from '../components/Card';
import { PrimaryButton } from '../components/PrimaryButton';
import { Screen } from '../components/Screen';
import { getCryptoAsset, supportedCryptoAssets } from '../data/cryptoAssets';
import { getInvestmentAsset, getInvestmentAssets } from '../data/investmentAssets';
import { AccountType, CryptoHolding, CryptoId, CurrencyCode, InvestmentAssetType, InvestmentHolding } from '../models/finance';
import { AccountsStackParamList } from '../navigation/types';
import { useFinance } from '../store/FinanceStore';
import { useAppTheme } from '../theme/AppThemeProvider';
import { formatCurrency } from '../utils/currency';
import { formatAccountType } from '../utils/labels';
import { fetchCryptoPriceHistory, fetchInvestmentPriceHistory, fetchInvestmentPrices, getInvestmentPriceKey, PriceHistoryPoint } from '../utils/marketData';

type Navigation = NativeStackNavigationProp<AccountsStackParamList, 'AddAccount'>;
type Route = RouteProp<AccountsStackParamList, 'AddAccount'>;
type CryptoHoldingNavigation = NativeStackNavigationProp<AccountsStackParamList, 'AddCryptoHolding'>;
type CryptoHoldingRoute = RouteProp<AccountsStackParamList, 'AddCryptoHolding'>;
type InvestmentHoldingNavigation = NativeStackNavigationProp<AccountsStackParamList, 'AddInvestmentHolding'>;
type InvestmentHoldingRoute = RouteProp<AccountsStackParamList, 'AddInvestmentHolding'>;

const accountTypes: AccountType[] = ['cash', 'bank', 'ewallet', 'savings', 'foreign', 'credit', 'crypto', 'stock', 'bond', 'etf'];
const accountColors = ['#50A878', '#3D7BFF', '#F59E0B', '#8B5CF6', '#0891B2', '#D94841', '#7C3AED', '#2563EB', '#B45309', '#059669'];
const iconsByType: Record<AccountType, keyof typeof Ionicons.glyphMap> = {
  cash: 'wallet-outline',
  bank: 'business-outline',
  ewallet: 'phone-portrait-outline',
  savings: 'lock-closed-outline',
  foreign: 'earth-outline',
  credit: 'card-outline',
  crypto: 'logo-bitcoin',
  stock: 'trending-up-outline',
  bond: 'document-text-outline',
  etf: 'stats-chart-outline',
};

function parseAmount(value: string) {
  return Number(value.replace(/,/g, '.'));
}

function toDateOnly(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function addYears(date: Date, yearCount: number) {
  return toDateOnly(new Date(date.getFullYear() + yearCount, date.getMonth(), date.getDate()));
}

function formatDateInput(date: Date) {
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

function dateToIsoDate(date: Date) {
  return toDateOnly(date).toISOString();
}

function getLegacyHolding(account: ReturnType<typeof useFinance>['state']['accounts'][number] | undefined): CryptoHolding[] {
  if (!account || account.type !== 'crypto') {
    return [];
  }

  if (account.cryptoHoldings?.length) {
    return account.cryptoHoldings;
  }

  if (!account.cryptoId || !account.cryptoSymbol || !account.cryptoName) {
    return [];
  }

  const asset = getCryptoAsset(account.cryptoId);
  return [
    {
      id: `holding-${account.cryptoId}`,
      cryptoId: account.cryptoId,
      cryptoName: account.cryptoName,
      cryptoSymbol: account.cryptoSymbol,
      quantity: account.balance,
      priceUsd: account.cryptoPriceUsd ?? asset.fallbackPriceUsd,
      change24h: account.crypto24hChange,
      lastPriceUpdatedAt: account.lastPriceUpdatedAt,
      color: asset.color,
    },
  ];
}

function getInvestmentValue(holdings: InvestmentHolding[]) {
  return holdings.reduce((sum, holding) => sum + holding.quantity * (holding.priceUsd ?? 0), 0);
}

function isInvestmentAccountType(type: AccountType): type is InvestmentAssetType {
  return type === 'stock' || type === 'bond' || type === 'etf';
}

function getInvestmentCurrency(type: InvestmentAssetType): CurrencyCode {
  return type === 'etf' ? 'USD' : 'VND';
}

function getInvestmentFallbackName(type: InvestmentAssetType) {
  if (type === 'stock') {
    return 'Stock Fund Portfolio';
  }

  if (type === 'bond') {
    return 'Bond Fund Portfolio';
  }

  return 'ETF Portfolio';
}

function buildFlatSeriesPoints(value: number) {
  return ['1M', '3M', '6M', '12M'].map((label) => ({ label, value }));
}

export function AddAccountScreen() {
  const navigation = useNavigation<Navigation>();
  const route = useRoute<Route>();
  const { state, addAccount, updateAccount, deleteAccount } = useFinance();
  const { colors } = useAppTheme();
  const editingAccount = state.accounts.find((account) => account.id === route.params?.accountId);
  const [accountType, setAccountType] = useState<AccountType>(editingAccount?.type ?? 'cash');
  const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState(false);
  const [name, setName] = useState(editingAccount?.name ?? '');
  const [currency, setCurrency] = useState<CurrencyCode>(editingAccount?.currency ?? 'VND');
  const [balance, setBalance] = useState(editingAccount && editingAccount.type !== 'crypto' && !isInvestmentAccountType(editingAccount.type) ? String(editingAccount.balance) : '');
  const [color, setColor] = useState(editingAccount?.color ?? accountColors[0]);
  const [cryptoHoldings, setCryptoHoldings] = useState<CryptoHolding[]>(getLegacyHolding(editingAccount));
  const [investmentHoldings, setInvestmentHoldings] = useState<InvestmentHolding[]>(editingAccount?.investmentHoldings ?? []);
  const [creditLimit, setCreditLimit] = useState(editingAccount?.creditLimit ? String(editingAccount.creditLimit) : '');
  const [statementDay, setStatementDay] = useState(editingAccount?.statementDay ? String(editingAccount.statementDay) : '20');
  const [paymentDueDay, setPaymentDueDay] = useState(editingAccount?.paymentDueDay ? String(editingAccount.paymentDueDay) : '5');
  const [minimumPayment, setMinimumPayment] = useState(editingAccount?.minimumPayment ? String(editingAccount.minimumPayment) : '');
  const [annualInterestRate, setAnnualInterestRate] = useState(editingAccount?.annualInterestRate ? String(editingAccount.annualInterestRate) : '');
  const [savingsStartDate, setSavingsStartDate] = useState(() => toDateOnly(new Date(editingAccount?.savingsStartDate ?? new Date())));
  const [savingsEndDate, setSavingsEndDate] = useState(() => toDateOnly(new Date(editingAccount?.savingsEndDate ?? addYears(new Date(editingAccount?.savingsStartDate ?? new Date()), 1))));
  const [activeSavingsDatePicker, setActiveSavingsDatePicker] = useState<'start' | 'end' | null>(null);
  const [investmentPriceHistoryBySymbol, setInvestmentPriceHistoryBySymbol] = useState<Record<string, PriceHistoryPoint[]>>({});
  const [cryptoPriceHistoryById, setCryptoPriceHistoryById] = useState<Record<string, PriceHistoryPoint[]>>({});
  const selectedTypeIcon = iconsByType[accountType];
  const cryptoChartSeries: AssetLineChartSeries[] = cryptoHoldings.map((holding) => {
    const history = cryptoPriceHistoryById[holding.cryptoId];
    const currentValue = holding.quantity * (holding.priceUsd ?? 0);
    const points = history?.length
      ? history.map((point) => ({ label: point.label, value: point.priceUsd * holding.quantity }))
      : buildFlatSeriesPoints(currentValue);

    return {
      id: holding.id,
      label: holding.cryptoSymbol,
      color: holding.color,
      points,
    };
  });
  const visibleInvestmentHoldings = isInvestmentAccountType(accountType) ? investmentHoldings.filter((holding) => holding.assetType === accountType) : [];
  const investmentChartSeries: AssetLineChartSeries[] = visibleInvestmentHoldings.map((holding) => {
    const history = investmentPriceHistoryBySymbol[getInvestmentPriceKey(holding.assetType, holding.assetSymbol)];
    const currentValue = holding.quantity * (holding.priceUsd ?? 0);
    const points = history?.length
      ? history.map((point) => ({ label: point.label, value: point.priceUsd * holding.quantity }))
      : buildFlatSeriesPoints(currentValue);

    return {
      id: holding.id,
      label: holding.assetSymbol,
      color: holding.color,
      points,
    };
  });

  useEffect(() => {
    const pendingHolding = route.params?.cryptoHolding;

    if (!pendingHolding) {
      return;
    }

    setAccountType('crypto');
    setCryptoHoldings((currentHoldings) => {
      const existingIndex = currentHoldings.findIndex((holding) => holding.id === pendingHolding.id);

      if (existingIndex < 0) {
        return [...currentHoldings, pendingHolding];
      }

      const nextHoldings = [...currentHoldings];
      nextHoldings[existingIndex] = pendingHolding;
      return nextHoldings;
    });
    navigation.setParams({ cryptoHolding: undefined });
  }, [navigation, route.params?.cryptoHolding]);

  useEffect(() => {
    const pendingHolding = route.params?.investmentHolding;

    if (!pendingHolding) {
      return;
    }

    setAccountType(pendingHolding.assetType);
    setInvestmentHoldings((currentHoldings) => {
      const existingIndex = currentHoldings.findIndex((holding) => holding.id === pendingHolding.id);

      if (existingIndex < 0) {
        return [...currentHoldings, pendingHolding];
      }

      const nextHoldings = [...currentHoldings];
      nextHoldings[existingIndex] = pendingHolding;
      return nextHoldings;
    });
    navigation.setParams({ investmentHolding: undefined });
  }, [navigation, route.params?.investmentHolding]);

  useEffect(() => {
    if (accountType !== 'crypto' || cryptoHoldings.length === 0) {
      return;
    }

    let isActive = true;
    const missingIds = Array.from(new Set(cryptoHoldings.map((holding) => holding.cryptoId))).filter((id) => !cryptoPriceHistoryById[id]);

    if (missingIds.length === 0) {
      return;
    }

    Promise.allSettled(missingIds.map((id) => fetchCryptoPriceHistory(id))).then((results) => {
      if (!isActive) {
        return;
      }

      setCryptoPriceHistoryById((currentHistory) => {
        const nextHistory = { ...currentHistory };

        results.forEach((result, index) => {
          if (result.status === 'fulfilled') {
            nextHistory[missingIds[index]] = result.value;
          }
        });

        return nextHistory;
      });
    });

    return () => {
      isActive = false;
    };
  }, [accountType, cryptoHoldings, cryptoPriceHistoryById]);

  useEffect(() => {
    if (!isInvestmentAccountType(accountType) || visibleInvestmentHoldings.length === 0) {
      return;
    }

    let isActive = true;
    const missingHoldings = Array.from(
      new Map(visibleInvestmentHoldings.map((holding) => [getInvestmentPriceKey(holding.assetType, holding.assetSymbol), holding])).values(),
    ).filter((holding) => !investmentPriceHistoryBySymbol[getInvestmentPriceKey(holding.assetType, holding.assetSymbol)]);

    if (missingHoldings.length === 0) {
      return;
    }

    Promise.allSettled(missingHoldings.map((holding) => fetchInvestmentPriceHistory(holding.assetSymbol, holding.assetType))).then((results) => {
      if (!isActive) {
        return;
      }

      setInvestmentPriceHistoryBySymbol((currentHistory) => {
        const nextHistory = { ...currentHistory };

        results.forEach((result, index) => {
          if (result.status === 'fulfilled') {
            const holding = missingHoldings[index];
            nextHistory[getInvestmentPriceKey(holding.assetType, holding.assetSymbol)] = result.value;
          }
        });

        return nextHistory;
      });
    });

    return () => {
      isActive = false;
    };
  }, [accountType, investmentHoldings, investmentPriceHistoryBySymbol]);

  function handleSubmit() {
    const parsedBalance = parseAmount(balance || '0');

    if (accountType === 'crypto') {
      if (cryptoHoldings.length === 0) {
        Alert.alert('No crypto assets', 'Add at least one crypto asset and quantity.');
        return;
      }

      const primaryHolding = cryptoHoldings[0];
      const nextAccount = {
        name: name.trim() || 'Crypto Wallet',
        type: 'crypto',
        currency: 'USD',
        balance: primaryHolding.quantity,
        icon: 'logo-bitcoin',
        color: primaryHolding.color,
        cryptoId: primaryHolding.cryptoId,
        cryptoName: primaryHolding.cryptoName,
        cryptoSymbol: primaryHolding.cryptoSymbol,
        cryptoPriceUsd: primaryHolding.priceUsd,
        crypto24hChange: primaryHolding.change24h,
        lastPriceUpdatedAt: primaryHolding.lastPriceUpdatedAt,
        cryptoHoldings,
        creditLimit: undefined,
        statementDay: undefined,
        paymentDueDay: undefined,
        minimumPayment: undefined,
        annualInterestRate: undefined,
        savingsStartDate: undefined,
        savingsEndDate: undefined,
      } as const;

      if (editingAccount) {
        updateAccount(editingAccount.id, nextAccount);
      } else {
        addAccount(nextAccount);
      }

      navigation.goBack();
      return;
    }

    if (isInvestmentAccountType(accountType)) {
      const holdings = investmentHoldings.filter((holding) => holding.assetType === accountType);

      if (holdings.length === 0) {
        Alert.alert('No assets', `Add at least one ${formatAccountType(accountType).toLowerCase()} asset and quantity.`);
        return;
      }

      const nextAccount = {
        name: name.trim() || getInvestmentFallbackName(accountType),
        type: accountType,
        currency: getInvestmentCurrency(accountType),
        balance: getInvestmentValue(holdings),
        icon: iconsByType[accountType],
        color: accountType === 'stock' ? '#2563EB' : accountType === 'bond' ? '#B45309' : '#059669',
        investmentHoldings: holdings,
        creditLimit: undefined,
        statementDay: undefined,
        paymentDueDay: undefined,
        minimumPayment: undefined,
        annualInterestRate: undefined,
        savingsStartDate: undefined,
        savingsEndDate: undefined,
        cryptoId: undefined,
        cryptoName: undefined,
        cryptoSymbol: undefined,
        cryptoPriceUsd: undefined,
        crypto24hChange: undefined,
        cryptoHoldings: undefined,
        lastPriceUpdatedAt: undefined,
      } as const;

      if (editingAccount) {
        updateAccount(editingAccount.id, nextAccount);
      } else {
        addAccount(nextAccount);
      }

      navigation.goBack();
      return;
    }

    if (!Number.isFinite(parsedBalance) || (accountType !== 'credit' && parsedBalance < 0)) {
      Alert.alert('Invalid amount', 'Enter a valid balance.');
      return;
    }

    const parsedCreditLimit = parseAmount(creditLimit);
    const parsedMinimumPayment = minimumPayment.trim() ? parseAmount(minimumPayment) : undefined;
    const parsedInterestRate = annualInterestRate.trim() ? parseAmount(annualInterestRate) : undefined;
    const parsedStatementDay = Number(statementDay);
    const parsedPaymentDueDay = Number(paymentDueDay);

    if (accountType === 'credit') {
      if (!Number.isFinite(parsedCreditLimit) || parsedCreditLimit <= 0) {
        Alert.alert('Invalid limit', 'Enter a valid credit limit.');
        return;
      }

      if (!Number.isInteger(parsedStatementDay) || parsedStatementDay < 1 || parsedStatementDay > 31) {
        Alert.alert('Invalid statement day', 'Statement day must be between 1 and 31.');
        return;
      }

      if (!Number.isInteger(parsedPaymentDueDay) || parsedPaymentDueDay < 1 || parsedPaymentDueDay > 31) {
        Alert.alert('Invalid due day', 'Payment due day must be between 1 and 31.');
        return;
      }

      if ((parsedMinimumPayment !== undefined && (!Number.isFinite(parsedMinimumPayment) || parsedMinimumPayment < 0)) || (parsedInterestRate !== undefined && (!Number.isFinite(parsedInterestRate) || parsedInterestRate < 0))) {
        Alert.alert('Invalid credit details', 'Minimum payment and APR must be zero or higher.');
        return;
      }

      if (Math.max(-parsedBalance, 0) > parsedCreditLimit) {
        Alert.alert('Over credit limit', 'Current balance cannot exceed the credit limit.');
        return;
      }
    }

    if (accountType === 'savings') {
      if (parsedInterestRate !== undefined && (!Number.isFinite(parsedInterestRate) || parsedInterestRate < 0)) {
        Alert.alert('Invalid interest', 'Interest rate must be zero or higher.');
        return;
      }

      if (formatDateInput(savingsEndDate) < formatDateInput(savingsStartDate)) {
        Alert.alert('Invalid date range', 'End date must be on or after start date.');
        return;
      }
    }

    const nextAccount = {
      name: name.trim() || formatAccountType(accountType),
      type: accountType,
      currency,
      balance: parsedBalance,
      icon: iconsByType[accountType],
      color,
      creditLimit: accountType === 'credit' ? parsedCreditLimit : undefined,
      statementDay: accountType === 'credit' ? parsedStatementDay : undefined,
      paymentDueDay: accountType === 'credit' ? parsedPaymentDueDay : undefined,
      minimumPayment: accountType === 'credit' ? parsedMinimumPayment : undefined,
      annualInterestRate: accountType === 'credit' || accountType === 'savings' ? parsedInterestRate : undefined,
      savingsStartDate: accountType === 'savings' ? dateToIsoDate(savingsStartDate) : undefined,
      savingsEndDate: accountType === 'savings' ? dateToIsoDate(savingsEndDate) : undefined,
      cryptoId: undefined,
      cryptoName: undefined,
      cryptoSymbol: undefined,
      cryptoPriceUsd: undefined,
      crypto24hChange: undefined,
      cryptoHoldings: undefined,
      investmentHoldings: undefined,
      lastPriceUpdatedAt: undefined,
    };

    if (editingAccount) {
      updateAccount(editingAccount.id, nextAccount);
    } else {
      addAccount(nextAccount);
    }

    navigation.goBack();
  }

  function confirmDelete() {
    if (!editingAccount) {
      return;
    }

    Alert.alert('Delete account', 'Accounts with transactions cannot be deleted.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          const didDelete = deleteAccount(editingAccount.id);

          if (!didDelete) {
            Alert.alert('Account in use', 'Delete or move related transactions before deleting this account.');
            return;
          }

          navigation.goBack();
        },
      },
    ]);
  }

  return (
    <Screen>
      <Card style={styles.form}>
        <View style={styles.inputGroup}>
          <AppText variant="caption">Name</AppText>
          <TextInput
            placeholder={accountType === 'crypto' ? 'Crypto Wallet' : isInvestmentAccountType(accountType) ? getInvestmentFallbackName(accountType) : 'My account'}
            placeholderTextColor={colors.muted}
            value={name}
            onChangeText={setName}
            style={[styles.input, { borderColor: colors.border, color: colors.text }]}
          />
        </View>

        <View style={styles.inputGroup}>
          <AppText variant="caption">Type</AppText>
          <Pressable
            style={[styles.dropdownButton, { borderColor: colors.border, backgroundColor: colors.surface }]}
            onPress={() => setIsTypeDropdownOpen((value) => !value)}
          >
            <View style={[styles.typeIcon, { backgroundColor: colors.primarySoft }]}>
              <Ionicons name={selectedTypeIcon} size={18} color={colors.primary} />
            </View>
            <AppText style={styles.optionText}>{formatAccountType(accountType)}</AppText>
            <Ionicons name={isTypeDropdownOpen ? 'chevron-up' : 'chevron-down'} size={20} color={colors.muted} />
          </Pressable>
          {isTypeDropdownOpen ? (
            <View style={[styles.dropdownList, { borderColor: colors.border, backgroundColor: colors.surface }]}>
              <ScrollView nestedScrollEnabled showsVerticalScrollIndicator={false}>
                {accountTypes.map((item) => (
                  <Pressable
                    key={item}
                    style={[styles.dropdownItem, { borderBottomColor: colors.border }]}
                    onPress={() => {
                      setAccountType(item);
                      setIsTypeDropdownOpen(false);
                      if (item === 'crypto') {
                        setCurrency('USD');
                      }

                      if (isInvestmentAccountType(item)) {
                        setCurrency(getInvestmentCurrency(item));
                      }
                    }}
                  >
                    <View style={[styles.typeIcon, { backgroundColor: colors.primarySoft }]}>
                      <Ionicons name={iconsByType[item]} size={18} color={colors.primary} />
                    </View>
                    <AppText style={styles.optionText}>{formatAccountType(item)}</AppText>
                    {item === accountType ? <Ionicons name="checkmark-circle" size={20} color={colors.primary} /> : null}
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          ) : null}
        </View>

        {accountType === 'crypto' ? (
          <View style={styles.inputGroup}>
            <View style={styles.rowHeader}>
              <AppText variant="caption">Crypto assets</AppText>
              <Pressable style={[styles.smallButton, { borderColor: colors.border }]} onPress={() => navigation.navigate('AddCryptoHolding', { accountId: editingAccount?.id, holding: undefined })}>
                <Ionicons name="add" size={16} color={colors.primary} />
                <AppText color={colors.primary} style={styles.smallButtonText}>Add</AppText>
              </Pressable>
            </View>
            <View style={styles.holdingList}>
              {cryptoHoldings.map((holding) => (
                <Pressable key={holding.id} style={[styles.holdingRow, { borderColor: colors.border }]} onPress={() => navigation.navigate('AddCryptoHolding', { accountId: editingAccount?.id, holding })}>
                  <View style={[styles.assetDot, { backgroundColor: holding.color }]} />
                  <View style={styles.dropdownCopy}>
                    <AppText style={styles.optionText}>{holding.cryptoSymbol}</AppText>
                    <AppText variant="caption">{holding.cryptoName}</AppText>
                  </View>
                  <View style={styles.holdingAmount}>
                    <AppText style={styles.optionText}>{holding.quantity}</AppText>
                    <AppText variant="caption">{formatCurrency(holding.quantity * (holding.priceUsd ?? 0), 'USD')}</AppText>
                  </View>
                  <Pressable
                    style={styles.iconTap}
                    onPress={() => setCryptoHoldings((currentHoldings) => currentHoldings.filter((item) => item.id !== holding.id))}
                  >
                    <Ionicons name="trash-outline" size={18} color={colors.danger} />
                  </Pressable>
                </Pressable>
              ))}
            </View>
            {cryptoChartSeries.length > 0 ? (
              <View style={styles.assetChart}>
                <AssetLineChart currency="USD" series={cryptoChartSeries} />
              </View>
            ) : null}
          </View>
        ) : isInvestmentAccountType(accountType) ? (
          <View style={styles.inputGroup}>
            <View style={styles.rowHeader}>
              <AppText variant="caption">{formatAccountType(accountType)} assets</AppText>
              <Pressable
                style={[styles.smallButton, { borderColor: colors.border }]}
                onPress={() => navigation.navigate('AddInvestmentHolding', { accountId: editingAccount?.id, assetType: accountType, holding: undefined })}
              >
                <Ionicons name="add" size={16} color={colors.primary} />
                <AppText color={colors.primary} style={styles.smallButtonText}>Add</AppText>
              </Pressable>
            </View>
            <View style={styles.holdingList}>
              {visibleInvestmentHoldings.map((holding) => (
                <Pressable
                  key={holding.id}
                  style={[styles.holdingRow, { borderColor: colors.border }]}
                  onPress={() => navigation.navigate('AddInvestmentHolding', { accountId: editingAccount?.id, assetType: accountType, holding })}
                >
                  <View style={[styles.assetDot, { backgroundColor: holding.color }]} />
                  <View style={styles.dropdownCopy}>
                    <AppText style={styles.optionText}>{holding.assetSymbol}</AppText>
                    <AppText variant="caption">{holding.assetName}</AppText>
                  </View>
                  <View style={styles.holdingAmount}>
                    <AppText style={styles.optionText}>{holding.quantity}</AppText>
                    <AppText variant="caption">{formatCurrency(holding.quantity * (holding.priceUsd ?? 0), getInvestmentCurrency(accountType))}</AppText>
                  </View>
                  <Pressable
                    style={styles.iconTap}
                    onPress={() => setInvestmentHoldings((currentHoldings) => currentHoldings.filter((item) => item.id !== holding.id))}
                  >
                    <Ionicons name="trash-outline" size={18} color={colors.danger} />
                  </Pressable>
                </Pressable>
              ))}
            </View>
            {investmentChartSeries.length > 0 ? (
              <View style={styles.assetChart}>
                <AssetLineChart currency={getInvestmentCurrency(accountType)} series={investmentChartSeries} />
              </View>
            ) : null}
          </View>
        ) : (
          <>
            <View style={styles.inputGroup}>
              <AppText variant="caption">Currency</AppText>
              <View style={styles.segment}>
                {(['VND', 'USD'] as CurrencyCode[]).map((item) => {
                  const selected = currency === item;
                  return (
                    <Pressable
                      key={item}
                      style={[styles.segmentItem, { backgroundColor: selected ? colors.primary : colors.surface, borderColor: colors.border }]}
                      onPress={() => setCurrency(item)}
                    >
                      <AppText color={selected ? '#FFFFFF' : colors.text} style={styles.segmentLabel}>{item}</AppText>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <AppText variant="caption">Color</AppText>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.swatches}>
                {accountColors.map((item) => (
                  <Pressable
                    key={item}
                    accessibilityLabel={`Select ${item}`}
                    onPress={() => setColor(item)}
                    style={[styles.swatch, { backgroundColor: item, borderColor: color === item ? colors.text : item }]}
                  />
                ))}
              </ScrollView>
            </View>

            {accountType === 'credit' ? (
              <View style={styles.creditDetails}>
                <View>
                  <AppText variant="caption">Credit details</AppText>
                  <AppText variant="body" style={styles.helpText}>Use a negative current balance for money owed.</AppText>
                </View>
                <TextInput keyboardType="decimal-pad" placeholder="Credit limit" placeholderTextColor={colors.muted} value={creditLimit} onChangeText={setCreditLimit} style={[styles.input, { borderColor: colors.border, color: colors.text }]} />
                <View style={styles.inputRow}>
                  <TextInput keyboardType="number-pad" placeholder="Statement day" placeholderTextColor={colors.muted} value={statementDay} onChangeText={setStatementDay} style={[styles.input, styles.flex, { borderColor: colors.border, color: colors.text }]} />
                  <TextInput keyboardType="number-pad" placeholder="Due day" placeholderTextColor={colors.muted} value={paymentDueDay} onChangeText={setPaymentDueDay} style={[styles.input, styles.flex, { borderColor: colors.border, color: colors.text }]} />
                </View>
                <View style={styles.inputRow}>
                  <TextInput keyboardType="decimal-pad" placeholder="Minimum payment" placeholderTextColor={colors.muted} value={minimumPayment} onChangeText={setMinimumPayment} style={[styles.input, styles.flex, { borderColor: colors.border, color: colors.text }]} />
                  <TextInput keyboardType="decimal-pad" placeholder="APR %" placeholderTextColor={colors.muted} value={annualInterestRate} onChangeText={setAnnualInterestRate} style={[styles.input, styles.flex, { borderColor: colors.border, color: colors.text }]} />
                </View>
              </View>
            ) : null}

            {accountType === 'savings' ? (
              <View style={styles.savingsDetails}>
                <AppText variant="caption">Savings details</AppText>
                <TextInput
                  keyboardType="decimal-pad"
                  placeholder="Interest rate %"
                  placeholderTextColor={colors.muted}
                  value={annualInterestRate}
                  onChangeText={setAnnualInterestRate}
                  style={[styles.input, { borderColor: colors.border, color: colors.text }]}
                />
                <View style={styles.inputRow}>
                  <View style={styles.flex}>
                    <AppText variant="caption">Start date</AppText>
                    <Pressable
                      style={[styles.dateButton, { borderColor: colors.border, backgroundColor: colors.surface }]}
                      onPress={() => setActiveSavingsDatePicker('start')}
                    >
                      <AppText style={styles.dateButtonText}>{formatDateInput(savingsStartDate)}</AppText>
                      <Ionicons name="calendar-outline" size={18} color={colors.muted} />
                    </Pressable>
                  </View>
                  <View style={styles.flex}>
                    <AppText variant="caption">End date</AppText>
                    <Pressable
                      style={[styles.dateButton, { borderColor: colors.border, backgroundColor: colors.surface }]}
                      onPress={() => setActiveSavingsDatePicker('end')}
                    >
                      <AppText style={styles.dateButtonText}>{formatDateInput(savingsEndDate)}</AppText>
                      <Ionicons name="calendar-outline" size={18} color={colors.muted} />
                    </Pressable>
                  </View>
                </View>
              </View>
            ) : null}

            <View style={styles.inputGroup}>
              <AppText variant="caption">{`${accountType === 'credit' ? 'Current balance' : 'Opening balance'} (${currency})`}</AppText>
              <TextInput
                keyboardType={accountType === 'credit' ? 'numbers-and-punctuation' : 'decimal-pad'}
                placeholder="0"
                placeholderTextColor={colors.muted}
                value={balance}
                onChangeText={setBalance}
                style={[styles.amountInput, { borderColor: colors.border, color: colors.text }]}
              />
            </View>
          </>
        )}
      </Card>

      <PrimaryButton label={editingAccount ? 'Save account' : 'Create account'} icon="checkmark-circle-outline" onPress={handleSubmit} />
      {editingAccount ? (
        <Pressable style={[styles.deleteButton, { borderColor: colors.danger }]} onPress={confirmDelete}>
          <AppText color={colors.danger} style={styles.deleteLabel}>Delete account</AppText>
        </Pressable>
      ) : null}
      <Modal animationType="fade" transparent visible={Boolean(activeSavingsDatePicker)} onRequestClose={() => setActiveSavingsDatePicker(null)}>
        <View style={styles.modalScrim}>
          <View style={[styles.datePickerCard, { backgroundColor: colors.surface }]}>
            <View style={styles.modalHeader}>
              <AppText variant="heading">{activeSavingsDatePicker === 'start' ? 'Start date' : 'End date'}</AppText>
              <Pressable style={[styles.closeButton, { borderColor: colors.border }]} onPress={() => setActiveSavingsDatePicker(null)}>
                <AppText style={styles.closeButtonText}>Done</AppText>
              </Pressable>
            </View>
            <DateTimePicker
              display="spinner"
              mode="date"
              value={activeSavingsDatePicker === 'start' ? savingsStartDate : savingsEndDate}
              onChange={(_, selectedDate) => {
                if (!selectedDate) {
                  return;
                }

                const nextDate = toDateOnly(selectedDate);

                if (activeSavingsDatePicker === 'start') {
                  setSavingsStartDate(nextDate);

                  if (formatDateInput(savingsEndDate) < formatDateInput(nextDate)) {
                    setSavingsEndDate(nextDate);
                  }
                  return;
                }

                setSavingsEndDate(nextDate);
              }}
              textColor={colors.text}
            />
          </View>
        </View>
      </Modal>
    </Screen>
  );
}

export function AddCryptoHoldingScreen() {
  const navigation = useNavigation<CryptoHoldingNavigation>();
  const route = useRoute<CryptoHoldingRoute>();
  const { colors } = useAppTheme();
  const [cryptoId, setCryptoId] = useState<CryptoId>(route.params?.holding?.cryptoId ?? 'bitcoin');
  const [quantity, setQuantity] = useState(route.params?.holding ? String(route.params.holding.quantity) : '');
  const [isCryptoDropdownOpen, setIsCryptoDropdownOpen] = useState(false);
  const selectedCrypto = getCryptoAsset(cryptoId);

  function saveHolding() {
    const parsedQuantity = parseAmount(quantity);

    if (!Number.isFinite(parsedQuantity) || parsedQuantity <= 0) {
      Alert.alert('Invalid quantity', 'Enter a crypto quantity greater than zero.');
      return;
    }

    const nextHolding: CryptoHolding = {
      id: route.params?.holding?.id ?? `holding-${Date.now()}`,
      cryptoId: selectedCrypto.id,
      cryptoName: selectedCrypto.name,
      cryptoSymbol: selectedCrypto.symbol,
      quantity: parsedQuantity,
      priceUsd: route.params?.holding?.cryptoId === selectedCrypto.id ? route.params.holding.priceUsd ?? selectedCrypto.fallbackPriceUsd : selectedCrypto.fallbackPriceUsd,
      change24h: route.params?.holding?.cryptoId === selectedCrypto.id ? route.params.holding.change24h : undefined,
      lastPriceUpdatedAt: route.params?.holding?.cryptoId === selectedCrypto.id ? route.params.holding.lastPriceUpdatedAt : undefined,
      color: selectedCrypto.color,
    };

    navigation.dispatch(
      StackActions.popTo('AddAccount', { accountId: route.params?.accountId, cryptoHolding: nextHolding }, { merge: true }),
    );
  }

  return (
    <Screen>
      <Card style={styles.form}>
        <View style={styles.inputGroup}>
          <AppText variant="caption">Crypto asset</AppText>
          <Pressable
            style={[styles.dropdownButton, { borderColor: colors.border, backgroundColor: colors.surface }]}
            onPress={() => setIsCryptoDropdownOpen((value) => !value)}
          >
            <View style={[styles.assetDot, { backgroundColor: selectedCrypto.color }]} />
            <View style={styles.dropdownCopy}>
              <AppText style={styles.optionText}>{selectedCrypto.symbol} - {selectedCrypto.name}</AppText>
              <AppText variant="caption">Fallback price {formatCurrency(selectedCrypto.fallbackPriceUsd, 'USD')}</AppText>
            </View>
            <Ionicons name={isCryptoDropdownOpen ? 'chevron-up' : 'chevron-down'} size={20} color={colors.muted} />
          </Pressable>

          {isCryptoDropdownOpen ? (
            <View style={[styles.dropdownList, { borderColor: colors.border, backgroundColor: colors.surface }]}>
              <ScrollView nestedScrollEnabled showsVerticalScrollIndicator={false}>
                {supportedCryptoAssets.map((asset) => (
                  <Pressable
                    key={asset.id}
                    style={[styles.dropdownItem, { borderBottomColor: colors.border }]}
                    onPress={() => {
                      setCryptoId(asset.id);
                      setIsCryptoDropdownOpen(false);
                    }}
                  >
                    <View style={[styles.assetDot, { backgroundColor: asset.color }]} />
                    <View style={styles.dropdownCopy}>
                      <AppText style={styles.optionText}>{asset.symbol} - {asset.name}</AppText>
                      <AppText variant="caption">{formatCurrency(asset.fallbackPriceUsd, 'USD')}</AppText>
                    </View>
                    {asset.id === cryptoId ? <Ionicons name="checkmark-circle" size={20} color={colors.primary} /> : null}
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          ) : null}
        </View>

        <View style={styles.inputGroup}>
          <AppText variant="caption">Quantity</AppText>
          <TextInput
            keyboardType="decimal-pad"
            placeholder="0"
            placeholderTextColor={colors.muted}
            value={quantity}
            onChangeText={setQuantity}
            style={[styles.amountInput, { borderColor: colors.border, color: colors.text }]}
          />
        </View>
      </Card>
      <PrimaryButton label="Save asset" icon="checkmark-circle-outline" onPress={saveHolding} />
    </Screen>
  );
}

export function AddInvestmentHoldingScreen() {
  const navigation = useNavigation<InvestmentHoldingNavigation>();
  const route = useRoute<InvestmentHoldingRoute>();
  const { colors } = useAppTheme();
  const assetType = route.params?.assetType ?? route.params?.holding?.assetType ?? 'stock';
  const assets = getInvestmentAssets(assetType);
  const [assetId, setAssetId] = useState(route.params?.holding?.assetId ?? assets[0].id);
  const [quantity, setQuantity] = useState(route.params?.holding ? String(route.params.holding.quantity) : '');
  const [isAssetDropdownOpen, setIsAssetDropdownOpen] = useState(false);
  const selectedAsset = getInvestmentAsset(assetType, assetId);
  const [marketQuote, setMarketQuote] = useState(() => ({
    priceUsd: route.params?.holding?.assetId === selectedAsset.id ? route.params.holding.priceUsd ?? selectedAsset.fallbackPriceUsd : selectedAsset.fallbackPriceUsd,
    updatedAt: route.params?.holding?.assetId === selectedAsset.id ? route.params.holding.lastPriceUpdatedAt : undefined,
  }));

  useEffect(() => {
    let isActive = true;
    const fallbackQuote = {
      priceUsd: route.params?.holding?.assetId === selectedAsset.id ? route.params.holding.priceUsd ?? selectedAsset.fallbackPriceUsd : selectedAsset.fallbackPriceUsd,
      updatedAt: route.params?.holding?.assetId === selectedAsset.id ? route.params.holding.lastPriceUpdatedAt : undefined,
    };

    setMarketQuote(fallbackQuote);

    fetchInvestmentPrices([{ symbol: selectedAsset.symbol, type: assetType }])
      .then((prices) => {
        if (!isActive || !prices[0]) {
          return;
        }

        setMarketQuote({
          priceUsd: prices[0].priceUsd,
          updatedAt: new Date().toISOString(),
        });
      })
      .catch(() => undefined);

    return () => {
      isActive = false;
    };
  }, [assetType, route.params?.holding?.assetId, route.params?.holding?.lastPriceUpdatedAt, route.params?.holding?.priceUsd, selectedAsset.fallbackPriceUsd, selectedAsset.id, selectedAsset.symbol]);

  function saveHolding() {
    const parsedQuantity = parseAmount(quantity);

    if (!Number.isFinite(parsedQuantity) || parsedQuantity <= 0) {
      Alert.alert('Invalid quantity', 'Enter a unit quantity greater than zero.');
      return;
    }

    const nextHolding: InvestmentHolding = {
      id: route.params?.holding?.id ?? `holding-${Date.now()}`,
      assetId: selectedAsset.id,
      assetType,
      assetName: selectedAsset.name,
      assetSymbol: selectedAsset.symbol,
      quantity: parsedQuantity,
      priceUsd: marketQuote.priceUsd,
      lastPriceUpdatedAt: marketQuote.updatedAt,
      color: selectedAsset.color,
    };

    navigation.dispatch(
      StackActions.popTo('AddAccount', { accountId: route.params?.accountId, investmentHolding: nextHolding }, { merge: true }),
    );
  }

  return (
    <Screen>
      <Card style={styles.form}>
        <View style={styles.inputGroup}>
          <AppText variant="caption">{formatAccountType(assetType)}</AppText>
          <Pressable
            style={[styles.dropdownButton, { borderColor: colors.border, backgroundColor: colors.surface }]}
            onPress={() => setIsAssetDropdownOpen((value) => !value)}
          >
            <View style={[styles.assetDot, { backgroundColor: selectedAsset.color }]} />
            <View style={styles.dropdownCopy}>
              <AppText style={styles.optionText}>{selectedAsset.symbol} - {selectedAsset.name}</AppText>
              <AppText variant="caption">Price {formatCurrency(marketQuote.priceUsd, getInvestmentCurrency(assetType))}</AppText>
            </View>
            <Ionicons name={isAssetDropdownOpen ? 'chevron-up' : 'chevron-down'} size={20} color={colors.muted} />
          </Pressable>

          {isAssetDropdownOpen ? (
            <View style={[styles.dropdownList, { borderColor: colors.border, backgroundColor: colors.surface }]}>
              <ScrollView nestedScrollEnabled showsVerticalScrollIndicator={false}>
                {assets.map((asset) => (
                  <Pressable
                    key={asset.id}
                    style={[styles.dropdownItem, { borderBottomColor: colors.border }]}
                    onPress={() => {
                      setAssetId(asset.id);
                      setIsAssetDropdownOpen(false);
                    }}
                  >
                    <View style={[styles.assetDot, { backgroundColor: asset.color }]} />
                    <View style={styles.dropdownCopy}>
                      <AppText style={styles.optionText}>{asset.symbol} - {asset.name}</AppText>
                      <AppText variant="caption">{formatCurrency(asset.fallbackPriceUsd, getInvestmentCurrency(assetType))}</AppText>
                    </View>
                    {asset.id === assetId ? <Ionicons name="checkmark-circle" size={20} color={colors.primary} /> : null}
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          ) : null}
        </View>

        <View style={styles.inputGroup}>
          <AppText variant="caption">Quantity</AppText>
          <TextInput
            keyboardType="decimal-pad"
            placeholder="0"
            placeholderTextColor={colors.muted}
            value={quantity}
            onChangeText={setQuantity}
            style={[styles.amountInput, { borderColor: colors.border, color: colors.text }]}
          />
        </View>
      </Card>
      <PrimaryButton label="Save asset" icon="checkmark-circle-outline" onPress={saveHolding} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  segment: {
    flexDirection: 'row',
    gap: 8,
  },
  segmentItem: {
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    flex: 1,
    justifyContent: 'center',
    minHeight: 46,
  },
  segmentLabel: {
    fontWeight: '800',
  },
  form: {
    gap: 18,
  },
  inputGroup: {
    gap: 8,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 10,
  },
  flex: {
    flex: 1,
  },
  input: {
    borderWidth: 1,
    borderRadius: 14,
    fontSize: 16,
    fontWeight: '700',
    minHeight: 50,
    paddingHorizontal: 12,
  },
  amountInput: {
    borderBottomWidth: 1,
    fontSize: 34,
    fontWeight: '800',
    paddingVertical: 8,
  },
  optionText: {
    fontWeight: '800',
  },
  dropdownButton: {
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 10,
    minHeight: 58,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  dropdownCopy: {
    flex: 1,
    gap: 2,
  },
  dropdownList: {
    borderRadius: 14,
    borderWidth: 1,
    maxHeight: 280,
    overflow: 'hidden',
  },
  dropdownItem: {
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    gap: 10,
    minHeight: 56,
    paddingHorizontal: 12,
  },
  typeIcon: {
    alignItems: 'center',
    borderRadius: 12,
    height: 38,
    justifyContent: 'center',
    width: 38,
  },
  assetDot: {
    borderRadius: 999,
    height: 14,
    width: 14,
  },
  rowHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  smallButton: {
    alignItems: 'center',
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 4,
    minHeight: 34,
    paddingHorizontal: 10,
  },
  smallButtonText: {
    fontWeight: '800',
  },
  holdingList: {
    gap: 10,
  },
  assetChart: {
    marginTop: 6,
  },
  holdingRow: {
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 10,
    minHeight: 60,
    paddingHorizontal: 12,
  },
  holdingAmount: {
    alignItems: 'flex-end',
  },
  iconTap: {
    padding: 8,
  },
  swatches: {
    flexDirection: 'row',
    gap: 10,
  },
  swatch: {
    borderRadius: 999,
    borderWidth: 3,
    flexShrink: 0,
    height: 34,
    width: 34,
  },
  creditDetails: {
    gap: 10,
  },
  savingsDetails: {
    gap: 10,
  },
  helpText: {
    fontSize: 13,
    fontWeight: '600',
  },
  dateButton: {
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'space-between',
    marginTop: 8,
    minHeight: 50,
    paddingHorizontal: 12,
  },
  dateButtonText: {
    fontWeight: '800',
  },
  modalScrim: {
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.38)',
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  datePickerCard: {
    borderRadius: 20,
    padding: 18,
    width: '100%',
  },
  modalHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  closeButton: {
    alignItems: 'center',
    borderRadius: 999,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 36,
    paddingHorizontal: 14,
  },
  closeButtonText: {
    fontWeight: '800',
  },
  deleteButton: {
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 50,
  },
  deleteLabel: {
    fontWeight: '800',
  },
});
