export type CurrencyCode = 'VND' | 'USD';

export type AccountType = 'cash' | 'bank' | 'ewallet' | 'savings' | 'foreign' | 'credit' | 'crypto' | 'stock' | 'etf';

export type TransactionType = 'income' | 'expense' | 'transfer';

export type CategoryType = 'income' | 'expense';

export type ThemePreference = 'light' | 'dark' | 'system';

export type CryptoId = string;

export type InvestmentAssetType = 'stock' | 'etf';

export type RecurringInterval = 'monthly';

export type DebtType = 'lent' | 'borrowed';

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  currency: CurrencyCode;
  balance: number;
  icon: string;
  color: string;
  cryptoId?: CryptoId;
  cryptoSymbol?: string;
  cryptoName?: string;
  cryptoPriceUsd?: number;
  crypto24hChange?: number;
  lastPriceUpdatedAt?: string;
  cryptoHoldings?: CryptoHolding[];
  investmentHoldings?: InvestmentHolding[];
  creditLimit?: number;
  statementDay?: number;
  paymentDueDay?: number;
  minimumPayment?: number;
  annualInterestRate?: number;
}

export interface InvestmentHolding {
  id: string;
  assetId: string;
  assetType: InvestmentAssetType;
  assetName: string;
  assetSymbol: string;
  quantity: number;
  priceUsd?: number;
  color: string;
}

export interface CryptoHolding {
  id: string;
  cryptoId: CryptoId;
  cryptoName: string;
  cryptoSymbol: string;
  quantity: number;
  priceUsd?: number;
  change24h?: number;
  lastPriceUpdatedAt?: string;
  color: string;
}

export interface Category {
  id: string;
  name: string;
  type: CategoryType;
  icon: string;
  color: string;
}

export interface RecurringTransaction {
  id: string;
  name: string;
  type: TransactionType;
  amount: number;
  currency: CurrencyCode;
  accountId: string;
  toAccountId?: string;
  categoryId?: string;
  interval: RecurringInterval;
  dayOfMonth: number;
  nextRunAt: string;
  note?: string;
  isActive: boolean;
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

export interface Debt {
  id: string;
  type: DebtType;
  name: string;
  person: string;
  amount: number;
  currency: CurrencyCode;
  dueDate?: string;
  note?: string;
  isPaid: boolean;
}

export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  currency: CurrencyCode;
  accountId?: string;
  dueDate?: string;
  color: string;
}

export interface CryptoWatchItem {
  id: string;
  cryptoId: CryptoId;
  cryptoName: string;
  cryptoSymbol: string;
  color: string;
  priceUsd?: number;
  change24h?: number;
  lastPriceUpdatedAt?: string;
}

export interface AppSettings {
  baseCurrency: CurrencyCode;
  usdToVndRate: number;
  theme: ThemePreference;
  autoRateUpdates: boolean;
  lastRateUpdatedAt?: string;
  rateSource?: string;
  pinEnabled: boolean;
  pinCode?: string;
  faceIdEnabled: boolean;
}

export interface FinanceState {
  accounts: Account[];
  categories: Category[];
  transactions: Transaction[];
  recurringTransactions: RecurringTransaction[];
  budgets: Budget[];
  debts: Debt[];
  savingsGoals: SavingsGoal[];
  cryptoWatchlist: CryptoWatchItem[];
  settings: AppSettings;
}
