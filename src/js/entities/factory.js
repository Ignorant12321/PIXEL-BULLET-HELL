(function (PSD) {
  'use strict';

  const U = PSD.U;

  function getShip(state) {
    const ships = PSD.data.starships || [];
    return ships.find(function (ship) { return ship.id === state.shipId; }) || ships[0] || {
      id:'swift', icon:'ship', hp:80, damage:1, speed:250, range:360, fireRate:0, bombs:2, color:'#56f6ff'
    };
  }

  function difficultyFor(type, state) {
    const data = PSD.data.enemies[type] || PSD.data.enemies.raider;
    const cfg = PSD.data.difficulty || {};
    const waveCfg = (cfg.waves || [])[state.waveIndex] || (cfg.waves || [])[0] || {};
    return waveCfg[data.role || 'normal'] || waveCfg.normal || { hp:1, attack:1, speed:1, fire:1 };
  }

  PSD.entities.createPlayer = function createPlayer(state) {
    const ship = getShip(state);
    return {
      x: U.clamp(state.w * 0.70, 36, state.base.x - 54),
      y: state.h * 0.52,
      radius: 16,
      shipId: ship.id,
      icon: ship.icon || 'ship',
      color: ship.color || '#56f6ff',
      hp: ship.hp,
      max: ship.hp,
      damageBase: ship.damage || 1,
      fireRateBonus: ship.fireRate || 0,
      baseRange: ship.range || 360,
      speed: ship.speed || 250,
      baseArmor: ship.baseArmor || 0,
      coinBonus: ship.coinBonus || 0,
      inv: 1.2,
      shootTimer: 0,
      missileTimer: 0,
      droneTimer: 0
    };
  };

  PSD.entities.createEnemy = function createEnemy(type, state) {
    const data = PSD.data.enemies[type] || PSD.data.enemies.raider;
    const diff = difficultyFor(type, state);
    const hasGun = !!data.fireEvery;
    const hp = Math.max(1, Math.round(data.hp * (diff.hp || 1)));
    const speed = data.speed * (diff.speed || 1);
    const attack = diff.attack || 1;
    return {
      type,
      x: type === 'boss' ? -90 : -32,
      y: type === 'boss' ? state.h * 0.5 : U.rand(78, state.h - 70),
      vx: speed * U.rand(0.92, 1.12),
      vy: U.rand(-12, 12),
      radius: data.radius,
      hp,
      max: hp,
      reward: data.reward,
      damage: Math.max(1, Math.round((data.damage || 1) * attack)),
      baseDamage: Math.max(1, Math.round((data.baseDamage || data.damage || 1) * attack)),
      bulletDamage: Math.max(0, Math.round((data.bulletDamage || 0) * attack)),
      score: data.score,
      fireEvery: hasGun ? Math.max(0.45, data.fireEvery / (diff.fire || 1)) : Infinity,
      fireTimer: hasGun ? U.rand(0.4, 1.6) : Infinity,
      color: data.color,
      icon: data.icon,
      emp: 0,
      bombHit: 0,
      stopX: type === 'boss' ? Math.min(state.w * 0.48, state.base.x - 240) : null,
      wobble: U.rand(0, Math.PI * 2),
      active: true
    };
  };

  PSD.entities.createBullet = function createBullet(kind, x, y, vx, vy, radius, damage, options) {
    const opts = options || {};
    return {
      kind, x, y, vx, vy, radius, damage,
      life: opts.life || (kind === 'enemy' ? 4.8 : 1.9),
      range: opts.range || (kind === 'enemy' ? 9999 : 620),
      traveled: 0,
      pierce: 0,
      critical: false,
      active: true
    };
  };

  PSD.entities.createMissile = function createMissile(x, y, damage, range) {
    return { kind:'missile', x, y, vx:-180, vy:0, radius:7, damage, life:4, range:range || 720, traveled:0, turn:7.5, speed:230, trail:[], active:true };
  };

  PSD.entities.createPickup = function createPickup(type, x, y) {
    const data = PSD.data.pickups[type] || PSD.data.pickups.credits;
    return { type, x, y, vx: U.rand(12,42), vy: U.rand(-12,12), radius:13, life:13, pulse: U.rand(0, Math.PI*2), color: data.color, active:true };
  };

  PSD.entities.createParticle = function createParticle(x, y, color) {
    const angle = U.rand(0, Math.PI * 2);
    const speed = U.rand(36, 220);
    const life  = U.rand(0.22, 0.9);
    return { x, y, vx: Math.cos(angle)*speed, vy: Math.sin(angle)*speed, radius: U.rand(1,4), color, life, max: life, active:true };
  };
}(window.PSD));
