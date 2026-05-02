import test from 'node:test';
import assert from 'node:assert/strict';
import { joystickDirections, joystickVectorFromPoint } from '../src/js/systems/input.js';

test('joystickVectorFromPoint clamps drag distance to the radius', function () {
  const vector = joystickVectorFromPoint({ x: 10, y: 10 }, { x: 110, y: 10 }, 40);

  assert.equal(vector.x, 40);
  assert.equal(vector.y, 0);
  assert.equal(vector.active, true);
  assert.equal(vector.distance, 40);
});

test('joystickVectorFromPoint preserves diagonal direction while clamping', function () {
  const vector = joystickVectorFromPoint({ x: 0, y: 0 }, { x: 60, y: 60 }, 30);

  assert.equal(Math.round(vector.x), 21);
  assert.equal(Math.round(vector.y), 21);
  assert.equal(vector.active, true);
});

test('joystickDirections maps vectors to directional key states with a deadzone', function () {
  assert.deepEqual(joystickDirections({ x: 2, y: 3 }, 10), {
    left: false, right: false, up: false, down: false
  });
  assert.deepEqual(joystickDirections({ x: -18, y: 4 }, 10), {
    left: true, right: false, up: false, down: false
  });
  assert.deepEqual(joystickDirections({ x: 13, y: -22 }, 10), {
    left: false, right: true, up: true, down: false
  });
});
