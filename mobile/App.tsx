import { SafeAreaView, StatusBar, StyleSheet } from 'react-native';

import { FeedScreen } from './src/screens/FeedScreen';
import { colors } from './src/theme/tokens';

export default function App() {
  return (
    <SafeAreaView style={styles.shell}>
      <StatusBar barStyle="dark-content" />
      <FeedScreen />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  shell: {
    flex: 1,
    backgroundColor: colors.background
  }
});
