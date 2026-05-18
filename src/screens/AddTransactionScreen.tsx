import React, { useMemo, useState } from 'react';
import { Alert, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';

import { AppText } from '../components/AppText';
import { Card } from '../components/Card';
import { PrimaryButton } from '../components/PrimaryButton';
import { Screen } from '../components/Screen';
import { CurrencyCode, TransactionType } from '../models/finance';
import { TransactionsStackParamList } from '../navigation/types';
import { useFinance } from '../store/FinanceStore';
import { useAppTheme } from '../theme/AppThemeProvider';

type Navigation = NativeStackNavigationProp<TransactionsStackParamList, 'AddTransaction'>;

const transactionTypes: TransactionType[] = ['expense', 'income', 'transfer'];

export function AddTransactionScreen() {
  const navigation = useNavigation<Navigation>();
  const { state, addTransaction } = useFinance();
  const { colors } = useAppTheme();
  const [type, setType] = useState<TransactionType>('expense');
  const [accountId, setAccountId] = useState(state.accounts[0]?.id ?? '');
  const [toAccountId, setToAccountId] = useState(state.accounts[1]?.id ?? '');
  const [categoryId, setCategoryId] = useState(state.categories.find((category) => category.type === 'expense')?.id ?? '');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');

  const account = state.accounts.find((item) => item.id === accountId);
  const availableCategories = useMemo(() => state.categories.filter((category) => category.type === type), [state.categories, type]);
  const currency: CurrencyCode = account?.currency ?? 'VND';

  function handleTypeChange(nextType: TransactionType) {
    setType(nextType);

    if (nextType !== 'transfer') {
      const nextCategory = state.categories.find((category) => category.type === nextType);
      setCategoryId(nextCategory?.id ?? '');
    }
  }

  function handleSubmit() {
    const parsedAmount = Number(amount.replace(/,/g, '.'));

    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      Alert.alert('Invalid amount', 'Enter an amount greater than zero.');
      return;
    }

    if (type === 'transfer' && accountId === toAccountId) {
      Alert.alert('Choose another account', 'Transfers need a different destination account.');
      return;
    }

    addTransaction({
      type,
      amount: parsedAmount,
      currency,
      accountId,
      toAccountId: type === 'transfer' ? toAccountId : undefined,
      categoryId: type === 'transfer' ? undefined : categoryId,
      note: note.trim() || undefined,
    });

    navigation.goBack();
  }

  return (
    <Screen>
      <View style={styles.block}>
        <AppText variant="caption">Type</AppText>
        <View style={styles.segment}>
          {transactionTypes.map((item) => {
            const selected = item === type;
            return (
              <Pressable
                key={item}
                style={[styles.segmentItem, { backgroundColor: selected ? colors.primary : colors.surface, borderColor: colors.border }]}
                onPress={() => handleTypeChange(item)}
              >
                <AppText color={selected ? '#FFFFFF' : colors.text} style={styles.segmentLabel}>
                  {item[0].toUpperCase()}
                  {item.slice(1)}
                </AppText>
              </Pressable>
            );
          })}
        </View>
      </View>

      <Card style={styles.form}>
        <View style={styles.inputGroup}>
          <AppText variant="caption">Amount ({currency})</AppText>
          <TextInput
            keyboardType="decimal-pad"
            placeholder="0"
            placeholderTextColor={colors.muted}
            value={amount}
            onChangeText={setAmount}
            style={[styles.amountInput, { color: colors.text, borderColor: colors.border }]}
          />
        </View>

        <View style={styles.inputGroup}>
          <AppText variant="caption">From account</AppText>
          <View style={styles.optionGrid}>
            {state.accounts.map((item) => (
              <Pressable
                key={item.id}
                style={[styles.option, { borderColor: item.id === accountId ? colors.primary : colors.border, backgroundColor: colors.surface }]}
                onPress={() => setAccountId(item.id)}
              >
                <AppText style={styles.optionText}>{item.name}</AppText>
              </Pressable>
            ))}
          </View>
        </View>

        {type === 'transfer' ? (
          <View style={styles.inputGroup}>
            <AppText variant="caption">To account</AppText>
            <View style={styles.optionGrid}>
              {state.accounts.map((item) => (
                <Pressable
                  key={item.id}
                  style={[styles.option, { borderColor: item.id === toAccountId ? colors.primary : colors.border, backgroundColor: colors.surface }]}
                  onPress={() => setToAccountId(item.id)}
                >
                  <AppText style={styles.optionText}>{item.name}</AppText>
                </Pressable>
              ))}
            </View>
          </View>
        ) : (
          <View style={styles.inputGroup}>
            <AppText variant="caption">Category</AppText>
            <View style={styles.optionGrid}>
              {availableCategories.map((item) => (
                <Pressable
                  key={item.id}
                  style={[styles.option, { borderColor: item.id === categoryId ? colors.primary : colors.border, backgroundColor: colors.surface }]}
                  onPress={() => setCategoryId(item.id)}
                >
                  <AppText style={styles.optionText}>{item.name}</AppText>
                </Pressable>
              ))}
            </View>
          </View>
        )}

        <View style={styles.inputGroup}>
          <AppText variant="caption">Note</AppText>
          <TextInput
            placeholder="Optional"
            placeholderTextColor={colors.muted}
            value={note}
            onChangeText={setNote}
            style={[styles.noteInput, { color: colors.text, borderColor: colors.border }]}
          />
        </View>
      </Card>

      <PrimaryButton label="Save transaction" icon="checkmark-circle-outline" onPress={handleSubmit} />
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
    minHeight: 46,
    justifyContent: 'center',
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
    minHeight: 42,
    paddingHorizontal: 12,
    justifyContent: 'center',
  },
  optionText: {
    fontWeight: '700',
  },
  noteInput: {
    borderWidth: 1,
    borderRadius: 14,
    minHeight: 48,
    paddingHorizontal: 12,
  },
});
