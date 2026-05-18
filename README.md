# AssetFlow

AssetFlow is an original iPhone-focused personal finance tracker built with Expo, React Native, and TypeScript.

The MVP is designed for Windows development and iPhone testing through Expo Go. It does not require Xcode, macOS, custom native modules, or an EAS dev client for normal development.

## Features

- Dashboard with net worth, monthly income, expenses, balance, recent transactions, and spending summary.
- Multiple accounts including Cash, Bank, E-wallet, Savings, and USD Account.
- VND base currency with a manual USD/VND exchange rate.
- Income, expense, and transfer transactions that update balances.
- Expense and income categories with sample data.
- Monthly category budgets with spent, remaining, and progress bars.
- Reports using simple Expo-compatible cards and progress bars.
- Settings for base currency display, USD/VND rate, theme, and sample data reset.
- AsyncStorage local persistence.

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

EAS Build creates a real iOS build in Expo's cloud. You can trigger it manually with `.github/workflows/eas-ios-build.yml` after setup.

Required setup:

- Create an Expo account.
- Run `npx eas login`.
- Run `npx eas init` in this repository to link the project.
- Add `EAS_TOKEN` as a GitHub repository secret.
- For physical-device or store builds, Apple signing credentials may be required.

### 3. TestFlight And App Store Distribution

TestFlight and App Store distribution require an Apple Developer Program account and proper app signing. The `production` EAS profile is configured for store distribution, but credentials and App Store Connect setup are still required.

### 4. Sideloadly Installation

Sideloadly can install an IPA onto an iPhone, but the IPA still needs valid signing or re-signing. GitHub Actions cannot magically install the app directly onto an iPhone, and it cannot bypass Apple signing requirements.

## EAS Profiles

- `preview`: iOS simulator build, useful for quick cloud build checks.
- `internal`: internal iOS build. Installing on physical devices may require Apple Developer credentials and registered devices.
- `production`: store distribution build for TestFlight/App Store workflows.

Manual GitHub Actions build:

1. Add `EAS_TOKEN` in GitHub repository secrets.
2. Open the `EAS iOS Build` workflow in GitHub Actions.
3. Choose `preview`, `internal`, or `production`.
4. Run the workflow.

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
