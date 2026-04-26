import * as U from '../core/utils.js';

let currentData = null;

const PIXEL_COLORS = {
  1: '#56f6ff',
  2: '#ffe66d',
  3: '#73ff9a',
  4: '#ff4fd8',
  5: '#ff6370',
  6: '#71a6ff',
  7: '#ffab4d',
  8: '#ecfbff'
};

function drawPixelSprite(ctx, icon, x, y, scale, alpha) {
  const pattern = currentData.icons[icon] || currentData.icons.unknown;
  const s = scale || 3;
  ctx.save();
  ctx.globalAlpha = alpha == null ? 1 : alpha;
  ctx.translate(Math.round(x - pattern[0].length * s / 2), Math.round(y - pattern.length * s / 2));
  pattern.forEach(function (row, yy) {
    row.split('').forEach(function (cell, xx) {
      if (cell === '0') return;
      ctx.fillStyle = PIXEL_COLORS[cell] || '#ecfbff';
      ctx.fillRect(xx * s, yy * s, s, s);
    });
  });
  ctx.restore();
}

function drawShip(ctx, player, scale, alpha) {
  const s = scale || 4;
  ctx.save();
  ctx.shadowColor = player.color || '#56f6ff';
  ctx.shadowBlur = 14;
  drawPixelSprite(ctx, player.icon || 'ship', player.x, player.y, s, alpha == null ? 1 : alpha);
  ctx.shadowBlur = 0;
  ctx.globalAlpha = 0.9;
  ctx.fillStyle = '#ffab4d';
  ctx.fillRect(Math.round(player.x + 16), Math.round(player.y - 4), 10, 3);
  ctx.fillRect(Math.round(player.x + 16), Math.round(player.y + 2), 8, 3);
  ctx.restore();
}

function drawDrone(ctx, x, y) {
  ctx.save();
  ctx.shadowColor = '#71a6ff';
  ctx.shadowBlur = 9;
  drawPixelSprite(ctx, 'drone', x, y, 2.5, 1);
  ctx.restore();
}

function drawBackground(ctx, state) {
  ctx.fillStyle = '#020611';
  ctx.fillRect(0, 0, state.w, state.h);

  const offset = Math.floor((state.clock * 16) % 32);
  ctx.fillStyle = 'rgba(86, 246, 255, 0.09)';
  for (let x = -offset; x < state.w; x += 32) ctx.fillRect(x, 0, 1, state.h);
  ctx.fillStyle = 'rgba(115, 255, 154, 0.05)';
  for (let x = 16 - offset; x < state.w; x += 128) ctx.fillRect(x, 0, 2, state.h);

  state.stars.forEach(function (star) {
    ctx.globalAlpha = star.alpha;
    ctx.fillStyle = star.size > 1 ? '#ecfbff' : '#70849a';
    ctx.fillRect(Math.round(star.x), Math.round(star.y), star.size, star.size);
  });
  ctx.globalAlpha = 1;
}

function drawBase(ctx, state) {
  const bx = state.base.x;
  const cy = state.h * 0.5;
  const ratio = U.clamp(state.base.hp / state.base.max, 0, 1);

  ctx.save();
  ctx.fillStyle = 'rgba(255, 230, 109, 0.09)';
  ctx.fillRect(bx, 0, 5, state.h);
  ctx.fillStyle = 'rgba(255, 230, 109, 0.45)';
  ctx.fillRect(bx + 2, 0, 1, state.h);

  ctx.fillStyle = 'rgba(17, 29, 61, 0.90)';
  ctx.fillRect(bx + 10, cy - 46, 24, 92);
  ctx.fillStyle = '#56f6ff';
  ctx.fillRect(bx + 6, cy - 38, 28, 6);
  ctx.fillRect(bx + 6, cy + 32, 28, 6);
  ctx.fillStyle = '#ffab4d';
  ctx.fillRect(bx + 15, cy - 18, 13, 36);

  ctx.strokeStyle = 'rgba(255, 230, 109, 0.42)';
  ctx.strokeRect(bx + 38, 18, 6, state.h - 36);
  ctx.fillStyle = '#ffab4d';
  ctx.fillRect(bx + 40, state.h - 20 - (state.h - 40) * ratio, 2, (state.h - 40) * ratio);
  ctx.restore();
}

function drawRangeGuide(ctx, state) {
  if (state.phase !== 'playing' && state.phase !== 'paused') return;
  const p = state.player;
  const r = typeof state.range === 'function' ? state.range() : p.baseRange || 360;
  const x = Math.round(Math.max(12, p.x - r));
  ctx.save();
  ctx.globalAlpha = 0.18;
  ctx.strokeStyle = '#56f6ff';
  ctx.setLineDash([5, 6]);
  ctx.beginPath();
  ctx.moveTo(x, 38);
  ctx.lineTo(x, state.h - 38);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.globalAlpha = 0.28;
  ctx.fillStyle = '#56f6ff';
  ctx.font = 'bold 11px Courier New';
  ctx.fillText('RANGE', x + 6, state.h - 44);
  ctx.restore();
}

function drawEnemy(ctx, enemy) {
  const data = currentData.enemies[enemy.type] || currentData.enemies.raider;
  const x = Math.round(enemy.x);
  const y = Math.round(enemy.y);
  const hpRatio = U.clamp(enemy.hp / enemy.max, 0, 1);
  const scale = enemy.type === 'boss' ? 7 : enemy.type === 'elite' ? 5 : (enemy.type === 'tank' || enemy.type === 'gunner') ? 4 : 3;

  ctx.save();
  if (enemy.emp > 0) {
    ctx.strokeStyle = 'rgba(113,166,255,0.72)';
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.arc(x, y, enemy.radius + 7 + Math.sin(enemy.emp * 12) * 2, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
  }
  ctx.shadowColor = data.color;
  ctx.shadowBlur = enemy.type === 'boss' ? 18 : 10;
  drawPixelSprite(ctx, data.icon, x, y, scale, 1);
  ctx.restore();

  ctx.fillStyle = 'rgba(0,0,0,0.55)';
  ctx.fillRect(x - enemy.radius, y - enemy.radius - 10, enemy.radius * 2, 4);
  ctx.fillStyle = (enemy.type === 'boss' || enemy.type === 'elite') ? '#ffe66d' : '#73ff9a';
  ctx.fillRect(x - enemy.radius, y - enemy.radius - 10, enemy.radius * 2 * hpRatio, 4);
}

function drawBullet(ctx, bullet) {
  ctx.save();
  if (bullet.kind === 'enemy') {
    ctx.fillStyle = '#ff6370';
    ctx.shadowColor = '#ff6370'; ctx.shadowBlur = 8;
    ctx.fillRect(Math.round(bullet.x - 3), Math.round(bullet.y - 3), 7, 7);
  } else if (bullet.kind === 'missile') {
    ctx.fillStyle = '#ffe66d';
    ctx.shadowColor = '#ffe66d'; ctx.shadowBlur = 10;
    ctx.fillRect(Math.round(bullet.x - 7), Math.round(bullet.y - 3), 14, 6);
    ctx.fillStyle = '#ffab4d';
    ctx.fillRect(Math.round(bullet.x + 4), Math.round(bullet.y - 2), 5, 4);
  } else {
    ctx.fillStyle = bullet.critical ? '#ffe66d' : '#56f6ff';
    ctx.shadowColor = bullet.critical ? '#ffe66d' : '#56f6ff'; ctx.shadowBlur = bullet.critical ? 12 : 8;
    ctx.fillRect(Math.round(bullet.x - 10), Math.round(bullet.y - 2), 15, 4);
    if (bullet.pierce > 0) ctx.fillRect(Math.round(bullet.x - 15), Math.round(bullet.y - 1), 3, 2);
  }
  ctx.restore();
}

function drawPickup(ctx, pickup, state) {
  const data = currentData.pickups[pickup.type] || currentData.pickups.credits;
  const pulse = pickup.radius * (1 + Math.sin(state.clock * 6 + pickup.pulse) * 0.12);

  ctx.save();
  ctx.translate(Math.round(pickup.x), Math.round(pickup.y));
  ctx.shadowColor = data.color; ctx.shadowBlur = 18;
  ctx.strokeStyle = data.color; ctx.globalAlpha = 0.50; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(0, 0, pulse + 8, 0, Math.PI * 2); ctx.stroke();
  ctx.globalAlpha = 1;
  ctx.fillStyle = 'rgba(2,8,18,0.86)'; ctx.fillRect(-12, -12, 24, 24);
  ctx.restore();
  drawPixelSprite(ctx, data.icon, pickup.x, pickup.y, 3, 1);
}

function drawParticles(ctx, state) {
  state.parts.forEach(function (p) {
    ctx.globalAlpha = U.clamp(p.life / p.max, 0, 1);
    ctx.fillStyle = p.color;
    ctx.fillRect(Math.round(p.x), Math.round(p.y), Math.max(1, p.radius), Math.max(1, p.radius));
  });
  ctx.globalAlpha = 1;
}

function drawBombEffects(ctx, state) {
  state.bombEffects.forEach(function (fx) {
    if (!fx.active) return;
    const t = U.clamp(1 - fx.life / fx.max, 0, 1);
    const alpha = U.clamp(fx.life / fx.max, 0, 1);
    ctx.save();
    ctx.globalAlpha = 0.28 * alpha;
    ctx.strokeStyle = '#ff4fd8';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(fx.x, fx.y, fx.radius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.globalAlpha = 0.16 * alpha;
    ctx.fillStyle = '#ff4fd8';
    ctx.beginPath();
    ctx.arc(fx.x, fx.y, Math.max(10, fx.radius * 0.18), 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 0.45 * alpha;
    ctx.strokeStyle = '#56f6ff';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(fx.x, fx.y, fx.radius * (0.62 + 0.16 * t), 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  });
}

function drawFooter(ctx, state) {
  const waveIdx = Math.min(state.waveIndex, currentData.waves.length - 1);
  const wave = currentData.waves[waveIdx];
  const progress = state.total ? U.clamp(state.defeated / state.total, 0, 1) : (state.done / currentData.waves.length);

  ctx.save();
  ctx.font = 'bold 12px Courier New';
  ctx.textBaseline = 'middle';
  ctx.globalAlpha = 0.58;
  ctx.fillStyle = '#56f6ff';
  ctx.fillText(state.label() + ' · HP ' + Math.round(state.player.hp) + '/' + state.player.max, 14, state.h - 18);

  const w = 118;
  const h = 4;
  const x = state.w - w - 16;
  const y = state.h - 20;
  ctx.textAlign = 'right';
  ctx.fillStyle = '#ecfbff';
  ctx.fillText(String(waveIdx + 1).padStart(2, '0') + '/' + currentData.waves.length + ' ' + wave.kind, state.w - 16, y - 11);
  ctx.globalAlpha = 0.30;
  ctx.fillStyle = '#ecfbff';
  ctx.fillRect(x, y, w, h);
  ctx.globalAlpha = 0.62;
  ctx.fillStyle = wave.boss ? '#ff4fd8' : wave.elite ? '#ffe66d' : '#56f6ff';
  ctx.fillRect(x, y, Math.round(w * progress), h);
  ctx.restore();
}

export function draw(ctx, state, data) {
  currentData = data;
  ctx.save();
  if (state.shake > 0) ctx.translate(U.rand(-state.shake, state.shake), U.rand(-state.shake, state.shake));

  drawBackground(ctx, state);
  drawBase(ctx, state);
  drawRangeGuide(ctx, state);

  state.pickups.forEach(function (p) { drawPickup(ctx, p, state); });
  state.bullets.forEach(function (b) { drawBullet(ctx, b); });
  state.missiles.forEach(function (m) {
    m.trail.forEach(function (t) {
      ctx.save();
      ctx.globalAlpha = t.life / 0.25;
      ctx.fillStyle = '#ffab4d';
      ctx.fillRect(Math.round(t.x), Math.round(t.y), 4, 4);
      ctx.restore();
    });
    drawBullet(ctx, m);
  });
  state.ebullets.forEach(function (b) { drawBullet(ctx, b); });
  drawBombEffects(ctx, state);
  state.enemies.forEach(function (e) { drawEnemy(ctx, e); });

  const blink = state.player.inv > 0 && Math.floor(state.clock * 16) % 2 === 0;
  if (!blink) drawShip(ctx, state.player, 4, 1);

  if ((state.buff.shield > 0 && state.shieldCharges > 0) || state.player.inv > 0) {
    ctx.strokeStyle = state.buff.shield > 0 ? 'rgba(86,246,255,0.85)' : 'rgba(255,255,255,0.44)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(state.player.x, state.player.y, state.player.radius + 8 + Math.sin(state.clock * 8) * 2, 0, Math.PI * 2);
    ctx.stroke();
  }

  if (state.level('drone') > 0) {
    const offsets = state.level('drone') >= 2 ? [-30, 30] : [-30];
    offsets.forEach(function (off) { drawDrone(ctx, state.player.x + 14, state.player.y + off); });
  }

  drawParticles(ctx, state);
  ctx.restore();
};
