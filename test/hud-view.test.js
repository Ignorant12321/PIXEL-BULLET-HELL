import test from 'node:test';
import assert from 'node:assert/strict';

import { buildHudReadouts } from '../src/js/ui/hud-view.js';

test('buildHudReadouts groups score, economy, wave, and record for compact HUD rendering', function () {
  const readouts = buildHudReadouts({
    score: 12345,
    coins: 678,
    best: 22222,
    actIndex: 1,
    actCodename: '虚空裂隙',
    localWave: 3,
    globalWave: 13,
    waveIndex: 12
  }, 20);

  assert.deepEqual(readouts.map(function (item) { return item.id; }), ['score', 'coin', 'wave', 'best']);
  assert.equal(readouts[0].label, '分数');
  assert.equal(readouts[0].value, '12,345');
  assert.equal(readouts[2].label, 'ACT 02');
  assert.equal(readouts[2].value, '3 / 10');
  assert.equal(readouts[2].detail, '总波次 13/20 · 虚空裂隙');
  assert.equal(readouts[3].value, '22,222');
});
