const PASSIVE_EFFECTS = {
  baseArmor: true,
  coinBonus: true
};

export function shipEffects(ship) {
  const effects = {
    baseArmor: 0,
    coinBonus: 0
  };

  (ship && ship.abilities || []).forEach(function (ability) {
    if (!PASSIVE_EFFECTS[ability.type]) return;
    effects[ability.type] += Number(ability.value) || 0;
  });

  return effects;
}

export function applyShipEvent(event, ctx) {
  const ship = (ctx && ctx.ship) || {};
  const state = (ctx && ctx.state) || {};
  const abilities = ship.abilities || [];

  abilities.forEach(function (ability) {
    if (event === 'waveStart' && ability.type === 'waveShield') {
      const shieldLevel = Number(ctx.shieldLevel) || 0;
      const value = Number(ability.value) || 0;
      state.buff.shield = Math.max(state.buff.shield || 0, 4 + shieldLevel * 2 + value * 2);
      state.shieldCharges = Math.max(state.shieldCharges || 0, 1 + Math.max(0, value - 1));
    }
  });
}
