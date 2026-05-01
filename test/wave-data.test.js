import test from 'node:test';
import assert from 'node:assert/strict';

import data from '../src/js/data/index.js';
import { summarizeWaveEntries } from '../src/js/game/waves.js';

test('act waves use phase scripts while keeping compatibility entries', function () {
  data.acts.forEach(function (act) {
    act.waves.forEach(function (wave) {
      assert.ok(Array.isArray(wave.phases), act.id + ' wave ' + wave.wave + ' should define phases');
      assert.ok(wave.phases.length >= 2, act.id + ' wave ' + wave.wave + ' should have staged phases');
      assert.deepEqual(wave.entries, summarizeWaveEntries(wave.phases));
      assert.ok(wave.phases.some(function (phase) {
        return Array.isArray(phase.pool) && phase.pool.length > 0;
      }), act.id + ' wave ' + wave.wave + ' should include a randomized pool');
    });
  });
});
