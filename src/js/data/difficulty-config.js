(function (PSD) {
  'use strict';

  // 所有关卡难度递进集中在这里：普通敌人生命、攻击、速度随波次温和成长。
  // 设计目标：第 10 波普通敌人约 +36% 生命、+30% 攻击、+16% 速度，不做离谱膨胀。
  PSD.data.difficulty = {
    base: {
      coins: 80,
      baseHp: 160,
      maxBombs: 6,
      bulletSpeed: 560,
      rangeUpgrade: 45,
      hullUpgradeHp: 18,
      hullRepair: 34,
      baseRepair: 34,
      pickupHullRepair: 14,
      pickupBaseRepair: 16
    },
    waves: [
      { normal:{ hp:1.00, attack:1.00, speed:1.00, fire:1.00 }, elite:{ hp:1.00, attack:1.00, speed:1.00, fire:1.00 }, boss:{ hp:1.00, attack:1.00, speed:1.00, fire:1.00 }, spawn:1.00 },
      { normal:{ hp:1.04, attack:1.03, speed:1.02, fire:1.02 }, elite:{ hp:1.02, attack:1.02, speed:1.01, fire:1.02 }, boss:{ hp:1.00, attack:1.00, speed:1.00, fire:1.00 }, spawn:0.98 },
      { normal:{ hp:1.08, attack:1.06, speed:1.04, fire:1.04 }, elite:{ hp:1.05, attack:1.04, speed:1.02, fire:1.04 }, boss:{ hp:1.00, attack:1.00, speed:1.00, fire:1.00 }, spawn:0.97 },
      { normal:{ hp:1.12, attack:1.09, speed:1.06, fire:1.06 }, elite:{ hp:1.08, attack:1.07, speed:1.03, fire:1.05 }, boss:{ hp:1.00, attack:1.00, speed:1.00, fire:1.00 }, spawn:0.96 },
      { normal:{ hp:1.16, attack:1.12, speed:1.08, fire:1.08 }, elite:{ hp:1.10, attack:1.09, speed:1.04, fire:1.06 }, boss:{ hp:1.00, attack:1.00, speed:1.00, fire:1.00 }, spawn:0.95 },
      { normal:{ hp:1.20, attack:1.15, speed:1.10, fire:1.10 }, elite:{ hp:1.12, attack:1.11, speed:1.05, fire:1.08 }, boss:{ hp:1.00, attack:1.00, speed:1.00, fire:1.00 }, spawn:0.94 },
      { normal:{ hp:1.24, attack:1.18, speed:1.12, fire:1.12 }, elite:{ hp:1.15, attack:1.13, speed:1.06, fire:1.10 }, boss:{ hp:1.00, attack:1.00, speed:1.00, fire:1.00 }, spawn:0.93 },
      { normal:{ hp:1.28, attack:1.22, speed:1.14, fire:1.14 }, elite:{ hp:1.18, attack:1.16, speed:1.07, fire:1.12 }, boss:{ hp:1.00, attack:1.00, speed:1.00, fire:1.00 }, spawn:0.92 },
      { normal:{ hp:1.32, attack:1.26, speed:1.15, fire:1.16 }, elite:{ hp:1.20, attack:1.18, speed:1.08, fire:1.14 }, boss:{ hp:1.00, attack:1.00, speed:1.00, fire:1.00 }, spawn:0.91 },
      { normal:{ hp:1.36, attack:1.30, speed:1.16, fire:1.18 }, elite:{ hp:1.22, attack:1.20, speed:1.09, fire:1.16 }, boss:{ hp:1.08, attack:1.10, speed:1.04, fire:1.08 }, spawn:0.90 }
    ]
  };
}(window.PSD));
