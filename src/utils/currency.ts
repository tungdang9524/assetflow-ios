import { CurrencyCode } from '../models/finance';

export function convertCurrency(amount: number, from: CurrencyCode, to: CurrencyCode, usdToVndRate: number) {
  if (from === to) {
    return amount;
  }

  if (from === 'USD' && to === 'VND') {
    return amount * usdToVndRate;
  }

  if (from === 'VND' && to === 'USD') {
    return amount / usdToVndRate;
  }

  return amount;
}

export function formatCurrency(amount: number, currency: CurrencyCode) {
  return new Intl.NumberFormat(currency === 'VND' ? 'vi-VN' : 'en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: currency === 'VND' ? 0 : 2,
  }).format(amount);
}

export function compactCurrency(amount: number, currency: CurrencyCode) {
  if (currency === 'VND') {
    if (Math.abs(amount) >= 1000000) {
      return `${(amount / 1000000).toFixed(1)}M VND`;
    }

    if (Math.abs(amount) >= 1000) {
      return `${Math.round(amount / 1000)}K VND`;
    }
  }

  return formatCurrency(amount, currency);
}
