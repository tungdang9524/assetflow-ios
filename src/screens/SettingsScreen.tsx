import React, { useEffect, useState } from 'react';
import { Alert, Image, Linking, Modal, Pressable, ScrollView, StyleSheet, Switch, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';

import { AppText } from '../components/AppText';
import { Card } from '../components/Card';
import { PrimaryButton } from '../components/PrimaryButton';
import { Screen } from '../components/Screen';
import { CategoryType, ThemePreference } from '../models/finance';
import { SettingsStackParamList } from '../navigation/types';
import { useFinance } from '../store/FinanceStore';
import { useAppTheme } from '../theme/AppThemeProvider';
import { formatCurrency } from '../utils/currency';

const themeOptions: ThemePreference[] = ['system', 'light', 'dark'];
const projectRepoUrl = 'https://github.com/tungdang9524/assetflow-ios';
const expenseCategoryIcons: Array<keyof typeof Ionicons.glyphMap> = [
  'restaurant-outline',
  'bus-outline',
  'bag-outline',
  'receipt-outline',
  'game-controller-outline',
  'heart-outline',
  'school-outline',
  'home-outline',
  'car-outline',
  'shirt-outline',
  'medical-outline',
  'cart-outline',
  'airplane-outline',
  'ellipsis-horizontal-circle-outline',
];
const incomeCategoryIcons: Array<keyof typeof Ionicons.glyphMap> = [
  'briefcase-outline',
  'laptop-outline',
  'gift-outline',
  'trending-up-outline',
  'cash-outline',
  'wallet-outline',
  'card-outline',
  'business-outline',
  'add-circle-outline',
];

function getCategoryIconOptions(type: CategoryType) {
  return type === 'income' ? incomeCategoryIcons : expenseCategoryIcons;
}

function formatIconLabel(icon: keyof typeof Ionicons.glyphMap) {
  return icon
    .replace(/-outline$/, '')
    .split('-')
    .map((word) => `${word[0].toUpperCase()}${word.slice(1)}`)
    .join(' ');
}

type SettingsNavigation = NativeStackNavigationProp<SettingsStackParamList, 'SettingsHome'>;
type CategoryNavigation = NativeStackNavigationProp<SettingsStackParamList, 'CategorySettings'>;
type CategoryDetailRoute = RouteProp<SettingsStackParamList, 'CategoryDetailSettings'>;

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
          subtitle={state.settings.pinEnabled ? 'PIN on' : 'PIN off'}
          onPress={() => navigation.navigate('SecuritySettings')}
        />
        <SettingsRow icon="archive-outline" title="Backup" subtitle="Export or import JSON data" onPress={() => navigation.navigate('BackupSettings')} />
        <SettingsRow icon="refresh-outline" title="Data" subtitle="Restore samples or reset to zero" onPress={() => navigation.navigate('SampleDataSettings')} />
        <SettingsRow icon="information-circle-outline" title="Info" subtitle="Project details and app icon" onPress={() => navigation.navigate('InfoSettings')} />
      </View>
    </Screen>
  );
}

export function InfoSettingsScreen() {
  const { colors } = useAppTheme();

  function openRepository() {
    Linking.openURL(projectRepoUrl).catch(() => {
      Alert.alert('Cannot open link', 'Open the project repository manually from GitHub.');
    });
  }

  return (
    <Screen>
      <Card style={styles.infoCard}>
        <Image source={require('../../icon.png')} style={styles.appIcon} />
        <View style={styles.infoCopy}>
          <AppText variant="title">AssetFlow</AppText>
          <AppText variant="caption">Personal finance tracker for accounts, transactions, budgets, planning, reports, and local backup.</AppText>
        </View>
      </Card>

      <Card style={styles.card}>
        <View style={styles.infoRow}>
          <AppText variant="caption">Made by</AppText>
          <AppText variant="body" style={styles.value}>
            Tung Dang
          </AppText>
        </View>
        <View style={styles.infoRow}>
          <AppText variant="caption">Repository</AppText>
          <Pressable style={[styles.linkButton, { borderColor: colors.border }]} onPress={openRepository}>
            <Ionicons name="logo-github" size={18} color={colors.primary} />
            <AppText color={colors.primary} style={styles.linkText}>
              {projectRepoUrl}
            </AppText>
          </Pressable>
        </View>
        <View style={styles.infoRow}>
          <AppText variant="caption">Description</AppText>
          <AppText variant="body">
            AssetFlow helps track money buckets, spending, transfers, budgets, recurring plans, savings goals, debts, and market rates in a simple
            mobile-first workflow.
          </AppText>
        </View>
      </Card>
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
    refreshMarketRates().then(() => {
      Alert.alert('Rates updated', 'USD/VND and crypto prices were refreshed.');
    }).catch(() => {
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
  const navigation = useNavigation<CategoryNavigation>();
  const { state, addCategory } = useFinance();
  const { colors } = useAppTheme();
  const [categoryName, setCategoryName] = useState('');
  const [categoryType, setCategoryType] = useState<CategoryType>('expense');
  const [selectedIcon, setSelectedIcon] = useState<keyof typeof Ionicons.glyphMap>(expenseCategoryIcons[0]);
  const [isIconDropdownOpen, setIsIconDropdownOpen] = useState(false);
  const iconOptions = getCategoryIconOptions(categoryType);

  useEffect(() => {
    const options = getCategoryIconOptions(categoryType);

    if (!options.includes(selectedIcon)) {
      setSelectedIcon(options[0]);
    }
  }, [categoryType, selectedIcon]);

  function handleAddCategory() {
    if (!categoryName.trim()) {
      Alert.alert('Invalid category', 'Enter a category name.');
      return;
    }

    addCategory({
      name: categoryName.trim(),
      type: categoryType,
      icon: selectedIcon,
      color: categoryType === 'income' ? colors.primary : colors.accent,
    });

    setCategoryName('');
  }

  const expenseCategories = state.categories.filter((category) => category.type === 'expense');
  const incomeCategories = state.categories.filter((category) => category.type === 'income');

  function renderCategoryRow(category: (typeof state.categories)[number]) {
    return (
      <Pressable
        key={category.id}
        style={[styles.categoryRow, { borderColor: colors.border }]}
        onPress={() => navigation.navigate('CategoryDetailSettings', { categoryId: category.id })}
      >
        <View style={[styles.categoryIcon, { backgroundColor: `${category.color}20` }]}>
          <Ionicons name={category.icon as keyof typeof Ionicons.glyphMap} size={18} color={category.color} />
        </View>
        <View style={styles.rowCopy}>
          <AppText style={styles.rowTitle}>{category.name}</AppText>
          <AppText variant="caption">{category.type === 'income' ? 'Income' : 'Expense'}</AppText>
        </View>
        <Ionicons name="chevron-forward" size={18} color={colors.muted} />
      </Pressable>
    );
  }

  return (
    <Screen>
      <Card style={styles.card}>
        <View>
          <AppText variant="heading">Add new</AppText>
          <AppText variant="caption">Create a new income or expense category.</AppText>
        </View>
        <View style={styles.segment}>
          {(['expense', 'income'] as const).map((option) => {
            const selected = categoryType === option;
            return (
              <Pressable
                key={option}
                style={[styles.segmentItem, { backgroundColor: selected ? colors.primary : colors.surface, borderColor: colors.border }]}
                onPress={() => {
                  setCategoryType(option);
                  setIsIconDropdownOpen(false);
                }}
              >
                <AppText color={selected ? '#FFFFFF' : colors.text} style={styles.segmentLabel}>
                  {option === 'income' ? 'Income' : 'Expense'}
                </AppText>
              </Pressable>
            );
          })}
        </View>
        <TextInput placeholder="Category name" placeholderTextColor={colors.muted} value={categoryName} onChangeText={setCategoryName} style={[styles.input, { borderColor: colors.border, color: colors.text }]} />
        <View style={styles.field}>
          <AppText variant="caption">Icon</AppText>
          <Pressable
            style={[styles.dropdownButton, { borderColor: colors.border, backgroundColor: colors.surface }]}
            onPress={() => setIsIconDropdownOpen((value) => !value)}
          >
            <View style={[styles.categoryIcon, { backgroundColor: `${categoryType === 'income' ? colors.primary : colors.accent}20` }]}>
              <Ionicons name={selectedIcon} size={18} color={categoryType === 'income' ? colors.primary : colors.accent} />
            </View>
            <AppText style={styles.rowTitle}>{formatIconLabel(selectedIcon)}</AppText>
            <Ionicons name={isIconDropdownOpen ? 'chevron-up' : 'chevron-down'} size={20} color={colors.muted} />
          </Pressable>
          {isIconDropdownOpen ? (
            <View style={[styles.dropdownList, { borderColor: colors.border, backgroundColor: colors.surface }]}>
              <ScrollView nestedScrollEnabled showsVerticalScrollIndicator={false}>
                {iconOptions.map((icon) => {
                  const selected = icon === selectedIcon;
                  return (
                    <Pressable
                      key={icon}
                      style={[styles.dropdownItem, { borderBottomColor: colors.border }]}
                      onPress={() => {
                        setSelectedIcon(icon);
                        setIsIconDropdownOpen(false);
                      }}
                    >
                      <View style={[styles.categoryIcon, { backgroundColor: `${categoryType === 'income' ? colors.primary : colors.accent}20` }]}>
                        <Ionicons name={icon} size={18} color={categoryType === 'income' ? colors.primary : colors.accent} />
                      </View>
                      <AppText style={styles.rowTitle}>{formatIconLabel(icon)}</AppText>
                      {selected ? <Ionicons name="checkmark-circle" size={20} color={colors.primary} /> : null}
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>
          ) : null}
        </View>
        <PrimaryButton label="Add category" icon="add-circle-outline" onPress={handleAddCategory} />
      </Card>

      <Card style={styles.card}>
        <AppText variant="heading">Expense</AppText>
        <View style={styles.categoryList}>{expenseCategories.map(renderCategoryRow)}</View>
      </Card>

      <Card style={styles.card}>
        <AppText variant="heading">Income</AppText>
        <View style={styles.categoryList}>{incomeCategories.map(renderCategoryRow)}</View>
        <AppText variant="caption">Tap a category to edit or delete it.</AppText>
      </Card>
    </Screen>
  );
}

export function CategoryDetailSettingsScreen() {
  const route = useRoute<CategoryDetailRoute>();
  const navigation = useNavigation<NativeStackNavigationProp<SettingsStackParamList, 'CategoryDetailSettings'>>();
  const { state, updateCategory, deleteCategory } = useFinance();
  const { colors } = useAppTheme();
  const category = state.categories.find((item) => item.id === route.params.categoryId);
  const [name, setName] = useState(category?.name ?? '');
  const [type, setType] = useState<'expense' | 'income'>(category?.type ?? 'expense');

  if (!category) {
    return (
      <Screen>
        <Card style={styles.card}>
          <AppText variant="heading">Category not found</AppText>
        </Card>
      </Screen>
    );
  }

  const selectedCategory = category;

  function saveCategory() {
    if (!name.trim()) {
      Alert.alert('Invalid category', 'Enter a category name.');
      return;
    }

    updateCategory(selectedCategory.id, { name: name.trim(), type });
    navigation.goBack();
  }

  function confirmDelete() {
    Alert.alert('Delete category', `Delete ${selectedCategory.name}? This only works when the category is not used by transactions or budgets.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          const didDelete = deleteCategory(selectedCategory.id);

          if (!didDelete) {
            Alert.alert('Category in use', 'Categories attached to transactions or budgets cannot be deleted.');
            return;
          }

          navigation.goBack();
        },
      },
    ]);
  }

  return (
    <Screen>
      <Card style={styles.card}>
        <View style={styles.categoryPreview}>
          <View style={[styles.categoryIconLarge, { backgroundColor: `${selectedCategory.color}20` }]}>
            <Ionicons name={selectedCategory.icon as keyof typeof Ionicons.glyphMap} size={24} color={selectedCategory.color} />
          </View>
          <View style={styles.rowCopy}>
            <AppText variant="heading">{selectedCategory.name}</AppText>
            <AppText variant="caption">{selectedCategory.type === 'income' ? 'Income' : 'Expense'}</AppText>
          </View>
        </View>

        <TextInput placeholder="Category name" placeholderTextColor={colors.muted} value={name} onChangeText={setName} style={[styles.input, { borderColor: colors.border, color: colors.text }]} />
        <View style={styles.segment}>
          {(['expense', 'income'] as const).map((option) => {
            const selected = type === option;
            return (
              <Pressable key={option} style={[styles.segmentItem, { backgroundColor: selected ? colors.primary : colors.surface, borderColor: colors.border }]} onPress={() => setType(option)}>
                <AppText color={selected ? '#FFFFFF' : colors.text} style={styles.segmentLabel}>
                  {option === 'income' ? 'Income' : 'Expense'}
                </AppText>
              </Pressable>
            );
          })}
        </View>
        <PrimaryButton label="Save category" icon="save-outline" onPress={saveCategory} />
        <Pressable style={[styles.deleteButton, { borderColor: colors.danger }]} onPress={confirmDelete}>
          <AppText color={colors.danger} style={styles.segmentLabel}>
            Delete category
          </AppText>
        </Pressable>
      </Card>
    </Screen>
  );
}

export function SecuritySettingsScreen() {
  const { state, updateSettings } = useFinance();
  const { colors } = useAppTheme();
  const [pinModalMode, setPinModalMode] = useState<'enable' | 'change' | 'disable' | null>(null);
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');

  function resetPinForm() {
    setCurrentPin('');
    setNewPin('');
    setConfirmPin('');
    setPinModalMode(null);
  }

  function openPinModal(mode: 'enable' | 'change' | 'disable') {
    setCurrentPin('');
    setNewPin('');
    setConfirmPin('');
    setPinModalMode(mode);
  }

  function validateNewPin() {
    if (newPin.trim().length < 4) {
      Alert.alert('PIN too short', 'Use at least 4 digits.');
      return false;
    }

    if (newPin.trim() !== confirmPin.trim()) {
      Alert.alert('PIN does not match', 'Enter the same PIN twice.');
      return false;
    }

    return true;
  }

  function confirmPinModal() {
    if (pinModalMode === 'enable') {
      if (!validateNewPin()) {
        return;
      }

      updateSettings({ pinEnabled: true, pinCode: newPin.trim() });
      resetPinForm();
      return;
    }

    if (currentPin.trim() !== state.settings.pinCode) {
      Alert.alert('Wrong PIN', 'Enter your current PIN to continue.');
      return;
    }

    if (pinModalMode === 'disable') {
      updateSettings({ pinEnabled: false, pinCode: undefined });
      resetPinForm();
      return;
    }

    if (pinModalMode === 'change') {
      if (!validateNewPin()) {
        return;
      }

      updateSettings({ pinEnabled: true, pinCode: newPin.trim() });
      resetPinForm();
    }
  }

  const modalTitle = pinModalMode === 'enable' ? 'Set PIN' : pinModalMode === 'change' ? 'Change PIN' : 'Disable PIN';
  const modalAction = pinModalMode === 'disable' ? 'Disable PIN' : pinModalMode === 'change' ? 'Change PIN' : 'Enable PIN';

  function handlePinSwitch(value: boolean) {
    if (value) {
      openPinModal('enable');
      return;
    }

    openPinModal('disable');
  }

  return (
    <Screen>
      <Card style={styles.card}>
        <View style={styles.toggleRow}>
          <View style={styles.toggleCopy}>
            <AppText variant="body" style={styles.value}>
              Require PIN on app start
            </AppText>
            <AppText variant="caption">{state.settings.pinEnabled ? 'PIN lock is on.' : 'PIN lock is off.'}</AppText>
          </View>
          <Switch
            value={state.settings.pinEnabled}
            onValueChange={handlePinSwitch}
            trackColor={{ false: colors.border, true: colors.primarySoft }}
            thumbColor={state.settings.pinEnabled ? colors.primary : colors.muted}
          />
        </View>
        {state.settings.pinEnabled ? (
          <Pressable style={[styles.clearButton, { borderColor: colors.border }]} onPress={() => openPinModal('change')}>
            <AppText style={styles.segmentLabel}>Change PIN</AppText>
          </Pressable>
        ) : null}
      </Card>
      <Modal animationType="fade" transparent visible={pinModalMode !== null} onRequestClose={resetPinForm}>
        <View style={styles.modalScrim}>
          <View style={[styles.modalCard, { backgroundColor: colors.surface }]}>
            <View style={styles.rowHeader}>
              <AppText variant="heading">{modalTitle}</AppText>
              <Pressable style={[styles.tag, { borderColor: colors.border }]} onPress={resetPinForm}>
                <AppText style={styles.segmentLabel}>Cancel</AppText>
              </Pressable>
            </View>
            {pinModalMode === 'change' || pinModalMode === 'disable' ? (
              <TextInput
                keyboardType="number-pad"
                maxLength={6}
                secureTextEntry
                placeholder="Current PIN"
                placeholderTextColor={colors.muted}
                value={currentPin}
                onChangeText={setCurrentPin}
                style={[styles.input, { borderColor: colors.border, color: colors.text }]}
              />
            ) : null}
            {pinModalMode === 'enable' || pinModalMode === 'change' ? (
              <>
                <TextInput
                  keyboardType="number-pad"
                  maxLength={6}
                  secureTextEntry
                  placeholder="New PIN"
                  placeholderTextColor={colors.muted}
                  value={newPin}
                  onChangeText={setNewPin}
                  style={[styles.input, { borderColor: colors.border, color: colors.text }]}
                />
                <TextInput
                  keyboardType="number-pad"
                  maxLength={6}
                  secureTextEntry
                  placeholder="Re-enter new PIN"
                  placeholderTextColor={colors.muted}
                  value={confirmPin}
                  onChangeText={setConfirmPin}
                  style={[styles.input, { borderColor: colors.border, color: colors.text }]}
                />
              </>
            ) : null}
            <PrimaryButton label={modalAction} icon="lock-closed-outline" onPress={confirmPinModal} />
          </View>
        </View>
      </Modal>
    </Screen>
  );
}

export function BackupSettingsScreen() {
  const { state, importState } = useFinance();
  const { colors } = useAppTheme();
  const [exportText, setExportText] = useState('');
  const [importText, setImportText] = useState('');
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);

  function openExportBackup() {
    setExportText(JSON.stringify(state, null, 2));
    setIsExportOpen(true);
  }

  function copyExportBackup() {
    Clipboard.setStringAsync(exportText)
      .then(() => Alert.alert('Backup copied', 'The JSON backup was copied to your clipboard.'))
      .catch(() => Alert.alert('Copy failed', 'Could not copy the backup to the clipboard.'));
  }

  function importBackup() {
    try {
      importState(JSON.parse(importText));
      Alert.alert('Import complete', 'Backup data was imported.');
      setImportText('');
      setIsImportOpen(false);
    } catch {
      Alert.alert('Invalid backup', 'Paste a valid AssetFlow JSON backup.');
    }
  }

  if (isImportOpen) {
    return (
      <Screen>
        <Card style={styles.card}>
          <View style={styles.rowHeader}>
            <AppText variant="heading">Import backup</AppText>
            <Pressable style={[styles.tag, { borderColor: colors.border }]} onPress={() => setIsImportOpen(false)}>
              <AppText style={styles.segmentLabel}>Back</AppText>
            </Pressable>
          </View>
          <AppText variant="caption">Paste your AssetFlow JSON backup below, then import it.</AppText>
          <TextInput
            multiline
            placeholder="Paste backup JSON to import"
            placeholderTextColor={colors.muted}
            value={importText}
            onChangeText={setImportText}
            style={[styles.backupInput, { borderColor: colors.border, color: colors.text }]}
          />
          <PrimaryButton label="Import JSON backup" icon="cloud-upload-outline" onPress={importBackup} />
        </Card>
      </Screen>
    );
  }

  return (
    <Screen>
      <Card style={styles.card}>
        <AppText variant="heading">Backup</AppText>
        <PrimaryButton label="Export backup" icon="download-outline" onPress={openExportBackup} />
        <PrimaryButton label="Import backup" icon="cloud-upload-outline" onPress={() => setIsImportOpen(true)} />
      </Card>
      <Modal animationType="fade" transparent visible={isExportOpen} onRequestClose={() => setIsExportOpen(false)}>
        <View style={styles.modalScrim}>
          <View style={[styles.modalCard, { backgroundColor: colors.surface }]}>
            <View style={styles.rowHeader}>
              <AppText variant="heading">Export backup</AppText>
              <Pressable style={[styles.tag, { borderColor: colors.border }]} onPress={() => setIsExportOpen(false)}>
                <AppText style={styles.segmentLabel}>Close</AppText>
              </Pressable>
            </View>
            <View style={[styles.backupPreview, { borderColor: colors.border }]}>
              <AppText variant="caption" numberOfLines={8} ellipsizeMode="tail" style={styles.backupPreviewText}>
                {exportText}
              </AppText>
            </View>
            <PrimaryButton label="Copy backup" icon="copy-outline" onPress={copyExportBackup} />
          </View>
        </View>
      </Modal>
    </Screen>
  );
}

export function SampleDataSettingsScreen() {
  const { resetData, resetSampleData } = useFinance();
  const { colors } = useAppTheme();

  function confirmSampleReset() {
    Alert.alert('Restore sample data', 'This restores the starter accounts, transactions, budgets, settings, categories, goals, and debts.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Restore', style: 'destructive', onPress: resetSampleData },
    ]);
  }

  function confirmDataReset() {
    Alert.alert('Reset data to zero', 'This clears all accounts, transactions, budgets, recurring items, goals, debts, and crypto watchlist. Default categories stay available.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Reset', style: 'destructive', onPress: resetData },
    ]);
  }

  return (
    <Screen>
      <Card style={styles.card}>
        <AppText variant="heading">Data settings</AppText>
        <AppText variant="caption">Manage starter data or clear the app back to an empty state.</AppText>
      </Card>

      <Card style={styles.card}>
        <AppText variant="heading">Sample data</AppText>
        <AppText variant="caption">Restore starter accounts, transactions, budgets, settings, categories, goals, and debts.</AppText>
        <PrimaryButton label="Restore sample data" icon="refresh-outline" onPress={confirmSampleReset} />
      </Card>

      <Card style={styles.card}>
        <AppText variant="heading">Reset to zero</AppText>
        <AppText variant="caption">Clear all user data and keep only the default categories.</AppText>
        <Pressable style={[styles.deleteButton, { borderColor: colors.danger }]} onPress={confirmDataReset}>
          <AppText color={colors.danger} style={styles.segmentLabel}>
            Reset data to zero
          </AppText>
        </Pressable>
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
  rowHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  infoCard: {
    alignItems: 'center',
    gap: 14,
  },
  appIcon: {
    borderRadius: 24,
    height: 96,
    width: 96,
  },
  infoCopy: {
    alignItems: 'center',
    gap: 6,
  },
  infoRow: {
    gap: 6,
  },
  linkButton: {
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 8,
    minHeight: 48,
    paddingHorizontal: 12,
  },
  linkText: {
    flex: 1,
    fontWeight: '800',
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
  categoryPreview: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
  },
  dropdownButton: {
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 10,
    minHeight: 56,
    paddingHorizontal: 12,
  },
  dropdownList: {
    borderRadius: 14,
    borderWidth: 1,
    maxHeight: 260,
    overflow: 'hidden',
  },
  dropdownItem: {
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    gap: 10,
    minHeight: 54,
    paddingHorizontal: 12,
  },
  categoryIconLarge: {
    alignItems: 'center',
    borderRadius: 18,
    height: 54,
    justifyContent: 'center',
    width: 54,
  },
  deleteButton: {
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 52,
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
    minHeight: 104,
    maxHeight: 132,
    padding: 12,
    textAlignVertical: 'top',
  },
  backupPreview: {
    borderRadius: 14,
    borderWidth: 1,
    maxHeight: 124,
    minHeight: 96,
    overflow: 'hidden',
    padding: 12,
  },
  backupPreviewText: {
    fontFamily: 'monospace',
  },
  modalScrim: {
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.42)',
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    borderRadius: 18,
    gap: 14,
    maxHeight: '78%',
    padding: 16,
    width: '100%',
  },
});
