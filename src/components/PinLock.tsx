import React, { useState } from 'react';
import { Alert, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
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
  const [biometricError, setBiometricError] = useState('');
  const canUsePin = state.settings.pinEnabled && Boolean(state.settings.pinCode);
  const canUseFaceId = state.settings.faceIdEnabled;

  async function unlockWithFaceId() {
    setBiometricError('');

    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      const supportedTypes = await LocalAuthentication.supportedAuthenticationTypesAsync();
      const supportsFaceId = supportedTypes.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION);

      if (!hasHardware || !isEnrolled || !supportsFaceId) {
        setBiometricError('Face ID is not available on this device.');
        return;
      }

      const result = await LocalAuthentication.authenticateAsync({
        biometricsSecurityLevel: 'strong',
        cancelLabel: 'Cancel',
        disableDeviceFallback: true,
        fallbackLabel: '',
        promptMessage: 'Unlock AssetFlow',
      });

      if (result.success) {
        onUnlock();
        return;
      }

      if (result.error !== 'user_cancel' && result.error !== 'system_cancel') {
        setBiometricError('Face ID authentication failed.');
      }
    } catch {
      setBiometricError('Face ID authentication is unavailable.');
    }
  }

  React.useEffect(() => {
    if (canUseFaceId) {
      unlockWithFaceId();
    }
  }, [canUseFaceId]);

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
        <AppText variant="title">{canUseFaceId ? 'Unlock with Face ID' : 'Enter PIN'}</AppText>
        {canUseFaceId ? (
          <>
            <Pressable style={[styles.faceButton, { borderColor: colors.border }]} onPress={unlockWithFaceId}>
              <Ionicons name="scan-outline" size={28} color={colors.primary} />
              <AppText color={colors.primary} style={styles.faceButtonText}>Use Face ID</AppText>
            </Pressable>
            {biometricError ? <AppText variant="caption">{biometricError}</AppText> : null}
          </>
        ) : null}
        {canUsePin ? (
          <>
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
          </>
        ) : null}
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
  faceButton: {
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'center',
    minHeight: 56,
  },
  faceButtonText: {
    fontWeight: '800',
  },
});
