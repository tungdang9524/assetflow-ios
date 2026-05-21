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
const bondColor = '#B45309';

export const supportedStockAssets: SupportedInvestmentAsset[] = [
  { id: 'stock-abef', type: 'stock', symbol: 'ABEF', name: 'QUY DAU TU CO PHIEU AN BINH THINH VUONG', color: stockColor, fallbackPriceUsd: 10276.65 },
  { id: 'stock-bmff', type: 'stock', symbol: 'BMFF', name: 'QUY DAU TU TANG TRUONG BORDIER - MB FLAGSHIP', color: stockColor, fallbackPriceUsd: 16152 },
  { id: 'stock-bvfed', type: 'stock', symbol: 'BVFED', name: 'QUY DAU TU CO PHIEU NANG DONG BAO VIET', color: stockColor, fallbackPriceUsd: 31009 },
  { id: 'stock-bvpf', type: 'stock', symbol: 'BVPF', name: 'QUY DAU TU CO PHIEU TRIEN VONG BAO VIET', color: stockColor, fallbackPriceUsd: 22402 },
  { id: 'stock-dcaf', type: 'stock', symbol: 'DCAF', name: 'QUY DAU TU TANG TRUONG DFVN', color: stockColor, fallbackPriceUsd: 17675.42 },
  { id: 'stock-dcde', type: 'stock', symbol: 'DCDE', name: 'QUY DAU TU CO PHIEU TAP TRUNG CO TUC DC', color: stockColor, fallbackPriceUsd: 29919.57 },
  { id: 'stock-dcds', type: 'stock', symbol: 'DCDS', name: 'QUY DAU TU CHUNG KHOAN NANG DONG DC', color: stockColor, fallbackPriceUsd: 104433.6 },
  { id: 'stock-evesg', type: 'stock', symbol: 'EVESG', name: 'QUY DAU TU CO PHIEU ESG EASTSPRING INVESTMENTS VIET NAM', color: stockColor, fallbackPriceUsd: 13086 },
  { id: 'stock-gdegf', type: 'stock', symbol: 'GDEGF', name: 'QUY DAU TU CO PHIEU TANG TRUONG RONG VANG', color: stockColor, fallbackPriceUsd: 8867.22 },
  { id: 'stock-kdef', type: 'stock', symbol: 'KDEF', name: 'QUY DAU TU CO PHIEU CO TUC TANG TRUONG KIM', color: stockColor, fallbackPriceUsd: 12144.41 },
  { id: 'stock-lhcdf', type: 'stock', symbol: 'LHCDF', name: 'QUY DAU TU NANG DONG LIGHTHOUSE', color: stockColor, fallbackPriceUsd: 11989.78 },
  { id: 'stock-lplf', type: 'stock', symbol: 'LPLF', name: 'QUY DAU TU DOANH NGHIEP DAN DAU LP', color: stockColor, fallbackPriceUsd: 9985.72 },
  { id: 'stock-mafeqi', type: 'stock', symbol: 'MAFEQI', name: 'QUY DAU TU CO PHIEU MANULIFE', color: stockColor, fallbackPriceUsd: 20822 },
  { id: 'stock-magef', type: 'stock', symbol: 'MAGEF', name: 'QUY DAU TU CO PHIEU TANG TRUONG MIRAE ASSET VIET NAM', color: stockColor, fallbackPriceUsd: 22076.69 },
  { id: 'stock-mbvf', type: 'stock', symbol: 'MBVF', name: 'QUY DAU TU GIA TRI MB CAPITAL', color: stockColor, fallbackPriceUsd: 27280 },
  { id: 'stock-ntppf', type: 'stock', symbol: 'NTPPF', name: 'QUY DAU TU CO PHIEU TRIEN VONG NTP', color: stockColor, fallbackPriceUsd: 10769.13 },
  { id: 'stock-phvsf', type: 'stock', symbol: 'PHVSF', name: 'QUY DAU TU CHON LOC PHU HUNG VIET NAM', color: stockColor, fallbackPriceUsd: 13248.89 },
  { id: 'stock-rvpif', type: 'stock', symbol: 'RVPIF', name: 'QUY DAU TU THINH VUONG RONG VIET', color: stockColor, fallbackPriceUsd: 10831.74 },
  { id: 'stock-ssisca', type: 'stock', symbol: 'SSISCA', name: 'QUY DAU TU LOI THE CANH TRANH BEN VUNG SSI', color: stockColor, fallbackPriceUsd: 45036.7 },
  { id: 'stock-tblf', type: 'stock', symbol: 'TBLF', name: 'QUY DAU TU CO PHIEU TANG TRUONG BALLAD VIET NAM', color: stockColor, fallbackPriceUsd: 11288.56 },
  { id: 'stock-tcgf', type: 'stock', symbol: 'TCGF', name: 'QUY DAU TU TANG TRUONG THANH CONG', color: stockColor, fallbackPriceUsd: 11596.77 },
  { id: 'stock-uveef', type: 'stock', symbol: 'UVEEF', name: 'QUY DAU TU CO PHIEU UNITED ESG VIET NAM', color: stockColor, fallbackPriceUsd: 17855.53 },
  { id: 'stock-vcamdf', type: 'stock', symbol: 'VCAMDF', name: 'QUY DAU TU BAN VIET DISCOVERY', color: stockColor, fallbackPriceUsd: 11078.29 },
  { id: 'stock-vcbf-aif', type: 'stock', symbol: 'VCBF-AIF', name: 'QUY DAU TU THU NHAP CHU DONG VCBF', color: stockColor, fallbackPriceUsd: 11700.62 },
  { id: 'stock-vcbf-bcf', type: 'stock', symbol: 'VCBF-BCF', name: 'QUY DAU TU CO PHIEU HANG DAU VCBF', color: stockColor, fallbackPriceUsd: 44142.07 },
  { id: 'stock-vcbf-mgf', type: 'stock', symbol: 'VCBF-MGF', name: 'QUY DAU TU CO PHIEU TANG TRUONG VCBF', color: stockColor, fallbackPriceUsd: 14599.97 },
  { id: 'stock-vdef', type: 'stock', symbol: 'VDEF', name: 'QUY DAU TU CO PHIEU CO TUC NANG DONG VINACAPITAL', color: stockColor, fallbackPriceUsd: 12466.42 },
  { id: 'stock-veof', type: 'stock', symbol: 'VEOF', name: 'QUY DAU TU CO PHIEU HUNG THINH VINACAPITAL', color: stockColor, fallbackPriceUsd: 35182.56 },
  { id: 'stock-vesaf', type: 'stock', symbol: 'VESAF', name: 'QUY DAU TU CO PHIEU TIEP CAN THI TRUONG VINACAPITAL', color: stockColor, fallbackPriceUsd: 34406.75 },
  { id: 'stock-vlgf', type: 'stock', symbol: 'VLGF', name: 'QUY DAU TU TANG TRUONG DAI HAN VIET NAM', color: stockColor, fallbackPriceUsd: 12820.8 },
  { id: 'stock-vmeef', type: 'stock', symbol: 'VMEEF', name: 'QUY DAU TU CO PHIEU KINH TE HIEN DAI VINACAPITAL', color: stockColor, fallbackPriceUsd: 16796.09 },
  { id: 'stock-vndaf', type: 'stock', symbol: 'VNDAF', name: 'QUY DAU TU CHU DONG VND', color: stockColor, fallbackPriceUsd: 20723.29 },
];

export const supportedBondAssets: SupportedInvestmentAsset[] = [
  { id: 'bond-abbf', type: 'bond', symbol: 'ABBF', name: 'QUY DAU TU TRAI PHIEU AN BINH', color: bondColor, fallbackPriceUsd: 14292.17 },
  { id: 'bond-asbf', type: 'bond', symbol: 'ASBF', name: 'QUY DAU TU TRAI PHIEU AN TOAN AMBER', color: bondColor, fallbackPriceUsd: 12897.01 },
  { id: 'bond-bvbf', type: 'bond', symbol: 'BVBF', name: 'QUY DAU TU TRAI PHIEU BAO VIET', color: bondColor, fallbackPriceUsd: 22180 },
  { id: 'bond-dcbf', type: 'bond', symbol: 'DCBF', name: 'QUY DAU TU TRAI PHIEU DC', color: bondColor, fallbackPriceUsd: 29745.9 },
  { id: 'bond-dcip', type: 'bond', symbol: 'DCIP', name: 'QUY DAU TU TRAI PHIEU GIA TANG THU NHAP CO DINH DC', color: bondColor, fallbackPriceUsd: 12141.83 },
  { id: 'bond-dfix', type: 'bond', symbol: 'DFIX', name: 'QUY DAU TU TRAI PHIEU DFVN', color: bondColor, fallbackPriceUsd: 12118.82 },
  { id: 'bond-hdbond', type: 'bond', symbol: 'HDBOND', name: 'QUY DAU TU TRAI PHIEU LOI TUC CAO HD', color: bondColor, fallbackPriceUsd: 12172.36 },
  { id: 'bond-ksif', type: 'bond', symbol: 'KSIF', name: 'QUY DAU TU TRAI PHIEU CHIEN LUOC KIM', color: bondColor, fallbackPriceUsd: 10000 },
  { id: 'bond-lhbf', type: 'bond', symbol: 'LHBF', name: 'QUY DAU TU TRAI PHIEU LIGHTHOUSE', color: bondColor, fallbackPriceUsd: 15012.72 },
  { id: 'bond-lhfcf', type: 'bond', symbol: 'LHFCF', name: 'QUY DAU TU TRAI PHIEU DONG TIEN LINH HOAT LIGHTHOUSE', color: bondColor, fallbackPriceUsd: 10109.62 },
  { id: 'bond-lpbf', type: 'bond', symbol: 'LPBF', name: 'QUY DAU TU TRAI PHIEU LP', color: bondColor, fallbackPriceUsd: 10574.31 },
  { id: 'bond-maff', type: 'bond', symbol: 'MAFF', name: 'QUY DAU TU TRAI PHIEU LINH HOAT MIRAE ASSET VIET NAM', color: bondColor, fallbackPriceUsd: 13649.36 },
  { id: 'bond-mbam', type: 'bond', symbol: 'MBAM', name: 'QUY DAU TU TRAI PHIEU DONG TIEN LINH HOAT MB', color: bondColor, fallbackPriceUsd: 11286 },
  { id: 'bond-pvbf', type: 'bond', symbol: 'PVBF', name: 'QUY DAU TU TRAI PHIEU PVCOM', color: bondColor, fallbackPriceUsd: 15216.53 },
  { id: 'bond-ssibf', type: 'bond', symbol: 'SSIBF', name: 'QUY DAU TU TRAI PHIEU SSI', color: bondColor, fallbackPriceUsd: 16755.12 },
  { id: 'bond-usif', type: 'bond', symbol: 'USIF', name: 'QUY DAU TU TRAI PHIEU UNITED THU NHAP ON DINH', color: bondColor, fallbackPriceUsd: 10203.37 },
  { id: 'bond-vcamfi', type: 'bond', symbol: 'VCAMFI', name: 'QUY DAU TU TRAI PHIEU BAN VIET', color: bondColor, fallbackPriceUsd: 12225.39 },
  { id: 'bond-vcbf-fif', type: 'bond', symbol: 'VCBF-FIF', name: 'QUY DAU TU TRAI PHIEU VCBF', color: bondColor, fallbackPriceUsd: 15783.14 },
  { id: 'bond-vff', type: 'bond', symbol: 'VFF', name: 'QUY DAU TU TRAI PHIEU BAO THINH VINACAPITAL', color: bondColor, fallbackPriceUsd: 26183.68 },
  { id: 'bond-vlbf', type: 'bond', symbol: 'VLBF', name: 'QUY DAU TU TRAI PHIEU THANH KHOAN VINACAPITAL', color: bondColor, fallbackPriceUsd: 12515.22 },
  { id: 'bond-vndbf', type: 'bond', symbol: 'VNDBF', name: 'QUY DAU TU TRAI PHIEU VND', color: bondColor, fallbackPriceUsd: 15956.29 },
  { id: 'bond-vndcf', type: 'bond', symbol: 'VNDCF', name: 'QUY DAU TU TRAI PHIEU LINH HOAT VND', color: bondColor, fallbackPriceUsd: 11621 },
];

export const supportedEtfAssets: SupportedInvestmentAsset[] = [   { id: 'etf-spy', type: 'etf', symbol: 'SPY', name: 'SPDR S&P 500 ETF Trust', color: etfColor, fallbackPriceUsd: 660 },   { id: 'etf-ivv', type: 'etf', symbol: 'IVV', name: 'iShares Core S&P 500 ETF', color: etfColor, fallbackPriceUsd: 665 },   { id: 'etf-voo', type: 'etf', symbol: 'VOO', name: 'Vanguard S&P 500 ETF', color: etfColor, fallbackPriceUsd: 610 },   { id: 'etf-vti', type: 'etf', symbol: 'VTI', name: 'Vanguard Total Stock Market ETF', color: etfColor, fallbackPriceUsd: 325 },   { id: 'etf-qqq', type: 'etf', symbol: 'QQQ', name: 'Invesco QQQ Trust', color: etfColor, fallbackPriceUsd: 600 },   { id: 'etf-vea', type: 'etf', symbol: 'VEA', name: 'Vanguard FTSE Developed Markets ETF', color: etfColor, fallbackPriceUsd: 58 },   { id: 'etf-vxus', type: 'etf', symbol: 'VXUS', name: 'Vanguard Total International Stock ETF', color: etfColor, fallbackPriceUsd: 72 },   { id: 'etf-vug', type: 'etf', symbol: 'VUG', name: 'Vanguard Growth ETF', color: etfColor, fallbackPriceUsd: 440 },   { id: 'etf-vtv', type: 'etf', symbol: 'VTV', name: 'Vanguard Value ETF', color: etfColor, fallbackPriceUsd: 190 },   { id: 'etf-agg', type: 'etf', symbol: 'AGG', name: 'iShares Core U.S. Aggregate Bond ETF', color: etfColor, fallbackPriceUsd: 101 },   { id: 'etf-bnd', type: 'etf', symbol: 'BND', name: 'Vanguard Total Bond Market ETF', color: etfColor, fallbackPriceUsd: 74 },   { id: 'etf-ijh', type: 'etf', symbol: 'IJH', name: 'iShares Core S&P Mid-Cap ETF', color: etfColor, fallbackPriceUsd: 66 },   { id: 'etf-ijr', type: 'etf', symbol: 'IJR', name: 'iShares Core S&P Small-Cap ETF', color: etfColor, fallbackPriceUsd: 115 },   { id: 'etf-vb', type: 'etf', symbol: 'VB', name: 'Vanguard Small-Cap ETF', color: etfColor, fallbackPriceUsd: 245 },   { id: 'etf-vgt', type: 'etf', symbol: 'VGT', name: 'Vanguard Information Technology ETF', color: etfColor, fallbackPriceUsd: 700 },   { id: 'etf-iwf', type: 'etf', symbol: 'IWF', name: 'iShares Russell 1000 Growth ETF', color: etfColor, fallbackPriceUsd: 430 },   { id: 'etf-iwd', type: 'etf', symbol: 'IWD', name: 'iShares Russell 1000 Value ETF', color: etfColor, fallbackPriceUsd: 205 },   { id: 'etf-schd', type: 'etf', symbol: 'SCHD', name: 'Schwab U.S. Dividend Equity ETF', color: etfColor, fallbackPriceUsd: 28 },   { id: 'etf-schg', type: 'etf', symbol: 'SCHG', name: 'Schwab U.S. Large-Cap Growth ETF', color: etfColor, fallbackPriceUsd: 32 },   { id: 'etf-scha', type: 'etf', symbol: 'SCHA', name: 'Schwab U.S. Small-Cap ETF', color: etfColor, fallbackPriceUsd: 29 },   { id: 'etf-dia', type: 'etf', symbol: 'DIA', name: 'SPDR Dow Jones Industrial Average ETF', color: etfColor, fallbackPriceUsd: 455 },   { id: 'etf-xlk', type: 'etf', symbol: 'XLK', name: 'Technology Select Sector SPDR Fund', color: etfColor, fallbackPriceUsd: 265 },   { id: 'etf-xlf', type: 'etf', symbol: 'XLF', name: 'Financial Select Sector SPDR Fund', color: etfColor, fallbackPriceUsd: 52 },   { id: 'etf-xle', type: 'etf', symbol: 'XLE', name: 'Energy Select Sector SPDR Fund', color: etfColor, fallbackPriceUsd: 92 },   { id: 'etf-xlv', type: 'etf', symbol: 'XLV', name: 'Health Care Select Sector SPDR Fund', color: etfColor, fallbackPriceUsd: 150 },   { id: 'etf-xly', type: 'etf', symbol: 'XLY', name: 'Consumer Discretionary Select Sector SPDR Fund', color: etfColor, fallbackPriceUsd: 225 },   { id: 'etf-xlp', type: 'etf', symbol: 'XLP', name: 'Consumer Staples Select Sector SPDR Fund', color: etfColor, fallbackPriceUsd: 85 },   { id: 'etf-xli', type: 'etf', symbol: 'XLI', name: 'Industrial Select Sector SPDR Fund', color: etfColor, fallbackPriceUsd: 150 },   { id: 'etf-xlre', type: 'etf', symbol: 'XLRE', name: 'Real Estate Select Sector SPDR Fund', color: etfColor, fallbackPriceUsd: 44 },   { id: 'etf-xlu', type: 'etf', symbol: 'XLU', name: 'Utilities Select Sector SPDR Fund', color: etfColor, fallbackPriceUsd: 78 },   { id: 'etf-xlc', type: 'etf', symbol: 'XLC', name: 'Communication Services Select Sector SPDR Fund', color: etfColor, fallbackPriceUsd: 100 },   { id: 'etf-smh', type: 'etf', symbol: 'SMH', name: 'VanEck Semiconductor ETF', color: etfColor, fallbackPriceUsd: 315 },   { id: 'etf-soxx', type: 'etf', symbol: 'SOXX', name: 'iShares Semiconductor ETF', color: etfColor, fallbackPriceUsd: 260 },   { id: 'etf-ibit', type: 'etf', symbol: 'IBIT', name: 'iShares Bitcoin Trust ETF', color: etfColor, fallbackPriceUsd: 65 },   { id: 'etf-gld', type: 'etf', symbol: 'GLD', name: 'SPDR Gold Shares', color: etfColor, fallbackPriceUsd: 245 },   { id: 'etf-iau', type: 'etf', symbol: 'IAU', name: 'iShares Gold Trust', color: etfColor, fallbackPriceUsd: 50 },   { id: 'etf-tlt', type: 'etf', symbol: 'TLT', name: 'iShares 20+ Year Treasury Bond ETF', color: etfColor, fallbackPriceUsd: 92 },   { id: 'etf-shy', type: 'etf', symbol: 'SHY', name: 'iShares 1-3 Year Treasury Bond ETF', color: etfColor, fallbackPriceUsd: 83 },   { id: 'etf-hyg', type: 'etf', symbol: 'HYG', name: 'iShares iBoxx High Yield Corporate Bond ETF', color: etfColor, fallbackPriceUsd: 80 },   { id: 'etf-lqd', type: 'etf', symbol: 'LQD', name: 'iShares iBoxx Investment Grade Corporate Bond ETF', color: etfColor, fallbackPriceUsd: 110 },   { id: 'etf-vwo', type: 'etf', symbol: 'VWO', name: 'Vanguard FTSE Emerging Markets ETF', color: etfColor, fallbackPriceUsd: 50 },   { id: 'etf-ewj', type: 'etf', symbol: 'EWJ', name: 'iShares MSCI Japan ETF', color: etfColor, fallbackPriceUsd: 75 },   { id: 'etf-ewz', type: 'etf', symbol: 'EWZ', name: 'iShares MSCI Brazil ETF', color: etfColor, fallbackPriceUsd: 28 },   { id: 'etf-mchi', type: 'etf', symbol: 'MCHI', name: 'iShares MSCI China ETF', color: etfColor, fallbackPriceUsd: 60 },   { id: 'etf-efa', type: 'etf', symbol: 'EFA', name: 'iShares MSCI EAFE ETF', color: etfColor, fallbackPriceUsd: 85 },   { id: 'etf-iemg', type: 'etf', symbol: 'IEMG', name: 'iShares Core MSCI Emerging Markets ETF', color: etfColor, fallbackPriceUsd: 62 },   { id: 'etf-vnq', type: 'etf', symbol: 'VNQ', name: 'Vanguard Real Estate ETF', color: etfColor, fallbackPriceUsd: 95 },   { id: 'etf-vym', type: 'etf', symbol: 'VYM', name: 'Vanguard High Dividend Yield ETF', color: etfColor, fallbackPriceUsd: 135 },   { id: 'etf-vo', type: 'etf', symbol: 'VO', name: 'Vanguard Mid-Cap ETF', color: etfColor, fallbackPriceUsd: 285 },   { id: 'etf-mgk', type: 'etf', symbol: 'MGK', name: 'Vanguard Mega Cap Growth ETF', color: etfColor, fallbackPriceUsd: 380 }, ];

export function getInvestmentAssets(type: InvestmentAssetType) {
  if (type === 'stock') {
    return supportedStockAssets;
  }

  if (type === 'bond') {
    return supportedBondAssets;
  }

  return supportedEtfAssets;
}

export function getInvestmentAsset(type: InvestmentAssetType, id: string) {
  return getInvestmentAssets(type).find((asset) => asset.id === id) ?? getInvestmentAssets(type)[0];
}
