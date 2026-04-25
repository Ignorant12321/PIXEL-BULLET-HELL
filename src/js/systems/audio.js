(function (PSD) {
  'use strict';

  PSD.audio.create = function createAudio() {
    let ctx = null;
    let master = null;
    let muted = false;
    let primed = false;

    function getCtx() {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      if (!ctx) {
        ctx = new AC();
        master = ctx.createGain();
        master.gain.value = 0.20;
        master.connect(ctx.destination);
      }
      return ctx;
    }

    function play(freq, dur, type, gain) {
      if (muted) return;
      try {
        const ac = getCtx();
        if (!ac || !master) return;
        const now = ac.currentTime;
        const osc = ac.createOscillator();
        const g   = ac.createGain();
        osc.type = type || 'square';
        osc.frequency.setValueAtTime(freq, now);
        g.gain.setValueAtTime(0.0001, now);
        g.gain.exponentialRampToValueAtTime(Math.max(0.0002, gain || 0.032), now + 0.01);
        g.gain.exponentialRampToValueAtTime(0.0001, now + (dur || 0.06));
        osc.connect(g); g.connect(master);
        osc.start(now);
        osc.stop(now + (dur || 0.06) + 0.03);
      } catch (_) {}
    }

    function unlock() {
      const ac = getCtx();
      if (!ac) return Promise.resolve(false);
      const resume = ac.state === 'suspended' ? ac.resume() : Promise.resolve();
      return resume.then(function () {
        if (!primed) {
          primed = true;
          play(880, 0.018, 'sine', 0.001);
        }
        return true;
      }).catch(function () { return false; });
    }

    function beep(freq, dur, type, gain) {
      if (muted) return;
      const ac = getCtx();
      if (!ac) return;
      if (ac.state === 'suspended') {
        unlock().then(function (ok) { if (ok) play(freq, dur, type, gain); });
      } else {
        play(freq, dur, type, gain);
      }
    }

    function toggle() {
      muted = !muted;
      if (!muted) {
        unlock().then(function () { beep(740, 0.05, 'triangle', 0.035); });
      }
      return muted;
    }

    ['pointerdown', 'keydown', 'touchstart'].forEach(function (name) {
      window.addEventListener(name, function () { unlock(); }, { once: true, passive: true });
    });

    return {
      beep,
      unlock,
      muted: function () { return muted; },
      toggle
    };
  };
}(window.PSD));
