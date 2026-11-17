/* Maker's Studio Room: stand-in for the claude.ai page runtime when self-hosted.
   Provides claude.use('db' | 'user' | 'sample' | 'downloads') backed by
   Cloudflare Pages Functions (/api/items, /api/claude), or this browser if offline. */
(() => {
  'use strict';
  const LK = 'makers-studio-hosted-items';


  /* ---------- passcode lock ---------- */
  let unlocking = null;
  function unlock() {
    if (unlocking) return unlocking;
    unlocking = new Promise(resolve => {
      const wrap = document.createElement('div');
      wrap.setAttribute('role', 'dialog'); wrap.setAttribute('aria-modal', 'true'); wrap.setAttribute('aria-labelledby', 'lockTitle');
      wrap.style.cssText = 'position:fixed;inset:0;z-index:100;display:flex;align-items:center;justify-content:center;padding:16px;background:rgba(22,19,26,.72)';
      wrap.innerHTML = '<form class="sheet pad" style="max-width:420px;width:100%"><h2 id="lockTitle">Unlock your studio</h2><p class="hint">Enter the passcode you set in Cloudflare. This browser will remember it for a year.</p><div class="field"><label for="lockPass">Passcode</label><input type="password" id="lockPass" autocomplete="current-password" style="font:inherit;width:100%;padding:9px 12px;border:2px solid #1d2030;border-radius:10px"></div><p id="lockMsg" class="hint" role="status"></p><div class="row"><button class="btn btn-blue" type="submit">Unlock</button><button class="btn btn-sm" type="button" id="lockSkip">Use this browser only for now</button></div></form>';
      document.body.appendChild(wrap);
      const f = wrap.querySelector('form'), inp = wrap.querySelector('#lockPass'), msg = wrap.querySelector('#lockMsg');
      setTimeout(() => inp.focus(), 50);
      wrap.querySelector('#lockSkip').onclick = () => { wrap.remove(); unlocking = null; resolve(false); };
      f.onsubmit = async e => {
        e.preventDefault(); msg.textContent = 'Checking…';
        try { const r = await fetch('/api/unlock', {method: 'POST', headers: {'content-type': 'application/json'}, body: JSON.stringify({passcode: inp.value})}); if (r.ok) { wrap.remove(); unlocking = null; resolve(true); return; } const j = await r.json().catch(() => ({})); msg.textContent = j.error || 'That did not work. Try again.'; }
        catch (er) { msg.textContent = 'Could not reach the studio. Check your connection.'; }
      };
    });
    return unlocking;
  }
  async function apiFetch(url, opts, retried) {
    const r = await fetch(url, opts);
    if (r.status === 401 && !retried) { const j = await r.clone().json().catch(() => ({})); if (j.passcode && await unlock()) return apiFetch(url, opts, true); }
    return r;
  }

  /* ---------- storage: D1 through /api/items, with a browser copy as cache ---------- */
  function makeDb() {
    const items = new Map(); const listeners = new Set();
    let mode = 'local', emitQueued = false, flushT = 0; const pending = new Map(); const deletes = new Set();
    try { (JSON.parse(localStorage.getItem(LK) || '[]')).forEach(it => it && it.id && items.set(it.id, it)); } catch (e) {}
    const saveLocal = () => { try { localStorage.setItem(LK, JSON.stringify([...items.values()])); } catch (e) {} };
    const snap = fromCache => ({docs: [...items.values()].map(it => ({id: it.id, exists: true, data: () => JSON.parse(JSON.stringify(it)), metadata: {fromCache, hasPendingWrites: false}})), size: items.size, empty: !items.size, metadata: {fromCache, hasPendingWrites: false}, docChanges: () => []});
    const emit = () => { if (emitQueued) return; emitQueued = true; queueMicrotask(() => { emitQueued = false; const s = snap(false); listeners.forEach(l => { try { l.next(s); } catch (e) { console.error(e); } }); }); };
    const flush = async () => {
      if (mode !== 'remote' || (!pending.size && !deletes.size)) return;
      const body = {items: [...pending.values()], deletes: [...deletes]}; pending.clear(); deletes.clear();
      try { const r = await apiFetch('/api/items', {method: 'POST', headers: {'content-type': 'application/json'}, body: JSON.stringify(body)}); if (!r.ok) throw new Error('save failed ' + r.status); }
      catch (e) { console.warn(e); body.items.forEach(it => pending.set(it.id, it)); body.deletes.forEach(id => deletes.add(id)); clearTimeout(flushT); flushT = setTimeout(flush, 5000); }
    };
    const queue = () => { saveLocal(); clearTimeout(flushT); flushT = setTimeout(flush, 400); };
    const ready = (async () => {
      try {
        const r = await apiFetch('/api/items', {headers: {accept: 'application/json'}});
        if (!r.ok) throw new Error('status ' + r.status);
        const j = await r.json(); mode = 'remote';
        const remote = new Map((j.items || []).map(it => [it.id, it]));
        // anything only in this browser (written while offline) goes up; newer copies win
        items.forEach((it, id) => { const rr = remote.get(id); if (!rr || (it.updated || 0) > (rr.updated || 0)) { remote.set(id, it); pending.set(id, it); } });
        items.clear(); remote.forEach((v, k) => items.set(k, v)); saveLocal(); queue();
      } catch (e) { console.info('Studio storage: using this browser only (' + e.message + ')'); }
    })();
    const docRef = id => ({id, path: id,
      async get() { await ready; const it = items.get(id); return {id, exists: !!it, data: () => it && JSON.parse(JSON.stringify(it)), metadata: {fromCache: false, hasPendingWrites: false}}; },
      async set(data) { const it = Object.assign({}, data, {id}); items.set(id, it); deletes.delete(id); pending.set(id, it); queue(); emit(); },
      async update(data) { const cur = items.get(id); if (!cur) throw {code: 'invalid_argument', message: 'missing'}; return this.set(Object.assign({}, cur, data)); },
      async delete() { items.delete(id); pending.delete(id); deletes.add(id); queue(); emit(); }
    });
    const coll = {path: 'items', doc: id => docRef(id || Math.random().toString(36).slice(2)), limit() { return coll; }, where() { return coll; }, orderBy() { return coll; },
      async get() { await ready; return snap(false); },
      onSnapshot(next, error) { const l = {next, error}; listeners.add(l); ready.then(() => next(snap(false))); return () => listeners.delete(l); },
      async add(data) { const r = docRef(Math.random().toString(36).slice(2)); await r.set(data); return r; }};
    window.addEventListener('beforeunload', () => { if (pending.size || deletes.size) navigator.sendBeacon && navigator.sendBeacon('/api/items', new Blob([JSON.stringify({items: [...pending.values()], deletes: [...deletes]})], {type: 'application/json'})); });
    return {collection: () => coll, doc: p => docRef(String(p).split('/').pop()), get mode() { return mode; }, ready};
  }

  /* ---------- Claude through /api/claude ---------- */
  const blobToB64 = b => new Promise((res, rej) => { const r = new FileReader(); r.onload = () => { const s = String(r.result); res([s.slice(5, s.indexOf(';')), s.slice(s.indexOf(',') + 1)]); }; r.onerror = rej; r.readAsDataURL(b); });
  function parseJSON(text) {
    let t = String(text || '').trim().replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/, '');
    try { return JSON.parse(t); } catch (e) {}
    const a = t.indexOf('{'), b = t.lastIndexOf('}'); if (a >= 0 && b > a) { try { return JSON.parse(t.slice(a, b + 1)); } catch (e) {} }
    throw {code: 'bad_json', message: 'Claude did not return JSON'};
  }
  async function sample(input, opts = {}) {
    const msgs = typeof input === 'string' ? [{role: 'user', content: input}] : input.map(m => ({role: m.role, content: m.content}));
    if (opts.images && opts.images.length) {
      const last = msgs[msgs.length - 1]; const imgs = await Promise.all(opts.images.map(blobToB64));
      last.content = [...imgs.map(([mt, data]) => ({type: 'image', source: {type: 'base64', media_type: mt, data}})), {type: 'text', text: typeof last.content === 'string' ? last.content : ''}];
    }
    const stream = typeof opts.onText === 'function';
    const res = await apiFetch('/api/claude', {method: 'POST', headers: {'content-type': 'application/json'}, body: JSON.stringify({messages: msgs, tier: opts.modelTier || 'default', stream, system: opts.system}), signal: opts.signal});
    if (!res.ok) { const msg = await res.text().catch(() => ''); throw {code: res.status === 429 ? 'rate_limited' : (res.status === 401 || res.status === 403) ? 'not_granted' : 'unavailable', message: msg}; }
    let text = '', stop = '';
    if (stream) {
      const rd = res.body.getReader(); const dec = new TextDecoder(); let buf = '';
      for (;;) {
        const {value, done} = await rd.read(); if (done) break; buf += dec.decode(value, {stream: true});
        let i; while ((i = buf.indexOf('\n\n')) >= 0) {
          const chunk = buf.slice(0, i); buf = buf.slice(i + 2);
          const line = chunk.split('\n').find(l => l.startsWith('data:')); if (!line) continue;
          let ev; try { ev = JSON.parse(line.slice(5).trim()); } catch (e) { continue; }
          if (ev.type === 'content_block_delta' && ev.delta && ev.delta.type === 'text_delta') { text += ev.delta.text; opts.onText({text, delta: ev.delta.text}); }
          else if (ev.type === 'message_delta' && ev.delta) stop = ev.delta.stop_reason || stop;
          else if (ev.type === 'error') throw {code: 'unavailable', message: (ev.error && ev.error.message) || 'stream error', text};
        }
      }
    } else { const j = await res.json(); text = (j.content || []).filter(b => b.type === 'text').map(b => b.text).join(''); stop = j.stop_reason; }
    return {text, truncated: stop === 'max_tokens'};
  }
  sample.json = async (input, opts = {}) => {
    const note = '\n\nReply with the JSON only, no code fences and no other text.';
    const inp = typeof input === 'string' ? input + note : input.map((m, i) => i === input.length - 1 ? {role: m.role, content: m.content + note} : m);
    return parseJSON((await sample(inp, opts)).text);
  };
  sample.limits = async () => ({images: true});

  /* ---------- downloads ---------- */
  const downloads = {async save({filename, data}) { const blob = data instanceof Blob ? data : new Blob([data], {type: 'application/json'}); const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = filename; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 2000); return {status: 'saved'}; }};

  const user = {id: async () => 'me', me: async () => ({id: 'me', name: 'Me'}), isOwner: () => true, canEdit: () => true, can: () => true, profiles: async () => ({})};
  let dbInst = null;
  const caps = {db: () => (dbInst = dbInst || makeDb()), user: () => user, sample: () => sample, downloads: () => downloads};
  window.claude = {use: name => new Promise(res => setTimeout(() => res(caps[name] ? caps[name]() : null), 0))};
})();
