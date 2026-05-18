import React, { createContext, PropsWithChildren, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { createSampleState } from '../data/sampleData';
import {
  Account,
  AppSettings,
  Budget,
  Category,
  CryptoWatchItem,
  Debt,
  FinanceState,
  RecurringTransaction,
  SavingsGoal,
  Transaction,
} from '../models/finance';
import { convertCurrency } from '../utils/currency';
import { fetchCryptoPrices, fetchUsdToVndRate } from '../utils/marketData';
import { loadFinanceState, saveFinanceState } from './storage';

interface FinanceContextValue {
  state: FinanceState;
  isReady: boolean;
  isRefreshingRates: boolean;
  addAccount: (account: Omit<Account, 'id'>) => void;
  updateAccount: (accountId: string, updates: Partial<Account>) => void;
  moveAccount: (accountId: string, direction: 'up' | 'down') => void;
  deleteAccount: (accountId: string) => boolean;
  addTransaction: (transaction: Omit<Transaction, 'id' | 'date'> & { date?: string }) => TransactionMutationResult;
  updateTransaction: (transactionId: string, updates: Omit<Transaction, 'id'>) => TransactionMutationResult;
  deleteTransaction: (transactionId: string) => void;
  addCategory: (category: Omit<Category, 'id'>) => void;
  updateCategory: (categoryId: string, updates: Partial<Category>) => void;
  deleteCategory: (categoryId: string) => boolean;
  addBudget: (budget: Omit<Budget, 'id'>) => void;
  updateBudget: (budgetId: string, updates: Partial<Budget>) => void;
  deleteBudget: (budgetId: string) => void;
  addRecurringTransaction: (recurring: Omit<RecurringTransaction, 'id' | 'nextRunAt' | 'interval' | 'isActive'>) => void;
  toggleRecurringTransaction: (recurringId: string) => void;
  deleteRecurringTransaction: (recurringId: string) => void;
  addDebt: (debt: Omit<Debt, 'id' | 'isPaid'>) => void;
  toggleDebtPaid: (debtId: string) => void;
  deleteDebt: (debtId: string) => void;
  addSavingsGoal: (goal: Omit<SavingsGoal, 'id'>) => void;
  updateSavingsGoal: (goalId: string, updates: Partial<SavingsGoal>) => void;
  deleteSavingsGoal: (goalId: string) => void;
  addCryptoWatchItem: (item: Omit<CryptoWatchItem, 'id'>) => void;
  deleteCryptoWatchItem: (itemId: string) => void;
  updateSettings: (settings: Partial<AppSettings>) => void;
  refreshMarketRates: () => Promise<void>;
  importState: (state: FinanceState) => void;
  resetSampleData: () => void;
}

interface TransactionMutationResult {
  ok: boolean;
  error?: string;
}

const FinanceContext = createContext<FinanceContextValue | undefined>(undefined);

function normalizeState(storedState: FinanceState): FinanceState {
  const sampleState = createSampleState();

  return {
    ...sampleState,
    ...storedState,
    settings: {
      ...sampleState.settings,
      ...storedState.settings,
    },
  };
}

function applyTransactionToAccounts(accounts: Account[], transaction: Transaction, usdToVndRate: number) {
  return applyTransactionDelta(accounts, transaction, usdToVndRate, 1);
}

function applyTransactionDelta(accounts: Account[], transaction: Transaction, usdToVndRate: number, direction: 1 | -1) {
  return accounts.map((account) => {
    if (transaction.type === 'income' && account.id === transaction.accountId) {
      const amount = convertCurrency(transaction.amount, transaction.currency, account.currency, usdToVndRate);
      return { ...account, balance: account.balance + amount * direction };
    }

    if (transaction.type === 'expense' && account.id === transaction.accountId) {
      const amount = convertCurrency(transaction.amount, transaction.currency, account.currency, usdToVndRate);
      return { ...account, balance: account.balance - amount * direction };
    }

    if (transaction.type === 'transfer') {
      if (account.id === transaction.accountId) {
        const amount = convertCurrency(transaction.amount, transaction.currency, account.currency, usdToVndRate);
        return { ...account, balance: account.balance - amount * direction };
      }

      if (account.id === transaction.toAccountId) {
        const amount = convertCurrency(transaction.amount, transaction.currency, account.currency, usdToVndRate);
        return { ...account, balance: account.balance + amount * direction };
      }
    }

    return account;
  });
}

function getAccountBalanceError(accounts: Account[]) {
  const overdrawnAccount = accounts.find((account) => account.type !== 'crypto' && account.type !== 'credit' && account.balance < 0);

  if (overdrawnAccount) {
    return `${overdrawnAccount.name} cannot go below zero.`;
  }

  const overLimitAccount = accounts.find((account) => {
    if (account.type !== 'credit' || !account.creditLimit || account.creditLimit <= 0) {
      return false;
    }

    return Math.max(-account.balance, 0) > account.creditLimit;
  });

  if (overLimitAccount) {
    return `${overLimitAccount.name} would exceed its credit limit.`;
  }

  return undefined;
}

function getNextMonthlyRun(dayOfMonth: number, fromDate = new Date()) {
  const clampedDay = Math.max(1, Math.min(28, dayOfMonth));
  const candidate = new Date(fromDate.getFullYear(), fromDate.getMonth(), clampedDay);

  if (candidate <= fromDate) {
    return new Date(fromDate.getFullYear(), fromDate.getMonth() + 1, clampedDay);
  }

  return candidate;
}

export function FinanceProvider({ children }: PropsWithChildren) {
  const [state, setState] = useState<FinanceState>(createSampleState);
  const [isReady, setIsReady] = useState(false);
  const [isRefreshingRates, setIsRefreshingRates] = useState(false);
  const [hasProcessedRecurring, setHasProcessedRecurring] = useState(false);

  useEffect(() => {
    let isMounted = true;

    loadFinanceState()
      .then((storedState) => {
        if (isMounted && storedState) {
          setState(normalizeState(storedState));
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsReady(true);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (isReady) {
      saveFinanceState(state).catch(() => undefined);
    }
  }, [isReady, state]);

  const addAccount = useCallback((account: Omit<Account, 'id'>) => {
    setState((currentState) => ({
      ...currentState,
      accounts: [
        {
          ...account,
          id: `acct-${Date.now()}`,
        },
        ...currentState.accounts,
      ],
    }));
  }, []);

  const updateAccount = useCallback((accountId: string, updates: Partial<Account>) => {
    setState((currentState) => ({
      ...currentState,
      accounts: currentState.accounts.map((account) => (account.id === accountId ? { ...account, ...updates, id: account.id } : account)),
    }));
  }, []);

  const moveAccount = useCallback((accountId: string, direction: 'up' | 'down') => {
    setState((currentState) => {
      const currentIndex = currentState.accounts.findIndex((account) => account.id === accountId);
      const nextIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;

      if (currentIndex < 0 || nextIndex < 0 || nextIndex >= currentState.accounts.length) {
        return currentState;
      }

      const accounts = [...currentState.accounts];
      const [account] = accounts.splice(currentIndex, 1);
      accounts.splice(nextIndex, 0, account);

      return {
        ...currentState,
        accounts,
      };
    });
  }, []);

  const deleteAccount = useCallback((accountId: string) => {
    let didDelete = false;

    setState((currentState) => {
      const isUsed = currentState.transactions.some((transaction) => transaction.accountId === accountId || transaction.toAccountId === accountId);

      if (isUsed) {
        return currentState;
      }

      didDelete = true;
      return {
        ...currentState,
        accounts: currentState.accounts.filter((account) => account.id !== accountId),
        recurringTransactions: currentState.recurringTransactions.filter(
          (recurring) => recurring.accountId !== accountId && recurring.toAccountId !== accountId,
        ),
        savingsGoals: currentState.savingsGoals.map((goal) => (goal.accountId === accountId ? { ...goal, accountId: undefined } : goal)),
      };
    });

    return didDelete;
  }, []);

  const addTransaction = useCallback((input: Omit<Transaction, 'id' | 'date'> & { date?: string }) => {
    let result: TransactionMutationResult = { ok: true };

    setState((currentState) => {
      const transaction: Transaction = {
        ...input,
        id: `txn-${Date.now()}`,
        date: input.date ?? new Date().toISOString(),
      };
      const nextAccounts = applyTransactionToAccounts(currentState.accounts, transaction, currentState.settings.usdToVndRate);

      const balanceError = getAccountBalanceError(nextAccounts);

      if (balanceError) {
        result = { ok: false, error: balanceError };
        return currentState;
      }

      return {
        ...currentState,
        accounts: nextAccounts,
        transactions: [transaction, ...currentState.transactions],
      };
    });

    return result;
  }, []);

  const updateTransaction = useCallback((transactionId: string, updates: Omit<Transaction, 'id'>) => {
    let result: TransactionMutationResult = { ok: true };

    setState((currentState) => {
      const existing = currentState.transactions.find((transaction) => transaction.id === transactionId);

      if (!existing) {
        result = { ok: false, error: 'Transaction not found.' };
        return currentState;
      }

      const updatedTransaction: Transaction = { ...updates, id: transactionId };
      const accountsWithoutExisting = applyTransactionDelta(currentState.accounts, existing, currentState.settings.usdToVndRate, -1);
      const nextAccounts = applyTransactionDelta(accountsWithoutExisting, updatedTransaction, currentState.settings.usdToVndRate, 1);

      const balanceError = getAccountBalanceError(nextAccounts);

      if (balanceError) {
        result = { ok: false, error: balanceError };
        return currentState;
      }

      return {
        ...currentState,
        accounts: nextAccounts,
        transactions: currentState.transactions.map((transaction) => (transaction.id === transactionId ? updatedTransaction : transaction)),
      };
    });

    return result;
  }, []);

  const deleteTransaction = useCallback((transactionId: string) => {
    setState((currentState) => {
      const existing = currentState.transactions.find((transaction) => transaction.id === transactionId);

      if (!existing) {
        return currentState;
      }

      return {
        ...currentState,
        accounts: applyTransactionDelta(currentState.accounts, existing, currentState.settings.usdToVndRate, -1),
        transactions: currentState.transactions.filter((transaction) => transaction.id !== transactionId),
      };
    });
  }, []);

  const addCategory = useCallback((category: Omit<Category, 'id'>) => {
    setState((currentState) => ({
      ...currentState,
      categories: [{ ...category, id: `cat-${Date.now()}` }, ...currentState.categories],
    }));
  }, []);

  const updateCategory = useCallback((categoryId: string, updates: Partial<Category>) => {
    setState((currentState) => ({
      ...currentState,
      categories: currentState.categories.map((category) => (category.id === categoryId ? { ...category, ...updates, id: category.id } : category)),
    }));
  }, []);

  const deleteCategory = useCallback((categoryId: string) => {
    let didDelete = false;

    setState((currentState) => {
      const isUsed =
        currentState.transactions.some((transaction) => transaction.categoryId === categoryId) ||
        currentState.budgets.some((budget) => budget.categoryId === categoryId);

      if (isUsed) {
        return currentState;
      }

      didDelete = true;
      return {
        ...currentState,
        categories: currentState.categories.filter((category) => category.id !== categoryId),
        recurringTransactions: currentState.recurringTransactions.map((recurring) =>
          recurring.categoryId === categoryId ? { ...recurring, categoryId: undefined } : recurring,
        ),
      };
    });

    return didDelete;
  }, []);

  const addBudget = useCallback((budget: Omit<Budget, 'id'>) => {
    setState((currentState) => {
      const existing = currentState.budgets.find((item) => item.month === budget.month && item.categoryId === budget.categoryId);

      if (existing) {
        return {
          ...currentState,
          budgets: currentState.budgets.map((item) => (item.id === existing.id ? { ...item, ...budget } : item)),
        };
      }

      return {
        ...currentState,
        budgets: [{ ...budget, id: `budget-${Date.now()}` }, ...currentState.budgets],
      };
    });
  }, []);

  const updateBudget = useCallback((budgetId: string, updates: Partial<Budget>) => {
    setState((currentState) => ({
      ...currentState,
      budgets: currentState.budgets.map((budget) => (budget.id === budgetId ? { ...budget, ...updates, id: budget.id } : budget)),
    }));
  }, []);

  const deleteBudget = useCallback((budgetId: string) => {
    setState((currentState) => ({
      ...currentState,
      budgets: currentState.budgets.filter((budget) => budget.id !== budgetId),
    }));
  }, []);

  const addRecurringTransaction = useCallback((recurring: Omit<RecurringTransaction, 'id' | 'nextRunAt' | 'interval' | 'isActive'>) => {
    setState((currentState) => ({
      ...currentState,
      recurringTransactions: [
        {
          ...recurring,
          id: `rec-${Date.now()}`,
          interval: 'monthly',
          nextRunAt: getNextMonthlyRun(recurring.dayOfMonth).toISOString(),
          isActive: true,
        },
        ...currentState.recurringTransactions,
      ],
    }));
  }, []);

  const toggleRecurringTransaction = useCallback((recurringId: string) => {
    setState((currentState) => ({
      ...currentState,
      recurringTransactions: currentState.recurringTransactions.map((recurring) =>
        recurring.id === recurringId ? { ...recurring, isActive: !recurring.isActive } : recurring,
      ),
    }));
  }, []);

  const deleteRecurringTransaction = useCallback((recurringId: string) => {
    setState((currentState) => ({
      ...currentState,
      recurringTransactions: currentState.recurringTransactions.filter((recurring) => recurring.id !== recurringId),
    }));
  }, []);

  const addDebt = useCallback((debt: Omit<Debt, 'id' | 'isPaid'>) => {
    setState((currentState) => ({
      ...currentState,
      debts: [{ ...debt, id: `debt-${Date.now()}`, isPaid: false }, ...currentState.debts],
    }));
  }, []);

  const toggleDebtPaid = useCallback((debtId: string) => {
    setState((currentState) => ({
      ...currentState,
      debts: currentState.debts.map((debt) => (debt.id === debtId ? { ...debt, isPaid: !debt.isPaid } : debt)),
    }));
  }, []);

  const deleteDebt = useCallback((debtId: string) => {
    setState((currentState) => ({
      ...currentState,
      debts: currentState.debts.filter((debt) => debt.id !== debtId),
    }));
  }, []);

  const addSavingsGoal = useCallback((goal: Omit<SavingsGoal, 'id'>) => {
    setState((currentState) => ({
      ...currentState,
      savingsGoals: [{ ...goal, id: `goal-${Date.now()}` }, ...currentState.savingsGoals],
    }));
  }, []);

  const updateSavingsGoal = useCallback((goalId: string, updates: Partial<SavingsGoal>) => {
    setState((currentState) => ({
      ...currentState,
      savingsGoals: currentState.savingsGoals.map((goal) => (goal.id === goalId ? { ...goal, ...updates, id: goal.id } : goal)),
    }));
  }, []);

  const deleteSavingsGoal = useCallback((goalId: string) => {
    setState((currentState) => ({
      ...currentState,
      savingsGoals: currentState.savingsGoals.filter((goal) => goal.id !== goalId),
    }));
  }, []);

  const addCryptoWatchItem = useCallback((item: Omit<CryptoWatchItem, 'id'>) => {
    setState((currentState) => {
      if (currentState.cryptoWatchlist.some((watchItem) => watchItem.cryptoId === item.cryptoId)) {
        return currentState;
      }

      return {
        ...currentState,
        cryptoWatchlist: [{ ...item, id: `watch-${Date.now()}` }, ...currentState.cryptoWatchlist],
      };
    });
  }, []);

  const deleteCryptoWatchItem = useCallback((itemId: string) => {
    setState((currentState) => ({
      ...currentState,
      cryptoWatchlist: currentState.cryptoWatchlist.filter((item) => item.id !== itemId),
    }));
  }, []);

  const updateSettings = useCallback((settings: Partial<AppSettings>) => {
    setState((currentState) => ({
      ...currentState,
      settings: {
        ...currentState.settings,
        ...settings,
      },
    }));
  }, []);

  const refreshMarketRates = useCallback(async () => {
    setIsRefreshingRates(true);

    try {
      const cryptoIds = state.accounts.filter((account) => account.type === 'crypto' && account.cryptoId).map((account) => account.cryptoId!);
      const watchIds = state.cryptoWatchlist.map((item) => item.cryptoId);
      const [usdResult, cryptoResult] = await Promise.allSettled([fetchUsdToVndRate(), fetchCryptoPrices([...cryptoIds, ...watchIds])]);
      const updatedAt = new Date().toISOString();

      if (usdResult.status === 'rejected' && cryptoResult.status === 'rejected') {
        throw new Error('Unable to refresh market rates');
      }

      setState((currentState) => {
        const nextUsdRate = usdResult.status === 'fulfilled' ? usdResult.value : currentState.settings.usdToVndRate;
        const cryptoPrices = cryptoResult.status === 'fulfilled' ? cryptoResult.value : [];

        return {
          ...currentState,
          accounts: currentState.accounts.map((account) => {
            if (account.type !== 'crypto' || !account.cryptoId) {
              return account;
            }

            const price = cryptoPrices.find((item) => item.id === account.cryptoId);

            if (!price) {
              return account;
            }

            return {
              ...account,
              cryptoPriceUsd: price.priceUsd,
              crypto24hChange: price.change24h,
              lastPriceUpdatedAt: updatedAt,
            };
          }),
          cryptoWatchlist: currentState.cryptoWatchlist.map((watchItem) => {
            const price = cryptoPrices.find((item) => item.id === watchItem.cryptoId);

            if (!price) {
              return watchItem;
            }

            return {
              ...watchItem,
              priceUsd: price.priceUsd,
              change24h: price.change24h,
              lastPriceUpdatedAt: updatedAt,
            };
          }),
          settings: {
            ...currentState.settings,
            usdToVndRate: nextUsdRate,
            lastRateUpdatedAt: updatedAt,
            rateSource: usdResult.status === 'fulfilled' || cryptoResult.status === 'fulfilled' ? 'network' : currentState.settings.rateSource,
          },
        };
      });
    } finally {
      setIsRefreshingRates(false);
    }
  }, [state.accounts, state.cryptoWatchlist]);

  useEffect(() => {
    if (!isReady || hasProcessedRecurring) {
      return;
    }

    setHasProcessedRecurring(true);
    setState((currentState) => {
      const now = new Date();
      let accounts = currentState.accounts;
      const generatedTransactions: Transaction[] = [];
      const recurringTransactions = currentState.recurringTransactions.map((recurring) => {
        if (!recurring.isActive || new Date(recurring.nextRunAt) > now) {
          return recurring;
        }

        const transaction: Transaction = {
          id: `txn-rec-${recurring.id}-${Date.now()}`,
          type: recurring.type,
          amount: recurring.amount,
          currency: recurring.currency,
          accountId: recurring.accountId,
          toAccountId: recurring.toAccountId,
          categoryId: recurring.categoryId,
          date: now.toISOString(),
          note: recurring.note ?? recurring.name,
        };

        accounts = applyTransactionDelta(accounts, transaction, currentState.settings.usdToVndRate, 1);
        if (getAccountBalanceError(accounts)) {
          accounts = currentState.accounts;
          return recurring;
        }
        generatedTransactions.push(transaction);

        return {
          ...recurring,
          nextRunAt: getNextMonthlyRun(recurring.dayOfMonth, now).toISOString(),
        };
      });

      if (generatedTransactions.length === 0) {
        return currentState;
      }

      return {
        ...currentState,
        accounts,
        recurringTransactions,
        transactions: [...generatedTransactions, ...currentState.transactions],
      };
    });
  }, [hasProcessedRecurring, isReady]);

  useEffect(() => {
    if (!isReady || !state.settings.autoRateUpdates) {
      return;
    }

    const lastUpdatedAt = state.settings.lastRateUpdatedAt ? new Date(state.settings.lastRateUpdatedAt).getTime() : 0;
    const isStale = Date.now() - lastUpdatedAt > 60 * 60 * 1000;

    if (isStale) {
      refreshMarketRates().catch(() => undefined);
    }
  }, [isReady, refreshMarketRates, state.settings.autoRateUpdates, state.settings.lastRateUpdatedAt]);

  const resetSampleData = useCallback(() => {
    setState(createSampleState());
  }, []);

  const importState = useCallback((nextState: FinanceState) => {
    setState(normalizeState(nextState));
  }, []);

  const value = useMemo(
    () => ({
      state,
      isReady,
      isRefreshingRates,
      addAccount,
      updateAccount,
      moveAccount,
      deleteAccount,
      addTransaction,
      updateTransaction,
      deleteTransaction,
      addCategory,
      updateCategory,
      deleteCategory,
      addBudget,
      updateBudget,
      deleteBudget,
      addRecurringTransaction,
      toggleRecurringTransaction,
      deleteRecurringTransaction,
      addDebt,
      toggleDebtPaid,
      deleteDebt,
      addSavingsGoal,
      updateSavingsGoal,
      deleteSavingsGoal,
      addCryptoWatchItem,
      deleteCryptoWatchItem,
      updateSettings,
      refreshMarketRates,
      importState,
      resetSampleData,
    }),
    [
      addAccount,
      addBudget,
      addCategory,
      addCryptoWatchItem,
      addDebt,
      addRecurringTransaction,
      addSavingsGoal,
      addTransaction,
      deleteAccount,
      deleteBudget,
      deleteCategory,
      deleteCryptoWatchItem,
      deleteDebt,
      deleteRecurringTransaction,
      deleteSavingsGoal,
      deleteTransaction,
      importState,
      isReady,
      isRefreshingRates,
      moveAccount,
      refreshMarketRates,
      resetSampleData,
      state,
      toggleDebtPaid,
      toggleRecurringTransaction,
      updateAccount,
      updateBudget,
      updateCategory,
      updateSavingsGoal,
      updateSettings,
      updateTransaction,
    ],
  );

  return <FinanceContext.Provider value={value}>{children}</FinanceContext.Provider>;
}

export function useFinance() {
  const context = useContext(FinanceContext);

  if (!context) {
    throw new Error('useFinance must be used within FinanceProvider');
  }

  return context;
}
