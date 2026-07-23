import { useEffect, useMemo, useRef } from 'react';
import {
  ActivityIndicator,
  Animated,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View
} from 'react-native';

import type { ReactionKind } from '../api/types';
import { reactionCatalog } from '../reactions/catalog';
import type { ReactionOption } from '../reactions/catalog';
import { decideReactionOptionAction, decideReactionTriggerAction } from '../reactions/interaction';
import type { ReactionPendingMode } from '../state/feedReducer';
import { radii, spacing, typography } from '../theme/tokens';
import type { ThemeColors } from '../theme/tokens';

type ReactionControlProps = {
  activeKind: ReactionKind | null;
  controlId: string;
  expanded: boolean;
  pendingMode?: ReactionPendingMode;
  theme: ThemeColors;
  onSelect(kind: ReactionKind): void;
  onOpen(): void;
  onClose(): void;
};

const TRAY_CLOSE_DELAY_MS = 160;

export function ReactionControl({
  activeKind,
  controlId,
  expanded,
  pendingMode,
  theme,
  onSelect,
  onOpen,
  onClose
}: ReactionControlProps) {
  const styles = useMemo(() => createStyles(theme), [theme]);
  const wrapperRef = useRef<View | null>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.96)).current;
  const activeOption = reactionCatalog.find((option) => option.kind === activeKind) ?? null;
  const disabled = Boolean(pendingMode);
  const triggerSymbol = activeOption?.symbol ?? reactionCatalog[0]?.symbol ?? '';
  const triggerLabel = activeOption?.label ?? 'React';

  useEffect(() => {
    if (!expanded) {
      opacity.setValue(0);
      scale.setValue(0.96);
      return;
    }

    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 120,
        useNativeDriver: Platform.OS !== 'web'
      }),
      Animated.spring(scale, {
        toValue: 1,
        friction: 8,
        tension: 140,
        useNativeDriver: Platform.OS !== 'web'
      })
    ]).start();
  }, [expanded, opacity, scale]);

  useEffect(() => {
    if (!expanded || Platform.OS !== 'web') {
      return undefined;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    const onPointerDown = (event: PointerEvent) => {
      const target = event.target;
      if (target instanceof Element && target.closest(`[data-testid="${controlId}"]`)) {
        return;
      }

      onClose();
    };

    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('pointerdown', onPointerDown);

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('pointerdown', onPointerDown);
    };
  }, [controlId, expanded, onClose]);

  function clearCloseTimer() {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  }

  function scheduleClose() {
    clearCloseTimer();
    closeTimerRef.current = setTimeout(onClose, TRAY_CLOSE_DELAY_MS);
  }

  function selectOption(option: ReactionOption) {
    if (disabled) {
      return;
    }

    const action = decideReactionOptionAction(activeKind, option.kind);
    onSelect(action.reactionKind);
    onClose();
  }

  return (
    <View
      ref={wrapperRef}
      style={styles.wrapper}
      testID={controlId}
      onPointerEnter={clearCloseTimer}
      onPointerLeave={scheduleClose}
    >
      {expanded ? (
        <Animated.View
          accessibilityRole="menu"
          style={[
            styles.tray,
            {
              opacity,
              transform: [{ scale }]
            }
          ]}
        >
          {reactionCatalog.map((option) => {
            const selected = option.kind === activeKind;

            return (
              <Pressable
                accessibilityLabel={selected ? `Remove ${option.label} reaction` : `${option.label} reaction`}
                accessibilityRole="menuitem"
                accessibilityState={{ selected }}
                disabled={disabled}
                key={option.kind}
                onHoverIn={clearCloseTimer}
                onHoverOut={scheduleClose}
                onPress={() => selectOption(option)}
                style={(pressState) => {
                  const webState = pressState as { focused?: boolean; hovered?: boolean };

                  return [
                    styles.trayOption,
                    selected ? styles.trayOptionSelected : null,
                    webState.hovered ? styles.trayOptionHover : null,
                    pressState.pressed ? styles.pressed : null,
                    webState.focused ? styles.focused : null,
                    disabled ? styles.disabled : null
                  ];
                }}
              >
                <Text style={styles.trayEmoji}>{option.symbol}</Text>
                <Text style={[styles.trayLabel, selected ? styles.trayLabelSelected : null]}>{option.label}</Text>
              </Pressable>
            );
          })}
        </Animated.View>
      ) : null}

      <Pressable
        accessibilityLabel={expanded ? 'Close reaction choices' : 'Open reaction choices'}
        accessibilityRole="button"
        accessibilityState={{ expanded, disabled }}
        disabled={disabled}
        onHoverIn={() => {
          clearCloseTimer();
          onOpen();
        }}
        onHoverOut={scheduleClose}
        onLongPress={onOpen}
        onPress={() => {
          clearCloseTimer();

          const action = decideReactionTriggerAction(activeKind, expanded);
          if (action.type === 'remove_reaction') {
            onSelect(action.reactionKind);
            onClose();
            return;
          }

          action.type === 'open_tray' ? onOpen() : onClose();
        }}
        style={(pressState) => {
          const webState = pressState as { focused?: boolean; hovered?: boolean };

          return [
            styles.trigger,
            activeOption ? styles.triggerActive : null,
            webState.hovered ? styles.triggerHover : null,
            pressState.pressed ? styles.pressed : null,
            webState.focused ? styles.focused : null,
            disabled ? styles.disabled : null
          ];
        }}
      >
        {pendingMode ? <ActivityIndicator color={theme.primary} size="small" /> : <Text style={styles.triggerEmoji}>{triggerSymbol}</Text>}
        <Text style={[styles.triggerText, activeOption ? styles.triggerTextActive : null]}>
          {pendingMode === 'reacting' ? 'Reacting...' : pendingMode === 'removing' ? 'Removing...' : triggerLabel}
        </Text>
      </Pressable>
    </View>
  );
}

function createStyles(theme: ThemeColors) {
  return StyleSheet.create({
    wrapper: {
      alignSelf: 'flex-start',
      minHeight: 44,
      position: 'relative',
      zIndex: 40
    },
    tray: {
      alignItems: 'center',
      backgroundColor: theme.surfaceRaised,
      borderColor: theme.border,
      borderRadius: radii.xl,
      borderWidth: 1,
      bottom: 48,
      boxShadow: `0 12px 28px ${theme.shadow}`,
      elevation: 8,
      flexDirection: 'row',
      gap: spacing.xs,
      left: 0,
      padding: spacing.xs,
      position: 'absolute',
      zIndex: 60
    },
    trayOption: {
      alignItems: 'center',
      borderColor: 'transparent',
      borderRadius: radii.lg,
      borderWidth: 2,
      gap: 2,
      justifyContent: 'center',
      minHeight: 54,
      minWidth: 64,
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs
    },
    trayOptionSelected: {
      backgroundColor: theme.primaryContainer,
      borderColor: theme.primary
    },
    trayOptionHover: {
      backgroundColor: theme.surfaceSubtle
    },
    trayEmoji: {
      fontSize: 20,
      lineHeight: 24
    },
    trayLabel: {
      color: theme.textMuted,
      fontSize: typography.tiny,
      fontWeight: '700'
    },
    trayLabelSelected: {
      color: theme.primary
    },
    trigger: {
      alignItems: 'center',
      backgroundColor: theme.surfaceSubtle,
      borderColor: theme.border,
      borderRadius: radii.lg,
      borderWidth: 1,
      flexDirection: 'row',
      gap: spacing.xs,
      minHeight: 44,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm
    },
    triggerActive: {
      backgroundColor: theme.primaryContainer,
      borderColor: theme.primary
    },
    triggerHover: {
      borderColor: theme.primary
    },
    triggerEmoji: {
      fontSize: 18,
      lineHeight: 22
    },
    triggerText: {
      color: theme.text,
      fontSize: typography.small,
      fontWeight: '800'
    },
    triggerTextActive: {
      color: theme.primary
    },
    pressed: {
      opacity: 0.82,
      transform: [{ scale: 0.98 }]
    },
    focused: {
      borderColor: theme.focusRing,
      boxShadow: `0 0 0 3px ${theme.primaryContainer}`
    },
    disabled: {
      opacity: 0.62
    }
  });
}
