import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View
} from 'react-native';

import { PostCard } from '../components/PostCard';
import { useFeedController } from '../hooks/useFeedController';
import { colors, radii, spacing, typography } from '../theme/tokens';

export function FeedScreen() {
  const { state, displayedPosts, loadNextPage, refreshFeed, updateQuery, reactToPost } = useFeedController();
  const emptyTitle = state.mode === 'search' ? 'No matching posts' : 'No posts yet';
  const loading = state.initialLoading || state.searchLoading;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Real Connections</Text>
        <TextInput
          autoCapitalize="none"
          clearButtonMode="while-editing"
          onChangeText={updateQuery}
          placeholder="Search posts"
          placeholderTextColor={colors.muted}
          style={styles.search}
          value={state.query}
        />
      </View>

      {state.error ? (
        <View style={styles.error}>
          <Text style={styles.errorText}>{state.error}</Text>
          <Pressable accessibilityRole="button" onPress={refreshFeed} style={styles.retryButton}>
            <Text style={styles.retryText}>Retry</Text>
          </Pressable>
        </View>
      ) : null}

      {loading ? (
        <View style={styles.centerState}>
          <ActivityIndicator color={colors.accent} />
          <Text style={styles.stateText}>{state.mode === 'search' ? 'Searching posts' : 'Loading feed'}</Text>
        </View>
      ) : (
        <FlatList
          data={displayedPosts}
          keyExtractor={(post) => String(post.id)}
          keyboardShouldPersistTaps="handled"
          ListEmptyComponent={
            <View style={styles.centerState}>
              <Text style={styles.emptyTitle}>{emptyTitle}</Text>
              <Text style={styles.stateText}>
                {state.mode === 'search'
                  ? 'Try a different phrase or clear search to return to the feed.'
                  : 'Create posts from the API, then refresh.'}
              </Text>
            </View>
          }
          ListFooterComponent={
            state.paginationLoading ? (
              <View style={styles.footerLoading}>
                <ActivityIndicator color={colors.accent} />
              </View>
            ) : null
          }
          onEndReached={loadNextPage}
          onEndReachedThreshold={0.35}
          renderItem={({ item }) => (
            <PostCard
              onReact={reactToPost}
              post={item}
              reacting={state.reactingPostIds.includes(item.id)}
            />
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    flex: 1
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.md
  },
  title: {
    color: colors.text,
    fontSize: typography.title,
    fontWeight: '800',
    marginBottom: spacing.md
  },
  search: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: 1,
    color: colors.text,
    fontSize: typography.body,
    minHeight: 46,
    paddingHorizontal: spacing.lg
  },
  error: {
    alignItems: 'center',
    backgroundColor: '#F8E6E3',
    borderColor: '#EDB7B0',
    borderRadius: radii.md,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.md,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    padding: spacing.md
  },
  errorText: {
    color: colors.danger,
    flex: 1,
    fontSize: typography.small
  },
  retryButton: {
    backgroundColor: colors.danger,
    borderRadius: radii.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm
  },
  retryText: {
    color: colors.surface,
    fontSize: typography.small,
    fontWeight: '700'
  },
  centerState: {
    alignItems: 'center',
    gap: spacing.sm,
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: 72
  },
  emptyTitle: {
    color: colors.text,
    fontSize: typography.heading,
    fontWeight: '800'
  },
  stateText: {
    color: colors.muted,
    fontSize: typography.body,
    lineHeight: 22,
    textAlign: 'center'
  },
  footerLoading: {
    paddingVertical: spacing.xl
  }
});
