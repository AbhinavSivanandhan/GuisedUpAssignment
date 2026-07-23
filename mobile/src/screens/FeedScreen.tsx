import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Platform,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View
} from 'react-native';

import { PostCard } from '../components/PostCard';
import { useFeedController } from '../hooks/useFeedController';
import { radii, spacing, typography } from '../theme/tokens';
import type { ThemeColors } from '../theme/tokens';

type FeedScreenProps = {
  theme: ThemeColors;
  onToggleTheme(): void;
};

export function FeedScreen({ theme, onToggleTheme }: FeedScreenProps) {
  const styles = useMemo(() => createStyles(theme), [theme]);
  const {
    state,
    displayedPosts,
    loadNextPage,
    loadPreviousPage,
    refreshFeed,
    retryCurrentOperation,
    updateQuery,
    reactToPost
  } = useFeedController();
  const [searchFocused, setSearchFocused] = useState(false);
  const [openReactionPostId, setOpenReactionPostId] = useState<number | null>(null);
  const emptyTitle = state.mode === 'search' ? 'No matching posts' : 'No posts yet';
  const feedRetainedCount = state.retainedPages.reduce((total, page) => total + page.posts.length, 0);
  const initialLoading = state.initialLoading && feedRetainedCount === 0;
  const showingFeedBehindSearch = state.mode === 'search' && state.searchLoading && state.searchPosts.length === 0;
  const feedPosts = state.retainedPages.flatMap((page) => page.posts);
  const listPosts = showingFeedBehindSearch ? feedPosts : displayedPosts;
  const trimmedQuery = state.query.trim();
  const searchContext = trimmedQuery ? `${state.searchLoading ? 'Searching' : 'Showing matches'} for "${trimmedQuery}"` : null;

  function closeReactionPicker() {
    setOpenReactionPostId(null);
  }

  return (
    <View style={styles.container}>
      <View style={styles.shell}>
        <View style={styles.header}>
          <View style={styles.brandCopy}>
            <Text style={styles.productLabel}>Real Connections</Text>
            <Text style={styles.wordmark}>Guised Up</Text>
            <Text style={styles.statement}>Less polish. More honest signals from people who matter.</Text>
          </View>
          <Pressable
            accessibilityLabel={`Switch to ${theme.mode === 'dark' ? 'light' : 'dark'} theme`}
            accessibilityRole="button"
            onPress={onToggleTheme}
            style={(pressState) => {
              const webState = pressState as { focused?: boolean; hovered?: boolean };

              return [
                styles.themeToggle,
                webState.hovered ? styles.hoveredControl : null,
                webState.focused ? styles.focused : null,
                pressState.pressed ? styles.pressed : null
              ];
            }}
          >
            <Text style={styles.themeToggleText}>{theme.mode === 'dark' ? '☀ Light' : '☾ Dark'}</Text>
          </Pressable>
        </View>

        <View style={[styles.searchSurface, searchFocused ? styles.searchSurfaceFocused : null]}>
          <Text style={styles.searchIcon}>⌕</Text>
          <TextInput
            autoCapitalize="none"
            clearButtonMode="never"
            onBlur={() => setSearchFocused(false)}
            onChangeText={updateQuery}
            onFocus={() => setSearchFocused(true)}
            placeholder="Search real stories from last week"
            placeholderTextColor={theme.textMuted}
            style={styles.search}
            value={state.query}
          />
          {state.searchLoading ? <ActivityIndicator color={theme.primary} size="small" /> : null}
          {trimmedQuery ? (
            <Pressable
              accessibilityLabel="Clear search"
              accessibilityRole="button"
              onPress={() => updateQuery('')}
              style={(pressState) => {
                const webState = pressState as { focused?: boolean; hovered?: boolean };

                return [
                  styles.clearButton,
                  webState.hovered ? styles.hoveredControl : null,
                  webState.focused ? styles.focused : null,
                  pressState.pressed ? styles.pressed : null
                ];
              }}
            >
              <Text style={styles.clearText}>Clear</Text>
            </Pressable>
          ) : null}
        </View>

        {searchContext ? (
          <View style={styles.contextRow}>
            <Text style={styles.contextText}>{searchContext}</Text>
          </View>
        ) : null}

        {state.error ? (
          <View style={styles.error}>
            <View style={styles.errorCopy}>
              <Text style={styles.errorTitle}>Something needs attention</Text>
              <Text style={styles.errorText}>{state.error}</Text>
            </View>
            <Pressable
              accessibilityRole="button"
              onPress={retryCurrentOperation}
              style={(pressState) => [
                styles.retryButton,
                (pressState as { focused?: boolean }).focused ? styles.focusedDanger : null,
                pressState.pressed ? styles.pressed : null
              ]}
            >
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
            initialNumToRender={10}
            maintainVisibleContentPosition={{ minIndexForVisible: 0 }}
            maxToRenderPerBatch={10}
            removeClippedSubviews={Platform.OS !== 'web'}
            windowSize={7}
            keyExtractor={(post) => String(post.id)}
            keyboardShouldPersistTaps="handled"
            ListHeaderComponent={
              state.loadingPrevious ? (
                <View style={styles.topLoading}>
                  <ActivityIndicator color={theme.primary} size="small" />
                  <Text style={styles.footerText}>Loading more</Text>
                </View>
              ) : null
            }
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
              state.loadingNext ? (
                <View style={styles.footerLoading}>
                  <ActivityIndicator color={theme.primary} />
                  <Text style={styles.footerText}>Loading more</Text>
                </View>
              ) : null
            }
            onScroll={({ nativeEvent }) => {
              if (nativeEvent.contentOffset.y < 120) {
                loadPreviousPage();
              }
            }}
            onScrollBeginDrag={closeReactionPicker}
            onEndReached={loadNextPage}
            onEndReachedThreshold={0.35}
            onStartReached={loadPreviousPage}
            onStartReachedThreshold={0.2}
            refreshControl={
              <RefreshControl
                colors={[theme.primary]}
                progressBackgroundColor={theme.surfaceRaised}
                refreshing={state.initialLoading && feedRetainedCount > 0}
                tintColor={theme.primary}
                onRefresh={() => {
                  closeReactionPicker();
                  refreshFeed();
                }}
              />
            }
            renderItem={({ item }) => (
              <PostCard
                onCloseReactionPicker={closeReactionPicker}
                onOpenReactionPicker={(postId) => setOpenReactionPostId(postId)}
                onReact={reactToPost}
                post={item}
                pendingMode={state.pendingReactions[item.id]}
                reactionPickerOpen={openReactionPostId === item.id}
                theme={theme}
              />
            )}
          />
        )}
      </View>
    </View>
  );
}

function createStyles(theme: ThemeColors) {
  return StyleSheet.create({
    container: {
      alignItems: 'center',
      backgroundColor: theme.background,
      flex: 1
    },
    shell: {
      flex: 1,
      maxWidth: 720,
      width: '100%'
    },
    header: {
      alignItems: 'center',
      backgroundColor: theme.background,
      flexDirection: 'row',
      gap: spacing.md,
      justifyContent: 'space-between',
      paddingBottom: spacing.md,
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.lg
    },
    brandCopy: {
      flex: 1,
      minWidth: 0
    },
    productLabel: {
      color: theme.primary,
      fontSize: typography.tiny,
      fontWeight: '800',
      letterSpacing: 0,
      textTransform: 'uppercase'
    },
    wordmark: {
      color: theme.text,
      fontSize: typography.wordmark,
      fontWeight: '900',
      lineHeight: 30
    },
    statement: {
      color: theme.textMuted,
      fontSize: typography.small,
      lineHeight: 18,
      marginTop: spacing.xs
    },
    themeToggle: {
      alignItems: 'center',
      backgroundColor: theme.surfaceRaised,
      borderColor: theme.border,
      borderRadius: radii.lg,
      borderWidth: 1,
      justifyContent: 'center',
      minHeight: 40,
      paddingHorizontal: spacing.md
    },
    themeToggleText: {
      color: theme.text,
      fontSize: typography.small,
      fontWeight: '800'
    },
    searchSurface: {
      alignItems: 'center',
      backgroundColor: theme.surfaceRaised,
      borderColor: theme.border,
      borderRadius: radii.xl,
      borderWidth: 1,
      flexDirection: 'row',
      gap: spacing.sm,
      marginHorizontal: spacing.lg,
      paddingHorizontal: spacing.md,
      boxShadow: `0 6px 16px ${theme.shadow}`,
      elevation: 2
    },
    searchSurfaceFocused: {
      borderColor: theme.primary,
      boxShadow: `0 0 0 3px ${theme.primaryContainer}`
    },
    searchIcon: {
      color: theme.primary,
      fontSize: 19,
      fontWeight: '900'
    },
    search: {
      color: theme.text,
      flex: 1,
      fontSize: typography.body,
      minHeight: 48,
      paddingVertical: spacing.sm
    },
    clearButton: {
      backgroundColor: theme.surfaceSubtle,
      borderColor: 'transparent',
      borderRadius: radii.md,
      borderWidth: 2,
      minHeight: 34,
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs
    },
    clearText: {
      color: theme.primary,
      fontSize: typography.small,
      fontWeight: '800'
    },
    contextRow: {
      minHeight: 34,
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.sm
    },
    contextText: {
      color: theme.textMuted,
      fontSize: typography.small,
      fontWeight: '700'
    },
    error: {
      alignItems: 'center',
      backgroundColor: theme.dangerContainer,
      borderColor: theme.danger,
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
      color: theme.danger,
      fontSize: typography.small,
      fontWeight: '900',
      marginBottom: spacing.xs
    },
    errorText: {
      color: theme.danger,
      fontSize: typography.small
    },
    retryButton: {
      backgroundColor: theme.danger,
      borderColor: 'transparent',
      borderRadius: radii.md,
      borderWidth: 2,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm
    },
    retryText: {
      color: theme.mode === 'dark' ? '#1B100F' : '#FFFFFF',
      fontSize: typography.small,
      fontWeight: '800'
    },
    centerState: {
      alignItems: 'center',
      gap: spacing.sm,
      justifyContent: 'center',
      paddingHorizontal: spacing.xl,
      paddingVertical: 72
    },
    emptyTitle: {
      color: theme.text,
      fontSize: typography.heading,
      fontWeight: '900'
    },
    stateText: {
      color: theme.textMuted,
      fontSize: typography.body,
      lineHeight: 22,
      textAlign: 'center'
    },
    topLoading: {
      alignItems: 'center',
      gap: spacing.xs,
      paddingVertical: spacing.md
    },
    footerLoading: {
      alignItems: 'center',
      gap: spacing.sm,
      paddingVertical: spacing.xl
    },
    footerText: {
      color: theme.textMuted,
      fontSize: typography.small,
      fontWeight: '800'
    },
    listContent: {
      paddingBottom: spacing.xxl,
      paddingTop: spacing.sm
    },
    skeletonGroup: {
      paddingTop: spacing.sm
    },
    skeletonCard: {
      backgroundColor: theme.surfaceRaised,
      borderColor: theme.border,
      borderRadius: radii.xl,
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
      backgroundColor: theme.skeleton,
      borderRadius: 22,
      height: 44,
      width: 44
    },
    skeletonLines: {
      flex: 1,
      gap: spacing.sm
    },
    skeletonLineStrong: {
      backgroundColor: theme.skeleton,
      borderRadius: radii.sm,
      height: 14,
      width: '48%'
    },
    skeletonLineShort: {
      backgroundColor: theme.skeleton,
      borderRadius: radii.sm,
      height: 10,
      width: '28%'
    },
    skeletonLineWide: {
      backgroundColor: theme.skeleton,
      borderRadius: radii.sm,
      height: 14,
      marginBottom: spacing.sm,
      width: '92%'
    },
    skeletonLineMedium: {
      backgroundColor: theme.skeleton,
      borderRadius: radii.sm,
      height: 14,
      width: '64%'
    },
    hoveredControl: {
      borderColor: theme.primary
    },
    focused: {
      borderColor: theme.focusRing,
      boxShadow: `0 0 0 3px ${theme.primaryContainer}`
    },
    focusedDanger: {
      borderColor: theme.focusRing
    },
    pressed: {
      opacity: 0.82
    }
  });
}
