import React, { PropsWithChildren } from 'react';
import { ScrollView, ScrollViewProps, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAppTheme } from '../theme/AppThemeProvider';

interface ScreenProps extends PropsWithChildren {
  onScroll?: ScrollViewProps['onScroll'];
  scroll?: boolean;
  scrollEnabled?: boolean;
  scrollEventThrottle?: number;
  scrollViewRef?: React.RefObject<ScrollView | null>;
}

export function Screen({ children, onScroll, scroll = true, scrollEnabled = true, scrollEventThrottle, scrollViewRef }: ScreenProps) {
  const { colors } = useAppTheme();

  if (!scroll) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
        <View style={[styles.content, styles.fixedContent]}>{children}</View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={styles.content}
        onScroll={onScroll}
        ref={scrollViewRef}
        scrollEnabled={scrollEnabled}
        scrollEventThrottle={scrollEventThrottle}
        showsVerticalScrollIndicator={false}
      >
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 28,
    gap: 16,
  },
  fixedContent: {
    flex: 1,
  },
});
