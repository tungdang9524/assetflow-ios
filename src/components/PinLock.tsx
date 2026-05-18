import React, { useState } from 'react';
import { Alert, StyleSheet, TextInput, View } from 'react-native';

import { useFinance } from '../store/FinanceStore';
import { useAppTheme } from '../theme/AppThemeProvider';
import { AppText } from './AppText';
import { PrimaryButton } from './PrimaryButton';

interface PinLockProps {
  onUnlock: () => void;
}

export function PinLock({ onUnlock }: PinLockProps) {
  const { state } = useFinance();
  const { colors } = useAppTheme();
  const [pin, setPin] = useState('');

  function unlock() {
    if (pin === state.settings.pinCode) {
      onUnlock();
      return;
    }

    Alert.alert('Wrong PIN', 'Try again.');
    setPin('');
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <AppText variant="caption">AssetFlow</AppText>
        <AppText variant="title">Enter PIN</AppText>
        <TextInput
          keyboardType="number-pad"
          maxLength={6}
          secureTextEntry
          value={pin}
          onChangeText={setPin}
          placeholder="PIN"
          placeholderTextColor={colors.muted}
          style={[styles.input, { borderColor: colors.border, color: colors.text }]}
        />
        <PrimaryButton label="Unlock" icon="lock-open-outline" onPress={unlock} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  content: {
    gap: 16,
  },
  input: {
    borderRadius: 16,
    borderWidth: 1,
    fontSize: 22,
    fontWeight: '800',
    minHeight: 56,
    paddingHorizontal: 14,
    textAlign: 'center',
  },
});
