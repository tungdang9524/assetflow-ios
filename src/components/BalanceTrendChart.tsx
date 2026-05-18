import React, { useState } from 'react';
import { LayoutChangeEvent, StyleSheet, View } from 'react-native';

import { useAppTheme } from '../theme/AppThemeProvider';
import { compactCurrency } from '../utils/currency';
import { AppText } from './AppText';

interface BalanceTrendPoint {
  dateKey?: string;
  label: string;
  value: number;
  change?: number;
}

interface BalanceTrendChartProps {
  points: BalanceTrendPoint[];
}

export function BalanceTrendChart({ points }: BalanceTrendChartProps) {
  const { colors } = useAppTheme();
  const [chartWidth, setChartWidth] = useState(0);
  const values = points.map((point) => point.value);
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  const range = Math.max(maxValue - minValue, 1);
  const latestPoint = points[points.length - 1];
  const periodChange = (latestPoint?.value ?? 0) - (points[0]?.value ?? 0);
  const plotHeight = 138;
  const plotPaddingX = 10;
  const usableWidth = Math.max(chartWidth - plotPaddingX * 2, 0);
  const coordinates = points.map((point, index) => {
    const x = points.length <= 1 ? chartWidth / 2 : plotPaddingX + (index / (points.length - 1)) * usableWidth;
    const y = 8 + (1 - (point.value - minValue) / range) * (plotHeight - 18);

    return { ...point, x, y };
  });

  function handleChartLayout(event: LayoutChangeEvent) {
    setChartWidth(event.nativeEvent.layout.width);
  }

  return (
    <View style={styles.wrap}>
      <View style={styles.header}>
        <View>
          <AppText variant="caption">Balance trend</AppText>
          <AppText variant="body" style={styles.heading}>
            Daily balance changes
          </AppText>
        </View>
        <View style={styles.headerValue}>
          <AppText variant="caption">{compactCurrency(latestPoint?.value ?? 0, 'VND')}</AppText>
          <AppText variant="caption" color={periodChange >= 0 ? colors.primary : colors.danger}>
            {periodChange >= 0 ? '+' : ''}
            {compactCurrency(periodChange, 'VND')}
          </AppText>
        </View>
      </View>
      <View style={[styles.plot, { borderColor: colors.border }]} onLayout={handleChartLayout}>
        <View style={[styles.gridLine, styles.gridTop, { backgroundColor: colors.border }]} />
        <View style={[styles.gridLine, styles.gridMiddle, { backgroundColor: colors.border }]} />
        <View style={[styles.gridLine, styles.gridBottom, { backgroundColor: colors.border }]} />

        {chartWidth > 0
          ? coordinates.slice(1).map((point, index) => {
              const previous = coordinates[index];
              const dx = point.x - previous.x;
              const dy = point.y - previous.y;
              const length = Math.sqrt(dx * dx + dy * dy);
              const angle = `${Math.atan2(dy, dx)}rad`;

              return (
                <View
                  key={`${previous.dateKey ?? previous.label}-${point.dateKey ?? point.label}`}
                  style={[
                    styles.segment,
                    {
                      backgroundColor: colors.primary,
                      left: previous.x + dx / 2 - length / 2,
                      top: previous.y + dy / 2,
                      transform: [{ rotateZ: angle }],
                      width: length,
                    },
                  ]}
                />
              );
            })
          : null}

        {chartWidth > 0
          ? coordinates.map((point, index) => {
              const isLatest = index === coordinates.length - 1;

              return (
                <View
                  key={point.dateKey ?? point.label}
                  style={[
                    styles.dot,
                    {
                      backgroundColor: isLatest ? colors.primary : colors.surface,
                      borderColor: colors.primary,
                      left: point.x - 5,
                      top: point.y - 5,
                    },
                  ]}
                />
              );
            })
          : null}
      </View>
      <View style={styles.dateRow}>
        {points.map((point, index) => (
          <AppText key={point.dateKey ?? point.label} variant="caption" style={styles.dateLabel}>
            {index === 0 || index === points.length - 1 || index % 4 === 0 ? point.label : ''}
          </AppText>
        ))}
      </View>
      <View style={styles.rangeRow}>
        <AppText variant="caption">Low {compactCurrency(minValue, 'VND')}</AppText>
        <AppText variant="caption">High {compactCurrency(maxValue, 'VND')}</AppText>
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
  headerValue: {
    alignItems: 'flex-end',
    gap: 2,
  },
  heading: {
    fontWeight: '800',
  },
  plot: {
    borderBottomWidth: 1,
    height: 138,
    overflow: 'hidden',
  },
  gridLine: {
    height: StyleSheet.hairlineWidth,
    left: 0,
    opacity: 0.55,
    position: 'absolute',
    right: 0,
  },
  gridTop: {
    top: 12,
  },
  gridMiddle: {
    top: 68,
  },
  gridBottom: {
    bottom: 0,
  },
  segment: {
    borderRadius: 999,
    height: 3,
    position: 'absolute',
  },
  dot: {
    borderRadius: 999,
    borderWidth: 2,
    height: 10,
    position: 'absolute',
    width: 10,
  },
  dateRow: {
    flexDirection: 'row',
  },
  dateLabel: {
    flex: 1,
    textAlign: 'center',
  },
  rangeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});
