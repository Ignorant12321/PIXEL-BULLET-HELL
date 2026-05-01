import test from 'node:test';
import assert from 'node:assert/strict';

import { buildSpawnQueue, summarizeWaveEntries } from '../src/js/game/waves.js';

const data = {
  difficulty: {
    waves: {
      wave01: { normal: { hp: 1, attack: 1, speed: 1, fire: 1 }, spawn: 1 }
    }
  }
};

test('buildSpawnQueue keeps legacy entries ordered by segment', function () {
  const queue = buildSpawnQueue({
    entries: [['scout', 2], ['raider', 1]]
  }, 0, data);

  assert.deepEqual(queue.map(function (item) { return item.type; }), ['scout', 'scout', 'raider']);
  assert.equal(queue[0].time.toFixed(2), '0.86');
});

test('buildSpawnQueue supports phase sequences with custom interval ranges', function () {
  const queue = buildSpawnQueue({
    phases: [
      { at: 0.5, sequence: [['scout', 2], ['raider', 1]], interval: [0.2, 0.2] },
      { delay: 1, sequence: [['tank', 1]], interval: 0.5 }
    ]
  }, 0, data);

  assert.deepEqual(queue.map(function (item) { return item.type; }), ['scout', 'scout', 'raider', 'tank']);
  assert.deepEqual(queue.map(function (item) { return Number(item.time.toFixed(2)); }), [0.7, 0.9, 1.1, 2.6]);
});

test('buildSpawnQueue supports weighted pools while respecting remaining counts', function () {
  const queue = buildSpawnQueue({
    phases: [{
      at: 0,
      pool: [
        { type: 'scout', count: 2, weight: 3 },
        { type: 'raider', count: 1, weight: 1 }
      ],
      interval: [0.1, 0.1]
    }]
  }, 0, data, function () { return 0.99; });

  assert.deepEqual(queue.map(function (item) { return item.type; }).sort(), ['raider', 'scout', 'scout']);
  assert.equal(queue.length, 3);
});

test('summarizeWaveEntries derives compatibility entries from phases', function () {
  const entries = summarizeWaveEntries([
    { sequence: [['scout', 2], ['raider', 1]] },
    { pool: [{ type: 'scout', count: 3 }, { type: 'tank', count: 1 }] }
  ]);

  assert.deepEqual(entries, [['scout', 5], ['raider', 1], ['tank', 1]]);
});
