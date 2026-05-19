import { InvestmentAssetType } from '../models/finance';

export interface SupportedInvestmentAsset {
  id: string;
  type: InvestmentAssetType;
  name: string;
  symbol: string;
  color: string;
  fallbackPriceUsd: number;
}

const stockColor = '#2563EB';
const etfColor = '#059669';

export const supportedStockAssets: SupportedInvestmentAsset[] = [
  { id: 'stock-nvda', type: 'stock', symbol: 'NVDA', name: 'NVIDIA', color: stockColor, fallbackPriceUsd: 211.5 },
  { id: 'stock-googl', type: 'stock', symbol: 'GOOGL', name: 'Alphabet Class A', color: stockColor, fallbackPriceUsd: 268.43 },
  { id: 'stock-aapl', type: 'stock', symbol: 'AAPL', name: 'Apple', color: stockColor, fallbackPriceUsd: 271.49 },
  { id: 'stock-msft', type: 'stock', symbol: 'MSFT', name: 'Microsoft', color: stockColor, fallbackPriceUsd: 420.77 },
  { id: 'stock-amzn', type: 'stock', symbol: 'AMZN', name: 'Amazon', color: stockColor, fallbackPriceUsd: 270.1 },
  { id: 'stock-avgo', type: 'stock', symbol: 'AVGO', name: 'Broadcom', color: stockColor, fallbackPriceUsd: 416.77 },
  { id: 'stock-meta', type: 'stock', symbol: 'META', name: 'Meta Platforms', color: stockColor, fallbackPriceUsd: 616.91 },
  { id: 'stock-tsla', type: 'stock', symbol: 'TSLA', name: 'Tesla', color: stockColor, fallbackPriceUsd: 445.18 },
  { id: 'stock-brk-b', type: 'stock', symbol: 'BRK.B', name: 'Berkshire Hathaway Class B', color: stockColor, fallbackPriceUsd: 510.52 },
  { id: 'stock-lly', type: 'stock', symbol: 'LLY', name: 'Eli Lilly', color: stockColor, fallbackPriceUsd: 760 },
  { id: 'stock-wmt', type: 'stock', symbol: 'WMT', name: 'Walmart', color: stockColor, fallbackPriceUsd: 101 },
  { id: 'stock-jpm', type: 'stock', symbol: 'JPM', name: 'JPMorgan Chase', color: stockColor, fallbackPriceUsd: 286 },
  { id: 'stock-v', type: 'stock', symbol: 'V', name: 'Visa', color: stockColor, fallbackPriceUsd: 340 },
  { id: 'stock-orcl', type: 'stock', symbol: 'ORCL', name: 'Oracle', color: stockColor, fallbackPriceUsd: 183 },
  { id: 'stock-ma', type: 'stock', symbol: 'MA', name: 'Mastercard', color: stockColor, fallbackPriceUsd: 560 },
  { id: 'stock-xom', type: 'stock', symbol: 'XOM', name: 'Exxon Mobil', color: stockColor, fallbackPriceUsd: 116 },
  { id: 'stock-cost', type: 'stock', symbol: 'COST', name: 'Costco Wholesale', color: stockColor, fallbackPriceUsd: 920 },
  { id: 'stock-nflx', type: 'stock', symbol: 'NFLX', name: 'Netflix', color: stockColor, fallbackPriceUsd: 1120 },
  { id: 'stock-hd', type: 'stock', symbol: 'HD', name: 'Home Depot', color: stockColor, fallbackPriceUsd: 390 },
  { id: 'stock-pg', type: 'stock', symbol: 'PG', name: 'Procter & Gamble', color: stockColor, fallbackPriceUsd: 165 },
  { id: 'stock-jnj', type: 'stock', symbol: 'JNJ', name: 'Johnson & Johnson', color: stockColor, fallbackPriceUsd: 155 },
  { id: 'stock-abbv', type: 'stock', symbol: 'ABBV', name: 'AbbVie', color: stockColor, fallbackPriceUsd: 185 },
  { id: 'stock-ko', type: 'stock', symbol: 'KO', name: 'Coca-Cola', color: stockColor, fallbackPriceUsd: 67 },
  { id: 'stock-bac', type: 'stock', symbol: 'BAC', name: 'Bank of America', color: stockColor, fallbackPriceUsd: 46 },
  { id: 'stock-cvx', type: 'stock', symbol: 'CVX', name: 'Chevron', color: stockColor, fallbackPriceUsd: 155 },
  { id: 'stock-crm', type: 'stock', symbol: 'CRM', name: 'Salesforce', color: stockColor, fallbackPriceUsd: 285 },
  { id: 'stock-csco', type: 'stock', symbol: 'CSCO', name: 'Cisco Systems', color: stockColor, fallbackPriceUsd: 66 },
  { id: 'stock-pep', type: 'stock', symbol: 'PEP', name: 'PepsiCo', color: stockColor, fallbackPriceUsd: 175 },
  { id: 'stock-tmus', type: 'stock', symbol: 'TMUS', name: 'T-Mobile US', color: stockColor, fallbackPriceUsd: 235 },
  { id: 'stock-wfc', type: 'stock', symbol: 'WFC', name: 'Wells Fargo', color: stockColor, fallbackPriceUsd: 74 },
  { id: 'stock-adbe', type: 'stock', symbol: 'ADBE', name: 'Adobe', color: stockColor, fallbackPriceUsd: 435 },
  { id: 'stock-acn', type: 'stock', symbol: 'ACN', name: 'Accenture', color: stockColor, fallbackPriceUsd: 325 },
  { id: 'stock-mcd', type: 'stock', symbol: 'MCD', name: "McDonald's", color: stockColor, fallbackPriceUsd: 295 },
  { id: 'stock-abt', type: 'stock', symbol: 'ABT', name: 'Abbott Laboratories', color: stockColor, fallbackPriceUsd: 128 },
  { id: 'stock-ge', type: 'stock', symbol: 'GE', name: 'GE Aerospace', color: stockColor, fallbackPriceUsd: 265 },
  { id: 'stock-ibm', type: 'stock', symbol: 'IBM', name: 'IBM', color: stockColor, fallbackPriceUsd: 280 },
  { id: 'stock-intu', type: 'stock', symbol: 'INTU', name: 'Intuit', color: stockColor, fallbackPriceUsd: 685 },
  { id: 'stock-qcom', type: 'stock', symbol: 'QCOM', name: 'Qualcomm', color: stockColor, fallbackPriceUsd: 170 },
  { id: 'stock-amd', type: 'stock', symbol: 'AMD', name: 'Advanced Micro Devices', color: stockColor, fallbackPriceUsd: 165 },
  { id: 'stock-txn', type: 'stock', symbol: 'TXN', name: 'Texas Instruments', color: stockColor, fallbackPriceUsd: 200 },
  { id: 'stock-dis', type: 'stock', symbol: 'DIS', name: 'Walt Disney', color: stockColor, fallbackPriceUsd: 115 },
  { id: 'stock-pm', type: 'stock', symbol: 'PM', name: 'Philip Morris International', color: stockColor, fallbackPriceUsd: 160 },
  { id: 'stock-nee', type: 'stock', symbol: 'NEE', name: 'NextEra Energy', color: stockColor, fallbackPriceUsd: 75 },
  { id: 'stock-now', type: 'stock', symbol: 'NOW', name: 'ServiceNow', color: stockColor, fallbackPriceUsd: 930 },
  { id: 'stock-cat', type: 'stock', symbol: 'CAT', name: 'Caterpillar', color: stockColor, fallbackPriceUsd: 390 },
  { id: 'stock-uber', type: 'stock', symbol: 'UBER', name: 'Uber Technologies', color: stockColor, fallbackPriceUsd: 82 },
  { id: 'stock-axp', type: 'stock', symbol: 'AXP', name: 'American Express', color: stockColor, fallbackPriceUsd: 310 },
  { id: 'stock-gs', type: 'stock', symbol: 'GS', name: 'Goldman Sachs', color: stockColor, fallbackPriceUsd: 575 },
  { id: 'stock-unh', type: 'stock', symbol: 'UNH', name: 'UnitedHealth Group', color: stockColor, fallbackPriceUsd: 310 },
  { id: 'stock-pfe', type: 'stock', symbol: 'PFE', name: 'Pfizer', color: stockColor, fallbackPriceUsd: 25 },
];

export const supportedEtfAssets: SupportedInvestmentAsset[] = [
  { id: 'etf-spy', type: 'etf', symbol: 'SPY', name: 'SPDR S&P 500 ETF Trust', color: etfColor, fallbackPriceUsd: 660 },
  { id: 'etf-ivv', type: 'etf', symbol: 'IVV', name: 'iShares Core S&P 500 ETF', color: etfColor, fallbackPriceUsd: 665 },
  { id: 'etf-voo', type: 'etf', symbol: 'VOO', name: 'Vanguard S&P 500 ETF', color: etfColor, fallbackPriceUsd: 610 },
  { id: 'etf-vti', type: 'etf', symbol: 'VTI', name: 'Vanguard Total Stock Market ETF', color: etfColor, fallbackPriceUsd: 325 },
  { id: 'etf-qqq', type: 'etf', symbol: 'QQQ', name: 'Invesco QQQ Trust', color: etfColor, fallbackPriceUsd: 600 },
  { id: 'etf-vea', type: 'etf', symbol: 'VEA', name: 'Vanguard FTSE Developed Markets ETF', color: etfColor, fallbackPriceUsd: 58 },
  { id: 'etf-vxus', type: 'etf', symbol: 'VXUS', name: 'Vanguard Total International Stock ETF', color: etfColor, fallbackPriceUsd: 72 },
  { id: 'etf-vug', type: 'etf', symbol: 'VUG', name: 'Vanguard Growth ETF', color: etfColor, fallbackPriceUsd: 440 },
  { id: 'etf-vtv', type: 'etf', symbol: 'VTV', name: 'Vanguard Value ETF', color: etfColor, fallbackPriceUsd: 190 },
  { id: 'etf-agg', type: 'etf', symbol: 'AGG', name: 'iShares Core U.S. Aggregate Bond ETF', color: etfColor, fallbackPriceUsd: 101 },
  { id: 'etf-bnd', type: 'etf', symbol: 'BND', name: 'Vanguard Total Bond Market ETF', color: etfColor, fallbackPriceUsd: 74 },
  { id: 'etf-ijh', type: 'etf', symbol: 'IJH', name: 'iShares Core S&P Mid-Cap ETF', color: etfColor, fallbackPriceUsd: 66 },
  { id: 'etf-ijr', type: 'etf', symbol: 'IJR', name: 'iShares Core S&P Small-Cap ETF', color: etfColor, fallbackPriceUsd: 115 },
  { id: 'etf-vb', type: 'etf', symbol: 'VB', name: 'Vanguard Small-Cap ETF', color: etfColor, fallbackPriceUsd: 245 },
  { id: 'etf-vgt', type: 'etf', symbol: 'VGT', name: 'Vanguard Information Technology ETF', color: etfColor, fallbackPriceUsd: 700 },
  { id: 'etf-iwf', type: 'etf', symbol: 'IWF', name: 'iShares Russell 1000 Growth ETF', color: etfColor, fallbackPriceUsd: 430 },
  { id: 'etf-iwd', type: 'etf', symbol: 'IWD', name: 'iShares Russell 1000 Value ETF', color: etfColor, fallbackPriceUsd: 205 },
  { id: 'etf-schd', type: 'etf', symbol: 'SCHD', name: 'Schwab U.S. Dividend Equity ETF', color: etfColor, fallbackPriceUsd: 28 },
  { id: 'etf-schg', type: 'etf', symbol: 'SCHG', name: 'Schwab U.S. Large-Cap Growth ETF', color: etfColor, fallbackPriceUsd: 32 },
  { id: 'etf-scha', type: 'etf', symbol: 'SCHA', name: 'Schwab U.S. Small-Cap ETF', color: etfColor, fallbackPriceUsd: 29 },
  { id: 'etf-dia', type: 'etf', symbol: 'DIA', name: 'SPDR Dow Jones Industrial Average ETF', color: etfColor, fallbackPriceUsd: 455 },
  { id: 'etf-xlk', type: 'etf', symbol: 'XLK', name: 'Technology Select Sector SPDR Fund', color: etfColor, fallbackPriceUsd: 265 },
  { id: 'etf-xlf', type: 'etf', symbol: 'XLF', name: 'Financial Select Sector SPDR Fund', color: etfColor, fallbackPriceUsd: 52 },
  { id: 'etf-xle', type: 'etf', symbol: 'XLE', name: 'Energy Select Sector SPDR Fund', color: etfColor, fallbackPriceUsd: 92 },
  { id: 'etf-xlv', type: 'etf', symbol: 'XLV', name: 'Health Care Select Sector SPDR Fund', color: etfColor, fallbackPriceUsd: 150 },
  { id: 'etf-xly', type: 'etf', symbol: 'XLY', name: 'Consumer Discretionary Select Sector SPDR Fund', color: etfColor, fallbackPriceUsd: 225 },
  { id: 'etf-xlp', type: 'etf', symbol: 'XLP', name: 'Consumer Staples Select Sector SPDR Fund', color: etfColor, fallbackPriceUsd: 85 },
  { id: 'etf-xli', type: 'etf', symbol: 'XLI', name: 'Industrial Select Sector SPDR Fund', color: etfColor, fallbackPriceUsd: 150 },
  { id: 'etf-xlre', type: 'etf', symbol: 'XLRE', name: 'Real Estate Select Sector SPDR Fund', color: etfColor, fallbackPriceUsd: 44 },
  { id: 'etf-xlu', type: 'etf', symbol: 'XLU', name: 'Utilities Select Sector SPDR Fund', color: etfColor, fallbackPriceUsd: 78 },
  { id: 'etf-xlc', type: 'etf', symbol: 'XLC', name: 'Communication Services Select Sector SPDR Fund', color: etfColor, fallbackPriceUsd: 100 },
  { id: 'etf-smh', type: 'etf', symbol: 'SMH', name: 'VanEck Semiconductor ETF', color: etfColor, fallbackPriceUsd: 315 },
  { id: 'etf-soxx', type: 'etf', symbol: 'SOXX', name: 'iShares Semiconductor ETF', color: etfColor, fallbackPriceUsd: 260 },
  { id: 'etf-ibit', type: 'etf', symbol: 'IBIT', name: 'iShares Bitcoin Trust ETF', color: etfColor, fallbackPriceUsd: 65 },
  { id: 'etf-gld', type: 'etf', symbol: 'GLD', name: 'SPDR Gold Shares', color: etfColor, fallbackPriceUsd: 245 },
  { id: 'etf-iau', type: 'etf', symbol: 'IAU', name: 'iShares Gold Trust', color: etfColor, fallbackPriceUsd: 50 },
  { id: 'etf-tlt', type: 'etf', symbol: 'TLT', name: 'iShares 20+ Year Treasury Bond ETF', color: etfColor, fallbackPriceUsd: 92 },
  { id: 'etf-shy', type: 'etf', symbol: 'SHY', name: 'iShares 1-3 Year Treasury Bond ETF', color: etfColor, fallbackPriceUsd: 83 },
  { id: 'etf-hyg', type: 'etf', symbol: 'HYG', name: 'iShares iBoxx High Yield Corporate Bond ETF', color: etfColor, fallbackPriceUsd: 80 },
  { id: 'etf-lqd', type: 'etf', symbol: 'LQD', name: 'iShares iBoxx Investment Grade Corporate Bond ETF', color: etfColor, fallbackPriceUsd: 110 },
  { id: 'etf-vwo', type: 'etf', symbol: 'VWO', name: 'Vanguard FTSE Emerging Markets ETF', color: etfColor, fallbackPriceUsd: 50 },
  { id: 'etf-ewj', type: 'etf', symbol: 'EWJ', name: 'iShares MSCI Japan ETF', color: etfColor, fallbackPriceUsd: 75 },
  { id: 'etf-ewz', type: 'etf', symbol: 'EWZ', name: 'iShares MSCI Brazil ETF', color: etfColor, fallbackPriceUsd: 28 },
  { id: 'etf-mchi', type: 'etf', symbol: 'MCHI', name: 'iShares MSCI China ETF', color: etfColor, fallbackPriceUsd: 60 },
  { id: 'etf-efa', type: 'etf', symbol: 'EFA', name: 'iShares MSCI EAFE ETF', color: etfColor, fallbackPriceUsd: 85 },
  { id: 'etf-iemg', type: 'etf', symbol: 'IEMG', name: 'iShares Core MSCI Emerging Markets ETF', color: etfColor, fallbackPriceUsd: 62 },
  { id: 'etf-vnq', type: 'etf', symbol: 'VNQ', name: 'Vanguard Real Estate ETF', color: etfColor, fallbackPriceUsd: 95 },
  { id: 'etf-vym', type: 'etf', symbol: 'VYM', name: 'Vanguard High Dividend Yield ETF', color: etfColor, fallbackPriceUsd: 135 },
  { id: 'etf-vo', type: 'etf', symbol: 'VO', name: 'Vanguard Mid-Cap ETF', color: etfColor, fallbackPriceUsd: 285 },
  { id: 'etf-mgk', type: 'etf', symbol: 'MGK', name: 'Vanguard Mega Cap Growth ETF', color: etfColor, fallbackPriceUsd: 380 },
];

export function getInvestmentAssets(type: InvestmentAssetType) {
  return type === 'stock' ? supportedStockAssets : supportedEtfAssets;
}

export function getInvestmentAsset(type: InvestmentAssetType, id: string) {
  return getInvestmentAssets(type).find((asset) => asset.id === id) ?? getInvestmentAssets(type)[0];
}
