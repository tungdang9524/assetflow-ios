import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { AccountsScreen } from '../screens/AccountsScreen';
import { AddAccountScreen } from '../screens/AddAccountScreen';
import { AddTransactionScreen } from '../screens/AddTransactionScreen';
import { BudgetsScreen } from '../screens/BudgetsScreen';
import { CalendarScreen } from '../screens/CalendarScreen';
import { DashboardScreen } from '../screens/DashboardScreen';
import { PlanningScreen } from '../screens/PlanningScreen';
import { ReportsScreen } from '../screens/ReportsScreen';
import {
  BackupSettingsScreen,
  CategoryDetailSettingsScreen,
  CategorySettingsScreen,
  InfoSettingsScreen,
  RateSettingsScreen,
  SampleDataSettingsScreen,
  SecuritySettingsScreen,
  SettingsScreen,
  ThemeSettingsScreen,
} from '../screens/SettingsScreen';
import { TransactionsScreen } from '../screens/TransactionsScreen';
import { useAppTheme } from '../theme/AppThemeProvider';
import { AccountsStackParamList, PlanningStackParamList, RootTabParamList, SettingsStackParamList, TransactionsStackParamList } from './types';

const Tab = createBottomTabNavigator<RootTabParamList>();
const AccountsStack = createNativeStackNavigator<AccountsStackParamList>();
const TransactionsStack = createNativeStackNavigator<TransactionsStackParamList>();
const PlanningStack = createNativeStackNavigator<PlanningStackParamList>();
const SettingsStack = createNativeStackNavigator<SettingsStackParamList>();

function AccountsStackNavigator() {
  const { colors } = useAppTheme();

  return (
    <AccountsStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerShadowVisible: false,
        headerTintColor: colors.text,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <AccountsStack.Screen name="AccountsList" component={AccountsScreen} options={{ title: 'Accounts' }} />
      <AccountsStack.Screen name="AddAccount" component={AddAccountScreen} options={{ title: 'Add Account', presentation: 'modal' }} />
    </AccountsStack.Navigator>
  );
}

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

function PlanningStackNavigator() {
  const { colors } = useAppTheme();

  return (
    <PlanningStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerShadowVisible: false,
        headerTintColor: colors.text,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <PlanningStack.Screen name="PlanningHome" component={PlanningScreen} options={{ title: 'Planning' }} />
      <PlanningStack.Screen name="Budgets" component={BudgetsScreen} options={{ title: 'Budgets' }} />
      <PlanningStack.Screen name="Reports" component={ReportsScreen} options={{ title: 'Reports' }} />
      <PlanningStack.Screen name="Calendar" component={CalendarScreen} options={{ title: 'Calendar' }} />
    </PlanningStack.Navigator>
  );
}

function SettingsStackNavigator() {
  const { colors } = useAppTheme();

  return (
    <SettingsStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerShadowVisible: false,
        headerTintColor: colors.text,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <SettingsStack.Screen name="SettingsHome" component={SettingsScreen} options={{ title: 'Settings' }} />
      <SettingsStack.Screen name="RateSettings" component={RateSettingsScreen} options={{ title: 'Rates' }} />
      <SettingsStack.Screen name="ThemeSettings" component={ThemeSettingsScreen} options={{ title: 'Theme' }} />
      <SettingsStack.Screen name="CategorySettings" component={CategorySettingsScreen} options={{ title: 'Categories' }} />
      <SettingsStack.Screen name="CategoryDetailSettings" component={CategoryDetailSettingsScreen} options={{ title: 'Category' }} />
      <SettingsStack.Screen name="SecuritySettings" component={SecuritySettingsScreen} options={{ title: 'Security' }} />
      <SettingsStack.Screen name="BackupSettings" component={BackupSettingsScreen} options={{ title: 'Backup' }} />
      <SettingsStack.Screen name="SampleDataSettings" component={SampleDataSettingsScreen} options={{ title: 'Sample Data' }} />
      <SettingsStack.Screen name="InfoSettings" component={InfoSettingsScreen} options={{ title: 'Info' }} />
    </SettingsStack.Navigator>
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
            Planning: 'flag-outline',
            Settings: 'settings-outline',
          };

          return <Ionicons name={icons[route.name]} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Accounts" component={AccountsStackNavigator} />
      <Tab.Screen name="Transactions" component={TransactionStackNavigator} />
      <Tab.Screen name="Planning" component={PlanningStackNavigator} />
      <Tab.Screen name="Settings" component={SettingsStackNavigator} />
    </Tab.Navigator>
  );
}
