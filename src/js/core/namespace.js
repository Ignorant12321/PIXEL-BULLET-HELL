(function () {
  'use strict';

  const PSD = {
    data: {}, audio: {}, input: {}, entities: {},
    render: {}, game: {}, ui: {}, U: {}
  };

  const U = PSD.U;

  U.clamp = function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); };
  U.rand  = function rand(lo, hi)     { return lo + Math.random() * (hi - lo); };

  U.norm = function norm(x, y) {
    const len = Math.hypot(x, y) || 1;
    return { x: x / len, y: y / len };
  };

  U.distanceSq = function distanceSq(a, b) {
    const dx = (a ? a.x : 0) - (b ? b.x : 0);
    const dy = (a ? a.y : 0) - (b ? b.y : 0);
    return dx * dx + dy * dy;
  };

  U.hit = function hit(a, b, padding) {
    if (!a || !b) return false;
    const r = (a.radius || 0) + (b.radius || 0) + (padding || 0);
    return U.distanceSq(a, b) <= r * r;
  };

  U.angleTo = function angleTo(a, b) {
    return Math.atan2((b ? b.y : 0) - (a ? a.y : 0), (b ? b.x : 0) - (a ? a.x : 0));
  };

  U.escapeHtml = function escapeHtml(v) {
    return String(v)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#039;');
  };

  U.num = function num(v) {
    const n = Number(v);
    return Number.isFinite(n) ? Math.floor(n).toLocaleString('zh-CN') : '0';
  };

  U.load = function load(key, fallback) {
    try { const r = localStorage.getItem(key); return r ? JSON.parse(r) : fallback; }
    catch (_) { return fallback; }
  };

  U.save = function save(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch (_) {}
  };

  U.icon = function icon(name) {
    const pattern = (PSD.data.icons || {})[name] || (PSD.data.icons || {}).unknown || [];
    const cells = pattern.join('').split('').map(function (c) {
      return '<b class="' + (c === '0' ? '' : 'c' + c) + '"></b>';
    }).join('');
    return '<div class="pix" aria-hidden="true">' + cells + '</div>';
  };

  U.pick = function pick(list) { return list[Math.floor(Math.random() * list.length)]; };

  window.PSD = PSD;
}());
