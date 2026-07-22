import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { Post } from '../api/types';
import { colors, radii, spacing, typography } from '../theme/tokens';
import { relativeTime } from '../utils/time';

type PostCardProps = {
  post: Post;
  reacting: boolean;
  onReact(postId: number): void;
};

export function PostCard({ post, reacting, onReact }: PostCardProps) {
  const authorName = post.author.name ?? 'Guised Up user';

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{authorName.slice(0, 1).toUpperCase()}</Text>
        </View>
        <View style={styles.authorBlock}>
          <Text style={styles.authorName} numberOfLines={1}>
            {authorName}
          </Text>
          <Text style={styles.time}>{relativeTime(post.created_at)}</Text>
        </View>
      </View>

      <Text style={styles.body}>{post.text}</Text>

      {post.image_url ? (
        <View style={styles.imageReference}>
          <Text style={styles.imageText} numberOfLines={1}>
            Image attached
          </Text>
        </View>
      ) : null}

      <View style={styles.actions}>
        <Pressable
          accessibilityRole="button"
          disabled={reacting}
          onPress={() => onReact(post.id)}
          style={({ pressed }) => [
            styles.reactButton,
            pressed && !reacting ? styles.reactButtonPressed : null,
            reacting ? styles.reactButtonDisabled : null
          ]}
        >
          <Text style={styles.reactButtonText}>{reacting ? 'Sending' : 'React'}</Text>
        </Pressable>
        {typeof post.similarity_score === 'number' ? (
          <Text style={styles.searchScore}>Match {Math.round(post.similarity_score * 100)}%</Text>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: 1,
    marginHorizontal: spacing.lg,
    marginVertical: spacing.sm,
    padding: spacing.lg,
    shadowColor: colors.shadow,
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 }
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.md
  },
  avatar: {
    alignItems: 'center',
    backgroundColor: colors.accentSoft,
    borderRadius: 20,
    height: 40,
    justifyContent: 'center',
    width: 40
  },
  avatarText: {
    color: colors.accent,
    fontSize: typography.heading,
    fontWeight: '700'
  },
  authorBlock: {
    flex: 1,
    minWidth: 0
  },
  authorName: {
    color: colors.text,
    fontSize: typography.body,
    fontWeight: '700'
  },
  time: {
    color: colors.muted,
    fontSize: typography.small,
    marginTop: 2
  },
  body: {
    color: colors.text,
    fontSize: typography.body,
    lineHeight: 22
  },
  imageReference: {
    alignSelf: 'flex-start',
    backgroundColor: colors.surfaceMuted,
    borderRadius: radii.sm,
    marginTop: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm
  },
  imageText: {
    color: colors.muted,
    fontSize: typography.small,
    fontWeight: '600'
  },
  actions: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.lg
  },
  reactButton: {
    backgroundColor: colors.accent,
    borderRadius: radii.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm
  },
  reactButtonPressed: {
    opacity: 0.85
  },
  reactButtonDisabled: {
    opacity: 0.6
  },
  reactButtonText: {
    color: colors.surface,
    fontSize: typography.small,
    fontWeight: '700'
  },
  searchScore: {
    color: colors.muted,
    fontSize: typography.small,
    fontWeight: '600'
  }
});
