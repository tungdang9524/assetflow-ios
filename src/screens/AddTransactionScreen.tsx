import React, { useMemo, useState } from 'react';
import { Alert, Modal, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';

import { AppText } from '../components/AppText';
import { Card } from '../components/Card';
import { PrimaryButton } from '../components/PrimaryButton';
import { Screen } from '../components/Screen';
import { CurrencyCode, TransactionType } from '../models/finance';
import { TransactionsStackParamList } from '../navigation/types';
import { useFinance } from '../store/FinanceStore';
import { useAppTheme } from '../theme/AppThemeProvider';
import { convertCurrency } from '../utils/currency';

type Navigation = NativeStackNavigationProp<TransactionsStackParamList, 'AddTransaction'>;
type Route = RouteProp<TransactionsStackParamList, 'AddTransaction'>;

const transactionTypes: TransactionType[] = ['expense', 'income', 'transfer'];
type DropdownKey = 'category' | 'fromAccount' | 'savingsGoal' | 'toAccount';

function formatDateInput(date: Date) {
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

function mergeDateWithExistingTime(date: Date, existingDate?: string) {
  const timeSource = existingDate ? new Date(existingDate) : new Date();
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    timeSource.getHours(),
    timeSource.getMinutes(),
    timeSource.getSeconds(),
    timeSource.getMilliseconds(),
  );
}

export function AddTransactionScreen() {
  const navigation = useNavigation<Navigation>();
  const route = useRoute<Route>();
  const { state, addTransaction, updateSavingsGoal, updateTransaction, deleteTransaction } = useFinance();
  const { colors } = useAppTheme();
  const moneyAccounts = state.accounts.filter((item) => item.type !== 'crypto');
  const editingTransaction = state.transactions.find((transaction) => transaction.id === route.params?.transactionId);
  const [type, setType] = useState<TransactionType>(editingTransaction?.type ?? 'expense');
  const [accountId, setAccountId] = useState(editingTransaction?.accountId ?? moneyAccounts[0]?.id ?? '');
  const [toAccountId, setToAccountId] = useState(editingTransaction?.toAccountId ?? moneyAccounts[1]?.id ?? moneyAccounts[0]?.id ?? '');
  const [categoryId, setCategoryId] = useState(
    editingTransaction?.categoryId ?? state.categories.find((category) => category.type === (editingTransaction?.type ?? 'expense'))?.id ?? '',
  );
  const [amount, setAmount] = useState(editingTransaction ? String(editingTransaction.amount) : '');
  const [note, setNote] = useState(editingTransaction?.note ?? '');
  const [savingsGoalId, setSavingsGoalId] = useState('');
  const [transactionDate, setTransactionDate] = useState(() => new Date(editingTransaction?.date ?? new Date()));
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<DropdownKey | null>(null);

  const account = moneyAccounts.find((item) => item.id === accountId) ?? moneyAccounts[0];
  const availableCategories = useMemo(() => state.categories.filter((category) => category.type === type), [state.categories, type]);
  const selectedSavingsGoal = state.savingsGoals.find((goal) => goal.id === savingsGoalId);
  const currency: CurrencyCode = account?.currency ?? 'VND';

  function handleTypeChange(nextType: TransactionType) {
    setType(nextType);
    setOpenDropdown(null);

    if (nextType !== 'transfer') {
      const nextCategory = state.categories.find((category) => category.type === nextType);
      setCategoryId(nextCategory?.id ?? '');
    }

    if (nextType !== 'income') {
      setSavingsGoalId('');
    }
  }

  function toggleDropdown(dropdown: DropdownKey) {
    setOpenDropdown((current) => (current === dropdown ? null : dropdown));
  }

  function handleSubmit() {
    const parsedAmount = Number(amount.replace(/,/g, '.'));

    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      Alert.alert('Invalid amount', 'Enter an amount greater than zero.');
      return;
    }

    if (!account) {
      Alert.alert('No money account', 'Create a cash, bank, e-wallet, savings, credit, or USD account first.');
      return;
    }

    if (type === 'transfer' && account.id === toAccountId) {
      Alert.alert('Choose another account', 'Transfers need a different destination account.');
      return;
    }

    const nextTransaction = {
      type,
      amount: parsedAmount,
      currency,
      accountId: account.id,
      toAccountId: type === 'transfer' ? toAccountId : undefined,
      categoryId: type === 'transfer' ? undefined : categoryId,
      date: mergeDateWithExistingTime(transactionDate, editingTransaction?.date).toISOString(),
      note: note.trim() || undefined,
    };

    if (editingTransaction) {
      const result = updateTransaction(editingTransaction.id, nextTransaction);

      if (!result.ok) {
        Alert.alert('Transaction blocked', result.error ?? 'This transaction would make the account balance invalid.');
        return;
      }
    } else {
      const result = addTransaction(nextTransaction);

      if (!result.ok) {
        Alert.alert('Transaction blocked', result.error ?? 'This transaction would make the account balance invalid.');
        return;
      }

      if (type === 'income' && selectedSavingsGoal) {
        const savingsAmount = convertCurrency(parsedAmount, currency, selectedSavingsGoal.currency, state.settings.usdToVndRate);
        updateSavingsGoal(selectedSavingsGoal.id, {
          currentAmount: selectedSavingsGoal.currentAmount + savingsAmount,
        });
      }
    }

    navigation.goBack();
  }

  function confirmDelete() {
    if (!editingTransaction) {
      return;
    }

    Alert.alert('Delete transaction', 'This will reverse the balance impact of this transaction.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          deleteTransaction(editingTransaction.id);
          navigation.goBack();
        },
      },
    ]);
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
          <AppText variant="caption">Date</AppText>
          <Pressable
            style={[styles.dropdownButton, { borderColor: colors.border, backgroundColor: colors.surface }]}
            onPress={() => {
              setOpenDropdown(null);
              setIsDatePickerOpen(true);
            }}
          >
            <AppText style={styles.dropdownText}>{formatDateInput(transactionDate)}</AppText>
            <Ionicons name="calendar-outline" size={18} color={colors.muted} />
          </Pressable>
        </View>

        <View style={styles.inputGroup}>
          <AppText variant="caption">From account</AppText>
          <Pressable
            style={[styles.dropdownButton, { borderColor: colors.border, backgroundColor: colors.surface }]}
            onPress={() => toggleDropdown('fromAccount')}
          >
            <AppText color={account ? colors.text : colors.muted} style={styles.dropdownText}>
              {account?.name ?? 'Choose account'}
            </AppText>
            <Ionicons name={openDropdown === 'fromAccount' ? 'chevron-up' : 'chevron-down'} size={18} color={colors.muted} />
          </Pressable>
          {openDropdown === 'fromAccount' ? (
            <View style={[styles.dropdownList, { borderColor: colors.border, backgroundColor: colors.surface }]}>
              <ScrollView nestedScrollEnabled showsVerticalScrollIndicator={false}>
                {moneyAccounts.map((item, index) => (
                  <Pressable
                    key={item.id}
                    style={[styles.dropdownItem, { borderBottomColor: colors.border, borderBottomWidth: index === moneyAccounts.length - 1 ? 0 : StyleSheet.hairlineWidth }]}
                    onPress={() => {
                      setAccountId(item.id);
                      setOpenDropdown(null);
                    }}
                  >
                    <AppText style={styles.dropdownItemText}>{item.name}</AppText>
                    {item.id === accountId ? <Ionicons name="checkmark" size={18} color={colors.primary} /> : null}
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          ) : null}
        </View>

        {type === 'transfer' ? (
          <View style={styles.inputGroup}>
            <AppText variant="caption">To account</AppText>
            <Pressable
              style={[styles.dropdownButton, { borderColor: colors.border, backgroundColor: colors.surface }]}
              onPress={() => toggleDropdown('toAccount')}
            >
              <AppText color={moneyAccounts.find((item) => item.id === toAccountId) ? colors.text : colors.muted} style={styles.dropdownText}>
                {moneyAccounts.find((item) => item.id === toAccountId)?.name ?? 'Choose account'}
              </AppText>
              <Ionicons name={openDropdown === 'toAccount' ? 'chevron-up' : 'chevron-down'} size={18} color={colors.muted} />
            </Pressable>
            {openDropdown === 'toAccount' ? (
              <View style={[styles.dropdownList, { borderColor: colors.border, backgroundColor: colors.surface }]}>
                <ScrollView nestedScrollEnabled showsVerticalScrollIndicator={false}>
                  {moneyAccounts.map((item, index) => (
                    <Pressable
                      key={item.id}
                      style={[styles.dropdownItem, { borderBottomColor: colors.border, borderBottomWidth: index === moneyAccounts.length - 1 ? 0 : StyleSheet.hairlineWidth }]}
                      onPress={() => {
                        setToAccountId(item.id);
                        setOpenDropdown(null);
                      }}
                    >
                      <AppText style={styles.dropdownItemText}>{item.name}</AppText>
                      {item.id === toAccountId ? <Ionicons name="checkmark" size={18} color={colors.primary} /> : null}
                    </Pressable>
                  ))}
                </ScrollView>
              </View>
            ) : null}
          </View>
        ) : (
          <View style={styles.inputGroup}>
            <AppText variant="caption">Category</AppText>
            <Pressable
              style={[styles.dropdownButton, { borderColor: colors.border, backgroundColor: colors.surface }]}
              onPress={() => toggleDropdown('category')}
            >
              <View style={styles.dropdownValue}>
                {availableCategories.find((item) => item.id === categoryId) ? (
                  <View style={[styles.categoryDot, { backgroundColor: availableCategories.find((item) => item.id === categoryId)?.color }]} />
                ) : null}
                <AppText color={availableCategories.find((item) => item.id === categoryId) ? colors.text : colors.muted} style={styles.dropdownText}>
                  {availableCategories.find((item) => item.id === categoryId)?.name ?? 'Choose category'}
                </AppText>
              </View>
              <Ionicons name={openDropdown === 'category' ? 'chevron-up' : 'chevron-down'} size={18} color={colors.muted} />
            </Pressable>
            {openDropdown === 'category' ? (
              <View style={[styles.dropdownList, { borderColor: colors.border, backgroundColor: colors.surface }]}>
                <ScrollView nestedScrollEnabled showsVerticalScrollIndicator={false}>
                  {availableCategories.map((item, index) => (
                    <Pressable
                      key={item.id}
                      style={[styles.dropdownItem, { borderBottomColor: colors.border, borderBottomWidth: index === availableCategories.length - 1 ? 0 : StyleSheet.hairlineWidth }]}
                      onPress={() => {
                        setCategoryId(item.id);
                        setOpenDropdown(null);
                      }}
                    >
                      <View style={[styles.categoryDot, { backgroundColor: item.color }]} />
                      <AppText style={styles.dropdownItemText}>{item.name}</AppText>
                      {item.id === categoryId ? <Ionicons name="checkmark" size={18} color={colors.primary} /> : null}
                    </Pressable>
                  ))}
                </ScrollView>
              </View>
            ) : null}
          </View>
        )}

        {!editingTransaction && type === 'income' ? (
          <View style={styles.inputGroup}>
            <AppText variant="caption">Add to savings (optional)</AppText>
            <Pressable
              style={[styles.dropdownButton, { borderColor: colors.border, backgroundColor: colors.surface }]}
              onPress={() => toggleDropdown('savingsGoal')}
            >
              <AppText color={selectedSavingsGoal ? colors.text : colors.muted} style={styles.dropdownText}>
                {selectedSavingsGoal?.name ?? 'No savings goal'}
              </AppText>
              <Ionicons name={openDropdown === 'savingsGoal' ? 'chevron-up' : 'chevron-down'} size={18} color={colors.muted} />
            </Pressable>
            {openDropdown === 'savingsGoal' ? (
              <View style={[styles.dropdownList, { borderColor: colors.border, backgroundColor: colors.surface }]}>
                <ScrollView nestedScrollEnabled showsVerticalScrollIndicator={false}>
                  <Pressable
                    style={[styles.dropdownItem, { borderBottomColor: colors.border, borderBottomWidth: StyleSheet.hairlineWidth }]}
                    onPress={() => {
                      setSavingsGoalId('');
                      setOpenDropdown(null);
                    }}
                  >
                    <AppText style={styles.dropdownItemText}>No savings goal</AppText>
                    {!savingsGoalId ? <Ionicons name="checkmark" size={18} color={colors.primary} /> : null}
                  </Pressable>
                  {state.savingsGoals.map((goal, index) => (
                    <Pressable
                      key={goal.id}
                      style={[styles.dropdownItem, { borderBottomColor: colors.border, borderBottomWidth: index === state.savingsGoals.length - 1 ? 0 : StyleSheet.hairlineWidth }]}
                      onPress={() => {
                        setSavingsGoalId(goal.id);
                        setOpenDropdown(null);
                      }}
                    >
                      <View style={[styles.categoryDot, { backgroundColor: goal.color }]} />
                      <AppText style={styles.dropdownItemText}>{goal.name}</AppText>
                      {goal.id === savingsGoalId ? <Ionicons name="checkmark" size={18} color={colors.primary} /> : null}
                    </Pressable>
                  ))}
                </ScrollView>
              </View>
            ) : null}
          </View>
        ) : null}

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

      <PrimaryButton label={editingTransaction ? 'Save transaction' : 'Save transaction'} icon="checkmark-circle-outline" onPress={handleSubmit} />
      {editingTransaction ? (
        <Pressable style={[styles.deleteButton, { borderColor: colors.danger }]} onPress={confirmDelete}>
          <AppText color={colors.danger} style={styles.deleteLabel}>
            Delete transaction
          </AppText>
        </Pressable>
      ) : null}
      <Modal animationType="fade" transparent visible={isDatePickerOpen} onRequestClose={() => setIsDatePickerOpen(false)}>
        <View style={styles.modalScrim}>
          <View style={[styles.datePickerCard, { backgroundColor: colors.surface }]}>
            <View style={styles.modalHeader}>
              <AppText variant="heading">Select date</AppText>
              <Pressable style={[styles.closeButton, { borderColor: colors.border }]} onPress={() => setIsDatePickerOpen(false)}>
                <AppText style={styles.closeButtonText}>Done</AppText>
              </Pressable>
            </View>
            <DateTimePicker
              display="spinner"
              mode="date"
              value={transactionDate}
              onChange={(_, selectedDate) => {
                if (selectedDate) {
                  setTransactionDate(selectedDate);
                }
              }}
              textColor={colors.text}
            />
          </View>
        </View>
      </Modal>
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
  dropdownButton: {
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 50,
    paddingHorizontal: 12,
  },
  dropdownValue: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    gap: 8,
  },
  dropdownText: {
    flex: 1,
    fontWeight: '800',
  },
  dropdownList: {
    borderRadius: 14,
    borderWidth: 1,
    maxHeight: 230,
    overflow: 'hidden',
  },
  dropdownItem: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    minHeight: 46,
    paddingHorizontal: 12,
  },
  dropdownItemText: {
    flex: 1,
    fontWeight: '800',
  },
  categoryDot: {
    borderRadius: 999,
    height: 10,
    width: 10,
  },
  noteInput: {
    borderWidth: 1,
    borderRadius: 14,
    minHeight: 48,
    paddingHorizontal: 12,
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
  modalScrim: {
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.42)',
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  datePickerCard: {
    borderRadius: 18,
    gap: 14,
    padding: 16,
    width: '100%',
  },
  modalHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  closeButton: {
    alignItems: 'center',
    borderRadius: 999,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 36,
    paddingHorizontal: 12,
  },
  closeButtonText: {
    fontWeight: '800',
  },
});
