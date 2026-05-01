const guard = {
  id: "guard",
  name: "玄武号",
  icon: "shipGuard",
  role: "堡垒型",
  hp: 112,
  damage: 2,
  speed: 218,
  range: 320,
  fireRate: -0.1,
  bombs: 2,
  abilities: [
    { type: "waveShield", value: 1 },
    { type: "baseArmor", value: 0.1 }
  ],
  color: "#73ff9a",
  special: "每波开局获得相位护盾，基地承伤额外降低 10%。",
  brief: "高生命 / 自带护盾 / 低机动"
};

export default guard;
