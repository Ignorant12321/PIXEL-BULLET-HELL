const shieldWarden = {
  role: 'normal',
  name: '护盾卫士',
  hp: 56,
  speed: 27,
  radius: 18,
  reward: 16,
  damage: 18,
  baseDamage: 22,
  bulletDamage: 4,
  score: 52,
  fireEvery: 2.35,
  icon: 'tank',
  color: '#73ff9a',
  ability: { type: 'shield', cycle: 4.4, duration: 1.6, reduction: 0.60 },
  desc: '周期性开启护盾，护盾期间显著降低受到的伤害。'
};

export default shieldWarden;
