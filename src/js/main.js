import data from './data/index.js';
import * as utils from './core/utils.js';
import { createGame } from './game/game.js';
import { createUI } from './ui/ui.js';

function boot() {
  const canvas = document.getElementById('game');
  const game = createGame(canvas, data, { utils });
  const ui = createUI(game, data, utils);
  game.setUI(ui);
  ui.update();
  game.start();

  document.addEventListener('visibilitychange', function () {
    if (document.hidden && game.view().phase === 'playing') {
      game.togglePause();
      ui.toast('页面切走，已自动暂停');
    }
  });

  window.pixelStarship = { game, ui };
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
