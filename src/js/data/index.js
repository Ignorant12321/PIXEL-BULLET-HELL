import storage from './storage.js';
import icons from './icons.js';
import starships from './starships/index.js';
import enemies from './enemies/index.js';
import pickups from './pickups/index.js';
import upgrades from './upgrades/index.js';
import acts, { waves } from './acts/index.js';
import difficulty from './acts/act-01/difficulty.js';
import { shopTabs, codexTabs } from './tabs.js';

function buildCodex() {
  const enemyCodex = Object.keys(enemies).map(function (id) {
    const d = enemies[id];
    return { category: 'monster', unlock: 'enemy:' + id, name: d.name, icon: d.icon, desc: d.desc };
  });
  const upgradeCodex = upgrades.filter(function (u) {
    return !u.type && (u.category === 'weapon' || u.category === 'forge' || u.category === 'item');
  }).map(function (u) {
    return { category: u.category, unlock: 'upgrade:' + u.id, name: u.name, icon: u.icon, desc: u.desc };
  });
  const pickupCodex = Object.keys(pickups).map(function (id) {
    const d = pickups[id];
    return { category: 'item', unlock: 'pickup:' + id, name: d.name, icon: d.icon, desc: d.desc };
  });
  return enemyCodex.concat([
    { category: 'weapon', unlock: 'weapon:cannon', name: '单轨主炮', icon: 'cannon', desc: '初始武器：受星舰攻击、射程和射速影响。' }
  ], upgradeCodex, pickupCodex);
}

export const codex = buildCodex();

const data = {
  storage, icons, starships, enemies, pickups, upgrades, acts, waves, difficulty, shopTabs, codexTabs, codex
};

export { storage, icons, starships, enemies, pickups, upgrades, acts, waves, difficulty, shopTabs, codexTabs };
export default data;
