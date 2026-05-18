import React from 'react';
import { DimensionValue, StyleSheet, View } from 'react-native';

import { useAppTheme } from '../theme/AppThemeProvider';
import { compactCurrency } from '../utils/currency';
import { AppText } from './AppText';

interface BalanceTrendPoint {
  monthKey?: string;
  label: string;
  value: number;
}

interface BalanceTrendChartProps {
  points: BalanceTrendPoint[];
}

export function BalanceTrendChart({ points }: BalanceTrendChartProps) {
  const { colors } = useAppTheme();
  const values = points.map((point) => point.value);
  const minValue = Math.min(...values, 0);
  const maxValue = Math.max(...values, 1);
  const range = Math.max(maxValue - minValue, 1);

  return (
    <View style={styles.wrap}>
      <View style={styles.header}>
        <View>
          <AppText variant="caption">Balance trend</AppText>
          <AppText variant="body" style={styles.heading}>
            Last {points.length} months
          </AppText>
        </View>
        <AppText variant="caption">{compactCurrency(points[points.length - 1]?.value ?? 0, 'VND')}</AppText>
      </View>
      <View style={[styles.chart, { borderColor: colors.border }]}>
        {points.map((point) => {
          const height = `${Math.max(((point.value - minValue) / range) * 100, 6)}%` as DimensionValue;
          const isLatest = point === points[points.length - 1];

          return (
            <View key={point.monthKey ?? point.label} style={styles.barSlot}>
              <View style={styles.barTrack}>
                <View style={[styles.bar, { height, backgroundColor: isLatest ? colors.primary : colors.primarySoft }]} />
              </View>
              <AppText variant="caption" style={styles.monthLabel}>
                {point.label}
              </AppText>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 14,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  heading: {
    fontWeight: '800',
  },
  chart: {
    borderBottomWidth: 1,
    flexDirection: 'row',
    gap: 10,
    height: 150,
    paddingTop: 8,
  },
  barSlot: {
    alignItems: 'center',
    flex: 1,
    gap: 8,
  },
  barTrack: {
    flex: 1,
    justifyContent: 'flex-end',
    width: '100%',
  },
  bar: {
    borderRadius: 999,
    minHeight: 8,
    width: '100%',
  },
  monthLabel: {
    textAlign: 'center',
  },
});
