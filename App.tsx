import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AppNavigator } from './src/navigation/AppNavigator';
import { FinanceProvider, useFinance } from './src/store/FinanceStore';
import { AppThemeProvider, useAppTheme } from './src/theme/AppThemeProvider';

function AppShell() {
  const { isReady } = useFinance();
  const { navigationTheme, isDark } = useAppTheme();

  if (!isReady) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: navigationTheme.colors.background }}>
        <ActivityIndicator color={navigationTheme.colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer theme={navigationTheme}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <AppNavigator />
    </NavigationContainer>
  );
}

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
