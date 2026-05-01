import test from 'node:test';
import assert from 'node:assert/strict';

import { codexItemsForTab, initialCodexTab } from '../src/js/ui/codex.js';

const tabs = [
  { id: 'monster', name: '怪物' },
  { id: 'weapon', name: '武器' }
];

const codex = [
  { category: 'monster', name: 'Scout' },
  { category: 'weapon', name: 'Cannon' }
];

test('codex opens on the first real category instead of an all group', function () {
  assert.equal(initialCodexTab(tabs), 'monster');
});

test('codex filters entries to the active category', function () {
  assert.deepEqual(codexItemsForTab(codex, 'monster'), [codex[0]]);
  assert.deepEqual(codexItemsForTab(codex, 'missing'), []);
});
