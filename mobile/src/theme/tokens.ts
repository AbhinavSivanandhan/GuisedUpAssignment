export type ThemeMode = 'light' | 'dark';

export type ThemeColors = {
  mode: ThemeMode;
  background: string;
  surface: string;
  surfaceRaised: string;
  surfaceSubtle: string;
  text: string;
  textMuted: string;
  border: string;
  primary: string;
  primaryHover: string;
  primaryContainer: string;
  onPrimary: string;
  danger: string;
  dangerContainer: string;
  focusRing: string;
  shadow: string;
  skeleton: string;
};

export const lightTheme: ThemeColors = {
  mode: 'light',
  background: '#F6F3EE',
  surface: '#FFFDF9',
  surfaceRaised: '#FFFFFF',
  surfaceSubtle: '#ECE7DF',
  text: '#1B1F1C',
  textMuted: '#667067',
  border: '#D8DED3',
  primary: '#2F6F55',
  primaryHover: '#255A45',
  primaryContainer: '#DDEDE3',
  onPrimary: '#FFFFFF',
  danger: '#A43E37',
  dangerContainer: '#F7DEDA',
  focusRing: '#77A88E',
  shadow: 'rgba(31, 42, 35, 0.12)',
  skeleton: '#E3E8DF'
};

export const darkTheme: ThemeColors = {
  mode: 'dark',
  background: '#101512',
  surface: '#171D19',
  surfaceRaised: '#202820',
  surfaceSubtle: '#2B342C',
  text: '#F2F5EE',
  textMuted: '#B7C2B8',
  border: '#3C493F',
  primary: '#8BC7A7',
  primaryHover: '#A5DDBF',
  primaryContainer: '#263C30',
  onPrimary: '#0E1A13',
  danger: '#FFB4AB',
  dangerContainer: '#4B201C',
  focusRing: '#A5DDBF',
  shadow: 'rgba(0, 0, 0, 0.38)',
  skeleton: '#303A32'
};

export const themes = {
  light: lightTheme,
  dark: darkTheme
};

export const colors = lightTheme;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32
};

export const radii = {
  sm: 6,
  md: 8,
  lg: 12,
  xl: 16
};

export const typography = {
  wordmark: 24,
  title: 24,
  heading: 18,
  body: 15,
  small: 12,
  tiny: 11
};
