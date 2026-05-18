import React, { PropsWithChildren } from 'react';
import { StyleProp, Text, TextProps, TextStyle } from 'react-native';

import { useAppTheme } from '../theme/AppThemeProvider';

interface AppTextProps extends PropsWithChildren, Pick<TextProps, 'ellipsizeMode' | 'numberOfLines'> {
  variant?: 'title' | 'heading' | 'body' | 'caption' | 'number';
  color?: string;
  style?: StyleProp<TextStyle>;
}

export function AppText({ children, variant = 'body', color, style, ellipsizeMode, numberOfLines }: AppTextProps) {
  const { colors } = useAppTheme();

  const baseStyle: TextStyle = {
    color: color ?? colors.text,
  };

  const variants: Record<NonNullable<AppTextProps['variant']>, TextStyle> = {
    title: { fontSize: 31, fontWeight: '800', lineHeight: 38 },
    heading: { fontSize: 20, fontWeight: '700', lineHeight: 26 },
    body: { fontSize: 15, fontWeight: '500', lineHeight: 21 },
    caption: { fontSize: 12, fontWeight: '600', lineHeight: 16, color: color ?? colors.muted },
    number: { fontSize: 24, fontWeight: '800', lineHeight: 30 },
  };

  return <Text ellipsizeMode={ellipsizeMode} numberOfLines={numberOfLines} style={[baseStyle, variants[variant], style]}>{children}</Text>;
}
