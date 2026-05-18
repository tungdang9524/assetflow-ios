export type AccountsStackParamList = {
  AccountsList: undefined;
  AddAccount: { accountId?: string } | undefined;
};

export type TransactionsStackParamList = {
  TransactionsList: undefined;
  AddTransaction: { transactionId?: string } | undefined;
};

export type RootTabParamList = {
  Dashboard: undefined;
  Accounts: undefined;
  Transactions: undefined;
  Planning: undefined;
  Settings: undefined;
};

export type PlanningStackParamList = {
  PlanningHome: undefined;
  SavingsGoals: undefined;
  DebtsLoans: undefined;
  Budgets: undefined;
  Reports: undefined;
  Calendar: undefined;
};

export type SettingsStackParamList = {
  SettingsHome: undefined;
  RateSettings: undefined;
  ThemeSettings: undefined;
  CategorySettings: undefined;
  CategoryDetailSettings: { categoryId: string };
  SecuritySettings: undefined;
  BackupSettings: undefined;
  SampleDataSettings: undefined;
  InfoSettings: undefined;
};
