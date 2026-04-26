export function upgradeCost(item, level) {
  if (item.type === 'service') return item.baseCost;
  return Math.round(item.baseCost * Math.pow(item.growth || 1, level(item.id)) / 5) * 5;
}

export function isServiceFull(id, state, baseCfg) {
  if (id === 'repairHull') return state.player.hp >= state.player.max;
  if (id === 'repairBase') return state.base.hp >= state.base.max;
  if (id === 'bombPack') return state.bombs >= baseCfg().maxBombs;
  return false;
}
