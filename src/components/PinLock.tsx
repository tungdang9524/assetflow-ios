import React, { useEffect, useState } from 'react';
import { Alert, StyleSheet, TextInput, View } from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';

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
  const [canUseBiometric, setCanUseBiometric] = useState(false);

  async function unlockWithBiometric() {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Unlock AssetFlow',
      fallbackLabel: 'Use PIN',
      cancelLabel: 'Cancel',
      disableDeviceFallback: false,
    });

    if (result.success) {
      onUnlock();
    }
  }

  useEffect(() => {
    let isMounted = true;

    async function checkBiometric() {
      const [hasHardware, isEnrolled] = await Promise.all([
        LocalAuthentication.hasHardwareAsync(),
        LocalAuthentication.isEnrolledAsync(),
      ]);

      if (isMounted) {
        setCanUseBiometric(hasHardware && isEnrolled);
      }
    }

    if (state.settings.biometricEnabled) {
      checkBiometric().catch(() => undefined);
    }

    return () => {
      isMounted = false;
    };
  }, [state.settings.biometricEnabled]);

  useEffect(() => {
    if (state.settings.biometricEnabled && canUseBiometric) {
      unlockWithBiometric().catch(() => undefined);
    }
  }, [canUseBiometric, state.settings.biometricEnabled]);

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
        {state.settings.biometricEnabled && canUseBiometric ? (
          <PrimaryButton label="Unlock with biometrics" icon="scan-outline" onPress={() => unlockWithBiometric().catch(() => undefined)} />
        ) : null}
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
