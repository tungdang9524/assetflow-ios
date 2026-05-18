import React, { createContext, PropsWithChildren, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { createSampleState } from '../data/sampleData';
import { Account, AppSettings, FinanceState, Transaction } from '../models/finance';
import { convertCurrency } from '../utils/currency';
import { loadFinanceState, saveFinanceState } from './storage';

interface FinanceContextValue {
  state: FinanceState;
  isReady: boolean;
  addTransaction: (transaction: Omit<Transaction, 'id' | 'date'> & { date?: string }) => void;
  updateSettings: (settings: Partial<AppSettings>) => void;
  resetSampleData: () => void;
}

const FinanceContext = createContext<FinanceContextValue | undefined>(undefined);

function applyTransactionToAccounts(accounts: Account[], transaction: Transaction, usdToVndRate: number) {
  return accounts.map((account) => {
    if (transaction.type === 'income' && account.id === transaction.accountId) {
      const amount = convertCurrency(transaction.amount, transaction.currency, account.currency, usdToVndRate);
      return { ...account, balance: account.balance + amount };
    }

    if (transaction.type === 'expense' && account.id === transaction.accountId) {
      const amount = convertCurrency(transaction.amount, transaction.currency, account.currency, usdToVndRate);
      return { ...account, balance: account.balance - amount };
    }

    if (transaction.type === 'transfer') {
      if (account.id === transaction.accountId) {
        const amount = convertCurrency(transaction.amount, transaction.currency, account.currency, usdToVndRate);
        return { ...account, balance: account.balance - amount };
      }

      if (account.id === transaction.toAccountId) {
        const amount = convertCurrency(transaction.amount, transaction.currency, account.currency, usdToVndRate);
        return { ...account, balance: account.balance + amount };
      }
    }

    return account;
  });
}

export function FinanceProvider({ children }: PropsWithChildren) {
  const [state, setState] = useState<FinanceState>(createSampleState);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let isMounted = true;

    loadFinanceState()
      .then((storedState) => {
        if (isMounted && storedState) {
          setState(storedState);
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

  const addTransaction = useCallback((input: Omit<Transaction, 'id' | 'date'> & { date?: string }) => {
    setState((currentState) => {
      const transaction: Transaction = {
        ...input,
        id: `txn-${Date.now()}`,
        date: input.date ?? new Date().toISOString(),
      };

      return {
        ...currentState,
        accounts: applyTransactionToAccounts(currentState.accounts, transaction, currentState.settings.usdToVndRate),
        transactions: [transaction, ...currentState.transactions],
      };
    });
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

  const resetSampleData = useCallback(() => {
    setState(createSampleState());
  }, []);

  const value = useMemo(
    () => ({
      state,
      isReady,
      addTransaction,
      updateSettings,
      resetSampleData,
    }),
    [addTransaction, isReady, resetSampleData, state, updateSettings],
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
