import assert from 'node:assert/strict';
import test from 'node:test';

import {
  decideReactionOptionAction,
  decideReactionTriggerAction
} from '../src/reactions/interaction.js';

test('inactive trigger click opens the tray without selecting a reaction', () => {
  assert.deepEqual(decideReactionTriggerAction(null, false), { type: 'open_tray' });
});

test('active trigger click removes the current reaction without opening the tray', () => {
  assert.deepEqual(decideReactionTriggerAction('support', false), {
    type: 'remove_reaction',
    reactionKind: 'support'
  });
});

test('choosing the active tray option removes it', () => {
  assert.deepEqual(decideReactionOptionAction('good_vibes', 'good_vibes'), {
    type: 'remove_reaction',
    reactionKind: 'good_vibes'
  });
});

test('choosing a different tray option switches to it', () => {
  assert.deepEqual(decideReactionOptionAction('like', 'support'), {
    type: 'switch_reaction',
    reactionKind: 'support'
  });
});
