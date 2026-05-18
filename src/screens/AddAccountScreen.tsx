import React, { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { RouteProp, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';

import { AppText } from '../components/AppText';
import { Card } from '../components/Card';
import { PrimaryButton } from '../components/PrimaryButton';
import { Screen } from '../components/Screen';
import { getCryptoAsset, supportedCryptoAssets } from '../data/cryptoAssets';
import { AccountType, CryptoId, CurrencyCode } from '../models/finance';
import { AccountsStackParamList } from '../navigation/types';
import { useFinance } from '../store/FinanceStore';
import { useAppTheme } from '../theme/AppThemeProvider';
import { formatCurrency } from '../utils/currency';
import { formatAccountType } from '../utils/labels';

type Navigation = NativeStackNavigationProp<AccountsStackParamList, 'AddAccount'>;
type Route = RouteProp<AccountsStackParamList, 'AddAccount'>;

const regularAccountTypes: AccountType[] = ['cash', 'bank', 'ewallet', 'savings', 'foreign', 'credit'];
const accountColors = ['#50A878', '#3D7BFF', '#F59E0B', '#8B5CF6', '#0891B2', '#D94841', '#7C3AED'];
const iconsByType: Record<AccountType, string> = {
  cash: 'wallet-outline',
  bank: 'business-outline',
  ewallet: 'phone-portrait-outline',
  savings: 'lock-closed-outline',
  foreign: 'earth-outline',
  credit: 'card-outline',
  crypto: 'logo-bitcoin',
};

export function AddAccountScreen() {
  const navigation = useNavigation<Navigation>();
  const route = useRoute<Route>();
  const { state, addAccount, updateAccount, deleteAccount } = useFinance();
  const { colors } = useAppTheme();
  const editingAccount = state.accounts.find((account) => account.id === route.params?.accountId);
  const [mode, setMode] = useState<'regular' | 'crypto'>(editingAccount?.type === 'crypto' ? 'crypto' : 'regular');
  const [name, setName] = useState(editingAccount?.name ?? '');
  const [accountType, setAccountType] = useState<AccountType>(editingAccount && editingAccount.type !== 'crypto' ? editingAccount.type : 'cash');
  const [currency, setCurrency] = useState<CurrencyCode>(editingAccount?.currency ?? 'VND');
  const [balance, setBalance] = useState(editingAccount ? String(editingAccount.balance) : '');
  const [color, setColor] = useState(editingAccount?.color ?? accountColors[0]);
  const [cryptoId, setCryptoId] = useState<CryptoId>(editingAccount?.cryptoId ?? 'bitcoin');
  const [isCryptoDropdownOpen, setIsCryptoDropdownOpen] = useState(false);
  const [creditLimit, setCreditLimit] = useState(editingAccount?.creditLimit ? String(editingAccount.creditLimit) : '');
  const [statementDay, setStatementDay] = useState(editingAccount?.statementDay ? String(editingAccount.statementDay) : '20');
  const [paymentDueDay, setPaymentDueDay] = useState(editingAccount?.paymentDueDay ? String(editingAccount.paymentDueDay) : '5');
  const [minimumPayment, setMinimumPayment] = useState(editingAccount?.minimumPayment ? String(editingAccount.minimumPayment) : '');
  const [annualInterestRate, setAnnualInterestRate] = useState(editingAccount?.annualInterestRate ? String(editingAccount.annualInterestRate) : '');
  const selectedCrypto = getCryptoAsset(cryptoId);

  function parseAmount(value: string) {
    return Number(value.replace(/,/g, '.'));
  }

  function handleSubmit() {
    const parsedBalance = parseAmount(balance);

    if (!Number.isFinite(parsedBalance) || (mode !== 'regular' || accountType !== 'credit') && parsedBalance < 0) {
      Alert.alert('Invalid amount', 'Enter a valid balance or crypto quantity.');
      return;
    }

    if (mode === 'crypto') {
      const asset = getCryptoAsset(cryptoId);
      const nextAccount = {
        name: name.trim() || `${asset.symbol} Wallet`,
        type: 'crypto',
        currency: 'USD',
        balance: parsedBalance,
        icon: 'logo-bitcoin',
        color: asset.color,
        cryptoId: asset.id,
        cryptoName: asset.name,
        cryptoSymbol: asset.symbol,
        cryptoPriceUsd: asset.fallbackPriceUsd,
        creditLimit: undefined,
        statementDay: undefined,
        paymentDueDay: undefined,
        minimumPayment: undefined,
        annualInterestRate: undefined,
      } as const;

      if (editingAccount) {
        updateAccount(editingAccount.id, nextAccount);
      } else {
        addAccount(nextAccount);
      }

      navigation.goBack();
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
      annualInterestRate: accountType === 'credit' ? parsedInterestRate : undefined,
      cryptoId: undefined,
      cryptoName: undefined,
      cryptoSymbol: undefined,
      cryptoPriceUsd: undefined,
      crypto24hChange: undefined,
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
      <View style={styles.block}>
        <AppText variant="caption">Account kind</AppText>
        <View style={styles.segment}>
          {(['regular', 'crypto'] as const).map((item) => {
            const selected = mode === item;
            return (
              <Pressable
                key={item}
                style={[styles.segmentItem, { backgroundColor: selected ? colors.primary : colors.surface, borderColor: colors.border }]}
                onPress={() => setMode(item)}
              >
                <AppText color={selected ? '#FFFFFF' : colors.text} style={styles.segmentLabel}>
                  {item === 'regular' ? 'Money' : 'Crypto'}
                </AppText>
              </Pressable>
            );
          })}
        </View>
      </View>

      <Card style={styles.form}>
        <View style={styles.inputGroup}>
          <AppText variant="caption">Name</AppText>
          <TextInput
            placeholder={mode === 'crypto' ? 'BTC Wallet' : 'My account'}
            placeholderTextColor={colors.muted}
            value={name}
            onChangeText={setName}
            style={[styles.input, { borderColor: colors.border, color: colors.text }]}
          />
        </View>

        {mode === 'regular' ? (
          <>
            <View style={styles.inputGroup}>
              <AppText variant="caption">Type</AppText>
              <View style={styles.optionGrid}>
                {regularAccountTypes.map((item) => (
                  <Pressable
                    key={item}
                    style={[styles.option, { borderColor: item === accountType ? colors.primary : colors.border, backgroundColor: colors.surface }]}
                    onPress={() => setAccountType(item)}
                  >
                    <AppText style={styles.optionText}>{formatAccountType(item)}</AppText>
                  </Pressable>
                ))}
              </View>
            </View>

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
                      <AppText color={selected ? '#FFFFFF' : colors.text} style={styles.segmentLabel}>
                        {item}
                      </AppText>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <AppText variant="caption">Color</AppText>
              <View style={styles.swatches}>
                {accountColors.map((item) => (
                  <Pressable
                    key={item}
                    accessibilityLabel={`Select ${item}`}
                    onPress={() => setColor(item)}
                    style={[styles.swatch, { backgroundColor: item, borderColor: color === item ? colors.text : item }]}
                  />
                ))}
              </View>
            </View>

            {accountType === 'credit' ? (
              <View style={styles.creditDetails}>
                <View>
                  <AppText variant="caption">Credit details</AppText>
                  <AppText variant="body" style={styles.helpText}>
                    Use a negative current balance for money owed.
                  </AppText>
                </View>
                <TextInput
                  keyboardType="decimal-pad"
                  placeholder="Credit limit"
                  placeholderTextColor={colors.muted}
                  value={creditLimit}
                  onChangeText={setCreditLimit}
                  style={[styles.input, { borderColor: colors.border, color: colors.text }]}
                />
                <View style={styles.inputRow}>
                  <TextInput
                    keyboardType="number-pad"
                    placeholder="Statement day"
                    placeholderTextColor={colors.muted}
                    value={statementDay}
                    onChangeText={setStatementDay}
                    style={[styles.input, styles.flex, { borderColor: colors.border, color: colors.text }]}
                  />
                  <TextInput
                    keyboardType="number-pad"
                    placeholder="Due day"
                    placeholderTextColor={colors.muted}
                    value={paymentDueDay}
                    onChangeText={setPaymentDueDay}
                    style={[styles.input, styles.flex, { borderColor: colors.border, color: colors.text }]}
                  />
                </View>
                <View style={styles.inputRow}>
                  <TextInput
                    keyboardType="decimal-pad"
                    placeholder="Minimum payment"
                    placeholderTextColor={colors.muted}
                    value={minimumPayment}
                    onChangeText={setMinimumPayment}
                    style={[styles.input, styles.flex, { borderColor: colors.border, color: colors.text }]}
                  />
                  <TextInput
                    keyboardType="decimal-pad"
                    placeholder="APR %"
                    placeholderTextColor={colors.muted}
                    value={annualInterestRate}
                    onChangeText={setAnnualInterestRate}
                    style={[styles.input, styles.flex, { borderColor: colors.border, color: colors.text }]}
                  />
                </View>
              </View>
            ) : null}
          </>
        ) : (
          <View style={styles.inputGroup}>
            <AppText variant="caption">Crypto asset</AppText>
            <Pressable
              style={[styles.dropdownButton, { borderColor: colors.border, backgroundColor: colors.surface }]}
              onPress={() => setIsCryptoDropdownOpen((value) => !value)}
            >
              <View style={[styles.assetDot, { backgroundColor: selectedCrypto.color }]} />
              <View style={styles.dropdownCopy}>
                <AppText style={styles.optionText}>
                  {selectedCrypto.symbol} - {selectedCrypto.name}
                </AppText>
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
                        <AppText style={styles.optionText}>
                          {asset.symbol} - {asset.name}
                        </AppText>
                        <AppText variant="caption">{formatCurrency(asset.fallbackPriceUsd, 'USD')}</AppText>
                      </View>
                      {asset.id === cryptoId ? <Ionicons name="checkmark-circle" size={20} color={colors.primary} /> : null}
                    </Pressable>
                  ))}
                </ScrollView>
              </View>
            ) : null}
          </View>
        )}

        <View style={styles.inputGroup}>
          <AppText variant="caption">{mode === 'crypto' ? 'Quantity' : `${accountType === 'credit' ? 'Current balance' : 'Opening balance'} (${currency})`}</AppText>
          <TextInput
            keyboardType={mode === 'regular' && accountType === 'credit' ? 'numbers-and-punctuation' : 'decimal-pad'}
            placeholder="0"
            placeholderTextColor={colors.muted}
            value={balance}
            onChangeText={setBalance}
            style={[styles.amountInput, { borderColor: colors.border, color: colors.text }]}
          />
        </View>
      </Card>

      <PrimaryButton label={editingAccount ? 'Save account' : 'Create account'} icon="checkmark-circle-outline" onPress={handleSubmit} />
      {editingAccount ? (
        <Pressable style={[styles.deleteButton, { borderColor: colors.danger }]} onPress={confirmDelete}>
          <AppText color={colors.danger} style={styles.deleteLabel}>
            Delete account
          </AppText>
        </Pressable>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  block: {
    gap: 8,
  },
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
  optionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  option: {
    borderRadius: 14,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 42,
    paddingHorizontal: 12,
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
  assetDot: {
    borderRadius: 999,
    height: 14,
    width: 14,
  },
  swatches: {
    flexDirection: 'row',
    gap: 10,
  },
  swatch: {
    borderRadius: 999,
    borderWidth: 3,
    height: 34,
    width: 34,
  },
  creditDetails: {
    gap: 10,
  },
  helpText: {
    fontSize: 13,
    fontWeight: '600',
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
