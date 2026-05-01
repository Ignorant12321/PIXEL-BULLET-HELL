import * as U from '../core/utils.js';
import * as E from '../entities/factory.js';
import { createInput } from '../systems/input.js';
import { createAudio } from '../systems/audio.js';
import { draw } from '../render/renderer.js';
import { phaseLabel, createView, createBuffList } from './state.js';
import { buildSpawnQueue } from './waves.js';
import { upgradeCost, isServiceFull } from './economy.js';
import { choosePickupType } from './pickups.js';
import { moveProjectile } from './combat.js';
import { createArmoryState, createArmorySystem } from './armory.js';
import { createCombatSelectors } from './selectors.js';
import { hasTargetInRange as hasTarget, nearestTargetInRange as nearestTarget } from './targets.js';
import { compactActive } from './collections.js';
import { applyEnemyAbility } from './enemy-abilities.js';
import { applyShipEvent } from './ship-abilities.js';

export function createGame(canvas, data, deps = {}) {
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;

  const input = createInput(canvas);
  const audio = createAudio();
  let ui = null;
  let raf = 0;
  let lastTime = performance.now();
  const itemKeys = Object.keys(data.pickups || {});
  const itemMax = 5;

  function baseCfg() {
    return (data.difficulty && data.difficulty.base) || {
      coins:80, baseHp:160, maxBombs:6, bulletSpeed:560, rangeUpgrade:45,
      hullUpgradeHp:18, hullRepair:34, baseRepair:34, pickupHullRepair:14, pickupBaseRepair:16
    };
  }

  function firstShipId() {
    const ships = data.starships || [];
    return (ships[0] && ships[0].id) || 'swift';
  }

  const state = {
    w: 960, h: 540,
    phase: 'ready',
    beforeOverlay: null, overlay: false,
    waveIndex: 0, done: 0,
    time: 0, clock: 0, queue: [],
    total: 0, spawned: 0, defeated: 0,
    score: 0, coins: baseCfg().coins, kills: 0,
    best: Number(localStorage.getItem(data.storage.best)) || 0,
    bombs: 2,
    shipId: U.load(data.storage.ship, firstShipId()),
    base: { x: 920, hp: baseCfg().baseHp, max: baseCfg().baseHp, radius: 22 },
    player: null,
    activeWeapon: 'cannon',
    up: {},
    armory: createArmoryState(data.armoryRoutes || []),
    armoryEffects: {},
    items: {},
    unlocked: U.load(data.storage.codex, { 'weapon:cannon': true }),
    buff: { shield: 0, overdrive: 0, inv: 0, timeSlow: 0, bounty: 0, jam: 0 },
    shieldCharges: 0,
    bullets: [], ebullets: [], missiles: [], beams: [], bombEffects: [],
    enemies: [], pickups: [], parts: [], stars: [],
    shake: 0, soundCooldown: 0, bombSeq: 0
  };

  data.upgrades.forEach(function (u) { state.up[u.id] = 0; });
  itemKeys.forEach(function (key) { state.items[key] = 0; });
  const armory = createArmorySystem(data.armoryRoutes || [], state);
  const combat = createCombatSelectors(state, baseCfg);
  state.level = level;
  state.label = label;
  state.range = range;
  state.ship = shipData;

  function shipData() {
    const ships = data.starships || [];
    return ships.find(function (ship) { return ship.id === state.shipId; }) || ships[0] || { id:'swift', name:'逐光号', bombs:2 };
  }

  function label() { return phaseLabel(state.phase); }
  function level(id) {
    const legacy = {
      damage: 'core-damage',
      fireRate: 'core-rate',
      range: 'core-range',
      pierce: 'core-pierce',
      crit: 'core-crit',
      lanes: 'cannon-lanes',
      sniper: 'sniper-core',
      beam: 'beam-core',
      missile: 'missile-core',
      drone: 'drone-core',
      bombCore: 'bomb-core'
    };
    if (legacy[id]) return armory.level(legacy[id]);
    return Number(state.up[id]) || 0;
  }
  function refreshArmoryEffects() { state.armoryEffects = armory.effects(); }
  refreshArmoryEffects();
  function damage() { return combat.damage(); }
  function lanes() { return combat.lanes(); }
  function range() { return combat.range(); }
  function fireRate() { return combat.fireRate(); }
  function critChance() { return combat.critChance(); }
  function pierce() { return combat.pierce(); }
  function coinMultiplier() {
    const shipBonus = state.player ? state.player.coinBonus : 0;
    return 1 + shipBonus + level('salvage') * 0.12 + (state.buff.bounty > 0 ? 0.50 : 0);
  }
  function baseDamageFactor() {
    const shipArmor = state.player ? state.player.baseArmor : 0;
    return Math.max(0.42, 1 - shipArmor - level('baseArmor') * 0.12);
  }
  function bombRadius() { return Math.min(state.w * 0.44, 220 + (state.armoryEffects.bombRadius || 0)); }
  function bombDamage() { return 32 + damage() * 5 + (state.armoryEffects.bombDamage || 0); }
  function bombEmpDuration() { return 1.7 + (state.armoryEffects.bombEmp || 0); }
  function armAudio() { if (audio.unlock) audio.unlock(); }
  function weaponUnlocked(id) { return combat.weaponUnlocked(id); }
  function activeWeapon() {
    if (!weaponUnlocked(state.activeWeapon)) state.activeWeapon = 'cannon';
    return state.activeWeapon;
  }

  function cost(item) { return upgradeCost(item, level); }
  function full(id) {
    if (id === 'repairHull') return (state.items.hull || 0) >= itemMax;
    if (id === 'repairBase') return (state.items.basekit || 0) >= itemMax;
    if (id === 'bombPack') return state.bombs >= baseCfg().maxBombs;
    return isServiceFull(id, state, baseCfg);
  }
  function unlock(key) {
    if (!key || state.unlocked[key]) return;
    state.unlocked[key] = true;
    U.save(data.storage.codex, state.unlocked);
  }
  function emitParts(x, y, color, n) {
    for (let i = 0; i < n; i++) state.parts.push(E.createParticle(x, y, color, U));
  }
  function saveBest() {
    if (state.score <= state.best) return;
    state.best = state.score;
    try { localStorage.setItem(data.storage.best, String(state.best)); } catch (_) {}
  }

  function stagePlayerAtBase() {
    if (!state.player) return;
    state.player.x = U.clamp(state.base.x - 86, 36, state.base.x - 54);
    state.player.y = U.clamp(state.h * 0.52, 42, state.h - 42);
    state.player.shootTimer = 0.12;
    state.player.missileTimer = 0.2;
    state.player.droneTimer = 0.2;
  }

  function resize() {
    const rect = canvas.parentElement.getBoundingClientRect();
    const oldW = state.w;
    const oldH = state.h;
    state.w = Math.max(520, Math.floor(rect.width || 960));
    state.h = Math.max(360, Math.floor(rect.height || 540));
    canvas.width = state.w;
    canvas.height = state.h;
    state.base.x = state.w - 48;

    if (state.player) {
      state.player.x = U.clamp(state.player.x * state.w / oldW, 36, state.base.x - 54);
      state.player.y = U.clamp(state.player.y * state.h / oldH, 42, state.h - 42);
    }

    state.stars = [];
    const count = Math.floor(state.w * state.h / 4800);
    for (let i = 0; i < count; i++) {
      state.stars.push({
        x: U.rand(0, state.w),
        y: U.rand(0, state.h),
        speed: U.rand(8, 42),
        size: Math.random() > 0.84 ? 2 : 1,
        alpha: U.rand(0.24, 0.90)
      });
    }
  }

  function reset(silent) {
    const cfg = baseCfg();
    state.phase = 'ready'; state.beforeOverlay = null; state.overlay = false;
    state.waveIndex = 0; state.done = 0; state.time = 0; state.queue = [];
    state.total = 0; state.spawned = 0; state.defeated = 0;
    state.score = 0; state.coins = cfg.coins; state.kills = 0;
    state.base.max = cfg.baseHp; state.base.hp = state.base.max;
    state.player = E.createPlayer(state, data, U);
    state.bombs = Math.min(cfg.maxBombs, shipData().bombs || 2);
    state.buff = { shield: 0, overdrive: 0, inv: 0, timeSlow: 0, bounty: 0, jam: 0 };
    state.shieldCharges = 0;
    state.bullets = []; state.ebullets = []; state.missiles = []; state.beams = []; state.bombEffects = [];
    state.enemies = []; state.pickups = []; state.parts = [];
    state.shake = 0; state.bombSeq = 0;
    Object.keys(state.up).forEach(function (k) { state.up[k] = 0; });
    state.armory = createArmoryState(data.armoryRoutes || []);
    refreshArmoryEffects();
    Object.keys(state.items).forEach(function (k) { state.items[k] = 0; });
    state.activeWeapon = 'cannon';
    unlock('weapon:cannon');
    if (ui && !silent) ui.toast('系统重启，防线待命');
  }

  function setShip(id) {
    const ship = (data.starships || []).find(function (item) { return item.id === id; });
    if (!ship) return false;
    if (state.phase !== 'ready') {
      if (ui) ui.toast('舰型只能在开局待命时切换');
      return false;
    }
    state.shipId = id;
    U.save(data.storage.ship, id);
    reset(true);
    if (ui) ui.toast('已选择：' + ship.name);
    return true;
  }

  function setWeapon(id) {
    armAudio();
    if (!weaponUnlocked(id)) {
      if (ui) ui.toast('需要先在商店购买该武器');
      return false;
    }
    state.activeWeapon = id;
    if (ui) {
      const item = id === 'cannon' ? { name: '单轨主炮' } : (data.armoryRoutes || []).find(function (u) { return u.routeId === id && u.effects && u.effects.unlock === id; });
      ui.toast('已切换：' + ((item && item.name) || id));
    }
    return true;
  }

  function buildQueue(wave) {
    return buildSpawnQueue(wave, state.waveIndex, data);
  }

  function startWave() {
    if (state.waveIndex >= data.waves.length) { state.phase = 'victory'; return; }
    const wave = data.waves[state.waveIndex];
    const ship = shipData();
    state.time = 0;
    state.queue = buildQueue(wave);
    state.total = wave.entries.reduce(function (s, e) { return s + e[1]; }, 0);
    state.spawned = 0; state.defeated = 0;
    state.enemies = []; state.ebullets = [];
    state.bullets = []; state.missiles = []; state.beams = []; state.pickups = []; state.bombEffects = [];
    stagePlayerAtBase();
    state.phase = 'playing';
    if (level('shield') > 0) {
      state.buff.shield = Math.max(state.buff.shield, 4 + level('shield') * 2);
      state.shieldCharges = Math.max(state.shieldCharges, 1);
    }
    applyShipEvent('waveStart', { ship, state, shieldLevel: level('shield') });
    audio.beep(520, 0.08, 'triangle');
    if (ui) ui.toast(wave.actName + ' 第 ' + wave.wave + ' 波开始：' + wave.kind);
  }

  function completeWave() {
    const wave = data.waves[state.waveIndex];
    state.coins += wave.reward;
    state.player.hp = Math.min(state.player.max, state.player.hp + 10);
    state.done = Math.max(state.done, state.waveIndex + 1);
    state.waveIndex += 1;
    state.ebullets = []; state.bullets = []; state.missiles = []; state.beams = []; state.pickups = []; state.bombEffects = [];
    if (state.waveIndex >= data.waves.length) {
      state.phase = 'victory';
      if (ui) ui.toast('全部战役完成！');
    } else {
      state.phase = 'intermission';
      if (ui) ui.toast('波次肃清：奖励 ￥' + wave.reward + '，机体 +10');
    }
    saveBest();
  }

  function primary() {
    armAudio();
    if (state.phase === 'ready' || state.phase === 'intermission') startWave();
    else if (state.phase === 'paused') state.phase = 'playing';
    else if (state.phase === 'gameover' || state.phase === 'victory') reset(false);
  }
  function togglePause() {
    armAudio();
    if (state.overlay) return;
    if (state.phase === 'playing') state.phase = 'paused';
    else if (state.phase === 'paused') state.phase = 'playing';
  }
  function beginOverlay() {
    if (state.overlay) return;
    state.overlay = true; state.beforeOverlay = state.phase;
    if (state.phase === 'playing') state.phase = 'paused';
  }
  function endOverlay() {
    if (!state.overlay) return;
    const prev = state.beforeOverlay;
    state.overlay = false; state.beforeOverlay = null;
    if (prev) state.phase = prev;
  }
  function gameOver() {
    if (state.phase === 'gameover') return;
    state.phase = 'gameover'; state.overlay = false; state.beforeOverlay = null;
    state.ebullets = []; state.beams = []; state.bombEffects = []; state.shake = 12;
    saveBest();
    if (ui) ui.toast('防线失守');
  }

  function processInput() {
    if (state.overlay) {
      if (input.consume('escape') && ui) ui.close(true);
      if (input.consume('shop') && ui) ui.toggle('shop');
      if (input.consume('codex') && ui) ui.toggle('codex');
      if (input.consume('pause') && ui) ui.close(true);
      return;
    }
    if (input.consume('start')) primary();
    if (input.consume('pause')) togglePause();
    if (input.consume('shop') && ui) ui.toggle('shop');
    if (input.consume('codex') && ui) ui.toggle('codex');
    if (input.consume('bomb')) bomb();
  }

  function hasTargetInRange(extra) {
    return hasTarget(state, range(), extra);
  }

  function nearestTargetInRange(extra) {
    return nearestTarget(state, range(), extra);
  }

  function fireMain() {
    const weapon = activeWeapon();
    if (weapon === 'sniper') {
      const target = nearestTargetInRange(range() * 0.35);
      if (!target) {
        state.player.shootTimer = 0.12;
        return;
      }
      const isCrit = Math.random() < Math.min(0.50, critChance() + 0.10);
      const shotDamage = Math.round((damage() * 4 + (state.armoryEffects.sniperDamage || 0)) * (isCrit ? 2 : 1));
      const bullet = E.createBullet('player', state.player.x - 28, state.player.y, -760, 0, 6, shotDamage, { range: range() * 1.28, life: 2.2 });
      bullet.weapon = 'sniper';
      bullet.pierce = 1 + pierce() + (state.armoryEffects.sniperPierce || 0);
      bullet.emp = state.armoryEffects.sniperEmp || 0;
      bullet.critical = isCrit;
      state.bullets.push(bullet);
      state.player.shootTimer = 1 / Math.max(0.55, 0.78 * fireRate());
      audio.beep(420, 0.07, 'square');
      return;
    }
    if (weapon === 'missile') {
      const target = nearestTargetInRange(range() * 0.35);
      if (!target) {
        state.player.shootTimer = 0.18;
        return;
      }
      const lvl = Math.max(1, level('missile'));
      const count = 1 + Math.min(2, state.armoryEffects.missileSwarm || 0);
      for (let i = 0; i < count; i++) {
        state.missiles.push(E.createMissile(state.player.x - 24, state.player.y + U.rand(-8, 8), 8 + (state.armoryEffects.missileDamage || lvl * 5) + Math.floor(damage() * 0.9), range() * 1.45));
      }
      state.player.shootTimer = Math.max(0.42, 1.12 - (state.armoryEffects.missileRate || lvl * 0.12)) / fireRate();
      unlock('upgrade:missile');
      audio.beep(540, 0.05, 'triangle');
      return;
    }
    if (!hasTargetInRange(20)) {
      state.player.shootTimer = 0.08;
      return;
    }
    const count = Math.min(5, lanes());
    const spd = baseCfg().bulletSpeed || 560;
    const effectiveRange = range();
    const angles = count === 1 ? [Math.PI]
                 : count === 2 ? [Math.PI - 0.09, Math.PI + 0.09]
                 : [Math.PI, Math.PI - 0.17, Math.PI + 0.17];
    angles.forEach(function (angle, i) {
      const off = (i - (angles.length - 1) / 2) * 7;
      const isCrit = Math.random() < critChance();
      const bullet = E.createBullet('player', state.player.x - 22, state.player.y + off, Math.cos(angle) * spd, Math.sin(angle) * spd, 5, damage() * (isCrit ? 2 : 1), { range: effectiveRange });
      bullet.pierce = pierce();
      bullet.critical = isCrit;
      state.bullets.push(bullet);
    });
    state.player.shootTimer = 1 / (3 * (fireRate() + (state.armoryEffects.cannonRate || 0)));
    state.soundCooldown -= state.player.shootTimer;
    if (state.soundCooldown <= 0) {
      audio.beep(620, 0.04); state.soundCooldown = 0.12;
    }
  }

  function sustainBeam(dt) {
    state.beams = [];
    const target = nearestTargetInRange(30);
    if (!target) return;
    const p = state.player;
    const lvl = Math.max(1, level('beam'));
    const dps = (damage() * 2.1 + (state.armoryEffects.beamDamage || lvl * 2.2)) * Math.max(0.85, fireRate());
    target.hp -= dps * dt;
    target.emp = Math.max(target.emp || 0, 0.08 + (state.armoryEffects.beamEmp || 0));
    state.beams.push({
      x1: p.x - 22,
      y1: p.y,
      x2: target.x + target.radius * 0.35,
      y2: target.y,
      active: true
    });
    p.beamTick = (p.beamTick || 0) - dt;
    if (p.beamTick <= 0) {
      emitParts(target.x, target.y, '#71a6ff', 3);
      audio.beep(860, 0.025, 'sine', 0.025);
      p.beamTick = 0.11;
    }
    if (target.hp <= 0) killEnemy(target);
  }
  function fireMissile() {
    const target = nearestTargetInRange(range() * 0.25);
    if (!target) { state.player.missileTimer = 0.20; return; }
    const lvl = level('missile');
    const count = 1 + Math.min(2, state.armoryEffects.missileSwarm || 0);
    for (let i = 0; i < count; i++) {
      state.missiles.push(E.createMissile(state.player.x - 24, state.player.y + U.rand(-12,12), 5 + (state.armoryEffects.missileDamage || lvl * 4) + Math.floor(damage() * 0.6), range() * 1.35));
    }
    state.player.missileTimer = Math.max(0.55, 1.85 - (state.armoryEffects.missileRate || lvl * 0.28));
    unlock('upgrade:missile');
  }
  function interceptEnemyBullets() {
    const charges = Math.min(2, state.armoryEffects.droneIntercept || 0);
    if (!charges) return;
    let used = 0;
    for (let i = 0; i < state.ebullets.length && used < charges; i++) {
      const bullet = state.ebullets[i];
      if (!bullet || !bullet.active) continue;
      if (U.distanceSq(bullet, state.player) > 150 * 150) continue;
      bullet.active = false;
      used += 1;
      emitParts(bullet.x, bullet.y, '#71a6ff', 4);
    }
  }
  function fireDrone() {
    if (!hasTargetInRange(10)) { state.player.droneTimer = 0.16; return; }
    interceptEnemyBullets();
    const lvl = level('drone');
    const count = Math.max(1, Math.min(3, state.armoryEffects.droneCount || lvl));
    const offsets = count >= 3 ? [-30, 0, 30] : count >= 2 ? [-24, 24] : [-24];
    offsets.forEach(function (off) {
      state.bullets.push(E.createBullet('player', state.player.x - 28, state.player.y + off, -520, 0, 5, Math.max(1, (state.armoryEffects.droneDamage || lvl) + Math.floor(damage() * 0.25)), { range: range() * 0.88 }));
    });
    state.player.droneTimer = Math.max(0.26, 0.42 - (state.armoryEffects.droneRate || 0));
    unlock('upgrade:drone');
  }

  function updatePlayer(dt) {
    const p = state.player;
    const k = input.keys;
    let dx = 0, dy = 0;
    if (k.left) dx -= 1; if (k.right) dx += 1;
    if (k.up) dy -= 1; if (k.down) dy += 1;
    if (dx || dy) {
      const dir = U.norm(dx, dy);
      const slow = (k.slow ? 0.52 : 1) * (state.buff.jam > 0 ? 0.74 : 1);
      p.x += dir.x * p.speed * slow * dt;
      p.y += dir.y * p.speed * slow * dt;
    }
    if (input.pointer.active) {
      p.x += (input.pointer.x - p.x) * Math.min(1, 9 * dt);
      p.y += (input.pointer.y - p.y) * Math.min(1, 9 * dt);
    }
    p.x = U.clamp(p.x, 36, state.base.x - 54);
    p.y = U.clamp(p.y, 42, state.h - 42);
    p.inv = Math.max(0, p.inv - dt);
    p.shootTimer -= dt;
    p.missileTimer -= dt;
    p.droneTimer -= dt;
    if (activeWeapon() === 'beam' && level('beam') > 0) {
      sustainBeam(dt);
      p.shootTimer = 0.08;
    } else if (p.shootTimer <= 0) {
      fireMain();
    }
    if (level('missile') > 0 && activeWeapon() !== 'missile' && p.missileTimer <= 0) fireMissile();
    if (level('drone') > 0 && p.droneTimer <= 0) fireDrone();
  }

  function spawnEnemy(type, origin) {
    const enemy = E.createEnemy(type, state, data, U);
    if (origin) {
      enemy.x = origin.x;
      enemy.y = U.clamp(origin.y, 58, state.h - 58);
      if (origin.hpScale) {
        enemy.hp = Math.max(1, Math.round(enemy.hp * origin.hpScale));
        enemy.max = enemy.hp;
      }
    }
    state.enemies.push(enemy);
    unlock('enemy:' + type);
  }

  function updateWave(dt) {
    state.time += dt;
    state.queue.forEach(function (item) {
      if (item.spawned || state.time < item.time) return;
      item.spawned = true; state.spawned += 1;
      spawnEnemy(item.type);
    });
    if (state.spawned >= state.total && state.enemies.every(function (e) { return !e.active; })) {
      completeWave();
    }
  }

  function fireEnemy(enemy) {
    const damageValue = enemy.bulletDamage || Math.max(1, Math.round(enemy.damage * 0.45));
    if (!damageValue) return;
    const spd = enemy.role === 'boss' ? 185 : 170;
    const angle = U.angleTo(enemy, state.player);
    const shots = enemy.role === 'boss' ? [-0.24, -0.08, 0.08, 0.24] : [0];
    shots.forEach(function (spread) {
      const a = angle + spread;
      const bullet = E.createBullet('enemy', enemy.x + 18, enemy.y, Math.cos(a)*spd, Math.sin(a)*spd, 5, damageValue, { range: 9999 });
      if (enemy.ability && enemy.ability.type === 'jam') bullet.effect = { type: 'jam', duration: enemy.ability.duration || 3 };
      state.ebullets.push(bullet);
    });
    enemy.fireTimer = enemy.fireEvery * U.rand(0.82, 1.16);
  }

  function markEnemyGone(enemy) {
    if (!enemy || !enemy.active) return;
    enemy.active = false; state.defeated += 1;
  }

  function updateEnemies(dt) {
    state.enemies.forEach(function (enemy) {
      if (!enemy.active) return;
      enemy.emp = Math.max(0, (enemy.emp || 0) - dt);
      const abilityResult = applyEnemyAbility('tick', enemy, { state, dt, emitParts });
      (abilityResult.spawns || []).forEach(function (spawn) { spawnEnemy(spawn.type, spawn); });
      const slowScale = (state.buff.timeSlow > 0 ? 0.55 : 1) * (enemy.emp > 0 ? 0.55 : 1);
      enemy.wobble += dt * 2.2 * slowScale;
      if (enemy.stopX && enemy.x >= enemy.stopX) {
        enemy.vx *= 0.985;
        enemy.y += Math.sin(enemy.wobble) * 18 * dt * slowScale;
      } else {
        enemy.x += enemy.vx * dt * slowScale;
        enemy.y += enemy.vy * dt * slowScale + Math.sin(enemy.wobble) * 10 * dt * slowScale;
      }
      enemy.y = U.clamp(enemy.y, 44, state.h - 44);
      if (enemy.role !== 'boss' && enemy.x >= state.base.x - enemy.radius) {
        markEnemyGone(enemy);
        damageBase(enemy.baseDamage || enemy.damage);
        emitParts(state.base.x, enemy.y, enemy.color, 10);
        return;
      }
      enemy.fireTimer -= dt * (enemy.emp > 0 ? 0.62 : 1);
      if (enemy.fireTimer <= 0) fireEnemy(enemy);
    });
  }

  function moveBullet(b, dt) {
      moveProjectile(b, dt);
  }

  function updateBullets(dt) {
    state.bullets.forEach(function (b) {
      if (!b.active) return;
      moveBullet(b, dt);
      if (b.life <= 0 || b.traveled > b.range || b.x < -40 || b.x > state.w+40 || b.y < -40 || b.y > state.h+40) b.active = false;
    });
    state.ebullets.forEach(function (b) {
      if (!b.active) return;
      moveBullet(b, dt);
      if (b.x >= state.base.x) { b.active = false; damageBase(Math.max(1, b.damage)); }
      if (b.life <= 0 || b.x < -40 || b.x > state.w+40 || b.y < -40 || b.y > state.h+40) b.active = false;
    });
    state.missiles.forEach(function (m) {
      if (!m.active) return;
      const target = nearestTargetInRange(range() * 0.35);
      if (target) {
        const a = U.angleTo(m, target);
        const dx = Math.cos(a) * m.speed, dy = Math.sin(a) * m.speed;
        m.vx += (dx - m.vx) * Math.min(1, m.turn * dt);
        m.vy += (dy - m.vy) * Math.min(1, m.turn * dt);
      }
      m.trail.push({ x: m.x, y: m.y, life: 0.25 });
      m.trail.forEach(function (t) { t.life -= dt; });
      m.trail = m.trail.filter(function (t) { return t.life > 0; });
      moveBullet(m, dt);
      if (m.life <= 0 || m.traveled > m.range || m.x < -60 || m.x > state.w+60 || m.y < -60 || m.y > state.h+60) m.active = false;
    });
  }

  function updatePickups(dt) {
    const magR = 70 + level('magnet') * 70;
    state.pickups.forEach(function (p) {
      if (!p.active) return;
      p.life -= dt;
      if (p.life <= 0) { p.active = false; return; }
      const dist = Math.sqrt(U.distanceSq(p, state.player));
      if (dist < magR) {
        const dir = U.norm(state.player.x - p.x, state.player.y - p.y);
        p.vx += dir.x * 260 * dt;
        p.vy += dir.y * 260 * dt;
      }
      p.x += p.vx * dt; p.y += p.vy * dt;
      p.vx *= 0.985; p.vy *= 0.985;
      p.y = U.clamp(p.y, 26, state.h - 26);
      p.x = U.clamp(p.x, 12, state.base.x - 28);
    });
  }

  function drop(enemy) {
      const type = choosePickupType(enemy.type, Math.random);
      if (!type) return;
      state.pickups.push(E.createPickup(type, enemy.x, enemy.y, data, U));
    unlock('pickup:' + type);
  }

  function killEnemy(enemy) {
    if (!enemy || !enemy.active) return;
    enemy.active = false; state.defeated += 1;
    const abilityResult = applyEnemyAbility('death', enemy, {});
    (abilityResult.spawns || []).forEach(function (spawn) { spawnEnemy(spawn.type, spawn); });
    const coinReward = Math.max(1, Math.round(enemy.reward * coinMultiplier()));
    state.score += enemy.score; state.coins += coinReward; state.kills += 1;
    unlock('enemy:' + enemy.type);
    drop(enemy);
    emitParts(enemy.x, enemy.y, enemy.color, enemy.role === 'boss' ? 26 : 12);
    state.shake = Math.max(state.shake, enemy.role === 'boss' ? 16 : 5);
    audio.beep(enemy.role === 'boss' ? 180 : 260, enemy.role === 'boss' ? 0.15 : 0.06, 'sawtooth');
    saveBest();
  }

  function collectPickup(type) {
    const info = data.pickups[type] || data.pickups.credits;
    unlock('pickup:' + type);
    if (type === 'bomb') {
      if (state.bombs >= baseCfg().maxBombs) {
        if (ui) ui.toast('歼灭弹携带已满');
        return false;
      }
      state.bombs = Math.min(baseCfg().maxBombs, state.bombs + 1);
    } else {
      state.items[type] = Math.min(itemMax, (state.items[type] || 0) + 1);
    }
    audio.beep(960, 0.07, 'triangle');
    if (ui) ui.toast(info.name + ' 已入库');
    return true;
  }

  function applyItemEffect(type) {
    const info = data.pickups[type] || data.pickups.credits;
    unlock('pickup:' + type);
    if (type === 'hull') {
      state.player.hp = Math.min(state.player.max, state.player.hp + baseCfg().hullRepair);
    } else if (type === 'shield') {
      state.buff.shield = Math.max(state.buff.shield, info.duration + level('shield'));
      state.shieldCharges = Math.max(state.shieldCharges, 1);
    } else if (type === 'overdrive') {
      state.buff.overdrive = Math.max(state.buff.overdrive, info.duration);
    } else if (type === 'credits') {
      state.coins += 28 + Math.floor(Math.random() * 24);
    } else if (type === 'basekit') {
      state.base.hp = Math.min(state.base.max, state.base.hp + baseCfg().baseRepair);
    } else if (type === 'timeslow') {
      state.buff.timeSlow = Math.max(state.buff.timeSlow, info.duration);
      state.enemies.forEach(function (enemy) { enemy.emp = Math.max(enemy.emp || 0, 1.2); });
    } else if (type === 'bounty') {
      state.buff.bounty = Math.max(state.buff.bounty, info.duration);
    }
    audio.beep(960, 0.07, 'triangle');
    if (ui) ui.toast(info.name + ' 已使用');
    return true;
  }

  function useItem(type) {
    armAudio();
    if (type === 'bomb') return bomb();
    if (!data.pickups[type]) return false;
    if ((state.items[type] || 0) <= 0) { if (ui) ui.toast('没有可用道具'); return false; }
    if (type === 'hull' && state.player.hp >= state.player.max) { if (ui) ui.toast('机体生命已满'); return false; }
    if (type === 'basekit' && state.base.hp >= state.base.max) { if (ui) ui.toast('基地生命已满'); return false; }
    state.items[type] -= 1;
    return applyItemEffect(type);
  }

  function damagePlayer(amount) {
    if (state.phase !== 'playing') return;
    if (state.player.inv > 0 || state.buff.inv > 0) return;
    if (state.buff.shield > 0 && state.shieldCharges > 0) {
      state.shieldCharges -= 1;
      if (state.shieldCharges <= 0) state.buff.shield = 0;
      state.buff.inv = 0.35; state.shake = Math.max(state.shake, 4);
      if (ui) ui.toast('护盾吸收伤害'); return;
    }
    const finalDamage = Math.max(1, Math.round(amount || 1));
    state.player.hp = Math.max(0, state.player.hp - finalDamage);
    state.player.inv = 0.9; state.buff.inv = 0.55; state.shake = Math.max(state.shake, 8);
    if (ui) ui.toast('星舰受损 -' + finalDamage);
    if (state.player.hp <= 0) gameOver();
  }

  function damageBase(amount) {
    if (state.phase !== 'playing') return;
    const finalDamage = Math.max(1, Math.round(Math.max(1, amount || 1) * baseDamageFactor()));
    state.base.hp = Math.max(0, state.base.hp - finalDamage);
    state.shake = Math.max(state.shake, 6);
    if (state.base.hp <= 0) gameOver();
  }

  function collisions() {
    function collideProjectileList(list) {
      list.forEach(function (bullet) {
      if (!bullet || !bullet.active) return;
      for (let i = 0; i < state.enemies.length; i++) {
        const enemy = state.enemies[i];
        if (!enemy || !enemy.active) continue;
        if (!U.hit(bullet, enemy, bullet.kind === 'missile' ? 4 : 0)) continue;
        const abilityResult = applyEnemyAbility('incomingDamage', enemy, { damage: bullet.damage });
        enemy.hp -= abilityResult.damage;
        if (bullet.emp) enemy.emp = Math.max(enemy.emp || 0, bullet.emp);
        if (bullet.kind === 'missile' && state.armoryEffects.missileEmp) enemy.emp = Math.max(enemy.emp || 0, state.armoryEffects.missileEmp);
        emitParts(bullet.x, bullet.y, bullet.critical ? '#ffe66d' : (bullet.kind === 'missile' ? '#ffe66d' : '#56f6ff'), bullet.kind === 'missile' ? 7 : (bullet.critical ? 6 : 3));
        if (bullet.kind === 'player' && bullet.pierce > 0) {
          bullet.pierce -= 1;
          bullet.x -= Math.max(10, enemy.radius * 0.7);
        } else {
          bullet.active = false;
        }
        if (enemy.hp <= 0) killEnemy(enemy);
        break;
      }
      });
    }
    collideProjectileList(state.bullets);
    collideProjectileList(state.missiles);
    state.ebullets.forEach(function (b) {
      if (!b || !b.active) return;
      if (!U.hit(b, state.player, 1)) return;
      b.active = false;
      if (b.effect && b.effect.type === 'jam') state.buff.jam = Math.max(state.buff.jam || 0, b.effect.duration || 3);
      damagePlayer(b.damage);
      emitParts(b.x, b.y, '#ff6370', 6);
    });
    state.enemies.forEach(function (enemy) {
      if (!enemy || !enemy.active) return;
      if (!U.hit(enemy, state.player, 1)) return;
      applyEnemyAbility('hitPlayer', enemy, { state });
      damagePlayer(enemy.damage);
      if (enemy.role !== 'boss' && enemy.type !== 'elite') {
        markEnemyGone(enemy);
        emitParts(enemy.x, enemy.y, enemy.color, 10);
      }
    });
    state.pickups.forEach(function (p) {
      if (!p || !p.active) return;
      if (!U.hit(p, state.player, 2)) return;
      p.active = false; collectPickup(p.type);
    });
  }

  function clean() {
    compactActive(state.bullets);
    compactActive(state.ebullets);
    compactActive(state.missiles);
    compactActive(state.beams);
    compactActive(state.enemies);
    compactActive(state.pickups);
    compactActive(state.parts);
    compactActive(state.bombEffects);
  }

  function bomb() {
    armAudio();
    if (state.phase !== 'playing') { if (ui) ui.toast('作战中才能释放歼灭弹'); return false; }
    if (state.bombs <= 0) { if (ui) ui.toast('歼灭弹不足'); return false; }
    state.bombs -= 1;
    unlock('pickup:bomb');
    state.bombSeq += 1;
    state.bombEffects.push({
      id: state.bombSeq,
      x: state.player.x - 18,
      y: state.player.y,
      radius: 18,
      maxRadius: bombRadius(),
      life: 0.72,
      max: 0.72,
      active: true
    });
    state.shake = Math.max(state.shake, 7);
    audio.beep(130, 0.16, 'sawtooth', 0.07);
    if (ui) ui.toast('歼灭弹：压缩脉冲展开');
    return true;
  }

  function buy(id) {
    armAudio();
    const item = data.upgrades.find(function (u) { return u.id === id; });
    if (!item) return false;
    const price = cost(item);
    if (full(id)) { if (ui) ui.toast('当前已经达到上限'); return false; }
    if (state.coins < price) { if (ui) ui.toast('晶币不足'); return false; }
    if (level(id) >= item.max && item.type !== 'service' && item.type !== 'blind') { if (ui) ui.toast('该项目已满级'); return false; }
    state.coins -= price;
    if (item.type === 'service') {
      if (id === 'repairHull') state.items.hull = Math.min(itemMax, (state.items.hull || 0) + 1);
      if (id === 'repairBase') state.items.basekit = Math.min(itemMax, (state.items.basekit || 0) + 1);
      if (id === 'bombPack') { state.bombs = Math.min(baseCfg().maxBombs, state.bombs + 1); unlock('pickup:bomb'); }
    } else if (item.type === 'blind') {
      state.up[id] += 1;
      openBlindBox(price);
      audio.beep(780, 0.08, 'triangle');
      return true;
    } else {
      state.up[id] += 1;
      if (id === 'hullMax') {
        state.player.max += baseCfg().hullUpgradeHp;
        state.player.hp = Math.min(state.player.max, state.player.hp + baseCfg().hullUpgradeHp);
      }
      if (id === 'baseArmor') state.base.hp = Math.min(state.base.max, state.base.hp + 8);
      unlock('upgrade:' + id);
      if (item.category === 'weapon') {
        state.activeWeapon = id;
        unlock('weapon:' + id);
      }
    }
    audio.beep(720, 0.07);
    if (ui) ui.toast(item.type === 'service' ? item.name + ' 已存入道具栏' : item.name + ' 已采购');
    return true;
  }

  function buyArmoryNode(id) {
    armAudio();
    const result = armory.buy(id);
    if (!result.ok) {
      const messages = { locked: '需要先完成前置节点', exclusive: '本路线另一分支已锁定', coins: '晶币不足', maxed: '该节点已满级', unknown: '未知军械节点' };
      if (ui) ui.toast(messages[result.reason] || '无法购买');
      return false;
    }
    refreshArmoryEffects();
    unlock('armory:' + id);
    if (result.node.effects && result.node.effects.unlock) {
      unlock('weapon:' + result.node.effects.unlock);
      state.activeWeapon = result.node.effects.unlock;
    }
    audio.beep(720, 0.07);
    if (ui) ui.toast(result.node.name + ' 已升级');
    return true;
  }

  function respecArmoryRoute(routeId) {
    armAudio();
    const result = armory.respecRoute(routeId);
    if (!result.ok) {
      const messages = { combat: '作战中不能重置路线', empty: '该路线尚未投入晶币' };
      if (ui) ui.toast(messages[result.reason] || '无法重置路线');
      return false;
    }
    refreshArmoryEffects();
    if (!weaponUnlocked(state.activeWeapon)) state.activeWeapon = 'cannon';
    if (ui) ui.toast('路线已重置，返还 ￥' + result.refund + '，手续费 ￥' + result.fee);
    return true;
  }

  function openBlindBox(price) {
    const pct = U.rand(0.10, 2.00);
    const payout = Math.max(1, Math.round(price * pct));
    state.coins += payout;
    unlock('pickup:credits');
    if (ui) ui.toast('盲盒开启：获得 ￥' + payout + '（' + Math.round(pct * 100) + '%）');
  }

  function updateBombEffects(dt) {
    state.bombEffects.forEach(function (fx) {
      if (!fx.active) return;
      fx.life -= dt;
      const t = U.clamp(1 - fx.life / fx.max, 0, 1);
      fx.radius = fx.maxRadius * (1 - Math.pow(1 - t, 2));

      state.ebullets.forEach(function (b) {
        if (!b.active) return;
        if (U.distanceSq(b, fx) <= fx.radius * fx.radius) {
          b.active = false;
          emitParts(b.x, b.y, '#ff4fd8', 2);
        }
      });

      state.enemies.forEach(function (enemy) {
        if (!enemy.active || enemy.bombHit === fx.id) return;
        const hitRadius = fx.radius + enemy.radius;
        if (U.distanceSq(enemy, fx) > hitRadius * hitRadius) return;
        enemy.bombHit = fx.id;
        const mul = enemy.role === 'boss' ? 0.38 : enemy.type === 'elite' ? 0.65 : 1;
        enemy.hp -= Math.max(1, Math.round(bombDamage() * mul));
        enemy.emp = Math.max(enemy.emp || 0, bombEmpDuration());
        emitParts(enemy.x, enemy.y, '#ff4fd8', enemy.type === 'boss' ? 12 : 8);
        if (enemy.hp <= 0) killEnemy(enemy);
      });

      if (fx.life <= 0) fx.active = false;
    });
  }

  function updateStars(dt) {
    state.stars.forEach(function (star) {
      star.x -= star.speed * dt;
      if (star.x < -4) {
        star.x = state.w + 4;
        star.y = U.rand(0, state.h);
      }
    });
  }

  function updateParticles(dt) {
    state.parts.forEach(function (p) {
      if (!p.active) return;
      p.x += p.vx * dt; p.y += p.vy * dt;
      p.vx *= 0.96; p.vy *= 0.96;
      p.life -= dt;
      if (p.life <= 0) p.active = false;
    });
  }

  function update(dt) {
    processInput();
    state.clock += dt;
    updateStars(dt);
    updateParticles(dt);
    state.shake = Math.max(0, state.shake - dt * 18);
    state.soundCooldown = Math.max(0, state.soundCooldown - dt);
    if (state.phase !== 'playing') { state.beams = []; return; }
    if (activeWeapon() !== 'beam') state.beams = [];
    Object.keys(state.buff).forEach(function (k) { state.buff[k] = Math.max(0, state.buff[k] - dt); });
    if (state.buff.shield <= 0) state.shieldCharges = 0;
    updatePlayer(dt);
    updateWave(dt);
    updateEnemies(dt);
    updateBullets(dt);
    updateBombEffects(dt);
    updatePickups(dt);
    collisions();
    clean();
  }

  function view() {
      return createView(state, data, { label, shipData, damage, lanes, fireRate, range, utils: U });
  }

  function buffs() {
      return createBuffList(state);
  }

  function frame(now) {
    const dt = Math.min(0.033, Math.max(0.001, (now - lastTime) / 1000));
    lastTime = now;
    update(dt);
    draw(ctx, state, data);
    if (ui) ui.update();
    input.endFrame();
    raf = requestAnimationFrame(frame);
  }

  resize();
  state.player = E.createPlayer(state, data, U);
  state.bombs = Math.min(baseCfg().maxBombs, shipData().bombs || 2);
  window.addEventListener('resize', resize);

  return {
    setUI: function (nextUI) { ui = nextUI; },
    start: function () { if (!raf) raf = requestAnimationFrame(frame); },
    restart: function () { reset(false); },
    primary, togglePause, beginOverlay, endOverlay, bomb, buy, buyArmoryNode, respecArmoryRoute,
    level, cost, full, setShip, setWeapon, useItem,
    unlocked: function (key) { return !!state.unlocked[key]; },
    buffs, view,
    armoryView: function () { refreshArmoryEffects(); return armory.view(); },
    muted: audio.muted,
    toggleMute: audio.toggle
  };
};
