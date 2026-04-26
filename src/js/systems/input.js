export function createInput(canvas) {
  const keys = Object.create(null);
  const pressed = Object.create(null);
  const pointer = { active: false, x: 0, y: 0 };

  const keyMap = {
    KeyW: 'up', KeyS: 'down', KeyA: 'left', KeyD: 'right',
    ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right',
    ShiftLeft: 'slow', ShiftRight: 'slow',
    KeyX: 'bomb', KeyP: 'pause', KeyB: 'shop', KeyC: 'codex',
    Space: 'start', Enter: 'start', Escape: 'escape'
  };

  function setPtr(e) {
    const r = canvas.getBoundingClientRect();
    pointer.x = e.clientX - r.left;
    pointer.y = e.clientY - r.top;
  }

  window.addEventListener('keydown', function (e) {
    const a = keyMap[e.code];
    if (!a) return;
    e.preventDefault();
    if (!keys[a]) pressed[a] = true;
    keys[a] = true;
  }, { passive: false });

  window.addEventListener('keyup', function (e) {
    const a = keyMap[e.code];
    if (!a) return;
    e.preventDefault();
    keys[a] = false;
  }, { passive: false });

  canvas.addEventListener('pointerdown', function (e) {
    pointer.active = true;
    canvas.setPointerCapture(e.pointerId);
    setPtr(e);
  });
  canvas.addEventListener('pointermove', function (e) { if (pointer.active) setPtr(e); });
  canvas.addEventListener('pointerup', function (e) {
    pointer.active = false;
    if (canvas.hasPointerCapture(e.pointerId)) canvas.releasePointerCapture(e.pointerId);
  });
  canvas.addEventListener('pointercancel', function () { pointer.active = false; });

  document.querySelectorAll('[data-input]').forEach(function (btn) {
    const action = btn.dataset.input;
    if (!action) return;
    function activate(e) {
      e.preventDefault();
      if (!keys[action]) pressed[action] = true;
      keys[action] = true;
      btn.classList.add('active');
    }
    function release(e) {
      if (e && e.preventDefault) e.preventDefault();
      keys[action] = false;
      btn.classList.remove('active');
    }
    btn.addEventListener('pointerdown', activate, { passive: false });
    btn.addEventListener('pointerup', release, { passive: false });
    btn.addEventListener('pointerleave', release, { passive: false });
    btn.addEventListener('pointercancel', release, { passive: false });
  });

  function consume(action) {
    const v = !!pressed[action];
    pressed[action] = false;
    return v;
  }

  function endFrame() {
    Object.keys(pressed).forEach(function (a) { pressed[a] = false; });
  }

  return { keys, pointer, consume, endFrame };
}

export default { createInput };
