function effect(state, key) {
  return Number((state.armoryEffects || {})[key]) || 0;
}

export function createCombatSelectors(state, baseCfg) {
  function damage() {
    return Math.max(1, Math.round((state.player ? state.player.damageBase : 1) + effect(state, 'damage')));
  }

  function lanes() {
    return 1 + effect(state, 'lanes');
  }

  function range() {
    return Math.round((state.player ? state.player.baseRange : 360) + effect(state, 'range'));
  }

  function fireRate() {
    const shipBonus = state.player ? state.player.fireRateBonus : 0;
    return Math.max(0.35, 1 + shipBonus + effect(state, 'fireRate') + (state.buff.overdrive > 0 ? 0.72 : 0) - (state.buff.jam > 0 ? 0.24 : 0));
  }

  function critChance() {
    return Math.min(0.50, effect(state, 'crit'));
  }

  function pierce() {
    return effect(state, 'pierce');
  }

  function cannonRateBonus() {
    return effect(state, 'cannonRate');
  }

  function weaponUnlocked(id) {
    if (id === 'cannon') return true;
    return !!((state.armoryEffects || {}).unlocks || {})[id];
  }

  return {
    damage,
    lanes,
    range,
    fireRate,
    critChance,
    pierce,
    cannonRateBonus,
    weaponUnlocked
  };
}
