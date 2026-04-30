import { distanceSq } from '../core/utils.js';

export function targetInRange(player, enemy, range) {
  return !!enemy && enemy.active && enemy.x <= player.x + enemy.radius && (player.x - enemy.x) <= range + enemy.radius;
}

export function hasTargetInRange(state, range, extra) {
  const p = state.player;
  const r = range + (extra || 0);
  for (let i = 0; i < state.enemies.length; i++) {
    if (targetInRange(p, state.enemies[i], r)) return true;
  }
  return false;
}

export function nearestTargetInRange(state, range, extra) {
  const p = state.player;
  const r = range + (extra || 0);
  let best = null;
  let bestDist = Infinity;
  for (let i = 0; i < state.enemies.length; i++) {
    const enemy = state.enemies[i];
    if (!targetInRange(p, enemy, r)) continue;
    const d = distanceSq(p, enemy);
    if (d < bestDist) {
      bestDist = d;
      best = enemy;
    }
  }
  return best;
}
