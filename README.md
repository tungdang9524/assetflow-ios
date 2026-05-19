# AssetFlow

AssetFlow is an iPhone-focused personal finance tracker built with Expo, React Native, and TypeScript.

The app is designed to run from Windows through Expo Go for day-to-day development. A fresh install starts with zero user data while keeping the default income and expense categories available. Sample data can still be restored from Settings.

## Features

- Dashboard with net worth, monthly income, monthly expenses, balance trend, and recent activity.
- Account management for cash, bank, e-wallet, savings, foreign currency, credit cards, crypto, stocks, and ETF portfolios.
- Drag-and-drop account ordering.
- Crypto portfolios with multiple assets and quantities.
- Stock and ETF portfolios with 50 popular symbols for each asset type.
- Income, expense, and transfer transactions with editable dates.
- Transaction history grouped by day, with type and date-range filters.
- Dropdown pickers for accounts, categories, savings goals, and portfolio assets.
- Optional income allocation into savings goals.
- Budgets by category, with add/edit flows and used-category filtering.
- Savings goals with progress tracking, completion styling, search, and delete confirmation.
- Debts and loans split by lent/borrowed, with search and delete confirmation.
- Calendar view with custom month and year picker.
- Reports with account allocation, planning snapshot, expense donut chart, and spending trend.
- Settings for rates, theme, categories, PIN lock, backup/import, sample data, reset-to-zero, and project info.
- Local persistence through AsyncStorage.

## Market Data

AssetFlow stores a manual USD/VND exchange rate by default and can refresh market data from the network when enabled.

- USD/VND uses the public `open.er-api.com` latest USD endpoint.
- Crypto prices use CoinGecko's public simple price endpoint.
- Stock and ETF prices currently use bundled fallback prices for personal tracking estimates.
- Market data is for personal finance tracking only, not trading or execution.

## Requirements

- Node.js 20 or newer.
- npm.
- Expo Go on an iPhone for the fastest development loop.
- The Windows computer and iPhone should be on the same network, or Expo tunnel mode should be used.

## Install

```bash
npm install
```

## Run

Start the Expo development server:

```bash
npm run start
```

Open Expo Go on your iPhone and scan the QR code.

If LAN discovery is blocked, start Expo with tunnel mode:

```bash
npx expo start --tunnel
```

## Scripts

```bash
npm run start       # Start Expo
npm run ios         # Start Expo with iOS target
npm run web         # Start Expo web target
npm run typecheck   # TypeScript check
npm run expo:check  # Verify Expo dependency compatibility
npm run export:ios  # Export the iOS JavaScript bundle
```

## Data Behavior

- Fresh installs start empty.
- Default categories are always included in the initial empty state.
- `Settings > Data > Restore sample data` loads starter accounts, transactions, budgets, goals, debts, and watchlist data.
- `Settings > Data > Reset data to zero` clears user data and keeps default categories.
- Backup export/import uses JSON in Settings.

## Security

PIN lock can be enabled from Settings.

- Enabling PIN lock requires entering and confirming a new PIN.
- Changing the PIN requires the current PIN plus a new confirmed PIN.
- Disabling PIN lock requires entering the current PIN.

## iOS Build Options

### Expo Go

Expo Go is the recommended development path. It does not require Xcode, macOS, or Apple signing for normal app iteration.

### Unsigned IPA Workflow

The repository includes `.github/workflows/build-ios-unsigned.yml`, a manual GitHub Actions workflow that runs on macOS, generates the iOS project, builds an unsigned archive, and uploads an unsigned IPA artifact.

Unsigned IPA artifacts are useful for build validation, but they are not directly installable on a physical iPhone without valid signing or re-signing.

### EAS Build

`eas.json` includes these profiles:

- `preview`: iOS simulator build.
- `internal`: internal distribution build.
- `production`: store distribution build.

Physical-device and App Store/TestFlight builds require Apple Developer credentials and proper iOS signing.

## CI

`.github/workflows/ci.yml` runs on push and pull request:

- install dependencies
- check Expo dependency compatibility
- run TypeScript
- run lint if a lint script exists
- validate Expo config
- export the iOS JavaScript bundle

## Project Structure

```text
src/components
src/data
src/models
src/navigation
src/screens
src/store
src/theme
src/utils
```

## Notes

- The app uses local storage and does not require a backend.
- Rates and fallback prices are estimates.
- Repository: https://github.com/tungdang9524/assetflow-ios
