import { CryptoId } from '../models/finance';

interface ExchangeRateResponse {
  rates?: {
    VND?: number;
  };
}

interface CurrencyApiResponse {
  usd?: {
    vnd?: number;
  };
}

interface CoinGeckoPrice {
  usd?: number;
  usd_24h_change?: number;
}

type CoinGeckoResponse = Partial<Record<CryptoId, CoinGeckoPrice>>;

interface CoinGeckoMarketChartResponse {
  prices?: Array<[number, number]>;
}

export interface CryptoPrice {
  id: CryptoId;
  priceUsd: number;
  change24h?: number;
}

interface FmarketProductResponse {
  data?: {
    id?: number;
  };
}

interface FmarketNavHistoryResponse {
  data?: Array<{
    nav?: number;
    navDate?: string;
  }>;
}

export interface NavHistoryPoint {
  label: string;
  nav: number;
}

export interface PriceHistoryPoint {
  label: string;
  priceUsd: number;
}

export async function fetchUsdToVndRate() {
  try {
    const primaryResponse = await fetch('https://open.er-api.com/v6/latest/USD');

    if (primaryResponse.ok) {
      const data = (await primaryResponse.json()) as ExchangeRateResponse;
      const rate = data.rates?.VND;

      if (rate && Number.isFinite(rate)) {
        return rate;
      }
    }
  } catch {
    // Try the secondary public endpoint below.
  }

  const fallbackResponse = await fetch('https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/usd.json');

  if (!fallbackResponse.ok) {
    throw new Error('Unable to fetch USD/VND rate');
  }

  const fallbackData = (await fallbackResponse.json()) as CurrencyApiResponse;
  const fallbackRate = fallbackData.usd?.vnd;

  if (!fallbackRate || !Number.isFinite(fallbackRate)) {
    throw new Error('USD/VND rate is missing from response');
  }

  return fallbackRate;
}

export async function fetchCryptoPrices(ids: CryptoId[]) {
  if (ids.length === 0) {
    return [];
  }

  const uniqueIds = Array.from(new Set(ids));
  const url = `https://api.coingecko.com/api/v3/simple/price?ids=${uniqueIds.join(',')}&vs_currencies=usd&include_24hr_change=true&x=${Date.now()}`;
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

export async function fetchCryptoPriceHistory(id: CryptoId, days = 30) {
  const response = await fetch(`https://api.coingecko.com/api/v3/coins/${encodeURIComponent(id)}/market_chart?vs_currency=usd&days=${days}&x=${Date.now()}`);

  if (!response.ok) {
    throw new Error('Unable to fetch crypto price history');
  }

  const data = (await response.json()) as CoinGeckoMarketChartResponse;

  return (data.prices ?? []).flatMap<PriceHistoryPoint>((point) => {
    const [timestamp, priceUsd] = point;

    if (!timestamp || !priceUsd || !Number.isFinite(priceUsd)) {
      return [];
    }

    return [
      {
        label: new Date(timestamp).toISOString().slice(0, 10),
        priceUsd,
      },
    ];
  });
}

export async function fetchFmarketNavHistory(productCode: string, navPeriod = 'navTo12Months') {
  const productResponse = await fetch(`https://api.fmarket.vn/home/product/${encodeURIComponent(productCode)}`);

  if (!productResponse.ok) {
    throw new Error('Unable to fetch fund details');
  }

  const productData = (await productResponse.json()) as FmarketProductResponse;
  const productId = productData.data?.id;

  if (!productId) {
    throw new Error('Fund product id is missing');
  }

  const historyResponse = await fetch('https://api.fmarket.vn/res/product/get-nav-history', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      isAllData: 0,
      productId,
      navPeriod,
    }),
  });

  if (!historyResponse.ok) {
    throw new Error('Unable to fetch fund NAV history');
  }

  const historyData = (await historyResponse.json()) as FmarketNavHistoryResponse;

  return (historyData.data ?? []).flatMap<NavHistoryPoint>((point) => {
    if (!point.navDate || !point.nav || !Number.isFinite(point.nav)) {
      return [];
    }

    return [{ label: point.navDate, nav: point.nav }];
  });
}
