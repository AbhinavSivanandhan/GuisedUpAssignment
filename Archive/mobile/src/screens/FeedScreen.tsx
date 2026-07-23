import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View
} from 'react-native';

import { PostCard } from '../components/PostCard';
import { useFeedController } from '../hooks/useFeedController';
import { colors, radii, spacing, typography } from '../theme/tokens';

export function FeedScreen() {
  const {
    state,
    displayedPosts,
    loadNextPage,
    refreshFeed,
    retryCurrentOperation,
    updateQuery,
    reactToPost
  } = useFeedController();
  const emptyTitle = state.mode === 'search' ? 'No matching posts' : 'No posts yet';
  const initialLoading = state.initialLoading && state.feedPosts.length === 0;
  const showingFeedBehindSearch = state.mode === 'search' && state.searchLoading && state.searchPosts.length === 0;
  const listPosts = showingFeedBehindSearch ? state.feedPosts : displayedPosts;
  const resultContext =
    state.mode === 'search'
      ? `${state.searchLoading ? 'Searching' : `${state.searchPosts.length} result${state.searchPosts.length === 1 ? '' : 's'}`} for "${state.query.trim()}"`
      : `${state.feedPosts.length} visible of ${state.hasNextPage ? 'more than ' : ''}${state.feedPosts.length} real posts`;

  return (
    <View style={styles.container}>
      <View style={styles.shell}>
        <View style={styles.header}>
          <View>
            <Text style={styles.productLabel}>Real Connections</Text>
            <Text style={styles.wordmark}>Guised Up</Text>
            <Text style={styles.statement}>Less polish. More proof of the people worth staying close to.</Text>
          </View>
        </View>

        <View style={styles.searchSurface}>
          <Text style={styles.searchIcon}>Search</Text>
          <TextInput
            autoCapitalize="none"
            clearButtonMode="while-editing"
            onChangeText={updateQuery}
            placeholder="Try funny travel stories from last week"
            placeholderTextColor={colors.muted}
            style={styles.search}
            value={state.query}
          />
          {state.query.trim() ? (
            <Pressable accessibilityRole="button" onPress={() => updateQuery('')} style={styles.clearButton}>
              <Text style={styles.clearText}>Clear</Text>
            </Pressable>
          ) : null}
        </View>

        <View style={styles.contextRow}>
          <Text style={styles.contextText}>{resultContext}</Text>
          {state.searchLoading ? <ActivityIndicator color={colors.accent} size="small" /> : null}
        </View>

        {state.error ? (
          <View style={styles.error}>
            <View style={styles.errorCopy}>
              <Text style={styles.errorTitle}>Something needs attention</Text>
              <Text style={styles.errorText}>{state.error}</Text>
            </View>
            <Pressable accessibilityRole="button" onPress={retryCurrentOperation} style={styles.retryButton}>
              <Text style={styles.retryText}>Retry</Text>
            </Pressable>
          </View>
        ) : null}

        {initialLoading ? (
          <View style={styles.skeletonGroup}>
            {[1, 2, 3].map((item) => (
              <View key={item} style={styles.skeletonCard}>
                <View style={styles.skeletonHeader}>
                  <View style={styles.skeletonAvatar} />
                  <View style={styles.skeletonLines}>
                    <View style={styles.skeletonLineStrong} />
                    <View style={styles.skeletonLineShort} />
                  </View>
                </View>
                <View style={styles.skeletonLineWide} />
                <View style={styles.skeletonLineMedium} />
              </View>
            ))}
          </View>
        ) : (
        <FlatList
          data={listPosts}
          contentContainerStyle={styles.listContent}
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
                <Text style={styles.footerText}>Loading more real posts</Text>
              </View>
            ) : null
          }
          onEndReached={loadNextPage}
          onEndReachedThreshold={0.35}
          refreshControl={
            <RefreshControl refreshing={state.initialLoading && state.feedPosts.length > 0} onRefresh={refreshFeed} />
          }
          renderItem={({ item }) => (
            <PostCard
              onReact={reactToPost}
              post={item}
              reacted={state.reactedPostIds.includes(item.id)}
              reacting={state.reactingPostIds.includes(item.id)}
            />
          )}
        />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    flex: 1,
    alignItems: 'center'
  },
  shell: {
    flex: 1,
    maxWidth: 760,
    width: '100%'
  },
  header: {
    backgroundColor: colors.surfaceWarm,
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg
  },
  productLabel: {
    color: colors.gold,
    fontSize: typography.tiny,
    fontWeight: '800',
    letterSpacing: 0,
    textTransform: 'uppercase'
  },
  wordmark: {
    color: colors.text,
    fontSize: typography.wordmark,
    fontWeight: '800',
    lineHeight: 40
  },
  statement: {
    color: colors.inkSoft,
    fontSize: typography.body,
    lineHeight: 22,
    marginTop: spacing.xs
  },
  searchSurface: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.lg,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.sm,
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    paddingHorizontal: spacing.md,
    boxShadow: '0 6px 18px rgba(30, 27, 24, 0.07)',
    elevation: 2
  },
  searchIcon: {
    color: colors.accentDark,
    fontSize: typography.small,
    fontWeight: '800'
  },
  search: {
    color: colors.text,
    flex: 1,
    fontSize: typography.body,
    minHeight: 46,
    paddingVertical: spacing.sm
  },
  clearButton: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: radii.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs
  },
  clearText: {
    color: colors.accentDark,
    fontSize: typography.small,
    fontWeight: '800'
  },
  contextRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 36,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm
  },
  contextText: {
    color: colors.muted,
    flex: 1,
    fontSize: typography.small,
    fontWeight: '700'
  },
  error: {
    alignItems: 'center',
    backgroundColor: colors.dangerSoft,
    borderColor: '#EDB7B0',
    borderRadius: radii.lg,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.md,
    marginHorizontal: spacing.lg,
    marginVertical: spacing.sm,
    padding: spacing.md
  },
  errorCopy: {
    flex: 1
  },
  errorTitle: {
    color: colors.danger,
    fontSize: typography.small,
    fontWeight: '800',
    marginBottom: spacing.xs
  },
  errorText: {
    color: colors.danger,
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
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xl
  },
  footerText: {
    color: colors.muted,
    fontSize: typography.small,
    fontWeight: '700'
  },
  listContent: {
    paddingBottom: spacing.xxl,
    paddingTop: spacing.xs
  },
  skeletonGroup: {
    paddingTop: spacing.sm
  },
  skeletonCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.lg,
    borderWidth: 1,
    marginHorizontal: spacing.lg,
    marginVertical: spacing.sm,
    padding: spacing.lg
  },
  skeletonHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.lg
  },
  skeletonAvatar: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: 20,
    height: 40,
    width: 40
  },
  skeletonLines: {
    flex: 1,
    gap: spacing.sm
  },
  skeletonLineStrong: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: radii.sm,
    height: 14,
    width: '48%'
  },
  skeletonLineShort: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: radii.sm,
    height: 10,
    width: '28%'
  },
  skeletonLineWide: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: radii.sm,
    height: 14,
    marginBottom: spacing.sm,
    width: '92%'
  },
  skeletonLineMedium: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: radii.sm,
    height: 14,
    width: '64%'
  }
});
