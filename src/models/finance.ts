export type CurrencyCode = 'VND' | 'USD';

export type AccountType = 'cash' | 'bank' | 'ewallet' | 'savings' | 'foreign';

export type TransactionType = 'income' | 'expense' | 'transfer';

export type CategoryType = 'income' | 'expense';

export type ThemePreference = 'light' | 'dark' | 'system';

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  currency: CurrencyCode;
  balance: number;
  icon: string;
  color: string;
}

export interface Category {
  id: string;
  name: string;
  type: CategoryType;
  icon: string;
  color: string;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  currency: CurrencyCode;
  accountId: string;
  toAccountId?: string;
  categoryId?: string;
  date: string;
  note?: string;
}

export interface Budget {
  id: string;
  categoryId: string;
  month: string;
  amount: number;
  currency: CurrencyCode;
}

export interface AppSettings {
  baseCurrency: CurrencyCode;
  usdToVndRate: number;
  theme: ThemePreference;
}

export interface FinanceState {
  accounts: Account[];
  categories: Category[];
  transactions: Transaction[];
  budgets: Budget[];
  settings: AppSettings;
}
