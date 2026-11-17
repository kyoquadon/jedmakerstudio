/* Maker's Studio Room: hand control with MediaPipe Gesture Recognizer (two hands).
   Everything runs in this browser; no camera frames leave the laptop.
   Pointer hand: point to move the cursor, pinch to click (the click lands where the cursor was
   just before your fingers closed, so the pinch itself can't drag anything).
   Open palm moved around = look around the room.
   Both hands pinched: pull apart or push together to zoom, twist to turn.
   Closed fist (hold) = back to the room. Pinch thumb, index and middle finger together, then drag up or down = scroll the open page. Thumbs up (hold) = save. */
(() => {
  'use strict';
  const MP = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.2.0';
  const MODEL = 'https://storage.googleapis.com/mediapipe-models/gesture_recognizer/gesture_recognizer/float16/1/gesture_recognizer.task';
  const SAVE = {workbench: '#saveEntry', pinboard: '#savePin', corner: '#chatSend', gallery: '#pcSave', playground: '#logSave', wall: '#blockSave'};
  const PINCH_ON = 0.3, PINCH_OFF = 0.45, PINCH_FRAMES = 3;
  const btn = document.getElementById('handBtn'), status = document.getElementById('handStatus'), prev = document.getElementById('handPreview');
  if (!btn) return;
  btn.hidden = false;
  let lefty = false; try { lefty = localStorage.getItem('studio-lefty') === '1'; } catch (e) {}
  let rec = null, video = null, stream = null, running = false, lastVT = -1;
  const cur = {x: innerWidth / 2, y: innerHeight / 2}; const hist = [];
  const P = {grab: null, pinched: false, onCount: 0, fistSince: 0, fistDone: false, thumbSince: 0, thumbDone: false, palm: null, peace: null, lost: 0};
  let two = null; // {d, a} while both hands pinch
  const hands2 = {L: false, R: false};
  const cursor = document.createElement('div'); cursor.className = 'hand-cursor lost'; cursor.hidden = true; cursor.setAttribute('aria-hidden', 'true'); document.body.appendChild(cursor);
  const say = t => { status.hidden = !t; status.textContent = t || ''; };
  const help = () => `Hand control on (${lefty ? 'left' : 'right'} hand points). Point to move, pinch to click, wave an open palm to look around, pinch with both hands and pull apart to zoom or twist to turn, hold a fist for the room, pinch thumb, index and middle finger together and drag to scroll the page, hold a thumbs up to save.`;
  const clamp = v => Math.max(0, Math.min(1, v));
  const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
  const H = window.StudioHooks || {};
  const pe = (type, el, c) => el && el.dispatchEvent(new PointerEvent(type, {bubbles: true, cancelable: true, clientX: c.x, clientY: c.y, pointerId: 77, pointerType: 'mouse', isPrimary: true, button: 0, buttons: type === 'pointerup' ? 0 : 1}));
  const at = c => { cursor.style.display = 'none'; const el = document.elementFromPoint(c.x, c.y); cursor.style.display = ''; return el; };
  function clickAt(c) {
    const el = at(c); if (!el) return;
    pe('pointerdown', el, c); pe('pointerup', el, c);
    if (el.tagName !== 'CANVAS') { const t = el.closest('button, a, label, input, textarea, select, [data-act], [data-scrap], [tabindex]') || el; if (t.matches('input[type=text], input[type=url], input[type=search], input[type=password], textarea')) t.focus(); else t.click(); }
    cursor.classList.add('click'); setTimeout(() => cursor.classList.remove('click'), 180);
  }
  // MediaPipe labels handedness as if the image were mirrored; our feed is not, so labels are swapped.
  function sortHands(res) {
    const out = {pointer: null, other: null};
    const n = res.landmarks ? res.landmarks.length : 0; if (!n) return out;
    const hands = res.landmarks.map((lm, i) => ({lm, g: (res.gestures[i] && res.gestures[i][0]) ? res.gestures[i][0].categoryName : 'None', label: (res.handedness[i] && res.handedness[i][0]) ? res.handedness[i][0].categoryName : ''}));
    const want = lefty ? 'Right' : 'Left';
    if (n === 1) { out.pointer = hands[0]; return out; }
    out.pointer = hands.find(h => h.label === want) || hands[0]; out.other = hands.find(h => h !== out.pointer) || null; return out;
  }
  // three-finger pinch: thumb, index and middle fingertips all touching
  function triPinch(lm) { const s = dist(lm[0], lm[9]) || 0.1; return dist(lm[4], lm[8]) / s < 0.38 && dist(lm[4], lm[12]) / s < 0.45 && dist(lm[8], lm[12]) / s < 0.35; }
  const middleNear = lm => dist(lm[4], lm[12]) / (dist(lm[0], lm[9]) || 0.1) < 0.5;
  const pinchRatio = lm => dist(lm[4], lm[8]) / (dist(lm[0], lm[9]) || 0.1);
  function handle(res, now) {
    const {pointer, other} = sortHands(res);
    if (!pointer) { cursor.classList.add('lost'); cursor.classList.remove('grab'); P.grab = null; P.pinched = false; P.onCount = 0; P.palm = P.peace = null; P.fistSince = P.thumbSince = 0; two = null; return; }
    cursor.classList.remove('lost');
    const lm = pointer.lm, g = pointer.g;
    // two-hand pinch: zoom and turn
    if (other && pinchRatio(lm) < PINCH_ON && pinchRatio(other.lm) < PINCH_ON) {
      const a = {x: (lm[4].x + lm[8].x) / 2, y: (lm[4].y + lm[8].y) / 2}, b = {x: (other.lm[4].x + other.lm[8].x) / 2, y: (other.lm[4].y + other.lm[8].y) / 2};
      const d = dist(a, b), ang = Math.atan2(b.y - a.y, b.x - a.x);
      if (two) { if (H.zoom) H.zoom(two.d / d); let da = ang - two.a; da = Math.atan2(Math.sin(da), Math.cos(da)); if (H.look) H.look(-da * 500, 0); }
      two = {d, a: ang}; P.pinched = true; P.onCount = 0; cursor.classList.add('pinch'); return;
    }
    if (two) { two = null; P.pinched = true; } // keep pinch latched until the fingers open, so ending a zoom never clicks
    // cursor follows the index fingertip, smoothed
    const tx = clamp((1 - lm[8].x - 0.15) / 0.7) * innerWidth, ty = clamp((lm[8].y - 0.12) / 0.62) * innerHeight;
    const pr = pinchRatio(lm);
    if (!P.pinched) { cur.x += (tx - cur.x) * 0.35; cur.y += (ty - cur.y) * 0.35; hist.push({x: cur.x, y: cur.y, t: now}); while (hist.length && now - hist[0].t > 400) hist.shift(); }
    cursor.style.transform = `translate(${cur.x}px, ${cur.y}px)`;
    // three-finger pinch = grab the open page and drag it up or down (no click)
    if (triPinch(lm)) {
      const gy = (lm[4].y + lm[8].y + lm[12].y) / 3 * innerHeight;
      const pb = document.querySelector('.panel:not([hidden]) .panel-body');
      if (P.grab !== null && pb) { const dy = gy - P.grab; if (Math.abs(dy) > 1) pb.scrollTop -= dy * 2.6; }
      P.grab = gy; P.pinched = true; P.onCount = 0; cursor.classList.add('pinch', 'grab');
    } else if (P.grab !== null) { P.grab = null; cursor.classList.remove('grab'); }
    // pinch = click at where the cursor was ~150 ms before the fingers met
    if (!P.pinched) {
      if (pr < PINCH_ON && !middleNear(lm)) { if (++P.onCount >= PINCH_FRAMES) { P.pinched = true; P.onCount = 0; const back = hist.find(h => now - h.t <= 150) || hist[0] || cur; cur.x = back.x; cur.y = back.y; cursor.style.transform = `translate(${cur.x}px, ${cur.y}px)`; cursor.classList.add('pinch'); clickAt(cur); } }
      else { P.onCount = 0; pe('pointermove', at(cur), cur); }
    } else if (pr > PINCH_OFF) { P.pinched = false; cursor.classList.remove('pinch'); }
    // gestures from either hand
    const gs = [g, other && other.g];
    const has = name => gs.includes(name);
    if (has('Closed_Fist') && !P.pinched) { if (!P.fistSince) P.fistSince = now; if (!P.fistDone && now - P.fistSince > 600) { P.fistDone = true; if (location.hash && location.hash !== '#room') { location.hash = 'room'; H.notice && H.notice('Back in the room.'); } } } else { P.fistSince = 0; P.fistDone = false; }
    if (has('Thumb_Up')) { if (!P.thumbSince) P.thumbSince = now; if (!P.thumbDone && now - P.thumbSince > 700) { P.thumbDone = true; const st = location.hash.slice(1); const b = SAVE[st] && document.querySelector(SAVE[st]); if (b && b.offsetParent !== null && !b.disabled) b.click(); else H.notice && H.notice('Nothing to save here yet.'); } } else { P.thumbSince = 0; P.thumbDone = false; }
    if (H.isPetting && H.isPetting()) {
      // rub the pet's head: any hand moving back and forth (open palm reads best)
      const rubHand = (other && other.g === 'Open_Palm') ? other : pointer;
      H.rubInput((1 - rubHand.lm[9].x) * innerWidth, true);
      if (has('Closed_Fist') && P.fistSince && now - P.fistSince > 600 && H.stopPetting) H.stopPetting();
      P.palm = null; return;
    }
    const palmHand = other && other.g === 'Open_Palm' ? other : (g === 'Open_Palm' && !P.pinched ? pointer : null);
    if (palmHand) { const px = (1 - palmHand.lm[0].x) * innerWidth, py = palmHand.lm[0].y * innerHeight; if (P.palm && H.look) H.look((px - P.palm.x) * 1.4, (py - P.palm.y) * 0.6); P.palm = {x: px, y: py}; } else P.palm = null;

  }
  function draw(res) {
    if (!prev || prev.hidden) return; const x = prev.getContext('2d'); x.drawImage(video, 0, 0, prev.width, prev.height);
    (res.landmarks || []).forEach((lm, i) => { x.fillStyle = i ? '#9fd8ff' : '#ffc83a'; lm.forEach((p, j) => { x.beginPath(); x.arc(p.x * prev.width, p.y * prev.height, j === 8 || j === 4 ? 3 : 1.6, 0, 6.3); x.fill(); }); });
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
        rec = await GestureRecognizer.createFromOptions(fs, {baseOptions: {modelAssetPath: MODEL, delegate: 'GPU'}, runningMode: 'VIDEO', numHands: 2, minHandDetectionConfidence: 0.6, minTrackingConfidence: 0.5});
      }
      stream = await navigator.mediaDevices.getUserMedia({video: {width: 640, height: 480, facingMode: 'user'}, audio: false});
      video = video || Object.assign(document.createElement('video'), {playsInline: true, muted: true}); video.srcObject = stream; await video.play();
      running = true; prev.hidden = false; cursor.hidden = false; (document.getElementById('handLbl') || btn).textContent = 'Hand control: on'; btn.setAttribute('aria-pressed', 'true'); say(help()); loop();
      const sw = document.getElementById('handSwap'); if (sw) sw.hidden = false;
    } catch (e) { console.warn(e); say(e && e.name === 'NotAllowedError' ? 'Camera permission was declined. Allow the camera for this site in your browser settings, then try again.' : 'Hand tracking could not start. Check that no other app is using the camera.'); stop(true); }
    btn.disabled = false;
  }
  function stop(keepMsg) { running = false; P.pinched = false; two = null; if (stream) stream.getTracks().forEach(t => t.stop()); stream = null; prev.hidden = true; cursor.hidden = true; (document.getElementById('handLbl') || btn).textContent = 'Hand control: off'; btn.setAttribute('aria-pressed', 'false'); const sw = document.getElementById('handSwap'); if (sw) sw.hidden = true; if (!keepMsg) say(''); }
  btn.addEventListener('click', () => running ? stop() : start());
  const sw = document.getElementById('handSwap');
  if (sw) { sw.textContent = lefty ? 'Pointer: left hand' : 'Pointer: right hand'; sw.addEventListener('click', () => { lefty = !lefty; try { localStorage.setItem('studio-lefty', lefty ? '1' : '0'); } catch (e) {} sw.textContent = lefty ? 'Pointer: left hand' : 'Pointer: right hand'; if (running) say(help()); }); }
  document.addEventListener('visibilitychange', () => { if (document.hidden && running) stop(); });
})();
