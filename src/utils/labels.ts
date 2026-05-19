import { AccountType } from '../models/finance';

export function formatAccountType(type: AccountType) {
  const labels: Record<AccountType, string> = {
    cash: 'Cash',
    bank: 'Bank',
    ewallet: 'E-wallet',
    savings: 'Savings',
    foreign: 'Foreign',
    credit: 'Credit',
    crypto: 'Crypto',
    stock: 'Stocks',
    etf: 'ETF',
  };

  return labels[type];
}
