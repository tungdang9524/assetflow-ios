import { CryptoId, InvestmentAssetType } from '../models/finance';

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

interface YahooChartResponse {
  chart?: {
    result?: Array<{
      meta?: {
        regularMarketPrice?: number;
      };
      timestamp?: number[];
      indicators?: {
        quote?: Array<{
          close?: Array<number | null>;
        }>;
      };
    }>;
  };
}

export interface CryptoPrice {
  id: CryptoId;
  priceUsd: number;
  change24h?: number;
}

interface FmarketProductResponse {
  data?: {
    id?: number;
    nav?: number;
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

export interface InvestmentPriceRequest {
  symbol: string;
  type: InvestmentAssetType;
}

export interface InvestmentPrice {
  symbol: string;
  type: InvestmentAssetType;
  priceUsd: number;
}

export function getInvestmentPriceKey(type: InvestmentAssetType, symbol: string) {
  return `${type}:${symbol.toUpperCase()}`;
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

async function fetchFmarketProduct(productCode: string) {
  const productResponse = await fetch(`https://api.fmarket.vn/home/product/${encodeURIComponent(productCode)}`);

  if (!productResponse.ok) {
    throw new Error('Unable to fetch fund details');
  }

  const productData = (await productResponse.json()) as FmarketProductResponse;
  const product = productData.data;

  if (!product?.id) {
    throw new Error('Fund product id is missing');
  }

  return product;
}

export async function fetchFmarketNavHistory(productCode: string, navPeriod = 'navTo12Months') {
  const product = await fetchFmarketProduct(productCode);

  const historyResponse = await fetch('https://api.fmarket.vn/res/product/get-nav-history', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      isAllData: 0,
      productId: product.id,
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

async function fetchFmarketNavPrice(symbol: string, type: InvestmentAssetType) {
  const product = await fetchFmarketProduct(symbol);

  if (!product.nav || !Number.isFinite(product.nav)) {
    const history = await fetchFmarketNavHistory(symbol);
    const latestPoint = history[history.length - 1];

    if (!latestPoint) {
      throw new Error('Fund NAV is missing');
    }

    return {
      symbol,
      type,
      priceUsd: latestPoint.nav,
    };
  }

  return {
    symbol,
    type,
    priceUsd: product.nav,
  };
}

function getYahooChartResult(data: YahooChartResponse) {
  const result = data.chart?.result?.[0];

  if (!result) {
    throw new Error('ETF chart data is missing');
  }

  return result;
}

async function fetchYahooChart(symbol: string, range: string, interval: string) {
  const response = await fetch(
    `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?range=${range}&interval=${interval}&x=${Date.now()}`,
  );

  if (!response.ok) {
    throw new Error('Unable to fetch ETF data');
  }

  return getYahooChartResult((await response.json()) as YahooChartResponse);
}

async function fetchEtfPrice(symbol: string) {
  const result = await fetchYahooChart(symbol, '5d', '1d');
  const closes = result.indicators?.quote?.[0]?.close ?? [];
  const latestClose = [...closes].reverse().find((close): close is number => typeof close === 'number' && Number.isFinite(close));
  const price = result.meta?.regularMarketPrice ?? latestClose;

  if (!price || !Number.isFinite(price)) {
    throw new Error('ETF price is missing');
  }

  return {
    symbol,
    type: 'etf' as const,
    priceUsd: price,
  };
}

export async function fetchInvestmentPrices(requests: InvestmentPriceRequest[]) {
  if (requests.length === 0) {
    return [];
  }

  const uniqueRequests = Array.from(new Map(requests.map((request) => [getInvestmentPriceKey(request.type, request.symbol), request])).values());
  const results = await Promise.allSettled(
    uniqueRequests.map((request) => (request.type === 'etf' ? fetchEtfPrice(request.symbol) : fetchFmarketNavPrice(request.symbol, request.type))),
  );

  return results.flatMap<InvestmentPrice>((result) => (result.status === 'fulfilled' ? [result.value] : []));
}

export async function fetchInvestmentPriceHistory(symbol: string, type: InvestmentAssetType) {
  if (type !== 'etf') {
    const navHistory = await fetchFmarketNavHistory(symbol);

    return navHistory.map<PriceHistoryPoint>((point) => ({
      label: point.label,
      priceUsd: point.nav,
    }));
  }

  const result = await fetchYahooChart(symbol, '1y', '1d');
  const timestamps = result.timestamp ?? [];
  const closes = result.indicators?.quote?.[0]?.close ?? [];

  return timestamps.flatMap<PriceHistoryPoint>((timestamp, index) => {
    const priceUsd = closes[index];

    if (!timestamp || !priceUsd || !Number.isFinite(priceUsd)) {
      return [];
    }

    return [
      {
        label: new Date(timestamp * 1000).toISOString().slice(0, 10),
        priceUsd,
      },
    ];
  });
}
