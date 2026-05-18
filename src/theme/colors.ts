export const palette = {
  ink: '#162018',
  muted: '#69746C',
  paper: '#F7F3EA',
  surface: '#FFFFFF',
  line: '#E4DED1',
  primary: '#2F7D57',
  primarySoft: '#DDF2E6',
  accent: '#2E6EEA',
  danger: '#D94841',
  warning: '#D98A1B',
  darkBackground: '#101512',
  darkSurface: '#18201C',
  darkLine: '#2B352F',
  darkText: '#F1F5EF',
  darkMuted: '#A4AEA7',
};

export const lightColors = {
  background: palette.paper,
  surface: palette.surface,
  text: palette.ink,
  muted: palette.muted,
  border: palette.line,
  primary: palette.primary,
  primarySoft: palette.primarySoft,
  accent: palette.accent,
  danger: palette.danger,
  warning: palette.warning,
  shadow: '#000000',
};

export const darkColors = {
  background: palette.darkBackground,
  surface: palette.darkSurface,
  text: palette.darkText,
  muted: palette.darkMuted,
  border: palette.darkLine,
  primary: '#65C18C',
  primarySoft: '#21382A',
  accent: '#78A7FF',
  danger: '#FF827A',
  warning: '#F2B85B',
  shadow: '#000000',
};

export type AppColors = typeof lightColors;
