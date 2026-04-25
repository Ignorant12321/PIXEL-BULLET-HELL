(function (PSD) {
  'use strict';

  PSD.data.storage = {
    best:  'pixel-starship.best.v7',
    codex: 'pixel-starship.codex.v7',
    ship:  'pixel-starship.selectedShip.v1'
  };

  PSD.data.icons = {
    ship:      ['00011000','00188100','01811810','11111111','00177100','00077000','00033000','00030000'],
    shipSwift: ['00011000','00188100','01811810','11888811','00177100','00077000','00033000','00030000'],
    shipGuard: ['00111100','01188110','11888811','11111111','11677611','00177100','00033000','00000000'],
    shipRanger:['00066000','00688600','06811860','11111111','00677600','00077000','00022000','00020000'],
    drone:     ['00000000','00011000','00188100','01111110','00077000','00033000','00000000','00000000'],
    scout:     ['00044000','00444400','04488440','00444400','00044000','00055000','00500500','00000000'],
    raider:    ['00011000','00111100','01188110','11111111','00100100','01000010','00000000','00000000'],
    tank:      ['00066000','00666600','06688660','66666666','06677660','00666600','00066000','00000000'],
    gunner:    ['00022000','00222200','02288220','22222222','00022000','00200200','02000020','00000000'],
    elite:     ['00444400','04422440','44288244','44444444','04477440','00444400','00500500','00000000'],
    boss:      ['04444440','44422444','44888844','44444444','04477440','00444400','00500500','05000050'],
    cannon:    ['00088000','00088000','00111100','11111111','00111100','00088000','00088000','00000000'],
    spread:    ['10000001','01000010','00100100','00088000','00100100','01000010','10000001','00000000'],
    missile:   ['00022000','00022000','00022000','00188100','00111100','00011000','00011000','00000000'],
    bomb:      ['00055000','00588500','05888850','05877850','00577500','00055000','00500500','00000000'],
    shield:    ['00111100','01111110','11800811','11800811','01188110','00111100','00011000','00000000'],
    magnet:    ['11000011','11000011','11000011','11888811','01111110','00111100','00000000','00000000'],
    repair:    ['00033000','00033000','00333300','33333333','33333333','00333300','00033000','00033000'],
    credits:   ['00022000','00222200','02288220','02822820','02288220','00222200','00022000','00000000'],
    overdrive: ['00077000','00777000','07770000','00777000','00077700','00007770','00077700','00000000'],
    pierce:    ['10000001','01000010','00100100','00088000','00100100','01000010','10000001','00000000'],
    crit:      ['00022000','00288200','02822820','28288282','02822820','00288200','00022000','00000000'],
    armor:     ['00111100','01666610','16888861','16666661','01677610','00111100','00011000','00000000'],
    salvage:   ['00033000','00333300','03388330','33822833','03388330','00333300','03000030','00000000'],
    timeslow:  ['00066000','00688600','06822860','06822860','00688600','00066000','00066000','00000000'],
    basekit:   ['00033000','00333300','03388330','33333333','33333333','03388330','00333300','00033000'],
    core:      ['00077000','00788700','07822870','78288287','07822870','00788700','00077000','00000000'],
    range:     ['00088000','00800800','08088080','80888808','08088080','00800800','00088000','00000000'],
    crate:     ['22222222','21111112','21222212','21111112','21222212','21111112','22222222','00000000'],
    unknown:   ['00088000','00800800','00000800','00008000','00080000','00000000','00080000','00000000']
  };

  PSD.data.starships = [
    {
      id:'swift', name:'逐光号', icon:'shipSwift', role:'突击型',
      hp:76, damage:1, speed:292, range:340, fireRate:0.18, bombs:2,
      color:'#56f6ff', special:'移动与射速更高，适合贴近火线快速清怪。',
      brief:'高速 / 高射速 / 低生命'
    },
    {
      id:'guard', name:'玄武号', icon:'shipGuard', role:'堡垒型',
      hp:112, damage:2, speed:218, range:320, fireRate:-0.10, bombs:2,
      shieldAtWave:1, baseArmor:0.10, color:'#73ff9a',
      special:'每波开局获得相位护盾，基地承伤额外降低 10%。',
      brief:'高生命 / 自带护盾 / 低机动'
    },
    {
      id:'ranger', name:'天枢号', icon:'shipRanger', role:'远征型',
      hp:88, damage:2, speed:246, range:455, fireRate:-0.03, bombs:3,
      coinBonus:0.08, color:'#ffe66d',
      special:'射程更远，初始歼灭弹 +1，击杀晶币收益 +8%。',
      brief:'长射程 / 高收益 / 稳定输出'
    }
  ];

  PSD.data.enemies = {
    scout:  { role:'normal', name:'侦察蜂群', hp:8,   speed:92, radius:10, reward:5,   damage:6,  baseDamage:8,  bulletDamage:0,  score:18,  icon:'scout',  color:'#ff4fd8', desc:'高速小型目标，生命低，会快速冲向基地。' },
    raider: { role:'normal', name:'突击机',   hp:15,  speed:60, radius:13, reward:7,   damage:9,  baseDamage:11, bulletDamage:0,  score:25,  icon:'raider', color:'#56f6ff', desc:'第一幕主力单位，数值平均。' },
    tank:   { role:'normal', name:'护甲艇',   hp:34,  speed:36, radius:17, reward:13,  damage:15, baseDamage:20, bulletDamage:0,  score:42,  icon:'tank',   color:'#71a6ff', desc:'慢速高生命目标，会消耗初始火力。' },
    gunner: { role:'normal', name:'弹幕艇',   hp:26,  speed:43, radius:15, reward:12,  damage:12, baseDamage:14, bulletDamage:7,  score:38,  fireEvery:1.95, icon:'gunner', color:'#ffe66d', desc:'会发射横向弹幕，优先处理。' },
    elite:  { role:'elite',  name:'精英护卫', hp:84,  speed:33, radius:22, reward:34,  damage:22, baseDamage:28, bulletDamage:9,  score:110, fireEvery:1.35, icon:'elite',  color:'#ffab4d', desc:'第 4 与第 8 波的重点目标。' },
    boss:   { role:'boss',   name:'星环镇压者',hp:560, speed:19, radius:38, reward:120, damage:36, baseDamage:48, bulletDamage:10, score:520, fireEvery:0.74, icon:'boss',   color:'#ff4fd8', desc:'第一幕 Boss，拥有多段弹幕。' }
  };

  PSD.data.pickups = {
    hull:      { name:'机体维修',   icon:'repair',    color:'#73ff9a', desc:'恢复 14 点机体生命。',      duration:0 },
    shield:    { name:'相位护盾',   icon:'shield',    color:'#56f6ff', desc:'短时间抵挡一次伤害。',       duration:7 },
    overdrive: { name:'火控超频',   icon:'overdrive', color:'#ffab4d', desc:'短时间提升射速。',           duration:8 },
    bomb:      { name:'歼灭弹补给', icon:'bomb',      color:'#ff4fd8', desc:'补充 1 枚歼灭弹。',          duration:0 },
    credits:   { name:'晶币箱',     icon:'credits',   color:'#ffe66d', desc:'获得额外晶币。',             duration:0 },
    basekit:   { name:'基地零件',   icon:'basekit',   color:'#73ff9a', desc:'修复基地 16 点生命。',       duration:0 },
    timeslow:  { name:'时滞晶核',   icon:'timeslow',  color:'#71a6ff', desc:'让全场敌人短时间减速。',     duration:5 },
    bounty:    { name:'赏金缓存',   icon:'salvage',   color:'#ffe66d', desc:'短时间提高击杀晶币收益。',   duration:8 }
  };

  PSD.data.upgrades = [
    { id:'damage',     category:'weapon', name:'聚能炮芯',   icon:'cannon',    max:5,  baseCost:45,  growth:1.46, desc:'主炮伤害 +1。不同星舰拥有不同初始攻击。' },
    { id:'fireRate',   category:'weapon', name:'磁轨装填',   icon:'overdrive', max:4,  baseCost:60,  growth:1.50, desc:'主炮射速 +18%。' },
    { id:'range',      category:'weapon', name:'远距雷达',   icon:'range',     max:4,  baseCost:64,  growth:1.42, desc:'主炮、导弹与僚机有效射程 +45。' },
    { id:'lanes',      category:'weapon', name:'侧翼炮阵',   icon:'spread',    max:2,  baseCost:90,  growth:1.65, desc:'每级增加 1 条弹道，最高 3 条。' },
    { id:'pierce',     category:'weapon', name:'穿透棱镜',   icon:'pierce',    max:3,  baseCost:95,  growth:1.55, desc:'主炮弹体可额外穿透 1 个目标。' },
    { id:'crit',       category:'weapon', name:'量子瞄准镜', icon:'crit',      max:3,  baseCost:110, growth:1.58, desc:'每级 +8% 暴击概率，暴击造成双倍伤害。' },
    { id:'missile',    category:'weapon', name:'微型导弹舱', icon:'missile',   max:3,  baseCost:115, growth:1.58, desc:'定时发射追踪导弹，但导弹也受射程限制。' },
    { id:'drone',      category:'weapon', name:'僚机中枢',   icon:'drone',     max:2,  baseCost:145, growth:1.70, desc:'解锁僚机辅助射击。' },
    { id:'bombCore',   category:'weapon', name:'压缩弹头',   icon:'core',      max:3,  baseCost:135, growth:1.58, desc:'歼灭弹脉冲半径与 EMP 时长小幅提升。' },
    { id:'hullMax',    category:'item',   name:'装甲扩容',   icon:'armor',     max:3,  baseCost:80,  growth:1.55, desc:'机体生命上限 +18，并恢复 18 点。' },
    { id:'shield',     category:'item',   name:'护盾反应堆', icon:'shield',    max:3,  baseCost:85,  growth:1.55, desc:'每波开始获得更久的护盾。' },
    { id:'magnet',     category:'item',   name:'回收磁场',   icon:'magnet',    max:3,  baseCost:70,  growth:1.45, desc:'扩大掉落物吸附范围。' },
    { id:'baseArmor',  category:'item',   name:'基地复合甲', icon:'armor',     max:3,  baseCost:78,  growth:1.48, desc:'基地受到的伤害每级降低 12%，购买时小幅维修基地。' },
    { id:'salvage',    category:'item',   name:'赏金协议',   icon:'salvage',   max:3,  baseCost:100, growth:1.52, desc:'击杀晶币收益每级 +12%，与赏金缓存叠加。' },
    { id:'repairHull', category:'item',   type:'service', name:'机体维修', icon:'repair', max:99, baseCost:42, growth:1, desc:'立即恢复 34 点机体生命。' },
    { id:'repairBase', category:'item',   type:'service', name:'基地维修', icon:'basekit', max:99, baseCost:72, growth:1, desc:'基地生命 +34。基地不会自然恢复。' },
    { id:'bombPack',   category:'item',   type:'service', name:'歼灭弹补给', icon:'bomb', max:99, baseCost:55, growth:1, desc:'歼灭弹 +1，最多携带 6 枚。' },
    { id:'blindBox',   category:'blind',  type:'blind',   name:'星港盲盒', icon:'crate', max:99, baseCost:88, growth:1.08, desc:'抽取晶币：本次花费的 10%～200% 随机返还。' }
  ];

  PSD.data.waves = [
    { wave:1,  name:'前哨侦察',    kind:'普通', reward:34,  entries:[['scout',5],['raider',6]] },
    { wave:2,  name:'碎片带冲突',  kind:'普通', reward:42,  entries:[['scout',7],['raider',7]] },
    { wave:3,  name:'装甲试探',    kind:'普通', reward:52,  entries:[['scout',6],['raider',8],['tank',2]] },
    { wave:4,  name:'精英压制',    kind:'精英', elite:true,  reward:78,  entries:[['raider',8],['gunner',3],['elite',1]] },
    { wave:5,  name:'蜂群突入',    kind:'普通', reward:64,  entries:[['scout',10],['raider',7],['tank',3]] },
    { wave:6,  name:'炮艇夹击',    kind:'普通', reward:70,  entries:[['raider',10],['gunner',4],['tank',3]] },
    { wave:7,  name:'火线穿插',    kind:'普通', reward:76,  entries:[['scout',12],['raider',9],['gunner',4]] },
    { wave:8,  name:'双精英关',    kind:'精英', elite:true,  reward:100, entries:[['raider',10],['tank',4],['gunner',4],['elite',2]] },
    { wave:9,  name:'封锁总攻',    kind:'普通', reward:92,  entries:[['scout',12],['raider',12],['tank',5],['gunner',5]] },
    { wave:10, name:'星环镇压者',  kind:'Boss', boss:true,   reward:160, entries:[['raider',7],['gunner',4],['boss',1]] }
  ];

  PSD.data.shopTabs  = [{ id:'all', name:'全部' },{ id:'weapon', name:'武器' },{ id:'item', name:'道具' },{ id:'blind', name:'盲盒' }];
  PSD.data.codexTabs = [{ id:'all', name:'全部' },{ id:'monster', name:'怪物' },{ id:'weapon', name:'武器' },{ id:'item', name:'道具' }];

  const enemyCodex = Object.keys(PSD.data.enemies).map(function (id) {
    const d = PSD.data.enemies[id];
    return { category:'monster', unlock:'enemy:'+id, name:d.name, icon:d.icon, desc:d.desc };
  });
  const upgradeCodex = PSD.data.upgrades.filter(function (u) {
    return !u.type && (u.category === 'weapon' || u.category === 'item');
  }).map(function (u) {
    return { category:u.category, unlock:'upgrade:'+u.id, name:u.name, icon:u.icon, desc:u.desc };
  });
  const pickupCodex = Object.keys(PSD.data.pickups).map(function (id) {
    const d = PSD.data.pickups[id];
    return { category:'item', unlock:'pickup:'+id, name:d.name, icon:d.icon, desc:d.desc };
  });
  PSD.data.codex = enemyCodex.concat([
    { category:'weapon', unlock:'weapon:cannon', name:'单轨主炮', icon:'cannon', desc:'初始武器：受星舰攻击、射程和射速影响。' },
    { category:'weapon', unlock:'weapon:bomb', name:'歼灭弹', icon:'bomb', desc:'X 键释放压缩脉冲：清理局部弹幕、减速并伤害范围内敌人。' }
  ], upgradeCodex, pickupCodex);
}(window.PSD));
