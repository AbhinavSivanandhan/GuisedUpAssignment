import { useMemo, useState } from 'react';
import { Platform, SafeAreaView, StatusBar, StyleSheet, useColorScheme } from 'react-native';

import { FeedScreen } from './src/screens/FeedScreen';
import { themes } from './src/theme/tokens';
import type { ThemeMode } from './src/theme/tokens';

export default function App() {
  const systemScheme = useColorScheme();
  const [themeOverride, setThemeOverride] = useState<ThemeMode | null>(null);
  const mode: ThemeMode = themeOverride ?? (systemScheme === 'dark' ? 'dark' : 'light');
  const theme = themes[mode];
  const styles = useMemo(() => createStyles(theme.background), [theme.background]);

  return (
    <SafeAreaView style={styles.shell}>
      <StatusBar barStyle={mode === 'dark' ? 'light-content' : 'dark-content'} />
      <FeedScreen
        onToggleTheme={() => setThemeOverride((current) => (current === 'dark' || (current === null && mode === 'dark') ? 'light' : 'dark'))}
        theme={theme}
      />
    </SafeAreaView>
  );
}

function createStyles(background: string) {
  return StyleSheet.create({
    shell: {
      flex: 1,
      backgroundColor: background,
      paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight ?? 0) : 0
    }
  });
}
