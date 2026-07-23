import type { InteractionSource } from '../api/types';

export const QUALIFIED_VIEW_VISIBLE_PERCENT = 50;
export const QUALIFIED_VIEW_MINIMUM_MS = 1500;

export function qualifiedViewKey(source: InteractionSource, searchEventId: number | null, postId: number): string {
  return `${source}:${searchEventId ?? 'none'}:${postId}`;
}

export function uniqueQualifiedPostIds(items: Array<{ item?: unknown }>): number[] {
  const seen = new Set<number>();
  const ids: number[] = [];

  for (const viewable of items) {
    const item = viewable.item as { id?: unknown } | null | undefined;
    const id = item?.id;
    if (typeof id === 'number' && !seen.has(id)) {
      seen.add(id);
      ids.push(id);
    }
  }

  return ids;
}
