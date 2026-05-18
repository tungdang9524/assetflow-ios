import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { PinLock } from './src/components/PinLock';
import { AppNavigator } from './src/navigation/AppNavigator';
import { FinanceProvider, useFinance } from './src/store/FinanceStore';
import { AppThemeProvider, useAppTheme } from './src/theme/AppThemeProvider';

function AppShell() {
  const { isReady } = useFinance();
  const { state } = useFinance();
  const { navigationTheme, isDark } = useAppTheme();
  const [isUnlocked, setIsUnlocked] = React.useState(false);

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
      {state.settings.pinEnabled && state.settings.pinCode && !isUnlocked ? <PinLock onUnlock={() => setIsUnlocked(true)} /> : <AppNavigator />}
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <FinanceProvider>
          <AppThemeProvider>
            <AppShell />
          </AppThemeProvider>
        </FinanceProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
