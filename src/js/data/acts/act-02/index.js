const waves = [
  { wave: 1, name: '裂隙余波', kind: '普通', reward: 112, entries: [['raider', 8], ['riftHunter', 5], ['tank', 3]] },
  { wave: 2, name: '闪断突袭', kind: '普通', reward: 122, entries: [['scout', 10], ['riftHunter', 8], ['gunner', 3]] },
  { wave: 3, name: '护盾前线', kind: '普通', reward: 132, entries: [['shieldWarden', 4], ['raider', 9], ['gunner', 4]] },
  { wave: 4, name: '干扰同步', kind: '精英', elite: true, reward: 154, entries: [['jammer', 5], ['riftHunter', 6], ['elite', 2]] },
  { wave: 5, name: '裂变集群', kind: '普通', reward: 142, entries: [['splitter', 7], ['scout', 10], ['tank', 4]] },
  { wave: 6, name: '护航火网', kind: '普通', reward: 152, entries: [['shieldWarden', 5], ['jammer', 4], ['gunner', 5]] },
  { wave: 7, name: '双相压境', kind: '普通', reward: 164, entries: [['riftHunter', 8], ['splitter', 6], ['raider', 10]] },
  { wave: 8, name: '裂隙精英群', kind: '精英', elite: true, reward: 190, entries: [['shieldWarden', 6], ['jammer', 5], ['elite', 3]] },
  { wave: 9, name: '虚空合围', kind: '普通', reward: 178, entries: [['riftHunter', 10], ['splitter', 8], ['gunner', 6], ['tank', 5]] },
  { wave: 10, name: '虚空母舰', kind: 'Boss', boss: true, reward: 260, entries: [['shieldWarden', 4], ['jammer', 4], ['voidMothership', 1]] }
];

export const act02 = {
  id: 'act-02',
  name: '第二幕',
  codename: '虚空裂隙',
  waves
};

export default act02;
