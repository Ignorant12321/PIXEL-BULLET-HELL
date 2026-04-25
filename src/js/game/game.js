(function (PSD) {
  'use strict';

  const U = PSD.U;
  const E = PSD.entities;

  PSD.game.create = function createGame(canvas) {
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;

    const input = PSD.input.create(canvas);
    const audio = PSD.audio.create();
    let ui = null;
    let raf = 0;
    let lastTime = performance.now();

    function baseCfg() {
      return (PSD.data.difficulty && PSD.data.difficulty.base) || {
        coins:80, baseHp:160, maxBombs:6, bulletSpeed:560, rangeUpgrade:45,
        hullUpgradeHp:18, hullRepair:34, baseRepair:34, pickupHullRepair:14, pickupBaseRepair:16
      };
    }

    function firstShipId() {
      const ships = PSD.data.starships || [];
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
      best: Number(localStorage.getItem(PSD.data.storage.best)) || 0,
      bombs: 2,
      shipId: U.load(PSD.data.storage.ship, firstShipId()),
      base: { x: 920, hp: baseCfg().baseHp, max: baseCfg().baseHp, radius: 22 },
      player: null,
      up: {},
      unlocked: U.load(PSD.data.storage.codex, { 'weapon:cannon': true, 'weapon:bomb': true }),
      buff: { shield: 0, overdrive: 0, inv: 0, timeSlow: 0, bounty: 0 },
      shieldCharges: 0,
      bullets: [], ebullets: [], missiles: [], bombEffects: [],
      enemies: [], pickups: [], parts: [], stars: [],
      shake: 0, soundCooldown: 0, bombSeq: 0
    };

    PSD.data.upgrades.forEach(function (u) { state.up[u.id] = 0; });
    state.level = level;
    state.label = label;
    state.range = range;
    state.ship = shipData;

    function shipData() {
      const ships = PSD.data.starships || [];
      return ships.find(function (ship) { return ship.id === state.shipId; }) || ships[0] || { id:'swift', name:'逐光号', bombs:2 };
    }

    function label() {
      return { ready:'待命', playing:'作战中', paused:'暂停', intermission:'备战', gameover:'失败', victory:'胜利' }[state.phase] || state.phase;
    }
    function level(id) { return Number(state.up[id]) || 0; }
    function damage() { return Math.max(1, Math.round((state.player ? state.player.damageBase : 1) + level('damage'))); }
    function lanes() { return 1 + level('lanes'); }
    function range() { return Math.round((state.player ? state.player.baseRange : 360) + level('range') * baseCfg().rangeUpgrade); }
    function fireRate() {
      const shipBonus = state.player ? state.player.fireRateBonus : 0;
      return Math.max(0.35, 1 + shipBonus + level('fireRate') * 0.18 + (state.buff.overdrive > 0 ? 0.72 : 0));
    }
    function critChance() { return Math.min(0.35, level('crit') * 0.08); }
    function coinMultiplier() {
      const shipBonus = state.player ? state.player.coinBonus : 0;
      return 1 + shipBonus + level('salvage') * 0.12 + (state.buff.bounty > 0 ? 0.50 : 0);
    }
    function baseDamageFactor() {
      const shipArmor = state.player ? state.player.baseArmor : 0;
      return Math.max(0.42, 1 - shipArmor - level('baseArmor') * 0.12);
    }
    function bombRadius() { return Math.min(state.w * 0.44, 220 + level('bombCore') * 34); }
    function bombDamage() { return 32 + damage() * 5 + level('bombCore') * 10; }
    function bombEmpDuration() { return 1.7 + level('bombCore') * 0.35; }
    function armAudio() { if (audio.unlock) audio.unlock(); }

    function cost(item) {
      if (item.type === 'service') return item.baseCost;
      return Math.round(item.baseCost * Math.pow(item.growth || 1, level(item.id)) / 5) * 5;
    }
    function full(id) {
      if (id === 'repairHull') return state.player.hp >= state.player.max;
      if (id === 'repairBase') return state.base.hp >= state.base.max;
      if (id === 'bombPack') return state.bombs >= baseCfg().maxBombs;
      return false;
    }
    function unlock(key) {
      if (!key || state.unlocked[key]) return;
      state.unlocked[key] = true;
      U.save(PSD.data.storage.codex, state.unlocked);
    }
    function emitParts(x, y, color, n) {
      for (let i = 0; i < n; i++) state.parts.push(E.createParticle(x, y, color));
    }
    function saveBest() {
      if (state.score <= state.best) return;
      state.best = state.score;
      try { localStorage.setItem(PSD.data.storage.best, String(state.best)); } catch (_) {}
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
      state.player = E.createPlayer(state);
      state.bombs = Math.min(cfg.maxBombs, shipData().bombs || 2);
      state.buff = { shield: 0, overdrive: 0, inv: 0, timeSlow: 0, bounty: 0 };
      state.shieldCharges = 0;
      state.bullets = []; state.ebullets = []; state.missiles = []; state.bombEffects = [];
      state.enemies = []; state.pickups = []; state.parts = [];
      state.shake = 0; state.bombSeq = 0;
      Object.keys(state.up).forEach(function (k) { state.up[k] = 0; });
      unlock('weapon:cannon');
      unlock('weapon:bomb');
      if (ui && !silent) ui.toast('系统重启，防线待命');
    }

    function setShip(id) {
      const ship = (PSD.data.starships || []).find(function (item) { return item.id === id; });
      if (!ship) return false;
      if (state.phase !== 'ready') {
        if (ui) ui.toast('舰型只能在开局待命时切换');
        return false;
      }
      state.shipId = id;
      U.save(PSD.data.storage.ship, id);
      reset(true);
      if (ui) ui.toast('已选择：' + ship.name);
      return true;
    }

    function buildQueue(wave) {
      let t = 0.38;
      const queue = [];
      const waveCfg = ((PSD.data.difficulty || {}).waves || [])[state.waveIndex] || {};
      const spawnScale = waveCfg.spawn || 1;
      wave.entries.forEach(function (entry) {
        const type = entry[0], count = entry[1];
        for (let i = 0; i < count; i++) {
          t += ((type === 'tank' || type === 'elite' || type === 'boss') ? 1.05 : 0.48) * spawnScale;
          queue.push({ time: t, type, spawned: false });
        }
      });
      return queue;
    }

    function startWave() {
      if (state.waveIndex >= PSD.data.waves.length) { state.phase = 'victory'; return; }
      const wave = PSD.data.waves[state.waveIndex];
      const ship = shipData();
      state.time = 0;
      state.queue = buildQueue(wave);
      state.total = wave.entries.reduce(function (s, e) { return s + e[1]; }, 0);
      state.spawned = 0; state.defeated = 0;
      state.enemies = []; state.ebullets = [];
      state.bullets = []; state.missiles = []; state.pickups = []; state.bombEffects = [];
      state.phase = 'playing';
      const shieldBonus = ship.shieldAtWave || 0;
      if (level('shield') > 0 || shieldBonus > 0) {
        state.buff.shield = Math.max(state.buff.shield, 4 + level('shield') * 2 + shieldBonus * 2);
        state.shieldCharges = Math.max(state.shieldCharges, 1 + Math.max(0, shieldBonus - 1));
      }
      audio.beep(520, 0.08, 'triangle');
      if (ui) ui.toast('第 ' + wave.wave + ' 波开始：' + wave.kind);
    }

    function completeWave() {
      const wave = PSD.data.waves[state.waveIndex];
      state.coins += wave.reward;
      state.player.hp = Math.min(state.player.max, state.player.hp + 10);
      state.done = Math.max(state.done, state.waveIndex + 1);
      state.waveIndex += 1;
      state.ebullets = []; state.bullets = []; state.missiles = []; state.pickups = []; state.bombEffects = [];
      if (state.waveIndex >= PSD.data.waves.length) {
        state.phase = 'victory';
        if (ui) ui.toast('第一幕完成！');
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
      state.ebullets = []; state.bombEffects = []; state.shake = 12;
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
      const p = state.player;
      const r = range() + (extra || 0);
      return state.enemies.some(function (enemy) {
        return enemy.active && enemy.x <= p.x + enemy.radius && (p.x - enemy.x) <= r + enemy.radius;
      });
    }

    function nearestTargetInRange(extra) {
      const p = state.player;
      const r = range() + (extra || 0);
      return state.enemies.filter(function (enemy) {
        return enemy.active && enemy.x <= p.x + enemy.radius && (p.x - enemy.x) <= r + enemy.radius;
      }).sort(function (a, b) { return U.distanceSq(p, a) - U.distanceSq(p, b); })[0];
    }

    function fireMain() {
      if (!hasTargetInRange(20)) {
        state.player.shootTimer = 0.08;
        return;
      }
      const count = lanes();
      const spd = baseCfg().bulletSpeed || 560;
      const effectiveRange = range();
      const angles = count === 1 ? [Math.PI]
                   : count === 2 ? [Math.PI - 0.09, Math.PI + 0.09]
                   : [Math.PI, Math.PI - 0.17, Math.PI + 0.17];
      angles.forEach(function (angle, i) {
        const off = (i - (angles.length - 1) / 2) * 7;
        const isCrit = Math.random() < critChance();
        const bullet = E.createBullet('player', state.player.x - 22, state.player.y + off, Math.cos(angle) * spd, Math.sin(angle) * spd, 5, damage() * (isCrit ? 2 : 1), { range: effectiveRange });
        bullet.pierce = level('pierce');
        bullet.critical = isCrit;
        state.bullets.push(bullet);
      });
      state.player.shootTimer = 1 / (3 * fireRate());
      state.soundCooldown -= state.player.shootTimer;
      if (state.soundCooldown <= 0) {
        audio.beep(620, 0.04); state.soundCooldown = 0.12;
      }
    }
    function fireMissile() {
      const target = nearestTargetInRange(range() * 0.25);
      if (!target) { state.player.missileTimer = 0.20; return; }
      const lvl = level('missile');
      state.missiles.push(E.createMissile(state.player.x - 24, state.player.y + U.rand(-10,10), 5 + lvl * 4 + Math.floor(damage() * 0.6), range() * 1.35));
      state.player.missileTimer = Math.max(0.7, 1.85 - lvl * 0.28);
      unlock('upgrade:missile');
    }
    function fireDrone() {
      if (!hasTargetInRange(10)) { state.player.droneTimer = 0.16; return; }
      const lvl = level('drone');
      const offsets = lvl >= 2 ? [-24, 24] : [-24];
      offsets.forEach(function (off) {
        state.bullets.push(E.createBullet('player', state.player.x - 28, state.player.y + off, -520, 0, 5, Math.max(1, lvl + Math.floor(damage() * 0.25)), { range: range() * 0.88 }));
      });
      state.player.droneTimer = 0.42;
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
        const slow = k.slow ? 0.52 : 1;
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
      if (p.shootTimer <= 0) fireMain();
      if (level('missile') > 0 && p.missileTimer <= 0) fireMissile();
      if (level('drone') > 0 && p.droneTimer <= 0) fireDrone();
    }

    function spawnEnemy(type) {
      state.enemies.push(E.createEnemy(type, state));
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
      const spd = enemy.type === 'boss' ? 185 : 170;
      const angle = U.angleTo(enemy, state.player);
      const shots = enemy.type === 'boss' ? [-0.16, 0, 0.16] : [0];
      shots.forEach(function (spread) {
        const a = angle + spread;
        state.ebullets.push(E.createBullet('enemy', enemy.x + 18, enemy.y, Math.cos(a)*spd, Math.sin(a)*spd, 5, damageValue, { range: 9999 }));
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
        if (enemy.type !== 'boss' && enemy.x >= state.base.x - enemy.radius) {
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
      const sx = b.vx * dt;
      const sy = b.vy * dt;
      b.x += sx; b.y += sy;
      b.traveled = (b.traveled || 0) + Math.hypot(sx, sy);
      b.life -= dt;
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
      const chance = enemy.type === 'boss' ? 1 : enemy.type === 'elite' ? 0.68 : 0.20;
      if (Math.random() > chance) return;
      const r = Math.random();
      const type = r < 0.16 ? 'hull'
                 : r < 0.30 ? 'shield'
                 : r < 0.44 ? 'overdrive'
                 : r < 0.58 ? 'bomb'
                 : r < 0.72 ? 'credits'
                 : r < 0.84 ? 'basekit'
                 : r < 0.94 ? 'timeslow'
                 : 'bounty';
      state.pickups.push(E.createPickup(type, enemy.x, enemy.y));
      unlock('pickup:' + type);
    }

    function killEnemy(enemy) {
      if (!enemy || !enemy.active) return;
      enemy.active = false; state.defeated += 1;
      const coinReward = Math.max(1, Math.round(enemy.reward * coinMultiplier()));
      state.score += enemy.score; state.coins += coinReward; state.kills += 1;
      unlock('enemy:' + enemy.type);
      drop(enemy);
      emitParts(enemy.x, enemy.y, enemy.color, enemy.type === 'boss' ? 26 : 12);
      state.shake = Math.max(state.shake, enemy.type === 'boss' ? 16 : 5);
      audio.beep(enemy.type === 'boss' ? 180 : 260, enemy.type === 'boss' ? 0.15 : 0.06, 'sawtooth');
      saveBest();
    }

    function applyPickup(type) {
      const info = PSD.data.pickups[type] || PSD.data.pickups.credits;
      unlock('pickup:' + type);
      if (type === 'hull') {
        state.player.hp = Math.min(state.player.max, state.player.hp + baseCfg().pickupHullRepair);
      } else if (type === 'shield') {
        state.buff.shield = Math.max(state.buff.shield, info.duration + level('shield'));
        state.shieldCharges = Math.max(state.shieldCharges, 1);
      } else if (type === 'overdrive') {
        state.buff.overdrive = Math.max(state.buff.overdrive, info.duration);
      } else if (type === 'bomb') {
        state.bombs = Math.min(baseCfg().maxBombs, state.bombs + 1);
      } else if (type === 'credits') {
        state.coins += 28 + Math.floor(Math.random() * 24);
      } else if (type === 'basekit') {
        state.base.hp = Math.min(state.base.max, state.base.hp + baseCfg().pickupBaseRepair);
      } else if (type === 'timeslow') {
        state.buff.timeSlow = Math.max(state.buff.timeSlow, info.duration);
        state.enemies.forEach(function (enemy) { enemy.emp = Math.max(enemy.emp || 0, 1.2); });
      } else if (type === 'bounty') {
        state.buff.bounty = Math.max(state.buff.bounty, info.duration);
      }
      audio.beep(960, 0.07, 'triangle');
      if (ui) ui.toast(info.name + ' 已回收');
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
      state.bullets.concat(state.missiles).forEach(function (bullet) {
        if (!bullet || !bullet.active) return;
        for (let i = 0; i < state.enemies.length; i++) {
          const enemy = state.enemies[i];
          if (!enemy || !enemy.active) continue;
          if (!U.hit(bullet, enemy, bullet.kind === 'missile' ? 4 : 0)) continue;
          enemy.hp -= bullet.damage;
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
      state.ebullets.forEach(function (b) {
        if (!b || !b.active) return;
        if (!U.hit(b, state.player, 1)) return;
        b.active = false; damagePlayer(b.damage);
        emitParts(b.x, b.y, '#ff6370', 6);
      });
      state.enemies.forEach(function (enemy) {
        if (!enemy || !enemy.active) return;
        if (!U.hit(enemy, state.player, 1)) return;
        damagePlayer(enemy.damage);
        if (enemy.type !== 'boss' && enemy.type !== 'elite') {
          markEnemyGone(enemy);
          emitParts(enemy.x, enemy.y, enemy.color, 10);
        }
      });
      state.pickups.forEach(function (p) {
        if (!p || !p.active) return;
        if (!U.hit(p, state.player, 2)) return;
        p.active = false; applyPickup(p.type);
      });
    }

    function clean() {
      state.bullets = state.bullets.filter(function (x) { return x && x.active; });
      state.ebullets = state.ebullets.filter(function (x) { return x && x.active; });
      state.missiles = state.missiles.filter(function (x) { return x && x.active; });
      state.enemies = state.enemies.filter(function (x) { return x && x.active; });
      state.pickups = state.pickups.filter(function (x) { return x && x.active; });
      state.parts = state.parts.filter(function (x) { return x && x.active; });
      state.bombEffects = state.bombEffects.filter(function (x) { return x && x.active; });
    }

    function bomb() {
      armAudio();
      if (state.phase !== 'playing') { if (ui) ui.toast('作战中才能释放歼灭弹'); return false; }
      if (state.bombs <= 0) { if (ui) ui.toast('歼灭弹不足'); return false; }
      state.bombs -= 1;
      unlock('weapon:bomb');
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
      const item = PSD.data.upgrades.find(function (u) { return u.id === id; });
      if (!item) return false;
      const price = cost(item);
      if (full(id)) { if (ui) ui.toast('当前已经达到上限'); return false; }
      if (state.coins < price) { if (ui) ui.toast('晶币不足'); return false; }
      if (level(id) >= item.max && item.type !== 'service' && item.type !== 'blind') { if (ui) ui.toast('该项目已满级'); return false; }
      state.coins -= price;
      if (item.type === 'service') {
        if (id === 'repairHull') state.player.hp = Math.min(state.player.max, state.player.hp + baseCfg().hullRepair);
        if (id === 'repairBase') state.base.hp = Math.min(state.base.max, state.base.hp + baseCfg().baseRepair);
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
      }
      audio.beep(720, 0.07);
      if (ui) ui.toast(item.name + ' 已采购');
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
          const mul = enemy.type === 'boss' ? 0.38 : enemy.type === 'elite' ? 0.65 : 1;
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
      if (state.phase !== 'playing') return;
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
      const idx = Math.min(state.waveIndex, PSD.data.waves.length - 1);
      const wave = PSD.data.waves[idx];
      const ship = shipData();
      return {
        phase: state.phase, label: label(),
        score: state.score, coins: state.coins, best: state.best,
        waveIndex: idx, done: state.done,
        progress: state.total ? U.clamp(state.defeated / state.total * 100, 0, 100) : 0,
        waveName: wave.name, kind: wave.kind,
        left: Math.max(0, state.total - state.defeated),
        hp: state.player.hp, maxHp: state.player.max,
        base: state.base.hp, maxBase: state.base.max,
        damage: damage(), lanes: lanes(), rate: fireRate(), range: range(), bombs: state.bombs,
        shipId: state.shipId, shipName: ship.name, shipIcon: ship.icon
      };
    }

    function buffs() {
      const list = [];
      if (state.buff.shield > 0 && state.shieldCharges > 0) list.push({ icon:'◇', name:'护盾', time: state.buff.shield, max: 10 });
      if (state.buff.overdrive > 0) list.push({ icon:'⚡', name:'超频', time: state.buff.overdrive, max: 8 });
      if (state.buff.timeSlow > 0) list.push({ icon:'◷', name:'时滞', time: state.buff.timeSlow, max: 5 });
      if (state.buff.bounty > 0) list.push({ icon:'￥', name:'赏金', time: state.buff.bounty, max: 8 });
      if (state.buff.inv > 0) list.push({ icon:'✚', name:'无敌', time: state.buff.inv, max: 1 });
      return list;
    }

    function frame(now) {
      const dt = Math.min(0.033, Math.max(0.001, (now - lastTime) / 1000));
      lastTime = now;
      update(dt);
      PSD.render.draw(ctx, state);
      if (ui) ui.update();
      input.endFrame();
      raf = requestAnimationFrame(frame);
    }

    resize();
    state.player = E.createPlayer(state);
    state.bombs = Math.min(baseCfg().maxBombs, shipData().bombs || 2);
    window.addEventListener('resize', resize);

    return {
      setUI: function (nextUI) { ui = nextUI; },
      start: function () { if (!raf) raf = requestAnimationFrame(frame); },
      restart: function () { reset(false); },
      primary, togglePause, beginOverlay, endOverlay, bomb, buy, level, cost, full, setShip,
      unlocked: function (key) { return !!state.unlocked[key]; },
      buffs, view,
      muted: audio.muted,
      toggleMute: audio.toggle
    };
  };
}(window.PSD));
