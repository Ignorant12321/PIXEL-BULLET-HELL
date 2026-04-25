(function (PSD) {
  'use strict';

  function boot() {
    const canvas = document.getElementById('game');
    const game   = PSD.game.create(canvas);
    const ui     = PSD.ui.create(game);
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
    window.pixelStarDefender = window.pixelStarship;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
}(window.PSD));
