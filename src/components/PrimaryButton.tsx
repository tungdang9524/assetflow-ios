import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useAppTheme } from '../theme/AppThemeProvider';
import { AppText } from './AppText';

interface PrimaryButtonProps {
  label: string;
  icon?: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
}

export function PrimaryButton({ label, icon, onPress }: PrimaryButtonProps) {
  const { colors } = useAppTheme();

  return (
    <Pressable style={({ pressed }) => [styles.button, { backgroundColor: colors.primary, opacity: pressed ? 0.82 : 1 }]} onPress={onPress}>
      {icon ? <Ionicons name={icon} size={18} color="#FFFFFF" /> : null}
      <AppText color="#FFFFFF" style={styles.label}>
        {label}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    borderRadius: 16,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    minHeight: 52,
    paddingHorizontal: 16,
  },
  label: {
    fontWeight: '800',
  },
});
