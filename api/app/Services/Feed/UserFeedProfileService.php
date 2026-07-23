<?php

namespace App\Services\Feed;

use App\Jobs\RebuildUserFeedProfile;
use App\Models\User;
use App\Models\UserFeedProfile;
use App\Services\PgVector;
use Illuminate\Support\Facades\Log;

class UserFeedProfileService
{
    public function __construct(private readonly UserFeedProfileCalculator $calculator)
    {
    }

    public function forRanking(User $user): UserFeedProfileData
    {
        $profile = UserFeedProfile::query()->where('user_id', $user->id)->first();
        $latestInteractionId = $this->latestInteractionId($user);

        if ($profile === null || $this->isStale($profile, $latestInteractionId)) {
            $this->dispatchRebuild($user->id);
        }

        if ($profile === null) {
            return UserFeedProfileData::coldStart();
        }

        return new UserFeedProfileData(
            interestVector: $profile->interest_embedding ? VectorMath::parse((string) $profile->interest_embedding) : null,
            relationshipScores: array_map('floatval', $profile->relationship_scores ?? []),
            evidenceCount: (int) $profile->evidence_count,
            sourceInteractionId: $profile->source_interaction_id,
        );
    }

    public function rebuildNow(User $user): UserFeedProfileData
    {
        $interactions = $user->interactions()
            ->with('post')
            ->orderBy('id')
            ->get();

        $data = $this->calculator->calculate($interactions);
        $this->storeProfile($user, $data);

        return $data;
    }

    public function dispatchRebuild(int $userId): void
    {
        try {
            RebuildUserFeedProfile::dispatch($userId)
                ->onConnection(config('feed.profile_rebuild_connection', 'deferred'))
                ->afterResponse();
        } catch (\Throwable $exception) {
            Log::warning('User feed profile rebuild dispatch failed.', [
                'user_id' => $userId,
                'message' => $exception->getMessage(),
            ]);
        }
    }

    private function storeProfile(User $user, UserFeedProfileData $data): void
    {
        $existing = UserFeedProfile::query()->where('user_id', $user->id)->first();
        if (
            $existing !== null
            && $existing->source_interaction_id !== null
            && $data->sourceInteractionId !== null
            && $existing->source_interaction_id > $data->sourceInteractionId
        ) {
            return;
        }

        $payload = [
            'interest_embedding' => $data->interestVector ? PgVector::literal($data->interestVector) : null,
            'relationship_scores' => $data->relationshipScores,
            'evidence_count' => $data->evidenceCount,
            'source_interaction_id' => $data->sourceInteractionId,
            'computed_at' => now(),
        ];

        if ($existing) {
            $existing->fill($payload)->save();

            return;
        }

        $user->feedProfiles()->create($payload);
    }

    private function latestInteractionId(User $user): ?int
    {
        return $user->interactions()
            ->latest('id')
            ->value('id');
    }

    private function isStale(UserFeedProfile $profile, ?int $latestInteractionId): bool
    {
        if ($latestInteractionId === null) {
            return false;
        }

        return $profile->source_interaction_id === null
            || $profile->source_interaction_id < $latestInteractionId;
    }
}
