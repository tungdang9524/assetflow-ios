import React, { useState } from 'react';
import { Alert, Pressable, StyleSheet, TextInput, View } from 'react-native';

import { AppText } from '../components/AppText';
import { Card } from '../components/Card';
import { PrimaryButton } from '../components/PrimaryButton';
import { Screen } from '../components/Screen';
import { ThemePreference } from '../models/finance';
import { useFinance } from '../store/FinanceStore';
import { useAppTheme } from '../theme/AppThemeProvider';
import { formatCurrency } from '../utils/currency';

const themeOptions: ThemePreference[] = ['system', 'light', 'dark'];

export function SettingsScreen() {
  const { state, updateSettings, resetSampleData } = useFinance();
  const { colors } = useAppTheme();
  const [rate, setRate] = useState(String(state.settings.usdToVndRate));

  function saveRate() {
    const parsedRate = Number(rate.replace(/,/g, '.'));

    if (!Number.isFinite(parsedRate) || parsedRate <= 0) {
      Alert.alert('Invalid rate', 'Enter a valid USD/VND rate.');
      return;
    }

    updateSettings({ usdToVndRate: parsedRate });
  }

  function confirmReset() {
    Alert.alert('Reset sample data', 'This restores the starter accounts, budgets, and transactions.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Reset', style: 'destructive', onPress: resetSampleData },
    ]);
  }

  return (
    <Screen>
      <View>
        <AppText variant="caption">Preferences</AppText>
        <AppText variant="title">Settings</AppText>
      </View>

      <Card style={styles.card}>
        <View style={styles.field}>
          <AppText variant="caption">Base currency</AppText>
          <AppText variant="body" style={styles.value}>
            VND
          </AppText>
        </View>
        <View style={styles.field}>
          <AppText variant="caption">USD/VND exchange rate</AppText>
          <TextInput
            keyboardType="decimal-pad"
            value={rate}
            onChangeText={setRate}
            style={[styles.input, { borderColor: colors.border, color: colors.text }]}
          />
          <AppText variant="caption">Current: {formatCurrency(state.settings.usdToVndRate, 'VND')} per USD</AppText>
        </View>
        <PrimaryButton label="Save exchange rate" icon="save-outline" onPress={saveRate} />
      </Card>

      <Card style={styles.card}>
        <AppText variant="caption">Theme</AppText>
        <View style={styles.segment}>
          {themeOptions.map((option) => {
            const selected = state.settings.theme === option;
            return (
              <Pressable
                key={option}
                style={[styles.segmentItem, { backgroundColor: selected ? colors.primary : colors.surface, borderColor: colors.border }]}
                onPress={() => updateSettings({ theme: option })}
              >
                <AppText color={selected ? '#FFFFFF' : colors.text} style={styles.segmentLabel}>
                  {option[0].toUpperCase()}
                  {option.slice(1)}
                </AppText>
              </Pressable>
            );
          })}
        </View>
      </Card>

      <Card style={styles.card}>
        <AppText variant="heading">Sample data</AppText>
        <AppText variant="caption">Restore starter accounts, transactions, budgets, settings, and categories.</AppText>
        <PrimaryButton label="Reset sample data" icon="refresh-outline" onPress={confirmReset} />
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: 14,
  },
  field: {
    gap: 8,
  },
  value: {
    fontWeight: '800',
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
});
