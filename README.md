# 像素星舰

一个像素风横版弹幕防守小游戏。玩家开局选择不同型号的像素星舰，守住右侧基地，通过击杀、拾取、商店圣遗物、有限射程武器与歼灭弹推进 10 波战斗并击破第一幕 Boss。

## 运行方式

这是纯静态项目，不需要构建步骤。

1. 直接双击 `index.html` 打开；或
2. 在项目目录启动一个本地静态服务器：

```bash
python3 -m http.server 8000
```

然后在浏览器打开本地地址即可。

## 操作

- 移动：`WASD` / 方向键
- 慢速移动：`Shift`
- 开始 / 继续：`Space` / `Enter`
- 左上角主按钮：待命时开始，战斗/暂停时重开
- 歼灭弹：`X`
- 暂停：`P`
- 商店：`B`
- 图鉴：`C`
- 触屏设备：屏幕下方会显示虚拟方向键、慢速键和歼灭弹键

## 项目结构

```text
pixel-starship-project/
├─ index.html
├─ README.md
├─ package.json
└─ src/
   ├─ styles/
   │  └─ app.css
   └─ js/
      ├─ core/
      │  └─ namespace.js            # 全局命名空间、工具函数、本地存储封装
      ├─ data/
      │  ├─ game-data.js            # 星舰、怪物、掉落、升级、波次、图鉴数据
      │  └─ difficulty-config.js    # 关卡难度递进专用配置
      ├─ systems/
      │  ├─ audio.js                # Web Audio 音效
      │  └─ input.js                # 键盘、指针和触屏按钮输入
      ├─ entities/
      │  └─ factory.js              # 玩家、敌人、子弹、导弹、掉落物、粒子工厂
      ├─ render/
      │  └─ renderer.js             # Canvas 绘制
      ├─ game/
      │  └─ game.js                 # 游戏状态、战斗循环、商店购买和碰撞
      ├─ ui/
      │  └─ ui.js                   # DOM 面板、商店、图鉴、提示和星舰选择
      └─ main.js                    # 启动入口
```

## 本轮完善

- 项目名称统一为“像素星舰”。
- 圣遗物面板只显示已经获得的效果，未获得时不再占用格子。
- 删除顶部复杂 wavebox，关卡进度改为战场右下角的低存在感简约进度条。
- 商店和图鉴删除右上角关闭按钮，以及继续/下一波、重开按钮；只保留右下角“返回战场”。
- 晶币统一使用 `￥` 符号。
- 星舰生命改为数值生命池，敌人撞击或弹幕会按攻击力扣除生命，不再表现为“次数”。
- 新增 `src/js/data/difficulty-config.js`，集中管理每波普通敌人、精英和 Boss 的生命、攻击、速度、射速与刷怪节奏成长。
- 新增射程限制：主炮、导弹和僚机都受射程影响，战场中会显示低透明度射程线。
- 新增三种开局像素星舰：逐光号、玄武号、天枢号；每艘有不同图片、生命、攻击、速度、射程和开局特性。
- 保留并继续完善 Buff 倒计时、歼灭弹压缩脉冲、盲盒 10%～200% 晶币返还、图鉴同步像素图案等功能。

## 开发提示

- 新增星舰、敌人、掉落、升级、波次：优先改 `src/js/data/game-data.js`。
- 调整关卡难度递进：改 `src/js/data/difficulty-config.js`。
- 调整数值、碰撞、购买逻辑：改 `src/js/game/game.js`。
- 调整画面表现：改 `src/js/render/renderer.js` 与 `src/styles/app.css`。
- 调整按钮、面板、商店和图鉴 DOM：改 `src/js/ui/ui.js`。
