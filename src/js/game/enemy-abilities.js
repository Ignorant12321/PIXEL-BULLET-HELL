export function createAbilityState(ability) {
  if (!ability) return {};
  if (ability.type === 'shield') return { timer: ability.duration || 1, cycle: ability.cycle || 4 };
  if (ability.type === 'blink') return { cooldown: ability.cooldown || 3 };
  if (ability.type === 'summon') return { cooldown: ability.every || 5 };
  return {};
}

export function applyEnemyAbility(event, enemy, context) {
  const ability = enemy && enemy.ability;
  const ctx = context || {};
  if (!ability) return ctx;

  if (event === 'incomingDamage' && ability.type === 'shield') {
    const active = enemy.abilityState && enemy.abilityState.timer > 0;
    if (active) ctx.damage = Math.max(1, Math.round((ctx.damage || 0) * (1 - (ability.reduction || 0.55))));
    return ctx;
  }

  if (event === 'death' && ability.type === 'split') {
    ctx.spawns = [];
    for (let i = 0; i < (ability.count || 2); i++) {
      ctx.spawns.push({ type: ability.into, x: enemy.x, y: enemy.y, hpScale: ability.hpScale || 0.65 });
    }
    return ctx;
  }

  if (event === 'hitPlayer' && ability.type === 'jam' && ctx.state) {
    ctx.state.buff.jam = Math.max(ctx.state.buff.jam || 0, ability.duration || 3);
    return ctx;
  }

  if (event === 'tick' && ability.type === 'shield') {
    if (!enemy.abilityState || typeof enemy.abilityState.timer !== 'number') enemy.abilityState = createAbilityState(ability);
    enemy.abilityState.timer -= ctx.dt || 0;
    if (enemy.abilityState.timer <= -((ability.cycle || 4) - (ability.duration || 1))) {
      enemy.abilityState.timer = ability.duration || 1;
    }
    return ctx;
  }

  if (event === 'tick' && ability.type === 'blink') {
    if (!enemy.abilityState || typeof enemy.abilityState.cooldown !== 'number') enemy.abilityState = createAbilityState(ability);
    enemy.abilityState.cooldown -= ctx.dt || 0;
    if (enemy.abilityState.cooldown <= 0 && ctx.state && enemy.x < ctx.state.base.x - 150) {
      enemy.x += ability.distance || 70;
      enemy.emp = Math.max(enemy.emp || 0, 0.18);
      enemy.abilityState.cooldown = ability.cooldown || 3;
      if (ctx.emitParts) ctx.emitParts(enemy.x, enemy.y, enemy.color, 5);
    }
    return ctx;
  }

  if (event === 'tick' && ability.type === 'summon') {
    if (!enemy.abilityState || typeof enemy.abilityState.cooldown !== 'number') enemy.abilityState = createAbilityState(ability);
    enemy.abilityState.cooldown -= ctx.dt || 0;
    if (enemy.abilityState.cooldown <= 0) {
      ctx.spawns = [];
      for (let i = 0; i < (ability.count || 1); i++) {
        ctx.spawns.push({ type: ability.typeId, x: enemy.x - 18, y: enemy.y + (i - 0.5) * 32 });
      }
      enemy.abilityState.cooldown = ability.every || 5;
    }
    return ctx;
  }

  return ctx;
}
