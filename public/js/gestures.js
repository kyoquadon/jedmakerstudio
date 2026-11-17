/* Maker's Studio Room: hand control with MediaPipe Gesture Recognizer.
   Everything runs in this browser; no camera frames leave the laptop.
   Point = move the cursor. Pinch = click. Pinch and drag = look around.
   Open palm moved sideways = look around. Closed fist (hold) = back to the room.
   Peace sign moved up or down = scroll the panel. Thumbs up (hold) = save. */
(() => {
  'use strict';
  const MP = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.2.0';
  const MODEL = 'https://storage.googleapis.com/mediapipe-models/gesture_recognizer/gesture_recognizer/float16/1/gesture_recognizer.task';
  const SAVE = {workbench: '#saveEntry', pinboard: '#savePin', corner: '#chatSend', gallery: '#pcSave', playground: '#logSave', wall: '#blockSave'};
  const btn = document.getElementById('handBtn'), status = document.getElementById('handStatus'), prev = document.getElementById('handPreview');
  if (!btn) return;
  btn.hidden = false;
  let rec = null, video = null, stream = null, running = false, lastVT = -1;
  const cur = {x: innerWidth / 2, y: innerHeight / 2};
  let pinched = false, target = null, downAt = null, fistSince = 0, fistDone = false, thumbSince = 0, thumbDone = false, palm = null, peace = null, lostSince = 0;
  const cursor = document.createElement('div'); cursor.className = 'hand-cursor lost'; cursor.hidden = true; cursor.setAttribute('aria-hidden', 'true'); document.body.appendChild(cursor);
  const say = t => { status.hidden = !t; status.textContent = t || ''; };
  const HELP = 'Hand control on. Point to move, pinch to click, pinch and drag or wave an open palm to look around, hold a fist for the room, peace sign to scroll, hold a thumbs up to save.';
  const clamp = v => Math.max(0, Math.min(1, v));
  const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
  const pe = (type, el, c) => el && el.dispatchEvent(new PointerEvent(type, {bubbles: true, cancelable: true, clientX: c.x, clientY: c.y, pointerId: 77, pointerType: 'mouse', isPrimary: true, button: 0, buttons: type === 'pointerup' ? 0 : 1}));
  const at = c => { cursor.style.display = 'none'; const el = document.elementFromPoint(c.x, c.y); cursor.style.display = ''; return el; };

  function press(c) { target = at(c); downAt = {x: c.x, y: c.y}; pe('pointerdown', target, c); }
  function release(c) {
    if (!target) return; pe('pointerup', target, c);
    const moved = Math.hypot(c.x - downAt.x, c.y - downAt.y);
    if (moved < 14 && target.id !== 'roomCanvas' && target.tagName !== 'CANVAS') {
      const t = target.closest('button, a, label, input, textarea, select, [data-act], [data-scrap], [tabindex]') || target;
      if (t.matches('input[type=text], input[type=url], input[type=search], textarea')) t.focus(); else t.click();
    }
    target = null;
  }
  function handle(res, now) {
    const lm = res.landmarks && res.landmarks[0];
    if (!lm) { if (!lostSince) lostSince = now; cursor.classList.add('lost'); if (pinched && now - lostSince > 300) { pinched = false; release(cur); cursor.classList.remove('pinch'); } palm = peace = null; fistSince = thumbSince = 0; return; }
    lostSince = 0; cursor.classList.remove('lost');
    const g = (res.gestures && res.gestures[0] && res.gestures[0][0]) ? res.gestures[0][0].categoryName : 'None';
    const tx = clamp((1 - lm[8].x - 0.15) / 0.7) * innerWidth, ty = clamp((lm[8].y - 0.12) / 0.62) * innerHeight;
    const k = pinched ? 0.5 : 0.35; cur.x += (tx - cur.x) * k; cur.y += (ty - cur.y) * k;
    cursor.style.transform = `translate(${cur.x}px, ${cur.y}px)` + (pinched ? ' scale(.7)' : '');
    cursor.style.left = '0'; cursor.style.top = '0';
    const size = dist(lm[0], lm[9]) || 0.1, pinch = dist(lm[4], lm[8]) / size;
    if (!pinched && pinch < 0.32) { pinched = true; cursor.classList.add('pinch'); press(cur); }
    else if (pinched && pinch > 0.5) { pinched = false; cursor.classList.remove('pinch'); release(cur); }
    else { const el = pinched ? target : at(cur); pe('pointermove', el, cur); }
    // fist: back to the room
    if (g === 'Closed_Fist' && !pinched) { if (!fistSince) fistSince = now; if (!fistDone && now - fistSince > 600) { fistDone = true; if (location.hash && location.hash !== '#room') { location.hash = 'room'; window.StudioHooks && window.StudioHooks.notice('Back in the room.'); } } } else { fistSince = 0; fistDone = false; }
    // thumbs up: save
    if (g === 'Thumb_Up') { if (!thumbSince) thumbSince = now; if (!thumbDone && now - thumbSince > 700) { thumbDone = true; const st = location.hash.slice(1); const b = SAVE[st] && document.querySelector(SAVE[st]); if (b && b.offsetParent !== null && !b.disabled) b.click(); else window.StudioHooks && window.StudioHooks.notice('Nothing to save here yet.'); } } else { thumbSince = 0; thumbDone = false; }
    // open palm: look around
    if (g === 'Open_Palm' && !pinched) { const px = (1 - lm[0].x) * innerWidth, py = lm[0].y * innerHeight; if (palm && window.StudioHooks) window.StudioHooks.look((px - palm.x) * 1.4, (py - palm.y) * 0.6); palm = {x: px, y: py}; } else palm = null;
    // peace sign: scroll the panel
    if (g === 'Victory') { const py = lm[8].y * innerHeight; const pb = document.querySelector('.panel:not([hidden]) .panel-body'); if (peace !== null && pb) pb.scrollTop += (py - peace) * 2.2; peace = py; } else peace = null;
  }
  function draw(res) {
    if (!prev || prev.hidden) return; const x = prev.getContext('2d'); x.drawImage(video, 0, 0, prev.width, prev.height);
    const lm = res.landmarks && res.landmarks[0]; if (!lm) return; x.fillStyle = '#ffc83a';
    lm.forEach((p, i) => { x.beginPath(); x.arc(p.x * prev.width, p.y * prev.height, i === 8 || i === 4 ? 3 : 1.6, 0, 6.3); x.fill(); });
  }
  function loop() {
    if (!running) return; requestAnimationFrame(loop);
    if (video.readyState < 2 || video.currentTime === lastVT) return; lastVT = video.currentTime;
    const now = performance.now(); let res; try { res = rec.recognizeForVideo(video, now); } catch (e) { return; }
    handle(res, now); draw(res);
  }
  async function start() {
    if (!window.isSecureContext || !navigator.mediaDevices) { say('Hand control needs the site on https or localhost.'); return; }
    btn.disabled = true; say('Loading hand tracking. The first time takes a few seconds.');
    try {
      if (!rec) {
        const {FilesetResolver, GestureRecognizer} = await import(MP + '/vision_bundle.mjs');
        const fs = await FilesetResolver.forVisionTasks(MP + '/wasm');
        rec = await GestureRecognizer.createFromOptions(fs, {baseOptions: {modelAssetPath: MODEL, delegate: 'GPU'}, runningMode: 'VIDEO', numHands: 1, minHandDetectionConfidence: 0.6, minTrackingConfidence: 0.5});
      }
      stream = await navigator.mediaDevices.getUserMedia({video: {width: 640, height: 480, facingMode: 'user'}, audio: false});
      video = video || Object.assign(document.createElement('video'), {playsInline: true, muted: true}); video.srcObject = stream; await video.play();
      running = true; prev.hidden = false; cursor.hidden = false; btn.textContent = 'Hand control: on'; btn.setAttribute('aria-pressed', 'true'); say(HELP); loop();
    } catch (e) { console.warn(e); say(e && e.name === 'NotAllowedError' ? 'Camera permission was declined. Allow the camera for this site in your browser settings, then try again.' : 'Hand tracking could not start. Check that no other app is using the camera.'); stop(true); }
    btn.disabled = false;
  }
  function stop(keepMsg) { running = false; if (pinched) { pinched = false; release(cur); } if (stream) stream.getTracks().forEach(t => t.stop()); stream = null; prev.hidden = true; cursor.hidden = true; btn.textContent = 'Hand control: off'; btn.setAttribute('aria-pressed', 'false'); if (!keepMsg) say(''); }
  btn.addEventListener('click', () => running ? stop() : start());
  document.addEventListener('visibilitychange', () => { if (document.hidden && running) stop(); });
})();
