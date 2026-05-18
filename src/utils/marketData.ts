import { CryptoId } from '../models/finance';

interface ExchangeRateResponse {
  rates?: {
    VND?: number;
  };
}

interface CoinGeckoPrice {
  usd?: number;
  usd_24h_change?: number;
}

type CoinGeckoResponse = Partial<Record<CryptoId, CoinGeckoPrice>>;

export interface CryptoPrice {
  id: CryptoId;
  priceUsd: number;
  change24h?: number;
}

export async function fetchUsdToVndRate() {
  const response = await fetch('https://open.er-api.com/v6/latest/USD');

  if (!response.ok) {
    throw new Error('Unable to fetch USD/VND rate');
  }

  const data = (await response.json()) as ExchangeRateResponse;
  const rate = data.rates?.VND;

  if (!rate || !Number.isFinite(rate)) {
    throw new Error('USD/VND rate is missing from response');
  }

  return rate;
}

export async function fetchCryptoPrices(ids: CryptoId[]) {
  if (ids.length === 0) {
    return [];
  }

  const uniqueIds = Array.from(new Set(ids));
  const url = `https://api.coingecko.com/api/v3/simple/price?ids=${uniqueIds.join(',')}&vs_currencies=usd&include_24hr_change=true`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error('Unable to fetch crypto prices');
  }

  const data = (await response.json()) as CoinGeckoResponse;

  return uniqueIds.flatMap<CryptoPrice>((id) => {
    const price = data[id]?.usd;

    if (!price || !Number.isFinite(price)) {
      return [];
    }

    return [
      {
        id,
        priceUsd: price,
        change24h: data[id]?.usd_24h_change,
      },
    ];
  });
}
