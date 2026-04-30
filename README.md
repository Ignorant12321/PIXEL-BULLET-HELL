# 像素星舰

一个像素风横版弹幕防守小游戏。玩家选择不同型号的星舰，守住右侧基地，抵御两幕敌潮并击破最终 Boss。

## 运行方式

这是一个纯静态 ES Modules 项目，不需要额外构建。

1. 推荐在项目目录运行本地静态服务器：

```bash
npm run serve
```

2. 然后在浏览器中打开提示的本地地址。

> 浏览器原生 ES Modules 在部分浏览器里不适合直接用 `file://` 打开，使用静态服务器最稳。

## 操作说明

- 移动：`WASD` / 方向键
- 慢速移动：`Shift`
- 开始 / 继续：`Space` / `Enter`
- 暂停：`P`
- 歼灭弹：`X`
- 商店 / 军械库：`B`
- 图鉴：`C`
- 触屏设备：支持屏幕方向键、慢速键和歼灭弹按钮

## 目录结构

```text
Star War/
├─ index.html
├─ package.json
├─ README.md
└─ src/
   ├─ styles/
   │  └─ app.css
   └─ js/
      ├─ core/
      │  └─ utils.js
      ├─ data/
      │  ├─ index.js
      │  ├─ icons.js
      │  ├─ storage.js
      │  ├─ tabs.js
      │  ├─ starships/
      │  ├─ enemies/
      │  ├─ pickups/
      │  ├─ upgrades/
      │  └─ acts/
      │     └─ act-01/
      │        ├─ index.js
      │        └─ difficulty.js
      ├─ systems/
      │  ├─ audio.js
      │  └─ input.js
      ├─ entities/
      │  └─ factory.js
      ├─ render/
      │  └─ renderer.js
      ├─ game/
      │  ├─ game.js
      │  ├─ state.js
      │  ├─ waves.js
      │  ├─ combat.js
      │  ├─ economy.js
      │  └─ pickups.js
      ├─ ui/
      │  └─ ui.js
      └─ main.js
```

## 文件说明

- `index.html`：页面入口，只加载 `src/js/main.js` 这一个 `type="module"` 脚本。
- `src/js/main.js`：初始化数据、游戏实例和 UI，并保留 `window.pixelStarship` 调试入口。
- `src/js/core/utils.js`：通用数学、碰撞、HTML 转义、存储和像素图标工具。
- `src/js/data/index.js`：唯一的数据聚合入口，组装星舰、敌人、掉落、升级、军械库、幕、波次、难度和图鉴。
- `src/js/game/game.js`：游戏主循环和状态编排；状态、波次、战斗、经济、拾取的独立规则放在同目录模块中。
- `src/js/entities/factory.js`：创建玩家、敌人、子弹、导弹、掉落物和粒子。
- `src/js/render/renderer.js`：Canvas 渲染层。
- `src/js/ui/ui.js`：DOM 面板、商店、图鉴、提示框、星舰选择和按钮交互。

## 扩展玩法

- 新增星舰：添加 `src/js/data/starships/<id>.js`，并在 `src/js/data/starships/index.js` 导入导出。
- 新增敌人：添加 `src/js/data/enemies/<id>.js`，并在 `src/js/data/enemies/index.js` 导入导出。
- 新增掉落：添加 `src/js/data/pickups/<id>.js`，并在 `src/js/data/pickups/index.js` 导入导出。
- 新增升级：添加 `src/js/data/upgrades/<id>.js`，并在 `src/js/data/upgrades/index.js` 导入导出。
- 新增波次：直接在对应幕目录下新增 `wave-xx.js`，并在该幕的 `index.js` 里注册。
- 新增幕：按 `src/js/data/acts/act-01/` 的结构创建 `act-02/`，并在 `src/js/data/acts/index.js` 注册。

## 开发参考

- 想调整数值：优先看 `src/js/data/` 下的单文件数据。
- 想调整战斗逻辑：看 `src/js/game/combat.js` 和 `src/js/game/game.js`。
- 想调整波次推进：看 `src/js/game/waves.js` 和 `src/js/data/acts/act-01/index.js`。
- 想调第几波的难度倍率：看 `src/js/data/acts/act-01/difficulty.js` 和 `src/js/data/acts/act-02/difficulty.js`，里面按 `wave01` 到 `wave10` 分开了。
- 想改画面表现：看 `src/js/render/renderer.js` 和 `src/styles/app.css`。
- 想改界面交互：看 `src/js/ui/ui.js` 和 `src/js/systems/input.js`。
