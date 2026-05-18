import React, { createContext, PropsWithChildren, useContext, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { DarkTheme, DefaultTheme, Theme } from '@react-navigation/native';

import { useFinance } from '../store/FinanceStore';
import { AppColors, darkColors, lightColors } from './colors';

interface AppThemeContextValue {
  colors: AppColors;
  isDark: boolean;
  navigationTheme: Theme;
}

const AppThemeContext = createContext<AppThemeContextValue | undefined>(undefined);

export function AppThemeProvider({ children }: PropsWithChildren) {
  const systemScheme = useColorScheme();
  const { state } = useFinance();
  const resolvedTheme = state.settings.theme === 'system' ? systemScheme : state.settings.theme;
  const isDark = resolvedTheme === 'dark';
  const colors = isDark ? darkColors : lightColors;

  const navigationTheme = useMemo<Theme>(
    () => ({
      ...(isDark ? DarkTheme : DefaultTheme),
      colors: {
        ...(isDark ? DarkTheme.colors : DefaultTheme.colors),
        primary: colors.primary,
        background: colors.background,
        card: colors.surface,
        text: colors.text,
        border: colors.border,
        notification: colors.accent,
      },
    }),
    [colors, isDark],
  );

  const value = useMemo(() => ({ colors, isDark, navigationTheme }), [colors, isDark, navigationTheme]);

  return <AppThemeContext.Provider value={value}>{children}</AppThemeContext.Provider>;
}

export function useAppTheme() {
  const context = useContext(AppThemeContext);

  if (!context) {
    throw new Error('useAppTheme must be used within AppThemeProvider');
  }

  return context;
}
