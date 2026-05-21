import { Account, Budget, Category, Transaction } from '../models/finance';
import { convertCurrency } from './currency';
import { getMonthKey, isInMonth } from './dates';

function isInvestmentAccount(account: Account) {
  return account.type === 'stock' || account.type === 'bond' || account.type === 'etf';
}

export function getNetWorthVnd(accounts: Account[], usdToVndRate: number) {
  return accounts.reduce((sum, account) => {
    if (account.type === 'crypto') {
      if (account.cryptoHoldings?.length) {
        return sum + account.cryptoHoldings.reduce((holdingSum, holding) => holdingSum + holding.quantity * (holding.priceUsd ?? 0) * usdToVndRate, 0);
      }

      return sum + account.balance * (account.cryptoPriceUsd ?? 0) * usdToVndRate;
    }

    if (isInvestmentAccount(account)) {
      const investmentValue = account.investmentHoldings?.reduce((holdingSum, holding) => holdingSum + holding.quantity * (holding.priceUsd ?? 0), 0) ?? account.balance;
      return sum + convertCurrency(investmentValue, account.currency, 'VND', usdToVndRate);
    }

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

function getNetImpactVnd(transaction: Transaction, usdToVndRate: number) {
  if (transaction.type === 'transfer') {
    return 0;
  }

  const value = convertCurrency(transaction.amount, transaction.currency, 'VND', usdToVndRate);
  return transaction.type === 'income' ? value : -value;
}

export function getBalanceTrend(accounts: Account[], transactions: Transaction[], usdToVndRate: number, dayCount = 14) {
  const now = new Date();
  const currentNetWorth = getNetWorthVnd(accounts, usdToVndRate);
  const dailyPoints = Array.from({ length: dayCount }).map((_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (dayCount - 1 - index));
    const dayEnd = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999);
    const laterImpact = transactions.reduce((sum, transaction) => {
      if (new Date(transaction.date) <= dayEnd) {
        return sum;
      }

      return sum + getNetImpactVnd(transaction, usdToVndRate);
    }, 0);

    return {
      dateKey: date.toISOString(),
      label: new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit' }).format(date),
      value: currentNetWorth - laterImpact,
    };
  });

  return dailyPoints.map((point, index) => ({
    ...point,
    change: index === 0 ? 0 : point.value - dailyPoints[index - 1].value,
  }));
}
