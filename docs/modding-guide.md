# 修改和扩展指南

这份文档面向想要改项目的人：新增星舰、敌人、掉落、升级、军械库路线、关卡幕时应该改哪些文件。

## 基本原则

优先从数据层改起：

```text
src/js/data/
```

这个项目的大部分内容都是配置驱动的。只有当数据字段不够表达新玩法时，再去改 `src/js/game/`、`src/js/ui/` 或 `src/js/render/`。

修改后建议运行：

```bash
npm test
```

## 新增星舰

星舰文件在：

```text
src/js/data/starships/
```

参考：

```text
src/js/data/starships/swift.js
```

一个星舰大致长这样：

```js
const swift = {
  id: "swift",
  name: "逐光号",
  icon: "shipSwift",
  role: "突击型",
  hp: 76,
  damage: 1,
  speed: 292,
  range: 340,
  fireRate: 0.18,
  bombs: 2,
  abilities: [],
  color: "#56f6ff",
  special: "移动与射速更高，适合贴近火线快速清怪。",
  brief: "高速 / 高射速 / 低生命"
};

export default swift;
```

新增步骤：

1. 新建 `src/js/data/starships/<id>.js`
2. 在 `src/js/data/starships/index.js` 中 import
3. 把新星舰加入 `starships` 数组
4. 如果使用新图标，确认 `src/js/data/icons.js` 有对应 key
5. 运行 `npm test`

常用字段：

| 字段 | 作用 |
| --- | --- |
| `id` | 唯一 ID，用于存档和选择 |
| `name` | 显示名称 |
| `icon` | 图标 key |
| `role` | 定位文案 |
| `hp` | 玩家生命 |
| `damage` | 基础伤害加成 |
| `speed` | 移动速度 |
| `range` | 有效射程 |
| `fireRate` | 射击间隔，越小越快 |
| `bombs` | 初始歼灭弹数量 |
| `abilities` | 星舰特殊能力声明 |
| `color` | 主题色 |
| `special` | 详细说明 |
| `brief` | 简短定位 |

## 星舰特殊能力

星舰特殊能力现在用 `abilities` 数组声明，能力逻辑集中在：

```text
src/js/game/ship-abilities.js
```

星舰文件只负责声明“这艘船有什么能力”：

```js
abilities: [
  { type: "waveShield", value: 1 },
  { type: "baseArmor", value: 0.1 }
]
```

当前支持的能力：

| type | 作用 |
| --- | --- |
| `waveShield` | 每波开始时获得护盾 |
| `baseArmor` | 基地承伤降低 |
| `coinBonus` | 击杀晶币收益提升 |

能力触发和结算由 `ship-abilities.js` 处理。不要再把 `shieldAtWave`、`baseArmor`、`coinBonus` 这类特殊能力直接写在星舰顶层。

如果要新增一种特殊机制，推荐流程：

1. 在星舰的 `abilities` 中声明新 `type`
2. 在 `test/ship-abilities.test.js` 中写能力测试
3. 在 `src/js/game/ship-abilities.js` 中实现能力解释
4. 如果能力影响玩家初始属性，确认 `src/js/entities/factory.js` 会读取它
5. 如果能力在事件中触发，确认 `src/js/game/game.js` 在对应时机调用 `applyShipEvent()`

## 修改星舰平衡

只改已有星舰时，通常只需要改对应文件，例如：

```text
src/js/data/starships/guard.js
src/js/data/starships/ranger.js
```

推荐一次只改 1 到 2 个核心变量，比如生命和速度，方便感知变化。改完后进入游戏试玩前 3 波，确认手感没有过强或过弱。

## 新增敌人

敌人文件在：

```text
src/js/data/enemies/
```

参考：

```text
src/js/data/enemies/scout.js
```

一个敌人大致长这样：

```js
const scout = {
  role: "normal",
  name: "侦察蜂群",
  hp: 7,
  speed: 78,
  radius: 10,
  reward: 4,
  damage: 6,
  baseDamage: 8,
  bulletDamage: 0,
  score: 18,
  icon: "scout",
  color: "#ff4fd8",
  desc: "高速小型目标，生命低，会快速冲向基地。"
};

export default scout;
```

新增步骤：

1. 新建 `src/js/data/enemies/<id>.js`
2. 在 `src/js/data/enemies/index.js` 中 import
3. 把新敌人加入 `enemies` 对象，key 就是波次里使用的敌人 ID
4. 如果敌人有特殊能力，修改 `src/js/game/enemy-abilities.js`
5. 如果需要特殊绘制，修改 `src/js/render/renderer.js`
6. 在波次文件中使用这个敌人 ID
7. 运行 `npm test`

常用字段：

| 字段 | 作用 |
| --- | --- |
| `role` | 敌人类型，用于逻辑或展示区分 |
| `name` | 显示名称 |
| `hp` | 生命 |
| `speed` | 移动速度 |
| `radius` | 碰撞半径 |
| `reward` | 击杀金币 |
| `damage` | 接触玩家伤害 |
| `baseDamage` | 突破到基地时造成的伤害 |
| `bulletDamage` | 敌方子弹伤害 |
| `score` | 击杀分数 |
| `icon` | 图标 key |
| `color` | 绘制颜色 |
| `desc` | 图鉴说明 |

## 修改波次和难度

波次系统已经有独立文档：

```text
docs/wave-system.md
```

快速定位：

| 内容 | 文件 |
| --- | --- |
| 第一幕波次 | `src/js/data/acts/act-01/waves/` |
| 第二幕波次 | `src/js/data/acts/act-02/waves/` |
| 第一幕难度倍率 | `src/js/data/acts/act-01/difficulty.js` |
| 第二幕难度倍率 | `src/js/data/acts/act-02/difficulty.js` |
| 波次生成逻辑 | `src/js/game/waves.js` |
| 波次工具 | `src/js/data/acts/wave-utils.js` |

推荐用 `phases` 配置波次，并用 `defineWave()` 自动生成 `entries`。

## 新增一幕关卡

现有幕目录：

```text
src/js/data/acts/act-01/
src/js/data/acts/act-02/
```

新增步骤：

1. 复制一个已有幕目录为 `src/js/data/acts/act-03/`
2. 修改 `act-03/index.js` 里的 `id`、`name`、`codename`
3. 修改或替换 `waves/` 下的波次文件
4. 修改 `difficulty.js`
5. 在 `src/js/data/acts/index.js` 中 import 新幕，并加入 `acts` 数组
6. 如果难度聚合需要展示新幕倍率，更新 `src/js/data/index.js`
7. 运行 `npm test`

注意：`data/acts/index.js` 会把所有幕的波次摊平成全局波次列表，并补上 `actId`、`actName`、`localWave`、`globalWave` 等字段。

## 新增掉落物

掉落物文件在：

```text
src/js/data/pickups/
```

新增步骤：

1. 新建 `src/js/data/pickups/<id>.js`
2. 在 `src/js/data/pickups/index.js` 中 import
3. 把新掉落加入 `pickups` 对象
4. 修改 `src/js/game/pickups.js`，让系统有机会选中新掉落
5. 修改 `src/js/game/game.js` 中拾取后的效果处理
6. 如需新图标或新表现，修改 `src/js/data/icons.js` 和 `src/js/render/renderer.js`
7. 运行 `npm test`

## 新增商店服务或基础升级

基础商店数据在：

```text
src/js/data/upgrades/
```

新增步骤：

1. 新建 `src/js/data/upgrades/<id>.js`
2. 在 `src/js/data/upgrades/index.js` 中 import
3. 把新升级加入 `upgrades` 数组
4. 确认 `src/js/data/tabs.js` 中的商店 tab 能展示这个分类
5. 如果是服务类购买，检查 `src/js/game/economy.js` 和 `src/js/game/game.js`
6. 运行 `npm test`

## 修改军械库路线

军械库路线集中在：

```text
src/js/data/armory-routes.js
```

每条路线可以包含：

| 字段 | 作用 |
| --- | --- |
| `id` | 升级唯一 ID |
| `routeId` | 所属路线 |
| `tier` | 层级 |
| `branch` | 分支 ID |
| `max` | 最大等级 |
| `cost` | 基础费用 |
| `prereq` | 前置升级 |
| `locks` | 互斥升级 |
| `effects` | 效果 |
| `name` | 显示名称 |
| `icon` | 图标 key |
| `desc` | 描述 |

军械库规则在：

```text
src/js/game/armory.js
```

UI 在：

```text
src/js/ui/armory-view.js
src/styles/armory.css
```

如果只是加一条普通升级，通常只需要改 `armory-routes.js`。如果新增 `effects` 字段，还要确认战斗计算会读取它。战斗相关计算主要在：

```text
src/js/game/combat.js
```

## 修改 UI

UI 通常涉及三处：

| 内容 | 文件 |
| --- | --- |
| 页面结构 | `index.html` |
| 样式 | `src/styles/app.css`、`src/styles/armory.css` |
| DOM 更新和事件 | `src/js/ui/` |

建议流程：

1. 先确认页面上是否已有对应 DOM
2. 修改或新增 `index.html` 结构
3. 在 `ui.js` 的 DOM 引用里接入新元素
4. 把复杂渲染拆到对应 view 文件
5. 修改 CSS
6. 浏览器试玩并运行 `npm test`

## 修改战斗规则

常见入口：

| 想改的内容 | 文件 |
| --- | --- |
| 伤害、射速、射程、暴击 | `src/js/game/combat.js` |
| 武器是否解锁 | `src/js/game/combat.js` |
| 子弹移动 | `src/js/game/combat.js` |
| 目标选择 | `src/js/game/targets.js` |
| 敌人特殊能力 | `src/js/game/enemy-abilities.js` |
| 玩家、敌人、弹体创建 | `src/js/entities/factory.js` |

改规则时建议同步补或更新测试。已有测试可以作为写法参考。

## 修改前检查清单

- 要改的是数据、规则、UI 还是渲染？
- 新增数据是否在对应 `index.js` 注册？
- 新增 ID 是否和已有 ID 冲突？
- 新图标是否存在于 `icons.js`？
- 新字段是否被逻辑层读取？
- 是否需要更新图鉴或商店 tab？
- 是否运行了 `npm test`？
