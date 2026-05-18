import React from 'react';
import { DimensionValue, StyleSheet, View } from 'react-native';

import { useAppTheme } from '../theme/AppThemeProvider';

interface ProgressBarProps {
  percent: number;
  color?: string;
}

export function ProgressBar({ percent, color }: ProgressBarProps) {
  const { colors } = useAppTheme();
  const width = `${Math.max(0, Math.min(percent, 1)) * 100}%` as DimensionValue;

  return (
    <View style={[styles.track, { backgroundColor: colors.border }]}>
      <View style={[styles.fill, { width, backgroundColor: color ?? colors.primary }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    borderRadius: 999,
    height: 8,
    overflow: 'hidden',
  },
  fill: {
    borderRadius: 999,
    height: '100%',
  },
});
