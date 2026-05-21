import React, { useState } from 'react';
import { LayoutChangeEvent, StyleSheet, View } from 'react-native';
import Svg, { Circle, Line, Polyline } from 'react-native-svg';

import { CurrencyCode } from '../models/finance';
import { useAppTheme } from '../theme/AppThemeProvider';
import { compactCurrency } from '../utils/currency';
import { AppText } from './AppText';

export interface AssetLineChartPoint {
  label: string;
  value: number;
}

export interface AssetLineChartSeries {
  id: string;
  label: string;
  color: string;
  points: AssetLineChartPoint[];
}

interface AssetLineChartProps {
  currency: CurrencyCode;
  series: AssetLineChartSeries[];
}

const plotHeight = 154;
const plotPaddingX = 10;
const plotPaddingY = 12;

function samplePoints(points: AssetLineChartPoint[], maxCount = 28) {
  if (points.length <= maxCount) {
    return points;
  }

  const step = (points.length - 1) / (maxCount - 1);
  return Array.from({ length: maxCount }, (_, index) => points[Math.round(index * step)]);
}

export function AssetLineChart({ currency, series }: AssetLineChartProps) {
  const { colors } = useAppTheme();
  const [chartWidth, setChartWidth] = useState(0);
  const visibleSeries = series
    .map((item) => ({ ...item, points: samplePoints(item.points).filter((point) => Number.isFinite(point.value)) }))
    .filter((item) => item.points.length > 0);
  const values = visibleSeries.flatMap((item) => item.points.map((point) => point.value));
  const minValue = values.length ? Math.min(...values) : 0;
  const maxValue = values.length ? Math.max(...values) : 0;
  const range = Math.max(maxValue - minValue, 1);
  const usableWidth = Math.max(chartWidth - plotPaddingX * 2, 0);
  const usableHeight = plotHeight - plotPaddingY * 2;

  function handleLayout(event: LayoutChangeEvent) {
    setChartWidth(event.nativeEvent.layout.width);
  }

  function getPolyline(points: AssetLineChartPoint[]) {
    return points
      .map((point, index) => {
        const x = points.length <= 1 ? chartWidth / 2 : plotPaddingX + (index / (points.length - 1)) * usableWidth;
        const y = plotPaddingY + (1 - (point.value - minValue) / range) * usableHeight;
        return `${x},${y}`;
      })
      .join(' ');
  }

  return (
    <View style={styles.wrap}>
      <View style={styles.header}>
        <View>
          <AppText variant="caption">Assets</AppText>
          <AppText variant="body" style={styles.heading}>Asset value chart</AppText>
        </View>
        <View style={styles.headerValue}>
          <AppText variant="caption">Low {compactCurrency(minValue, currency)}</AppText>
          <AppText variant="caption">High {compactCurrency(maxValue, currency)}</AppText>
        </View>
      </View>

      <View style={[styles.plot, { borderColor: colors.border }]} onLayout={handleLayout}>
        {chartWidth > 0 ? (
          <Svg width={chartWidth} height={plotHeight}>
            <Line x1={0} x2={chartWidth} y1={12} y2={12} stroke={colors.border} strokeWidth={1} opacity={0.55} />
            <Line x1={0} x2={chartWidth} y1={77} y2={77} stroke={colors.border} strokeWidth={1} opacity={0.55} />
            <Line x1={0} x2={chartWidth} y1={plotHeight - 1} y2={plotHeight - 1} stroke={colors.border} strokeWidth={1} opacity={0.55} />
            {visibleSeries.map((item) => {
              const latestPoint = item.points[item.points.length - 1];
              const latestX = item.points.length <= 1 ? chartWidth / 2 : plotPaddingX + usableWidth;
              const latestY = plotPaddingY + (1 - (latestPoint.value - minValue) / range) * usableHeight;

              return (
                <React.Fragment key={item.id}>
                  <Polyline points={getPolyline(item.points)} fill="none" stroke={item.color} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
                  <Circle cx={latestX} cy={latestY} r={4} fill={colors.surface} stroke={item.color} strokeWidth={2} />
                </React.Fragment>
              );
            })}
          </Svg>
        ) : null}
      </View>

      <View style={styles.legend}>
        {visibleSeries.map((item) => {
          const latestPoint = item.points[item.points.length - 1];

          return (
            <View key={item.id} style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: item.color }]} />
              <AppText variant="caption" style={styles.legendLabel}>{item.label}</AppText>
              <AppText variant="caption">{compactCurrency(latestPoint.value, currency)}</AppText>
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
    gap: 12,
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
    height: plotHeight,
    overflow: 'hidden',
  },
  legend: {
    gap: 8,
  },
  legendItem: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  legendDot: {
    borderRadius: 999,
    height: 10,
    width: 10,
  },
  legendLabel: {
    flex: 1,
  },
});
