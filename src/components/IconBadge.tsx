import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface IconBadgeProps {
  name: keyof typeof Ionicons.glyphMap;
  color: string;
  size?: number;
}

export function IconBadge({ name, color, size = 22 }: IconBadgeProps) {
  return (
    <View style={[styles.badge, { backgroundColor: `${color}20` }]}>
      <Ionicons name={name} size={size} color={color} />
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignItems: 'center',
    borderRadius: 16,
    height: 46,
    justifyContent: 'center',
    width: 46,
  },
});
