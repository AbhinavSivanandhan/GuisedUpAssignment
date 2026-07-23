import type { ReactionKind } from '../api/types';

export type ReactionTriggerAction =
  | { type: 'open_tray' }
  | { type: 'close_tray' }
  | { type: 'remove_reaction'; reactionKind: ReactionKind };

export function decideReactionTriggerAction(activeKind: ReactionKind | null, expanded: boolean): ReactionTriggerAction {
  if (activeKind) {
    return { type: 'remove_reaction', reactionKind: activeKind };
  }

  return expanded ? { type: 'close_tray' } : { type: 'open_tray' };
}

export type ReactionOptionAction =
  | { type: 'remove_reaction'; reactionKind: ReactionKind }
  | { type: 'switch_reaction'; reactionKind: ReactionKind };

export function decideReactionOptionAction(activeKind: ReactionKind | null, selectedKind: ReactionKind): ReactionOptionAction {
  return activeKind === selectedKind
    ? { type: 'remove_reaction', reactionKind: selectedKind }
    : { type: 'switch_reaction', reactionKind: selectedKind };
}
