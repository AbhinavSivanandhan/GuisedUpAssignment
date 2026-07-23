import assert from 'node:assert/strict';
import test from 'node:test';

import {
  QUALIFIED_VIEW_MINIMUM_MS,
  QUALIFIED_VIEW_VISIBLE_PERCENT,
  qualifiedViewKey,
  uniqueQualifiedPostIds
} from '../src/feed/qualifiedViews.js';

test('qualified view constants match the product threshold', () => {
  assert.equal(QUALIFIED_VIEW_VISIBLE_PERCENT, 50);
  assert.equal(QUALIFIED_VIEW_MINIMUM_MS, 1500);
});

test('qualified view keys include feed versus search attribution', () => {
  assert.equal(qualifiedViewKey('feed', null, 12), 'feed:none:12');
  assert.equal(qualifiedViewKey('search', 88, 12), 'search:88:12');
});

test('viewability extraction deduplicates post ids for a callback batch', () => {
  assert.deepEqual(
    uniqueQualifiedPostIds([
      { item: { id: 1 } },
      { item: { id: 1 } },
      { item: { id: 2 } },
      { item: { id: 'ignored' } }
    ]),
    [1, 2]
  );
});
