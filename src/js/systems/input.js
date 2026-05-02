export function joystickVectorFromPoint(center, point, radius) {
  const limit = Math.max(1, Number(radius) || 1);
  const dx = (point.x || 0) - (center.x || 0);
  const dy = (point.y || 0) - (center.y || 0);
  const raw = Math.sqrt(dx * dx + dy * dy);
  if (!raw) return { x: 0, y: 0, active: false, distance: 0 };
  const scale = Math.min(1, limit / raw);
  return {
    x: dx * scale,
    y: dy * scale,
    active: raw >= limit * 0.18,
    distance: Math.min(raw, limit)
  };
}

export function joystickDirections(vector, deadzone) {
  const zone = Math.max(0, Number(deadzone) || 0);
  const x = vector && vector.x || 0;
  const y = vector && vector.y || 0;
  return {
    left: x < -zone,
    right: x > zone,
    up: y < -zone,
    down: y > zone
  };
}

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

  document.querySelectorAll('.touch-joystick').forEach(function (joy) {
    const knob = joy.querySelector('.touch-joystick-knob');
    const actions = ['left', 'right', 'up', 'down'];
    let activePointer = null;

    function center() {
      const r = joy.getBoundingClientRect();
      return { x: r.left + r.width / 2, y: r.top + r.height / 2, radius: Math.min(r.width, r.height) * 0.36 };
    }

    function setDirections(next) {
      actions.forEach(function (action) {
        keys[action] = !!next[action];
      });
    }

    function moveKnob(vector) {
      if (!knob) return;
      knob.style.transform = 'translate(calc(-50% + ' + vector.x.toFixed(1) + 'px), calc(-50% + ' + vector.y.toFixed(1) + 'px))';
    }

    function updateFromEvent(e) {
      const c = center();
      const vector = joystickVectorFromPoint(c, { x: e.clientX, y: e.clientY }, c.radius);
      setDirections(joystickDirections(vector, c.radius * 0.22));
      moveKnob(vector);
      joy.classList.toggle('active', vector.active);
    }

    function release(e) {
      if (e && e.preventDefault) e.preventDefault();
      if (e && activePointer !== null && e.pointerId !== activePointer) return;
      activePointer = null;
      setDirections({});
      moveKnob({ x: 0, y: 0 });
      joy.classList.remove('active');
      try {
        if (e && joy.hasPointerCapture(e.pointerId)) joy.releasePointerCapture(e.pointerId);
      } catch (_) {}
    }

    joy.addEventListener('pointerdown', function (e) {
      e.preventDefault();
      activePointer = e.pointerId;
      joy.setPointerCapture(e.pointerId);
      updateFromEvent(e);
    }, { passive: false });
    joy.addEventListener('pointermove', function (e) {
      if (activePointer !== e.pointerId) return;
      e.preventDefault();
      updateFromEvent(e);
    }, { passive: false });
    joy.addEventListener('pointerup', release, { passive: false });
    joy.addEventListener('pointercancel', release, { passive: false });
    joy.addEventListener('lostpointercapture', release, { passive: false });
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
