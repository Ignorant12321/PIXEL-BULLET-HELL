import test from 'node:test';
import assert from 'node:assert/strict';
import { briefStateForPhase } from '../src/js/ui/ui.js';

test('pause does not show the central brief overlay', function () {
  assert.equal(briefStateForPhase('paused'), null);
  assert.equal(briefStateForPhase('playing'), null);
});

test('ready and intermission still show actionable brief overlays', function () {
  assert.deepEqual(briefStateForPhase('ready'), ['选择星舰', '选择一艘星舰并守住右侧基地。', '开始']);
  assert.deepEqual(briefStateForPhase('intermission'), ['备战', '上一波已清空。可补给后继续下一波。', '下一波']);
});
