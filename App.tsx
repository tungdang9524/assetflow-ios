import React from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { PinLock } from './src/components/PinLock';
import { AppNavigator } from './src/navigation/AppNavigator';
import { FinanceProvider, useFinance } from './src/store/FinanceStore';
import { AppThemeProvider, useAppTheme } from './src/theme/AppThemeProvider';

const LAUNCH_SCREEN_MIN_MS = 900;

function LaunchScreen() {
  const { navigationTheme } = useAppTheme();

  return (
    <View style={[styles.launchScreen, { backgroundColor: navigationTheme.colors.background }]}>
      <Image source={require('./icon.png')} style={styles.launchIcon} />
    </View>
  );
}

function AppShell() {
  const { isReady } = useFinance();
  const { state } = useFinance();
  const { navigationTheme, isDark } = useAppTheme();
  const [isUnlocked, setIsUnlocked] = React.useState(false);
  const [isLaunchVisible, setIsLaunchVisible] = React.useState(true);

  React.useEffect(() => {
    if (!isReady) {
      return;
    }

    const timeout = setTimeout(() => setIsLaunchVisible(false), LAUNCH_SCREEN_MIN_MS);

    return () => clearTimeout(timeout);
  }, [isReady]);

  if (!isReady || isLaunchVisible) {
    return <LaunchScreen />;
  }

  return (
    <NavigationContainer theme={navigationTheme}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      {state.settings.pinEnabled && state.settings.pinCode && !isUnlocked ? <PinLock onUnlock={() => setIsUnlocked(true)} /> : <AppNavigator />}
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  launchScreen: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  launchIcon: {
    borderRadius: 54,
    height: 190,
    width: 190,
  },
});

export default function App() {
  return (
    <SafeAreaProvider>
      <FinanceProvider>
        <AppThemeProvider>
          <AppShell />
        </AppThemeProvider>
      </FinanceProvider>
    </SafeAreaProvider>
  );
}
