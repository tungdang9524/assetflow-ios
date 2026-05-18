import { Account, Budget, Category, Debt, FinanceState, RecurringTransaction, SavingsGoal, Transaction } from '../models/finance';
import { getCryptoAsset } from './cryptoAssets';
import { getMonthKey } from '../utils/dates';

const currentMonth = getMonthKey(new Date());
const sampleCrypto = getCryptoAsset('bitcoin');

export const sampleAccounts: Account[] = [
  {
    id: 'cash',
    name: 'Cash',
    type: 'cash',
    currency: 'VND',
    balance: 3200000,
    icon: 'wallet-outline',
    color: '#50A878',
  },
  {
    id: 'bank',
    name: 'Bank',
    type: 'bank',
    currency: 'VND',
    balance: 18400000,
    icon: 'business-outline',
    color: '#3D7BFF',
  },
  {
    id: 'ewallet',
    name: 'E-wallet',
    type: 'ewallet',
    currency: 'VND',
    balance: 1250000,
    icon: 'phone-portrait-outline',
    color: '#F59E0B',
  },
  {
    id: 'savings',
    name: 'Savings',
    type: 'savings',
    currency: 'VND',
    balance: 52000000,
    icon: 'lock-closed-outline',
    color: '#8B5CF6',
  },
  {
    id: 'usd-account',
    name: 'USD Account',
    type: 'foreign',
    currency: 'USD',
    balance: 420,
    icon: 'earth-outline',
    color: '#0891B2',
  },
  {
    id: 'btc-vault',
    name: 'BTC Vault',
    type: 'crypto',
    currency: 'USD',
    balance: 0.035,
    icon: 'logo-bitcoin',
    color: sampleCrypto.color,
    cryptoId: sampleCrypto.id,
    cryptoName: sampleCrypto.name,
    cryptoSymbol: sampleCrypto.symbol,
    cryptoPriceUsd: sampleCrypto.fallbackPriceUsd,
  },
];

export const sampleCategories: Category[] = [
  { id: 'food', name: 'Food', type: 'expense', icon: 'restaurant-outline', color: '#EF4444' },
  { id: 'transport', name: 'Transport', type: 'expense', icon: 'bus-outline', color: '#F97316' },
  { id: 'shopping', name: 'Shopping', type: 'expense', icon: 'bag-outline', color: '#A855F7' },
  { id: 'bills', name: 'Bills', type: 'expense', icon: 'receipt-outline', color: '#0EA5E9' },
  { id: 'entertainment', name: 'Entertainment', type: 'expense', icon: 'game-controller-outline', color: '#EC4899' },
  { id: 'health', name: 'Health', type: 'expense', icon: 'heart-outline', color: '#14B8A6' },
  { id: 'education', name: 'Education', type: 'expense', icon: 'school-outline', color: '#6366F1' },
  { id: 'other-expense', name: 'Other', type: 'expense', icon: 'ellipsis-horizontal-circle-outline', color: '#64748B' },
  { id: 'salary', name: 'Salary', type: 'income', icon: 'briefcase-outline', color: '#16A34A' },
  { id: 'freelance', name: 'Freelance', type: 'income', icon: 'laptop-outline', color: '#2563EB' },
  { id: 'gift', name: 'Gift', type: 'income', icon: 'gift-outline', color: '#DB2777' },
  { id: 'interest', name: 'Interest', type: 'income', icon: 'trending-up-outline', color: '#059669' },
  { id: 'other-income', name: 'Other', type: 'income', icon: 'add-circle-outline', color: '#475569' },
];

export const sampleTransactions: Transaction[] = [
  {
    id: 't1',
    type: 'income',
    amount: 24000000,
    currency: 'VND',
    accountId: 'bank',
    categoryId: 'salary',
    date: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString(),
    note: 'Monthly salary',
  },
  {
    id: 't2',
    type: 'expense',
    amount: 185000,
    currency: 'VND',
    accountId: 'cash',
    categoryId: 'food',
    date: new Date(new Date().getFullYear(), new Date().getMonth(), 3).toISOString(),
    note: 'Dinner',
  },
  {
    id: 't3',
    type: 'expense',
    amount: 430000,
    currency: 'VND',
    accountId: 'ewallet',
    categoryId: 'transport',
    date: new Date(new Date().getFullYear(), new Date().getMonth(), 5).toISOString(),
    note: 'Ride share top-ups',
  },
  {
    id: 't4',
    type: 'expense',
    amount: 1200000,
    currency: 'VND',
    accountId: 'bank',
    categoryId: 'bills',
    date: new Date(new Date().getFullYear(), new Date().getMonth(), 7).toISOString(),
    note: 'Utilities',
  },
  {
    id: 't5',
    type: 'transfer',
    amount: 3000000,
    currency: 'VND',
    accountId: 'bank',
    toAccountId: 'savings',
    date: new Date(new Date().getFullYear(), new Date().getMonth(), 9).toISOString(),
    note: 'Monthly savings',
  },
  {
    id: 't6',
    type: 'income',
    amount: 220,
    currency: 'USD',
    accountId: 'usd-account',
    categoryId: 'freelance',
    date: new Date(new Date().getFullYear(), new Date().getMonth(), 11).toISOString(),
    note: 'Freelance invoice',
  },
];

export const sampleBudgets: Budget[] = [
  { id: 'b-food', categoryId: 'food', month: currentMonth, amount: 3500000, currency: 'VND' },
  { id: 'b-transport', categoryId: 'transport', month: currentMonth, amount: 1500000, currency: 'VND' },
  { id: 'b-shopping', categoryId: 'shopping', month: currentMonth, amount: 2500000, currency: 'VND' },
  { id: 'b-bills', categoryId: 'bills', month: currentMonth, amount: 3000000, currency: 'VND' },
  { id: 'b-entertainment', categoryId: 'entertainment', month: currentMonth, amount: 1200000, currency: 'VND' },
];

export const sampleRecurringTransactions: RecurringTransaction[] = [
  {
    id: 'r-salary',
    name: 'Salary',
    type: 'income',
    amount: 24000000,
    currency: 'VND',
    accountId: 'bank',
    categoryId: 'salary',
    interval: 'monthly',
    dayOfMonth: 1,
    nextRunAt: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1).toISOString(),
    note: 'Recurring salary',
    isActive: true,
  },
];

export const sampleDebts: Debt[] = [
  {
    id: 'd-friend',
    type: 'lent',
    name: 'Coffee advance',
    person: 'Friend',
    amount: 300000,
    currency: 'VND',
    dueDate: new Date(new Date().getFullYear(), new Date().getMonth(), 28).toISOString(),
    note: 'Small personal loan',
    isPaid: false,
  },
];

export const sampleSavingsGoals: SavingsGoal[] = [
  {
    id: 'g-emergency',
    name: 'Emergency fund',
    targetAmount: 100000000,
    currentAmount: 52000000,
    currency: 'VND',
    accountId: 'savings',
    color: '#50A878',
  },
];

export const createSampleState = (): FinanceState => ({
  accounts: sampleAccounts,
  categories: sampleCategories,
  transactions: sampleTransactions,
  recurringTransactions: sampleRecurringTransactions,
  budgets: sampleBudgets,
  debts: sampleDebts,
  savingsGoals: sampleSavingsGoals,
  cryptoWatchlist: [
    {
      id: 'w-bitcoin',
      cryptoId: sampleCrypto.id,
      cryptoName: sampleCrypto.name,
      cryptoSymbol: sampleCrypto.symbol,
      color: sampleCrypto.color,
      priceUsd: sampleCrypto.fallbackPriceUsd,
    },
  ],
  settings: {
    baseCurrency: 'VND',
    usdToVndRate: 25000,
    theme: 'system',
    autoRateUpdates: true,
    rateSource: 'manual',
    pinEnabled: false,
    biometricEnabled: false,
  },
});
