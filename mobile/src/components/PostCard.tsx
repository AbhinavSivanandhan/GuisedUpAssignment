import { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Image, Pressable, StyleSheet, Text, View } from 'react-native';

import type { Post, ReactionKind } from '../api/types';
import { ReactionControl } from './ReactionControl';
import { formatRankingDebug } from '../feed/rankingDebug';
import type { ReactionPendingMode } from '../state/feedReducer';
import { radii, spacing, typography } from '../theme/tokens';
import type { ThemeColors } from '../theme/tokens';
import { relativeTime } from '../utils/time';

type PostCardProps = {
  post: Post;
  pendingMode?: ReactionPendingMode;
  reactionPickerOpen: boolean;
  showRankingDebug?: boolean;
  theme: ThemeColors;
  onReact(postId: number, reactionKind: ReactionKind): void;
  onOpenReactionPicker(postId: number): void;
  onCloseReactionPicker(): void;
};

const COLLAPSED_LINES = 5;
const BODY_LINE_HEIGHT = 24;
const avatarColors = ['#DCEFE7', '#F4E2BE', '#DCE8D4', '#D8E6F3', '#F6D8CE'];

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

export function PostCard({
  post,
  pendingMode,
  reactionPickerOpen,
  showRankingDebug = false,
  theme,
  onReact,
  onOpenReactionPicker,
  onCloseReactionPicker
}: PostCardProps) {
  const styles = useMemo(() => createStyles(theme), [theme]);
  const authorName = post.author.name ?? 'Guised Up user';
  const activeKind = post.viewer_reaction_kind ?? (post.viewer_has_reacted ? 'like' : null);
  const [imageFailed, setImageFailed] = useState(false);
  const [avatarFailed, setAvatarFailed] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [fullLineCount, setFullLineCount] = useState<number | null>(null);
  const [measuredPostKey, setMeasuredPostKey] = useState<string | null>(null);
  const [cardHovered, setCardHovered] = useState(false);
  const [cardTouched, setCardTouched] = useState(false);
  const [cardFocusWithin, setCardFocusWithin] = useState(false);
  const cardTone = useRef(new Animated.Value(0)).current;
  const postKey = `${post.id}:${post.text}`;
  const canLoadImage = canLoadImageUrl(post.image_url);
  const canLoadAvatar = canLoadImageUrl(post.author.avatar_url ?? null);
  const canToggleText = fullLineCount !== null && fullLineCount > COLLAPSED_LINES;
  const rankingDebug =
    showRankingDebug && typeof post.similarity_score !== 'number' && post.ranking_debug ? post.ranking_debug : null;
  const cardInteractive = cardHovered || cardTouched || cardFocusWithin;

  useEffect(() => {
    setImageFailed(false);
  }, [post.image_url]);

  useEffect(() => {
    setAvatarFailed(false);
  }, [post.author.avatar_url]);

  useEffect(() => {
    setExpanded(false);
    setFullLineCount(null);
    setMeasuredPostKey(null);
  }, [post.id, post.text]);

  useEffect(() => {
    Animated.timing(cardTone, {
      toValue: cardInteractive ? 1 : 0,
      duration: 140,
      useNativeDriver: false
    }).start();
  }, [cardInteractive, cardTone]);

  function recordFullTextLayout(lineCount: number) {
    if (measuredPostKey === postKey) {
      return;
    }

    setFullLineCount(lineCount);
    setMeasuredPostKey(postKey);
  }

  return (
    <Animated.View
      onBlur={() => setCardFocusWithin(false)}
      onFocus={() => setCardFocusWithin(true)}
      onPointerEnter={() => setCardHovered(true)}
      onPointerLeave={() => setCardHovered(false)}
      onTouchCancel={() => setCardTouched(false)}
      onTouchEnd={() => setCardTouched(false)}
      onTouchStart={() => setCardTouched(true)}
      style={[
        styles.card,
        {
          backgroundColor: cardTone.interpolate({
            inputRange: [0, 1],
            outputRange: [theme.surfaceRaised, theme.surface]
          })
        },
        cardInteractive ? styles.cardInteractive : null
      ]}
    >
      <Animated.View pointerEvents="none" style={[styles.cardHalo, { opacity: cardTone }]} />
      <View style={styles.header}>
        {canLoadAvatar && !avatarFailed ? (
          <Image
            accessibilityLabel={`${authorName} avatar`}
            onError={() => setAvatarFailed(true)}
            source={{ uri: post.author.avatar_url ?? '' }}
            style={styles.avatarImage}
          />
        ) : (
          <View style={[styles.avatar, { backgroundColor: avatarColorFor(post.author.id) }]}>
            <Text style={styles.avatarText}>{authorName.slice(0, 1).toUpperCase()}</Text>
          </View>
        )}
        <View style={styles.authorBlock}>
          <Text style={styles.authorName} numberOfLines={1}>
            {authorName}
          </Text>
          <Text style={styles.time}>{relativeTime(post.created_at)}</Text>
        </View>
      </View>

      <Text
        onLayout={
          measuredPostKey !== postKey
            ? (event) => recordFullTextLayout(Math.round(event.nativeEvent.layout.height / BODY_LINE_HEIGHT))
            : undefined
        }
        onTextLayout={measuredPostKey !== postKey ? (event) => recordFullTextLayout(event.nativeEvent.lines.length) : undefined}
        style={styles.body}
        numberOfLines={measuredPostKey === postKey && !expanded && canToggleText ? COLLAPSED_LINES : undefined}
      >
        {post.text}
      </Text>
      {canToggleText ? (
        <Pressable
          accessibilityLabel={expanded ? 'Show less post text' : 'Read full post text'}
          accessibilityRole="button"
          onPress={() => setExpanded((value) => !value)}
          style={(pressState) => [
            styles.readMore,
            (pressState as { focused?: boolean }).focused ? styles.focused : null,
            pressState.pressed ? styles.pressed : null
          ]}
        >
          <Text style={styles.readMoreText}>{expanded ? 'Show less' : 'Read more'}</Text>
        </Pressable>
      ) : null}

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
            The post is still here.
          </Text>
        </View>
      ) : null}

      {rankingDebug ? <RankingDebugStrip debug={rankingDebug} styles={styles} /> : null}

      <View style={styles.actions}>
        <ReactionControl
          activeKind={activeKind}
          controlId={`reaction-control-${post.id}`}
          expanded={reactionPickerOpen}
          onClose={onCloseReactionPicker}
          onOpen={() => onOpenReactionPicker(post.id)}
          onSelect={(kind) => onReact(post.id, kind)}
          pendingMode={pendingMode}
          theme={theme}
        />
        {typeof post.similarity_score === 'number' ? (
          <Text style={styles.searchScore}>Match {Math.round(post.similarity_score * 100)}%</Text>
        ) : null}
      </View>
    </Animated.View>
  );
}

type RankingDebugStripProps = {
  debug: NonNullable<Post['ranking_debug']>;
  styles: ReturnType<typeof createStyles>;
};

function RankingDebugStrip({ debug, styles }: RankingDebugStripProps) {
  const display = formatRankingDebug(debug);

  return (
    <View accessibilityLabel={display.accessibilityLabel} accessible style={styles.scoreStrip}>
      <Text style={styles.scoreStripTitle}>{display.title}</Text>
      <View style={styles.scoreStripRow}>
        <Text style={styles.scoreStripText}>{display.firstRow}</Text>
      </View>
      <View style={styles.scoreStripRow}>
        <Text style={styles.scoreStripText}>{display.secondRow}</Text>
      </View>
    </View>
  );
}

function createStyles(theme: ThemeColors) {
  return StyleSheet.create({
    card: {
      backgroundColor: theme.surfaceRaised,
      borderColor: theme.border,
      borderRadius: radii.xl,
      borderWidth: 1,
      marginHorizontal: spacing.md,
      marginVertical: spacing.sm,
      overflow: 'visible',
      padding: spacing.lg,
      position: 'relative',
      boxShadow: `0 8px 20px ${theme.shadow}`,
      elevation: 2,
      zIndex: 1
    },
    cardHalo: {
      borderRadius: radii.xl,
      bottom: -2,
      boxShadow: `0 12px 28px ${theme.shadow}`,
      left: -2,
      position: 'absolute',
      right: -2,
      top: -2
    },
    cardInteractive: {
      boxShadow: `0 10px 24px ${theme.shadow}`,
      elevation: 3
    },
    header: {
      alignItems: 'center',
      flexDirection: 'row',
      gap: spacing.md,
      marginBottom: spacing.md
    },
    avatar: {
      alignItems: 'center',
      borderColor: theme.border,
      borderRadius: 22,
      borderWidth: 1,
      height: 44,
      justifyContent: 'center',
      width: 44
    },
    avatarImage: {
      backgroundColor: theme.surfaceSubtle,
      borderRadius: 22,
      height: 44,
      width: 44
    },
    avatarText: {
      color: '#184837',
      fontSize: typography.heading,
      fontWeight: '800'
    },
    authorBlock: {
      flex: 1,
      minWidth: 0
    },
    authorName: {
      color: theme.text,
      fontSize: typography.body,
      fontWeight: '800'
    },
    time: {
      color: theme.textMuted,
      fontSize: typography.small,
      marginTop: 2
    },
    body: {
      color: theme.text,
      fontSize: 16,
      lineHeight: BODY_LINE_HEIGHT
    },
    readMore: {
      alignSelf: 'flex-start',
      borderColor: 'transparent',
      borderRadius: radii.sm,
      borderWidth: 2,
      marginTop: spacing.sm,
      minHeight: 36,
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs
    },
    readMoreText: {
      color: theme.primary,
      fontSize: typography.small,
      fontWeight: '800'
    },
    image: {
      backgroundColor: theme.surfaceSubtle,
      borderRadius: radii.lg,
      height: 220,
      marginTop: spacing.md,
      width: '100%'
    },
    imageFallback: {
      backgroundColor: theme.surfaceSubtle,
      borderColor: theme.border,
      borderRadius: radii.lg,
      borderWidth: 1,
      marginTop: spacing.md,
      padding: spacing.lg
    },
    imageFallbackTitle: {
      color: theme.text,
      fontSize: typography.small,
      fontWeight: '800'
    },
    imageFallbackText: {
      color: theme.textMuted,
      fontSize: typography.small,
      marginTop: spacing.xs
    },
    actions: {
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: spacing.lg,
      overflow: 'visible',
      zIndex: 20
    },
    scoreStrip: {
      alignSelf: 'stretch',
      backgroundColor: theme.surfaceSubtle,
      borderColor: theme.border,
      borderRadius: radii.md,
      borderWidth: 1,
      gap: spacing.xs,
      marginTop: spacing.md,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm
    },
    scoreStripTitle: {
      color: theme.text,
      fontSize: typography.tiny,
      fontWeight: '800'
    },
    scoreStripRow: {
      alignItems: 'center',
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.xs
    },
    scoreStripText: {
      color: theme.textMuted,
      fontSize: typography.tiny,
      fontWeight: '700'
    },
    searchScore: {
      color: theme.textMuted,
      fontSize: typography.small,
      fontWeight: '700',
      paddingTop: spacing.sm
    },
    focused: {
      borderColor: theme.focusRing,
      boxShadow: `0 0 0 3px ${theme.primaryContainer}`
    },
    pressed: {
      opacity: 0.82
    }
  });
}
