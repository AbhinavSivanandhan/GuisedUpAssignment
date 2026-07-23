import type { ReactionKind } from '../api/types';

export type ReactionOption = {
  kind: ReactionKind;
  label: string;
  symbol: string;
};

export const reactionCatalog: ReactionOption[] = [
  { kind: 'like', label: 'Like', symbol: '👍' },
  { kind: 'support', label: 'Support', symbol: '🤝' },
  { kind: 'good_vibes', label: 'Good vibes', symbol: '✨' }
];
