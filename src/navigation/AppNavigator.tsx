import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { AccountsScreen } from '../screens/AccountsScreen';
import { AddTransactionScreen } from '../screens/AddTransactionScreen';
import { BudgetsScreen } from '../screens/BudgetsScreen';
import { DashboardScreen } from '../screens/DashboardScreen';
import { ReportsScreen } from '../screens/ReportsScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { TransactionsScreen } from '../screens/TransactionsScreen';
import { useAppTheme } from '../theme/AppThemeProvider';
import { RootTabParamList, TransactionsStackParamList } from './types';

const Tab = createBottomTabNavigator<RootTabParamList>();
const TransactionsStack = createNativeStackNavigator<TransactionsStackParamList>();

function TransactionStackNavigator() {
  const { colors } = useAppTheme();

  return (
    <TransactionsStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerShadowVisible: false,
        headerTintColor: colors.text,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <TransactionsStack.Screen name="TransactionsList" component={TransactionsScreen} options={{ title: 'Transactions' }} />
      <TransactionsStack.Screen name="AddTransaction" component={AddTransactionScreen} options={{ title: 'Add Transaction', presentation: 'modal' }} />
    </TransactionsStack.Navigator>
  );
}

export function AppNavigator() {
  const { colors } = useAppTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          height: 86,
          paddingBottom: 24,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
        tabBarIcon: ({ color, size }) => {
          const icons: Record<keyof RootTabParamList, keyof typeof Ionicons.glyphMap> = {
            Dashboard: 'grid-outline',
            Accounts: 'wallet-outline',
            Transactions: 'swap-horizontal-outline',
            Budgets: 'pie-chart-outline',
            Reports: 'bar-chart-outline',
            Settings: 'settings-outline',
          };

          return <Ionicons name={icons[route.name]} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Accounts" component={AccountsScreen} />
      <Tab.Screen name="Transactions" component={TransactionStackNavigator} />
      <Tab.Screen name="Budgets" component={BudgetsScreen} />
      <Tab.Screen name="Reports" component={ReportsScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}
