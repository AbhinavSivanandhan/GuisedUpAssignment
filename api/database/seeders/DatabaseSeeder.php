<?php

namespace Database\Seeders;

use App\Models\Post;
use App\Models\User;
use App\Services\EmbeddingClient;
use App\Services\PgVector;
use Carbon\CarbonImmutable;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $embeddingClient = app(EmbeddingClient::class);

        $alex = User::query()->updateOrCreate(
            ['email' => 'alex@example.test'],
            [
                'name' => 'Alex Rivera',
                'avatar_url' => 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=160&q=80',
                'password' => Hash::make('password'),
            ]
        );

        $sam = User::query()->updateOrCreate(
            ['email' => 'sam@example.test'],
            [
                'name' => 'Sam Chen',
                'avatar_url' => 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=160&q=80',
                'password' => Hash::make('password'),
            ]
        );

        $authors = collect([
            ['name' => 'Maya Iyer', 'email' => 'maya@example.test', 'avatar_url' => 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=160&q=80'],
            ['name' => 'Noah Brooks', 'email' => 'noah@example.test', 'avatar_url' => 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=160&q=80'],
            ['name' => 'Priya Shah', 'email' => 'priya@example.test', 'avatar_url' => 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=160&q=80'],
            ['name' => 'Leo Martinez', 'email' => 'leo@example.test', 'avatar_url' => 'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?auto=format&fit=crop&w=160&q=80'],
            ['name' => 'Hannah Kim', 'email' => 'hannah@example.test', 'avatar_url' => 'https://images.unsplash.com/photo-1548142813-c348350df52b?auto=format&fit=crop&w=160&q=80'],
            ['name' => 'Owen Patel', 'email' => 'owen@example.test', 'avatar_url' => 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=160&q=80'],
            ['name' => 'Nina Rossi', 'email' => 'nina@example.test', 'avatar_url' => 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=160&q=80'],
            ['name' => 'Jordan Lee', 'email' => 'jordan@example.test', 'avatar_url' => null],
            ['name' => 'Ari Morgan', 'email' => 'ari@example.test', 'avatar_url' => 'https://i.pravatar.cc/160?img=12'],
            ['name' => 'Talia Bennett', 'email' => 'talia@example.test', 'avatar_url' => 'https://i.pravatar.cc/160?img=47'],
            ['name' => 'Dev Kapoor', 'email' => 'dev@example.test', 'avatar_url' => 'https://i.pravatar.cc/160?img=33'],
            ['name' => 'Mina Torres', 'email' => 'mina@example.test', 'avatar_url' => 'https://i.pravatar.cc/160?img=25'],
        ])->map(fn (array $user): User => User::query()->updateOrCreate(
            ['email' => $user['email']],
            [
                'name' => $user['name'],
                'avatar_url' => $user['avatar_url'],
                'password' => Hash::make('password'),
            ]
        ))->values();

        $topics = [
            'funny travel stories from last week about missed ferries, kind strangers, and honest detours',
            'quiet coffee walks where two friends admitted the week felt heavier than it looked online',
            'neighborhood cooking night with imperfect dumplings, shared playlists, and real laughter',
            'morning run reflections about showing up slowly instead of pretending everything is polished',
            'book club notes on friendship, awkward first messages, and staying curious',
            'rainy train platform conversation that turned a delayed commute into a real check-in',
            'family recipe experiment with burnt edges, good stories, and no curated highlight reel',
            'small apartment garden update with crooked basil, patient neighbors, and practical advice',
            'late-night study group recap about asking for help before the deadline panic',
            'weekend museum visit where the best part was talking honestly over street food',
        ];

        $images = [
            'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80',
            'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1200&q=80',
            'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80',
            'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1200&q=80',
            'https://picsum.photos/seed/guisedup-demo-01/1200/800',
            'https://picsum.photos/seed/guisedup-demo-02/1200/800',
            'https://picsum.photos/seed/guisedup-demo-03/1200/800',
            null,
            null,
        ];

        $baseTime = CarbonImmutable::now();

        for ($index = 1; $index <= 130; $index++) {
            $author = $authors[($index - 1) % $authors->count()];
            $topic = $topics[($index - 1) % count($topics)];
            $longTail = $index % 9 === 0
                ? ' This one ran long because the useful part was not the event itself, but the messy follow-up: who checked in the next morning, who remembered the tiny detail, and who made space for a real answer instead of a polished caption.'
                : '';
            $text = sprintf('DEMO_SEED_20260723 %03d: %s.%s', $index, $topic, $longTail);
            $imageUrl = $index === 120
                ? 'https://example.test/controlled-broken-demo-image.jpg'
                : $images[($index - 1) % count($images)];
            $analysis = $embeddingClient->analyze($text, $imageUrl);
            $createdAt = $baseTime->subHours($index * 2);

            $this->upsertSeededPost($author, $text, $imageUrl, $analysis, $createdAt);
        }

        $featuredPosts = [
            [
                'author' => $alex,
                'text' => 'FEATURED_SEED_20260723 001: Took the long way home after dinner and found three neighbors sitting on the curb comparing terrible travel luck. Nobody had a perfect story, which made it easier to stay.',
                'image_url' => 'https://picsum.photos/seed/guisedup-feature-01/1200/800',
                'minutes_ago' => 22,
            ],
            [
                'author' => $sam,
                'text' => 'FEATURED_SEED_20260723 002: The funniest travel story from last week was missing the bus, finding a family-run noodle shop, and learning that every good detour needs someone willing to laugh first.',
                'image_url' => 'https://picsum.photos/seed/guisedup-feature-02/1200/800',
                'minutes_ago' => 44,
            ],
            [
                'author' => $authors[0],
                'text' => 'FEATURED_SEED_20260723 003: Volunteering at the community pantry was mostly quiet sorting, but the real moment was two strangers swapping dinner ideas over dented tomato cans.',
                'image_url' => 'https://picsum.photos/seed/guisedup-feature-03/1200/800',
                'minutes_ago' => 71,
            ],
            [
                'author' => $authors[1],
                'text' => 'FEATURED_SEED_20260723 004: My dog turned a five-minute walk into a forty-minute neighborhood check-in. He found a tennis ball; I found out Malik finally got the bakery job.',
                'image_url' => 'https://picsum.photos/seed/guisedup-feature-04/1200/800',
                'minutes_ago' => 93,
            ],
            [
                'author' => $authors[2],
                'text' => 'FEATURED_SEED_20260723 005: We tried making dosas for six people with one stubborn pan. They came out uneven, folded badly, and somehow made everyone talk more honestly than a restaurant would have.',
                'image_url' => 'https://picsum.photos/seed/guisedup-feature-05/1200/800',
                'minutes_ago' => 128,
            ],
            [
                'author' => $authors[3],
                'text' => 'FEATURED_SEED_20260723 006: Text-only because the useful part was not photographable: three friends admitting they were all tired of pretending July was easy.',
                'image_url' => null,
                'minutes_ago' => 183,
            ],
            [
                'author' => $authors[4],
                'text' => 'FEATURED_SEED_20260723 007: A little food-truck line turned into a shared table, then into a plan to try the library chess night. Low stakes, very real.',
                'image_url' => 'https://picsum.photos/seed/guisedup-feature-06/1200/800',
                'minutes_ago' => 238,
            ],
            [
                'author' => $authors[5],
                'text' => 'FEATURED_SEED_20260723 008: Fixed my bike badly, asked for help, and ended up learning more about my block than about brake cables.',
                'image_url' => null,
                'minutes_ago' => 311,
            ],
            [
                'author' => $authors[6],
                'text' => 'FEATURED_SEED_20260723 009: Our pottery class cups looked like tiny weather events, but the table kept getting louder in the best way. Nobody won; everyone stayed late.',
                'image_url' => 'https://picsum.photos/seed/guisedup-feature-07/1200/800',
                'minutes_ago' => 402,
            ],
            [
                'author' => $authors[7],
                'text' => 'FEATURED_SEED_20260723 010: The trip was supposed to be a clean itinerary. Instead, we lost a train ticket, shared mango slices with two backpackers, and got the better version of the day.',
                'image_url' => 'https://picsum.photos/seed/guisedup-feature-08/1200/800',
                'minutes_ago' => 510,
            ],
            [
                'author' => $authors[8],
                'text' => 'FEATURED_SEED_20260723 011: Long one from the last 48 hours: a friend asked whether I wanted advice or company, and that one question changed the whole conversation. We walked around the lake, forgot to take a photo, argued gently about the best samosa nearby, and ended up making one small plan instead of pretending everything was solved.',
                'image_url' => null,
                'minutes_ago' => 620,
            ],
            [
                'author' => $authors[9],
                'text' => 'FEATURED_SEED_20260723 012: Helped a neighbor carry plants upstairs and got invited into a balcony basil rescue operation. The basil is uncertain. The conversation was not.',
                'image_url' => 'https://picsum.photos/seed/guisedup-feature-09/1200/800',
                'minutes_ago' => 760,
            ],
            [
                'author' => $authors[10],
                'text' => 'FEATURED_SEED_20260723 013: We swapped hobby failures at lunch: lopsided scarf, half-learned guitar song, abandoned sourdough. It felt better than comparing wins.',
                'image_url' => null,
                'minutes_ago' => 930,
            ],
            [
                'author' => $authors[11],
                'text' => 'FEATURED_SEED_20260723 014: The local cleanup lasted two hours. The best part was not the full bags; it was Lena teaching everyone the names of birds that kept interrupting us.',
                'image_url' => 'https://picsum.photos/seed/guisedup-feature-10/1200/800',
                'minutes_ago' => 1110,
            ],
            [
                'author' => $authors[2],
                'text' => 'FEATURED_SEED_20260723 015: Another long note: the group chat decided to meet without making it a production. No matching outfits, no perfect table, no big announcement. Just four people, shared fries, a phone face-down in the middle, and enough honesty to make next week feel slightly less abstract.',
                'image_url' => 'https://picsum.photos/seed/guisedup-feature-11/1200/800',
                'minutes_ago' => 1420,
            ],
            [
                'author' => $authors[5],
                'text' => 'FEATURED_SEED_20260723 016: Someone brought homemade cookies to the late bus stop because her oven timer broke and she made too many. Public transit has never tasted that sincere.',
                'image_url' => null,
                'minutes_ago' => 1710,
            ],
        ];

        foreach ($featuredPosts as $entry) {
            $text = $entry['text'];
            $imageUrl = $entry['image_url'];
            $analysis = $embeddingClient->analyze($text, $imageUrl);
            $createdAt = $baseTime->subMinutes($entry['minutes_ago']);

            $this->upsertSeededPost($entry['author'], $text, $imageUrl, $analysis, $createdAt);
        }

        $this->removeDuplicateSeedRows('DEMO_SEED_20260723%');
        $this->removeDuplicateSeedRows('FEATURED_SEED_20260723%');
    }

    private function upsertSeededPost(User $author, string $text, ?string $imageUrl, object $analysis, CarbonImmutable $createdAt): void
    {
        $post = Post::query()->where('text', $text)->oldest('id')->first() ?? new Post(['text' => $text]);
        $post->user()->associate($author);
        $post->fill([
            'text' => $text,
            'image_url' => $imageUrl,
            'embedding' => PgVector::literal($analysis->embedding),
            'text_authenticity_score' => $analysis->textAuthenticityScore,
            'image_authenticity_score' => $analysis->imageAuthenticityScore,
            'authenticity_score' => $analysis->authenticityScore,
            'embedding_status' => $analysis->mode === 'fallback' ? 'fallback' : 'ready',
        ]);
        $post->created_at = $createdAt;
        $post->updated_at = $createdAt;
        $post->save();
    }

    private function removeDuplicateSeedRows(string $textPattern): void
    {
        DB::statement(
            <<<'SQL'
            delete from posts duplicate
            using posts keeper
            where duplicate.text = keeper.text
              and duplicate.id > keeper.id
              and duplicate.text like ?
            SQL,
            [$textPattern]
        );
    }
}
