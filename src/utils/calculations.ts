import { Account, Budget, Category, Transaction } from '../models/finance';
import { convertCurrency } from './currency';
import { getMonthKey, isInMonth } from './dates';

export function getNetWorthVnd(accounts: Account[], usdToVndRate: number) {
  return accounts.reduce((sum, account) => {
    return sum + convertCurrency(account.balance, account.currency, 'VND', usdToVndRate);
  }, 0);
}

export function getMonthlyTotals(transactions: Transaction[], usdToVndRate: number, monthKey = getMonthKey(new Date())) {
  return transactions.reduce(
    (totals, transaction) => {
      if (!isInMonth(transaction.date, monthKey)) {
        return totals;
      }

      const value = convertCurrency(transaction.amount, transaction.currency, 'VND', usdToVndRate);

      if (transaction.type === 'income') {
        totals.income += value;
      }

      if (transaction.type === 'expense') {
        totals.expense += value;
      }

      totals.balance = totals.income - totals.expense;
      return totals;
    },
    { income: 0, expense: 0, balance: 0 },
  );
}

export function getCategorySpend(transactions: Transaction[], usdToVndRate: number, monthKey = getMonthKey(new Date())) {
  return transactions
    .filter((transaction) => transaction.type === 'expense' && isInMonth(transaction.date, monthKey))
    .reduce<Record<string, number>>((spend, transaction) => {
      const categoryId = transaction.categoryId ?? 'other-expense';
      spend[categoryId] = (spend[categoryId] ?? 0) + convertCurrency(transaction.amount, transaction.currency, 'VND', usdToVndRate);
      return spend;
    }, {});
}

export function getBudgetProgress(budget: Budget, transactions: Transaction[], usdToVndRate: number) {
  const spend = getCategorySpend(transactions, usdToVndRate, budget.month)[budget.categoryId] ?? 0;
  const budgetAmount = convertCurrency(budget.amount, budget.currency, 'VND', usdToVndRate);
  const remaining = budgetAmount - spend;
  const percent = budgetAmount <= 0 ? 0 : Math.min(spend / budgetAmount, 1);

  return {
    spent: spend,
    remaining,
    percent,
  };
}

export function getTopExpenseCategories(categories: Category[], transactions: Transaction[], usdToVndRate: number, monthKey = getMonthKey(new Date())) {
  const spend = getCategorySpend(transactions, usdToVndRate, monthKey);

  return categories
    .filter((category) => category.type === 'expense')
    .map((category) => ({ category, amount: spend[category.id] ?? 0 }))
    .filter((item) => item.amount > 0)
    .sort((a, b) => b.amount - a.amount);
}

export function getMonthlyTrend(transactions: Transaction[], usdToVndRate: number) {
  const now = new Date();
  return Array.from({ length: 4 }).map((_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - (3 - index), 1);
    const monthKey = getMonthKey(date);
    const totals = getMonthlyTotals(transactions, usdToVndRate, monthKey);
    return {
      monthKey,
      label: new Intl.DateTimeFormat('en-US', { month: 'short' }).format(date),
      ...totals,
    };
  });
}
