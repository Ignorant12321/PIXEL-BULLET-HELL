export function createArmoryState(routes) {
  const levels = {};
  (routes || []).forEach(function (node) {
    levels[node.id] = 0;
  });
  return { levels };
}

export function roundFee(value) {
  return Math.ceil(value / 5) * 5;
}

function addEffect(out, key, value) {
  if (key === 'unlock') {
    out.unlocks[value] = true;
  } else if (typeof value === 'number') {
    out[key] = (out[key] || 0) + value;
  }
}

export function createArmorySystem(routes, state) {
  const list = routes || [];
  const byId = {};
  list.forEach(function (node) { byId[node.id] = node; });
  if (!state.armory) state.armory = createArmoryState(list);

  function level(id) {
    return Number(state.armory.levels[id]) || 0;
  }

  function nodeCost(node) {
    return node ? node.cost : 0;
  }

  function invested(routeId) {
    return list.reduce(function (sum, node) {
      if (node.routeId !== routeId) return sum;
      return sum + level(node.id) * nodeCost(node);
    }, 0);
  }

  function missingPrereq(node) {
    return (node.prereq || []).some(function (id) { return level(id) <= 0; });
  }

  function lockedByBranch(node) {
    return (node.locks || []).some(function (id) { return level(id) > 0; });
  }

  function canBuy(id) {
    const node = byId[id];
    if (!node) return { ok: false, reason: 'unknown' };
    if (level(id) >= node.max) return { ok: false, reason: 'maxed' };
    if (missingPrereq(node)) return { ok: false, reason: 'locked' };
    if (lockedByBranch(node)) return { ok: false, reason: 'exclusive' };
    if (state.coins < nodeCost(node)) return { ok: false, reason: 'coins' };
    return { ok: true, price: nodeCost(node), node };
  }

  function buy(id) {
    const verdict = canBuy(id);
    if (!verdict.ok) return verdict;
    state.coins -= verdict.price;
    state.armory.levels[id] = level(id) + 1;
    return { ok: true, node: verdict.node, price: verdict.price };
  }

  function respecRoute(routeId) {
    if (state.phase === 'playing') return { ok: false, reason: 'combat' };
    const spent = invested(routeId);
    if (spent <= 0) return { ok: false, reason: 'empty' };
    const fee = roundFee(spent * 0.10);
    const refund = Math.max(0, spent - fee);
    list.forEach(function (node) {
      if (node.routeId === routeId) state.armory.levels[node.id] = 0;
    });
    state.coins += refund;
    return { ok: true, routeId, spent, fee, refund };
  }

  function effects() {
    const out = { unlocks: {} };
    list.forEach(function (node) {
      const lv = level(node.id);
      if (lv <= 0) return;
      Object.keys(node.effects || {}).forEach(function (key) {
        const value = node.effects[key];
        addEffect(out, key, typeof value === 'number' ? value * lv : value);
      });
    });
    if (!Object.keys(out.unlocks).length) delete out.unlocks;
    return out;
  }

  function view() {
    return {
      routes: list,
      levels: Object.assign({}, state.armory.levels),
      effects: effects(),
      coins: state.coins,
      phase: state.phase
    };
  }

  return { level, cost: nodeCost, canBuy, buy, respecRoute, effects, view, invested };
}
