<?php

namespace App\Jobs;

use App\Models\User;
use App\Services\Feed\UserFeedProfileService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldBeUnique;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class RebuildUserFeedProfile implements ShouldQueue, ShouldBeUnique
{
    use Dispatchable;
    use InteractsWithQueue;
    use Queueable;
    use SerializesModels;

    public int $uniqueFor = 300;

    public function __construct(public readonly int $userId)
    {
    }

    public function uniqueId(): string
    {
        return 'user-feed-profile:'.$this->userId;
    }

    public function handle(UserFeedProfileService $profiles): void
    {
        $lock = Cache::lock($this->uniqueId(), 300);

        if (! $lock->get()) {
            return;
        }

        try {
            $user = User::query()->find($this->userId);
            if ($user !== null) {
                $profiles->rebuildNow($user);
            }
        } catch (\Throwable $exception) {
            Log::warning('User feed profile rebuild failed.', [
                'user_id' => $this->userId,
                'message' => $exception->getMessage(),
            ]);
        } finally {
            $lock->release();
        }
    }
}
