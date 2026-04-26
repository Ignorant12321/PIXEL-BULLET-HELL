export function choosePickupType(enemyType, random) {
  const chance = enemyType === 'boss' ? 1 : enemyType === 'elite' ? 0.68 : 0.20;
  if (random() > chance) return null;
  const r = random();
  return r < 0.16 ? 'hull'
       : r < 0.30 ? 'shield'
       : r < 0.44 ? 'overdrive'
       : r < 0.58 ? 'bomb'
       : r < 0.72 ? 'credits'
       : r < 0.84 ? 'basekit'
       : r < 0.94 ? 'timeslow'
       : 'bounty';
}
