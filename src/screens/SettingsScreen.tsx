import React, { useEffect, useState } from 'react';
import { Alert, Pressable, StyleSheet, Switch, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as LocalAuthentication from 'expo-local-authentication';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';

import { AppText } from '../components/AppText';
import { Card } from '../components/Card';
import { PrimaryButton } from '../components/PrimaryButton';
import { Screen } from '../components/Screen';
import { ThemePreference } from '../models/finance';
import { SettingsStackParamList } from '../navigation/types';
import { useFinance } from '../store/FinanceStore';
import { useAppTheme } from '../theme/AppThemeProvider';
import { formatCurrency } from '../utils/currency';

const themeOptions: ThemePreference[] = ['system', 'light', 'dark'];

type SettingsNavigation = NativeStackNavigationProp<SettingsStackParamList, 'SettingsHome'>;

interface SettingsRowProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  onPress: () => void;
}

function SettingsRow({ icon, title, subtitle, onPress }: SettingsRowProps) {
  const { colors } = useAppTheme();

  return (
    <Pressable style={({ pressed }) => [styles.row, { backgroundColor: colors.surface, borderColor: colors.border, opacity: pressed ? 0.78 : 1 }]} onPress={onPress}>
      <View style={[styles.rowIcon, { backgroundColor: colors.primarySoft }]}>
        <Ionicons name={icon} size={20} color={colors.primary} />
      </View>
      <View style={styles.rowCopy}>
        <AppText style={styles.rowTitle}>{title}</AppText>
        <AppText variant="caption">{subtitle}</AppText>
      </View>
      <Ionicons name="chevron-forward" size={20} color={colors.muted} />
    </Pressable>
  );
}

export function SettingsScreen() {
  const navigation = useNavigation<SettingsNavigation>();
  const { state } = useFinance();

  return (
    <Screen>
      <View>
        <AppText variant="caption">Preferences</AppText>
        <AppText variant="title">Settings</AppText>
      </View>

      <View style={styles.rowList}>
        <SettingsRow
          icon="cash-outline"
          title="Rates"
          subtitle={`USD/VND ${formatCurrency(state.settings.usdToVndRate, 'VND')} - ${state.settings.autoRateUpdates ? 'auto' : 'manual'}`}
          onPress={() => navigation.navigate('RateSettings')}
        />
        <SettingsRow icon="color-palette-outline" title="Theme" subtitle={state.settings.theme} onPress={() => navigation.navigate('ThemeSettings')} />
        <SettingsRow icon="albums-outline" title="Categories" subtitle={`${state.categories.length} categories`} onPress={() => navigation.navigate('CategorySettings')} />
        <SettingsRow
          icon="lock-closed-outline"
          title="Security"
          subtitle={`${state.settings.pinEnabled ? 'PIN on' : 'PIN off'} - ${state.settings.biometricEnabled ? 'biometrics on' : 'biometrics off'}`}
          onPress={() => navigation.navigate('SecuritySettings')}
        />
        <SettingsRow icon="archive-outline" title="Backup" subtitle="Export or import JSON data" onPress={() => navigation.navigate('BackupSettings')} />
        <SettingsRow icon="refresh-outline" title="Sample data" subtitle="Restore starter data" onPress={() => navigation.navigate('SampleDataSettings')} />
      </View>
    </Screen>
  );
}

export function RateSettingsScreen() {
  const { state, updateSettings, refreshMarketRates, isRefreshingRates } = useFinance();
  const { colors } = useAppTheme();
  const [rate, setRate] = useState(String(state.settings.usdToVndRate));

  useEffect(() => {
    setRate(String(state.settings.usdToVndRate));
  }, [state.settings.usdToVndRate]);

  function saveRate() {
    const parsedRate = Number(rate.replace(/,/g, '.'));

    if (!Number.isFinite(parsedRate) || parsedRate <= 0) {
      Alert.alert('Invalid rate', 'Enter a valid USD/VND rate.');
      return;
    }

    updateSettings({ usdToVndRate: parsedRate });
  }

  function handleRefreshRates() {
    refreshMarketRates().catch(() => {
      Alert.alert('Update failed', 'Could not refresh rates right now. Check your internet connection and try again.');
    });
  }

  return (
    <Screen>
      <Card style={styles.card}>
        <View style={styles.field}>
          <AppText variant="caption">Base currency</AppText>
          <AppText variant="body" style={styles.value}>
            VND
          </AppText>
        </View>
        <View style={styles.field}>
          <AppText variant="caption">USD/VND exchange rate</AppText>
          <TextInput keyboardType="decimal-pad" value={rate} onChangeText={setRate} style={[styles.input, { borderColor: colors.border, color: colors.text }]} />
          <AppText variant="caption">Current: {formatCurrency(state.settings.usdToVndRate, 'VND')} per USD</AppText>
        </View>
        <PrimaryButton label="Save exchange rate" icon="save-outline" onPress={saveRate} />
        <View style={styles.toggleRow}>
          <View style={styles.toggleCopy}>
            <AppText variant="body" style={styles.value}>
              Auto update rates
            </AppText>
            <AppText variant="caption">Refresh USD/VND and crypto prices from network on app start.</AppText>
          </View>
          <Switch
            value={state.settings.autoRateUpdates}
            onValueChange={(value) => updateSettings({ autoRateUpdates: value })}
            trackColor={{ false: colors.border, true: colors.primarySoft }}
            thumbColor={state.settings.autoRateUpdates ? colors.primary : colors.muted}
          />
        </View>
        <PrimaryButton label={isRefreshingRates ? 'Updating rates' : 'Update rates now'} icon="cloud-download-outline" onPress={handleRefreshRates} />
        <AppText variant="caption">
          Last update: {state.settings.lastRateUpdatedAt ? new Date(state.settings.lastRateUpdatedAt).toLocaleString() : 'Not yet'} - Source:{' '}
          {state.settings.rateSource ?? 'manual'}
        </AppText>
        <AppText variant="caption">FX data: ExchangeRate-API open endpoint. Crypto data: CoinGecko public API.</AppText>
      </Card>
    </Screen>
  );
}

export function ThemeSettingsScreen() {
  const { state, updateSettings } = useFinance();
  const { colors } = useAppTheme();

  return (
    <Screen>
      <Card style={styles.card}>
        <AppText variant="caption">Theme</AppText>
        <View style={styles.segment}>
          {themeOptions.map((option) => {
            const selected = state.settings.theme === option;
            return (
              <Pressable key={option} style={[styles.segmentItem, { backgroundColor: selected ? colors.primary : colors.surface, borderColor: colors.border }]} onPress={() => updateSettings({ theme: option })}>
                <AppText color={selected ? '#FFFFFF' : colors.text} style={styles.segmentLabel}>
                  {option[0].toUpperCase()}
                  {option.slice(1)}
                </AppText>
              </Pressable>
            );
          })}
        </View>
      </Card>
    </Screen>
  );
}

export function CategorySettingsScreen() {
  const { state, addCategory, updateCategory, deleteCategory } = useFinance();
  const { colors } = useAppTheme();
  const [categoryName, setCategoryName] = useState('');
  const [categoryType, setCategoryType] = useState<'expense' | 'income'>('expense');
  const [editingCategoryId, setEditingCategoryId] = useState<string | undefined>();

  function handleAddCategory() {
    if (!categoryName.trim()) {
      Alert.alert('Invalid category', 'Enter a category name.');
      return;
    }

    if (editingCategoryId) {
      updateCategory(editingCategoryId, { name: categoryName.trim(), type: categoryType });
      setEditingCategoryId(undefined);
    } else {
      addCategory({
        name: categoryName.trim(),
        type: categoryType,
        icon: categoryType === 'income' ? 'add-circle-outline' : 'ellipse-outline',
        color: categoryType === 'income' ? colors.primary : colors.accent,
      });
    }

    setCategoryName('');
  }

  const expenseCategories = state.categories.filter((category) => category.type === 'expense');
  const incomeCategories = state.categories.filter((category) => category.type === 'income');

  function renderCategoryRow(category: (typeof state.categories)[number]) {
    return (
      <Pressable
        key={category.id}
        style={[styles.categoryRow, { borderColor: editingCategoryId === category.id ? colors.primary : colors.border }]}
        onPress={() => editCategory(category.id)}
        onLongPress={() => handleDeleteCategory(category.id)}
      >
        <View style={[styles.categoryIcon, { backgroundColor: `${category.color}20` }]}>
          <Ionicons name={category.icon as keyof typeof Ionicons.glyphMap} size={18} color={category.color} />
        </View>
        <View style={styles.rowCopy}>
          <AppText style={styles.rowTitle}>{category.name}</AppText>
          <AppText variant="caption">{category.type === 'income' ? 'Income' : 'Expense'}</AppText>
        </View>
        <Ionicons name="create-outline" size={18} color={colors.muted} />
      </Pressable>
    );
  }

  function handleDeleteCategory(categoryId: string) {
    const didDelete = deleteCategory(categoryId);

    if (!didDelete) {
      Alert.alert('Category in use', 'Categories attached to transactions or budgets cannot be deleted.');
    }
  }

  function editCategory(categoryId: string) {
    const category = state.categories.find((item) => item.id === categoryId);

    if (!category) {
      return;
    }

    setEditingCategoryId(category.id);
    setCategoryName(category.name);
    setCategoryType(category.type);
  }

  return (
    <Screen>
      <Card style={styles.card}>
        <View>
          <AppText variant="heading">{editingCategoryId ? 'Edit category' : 'New category'}</AppText>
          <AppText variant="caption">Tap a category below to edit it.</AppText>
        </View>
        <View style={styles.segment}>
          {(['expense', 'income'] as const).map((option) => {
            const selected = categoryType === option;
            return (
              <Pressable key={option} style={[styles.segmentItem, { backgroundColor: selected ? colors.primary : colors.surface, borderColor: colors.border }]} onPress={() => setCategoryType(option)}>
                <AppText color={selected ? '#FFFFFF' : colors.text} style={styles.segmentLabel}>
                  {option === 'income' ? 'Income' : 'Expense'}
                </AppText>
              </Pressable>
            );
          })}
        </View>
        <TextInput placeholder="Category name" placeholderTextColor={colors.muted} value={categoryName} onChangeText={setCategoryName} style={[styles.input, { borderColor: colors.border, color: colors.text }]} />
        <PrimaryButton label={editingCategoryId ? 'Save category' : 'Add category'} icon="add-circle-outline" onPress={handleAddCategory} />
        {editingCategoryId ? (
          <Pressable
            style={[styles.clearButton, { borderColor: colors.border }]}
            onPress={() => {
              setEditingCategoryId(undefined);
              setCategoryName('');
            }}
          >
            <AppText style={styles.segmentLabel}>Cancel edit</AppText>
          </Pressable>
        ) : null}
      </Card>

      <Card style={styles.card}>
        <AppText variant="heading">Expense</AppText>
        <View style={styles.categoryList}>{expenseCategories.map(renderCategoryRow)}</View>
      </Card>

      <Card style={styles.card}>
        <AppText variant="heading">Income</AppText>
        <View style={styles.categoryList}>{incomeCategories.map(renderCategoryRow)}</View>
        <AppText variant="caption">Tap to edit. Long press to delete when unused.</AppText>
      </Card>
    </Screen>
  );
}

export function SecuritySettingsScreen() {
  const { state, updateSettings } = useFinance();
  const { colors } = useAppTheme();
  const [pin, setPin] = useState(state.settings.pinCode ?? '');

  function savePin() {
    if (pin.trim().length < 4) {
      Alert.alert('PIN too short', 'Use at least 4 digits.');
      return;
    }

    updateSettings({ pinEnabled: true, pinCode: pin.trim() });
  }

  async function toggleBiometric(value: boolean) {
    if (!value) {
      updateSettings({ biometricEnabled: false });
      return;
    }

    const [hasHardware, isEnrolled] = await Promise.all([LocalAuthentication.hasHardwareAsync(), LocalAuthentication.isEnrolledAsync()]);

    if (!hasHardware || !isEnrolled) {
      Alert.alert('Biometrics unavailable', 'Set up Face ID or Touch ID on this device first.');
      return;
    }

    updateSettings({ biometricEnabled: true, pinEnabled: true });
  }

  return (
    <Screen>
      <Card style={styles.card}>
        <AppText variant="heading">PIN lock</AppText>
        <TextInput
          keyboardType="number-pad"
          maxLength={6}
          secureTextEntry
          placeholder="4-6 digit PIN"
          placeholderTextColor={colors.muted}
          value={pin}
          onChangeText={setPin}
          style={[styles.input, { borderColor: colors.border, color: colors.text }]}
        />
        <View style={styles.segment}>
          <PrimaryButton label="Enable PIN" icon="lock-closed-outline" onPress={savePin} />
          <Pressable style={[styles.clearButton, { borderColor: colors.border }]} onPress={() => updateSettings({ pinEnabled: false, pinCode: undefined })}>
            <AppText style={styles.segmentLabel}>Disable</AppText>
          </Pressable>
        </View>
        <View style={styles.toggleRow}>
          <View style={styles.toggleCopy}>
            <AppText variant="body" style={styles.value}>
              Face ID / biometrics
            </AppText>
            <AppText variant="caption">Uses device biometrics when available. Expo Go on iOS cannot test Face ID itself.</AppText>
          </View>
          <Switch
            value={state.settings.biometricEnabled}
            onValueChange={(value) => {
              toggleBiometric(value).catch(() => {
                Alert.alert('Biometric error', 'Could not check biometric availability.');
              });
            }}
            trackColor={{ false: colors.border, true: colors.primarySoft }}
            thumbColor={state.settings.biometricEnabled ? colors.primary : colors.muted}
          />
        </View>
      </Card>
    </Screen>
  );
}

export function BackupSettingsScreen() {
  const { state, importState } = useFinance();
  const { colors } = useAppTheme();
  const [backupText, setBackupText] = useState('');

  function generateBackup() {
    setBackupText(JSON.stringify(state, null, 2));
  }

  function importBackup() {
    try {
      importState(JSON.parse(backupText));
      Alert.alert('Import complete', 'Backup data was imported.');
    } catch {
      Alert.alert('Invalid backup', 'Paste a valid AssetFlow JSON backup.');
    }
  }

  return (
    <Screen>
      <Card style={styles.card}>
        <AppText variant="heading">Backup</AppText>
        <PrimaryButton label="Generate JSON backup" icon="download-outline" onPress={generateBackup} />
        <TextInput
          multiline
          placeholder="Backup JSON"
          placeholderTextColor={colors.muted}
          value={backupText}
          onChangeText={setBackupText}
          style={[styles.backupInput, { borderColor: colors.border, color: colors.text }]}
        />
        <PrimaryButton label="Import JSON backup" icon="cloud-upload-outline" onPress={importBackup} />
      </Card>
    </Screen>
  );
}

export function SampleDataSettingsScreen() {
  const { resetSampleData } = useFinance();

  function confirmReset() {
    Alert.alert('Reset sample data', 'This restores the starter accounts, budgets, transactions, and settings.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Reset', style: 'destructive', onPress: resetSampleData },
    ]);
  }

  return (
    <Screen>
      <Card style={styles.card}>
        <AppText variant="heading">Sample data</AppText>
        <AppText variant="caption">Restore starter accounts, transactions, budgets, settings, categories, goals, and debts.</AppText>
        <PrimaryButton label="Reset sample data" icon="refresh-outline" onPress={confirmReset} />
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  rowList: {
    gap: 10,
  },
  row: {
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    minHeight: 72,
    paddingHorizontal: 14,
  },
  rowIcon: {
    alignItems: 'center',
    borderRadius: 14,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  rowCopy: {
    flex: 1,
    gap: 2,
  },
  rowTitle: {
    fontWeight: '800',
  },
  card: {
    gap: 14,
  },
  field: {
    gap: 8,
  },
  value: {
    fontWeight: '800',
  },
  toggleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
  },
  toggleCopy: {
    flex: 1,
    gap: 3,
  },
  input: {
    borderWidth: 1,
    borderRadius: 14,
    fontSize: 18,
    fontWeight: '700',
    minHeight: 50,
    paddingHorizontal: 12,
  },
  segment: {
    flexDirection: 'row',
    gap: 8,
  },
  segmentItem: {
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    flex: 1,
    minHeight: 46,
    justifyContent: 'center',
  },
  segmentLabel: {
    fontWeight: '800',
  },
  tagGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryList: {
    gap: 10,
  },
  categoryRow: {
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 10,
    minHeight: 58,
    paddingHorizontal: 12,
  },
  categoryIcon: {
    alignItems: 'center',
    borderRadius: 12,
    height: 38,
    justifyContent: 'center',
    width: 38,
  },
  tag: {
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  clearButton: {
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    flex: 1,
    justifyContent: 'center',
    minHeight: 52,
  },
  backupInput: {
    borderRadius: 14,
    borderWidth: 1,
    minHeight: 180,
    padding: 12,
    textAlignVertical: 'top',
  },
});
