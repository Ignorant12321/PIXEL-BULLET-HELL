const waves = [
  {
    wave: 1,
    name: '前哨侦察',
    kind: '普通',
    reward: 34,
    entries: [
      ['scout', 5],
      ['raider', 6]
    ]
  },
  {
    wave: 2,
    name: '碎片带冲突',
    kind: '普通',
    reward: 42,
    entries: [
      ['scout', 7],
      ['raider', 7]
    ]
  },
  {
    wave: 3,
    name: '装甲试探',
    kind: '普通',
    reward: 52,
    entries: [
      ['scout', 6],
      ['raider', 8],
      ['tank', 2]
    ]
  },
  {
    wave: 4,
    name: '精英压制',
    kind: '精英',
    elite: true,
    reward: 78,
    entries: [
      ['raider', 8],
      ['gunner', 3],
      ['elite', 1]
    ]
  },
  {
    wave: 5,
    name: '蜂群突入',
    kind: '普通',
    reward: 64,
    entries: [
      ['scout', 10],
      ['raider', 7],
      ['tank', 3]
    ]
  },
  {
    wave: 6,
    name: '炮艇夹击',
    kind: '普通',
    reward: 70,
    entries: [
      ['raider', 10],
      ['gunner', 4],
      ['tank', 3]
    ]
  },
  {
    wave: 7,
    name: '火线穿插',
    kind: '普通',
    reward: 76,
    entries: [
      ['scout', 12],
      ['raider', 9],
      ['gunner', 4]
    ]
  },
  {
    wave: 8,
    name: '双精英关',
    kind: '精英',
    elite: true,
    reward: 100,
    entries: [
      ['raider', 10],
      ['tank', 4],
      ['gunner', 4],
      ['elite', 2]
    ]
  },
  {
    wave: 9,
    name: '封锁总攻',
    kind: '普通',
    reward: 92,
    entries: [
      ['scout', 12],
      ['raider', 12],
      ['tank', 5],
      ['gunner', 5]
    ]
  },
  {
    wave: 10,
    name: '星环镇压者',
    kind: 'Boss',
    boss: true,
    reward: 160,
    entries: [
      ['raider', 7],
      ['gunner', 4],
      ['boss', 1]
    ]
  }
];

export const act01 = {
  id: 'act-01',
  name: '第一幕',
  codename: '星环封锁',
  waves
};

export default act01;
