const shieldWarden = {
  role: 'normal',
  name: '护盾卫士',
  hp: 52,
  speed: 35,
  radius: 18,
  reward: 16,
  damage: 18,
  baseDamage: 22,
  bulletDamage: 4,
  score: 52,
  fireEvery: 2.35,
  icon: 'tank',
  color: '#73ff9a',
  ability: { type: 'shield', cycle: 4.2, duration: 1.7, reduction: 0.55 },
  desc: '周期性开启护盾，护盾期间显著降低受到的伤害。'
};

export default shieldWarden;
