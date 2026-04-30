import { $, safeRatio } from './dom.js';
import { buildHudReadouts } from './hud-view.js';
import { createShopPanel } from './shop.js';
import { createCodexPanel } from './codex.js';

export function createUI(game, data, U) {
  const e = {
    score: $('scoreText'), coin: $('coinText'), wave: $('waveText'), best: $('bestText'),
    statCards: Array.prototype.slice.call(document.querySelectorAll('[data-hud]')),
    act: $('actText'),
    waveCount: $('waveCount'), waveFill: $('waveFill'), waveNodes: $('waveNodes'),
    hp: $('hpText'), hpFill: $('hpFill'), base: $('baseText'), baseFill: $('baseFill'),
    damage: $('damageText'), lane: $('laneText'), rate: $('rateText'), range: $('rangeText'),
    bomb: $('bombText'), bombTop: $('bombTop'), phase: $('phaseText'), itemTray: $('itemTray'),
    arenaBuffs: $('arenaBuffs'), shipInfo: $('shipInfo'),
    weaponSwitch: $('weaponSwitch'), weaponDetail: $('weaponDetail'), weaponLabel: $('weaponLabel'),
    brief: $('brief'), briefTitle: $('briefTitle'), briefText: $('briefText'),
    briefNext: $('briefNext'), briefShop: $('briefShop'), briefRestart: $('briefRestart'),
    start: $('startBtn'), startIcon: $('startIcon'), startLabel: $('startLabel'),
    pause: $('pauseBtn'), pauseIcon: $('pauseIcon'),
    shop: $('shopBtn'), codex: $('codexBtn'),
    bombBtn: $('bombBtn'), mute: $('muteBtn'), muteText: $('muteText'),
    toast: $('toast'), layer: $('modalLayer'),
    shopModal: $('shopModal'), codexModal: $('codexModal'),
    shopCoin: $('shopCoin'), shopTabs: $('shopTabs'), shopGrid: $('shopGrid'),
    codexTabs: $('codexTabs'), codexGrid: $('codexGrid'),
    shipSelect: $('shipSelect'),
    shopBack: $('shopBack'), codexBack: $('codexBack')
  };

  const st = {
    modal: null, toastTimer: 0,
    shipKey: '', weaponKey: '', itemKey: '', buffKey: '', hudKey: ''
  };

  const shopPanel = createShopPanel(game, data, U, e, {
    onBought: function () {
      st.weaponKey = '';
      renderWeaponPanel(game.view());
    }
  });
  const codexPanel = createCodexPanel(game, data, U, e);

  function shipById(id) {
    return (data.starships || []).find(function (ship) { return ship.id === id; }) || data.starships[0] || null;
  }

  function updateWave(view) {
    if (!e.waveNodes || !e.waveFill || !e.waveCount) return;
    e.waveNodes.innerHTML = data.waves.map(function (wave, idx) {
      const cls = ['node'];
      if (idx < view.done) cls.push('done');
      if (idx === view.waveIndex && view.done < data.waves.length) cls.push('cur');
      if (wave.elite) cls.push('elite');
      if (wave.boss) cls.push('boss');
      return '<div class="' + cls.join(' ') + '">' + (wave.boss ? 'B' : idx + 1) + '</div>';
    }).join('');
    const fill = (view.done + (view.phase === 'playing' ? view.progress / 100 : 0)) / data.waves.length;
    e.waveFill.style.width = U.clamp(fill, 0, 1) * 100 + '%';
    e.waveCount.textContent = Math.min(data.waves.length, view.waveIndex + 1) + ' / ' + data.waves.length;
  }

  function updateBuffs(list) {
    if (!e.arenaBuffs) return;
    const key = list.map(function (b) { return b.name + ':' + b.time.toFixed(1); }).join('|');
    if (st.buffKey === key) return;
    st.buffKey = key;
    if (!list.length) { e.arenaBuffs.innerHTML = ''; return; }
    e.arenaBuffs.innerHTML = list.map(function (b) {
      const pct = U.clamp(b.time / (b.max || 10), 0, 1);
      return '<span class="buff" title="' + U.escapeHtml(b.name) + '：' + b.time.toFixed(1) + 's" style="--p:' + pct.toFixed(2) + '"><span>' + b.icon + '</span><em>' + U.escapeHtml(b.name) + '</em><b>' + b.time.toFixed(1) + 's</b></span>';
    }).join('');
  }

  function renderShipSelect(view) {
    if (!e.shipSelect) return;
    if (view.phase !== 'ready') {
      e.shipSelect.classList.add('hidden');
      return;
    }
    e.shipSelect.classList.remove('hidden');
    const key = view.shipId + ':' + (data.starships || []).length;
    if (st.shipKey === key && e.shipSelect.innerHTML) return;
    st.shipKey = key;
    e.shipSelect.innerHTML = (data.starships || []).map(function (ship) {
      const selected = ship.id === view.shipId;
      return [
        '<button type="button" class="ship-card ' + (selected ? 'selected' : '') + '" data-ship="' + ship.id + '" title="' + U.escapeHtml(ship.special) + '">',
        U.icon(ship.icon, data.icons),
        '<strong>' + U.escapeHtml(ship.name) + '</strong>',
        '<small>' + U.escapeHtml(ship.role + ' · HP ' + ship.hp + ' · 伤 ' + ship.damage + ' · 程 ' + ship.range) + '</small>',
        '<span>' + U.escapeHtml(ship.special) + '</span>',
        '</button>'
      ].join('');
    }).join('');
    e.shipSelect.querySelectorAll('[data-ship]').forEach(function (btn) {
      btn.onclick = function () {
        if (game.setShip(btn.dataset.ship)) {
          st.shipKey = '';
          renderShipInfo(game.view());
          update();
        }
      };
    });
  }

  function updateBrief(view) {
    if (st.modal || view.phase === 'playing') {
      e.brief.classList.add('hidden');
      if (e.shipSelect) e.shipSelect.classList.add('hidden');
      return;
    }
    const map = {
      ready: ['选择星舰', '选择一艘星舰并守住右侧基地。', '开始'],
      paused: ['暂停', '战斗已暂停。', '继续'],
      intermission: ['备战', '上一波已清空。可补给后继续下一波。', '下一波'],
      gameover: ['防线失守', '星舰生命或基地生命归零。', '重开'],
      victory: ['战役完成', '两幕防线已全部突破。', '重开']
    };
    const item = map[view.phase] || map.ready;
    e.brief.classList.remove('hidden');
    e.briefTitle.textContent = item[0];
    e.briefText.textContent = item[1];
    e.briefNext.textContent = item[2];
    renderShipSelect(view);
  }

  function renderShipInfo(view) {
    if (!e.shipInfo) return;
    const ship = shipById(view.shipId);
    if (!ship) { e.shipInfo.innerHTML = ''; return; }
    e.shipInfo.innerHTML = [
      '<div class="ship-overview">',
      '<div class="ship-title"><div class="ship-icon">', U.icon(ship.icon, data.icons), '</div><div class="ship-copy">',
      '<h3>' + U.escapeHtml(ship.name) + '</h3>',
      '<small>' + U.escapeHtml(ship.role) + '</small>',
      '</div></div>',
      '<div class="ship-copy">',
      '<p>' + U.escapeHtml(ship.brief || ship.special || '') + '</p>',
      '<p class="ship-special">' + U.escapeHtml(ship.special || '') + '</p>',
      '</div>',
      '</div>',
      '<div class="ship-facts">',
      '<div><span>基础生命</span><strong>' + ship.hp + '</strong></div>',
      '<div><span>基础伤害</span><strong>' + ship.damage + '</strong></div>',
      '<div><span>基础射程</span><strong>' + ship.range + '</strong></div>',
      '<div><span>歼灭弹</span><strong>' + ship.bombs + '</strong></div>',
      '</div>'
    ].join('');
  }

  function buildWeaponOptions(view) {
    const list = [
      {
        id: 'cannon', name: '单轨主炮', icon: 'cannon', tag: '自动',
        state: '伤害 ' + view.damage + ' · 弹道 ' + view.lanes + ' · 射速 ' + view.rate.toFixed(1) + 'x · 射程 ' + view.range,
        desc: '默认持续开火的基础武器，受伤害、射速、射程、穿透与弹道升级影响。'
      }
    ];
    if (game.level('sniper') > 0) {
      list.push({ id: 'sniper', name: '狙击炮', icon: 'sniper', tag: 'Lv ' + game.level('sniper'), state: '高伤害 · 慢射速 · 远射程 · 可穿透', desc: '适合点杀精英和 Boss。单发伤害很高，但每次装填更慢。' });
    }
    if (game.level('beam') > 0) {
      list.push({ id: 'beam', name: '高能射线', icon: 'beam', tag: 'Lv ' + game.level('beam'), state: '持续锁定 · 低单跳伤害 · 微弱压制', desc: '自动灼烧最近目标，伤害稳定但爆发较低，适合处理高速小怪。' });
    }
    if (game.level('missile') > 0) {
      list.push({ id: 'missile', name: '微型导弹舱', icon: 'missile', tag: 'Lv ' + game.level('missile'), state: '追踪打击 · 射程联动 · 中速装填', desc: '切换后主火力变为追踪导弹；未装备时仍会作为副武器间歇支援。' });
    }
    return list;
  }

  function renderWeaponPanel(view) {
    if (!e.weaponSwitch || !e.weaponDetail) return;
    const weapons = buildWeaponOptions(view);
    const active = weapons.find(function (item) { return item.id === view.activeWeapon; }) || weapons[0];
    const key = weapons.map(function (item) { return item.id + ':' + item.tag; }).join('|') + ':' + active.id + ':' + view.damage + ':' + view.lanes + ':' + view.rate + ':' + view.range;
    if (st.weaponKey === key) return;
    st.weaponKey = key;
    if (e.weaponLabel) e.weaponLabel.textContent = active.name;
    e.weaponSwitch.innerHTML = weapons.map(function (item) {
      return '<button type="button" class="weapon-chip ' + (item.id === active.id ? 'active' : '') + '" data-weapon="' + item.id + '">' +
        '<span class="weapon-chip-icon">' + U.icon(item.icon, data.icons) + '</span>' +
        '<span class="weapon-chip-name">' + U.escapeHtml(item.name) + '</span>' +
        '</button>';
    }).join('');
    e.weaponDetail.innerHTML = [
      '<div class="weapon-focus">',
      '<div class="weapon-focus-icon">', U.icon(active.icon, data.icons), '</div>',
      '<div class="weapon-focus-copy">',
      '<h3>' + U.escapeHtml(active.name) + '</h3>',
      '<small>' + U.escapeHtml(active.tag) + '</small>',
      '<p>' + U.escapeHtml(active.state) + '</p>',
      '<p class="weapon-desc">' + U.escapeHtml(active.desc) + '</p>',
      '</div>',
      '</div>'
    ].join('');
    e.weaponSwitch.querySelectorAll('[data-weapon]').forEach(function (btn) {
      btn.onclick = function () { if (game.setWeapon(btn.dataset.weapon)) renderWeaponPanel(game.view()); };
    });
  }

  function renderItemTray(view) {
    if (!e.itemTray) return;
    const entries = [{ id: 'bomb', count: view.bombs, name: '歼灭弹', icon: 'bomb' }];
    Object.keys(data.pickups || {}).forEach(function (id) {
      if (id === 'bomb') return;
      const count = (view.items && view.items[id]) || 0;
      if (count <= 0) return;
      const item = data.pickups[id];
      entries.push({ id, count, name: item.name, icon: item.icon });
    });
    if (!entries.length) {
      if (st.itemKey === 'empty') return;
      st.itemKey = 'empty';
      e.itemTray.innerHTML = '<div class="item-empty">道具仓空</div>';
      return;
    }
    const key = entries.map(function (item) { return item.id + ':' + item.count; }).join('|');
    if (st.itemKey === key) return;
    st.itemKey = key;
    e.itemTray.innerHTML = entries.map(function (item) {
      return '<button type="button" class="item-use" data-use-item="' + item.id + '" title="使用' + U.escapeHtml(item.name) + '"' + (item.count <= 0 ? ' disabled' : '') + '>' +
        '<span>' + U.icon(item.icon, data.icons) + '</span><em>' + U.escapeHtml(item.name) + '</em><strong>' + item.count + '</strong></button>';
    }).join('');
    e.itemTray.querySelectorAll('[data-use-item]').forEach(function (btn) {
      btn.onclick = function () {
        if (game.useItem(btn.dataset.useItem)) update();
      };
    });
  }

  function showModal(type) {
    e.layer.classList.remove('hidden');
    e.shopModal.classList.toggle('hidden', type !== 'shop');
    e.codexModal.classList.toggle('hidden', type !== 'codex');
    if (type === 'shop') { shopPanel.markDirty(); shopPanel.render(); }
    else { codexPanel.markDirty(); codexPanel.render(); }
  }

  function open(type) {
    if (st.modal === type) { close(true); return; }
    if (!st.modal) game.beginOverlay();
    st.modal = type;
    showModal(type);
  }

  function close(restore) {
    if (!st.modal) return;
    st.modal = null;
    e.layer.classList.add('hidden');
    e.shopModal.classList.add('hidden');
    e.codexModal.classList.add('hidden');
    if (restore !== false) game.endOverlay();
  }

  function toggle(type) { open(type); }

  function toast(text) {
    e.toast.textContent = text;
    e.toast.classList.add('show');
    clearTimeout(st.toastTimer);
    st.toastTimer = setTimeout(function () { e.toast.classList.remove('show'); }, 1700);
  }

  function update() {
    const view = game.view();
    const readouts = buildHudReadouts(view, data.waves.length);
    const hudKey = readouts.map(function (item) { return item.id + ':' + item.label + ':' + item.value + ':' + item.detail; }).join('|');
    if (st.hudKey !== hudKey) {
      st.hudKey = hudKey;
      readouts.forEach(function (item) {
        const card = e.statCards.find(function (el) { return el.dataset.hud === item.id; });
        if (!card) return;
        const small = card.querySelector('small');
        const strong = card.querySelector('strong');
        if (small) small.textContent = item.label;
        if (strong) strong.textContent = item.value;
        card.title = item.detail;
      });
    }
    e.score.textContent = readouts[0].value;
    e.coin.textContent = readouts[1].value;
    e.wave.textContent = readouts[2].value;
    if (e.act) e.act.textContent = 'ACT ' + String((view.actIndex || 0) + 1).padStart(2, '0') + ' / ' + view.actCodename;
    e.best.textContent = readouts[3].value;
    e.hp.textContent = Math.round(view.hp) + '/' + view.maxHp;
    e.base.textContent = Math.round(view.base) + '/' + view.maxBase;
    e.hpFill.style.width = safeRatio(U, view.hp, view.maxHp) * 100 + '%';
    e.baseFill.style.width = safeRatio(U, view.base, view.maxBase) * 100 + '%';
    e.damage.textContent = view.damage;
    e.lane.textContent = view.lanes;
    e.rate.textContent = view.rate.toFixed(1) + 'x';
    if (e.range) e.range.textContent = view.range;
    e.bomb.textContent = view.bombs;
    e.bombTop.textContent = view.bombs;
    e.phase.textContent = view.label;
    e.pauseIcon.textContent = view.phase === 'paused' ? '▶' : 'Ⅱ';
    e.pause.disabled = !(view.phase === 'playing' || view.phase === 'paused');
    e.muteText.textContent = game.muted() ? '关' : '开';
    const isRestartAction = view.phase === 'playing' || view.phase === 'paused' || view.phase === 'gameover' || view.phase === 'victory';
    e.startIcon.textContent = isRestartAction ? '↻' : '▶';
    e.startLabel.textContent = view.phase === 'ready' ? '开始' : view.phase === 'intermission' ? '下一波' : '重开';
    e.start.title = isRestartAction ? '重开本局' : e.startLabel.textContent;

    updateWave(view);
    updateBuffs(game.buffs());
    updateBrief(view);
    renderShipInfo(view);
    renderWeaponPanel(view);
    renderItemTray(view);

    if (st.modal === 'shop') shopPanel.render();
  }

  e.start.onclick = function () {
    const phase = game.view().phase;
    if (phase === 'playing' || phase === 'paused') game.restart();
    else game.primary();
  };
  e.briefNext.onclick = function () { game.primary(); };
  e.briefShop.onclick = function () { open('shop'); };
  e.briefRestart.onclick = function () { game.restart(); };
  e.pause.onclick = function () { game.togglePause(); };
  e.shop.onclick = function () { open('shop'); };
  e.codex.onclick = function () { open('codex'); };
  e.bombBtn.onclick = function () { game.bomb(); };
  e.mute.onclick = function () { game.toggleMute(); update(); };
  e.shopBack.onclick = function () { close(true); };
  e.codexBack.onclick = function () { close(true); };

  return { update, toast, open, close, toggle };
}
