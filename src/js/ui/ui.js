(function (PSD) {
  'use strict';

  const U = PSD.U;
  const $ = function (id) { return document.getElementById(id); };

  PSD.ui.create = function createUI(game) {
    const e = {
      score: $('scoreText'), coin: $('coinText'), wave: $('waveText'), best: $('bestText'),
      waveCount: $('waveCount'), waveFill: $('waveFill'), waveNodes: $('waveNodes'),
      hp: $('hpText'), hpFill: $('hpFill'), base: $('baseText'), baseFill: $('baseFill'),
      damage: $('damageText'), lane: $('laneText'), rate: $('rateText'), range: $('rangeText'),
      bomb: $('bombText'), bombTop: $('bombTop'), phase: $('phaseText'),
      arenaBuffs: $('arenaBuffs'), upgrades: $('upgradeSummary'), shipSelect: $('shipSelect'),
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
      shopBack: $('shopBack'), codexBack: $('codexBack')
    };

    const st = {
      shopTab: 'all', codexTab: 'all',
      modal: null, toastTimer: 0,
      lastCoins: -1, shopDirty: true,
      shipKey: ''
    };

    function safeRatio(v, max) {
      const r = Number(max) > 0 ? Number(v) / Number(max) : 0;
      return U.clamp(Number.isFinite(r) ? r : 0, 0, 1);
    }

    function renderTabs(host, tabs, active, onSelect) {
      if (!host) return;
      host.innerHTML = tabs.map(function (tab) {
        return '<button class="' + (tab.id === active ? 'active' : '') + '" data-tab="' + tab.id + '">' + U.escapeHtml(tab.name) + '</button>';
      }).join('');
      host.querySelectorAll('button').forEach(function (btn) {
        btn.onclick = function () { onSelect(btn.dataset.tab); };
      });
    }

    function updateWave(view) {
      if (!e.waveNodes || !e.waveFill || !e.waveCount) return;
      e.waveNodes.innerHTML = PSD.data.waves.map(function (wave, idx) {
        const cls = ['node'];
        if (idx < view.done) cls.push('done');
        if (idx === view.waveIndex && view.done < PSD.data.waves.length) cls.push('cur');
        if (wave.elite) cls.push('elite');
        if (wave.boss) cls.push('boss');
        return '<div class="' + cls.join(' ') + '">' + (wave.boss ? 'B' : idx + 1) + '</div>';
      }).join('');
      const fill = (view.done + (view.phase === 'playing' ? view.progress / 100 : 0)) / PSD.data.waves.length;
      e.waveFill.style.width = U.clamp(fill, 0, 1) * 100 + '%';
      e.waveCount.textContent = Math.min(PSD.data.waves.length, view.waveIndex + 1) + ' / ' + PSD.data.waves.length;
    }

    function updateBuffs(list) {
      if (!e.arenaBuffs) return;
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
      const key = view.shipId + ':' + (PSD.data.starships || []).length;
      if (st.shipKey === key && e.shipSelect.innerHTML) return;
      st.shipKey = key;
      e.shipSelect.innerHTML = (PSD.data.starships || []).map(function (ship) {
        const selected = ship.id === view.shipId;
        return [
          '<button type="button" class="ship-card ' + (selected ? 'selected' : '') + '" data-ship="' + ship.id + '" title="' + U.escapeHtml(ship.special) + '">',
          U.icon(ship.icon),
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
        ready:        ['选择星舰', '选择一艘像素星舰。敌人从左侧进入，右侧基地不会自动回复。', '开始'],
        paused:       ['暂停',     '战斗已暂停。',                                               '继续'],
        intermission: ['备战',     '上一波已清空。机体自动恢复 10 点；基地需要商店或掉落维修。',   '下一波'],
        gameover:     ['防线失守', '星舰生命或基地生命归零。',                                   '重开'],
        victory:      ['第一幕完成','星环封锁已突破，后续幕可继续扩展。',                         '重开']
      };
      const item = map[view.phase] || map.ready;
      e.brief.classList.remove('hidden');
      e.briefTitle.textContent = item[0];
      e.briefText.textContent = item[1];
      e.briefNext.textContent = item[2];
      renderShipSelect(view);
    }

    function updateUpgrades() {
      const relics = PSD.data.upgrades.filter(function (u) {
        return !u.type && (u.category === 'weapon' || u.category === 'item') && game.level(u.id) > 0;
      });
      if (!relics.length) {
        e.upgrades.innerHTML = '<p class="relic-empty-note">尚未获得圣遗物</p>';
        return;
      }
      e.upgrades.innerHTML = relics.map(function (data) {
        const lv = game.level(data.id);
        return '<div class="relic" title="' + U.escapeHtml(data.name + '：' + data.desc) + '">' +
          U.icon(data.icon) +
          '<small>' + lv + '</small>' +
          '<span>' + U.escapeHtml(data.name.slice(0, 2)) + '</span>' +
          '</div>';
      }).join('');
    }

    function renderShop() {
      const view = game.view();
      e.shopCoin.textContent = U.num(view.coins);
      renderTabs(e.shopTabs, PSD.data.shopTabs, st.shopTab, function (tab) {
        st.shopTab = tab; renderShop();
      });
      const items = PSD.data.upgrades.filter(function (item) {
        return st.shopTab === 'all' || item.category === st.shopTab;
      });
      e.shopGrid.innerHTML = items.map(function (item) {
        const lv = game.level(item.id);
        const price = game.cost(item);
        const maxed = lv >= item.max && item.type !== 'service' && item.type !== 'blind';
        const isFull = game.full(item.id);
        const disabled = maxed || isFull || view.coins < price;
        const lvText = item.type === 'service' ? '服务' : item.type === 'blind' ? '10%-200%' : lv + '/' + item.max;
        return [
          '<article class="item">',
          U.icon(item.icon),
          '<div><h3>' + U.escapeHtml(item.name) + '</h3><div class="meta">' + lvText + '</div></div>',
          '<p>' + U.escapeHtml(item.desc) + '</p>',
          '<footer><span class="price">￥ ' + U.num(price) + '</span>',
          '<button data-buy="' + item.id + '"' + (disabled ? ' disabled' : '') + '>' + (maxed || isFull ? '已满' : '购买') + '</button>',
          '</footer></article>'
        ].join('');
      }).join('');
      e.shopGrid.querySelectorAll('[data-buy]').forEach(function (btn) {
        btn.onclick = function () { if (game.buy(btn.dataset.buy)) { st.shopDirty = true; renderShop(); } };
      });
      st.lastCoins = view.coins;
      st.shopDirty = false;
    }

    function renderCodex() {
      renderTabs(e.codexTabs, PSD.data.codexTabs, st.codexTab, function (tab) {
        st.codexTab = tab; renderCodex();
      });
      const items = PSD.data.codex.filter(function (item) {
        return st.codexTab === 'all' || item.category === st.codexTab;
      });
      e.codexGrid.innerHTML = items.map(function (item) {
        const open = game.unlocked(item.unlock);
        return [
          '<article class="item ' + (open ? '' : 'locked') + '">',
          U.icon(open ? item.icon : 'unknown'),
          '<div><h3>' + U.escapeHtml(open ? item.name : '未知信号') + '</h3><div class="meta">' + item.category + '</div></div>',
          '<p>' + U.escapeHtml(open ? item.desc : '尚未遭遇或尚未购买。继续战斗后会点亮该条目。') + '</p>',
          '<footer><span class="price">' + (open ? '已解锁' : '未解锁') + '</span></footer>',
          '</article>'
        ].join('');
      }).join('');
    }

    function showModal(type) {
      e.layer.classList.remove('hidden');
      e.shopModal.classList.toggle('hidden', type !== 'shop');
      e.codexModal.classList.toggle('hidden', type !== 'codex');
      if (type === 'shop') { st.shopDirty = true; renderShop(); }
      else renderCodex();
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
      e.score.textContent = U.num(view.score);
      e.coin.textContent = U.num(view.coins);
      e.wave.textContent = Math.min(PSD.data.waves.length, view.waveIndex + 1) + '/' + PSD.data.waves.length;
      e.best.textContent = U.num(view.best);
      e.hp.textContent = Math.round(view.hp) + '/' + view.maxHp;
      e.base.textContent = Math.round(view.base) + '/' + view.maxBase;
      e.hpFill.style.width = safeRatio(view.hp, view.maxHp) * 100 + '%';
      e.baseFill.style.width = safeRatio(view.base, view.maxBase) * 100 + '%';
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
      e.startLabel.textContent =
        view.phase === 'ready' ? '开始' :
        view.phase === 'intermission' ? '下一波' :
        '重开';
      e.start.title = isRestartAction ? '重开本局' : e.startLabel.textContent;

      updateWave(view);
      updateBuffs(game.buffs());
      updateBrief(view);
      updateUpgrades();

      if (st.modal === 'shop') {
        const cv = view.coins;
        if (st.shopDirty || cv !== st.lastCoins) renderShop();
      }
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
  };
}(window.PSD));
