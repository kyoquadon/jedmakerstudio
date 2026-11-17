/* Maker's Studio Room: hand control with MediaPipe Gesture Recognizer (two hands).
   Everything runs in this browser; no camera frames leave the laptop.
   Pointer hand: point to move the cursor, pinch to click (the click lands where the cursor was
   just before your fingers closed, so the pinch itself can't drag anything).
   Open palm moved around = look around the room.
   Both hands pinched: pull apart or push together to zoom, twist to turn.
   Thumb, index and middle pinched together, then drag up or down = scroll the open page.
   Closed fist (hold) = back to the room. Thumbs up (hold) = save.
   While petting: one big translucent hand per detected hand, rub over the pet, clap for a trick,
   lower your hands for 3 seconds to step back.
   Calibrate: a guided test that tunes reach, pinch and clap to your camera and hands. */
(() => {
  'use strict';
  const MP = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.2.0';
  const MODEL = 'https://storage.googleapis.com/mediapipe-models/gesture_recognizer/gesture_recognizer/float16/1/gesture_recognizer.task';
  const SAVE = {workbench: '#saveEntry', pinboard: '#savePin', corner: '#chatSend', gallery: '#pcSave', playground: '#logSave', wall: '#blockSave'};
  const PINCH_FRAMES = 3;
  const DEF = {x0: 0.15, xw: 0.7, y0: 0.12, yh: 0.62, pinchOn: 0.3, pinchOff: 0.45, tri48: 0.38, tri412: 0.45, tri812: 0.35, clapNear: 0.16, clapFar: 0.32};
  let C = Object.assign({}, DEF);
  try { const saved = JSON.parse(localStorage.getItem('studio-hand-cal') || 'null'); if (saved) C = Object.assign({}, DEF, saved); } catch (e) {}
  const btn = document.getElementById('handBtn'), status = document.getElementById('handStatus'), prev = document.getElementById('handPreview'), calBtn = document.getElementById('handCal');
  if (!btn) return;
  btn.hidden = false; if (calBtn) calBtn.hidden = false;
  let lefty = false; try { lefty = localStorage.getItem('studio-lefty') === '1'; } catch (e) {}
  let rec = null, video = null, stream = null, running = false, lastVT = -1;
  const cur = {x: innerWidth / 2, y: innerHeight / 2}, cur2 = {x: innerWidth / 2, y: innerHeight / 2}; const hist = [];
  const P = {grab: null, pinched: false, onCount: 0, fistSince: 0, fistDone: false, thumbSince: 0, thumbDone: false, palm: null, petAway: 0};
  let two = null; const clapHist = []; let lastClap = 0;
  const mkCursor = () => { const c = document.createElement('div'); c.className = 'hand-cursor lost'; c.hidden = true; c.setAttribute('aria-hidden', 'true'); document.body.appendChild(c); return c; };
  const cursor = mkCursor(), cursor2 = mkCursor();
  const say = t => { status.hidden = !t; status.textContent = t || ''; };
  const help = () => `Hand control on (${lefty ? 'left' : 'right'} hand points). Point to move, pinch to click, wave an open palm to look around, pinch with both hands and pull apart to zoom or twist to turn, pinch thumb, index and middle finger together and drag to scroll, hold a fist for the room, hold a thumbs up to save. Use Calibrate if anything feels off.`;
  const clamp = v => Math.max(0, Math.min(1, v));
  const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
  const H = window.StudioHooks || {};
  const mapX = x => clamp((1 - x - C.x0) / C.xw) * innerWidth, mapY = y => clamp((y - C.y0) / C.yh) * innerHeight;
  const place = (el, c) => { el.style.transform = `translate(${c.x}px, ${c.y}px)`; };
  const pe = (type, el, c) => el && el.dispatchEvent(new PointerEvent(type, {bubbles: true, cancelable: true, clientX: c.x, clientY: c.y, pointerId: 77, pointerType: 'mouse', isPrimary: true, button: 0, buttons: type === 'pointerup' ? 0 : 1}));
  const at = c => { cursor.style.display = 'none'; cursor2.style.display = 'none'; const el = document.elementFromPoint(c.x, c.y); cursor.style.display = ''; cursor2.style.display = ''; return el; };
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
  const size = lm => dist(lm[0], lm[9]) || 0.1;
  const pinchRatio = lm => dist(lm[4], lm[8]) / size(lm);
  const triPinch = lm => { const s = size(lm); return dist(lm[4], lm[8]) / s < C.tri48 && dist(lm[4], lm[12]) / s < C.tri412 && dist(lm[8], lm[12]) / s < C.tri812; };
  const middleNear = lm => dist(lm[4], lm[12]) / size(lm) < Math.max(0.5, C.tri412 + 0.05);

  function detectClap(pointer, other, now) {
    if (pointer && other) {
      const d = dist(pointer.lm[9], other.lm[9]); clapHist.push({d, t: now}); while (clapHist.length && now - clapHist[0].t > 500) clapHist.shift();
      if (d < C.clapNear && clapHist.some(h => h.d > C.clapFar) && now - lastClap > 1200) { lastClap = now; clapHist.length = 0; return true; }
    } else if (clapHist.length) {
      const last = clapHist[clapHist.length - 1];
      if (now - last.t < 200 && last.d < (C.clapNear + C.clapFar) / 2 && clapHist.some(h => h.d > C.clapFar) && now - lastClap > 1200) { lastClap = now; clapHist.length = 0; return true; }
      if (now - last.t > 500) clapHist.length = 0;
    }
    return false;
  }

  function handle(res, now) {
    if (CAL.active) { calStep(res, now); return; }
    const {pointer, other} = sortHands(res);
    const petting = H.isPetting && H.isPetting();
    cursor.classList.toggle('petting-hand', !!petting); cursor2.classList.toggle('petting-hand', !!petting);
    if (detectClap(pointer, other, now)) H.trick && H.trick();
    const clapGrace = now - lastClap < 2500; // just after a clap, nothing can end petting
    // petting: lowering every hand for 3 seconds steps back out
    if (petting) { if (!pointer) { if (!P.petAway) P.petAway = now; else if (now - P.petAway > 3000 && !clapGrace) { P.petAway = 0; H.stopPetting && H.stopPetting(); } } else P.petAway = 0; } else P.petAway = 0;
    cursor2.hidden = !(petting && other);
    if (!pointer) { cursor.classList.add('lost'); cursor.classList.remove('grab'); P.grab = null; P.pinched = false; P.onCount = 0; P.palm = null; P.fistSince = P.thumbSince = 0; two = null; return; }
    cursor.classList.remove('lost');
    const lm = pointer.lm, g = pointer.g;
    if (petting) {
      // one big translucent hand per detected hand; a rub counts while a hand is over the pet
      cur.x += (mapX(lm[9].x) - cur.x) * 0.4; cur.y += (mapY(lm[9].y) - cur.y) * 0.4; place(cursor, cur);
      let over1 = H.overPet && H.overPet(cur.x, cur.y), over2 = false;
      if (other) { cur2.x += (mapX(other.lm[9].x) - cur2.x) * 0.4; cur2.y += (mapY(other.lm[9].y) - cur2.y) * 0.4; place(cursor2, cur2); cursor2.classList.remove('lost'); over2 = H.overPet && H.overPet(cur2.x, cur2.y); }
      cursor.classList.toggle('rubbing', !!over1); cursor2.classList.toggle('rubbing', !!over2);
      if (over1) H.rubInput(cur.x, true); else if (over2) H.rubInput(cur2.x, true);
      // a deliberate fist (held 1.5 s, hands apart, not right after a clap) also steps back
      const handsApart = !other || dist(lm[9], other.lm[9]) > C.clapFar;
      if ([g, other && other.g].includes('Closed_Fist') && handsApart && !clapGrace) { if (!P.fistSince) P.fistSince = now; else if (now - P.fistSince > 1500 && H.stopPetting) { P.fistSince = 0; H.stopPetting(); } } else P.fistSince = 0;
      P.palm = null; P.pinched = false; return;
    }
    // two-hand pinch: zoom and turn
    if (other && pinchRatio(lm) < C.pinchOn && pinchRatio(other.lm) < C.pinchOn) {
      const a = {x: (lm[4].x + lm[8].x) / 2, y: (lm[4].y + lm[8].y) / 2}, b = {x: (other.lm[4].x + other.lm[8].x) / 2, y: (other.lm[4].y + other.lm[8].y) / 2};
      const d = dist(a, b), ang = Math.atan2(b.y - a.y, b.x - a.x);
      if (two) { if (H.zoom) H.zoom(two.d / d); let da = ang - two.a; da = Math.atan2(Math.sin(da), Math.cos(da)); if (H.look) H.look(-da * 500, 0); }
      two = {d, a: ang}; P.pinched = true; P.onCount = 0; cursor.classList.add('pinch'); return;
    }
    if (two) { two = null; P.pinched = true; } // keep pinch latched until the fingers open, so ending a zoom never clicks
    // cursor follows the index fingertip, smoothed
    const pr = pinchRatio(lm);
    if (!P.pinched) { cur.x += (mapX(lm[8].x) - cur.x) * 0.35; cur.y += (mapY(lm[8].y) - cur.y) * 0.35; hist.push({x: cur.x, y: cur.y, t: now}); while (hist.length && now - hist[0].t > 400) hist.shift(); }
    place(cursor, cur);
    // three-finger pinch = grab the open page and drag it up or down (no click)
    if (triPinch(lm)) {
      const gy = (lm[4].y + lm[8].y + lm[12].y) / 3 * innerHeight;
      const pb = document.querySelector('.panel:not([hidden]) .panel-body');
      if (P.grab !== null && pb) { const dy = gy - P.grab; if (Math.abs(dy) > 1) pb.scrollTop -= dy * 2.6; }
      P.grab = gy; P.pinched = true; P.onCount = 0; cursor.classList.add('pinch', 'grab');
    } else if (P.grab !== null) { P.grab = null; cursor.classList.remove('grab'); }
    // pinch = click where the cursor was ~150 ms before the fingers met
    if (!P.pinched) {
      if (pr < C.pinchOn && !middleNear(lm)) { if (++P.onCount >= PINCH_FRAMES) { P.pinched = true; P.onCount = 0; const back = hist.find(h => now - h.t <= 150) || hist[0] || cur; cur.x = back.x; cur.y = back.y; place(cursor, cur); cursor.classList.add('pinch'); clickAt(cur); } }
      else { P.onCount = 0; pe('pointermove', at(cur), cur); }
    } else if (pr > C.pinchOff && P.grab === null) { P.pinched = false; cursor.classList.remove('pinch'); }
    const has = name => [g, other && other.g].includes(name);
    if (has('Closed_Fist') && !P.pinched) { if (!P.fistSince) P.fistSince = now; if (!P.fistDone && now - P.fistSince > 600) { P.fistDone = true; if (location.hash && location.hash !== '#room') { location.hash = 'room'; H.notice && H.notice('Back in the room.'); } } } else { P.fistSince = 0; P.fistDone = false; }
    if (has('Thumb_Up')) { if (!P.thumbSince) P.thumbSince = now; if (!P.thumbDone && now - P.thumbSince > 700) { P.thumbDone = true; const st = location.hash.slice(1); const b = SAVE[st] && document.querySelector(SAVE[st]); if (b && b.offsetParent !== null && !b.disabled) b.click(); else H.notice && H.notice('Nothing to save here yet.'); } } else { P.thumbSince = 0; P.thumbDone = false; }
    const palmHand = other && other.g === 'Open_Palm' ? other : (g === 'Open_Palm' && !P.pinched ? pointer : null);
    if (palmHand) { const px = (1 - palmHand.lm[0].x) * innerWidth, py = palmHand.lm[0].y * innerHeight; if (P.palm && H.look) H.look((px - P.palm.x) * 1.4, (py - P.palm.y) * 0.6); P.palm = {x: px, y: py}; } else P.palm = null;
  }

  /* ---------- calibration ---------- */
  const CAL = {active: false};
  const pct = (arr, p) => { if (!arr.length) return NaN; const a = arr.slice().sort((x, y) => x - y); return a[Math.min(a.length - 1, Math.max(0, Math.floor(p * (a.length - 1))))]; };
  const STEPS = [
    {id: 'show', title: 'Show your hand', text: 'Hold one hand up in front of the camera, palm facing it, about 40 to 70 cm away.', dur: 1200},
    {id: 'reach', title: 'Find your comfortable reach', text: 'Point with your index finger and sweep it slowly around the biggest comfortable circle, reaching left, right, up and down.', dur: 7000},
    {id: 'pinch', title: 'Pinch and release', text: 'Pinch your thumb and index finger together, then open them wide. Repeat slowly until the bar fills.', dur: 7000},
    {id: 'tri', title: 'Three-finger pinch', text: 'Touch your thumb, index and middle fingertips together and hold them there.', dur: 2500},
    {id: 'clap', title: 'Clap twice', text: 'Hold both hands up, apart, then clap slowly twice in front of the camera.', dur: 0},
    {id: 'signs', title: 'Show the signs', text: 'Show each sign until it ticks: an open palm, a fist, then a thumbs up.', dur: 0}
  ];
  let calUI = null;
  function buildCalUI() {
    const w = document.createElement('div'); w.className = 'cal-wrap'; w.setAttribute('role', 'dialog'); w.setAttribute('aria-modal', 'true'); w.setAttribute('aria-labelledby', 'calH');
    w.innerHTML = '<div class="sheet pad cal-box"><div class="sec-head"><div><h2 id="calH">Hand calibration</h2><p id="calStepN" class="hint"></p></div></div><h3 id="calTitle"></h3><p id="calText"></p><canvas id="calCam" width="320" height="240" aria-label="Camera view with tracking dots"></canvas><div class="cal-meter" aria-hidden="true"><span id="calBar"></span></div><p id="calStatus" class="caption" role="status"></p><div id="calResult" class="stack" hidden></div><div class="row"><button id="calSkip" class="btn btn-sm" type="button">Skip this step</button><button id="calReset" class="btn btn-sm" type="button" hidden>Reset to defaults</button><button id="calClose" class="btn btn-blue" type="button">Close</button></div></div>';
    document.body.appendChild(w);
    w.querySelector('#calSkip').onclick = () => nextStep(true);
    w.querySelector('#calClose').onclick = () => closeCal();
    w.querySelector('#calReset').onclick = () => { C = Object.assign({}, DEF); try { localStorage.removeItem('studio-hand-cal'); } catch (e) {} showResult('Back to the default settings.'); };
    return w;
  }
  const $c = id => calUI.querySelector('#' + id);
  async function openCal() {
    if (!running) { await start(); if (!running) return; }
    calUI = calUI || buildCalUI(); calUI.hidden = false; cursor.hidden = true; cursor2.hidden = true;
    CAL.active = true; CAL.i = -1; CAL.found = {}; CAL.next = Object.assign({}, C); nextStep();
  }
  function closeCal() { CAL.active = false; if (calUI) calUI.hidden = true; if (running) cursor.hidden = false; say(running ? help() : ''); }
  function nextStep(skipped) {
    CAL.i++; CAL.t0 = performance.now(); CAL.samples = {a: [], b: [], c: [], x: [], y: []}; CAL.claps = 0; CAL.signs = {}; CAL.ok = 0;
    if (CAL.i >= STEPS.length) return finishCal();
    const s = STEPS[CAL.i];
    $c('calStepN').textContent = `Step ${CAL.i + 1} of ${STEPS.length}`; $c('calTitle').textContent = s.title; $c('calText').textContent = s.text;
    $c('calStatus').textContent = 'Waiting for your hand…'; $c('calBar').style.width = '0%'; $c('calResult').hidden = true; $c('calSkip').hidden = false; $c('calReset').hidden = true;
  }
  function bar(f) { $c('calBar').style.width = Math.round(clamp(f) * 100) + '%'; }
  function calStep(res, now) {
    drawCal(res);
    const s = STEPS[CAL.i]; if (!s) return; const {pointer, other} = sortHands(res); const lm = pointer && pointer.lm;
    if (s.id === 'show') {
      if (lm) { CAL.ok += 1; bar(CAL.ok / 30); $c('calStatus').textContent = `Hand found (${pointer.label === (lefty ? 'Right' : 'Left') ? 'pointing hand' : 'other hand'}). Hold still…`; if (CAL.ok >= 30) nextStep(); }
      else { CAL.ok = 0; bar(0); $c('calStatus').textContent = 'No hand yet. Check the light is in front of you, not behind.'; }
    } else if (s.id === 'reach') {
      if (!lm) { $c('calStatus').textContent = 'Keep your hand in view.'; return; }
      CAL.samples.x.push(1 - lm[8].x); CAL.samples.y.push(lm[8].y);
      const f = CAL.samples.x.length / 150; bar(f); $c('calStatus').textContent = 'Keep sweeping…';
      if (f >= 1) { const x0 = pct(CAL.samples.x, 0.03), x1 = pct(CAL.samples.x, 0.97), y0 = pct(CAL.samples.y, 0.03), y1 = pct(CAL.samples.y, 0.97);
        if (x1 - x0 > 0.2 && y1 - y0 > 0.15) { CAL.next.x0 = x0 + 0.01; CAL.next.xw = Math.max(0.25, x1 - x0 - 0.02); CAL.next.y0 = y0 + 0.01; CAL.next.yh = Math.max(0.2, y1 - y0 - 0.02); CAL.found.reach = true; }
        nextStep(); }
    } else if (s.id === 'pinch') {
      if (!lm) { $c('calStatus').textContent = 'Keep your hand in view.'; return; }
      const r = pinchRatio(lm); CAL.samples.a.push(r);
      const closed = pct(CAL.samples.a, 0.08), open = pct(CAL.samples.a, 0.92);
      $c('calStatus').textContent = `Closed ${closed.toFixed(2)} · open ${open.toFixed(2)} (fingertip gap compared with hand size)`;
      const spread = open - closed; bar(Math.min(CAL.samples.a.length / 160, spread / 0.5));
      if (CAL.samples.a.length >= 160 && spread > 0.25) { CAL.next.pinchOn = closed + spread * 0.3; CAL.next.pinchOff = closed + spread * 0.55; CAL.found.pinch = true; nextStep(); }
    } else if (s.id === 'tri') {
      if (!lm) { $c('calStatus').textContent = 'Keep your hand in view.'; return; }
      const sz = size(lm), a = dist(lm[4], lm[8]) / sz, b = dist(lm[4], lm[12]) / sz, c = dist(lm[8], lm[12]) / sz;
      const loose = a < 0.55 && b < 0.65 && c < 0.55;
      if (loose) { CAL.samples.a.push(a); CAL.samples.b.push(b); CAL.samples.c.push(c); } else if (CAL.samples.a.length < 20) { CAL.samples.a = []; CAL.samples.b = []; CAL.samples.c = []; }
      bar(CAL.samples.a.length / 60); $c('calStatus').textContent = loose ? 'Got it, hold…' : 'Bring all three fingertips together.';
      if (CAL.samples.a.length >= 60) { CAL.next.tri48 = Math.min(0.6, pct(CAL.samples.a, 0.9) * 1.35); CAL.next.tri412 = Math.min(0.7, pct(CAL.samples.b, 0.9) * 1.35); CAL.next.tri812 = Math.min(0.6, pct(CAL.samples.c, 0.9) * 1.35); CAL.found.tri = true; nextStep(); }
    } else if (s.id === 'clap') {
      if (pointer && other) CAL.samples.x.push(dist(pointer.lm[9], other.lm[9]));
      const far = pct(CAL.samples.x, 0.85), near = pct(CAL.samples.x, 0.03);
      if (CAL.samples.x.length > 20 && far > near + 0.15) { const saveC = Object.assign({}, C); C = Object.assign({}, C, {clapFar: Math.max(0.2, far * 0.7), clapNear: Math.max(0.08, near * 1.6 + 0.04)}); if (detectClap(pointer, other, now)) { CAL.claps++; } C = saveC; }
      else if (detectClap(pointer, other, now)) CAL.claps++;
      bar(CAL.claps / 2); $c('calStatus').textContent = pointer && other ? `Both hands seen. Claps counted: ${CAL.claps} of 2` : (pointer ? 'Only one hand seen. Hold both hands up, apart.' : 'Hold both hands up.');
      if (CAL.claps >= 2) { if (far > near + 0.15) { CAL.next.clapFar = Math.max(0.2, far * 0.7); CAL.next.clapNear = Math.max(0.08, near * 1.6 + 0.04); } CAL.found.clap = true; nextStep(); }
    } else if (s.id === 'signs') {
      const gs = [pointer && pointer.g, other && other.g];
      ['Open_Palm', 'Closed_Fist', 'Thumb_Up'].forEach(n => { if (gs.includes(n)) CAL.signs[n] = (CAL.signs[n] || 0) + 1; });
      const done = ['Open_Palm', 'Closed_Fist', 'Thumb_Up'].filter(n => (CAL.signs[n] || 0) >= 12);
      bar(done.length / 3); $c('calStatus').textContent = `Open palm ${done.includes('Open_Palm') ? '✓' : '…'} · Fist ${done.includes('Closed_Fist') ? '✓' : '…'} · Thumbs up ${done.includes('Thumb_Up') ? '✓' : '…'}`;
      if (done.length === 3) { CAL.found.signs = true; nextStep(); }
    }
  }
  function finishCal() {
    C = Object.assign({}, CAL.next); try { localStorage.setItem('studio-hand-cal', JSON.stringify(C)); } catch (e) {}
    const f = CAL.found;
    showResult(`Saved for this browser. ${[f.reach ? 'Reach tuned to your sweep.' : 'Reach left at default.', f.pinch ? 'Pinch tuned to your fingers.' : 'Pinch left at default.', f.tri ? 'Three-finger pinch tuned.' : 'Three-finger pinch left at default.', f.clap ? 'Clap tuned.' : 'Clap left at default.', f.signs ? 'All three signs recognised.' : 'Not every sign was recognised: try facing a light, with a plain background.'].join(' ')}`);
  }
  function showResult(msg) {
    $c('calStepN').textContent = 'Done'; $c('calTitle').textContent = 'Calibration results'; $c('calText').textContent = msg; $c('calStatus').textContent = ''; bar(1);
    $c('calResult').hidden = false;
    $c('calResult').innerHTML = `<p class="mini">Reach: left ${C.x0.toFixed(2)}, width ${C.xw.toFixed(2)}, top ${C.y0.toFixed(2)}, height ${C.yh.toFixed(2)} · Pinch on ${C.pinchOn.toFixed(2)}, off ${C.pinchOff.toFixed(2)} · Clap near ${C.clapNear.toFixed(2)}, far ${C.clapFar.toFixed(2)}</p>`;
    $c('calSkip').hidden = true; $c('calReset').hidden = false; CAL.i = STEPS.length;
  }
  function drawCal(res) {
    const cv = $c('calCam'); const x = cv.getContext('2d'); x.drawImage(video, 0, 0, cv.width, cv.height);
    (res.landmarks || []).forEach((lm, i) => { x.strokeStyle = i ? '#9fd8ff' : '#ffc83a'; x.fillStyle = x.strokeStyle; x.lineWidth = 2;
      [[0, 1, 2, 3, 4], [0, 5, 6, 7, 8], [5, 9, 10, 11, 12], [9, 13, 14, 15, 16], [13, 17, 18, 19, 20], [0, 17]].forEach(ch => { x.beginPath(); ch.forEach((j, k) => { const p = lm[j]; k ? x.lineTo(p.x * cv.width, p.y * cv.height) : x.moveTo(p.x * cv.width, p.y * cv.height); }); x.stroke(); });
      lm.forEach((p, j) => { x.beginPath(); x.arc(p.x * cv.width, p.y * cv.height, j === 4 || j === 8 || j === 12 ? 4 : 2, 0, 6.3); x.fill(); }); });
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
  const setLbl = t => { (document.getElementById('handLbl') || btn).textContent = t; };
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
      running = true; window.HAND_CONTROL_ON = true; prev.hidden = false; cursor.hidden = false; setLbl('Hand control: on'); btn.setAttribute('aria-pressed', 'true'); say(help()); loop();
      const sw = document.getElementById('handSwap'); if (sw) sw.hidden = false;
    } catch (e) { console.warn(e); say(e && e.name === 'NotAllowedError' ? 'Camera permission was declined. Allow the camera for this site in your browser settings, then try again.' : 'Hand tracking could not start. Check that no other app is using the camera.'); stop(true); }
    btn.disabled = false;
  }
  function stop(keepMsg) { running = false; window.HAND_CONTROL_ON = false; CAL.active = false; if (calUI) calUI.hidden = true; P.pinched = false; two = null; if (stream) stream.getTracks().forEach(t => t.stop()); stream = null; prev.hidden = true; cursor.hidden = true; cursor2.hidden = true; cursor.classList.remove('petting-hand'); setLbl('Hand control: off'); btn.setAttribute('aria-pressed', 'false'); const sw = document.getElementById('handSwap'); if (sw) sw.hidden = true; if (!keepMsg) say(''); }
  btn.addEventListener('click', () => running ? stop() : start());
  if (calBtn) calBtn.addEventListener('click', openCal);
  const sw = document.getElementById('handSwap');
  if (sw) { sw.textContent = lefty ? 'Pointer: left hand' : 'Pointer: right hand'; sw.addEventListener('click', () => { lefty = !lefty; try { localStorage.setItem('studio-lefty', lefty ? '1' : '0'); } catch (e) {} sw.textContent = lefty ? 'Pointer: left hand' : 'Pointer: right hand'; if (running) say(help()); }); }
  document.addEventListener('visibilitychange', () => { if (document.hidden && running) stop(); });
})();
