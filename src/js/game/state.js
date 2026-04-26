export const phaseLabels = {
  ready: '待命',
  playing: '作战中',
  paused: '暂停',
  intermission: '备战',
  gameover: '失败',
  victory: '胜利'
};

export function phaseLabel(phase) {
  return phaseLabels[phase] || phase;
}

export function createView(state, data, selectors) {
  const idx = Math.min(state.waveIndex, data.waves.length - 1);
  const wave = data.waves[idx];
  const ship = selectors.shipData();
  return {
    phase: state.phase, label: selectors.label(),
    score: state.score, coins: state.coins, best: state.best,
    waveIndex: idx, done: state.done,
    progress: state.total ? selectors.utils.clamp(state.defeated / state.total * 100, 0, 100) : 0,
    waveName: wave.name, kind: wave.kind,
    left: Math.max(0, state.total - state.defeated),
    hp: state.player.hp, maxHp: state.player.max,
    base: state.base.hp, maxBase: state.base.max,
    damage: selectors.damage(), lanes: selectors.lanes(), rate: selectors.fireRate(), range: selectors.range(), bombs: state.bombs,
    shipId: state.shipId, shipName: ship.name, shipIcon: ship.icon
  };
}

export function createBuffList(state) {
  const list = [];
  if (state.buff.shield > 0 && state.shieldCharges > 0) list.push({ icon: '◇', name: '护盾', time: state.buff.shield, max: 10 });
  if (state.buff.overdrive > 0) list.push({ icon: '⚡', name: '超频', time: state.buff.overdrive, max: 8 });
  if (state.buff.timeSlow > 0) list.push({ icon: '◷', name: '时滞', time: state.buff.timeSlow, max: 5 });
  if (state.buff.bounty > 0) list.push({ icon: '￥', name: '赏金', time: state.buff.bounty, max: 8 });
  if (state.buff.inv > 0) list.push({ icon: '✚', name: '无敌', time: state.buff.inv, max: 1 });
  return list;
}
