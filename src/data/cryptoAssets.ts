import { CryptoId } from '../models/finance';

export interface SupportedCryptoAsset {
  id: CryptoId;
  name: string;
  symbol: string;
  color: string;
  fallbackPriceUsd: number;
}

export const supportedCryptoAssets: SupportedCryptoAsset[] = [
  { id: 'bitcoin', name: 'Bitcoin', symbol: 'BTC', color: '#F7931A', fallbackPriceUsd: 76765 },
  { id: 'ethereum', name: 'Ethereum', symbol: 'ETH', color: '#627EEA', fallbackPriceUsd: 2114.89 },
  { id: 'tether', name: 'Tether', symbol: 'USDT', color: '#26A17B', fallbackPriceUsd: 0.999419 },
  { id: 'binancecoin', name: 'BNB', symbol: 'BNB', color: '#F3BA2F', fallbackPriceUsd: 637.74 },
  { id: 'ripple', name: 'XRP', symbol: 'XRP', color: '#23292F', fallbackPriceUsd: 1.38 },
  { id: 'usd-coin', name: 'USDC', symbol: 'USDC', color: '#2775CA', fallbackPriceUsd: 0.99978 },
  { id: 'solana', name: 'Solana', symbol: 'SOL', color: '#14F195', fallbackPriceUsd: 84.29 },
  { id: 'tron', name: 'TRON', symbol: 'TRX', color: '#EF0027', fallbackPriceUsd: 0.355043 },
  { id: 'figure-heloc', name: 'Figure Heloc', symbol: 'FIGR_HELOC', color: '#4F46E5', fallbackPriceUsd: 1.039 },
  { id: 'dogecoin', name: 'Dogecoin', symbol: 'DOGE', color: '#C2A633', fallbackPriceUsd: 0.104029 },
  { id: 'whitebit', name: 'WhiteBIT Coin', symbol: 'WBT', color: '#111827', fallbackPriceUsd: 56.51 },
  { id: 'usds', name: 'USDS', symbol: 'USDS', color: '#2563EB', fallbackPriceUsd: 0.999664 },
  { id: 'hyperliquid', name: 'Hyperliquid', symbol: 'HYPE', color: '#10B981', fallbackPriceUsd: 45.39 },
  { id: 'leo-token', name: 'LEO Token', symbol: 'LEO', color: '#F97316', fallbackPriceUsd: 10.09 },
  { id: 'cardano', name: 'Cardano', symbol: 'ADA', color: '#0033AD', fallbackPriceUsd: 0.248223 },
  { id: 'zcash', name: 'Zcash', symbol: 'ZEC', color: '#ECB244', fallbackPriceUsd: 522.69 },
  { id: 'bitcoin-cash', name: 'Bitcoin Cash', symbol: 'BCH', color: '#8DC351', fallbackPriceUsd: 359.69 },
  { id: 'monero', name: 'Monero', symbol: 'XMR', color: '#FF6600', fallbackPriceUsd: 384.28 },
  { id: 'chainlink', name: 'Chainlink', symbol: 'LINK', color: '#2A5ADA', fallbackPriceUsd: 9.42 },
  { id: 'canton-network', name: 'Canton', symbol: 'CC', color: '#0F766E', fallbackPriceUsd: 0.153009 },
  { id: 'the-open-network', name: 'Toncoin', symbol: 'TON', color: '#0098EA', fallbackPriceUsd: 1.93 },
  { id: 'stellar', name: 'Stellar', symbol: 'XLM', color: '#1E293B', fallbackPriceUsd: 0.146326 },
  { id: 'usd1-wlfi', name: 'USD1', symbol: 'USD1', color: '#059669', fallbackPriceUsd: 1 },
  { id: 'dai', name: 'Dai', symbol: 'DAI', color: '#F5AC37', fallbackPriceUsd: 0.999666 },
  { id: 'ethena-usde', name: 'Ethena USDe', symbol: 'USDE', color: '#64748B', fallbackPriceUsd: 0.99971 },
  { id: 'memecore', name: 'MemeCore', symbol: 'M', color: '#EC4899', fallbackPriceUsd: 3.2 },
  { id: 'sui', name: 'Sui', symbol: 'SUI', color: '#4DA2FF', fallbackPriceUsd: 1.03 },
  { id: 'litecoin', name: 'Litecoin', symbol: 'LTC', color: '#345D9D', fallbackPriceUsd: 53.45 },
  { id: 'avalanche-2', name: 'Avalanche', symbol: 'AVAX', color: '#E84142', fallbackPriceUsd: 9.06 },
  { id: 'hedera-hashgraph', name: 'Hedera', symbol: 'HBAR', color: '#111827', fallbackPriceUsd: 0.088299 },
  { id: 'rain', name: 'Rain', symbol: 'RAIN', color: '#38BDF8', fallbackPriceUsd: 0.00738299 },
  { id: 'paypal-usd', name: 'PayPal USD', symbol: 'PYUSD', color: '#003087', fallbackPriceUsd: 0.999755 },
  { id: 'shiba-inu', name: 'Shiba Inu', symbol: 'SHIB', color: '#F00500', fallbackPriceUsd: 0.00000564 },
  { id: 'crypto-com-chain', name: 'Cronos', symbol: 'CRO', color: '#103F68', fallbackPriceUsd: 0.069048 },
  { id: 'global-dollar', name: 'Global Dollar', symbol: 'USDG', color: '#0284C7', fallbackPriceUsd: 0.999787 },
  { id: 'hashnote-usyc', name: 'Circle USYC', symbol: 'USYC', color: '#6D28D9', fallbackPriceUsd: 1.12 },
  { id: 'tether-gold', name: 'Tether Gold', symbol: 'XAUT', color: '#D4AF37', fallbackPriceUsd: 4534.53 },
  {
    id: 'blackrock-usd-institutional-digital-liquidity-fund',
    name: 'BlackRock USD Institutional Digital Liquidity Fund',
    symbol: 'BUIDL',
    color: '#0F172A',
    fallbackPriceUsd: 1,
  },
  { id: 'bittensor', name: 'Bittensor', symbol: 'TAO', color: '#111827', fallbackPriceUsd: 257.19 },
  { id: 'uniswap', name: 'Uniswap', symbol: 'UNI', color: '#FF007A', fallbackPriceUsd: 3.38 },
  { id: 'pax-gold', name: 'PAX Gold', symbol: 'PAXG', color: '#D6A84F', fallbackPriceUsd: 4535.02 },
  { id: 'mantle', name: 'Mantle', symbol: 'MNT', color: '#111827', fallbackPriceUsd: 0.627404 },
  { id: 'polkadot', name: 'Polkadot', symbol: 'DOT', color: '#E6007A', fallbackPriceUsd: 1.23 },
  { id: 'near', name: 'NEAR Protocol', symbol: 'NEAR', color: '#00C08B', fallbackPriceUsd: 1.51 },
  { id: 'world-liberty-financial', name: 'World Liberty Financial', symbol: 'WLFI', color: '#1D4ED8', fallbackPriceUsd: 0.059866 },
  { id: 'ondo-us-dollar-yield', name: 'Ondo US Dollar Yield', symbol: 'USDY', color: '#111827', fallbackPriceUsd: 1.13 },
  { id: 'falcon-finance', name: 'Falcon USD', symbol: 'USDF', color: '#7C3AED', fallbackPriceUsd: 0.997226 },
  { id: 'htx-dao', name: 'HTX DAO', symbol: 'HTX', color: '#2563EB', fallbackPriceUsd: 0.00000196 },
  { id: 'okb', name: 'OKB', symbol: 'OKB', color: '#111827', fallbackPriceUsd: 81.45 },
  { id: 'aster-2', name: 'Aster', symbol: 'ASTER', color: '#F59E0B', fallbackPriceUsd: 0.647464 },
];

export function getCryptoAsset(id: CryptoId) {
  return supportedCryptoAssets.find((asset) => asset.id === id) ?? supportedCryptoAssets[0];
}
