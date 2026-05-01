# 波次配置系统说明

这份文档说明当前关卡波次的组织方式，以及如何调整每一波的敌人、出现时间、随机顺序和整体难度。

## 文件位置

每一幕关卡有自己的目录：

```text
src/js/data/acts/act-01/
src/js/data/acts/act-02/
```

每一波敌人单独放在 `waves` 目录里：

```text
src/js/data/acts/act-01/waves/wave-01.js
src/js/data/acts/act-01/waves/wave-02.js
src/js/data/acts/act-01/waves/wave-03.js
...

src/js/data/acts/act-02/waves/wave-01.js
src/js/data/acts/act-02/waves/wave-02.js
...
```

每一幕的 `index.js` 只负责把这些 wave 文件按顺序导入并组成数组：

```js
import wave01 from './waves/wave-01.js';
import wave02 from './waves/wave-02.js';

const waves = [wave01, wave02];
```

所以如果要调整第一幕第一波，就直接改：

```text
src/js/data/acts/act-01/waves/wave-01.js
```

如果要新增第 11 波，需要：

1. 新建 `wave-11.js`
2. 在对应幕的 `index.js` 中 import
3. 把 `wave11` 放进 `waves` 数组
4. 如果需要独立难度倍率，也补对应幕的 `difficulty.js`

## 一个 wave 文件的结构

示例：

```js
import { defineWave } from '../../wave-utils.js';

export default defineWave({
  wave: 1,
  name: '前哨侦察',
  kind: '普通',
  reward: 34,
  phases: [
    { at: 0.8, sequence: [['scout', 2]], interval: [0.7, 1] },
    {
      delay: 0.8,
      pool: [
        { type: 'scout', count: 4, weight: 3 },
        { type: 'raider', count: 6, weight: 2 }
      ],
      interval: [0.65, 0.95]
    },
    { delay: 1.1, sequence: [['raider', 2]], interval: [0.75, 1.05] }
  ]
});
```

基础字段：

| 字段 | 作用 |
| --- | --- |
| `wave` | 当前幕内的波次编号 |
| `name` | 波次名称，显示给玩家 |
| `kind` | 类型，比如 `普通`、`精英`、`Boss` |
| `elite` | 是否精英波，可选 |
| `boss` | 是否 Boss 波，可选 |
| `reward` | 通关这一波的奖励 |
| `phases` | 这一波的出怪脚本 |

不要手写 `entries`。现在 `entries` 会由 `defineWave()` 根据 `phases` 自动生成，主要用于兼容旧逻辑，例如总敌人数统计。

## phases 是什么

`phases` 可以理解为一波敌人的几个阶段。

例如第一波可以拆成：

1. 开场：少量侦察机，让玩家进入节奏
2. 主体：从随机池里抽取侦察机和突击机
3. 收尾：再补一小组突击机

这样会比单纯写：

```js
entries: [['scout', 6], ['raider', 8]]
```

更有游戏感，因为敌人不会永远按固定分组一段段刷出来。

## phase 字段

每个 phase 支持这些字段：

| 字段 | 作用 |
| --- | --- |
| `at` | 把当前阶段的起始时间设置到指定秒数 |
| `delay` | 在上一阶段结束后再等待多少秒 |
| `sequence` | 固定顺序出怪 |
| `pool` | 随机池出怪 |
| `interval` | 每个敌人之间的出怪间隔 |

### at

`at` 是绝对时间。

```js
{ at: 0.8, sequence: [['scout', 2]], interval: [0.7, 1] }
```

意思是这一阶段从 0.8 秒附近开始。注意第一个敌人不是刚好在 0.8 秒出现，因为系统会先加一次 `interval`，再生成敌人。

### delay

`delay` 是相对等待时间。

```js
{ delay: 1.1, sequence: [['raider', 2]], interval: [0.75, 1.05] }
```

意思是上一阶段结束后，先等 1.1 秒，再开始这个阶段的出怪节奏。

### interval

`interval` 控制敌人之间的间隔。

固定间隔：

```js
interval: 0.6
```

随机范围：

```js
interval: [0.65, 0.95]
```

推荐优先使用随机范围。这样同一波每次游玩会有一点变化，但总量仍然可控。

数值越小，敌人越密集。数值越大，敌人越稀疏。

### sequence

`sequence` 是固定顺序。

```js
sequence: [
  ['scout', 3],
  ['tank', 1]
]
```

含义：

1. 先刷 3 个 `scout`
2. 再刷 1 个 `tank`

适合用于：

- 开场教学
- Boss 最后登场
- 精英怪压轴
- 明确的剧情节奏

### pool

`pool` 是随机池。

```js
pool: [
  { type: 'scout', count: 8, weight: 3 },
  { type: 'raider', count: 6, weight: 2 },
  { type: 'tank', count: 2, weight: 1 }
]
```

含义：

- 总共会刷 8 个 `scout`
- 总共会刷 6 个 `raider`
- 总共会刷 2 个 `tank`
- 每次从还有剩余数量的敌人中随机抽一个
- `weight` 越高，越容易先被抽到

`pool` 不会改变总数量，只会改变出现顺序。

例如上面的总数永远是：

```js
scout: 8
raider: 6
tank: 2
```

但顺序可能是：

```text
scout, raider, scout, scout, tank, raider...
```

也可能是：

```text
raider, scout, tank, scout, raider, scout...
```

## 如何调整第一波太密集

打开：

```text
src/js/data/acts/act-01/waves/wave-01.js
```

当前第一波结构大致是：

```js
phases: [
  { at: 0.8, sequence: [['scout', 2]], interval: [0.7, 1] },
  {
    delay: 0.8,
    pool: [
      { type: 'scout', count: 4, weight: 3 },
      { type: 'raider', count: 6, weight: 2 }
    ],
    interval: [0.65, 0.95]
  },
  { delay: 1.1, sequence: [['raider', 2]], interval: [0.75, 1.05] }
]
```

如果觉得第一波开头还是太密：

```js
{ at: 1.2, sequence: [['scout', 2]], interval: [0.9, 1.2] }
```

如果觉得中段太密：

```js
interval: [0.8, 1.15]
```

如果觉得总敌人太多：

```js
{ type: 'scout', count: 3, weight: 3 },
{ type: 'raider', count: 4, weight: 2 }
```

如果想让第一波更偏侦察机，少一点突击压力：

```js
pool: [
  { type: 'scout', count: 6, weight: 4 },
  { type: 'raider', count: 4, weight: 1 }
]
```

## 如何做出更有游戏感的波次

推荐按这个节奏设计：

### 1. 开场给玩家读秒

```js
{ at: 0.8, sequence: [['scout', 2]], interval: [0.7, 1] }
```

作用：让玩家知道这一波开始了，但不马上压满屏幕。

### 2. 主体用随机池

```js
{
  delay: 0.6,
  pool: [
    { type: 'scout', count: 8, weight: 3 },
    { type: 'raider', count: 6, weight: 2 }
  ],
  interval: [0.5, 0.8]
}
```

作用：同一波每次顺序不同，但总强度稳定。

### 3. 收尾放特色敌人

```js
{ delay: 1, sequence: [['tank', 2]], interval: [0.9, 1.2] }
```

作用：让玩家感受到“这波还有后劲”，而不是刷完小怪就结束。

### 4. 精英和 Boss 不建议放进随机池

精英怪和 Boss 最好用 `sequence` 控制登场：

```js
{ delay: 1.8, sequence: [['boss', 1]], interval: 1.4 }
```

这样节奏更稳定，也方便做音效、提示或镜头表现。

## 敌人 ID

当前常用敌人 ID：

| ID | 定位 |
| --- | --- |
| `scout` | 快速侦察单位，血少速度快 |
| `raider` | 基础突击单位 |
| `gunner` | 远程火力单位 |
| `tank` | 高血量装甲单位 |
| `elite` | 第一幕精英单位 |
| `riftHunter` | 第二幕闪现/突进特色单位 |
| `shieldWarden` | 护盾单位 |
| `jammer` | 干扰单位 |
| `splitter` | 分裂单位 |
| `boss` | 第一幕 Boss |
| `voidMothership` | 第二幕 Boss |

敌人的具体血量、速度、奖励和能力在这里：

```text
src/js/data/enemies/
```

## 难度倍率在哪里调

波次文件控制“刷什么、什么时候刷、顺序怎么变化”。

难度文件控制“这一波整体有多强”。

第一幕：

```text
src/js/data/acts/act-01/difficulty.js
```

第二幕：

```text
src/js/data/acts/act-02/difficulty.js
```

常见字段：

| 字段 | 作用 |
| --- | --- |
| `hp` | 敌人生命倍率 |
| `speed` | 敌人速度倍率 |
| `reward` | 击杀奖励倍率 |
| `spawn` | 出怪间隔倍率 |

`spawn` 比较特殊：

- `spawn` 越小，间隔越短，刷怪越密
- `spawn` 越大，间隔越长，刷怪越慢

例如：

```js
spawn: 1.15
```

会让这一波整体出怪慢一些。

```js
spawn: 0.85
```

会让这一波整体出怪更密。

## 推荐调参顺序

如果一波太难，建议按这个顺序改：

1. 先增大 `interval`，让敌人不要挤在一起
2. 再增加阶段之间的 `delay`
3. 再减少 `count`
4. 最后才改敌人的基础属性

如果一波太简单，建议按这个顺序改：

1. 先降低 `interval`
2. 再提高危险敌人的 `weight`
3. 再增加特色敌人的 `count`
4. 最后才提高 `difficulty.js` 里的生命或速度倍率

## 常见模板

### 普通杂兵波

```js
phases: [
  { at: 0.6, sequence: [['scout', 3]], interval: [0.5, 0.8] },
  {
    delay: 0.5,
    pool: [
      { type: 'scout', count: 8, weight: 3 },
      { type: 'raider', count: 6, weight: 2 }
    ],
    interval: [0.5, 0.85]
  }
]
```

### 装甲压力波

```js
phases: [
  { at: 0.6, sequence: [['raider', 4]], interval: [0.5, 0.8] },
  {
    delay: 0.6,
    pool: [
      { type: 'raider', count: 8, weight: 3 },
      { type: 'tank', count: 3, weight: 1 }
    ],
    interval: [0.6, 0.95]
  },
  { delay: 1, sequence: [['tank', 2]], interval: [0.9, 1.2] }
]
```

### 远程火力波

```js
phases: [
  { at: 0.5, sequence: [['raider', 3]], interval: [0.5, 0.8] },
  {
    delay: 0.6,
    pool: [
      { type: 'raider', count: 8, weight: 3 },
      { type: 'gunner', count: 5, weight: 2 }
    ],
    interval: [0.55, 0.85]
  }
]
```

### 精英波

```js
phases: [
  { at: 0.5, sequence: [['raider', 4]], interval: [0.5, 0.75] },
  {
    delay: 0.6,
    pool: [
      { type: 'raider', count: 8, weight: 3 },
      { type: 'gunner', count: 4, weight: 1 }
    ],
    interval: [0.55, 0.85]
  },
  { delay: 1.1, sequence: [['elite', 1]], interval: 1.2 }
]
```

### Boss 波

```js
phases: [
  { at: 0.5, sequence: [['raider', 3]], interval: [0.5, 0.75] },
  {
    delay: 0.7,
    pool: [
      { type: 'raider', count: 6, weight: 3 },
      { type: 'gunner', count: 5, weight: 2 }
    ],
    interval: [0.6, 0.9]
  },
  { delay: 1.8, sequence: [['boss', 1]], interval: 1.4 }
]
```

## 测试约束

目前有两类测试会保护波次配置。

波次生成逻辑：

```text
test/wave-spawn.test.js
```

它会验证：

- 旧 `entries` 写法仍然可用
- `sequence` 可以按固定顺序出怪
- `pool` 可以随机出怪但不改变总数量
- `summarizeWaveEntries()` 能从 `phases` 自动生成 `entries`

波次数据结构：

```text
test/wave-data.test.js
```

它会验证：

- 每一波都有 `phases`
- 每一波至少有两个阶段
- 每一波都包含一个随机池 `pool`
- 自动生成的 `entries` 和 `phases` 总数一致

完整测试命令：

```bash
npm test
```

## 快速检查清单

改完一波后，建议检查：

- `wave` 编号是否正确
- `name` 是否符合这一波的主题
- `reward` 是否和难度匹配
- `phases` 是否至少有开场和主体
- 主体是否用 `pool` 做随机顺序
- 精英和 Boss 是否用 `sequence` 控制稳定登场
- `interval` 是否太小导致第一屏太挤
- 总敌人数是否符合预期
- `npm test` 是否通过

