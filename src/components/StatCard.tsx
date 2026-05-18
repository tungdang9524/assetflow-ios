import React from 'react';
import { StyleSheet, View } from 'react-native';

import { useAppTheme } from '../theme/AppThemeProvider';
import { AppText } from './AppText';
import { Card } from './Card';

interface StatCardProps {
  label: string;
  value: string;
  tone?: 'neutral' | 'positive' | 'negative';
}

export function StatCard({ label, value, tone = 'neutral' }: StatCardProps) {
  const { colors } = useAppTheme();
  const toneColor = tone === 'positive' ? colors.primary : tone === 'negative' ? colors.danger : colors.text;

  return (
    <Card style={styles.card}>
      <View style={styles.content}>
        <AppText variant="caption">{label}</AppText>
        <AppText variant="number" color={toneColor} style={styles.value}>
          {value}
        </AppText>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minHeight: 104,
  },
  content: {
    gap: 8,
  },
  value: {
    fontSize: 19,
    lineHeight: 24,
  },
});
