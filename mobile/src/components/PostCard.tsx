import { useEffect, useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import type { Post } from '../api/types';
import { colors, radii, spacing, typography } from '../theme/tokens';
import { relativeTime } from '../utils/time';

type PostCardProps = {
  post: Post;
  reacting: boolean;
  reacted: boolean;
  onReact(postId: number): void;
};

const avatarColors = ['#DCEFE7', '#F4E2BE', '#E9D9F2', '#D8E6F3', '#F6D8CE'];

function avatarColorFor(id: number): string {
  return avatarColors[Math.abs(id) % avatarColors.length];
}

function canLoadImageUrl(value: string | null): boolean {
  if (!value) {
    return false;
  }

  try {
    const url = new URL(value);
    return url.protocol.startsWith('http') && !url.hostname.endsWith('.test');
  } catch {
    return false;
  }
}

export function PostCard({ post, reacting, reacted, onReact }: PostCardProps) {
  const authorName = post.author.name ?? 'Guised Up user';
  const reactionLabel = reacting ? 'Sending...' : reacted ? 'Reacted' : 'React';
  const [imageFailed, setImageFailed] = useState(false);
  const canLoadImage = canLoadImageUrl(post.image_url);

  useEffect(() => {
    setImageFailed(false);
  }, [post.image_url]);

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={[styles.avatar, { backgroundColor: avatarColorFor(post.author.id) }]}>
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

      {post.image_url && canLoadImage && !imageFailed ? (
        <Image
          accessibilityLabel="Post image"
          onError={() => setImageFailed(true)}
          resizeMode="cover"
          source={{ uri: post.image_url }}
          style={styles.image}
        />
      ) : post.image_url ? (
        <View style={styles.imageFallback}>
          <Text style={styles.imageFallbackTitle}>Image unavailable</Text>
          <Text style={styles.imageFallbackText} numberOfLines={1}>
            The post is still available.
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
            reacting ? styles.reactButtonDisabled : null,
            reacted ? styles.reactButtonDone : null
          ]}
        >
          <Text style={[styles.reactButtonText, reacted ? styles.reactButtonDoneText : null]}>{reactionLabel}</Text>
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
    borderRadius: radii.lg,
    borderWidth: 1,
    marginHorizontal: spacing.md,
    marginVertical: spacing.sm,
    padding: spacing.lg,
    boxShadow: '0 8px 22px rgba(30, 27, 24, 0.08)',
    elevation: 2
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
    color: colors.accentDark,
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
    fontSize: 16,
    lineHeight: 24
  },
  image: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: radii.md,
    height: 210,
    marginTop: spacing.md,
    width: '100%'
  },
  imageFallback: {
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: 1,
    marginTop: spacing.md,
    padding: spacing.lg
  },
  imageFallbackTitle: {
    color: colors.inkSoft,
    fontSize: typography.small,
    fontWeight: '800'
  },
  imageFallbackText: {
    color: colors.muted,
    fontSize: typography.small,
    marginTop: spacing.xs
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
  reactButtonDone: {
    backgroundColor: colors.accentSoft,
    borderColor: colors.accent,
    borderWidth: 1
  },
  reactButtonText: {
    color: colors.surface,
    fontSize: typography.small,
    fontWeight: '700'
  },
  reactButtonDoneText: {
    color: colors.accentDark
  },
  searchScore: {
    color: colors.muted,
    fontSize: typography.small,
    fontWeight: '600'
  }
});
