# AssetFlow

AssetFlow is an original iPhone-focused personal finance tracker built with Expo, React Native, and TypeScript.

The MVP is designed for Windows development and iPhone testing through Expo Go. It does not require Xcode, macOS, custom native modules, or an EAS dev client for normal development.

## Features

- Dashboard with net worth, monthly income, expenses, balance, recent transactions, and spending summary.
- Multiple accounts including Cash, Bank, E-wallet, Savings, and USD Account.
- Custom account creation for VND, USD, and crypto holdings.
- Edit/delete accounts and transactions, with balance impact reversed when transactions change.
- VND base currency with a manual USD/VND exchange rate.
- Optional network refresh for USD/VND and supported crypto prices.
- Income, expense, and transfer transactions that update balances.
- Search and filter transactions.
- Custom expense and income categories.
- Monthly category budgets with spent, remaining, progress bars, and simple alerts.
- Debts/loans, savings goals, and a monthly transaction calendar.
- Reports using simple Expo-compatible cards, progress bars, allocation views, and planning snapshots.
- Settings for base currency display, USD/VND rate, theme, PIN/biometric lock, JSON backup/import, and sample data reset.
- AsyncStorage local persistence.

## Market Rates

AssetFlow stores a manual USD/VND rate by default and can refresh rates from the network when enabled in Settings.

- USD/VND uses the public `open.er-api.com` latest USD endpoint.
- Crypto prices use CoinGecko's public simple price endpoint.
- Supported MVP crypto assets: 50 market-cap sorted assets seeded from CoinGecko.
- Network rates are for personal tracking estimates, not trading execution.
- FX data attribution: Rates by Exchange Rate API.

## Run On Windows With iPhone And Expo Go

Install dependencies:

```bash
npm install
```

Start the Expo development server:

```bash
npx expo start
```

Open Expo Go on your iPhone and scan the QR code. Keep the Windows machine and iPhone on the same network, or use Expo tunnel mode if LAN discovery is blocked:

```bash
npx expo start --tunnel
```

Expo Go testing is free and works from Windows. This is the recommended MVP development loop.

Face ID note: AssetFlow includes biometric unlock through `expo-local-authentication`, but Expo's iOS Face ID prompt is not supported inside Expo Go. Use the PIN fallback while testing in Expo Go. To test real Face ID, create an EAS development or preview build.

## Scripts

```bash
npm run start       # Start Expo
npm run typecheck   # TypeScript check
npm run expo:check  # Verify Expo dependency compatibility
npm run export:ios  # Bundle the iOS JavaScript output without Xcode
```

## iOS Build And Distribution Options

### 1. Expo Go Development On iPhone

Expo Go runs the JavaScript app from the development server. It is free, works from Windows, and is enough for this MVP because the app uses only Expo Go-compatible dependencies.

### 2. EAS Build iOS Artifact

EAS Build creates a real iOS build in Expo's cloud. `.github/workflows/eas-ios-build.yml` now runs automatically after each push to `main` using the `internal` profile. It also supports manual runs where you can choose `preview`, `internal`, or `production`.

Required setup:

- Create an Expo account.
- Run `npx eas login`.
- Run `npx eas init` in this repository to link the project.
- Add `EXPO_TOKEN` as a GitHub repository secret.
- Configure iOS credentials in EAS. Physical-device IPA builds usually require Apple Developer credentials and registered devices.

After a successful workflow run, open the GitHub Actions run and download the `AssetFlow-internal-ipa` artifact. If the EAS build fails because credentials are missing, configure signing in EAS first and rerun the workflow.

### 3. TestFlight And App Store Distribution

TestFlight and App Store distribution require an Apple Developer Program account and proper app signing. The `production` EAS profile is configured for store distribution, but credentials and App Store Connect setup are still required.

### 4. Sideloadly Installation

Sideloadly and AltStore can install or re-sign an IPA onto an iPhone, but the IPA still needs valid signing or re-signing. GitHub Actions cannot magically install the app directly onto an iPhone, and it cannot bypass Apple signing requirements.

## EAS Profiles

- `preview`: iOS simulator build, useful for quick cloud build checks.
- `internal`: internal iOS build. Installing on physical devices may require Apple Developer credentials and registered devices.
- `production`: store distribution build for TestFlight/App Store workflows.

Automatic GitHub Actions IPA build:

1. Add `EXPO_TOKEN` in GitHub repository secrets.
2. Configure iOS credentials in EAS.
3. Push to `main`.
4. Open the completed `EAS iOS Build` workflow run.
5. Download the uploaded `AssetFlow-internal-ipa` artifact.

Manual GitHub Actions build:

1. Add `EXPO_TOKEN` in GitHub repository secrets.
2. Open the `EAS iOS Build` workflow in GitHub Actions.
3. Choose `preview`, `internal`, or `production`.
4. Run the workflow.
5. Download the uploaded artifact when the build completes. The `preview` simulator profile is useful for cloud checks, but it is not the IPA you would install on a physical iPhone.

## CI

`.github/workflows/ci.yml` runs on push and pull request using `ubuntu-latest`. It installs dependencies, checks Expo dependency compatibility, runs TypeScript, runs lint only if a lint script is configured, validates Expo config, and bundles the iOS JavaScript output. It does not require an Apple Developer account or macOS.

## Architecture

```text
src/components
src/screens
src/navigation
src/models
src/store
src/utils
src/data
src/theme
```
