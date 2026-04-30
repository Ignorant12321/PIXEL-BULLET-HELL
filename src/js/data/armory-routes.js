const armoryRoutes = [
  { id: 'core-damage', routeId: 'core', tier: 1, max: 5, cost: 45, effects: { damage: 1 }, name: '聚能炮芯', icon: 'cannon', desc: '所有主火力伤害 +1。' },
  { id: 'core-rate', routeId: 'core', tier: 1, max: 4, cost: 60, effects: { fireRate: 0.18 }, name: '磁轨装填', icon: 'overdrive', desc: '所有主火力射速提升。' },
  { id: 'core-range', routeId: 'core', tier: 1, max: 4, cost: 64, effects: { range: 45 }, name: '远距雷达', icon: 'range', desc: '主炮、导弹与僚机有效射程提升。' },
  { id: 'core-crit', routeId: 'core', tier: 2, max: 3, cost: 110, prereq: ['core-damage'], effects: { crit: 0.08 }, name: '量子瞄准镜', icon: 'crit', desc: '暴击概率提升，暴击造成双倍伤害。' },
  { id: 'core-pierce', routeId: 'core', tier: 2, max: 3, cost: 95, prereq: ['core-range'], effects: { pierce: 1 }, name: '穿透棱镜', icon: 'pierce', desc: '弹体额外穿透目标。' },

  { id: 'cannon-core', routeId: 'cannon', tier: 1, max: 2, cost: 70, effects: { unlock: 'cannon', damage: 1, cannonRate: 0.08 }, name: '单轨校准', icon: 'cannon', desc: '强化初始主炮的稳定输出。' },
  { id: 'cannon-lanes', routeId: 'cannon', tier: 2, max: 2, cost: 90, prereq: ['cannon-core'], effects: { lanes: 1 }, name: '侧翼炮阵', icon: 'spread', desc: '增加主炮弹道数量。' },
  { id: 'cannon-storm', routeId: 'cannon', tier: 3, branch: 'storm', max: 2, cost: 130, prereq: ['cannon-lanes'], locks: ['cannon-heavy'], effects: { cannonRate: 0.16, lanes: 1 }, name: '风暴弹幕', icon: 'overdrive', desc: '牺牲单发厚度，换取更密集弹幕。' },
  { id: 'cannon-heavy', routeId: 'cannon', tier: 3, branch: 'heavy', max: 2, cost: 130, prereq: ['cannon-lanes'], locks: ['cannon-storm'], effects: { damage: 1, pierce: 1 }, name: '贯穿重炮', icon: 'pierce', desc: '提高主炮穿透与单发杀伤。' },

  { id: 'sniper-core', routeId: 'sniper', tier: 1, max: 3, cost: 130, effects: { unlock: 'sniper', sniperDamage: 3, sniperRange: 52 }, name: '狙击炮', icon: 'sniper', desc: '解锁高伤远程主武器。' },
  { id: 'sniper-execute', routeId: 'sniper', tier: 2, branch: 'execute', max: 2, cost: 155, prereq: ['sniper-core'], locks: ['sniper-armor'], effects: { sniperCrit: 0.12, sniperDamage: 2 }, name: '处决暴击', icon: 'crit', desc: '强化对精英与 Boss 的爆发。' },
  { id: 'sniper-armor', routeId: 'sniper', tier: 2, branch: 'armor', max: 2, cost: 155, prereq: ['sniper-core'], locks: ['sniper-execute'], effects: { sniperPierce: 1, sniperEmp: 0.18 }, name: '穿甲压制', icon: 'pierce', desc: '狙击弹获得穿甲与短暂压制。' },

  { id: 'beam-core', routeId: 'beam', tier: 1, max: 3, cost: 120, effects: { unlock: 'beam', beamDamage: 2.2 }, name: '高能射线', icon: 'beam', desc: '解锁持续锁定灼烧武器。' },
  { id: 'beam-emp', routeId: 'beam', tier: 2, branch: 'emp', max: 2, cost: 150, prereq: ['beam-core'], locks: ['beam-burn'], effects: { beamEmp: 0.16 }, name: 'EMP 控制', icon: 'shield', desc: '射线附带更强电磁压制。' },
  { id: 'beam-burn', routeId: 'beam', tier: 2, branch: 'burn', max: 2, cost: 150, prereq: ['beam-core'], locks: ['beam-emp'], effects: { beamDamage: 2.4 }, name: '熔蚀灼烧', icon: 'beam', desc: '提高持续伤害。' },

  { id: 'missile-core', routeId: 'missile', tier: 1, max: 3, cost: 115, effects: { unlock: 'missile', missileDamage: 5, missileRate: 0.12 }, name: '微型导弹舱', icon: 'missile', desc: '解锁追踪导弹主/副火力。' },
  { id: 'missile-swarm', routeId: 'missile', tier: 2, branch: 'swarm', max: 2, cost: 150, prereq: ['missile-core'], locks: ['missile-siege'], effects: { missileRate: 0.22, missileSwarm: 1 }, name: '蜂群速射', icon: 'missile', desc: '导弹装填更快，并追加小型齐射。' },
  { id: 'missile-siege', routeId: 'missile', tier: 2, branch: 'siege', max: 2, cost: 150, prereq: ['missile-core'], locks: ['missile-swarm'], effects: { missileDamage: 8, missileEmp: 0.22 }, name: '攻城爆破', icon: 'bomb', desc: '导弹伤害提高并附带压制。' },

  { id: 'drone-core', routeId: 'drone', tier: 1, max: 2, cost: 145, effects: { unlock: 'drone', droneCount: 1, droneDamage: 1 }, name: '僚机中枢', icon: 'drone', desc: '解锁僚机辅助射击。' },
  { id: 'drone-guard', routeId: 'drone', tier: 2, branch: 'guard', max: 2, cost: 165, prereq: ['drone-core'], locks: ['drone-sync'], effects: { droneIntercept: 1, droneRate: 0.08 }, name: '拦截护航', icon: 'shield', desc: '僚机更偏向拦截与稳定护航。' },
  { id: 'drone-sync', routeId: 'drone', tier: 2, branch: 'sync', max: 2, cost: 165, prereq: ['drone-core'], locks: ['drone-guard'], effects: { droneDamage: 2, droneRate: 0.16 }, name: '同步火力', icon: 'drone', desc: '僚机火力与主炮同步增强。' },

  { id: 'bomb-core', routeId: 'bomb', tier: 1, max: 3, cost: 105, effects: { bombDamage: 10, bombRadius: 34, bombEmp: 0.35 }, name: '歼灭弹核心', icon: 'bomb', desc: '强化歼灭弹伤害、半径与 EMP 时间。' },
  { id: 'bomb-nova', routeId: 'bomb', tier: 2, branch: 'nova', max: 2, cost: 145, prereq: ['bomb-core'], locks: ['bomb-blackout'], effects: { bombDamage: 18, bombRadius: 18 }, name: '新星冲击', icon: 'bomb', desc: '扩大爆发杀伤范围。' },
  { id: 'bomb-blackout', routeId: 'bomb', tier: 2, branch: 'blackout', max: 2, cost: 145, prereq: ['bomb-core'], locks: ['bomb-nova'], effects: { bombEmp: 0.55 }, name: '黑障瘫痪', icon: 'timeslow', desc: '降低瞬间伤害，强化控场时间。' }
];

export default armoryRoutes;
