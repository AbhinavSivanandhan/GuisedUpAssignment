import type { FeedMode } from '../state/feedReducer';
import type { Post, RankingDebug } from '../api/types';

export type RankingDebugDisplay = {
  title: string;
  firstRow: string;
  secondRow: string;
  accessibilityLabel: string;
};

export function shouldShowFeedRankingDebug(post: Post, developerMode: boolean, mode: FeedMode): boolean {
  return developerMode && mode === 'feed' && typeof post.similarity_score !== 'number' && Boolean(post.ranking_debug);
}

export function formatRankingDebug(debug: RankingDebug): RankingDebugDisplay {
  const components = debug.components;

  return {
    title: `Rank #${debug.rank} · Final ${percent(debug.final_score, 1)}%`,
    firstRow: [
      `A ${percent(components.authenticity.score)}×${percent(components.authenticity.weight)}%=${contribution(components.authenticity.contribution)}`,
      `R ${percent(components.relationship_depth.score)}×${percent(components.relationship_depth.weight)}%=${contribution(components.relationship_depth.contribution)}`
    ].join(' · '),
    secondRow: [
      `S ${percent(components.semantic_similarity.score)}×${percent(components.semantic_similarity.weight)}%=${contribution(components.semantic_similarity.contribution)}`,
      `T ${percent(components.time_decay.score)}×${percent(components.time_decay.weight)}%=${contribution(components.time_decay.contribution)}`
    ].join(' · '),
    accessibilityLabel: [
      `Ranking debug: rank ${debug.rank}`,
      `final score ${percent(debug.final_score, 1)} percent`,
      `authenticity score ${percent(components.authenticity.score, 1)} percent, weight ${percent(components.authenticity.weight, 1)} percent, contribution ${contribution(components.authenticity.contribution)} percentage points`,
      `relationship depth score ${percent(components.relationship_depth.score, 1)} percent, weight ${percent(components.relationship_depth.weight, 1)} percent, contribution ${contribution(components.relationship_depth.contribution)} percentage points`,
      `semantic similarity score ${percent(components.semantic_similarity.score, 1)} percent, weight ${percent(components.semantic_similarity.weight, 1)} percent, contribution ${contribution(components.semantic_similarity.contribution)} percentage points`,
      `time decay score ${percent(components.time_decay.score, 1)} percent, weight ${percent(components.time_decay.weight, 1)} percent, contribution ${contribution(components.time_decay.contribution)} percentage points`
    ].join('. ')
  };
}

function percent(value: number, digits = 0): string {
  return (value * 100).toFixed(digits);
}

function contribution(value: number): string {
  return (value * 100).toFixed(1);
}
