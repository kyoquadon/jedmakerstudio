(() => {
'use strict';
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const nid = p => p + '_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
const cap = s => s ? s[0].toUpperCase() + s.slice(1) : '';
const clip = (s, n) => { s = String(s || '').replace(/\s+/g, ' ').trim(); return s.length > n ? s.slice(0, n - 1).trimEnd() + '…' : s; };
const fmtDate = t => new Date(t).toLocaleDateString(undefined, {day: 'numeric', month: 'short'});
const hash = s => { let h = 2166136261; for (const c of String(s)) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; };
const pick = a => a[Math.floor(Math.random() * a.length)];
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const isImg = d => typeof d === 'string' && d.startsWith('data:image/');
const PAL = ['#2f5bea','#ff5b4f','#ffc83a','#1fae7a','#ff8fc8','#7b5cff','#00a3c4','#ff9a2f','#8c6b4a','#1d2030'];
const KCOL = {entry: '#ffffff', pin: '#ff5b4f', spark: '#ffc83a', concept: '#1fae7a', play: '#ff8fc8', piece: '#7b5cff'};
const KNAME = {entry: 'Journal', pin: 'Pin', spark: 'Spark', concept: 'Concept', play: 'Warm-up', piece: 'Piece'};

const STOP = ('a about above after again all also am an and any are as at be because been before being below between both but by can could did do does doing down during each few for from further had has have having he her here hers him his how i if in into is it its itself just like me more most my no nor not now of off on once only or other our out over own really same she should so some such than that the their them then there these they this those through to too under until up very was we were what when where which while who why will with would you your thing things make made want get got going today something maybe much still even every one two way think thought feel felt time been being lot little where back into kind sort well want wanted need know knew look looked seem seems could would should might must ever never always often been just');
const STOPSET = new Set(STOP.split(' '));
function words(text) { return (text || '').toLowerCase().replace(/[^a-z\s'-]/g, ' ').split(/\s+/).map(w => w.replace(/^['-]+|['-]+$/g, '')).filter(w => w.length > 3 && !STOPSET.has(w)); }
function localThemes(text, n = 4) { const c = {}; words(text).forEach(w => c[w] = (c[w] || 0) + 1); return Object.entries(c).sort((a, b) => b[1] - a[1] || b[0].length - a[0].length).slice(0, n).map(e => e[0]); }
function keywords(text, n = 12) { const seen = []; for (const w of words(text)) { if (!seen.includes(w)) seen.push(w); if (seen.length >= n) break; } return seen; }

const PROMPTS = [
  'What did you notice today that nobody else seemed to?',
  'Which texture would you like to touch right now?',
  'What did you learn this week that changed how you see something?',
  'Describe a sound from today as if it were a colour.',
  'What are you pretending not to be interested in?',
  'Which object near you has the best story?',
  'What would you make if nobody would ever see it?',
  'What keeps tugging at you from the last game you played?',
  'Name a feeling you had today and the shape it would be.',
  'What small rule could make tomorrow more playful?',
  'Where did you feel most like yourself this week?',
  'What is something ordinary you would put in a museum?',
  'Which mistake today was secretly interesting?',
  'What do you keep collecting without meaning to?',
  'If today were a material, what would it be?',
  'What question did someone ask that you still want to answer?',
  'Which memory has a smell attached to it?',
  'What would a child build from what you did today?',
  'What are you tired of seeing in art? What would you do instead?',
  'Describe a place in Singapore you could turn into a stage.',
  'Which tool would you love to use the wrong way?',
  'What did you learn from someone younger or older than you?',
  'What is the quietest thing that moved you this week?',
  'Finish the sentence: I wish more people noticed…'
];
const CONSTRAINTS = [
  'Use only materials within arm\'s reach', 'It must fit inside a matchbox', 'Make it in under 20 minutes',
  'Remove the most important part', 'Only two colours allowed', 'It has to be touched to be understood',
  'Make the opposite version first', 'It must make a sound', 'Work at ten times the normal size',
  'Use a tool the wrong way', 'No straight lines', 'Something must stay hidden', 'Start from the ending',
  'Borrow the rules of a game', 'It should change over a day', 'Make it for one specific person',
  'Leave it unfinished on purpose', 'It must be made from something thrown away', 'Let a coin flip make one decision',
  'It should only work in the dark'
];
const MEDIA = ['Surprise me','Physical','Digital','Mixed media','Sculpture','Zine or book','Painting or drawing','Photography','Generative code','Installation','Game or interactive','Performance','Textile','Sound'];
const AUDIENCES = ['Just me','A stranger on the MRT','A curious 8-year-old','My future self','A gallery crowd','People who never visit galleries','Someone having a hard day'];
const STAGES = ['Spark','Sketch','Prototype','Piece','Shown'];
const PERSONAS = {
  anubis: {name: 'Anubis, studio mate', desc: 'Warm and sharp. Notices patterns, asks one good question.', brief: 'You are Anubis, Jed\'s warm, sharp studio mate. Notice patterns, reflect them back briefly, suggest a small experiment when useful, and ask one good question.'},
  socratic: {name: 'Socratic mentor', desc: 'Only questions. Helps you find it yourself.', brief: 'You are a Socratic mentor. Mostly ask probing questions that help Jed discover what he really means. Offer at most one short observation per reply.'},
  devil: {name: 'Devil\'s advocate', desc: 'Pokes holes, then makes it braver.', brief: 'You are a friendly devil\'s advocate. Find the weakest or safest part of the idea, say so plainly, then offer one way to make it braver.'},
  kid: {name: 'Curious kid', desc: 'Why? What if? Delighted by everything.', brief: 'You respond like a curious, delighted 8-year-old: simple why and what-if questions, playful leaps, no jargon.'},
  bauhaus: {name: 'Bauhaus teacher', desc: 'Material, form, constraint. Gives exercises.', brief: 'You are a demanding but kind art school teacher in the Bauhaus tradition. Focus on material, form, function and constraint, and give one concrete hands-on exercise.'}
};

const T0 = Date.now();
const EX = [
  {id: 'ex1', kind: 'entry', example: true, created: T0 - 3 * 864e5, medium: 'mixed', energy: 4, text: 'Watched rain bead on the bus window and noticed every droplet holds a tiny upside-down street. I want to make something about small worlds hiding in ordinary glass.', themes: ['small worlds', 'glass', 'reflection', 'rain']},
  {id: 'ex2', kind: 'entry', example: true, created: T0 - 2 * 864e5, medium: 'physical', energy: 3, prompt: 'What is the quietest thing that moved you this week?', text: 'Ran a workshop today. The best moment was not the game, it was the silence after the debrief question. Could silence be a material?', themes: ['silence', 'play', 'attention']},
  {id: 'ex3', kind: 'entry', example: true, created: T0 - 864e5, medium: 'digital', energy: 5, text: 'Played with a generative shader last night. I like it most when the code makes a mistake that looks intentional.', themes: ['accidents', 'code', 'play', 'ritual']},
  {id: 'exp1', kind: 'pin', example: true, ptype: 'quote', created: T0 - 2.5 * 864e5, quote: 'Make the thing you wish existed, then make it a little stranger.', by: 'Studio motto', note: 'A rule for when I play it safe', tags: ['motto'], themes: ['play', 'strangeness']},
  {id: 'exp2', kind: 'pin', example: true, ptype: 'swatch', created: T0 - 1.5 * 864e5, colors: ['#2f5bea', '#ffc83a', '#ff5b4f', '#f3ead8'], note: 'Playground primaries on old paper', tags: ['palette'], themes: ['play', 'colour', 'glass']},
  {id: 'exp3', kind: 'pin', example: true, ptype: 'link', created: T0 - 0.5 * 864e5, url: 'https://www.metmuseum.org/art/collection', title: 'The Met Open Access collection', note: 'Public-domain references I can use freely', tags: ['reference'], themes: ['reference', 'ritual']},
  {id: 'exs1', kind: 'spark', example: true, created: T0 - 1.8 * 864e5, text: 'Silence might be a material I can shape, like clay.', themes: ['silence', 'attention']},
  {id: 'exc1', kind: 'concept', example: true, created: T0 - 0.8 * 864e5, stage: 1, title: 'Upside-down Streets', premise: 'A row of water-filled jars on a windowsill, each one bending the street outside into a tiny inverted world. Visitors crouch to look.', medium: 'Installation', materials: ['5 clear jars', 'water', 'a windowsill', 'phone camera'], experiment: 'Fill one jar and photograph the street through it at three times of day.', stretch: 'Lets the found world do half the work, so you give up some control.', sources: ['ex1', 'exp2'], themes: ['small worlds', 'glass', 'reflection']}
];

/* ---------- state ---------- */
const S = {station: 'workbench', sample: null, imgOK: false, prompt: '', entryPhoto: '', pinType: 'image', pinImage: '', pinFilter: '', scraps: [], persona: 'anubis', attach: '', thread: null, out: null, wallMode: 'map2d', pos: {}, block: {id: '', shapes: [], sel: -1, conceptId: ''}, constraint: pick(CONSTRAINTS), localItems: []};
const store = {items: [], col: null, mode: 'local', queue: {}, migrated: false};
try { S.hideEx = localStorage.getItem('makers-hide-examples') === '1'; } catch (e) { S.hideEx = false; }
const LK = 'jed-makers-studio-v1';

function loadLocal() { try { store.items = JSON.parse(localStorage.getItem(LK) || '[]'); } catch (e) { store.items = []; } S.localItems = store.items.slice(); }
function saveLocal() { try { localStorage.setItem(LK, JSON.stringify(store.items)); } catch (e) { notice('This browser is out of room. Remove a few image pins, or open the studio on claude.ai to save there.'); } }
const clean = o => JSON.parse(JSON.stringify(o));
function put(item) {
  if (item.example) { renderAll(); return Promise.resolve(); }
  item.updated = Date.now();
  if (['entry','pin','play','piece','spark'].includes(item.kind) && !store.items.some(x => x.id === item.id) && typeof Room !== 'undefined') setTimeout(() => Room.cheer(), 50);
  const i = store.items.findIndex(x => x.id === item.id);
  if (i >= 0) store.items[i] = item; else store.items.push(item);
  renderAll();
  if (store.col) {
    const prev = store.queue[item.id] || Promise.resolve();
    const p = prev.then(() => store.col.doc(item.id).set(clean(item))).catch(dbErr);
    store.queue[item.id] = p; return p;
  }
  saveLocal(); return Promise.resolve();
}
function remove(id) {
  store.items = store.items.filter(x => x.id !== id);
  S.scraps = S.scraps.filter(x => x !== id);
  renderAll();
  if (store.col) return store.col.doc(id).delete().catch(dbErr);
  saveLocal(); return Promise.resolve();
}
function dbErr(e) {
  if (e && e.code === 'quota_exceeded') notice('Your studio storage is full. Delete some image pins to make room.');
  else if (e && e.code === 'invalid_argument') notice('That could not be saved. Image pins may be too large; try a smaller image.');
  else notice('Saving hit a snag. Your change shows here but may not have reached your studio storage.');
}
const find = id => store.items.find(x => x.id === id) || EX.find(x => x.id === id);
const mine = k => store.items.filter(x => x.kind === k).sort((a, b) => (b.created || 0) - (a.created || 0));
const withEx = k => { const m = mine(k); return m.length || S.hideEx ? m : EX.filter(x => x.kind === k); };
const creative = () => { const m = store.items.filter(x => ['entry','pin','spark','concept','play','piece'].includes(x.kind)); return m.length ? m.sort((a, b) => (b.created || 0) - (a.created || 0)) : S.hideEx ? [] : EX.slice(); };

function label(it) {
  if (!it) return '';
  if (it.kind === 'entry') return clip(it.title || it.text || (it.tags && it.tags.length ? '#' + it.tags.join(' #') : '') || (it.link ? 'Link entry' : 'Photo entry'), 60);
  if (it.kind === 'spark') return clip(it.text, 60);
  if (it.kind === 'concept') return it.title || 'Untitled concept';
  if (it.kind === 'play') return clip(it.made || it.prompt, 60);
  if (it.kind === 'piece') return it.title || 'Untitled piece';
  if (it.kind === 'pin') {
    if (it.ptype === 'quote') return '“' + clip(it.quote, 50) + '”';
    if (it.ptype === 'link') return clip(it.title || it.url, 50);
    if (it.ptype === 'swatch') return 'Colours: ' + clip(it.note || (it.colors || []).join(' '), 40);
    return clip(it.note || 'Image pin', 50);
  }
  return '';
}
function bodyText(it) {
  if (!it) return '';
  if (it.kind === 'entry') return (it.title ? 'Title: ' + it.title + '\n' : '') + (it.prompt ? 'Prompt: ' + it.prompt + '\n' : '') + (it.text || '') + (it.tags ? '\nTags: ' + it.tags.join(', ') : '') + (it.link ? '\nLink: ' + it.link : '') + (it.photo ? ' [has a photo]' : '');
  if (it.kind === 'spark') return it.text;
  if (it.kind === 'concept') return `${it.title}: ${it.premise} (medium: ${it.medium}; ${it.composted ? 'composted' : 'stage: ' + STAGES[it.stage || 0]})`;
  if (it.kind === 'play') return `Warm-up (${it.type}): ${it.prompt}. What he made: ${it.made || '[photo]'}. Felt: ${it.feel || ''}`;
  if (it.kind === 'piece') return `Finished piece "${it.title}" (${it.medium}). ${it.reflection ? 'What surprised him: ' + it.reflection : ''}${it.shown ? ' Shown: ' + it.shown : ''}`;
  if (it.kind === 'pin') {
    const note = it.note ? ` Why it catches me: ${it.note}.` : '';
    const tags = (it.tags || []).length ? ` Tags: ${it.tags.join(', ')}.` : '';
    if (it.ptype === 'quote') return `Quote: "${it.quote}"${it.by ? ' by ' + it.by : ''}.${note}${tags}`;
    if (it.ptype === 'link') return `Link: ${it.title || ''} (${it.url}).${note}${tags}`;
    if (it.ptype === 'swatch') return `Colour palette: ${(it.colors || []).join(', ')}.${note}${tags}`;
    return `Image pin.${note}${tags}`;
  }
  return '';
}
function itemThemes(it) { if (it.themes && it.themes.length) return it.themes; return localThemes(bodyText(it), 3); }
function fingerprint() { const c = {}; creative().forEach(it => itemThemes(it).forEach(t => c[t] = (c[t] || 0) + 1)); return Object.entries(c).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])); }

/* ---------- UI helpers ---------- */
let noticeTimer;
function notice(msg) { $$('.notice').forEach(n => n.textContent = msg); clearTimeout(noticeTimer); noticeTimer = setTimeout(() => { $$('.notice').forEach(n => n.textContent = ''); }, 7000); }
function setSave(state) {
  const c = $('#saveChip'); c.className = 'chip';
  if (state === 'cloud') { c.textContent = 'Saved to your studio'; c.classList.add('ok'); }
  else if (state === 'cache') c.textContent = 'Syncing your studio';
  else if (state === 'connecting') c.textContent = 'Connecting to your studio';
  else { c.textContent = 'Saving in this browser only'; c.classList.add('warn'); }
}
function setAI() {
  const c = $('#aiChip'); c.className = 'chip ' + (S.sample ? 'ok' : 'warn'); c.textContent = S.sample ? 'Claude: in the studio' : 'Claude: away';
  $$('.needs-ai').forEach(b => { b.disabled = !S.sample; });
  $('#chatOff').hidden = !!S.sample;
}
function aiErr(e, quiet) {
  if (e && e.code === 'not_granted') { S.sample = null; setAI(); notice('Claude was not allowed on this page, so the studio will work without it.'); return; }
  if (e && e.code === 'rate_limited') { notice('Claude is busy. Try again in a minute.'); return; }
  if (!quiet) notice('Claude could not answer that time. Try again.');
}
const themeChips = it => { const t = itemThemes(it); return t.length ? `<div class="tags">${t.map(x => `<span class="tag">${esc(x)}</span>`).join('')}</div>` : ''; };
const actBtn = (act, text, extra = '') => `<button class="btn btn-sm ${extra}" type="button" data-act="${act}">${esc(text)}</button>`;
const val = n => (document.querySelector(`input[name="${n}"]:checked`) || {}).value;

function fileToDataURL(file, max = 900) {
  return new Promise((res, rej) => {
    const img = new Image(); const url = URL.createObjectURL(file);
    img.onload = () => {
      const s = Math.min(1, max / Math.max(img.width, img.height));
      const w = Math.max(1, Math.round(img.width * s)), h = Math.max(1, Math.round(img.height * s));
      const c = document.createElement('canvas'); c.width = w; c.height = h;
      const x = c.getContext('2d'); x.fillStyle = '#fff'; x.fillRect(0, 0, w, h); x.drawImage(img, 0, 0, w, h);
      URL.revokeObjectURL(url);
      let d = c.toDataURL('image/jpeg', 0.76); if (d.length > 200000) d = c.toDataURL('image/jpeg', 0.55);
      res(d);
    };
    img.onerror = () => { URL.revokeObjectURL(url); rej(new Error('bad image')); };
    img.src = url;
  });
}
function toBlob(dataURL) { const [h, b] = dataURL.split(','); const mime = (h.match(/data:([^;]+)/) || [])[1] || 'image/jpeg'; const bin = atob(b); const a = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) a[i] = bin.charCodeAt(i); return new Blob([a], {type: mime}); }

async function enrich(id) {
  const it = find(id); if (!S.sample || !it || it.example) return;
  const opts = {modelTier: 'quick'};
  if (it.kind === 'pin' && it.ptype === 'image' && isImg(it.img) && S.imgOK) opts.images = [toBlob(it.img)];
  try {
    const v = await S.sample.json(`Read this ${it.kind === 'pin' ? 'inspiration pin' : 'journal entry'} from an artist's studio${opts.images ? ' (the image is attached)' : ''}. Return only JSON: {"themes": ["3 to 5 short lowercase themes: recurring ideas, motifs, materials or moods, one or two words each"]}\n"""${bodyText(it)}"""`, opts);
    const th = ((v && v.themes) || []).filter(x => typeof x === 'string').map(x => x.toLowerCase().trim().slice(0, 28)).filter(Boolean).slice(0, 5);
    const cur = find(id); if (th.length && cur && !cur.example) { cur.themes = (cur.tags || []).concat(th).filter((t, i, a) => a.indexOf(t) === i).slice(0, 6); put(cur); }
  } catch (e) { aiErr(e, true); }
}

/* ---------- header ---------- */
function renderTally() {
  const n = k => mine(k).length;
  const parts = [['entry', 'journal entries'], ['pin', 'pins'], ['spark', 'sparks'], ['concept', 'concepts'], ['play', 'warm-ups'], ['piece', 'pieces']];
  $('#critChip').hidden = !critStatus().due;
  $('#tally').innerHTML = (critStatus().due ? '<a class="chip due" href="#mirror">Studio crit due</a>' : '') + parts.map(([k, l]) => `<span class="chip">${n(k)} ${l}</span>`).join('') + (store.items.length || S.hideEx ? '' : '<span class="chip chip-ex">Showing examples until you add your own</span>');
}

/* ---------- workbench ---------- */
function entryCard(e) {
  return `<article class="card ${e.example ? 'is-ex' : ''}" data-id="${esc(e.id)}">
    <div class="card-top"><span class="date">${fmtDate(e.created)}</span>${e.example ? '<span class="chip chip-ex">Example</span>' : ''}${e.medium ? `<span class="chip m-${esc(e.medium)}">${esc(cap(e.medium))}</span>` : ''}${e.energy ? `<span class="energy" aria-label="Energy ${e.energy} of 5">${'●'.repeat(e.energy)}${'○'.repeat(5 - e.energy)}</span>` : ''}</div>
    ${e.title ? `<h3 class="entry-title">${esc(e.title)}</h3>` : ''}
    ${e.prompt ? `<p class="hand prompt-echo">${esc(e.prompt)}</p>` : ''}
    ${S.editing === e.id ? `<label class="vh" for="edit-${esc(e.id)}">Edit entry</label><textarea id="edit-${esc(e.id)}" rows="5">${esc(e.text)}</textarea><div class="actions">${actBtn('editsave', 'Save changes', 'btn-blue')}${actBtn('editcancel', 'Cancel')}</div>` : (e.text ? `<p class="wrap-text">${esc(e.text)}</p>` : '')}
    ${isImg(e.photo) ? `<img class="thumb" src="${esc(e.photo)}" alt="Photo attached to this entry">` : ''}
    ${e.link && /^https?:\/\//i.test(e.link) ? `<p><a href="${esc(e.link)}" target="_blank" rel="noopener">${esc(clip(e.link.replace(/^https?:\/\//, ''), 60))}</a></p>` : ''}
    ${themeChips(e)}
    ${S.editing === e.id ? '' : `<div class="actions">${actBtn('talk', 'Talk it through')}${actBtn('scrap', S.scraps.includes(e.id) ? 'In the Idea Machine' : 'Send to Idea Machine')}${e.example ? actBtn('hideex', 'Hide examples') : actBtn('edit', 'Edit') + actBtn('del', 'Delete')}</div>`}
  </article>`;
}
function renderJournal() {
  const q = $('#journalSearch').value.trim().toLowerCase();
  let list = withEx('entry');
  if (q) list = list.filter(e => ([e.title, e.text, (e.tags || []).join(' ')].join(' ') + ' ' + itemThemes(e).join(' ')).toLowerCase().includes(q));
  const exNote = !mine('entry').length && !S.hideEx ? '<p class="caption">These three are examples so the studio isn\'t empty. They disappear as soon as you pin your first entry, or you can hide them now.</p>' : '';
  $('#journalList').innerHTML = exNote + (list.length ? list.map(entryCard).join('') : (q ? '<p class="hint">Nothing matches that search.</p>' : '<p class="caption">Your journal is empty. Write your first entry and press Pin it to the bench.</p>'));
  if (S.editing) { const ta = document.getElementById('edit-' + S.editing); if (ta && document.activeElement !== ta) ta.focus(); }
}

/* ---------- pinboard ---------- */
function pinCard(p) {
  const tilt = ((hash(p.id) % 5) - 2) * 0.6;
  let inner = '';
  if (p.ptype === 'image' && isImg(p.img)) inner = `<img class="thumb" src="${esc(p.img)}" alt="${esc(p.note || 'Pinned image')}">`;
  else if (p.ptype === 'quote') inner = `<p class="pin-quote">“${esc(p.quote)}”</p>${p.by ? `<p class="hint">${esc(p.by)}</p>` : ''}`;
  else if (p.ptype === 'link') { const safe = /^https?:\/\//i.test(p.url || '') ? p.url : ''; inner = `<p><b>${esc(p.title || 'Link')}</b></p>${safe ? `<a href="${esc(safe)}" target="_blank" rel="noopener">${esc(clip(safe.replace(/^https?:\/\//, ''), 60))}</a>` : ''}`; }
  else if (p.ptype === 'swatch') inner = `<div class="sw-row" aria-hidden="true">${(p.colors || []).map(c => `<span style="background:${esc(/^#[0-9a-f]{3,8}$/i.test(c) ? c : '#ccc')}"></span>`).join('')}</div><p class="hint">${(p.colors || []).map(esc).join(' · ')}</p>`;
  return `<article class="pin ${p.example ? 'is-ex' : ''}" style="--tilt:${tilt}deg;--pinc:${PAL[hash(p.id) % 5]}" data-id="${esc(p.id)}">
    ${p.example ? '<span class="chip chip-ex">Example</span>' : ''}
    ${inner}
    ${p.note ? `<p>${esc(p.note)}</p>` : ''}
    ${themeChips(p)}
    ${p.why ? `<div class="why"><b>Claude's read:</b> ${esc(p.why)}</div>` : ''}
    <div class="actions">${actBtn('why', 'Why do I like this?', 'needs-ai')}${actBtn('scrap', S.scraps.includes(p.id) ? 'In the Idea Machine' : 'Use in Idea Machine')}${actBtn('talk', 'Talk')}${p.example ? '' : actBtn('del', 'Delete')}</div>
  </article>`;
}
function renderPins() {
  const pins = withEx('pin');
  const tags = {}; pins.forEach(p => [...(p.tags || []), ...itemThemes(p)].forEach(t => tags[t] = (tags[t] || 0) + 1));
  const top = Object.entries(tags).sort((a, b) => b[1] - a[1]).slice(0, 14);
  if (S.pinFilter && !tags[S.pinFilter]) S.pinFilter = '';
  $('#pinFilters').innerHTML = `<button class="btn btn-sm" type="button" data-filter="" aria-pressed="${!S.pinFilter}">All pins</button>` + top.map(([t]) => `<button class="btn btn-sm" type="button" data-filter="${esc(t)}" aria-pressed="${S.pinFilter === t}">${esc(t)}</button>`).join('');
  $$('#pinFilters [aria-pressed="true"]').forEach(b => b.classList.add('btn-yellow'));
  const list = S.pinFilter ? pins.filter(p => [...(p.tags || []), ...itemThemes(p)].includes(S.pinFilter)) : pins;
  $('#pinGrid').innerHTML = list.map(pinCard).join('');
  setAI();
}
function setPinType(t) {
  S.pinType = t;
  $$('[data-ptype]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.ptype === t)));
  $$('[data-pf]').forEach(d => { d.hidden = d.dataset.pf !== t; });
}
async function takePinImage(file) {
  if (!file || !file.type.startsWith('image/')) return;
  try { S.pinImage = await fileToDataURL(file); const pv = $('#pinPreview'); pv.src = S.pinImage; pv.hidden = false; setPinType('image'); }
  catch (e) { notice('That image could not be read. Try a JPG or PNG.'); }
}
function savePin() {
  const t = S.pinType; const note = $('#pinNote').value.trim();
  const tags = $('#pinTags').value.split(',').map(s => s.trim().toLowerCase()).filter(Boolean).slice(0, 8);
  const p = {id: nid('p'), kind: 'pin', ptype: t, created: Date.now(), note, tags};
  if (t === 'image') { if (!S.pinImage) return notice('Choose, drop or paste an image first.'); p.img = S.pinImage; }
  if (t === 'quote') { p.quote = $('#pinQuote').value.trim(); p.by = $('#pinQuoteBy').value.trim(); if (!p.quote) return notice('Type the line you want to pin.'); }
  if (t === 'link') { p.url = $('#pinUrl').value.trim(); p.title = $('#pinLinkTitle').value.trim(); if (!/^https?:\/\//i.test(p.url)) return notice('Links need to start with https://'); }
  if (t === 'swatch') p.colors = ['#sw1', '#sw2', '#sw3', '#sw4'].map(s => $(s).value);
  p.themes = [...new Set([...tags.slice(0, 2), ...localThemes(bodyText(p), 3)])].slice(0, 4);
  put(p);
  ['#pinNote', '#pinTags', '#pinQuote', '#pinQuoteBy', '#pinUrl', '#pinLinkTitle'].forEach(s => $(s).value = '');
  S.pinImage = ''; $('#pinPreview').hidden = true; $('#pinImage').value = '';
  notice('Pinned.');
  enrich(p.id);
}
async function whyPin(p, btn) {
  if (!S.sample) return notice('Claude is away on this view, so it cannot read pins right now.');
  btn.disabled = true; btn.textContent = 'Looking…';
  const opts = {modelTier: 'default'};
  if (p.ptype === 'image' && isImg(p.img) && S.imgOK) opts.images = [toBlob(p.img)];
  try {
    const r = await S.sample(`This is a pin from Jed's inspiration board in his maker's studio${opts.images ? ' (image attached)' : ''}. ${bodyText(p)}\nIn two or three plain sentences, name the visual or conceptual qualities that probably draw him to it (composition, colour, texture, mood, idea), then suggest one way he could use that quality in his own work. No em dashes. No preamble.`, opts);
    p.why = (r && r.text || '').trim(); put(p);
  } catch (e) { aiErr(e); renderPins(); }
}

/* ---------- corner ---------- */
function renderPersonas() {
  $('#personaPicks').innerHTML = Object.entries(PERSONAS).map(([k, p]) => `<label class="persona"><input type="radio" name="persona" value="${k}" id="pp-${k}" ${S.persona === k ? 'checked' : ''}><span><b>${esc(p.name)}</b><small>${esc(p.desc)}</small></span></label>`).join('');
}
function renderAttach() {
  const groups = [['entry', 'Journal'], ['pin', 'Pins'], ['concept', 'Concepts'], ['spark', 'Sparks']];
  $('#attachSel').innerHTML = '<option value="">Nothing, just talk</option>' + groups.map(([k, g]) => `<optgroup label="${g}">${withEx(k).map(it => `<option value="${esc(it.id)}">${esc(clip(label(it), 60))}${it.example ? ' (example)' : ''}</option>`).join('')}</optgroup>`).join('');
  $('#attachSel').value = find(S.attach) ? S.attach : '';
  const it = find(S.attach);
  $('#attachPreview').textContent = it ? 'On the table: ' + clip(bodyText(it), 220) : '';
  const threads = mine('chat');
  $('#threadSel').innerHTML = (S.thread && !threads.find(t => t.id === S.thread.id) ? `<option value="${esc(S.thread.id)}">Current conversation</option>` : '') + (threads.length || S.thread ? '' : '<option value="">No saved conversations yet</option>') + threads.map(t => `<option value="${esc(t.id)}">${esc(fmtDate(t.created) + ' · ' + clip(t.title || 'Conversation', 40))}</option>`).join('');
  if (S.thread) $('#threadSel').value = S.thread.id;
}
function renderChat() {
  const log = $('#chatLog'); const msgs = S.thread ? S.thread.messages : [];
  if (!msgs.length) {
    log.innerHTML = `<div class="bubble ai"><span class="who">${esc(PERSONAS[S.persona].name)}</span><p>Pull up a stool. Bring a journal entry, a pin or a half-formed idea to the table, or just start typing.</p></div>`;
    return;
  }
  log.innerHTML = msgs.map((m, i) => `<div class="bubble ${m.role === 'user' ? 'me' : 'ai'}"><span class="who">${m.role === 'user' ? 'You' : esc(PERSONAS[m.persona || S.persona].name)}</span><p>${esc(m.content || '…')}</p>${m.role === 'assistant' && m.content ? `<div class="actions"><button class="btn btn-sm" type="button" data-msgspark="${i}">Keep as spark</button></div>` : ''}</div>`).join('');
  log.scrollTop = log.scrollHeight;
}
function newThread() { S.thread = {id: nid('chat'), kind: 'chat', created: Date.now(), title: '', messages: []}; renderAttach(); renderChat(); }
function studioBrief() {
  const fp = fingerprint().slice(0, 8).map(e => e[0]).join(', ');
  const it = find(S.attach);
  return `[Studio context] You are in Jed's Maker's Studio, a workshop and playground where he journals, collects references and workshops ideas for art in physical, digital and mixed media. His goal is finding his artistic voice. ${PERSONAS[S.persona].brief}\nRules: reply in under 120 words, in plain everyday language, no em dashes, no bullet lists unless he asks, at most one question per reply.\nThemes that keep showing up in his studio: ${fp || 'none yet'}.` + (it ? `\nHe brought this to the table (${KNAME[it.kind]}): ${bodyText(it)}` : '') + '\n[End of context]\n\n';
}
async function sendChat(text) {
  if (!S.sample) return notice('Claude is away on this view.');
  if (!S.thread) newThread();
  const th = S.thread;
  th.messages.push({role: 'user', content: text});
  const out = {role: 'assistant', content: '', persona: S.persona};
  th.messages.push(out); renderChat();
  const hist = th.messages.slice(0, -1).filter(m => m.content).slice(-20);
  while (hist.length && hist[0].role !== 'user') hist.shift();
  const input = hist.map((m, i) => ({role: m.role, content: i === 0 ? studioBrief() + m.content : m.content}));
  $('#chatSend').disabled = true;
  try {
    const r = await S.sample(input, {cache: false, modelTier: 'default', onText: ({text: t}) => { out.content = t; const b = $$('#chatLog .bubble p'); if (b.length) b[b.length - 1].textContent = t || '…'; }});
    out.content = (r && r.text || out.content || '').trim();
  } catch (e) { th.messages.pop(); aiErr(e); }
  $('#chatSend').disabled = !S.sample;
  if (th.messages.length > 60) th.messages = th.messages.slice(-60);
  if (!th.title) th.title = clip(text, 40);
  renderChat();
  if (out.content) put(th);
}
async function catchSpark() {
  if (!S.sample || !S.thread || S.thread.messages.length < 2) return notice('Have a bit of a conversation first, then catch the spark.');
  const btn = $('#catchSpark'); btn.disabled = true;
  try {
    const convo = S.thread.messages.slice(-16).map(m => (m.role === 'user' ? 'Jed: ' : 'Claude: ') + m.content).join('\n');
    const v = await S.sample.json(`From this studio conversation, distil the single most promising creative spark Jed could act on, in his voice, in one short sentence (under 20 words, no em dashes). Also give 2 or 3 short lowercase themes. Return only JSON {"spark": "...", "themes": ["..."]}\n\n${convo}`, {modelTier: 'quick'});
    if (v && v.spark) { put({id: nid('s'), kind: 'spark', created: Date.now(), text: String(v.spark).slice(0, 200), themes: (v.themes || []).filter(x => typeof x === 'string').slice(0, 3).map(x => x.toLowerCase()), source: S.thread.id}); notice('Spark caught. It is waiting in the Idea Machine tray.'); }
  } catch (e) { aiErr(e); }
  btn.disabled = !S.sample;
}

/* ---------- machine ---------- */
function renderTray() {
  const items = [...withEx('entry'), ...withEx('pin'), ...withEx('spark'), ...mine('play'), ...compostList()].slice(0, 55);
  S.scraps = S.scraps.filter(id => find(id));
  $('#scrapTray').innerHTML = items.map(it => `<button class="scrap" type="button" data-scrap="${esc(it.id)}" aria-pressed="${S.scraps.includes(it.id)}"><small>${it.composted ? 'Compost' : KNAME[it.kind]}</small>${esc(clip(label(it), 46))}</button>`).join('');
}
function fillSelect(sel, list) { $(sel).innerHTML = list.map(x => `<option>${esc(x)}</option>`).join(''); }
function localConcepts(src, medium, constraint, audience) {
  const th = [...new Set(src.flatMap(itemThemes))];
  const [a = 'memory', b = 'play', c = 'light'] = th;
  const m = medium === 'Surprise me' ? pick(MEDIA.slice(1)) : medium;
  const aud = audience === 'Just me' ? 'you alone' : audience.toLowerCase();
  return [
    {title: `${cap(a)} Meets ${cap(b)}`, premise: `A ${m.toLowerCase()} piece where ${a} and ${b} share one surface, made for ${aud}.`, medium: m, materials: ['things already on your desk', 'tape or glue', 'a phone camera'], experiment: `Make three tiny versions in 20 minutes that follow the rule: ${constraint.toLowerCase()}.`, stretch: 'Keep the version that embarrasses you a little and push that one further.'},
    {title: `The ${cap(c)} Archive`, premise: `Collect ten small traces of ${c} from one week and arrange them so they read like a story for ${aud}.`, medium: m, materials: ['a shoebox or folder', 'labels', 'found objects or screenshots'], experiment: 'Collect your first three traces today and write one line for each.', stretch: 'Asks you to trust everyday material as art.'},
    {title: `${cap(b)} in Reverse`, premise: `Take what you love about ${b} and build its opposite, so the absence becomes the subject.`, medium: m, materials: ['paper', 'scissors', 'one light source'], experiment: 'Sketch the opposite version first, then the normal one, and compare.', stretch: 'Practises making a strong choice instead of a safe one.'}
  ];
}
async function pullLever() {
  const lever = $('#lever'); if (lever.classList.contains('busy')) return;
  lever.classList.add('pulled', 'busy'); Room.pulse('machine'); lever.lastElementChild.textContent = 'Whirring…';
  setTimeout(() => lever.classList.remove('pulled'), 350);
  let src = S.scraps.map(find).filter(Boolean);
  if (!src.length) { const pool = [...withEx('entry'), ...withEx('pin'), ...withEx('spark')]; src = pool.sort(() => Math.random() - 0.5).slice(0, 2); }
  const medium = $('#dMedium').value, audience = $('#dAudience').value, constraint = S.constraint;
  let concepts = null;
  if (S.sample) {
    try {
      const v = await S.sample.json(`Act as an art-school studio mentor. Combine these scraps from Jed's maker's studio into 3 distinct art concepts.\nScraps:\n${src.map((s, i) => `${i + 1}. (${KNAME[s.kind]}) ${bodyText(s)}`).join('\n')}\nMedium: ${medium === 'Surprise me' ? 'your choice, vary it across the three' : medium}. Constraint: ${constraint}. Made for: ${audience}.\nMake each concept specific and makeable by one person with ordinary tools. Vary scale and risk across the three. Plain language, no em dashes.\nReturn only JSON: {"concepts":[{"title":"2 to 5 words","premise":"one or two sentences","medium":"specific medium","materials":["3 to 5 items"],"experiment":"the smallest test he can do this week, one sentence","stretch":"what this asks of him as an artist, one sentence"}]}`, {modelTier: 'default'});
      concepts = v && Array.isArray(v.concepts) ? v.concepts.filter(c => c && c.title).slice(0, 3) : null;
    } catch (e) { aiErr(e); }
  }
  if (!concepts || !concepts.length) concepts = localConcepts(src, medium, constraint, audience);
  S.out = {concepts, sources: src.map(s => s.id), constraint, audience};
  lever.classList.remove('busy'); lever.lastElementChild.textContent = 'Pull again';
  renderOut();
}
function renderOut() {
  const box = $('#machineOut');
  if (!S.out) { box.innerHTML = '<p class="hint">Concept cards land here.</p>'; return; }
  box.innerHTML = S.out.concepts.map((c, i) => `<article class="card concept ${reduceMotion ? '' : 'deal'}" style="animation-delay:${i * 90}ms">
    <h3>${esc(c.title)}</h3><p>${esc(c.premise)}</p>
    <p class="kv"><b>Medium:</b> ${esc(c.medium)}</p>
    ${Array.isArray(c.materials) && c.materials.length ? `<div class="kv"><b>Materials</b><ul>${c.materials.slice(0, 6).map(m => `<li>${esc(m)}</li>`).join('')}</ul></div>` : ''}
    <p class="kv"><b>First experiment:</b> ${esc(c.experiment)}</p>
    <p class="kv"><b>What it asks of you:</b> ${esc(c.stretch)}</p>
    <div class="actions"><button class="btn btn-sm btn-blue" type="button" data-keep="${i}">Keep this concept</button><button class="btn btn-sm" type="button" data-keep="${i}" data-compostout="1">Compost it</button></div>
  </article>`).join('');
}
function miniSources(c) {
  const ps = (c.sources || []).map(find).filter(x => x && x.kind === 'pin');
  if (!ps.length) return '';
  return `<div class="mini-pins" aria-label="Pins behind this concept">${ps.map(p => p.ptype === 'image' && isImg(p.img) ? `<img src="${esc(p.img)}" alt="${esc(p.note || 'pin')}">` : p.ptype === 'swatch' ? `<span class="msw" aria-hidden="true">${(p.colors || []).map(x => `<span style="background:${esc(/^#[0-9a-f]{3,8}$/i.test(x) ? x : '#ccc')}"></span>`).join('')}</span>` : '').join('')}</div>`;
}
function renderBoard() {
  const cs = withEx('concept').filter(c => !c.composted);
  $('#board').innerHTML = STAGES.map((st, si) => {
    const col = cs.filter(c => (c.stage || 0) === si);
    return `<div class="col"><h3><span>${st}</span><span>${col.length}</span></h3>${col.map(c => `<article class="card ${c.example ? 'is-ex' : ''}" data-id="${esc(c.id)}">
      ${c.example ? '<span class="chip chip-ex">Example</span>' : ''}
      <h3>${esc(c.title)}</h3><p class="mini">${esc(clip(c.premise, 140))}</p>
      ${miniSources(c)}
      <div class="actions">${si > 0 ? `<button class="btn btn-sm" type="button" data-act="stage" data-dir="-1" aria-label="Move back to ${STAGES[si - 1]}">◀</button>` : ''}${si < 4 ? `<button class="btn btn-sm" type="button" data-act="stage" data-dir="1" aria-label="Move on to ${STAGES[si + 1]}">▶</button>` : ''}${actBtn('talk', 'Talk')}${actBtn('sketch', 'Block it out')}${si >= 3 ? actBtn('hang', 'Hang in gallery') : ''}${c.example ? '' : actBtn('compost', 'Compost')}${c.example ? '' : actBtn('del', 'Delete')}</div>
    </article>`).join('') || '<p class="hint">Empty</p>'}</div>`;
  }).join('');
}

/* ---------- sketch wall: 2D ---------- */
const NFILL = {core: '#ffc83a', hub: '#dde6ff', kw: '#ffe4f2', entry: '#ffffff', pin: '#ffe1dd', spark: '#fff2c9', concept: '#d6f5e9'};
function buildGraph() {
  const draft = $('#thinkInput').value.trim();
  const fp = fingerprint().slice(0, 8);
  const nodes = [], edges = [];
  const add = (key, lab, type) => { if (!nodes.find(n => n.key === key)) nodes.push({key, label: lab, type}); };
  if (draft) {
    const kws = keywords(draft, 12);
    add('core', 'this thought', 'core');
    kws.forEach((k, i) => {
      add('k:' + k, k, 'kw'); edges.push([i ? 'k:' + kws[i - 1] : 'core', 'k:' + k, 'solid']);
      const hub = fp.find(([t]) => t === k || t.includes(k) || k.includes(t));
      if (hub && hub[0] !== k) { add('t:' + hub[0], hub[0], 'hub'); edges.push(['k:' + k, 't:' + hub[0], 'dash']); }
      else if (hub) { const n = nodes.find(x => x.key === 'k:' + k); n.type = 'hub'; }
    });
  } else {
    add('core', 'your studio', 'core');
    fp.forEach(([t]) => { add('t:' + t, t, 'hub'); edges.push(['core', 't:' + t, 'solid']); });
    creative().slice(0, 22).forEach(it => {
      const ths = itemThemes(it).filter(t => fp.some(([f]) => f === t));
      if (!ths.length) return;
      add('i:' + it.id, clip(label(it).replace(/^“|”$/g, ''), 22), it.kind);
      ths.slice(0, 2).forEach(t => edges.push(['t:' + t, 'i:' + it.id, 'thin']));
    });
  }
  return {nodes, edges, draft: !!draft};
}
function layout(g, W, H, ctx) {
  g.nodes.forEach(n => {
    n.fs = n.type === 'core' ? 16 : (n.type === 'hub' || n.type === 'kw') ? 15 : 12.5;
    n.fw = (n.type === 'core' || n.type === 'hub') ? 700 : 500;
    ctx.font = `${n.fw} ${n.fs}px Figtree, sans-serif`;
    const oval = n.type === 'core' || n.type === 'hub'; n.w = Math.min(W - 16, ctx.measureText(n.label).width + 22 + (oval ? 14 : 0)); n.h = n.fs + 16 + (oval ? 10 : 0);
    const p = S.pos[n.key];
    if (n.type === 'core') { n.x = W / 2; n.y = H / 2; }
    else if (p) { n.x = p.x * W; n.y = p.y * H; }
    else { const a = (hash(n.key) % 628) / 100, r = (n.type === 'hub' || n.type === 'kw' ? 110 : 190) * Math.min(1, W / 700) + (hash(n.key + 'r') % 40); n.x = W / 2 + Math.cos(a) * r; n.y = H / 2 + Math.sin(a) * r * 0.8; }
  });
  const idx = Object.fromEntries(g.nodes.map(n => [n.key, n]));
  const E = g.edges.map(([a, b, s]) => [idx[a], idx[b], s]).filter(e => e[0] && e[1]);
  const N = g.nodes, scale = Math.min(1, W / 760);
  const collide = (pad) => {
    for (let i = 0; i < N.length; i++) for (let j = i + 1; j < N.length; j++) {
      const a = N[i], b = N[j]; const dx = b.x - a.x, dy = b.y - a.y;
      const ox = (a.w + b.w) / 2 + pad - Math.abs(dx), oy = (a.h + b.h) / 2 + pad - Math.abs(dy);
      if (ox > 0 && oy > 0) {
        const fa = a.type === 'core' ? 0 : b.type === 'core' ? 1 : 0.5, fb = 1 - fa;
        if (ox < oy) { const s = (dx >= 0 ? 1 : -1) * ox; a.x -= s * fa; b.x += s * fb; }
        else { const s = (dy >= 0 ? 1 : -1) * oy; a.y -= s * fa; b.y += s * fb; }
      }
    }
  };
  const clamp = () => N.forEach(n => { if (n.type === 'core') { n.x = W / 2; n.y = H / 2; return; } n.x = Math.max(n.w / 2 + 8, Math.min(W - n.w / 2 - 8, n.x)); n.y = Math.max(n.h / 2 + 8, Math.min(H - n.h / 2 - 8, n.y)); });
  for (let it = 0; it < 260; it++) {
    const k = 1 - it / 260;
    for (let i = 0; i < N.length; i++) for (let j = i + 1; j < N.length; j++) {
      const a = N[i], b = N[j]; let dx = b.x - a.x, dy = b.y - a.y; let d2 = dx * dx + dy * dy || 1; if (d2 > 90000) continue;
      const f = 2400 * scale / d2 * k; const d = Math.sqrt(d2); dx /= d; dy /= d;
      if (a.type !== 'core') { a.x -= dx * f; a.y -= dy * f; } if (b.type !== 'core') { b.x += dx * f; b.y += dy * f; }
    }
    E.forEach(([a, b, s]) => {
      const L = (s === 'thin' ? 95 : s === 'dash' ? 80 : 120) * Math.max(0.65, scale);
      const dx = b.x - a.x, dy = b.y - a.y, d = Math.sqrt(dx * dx + dy * dy) || 1; const f = (d - L) * 0.04 * k;
      if (a.type !== 'core') { a.x += dx / d * f; a.y += dy / d * f; } if (b.type !== 'core') { b.x -= dx / d * f; b.y -= dy / d * f; }
    });
    N.forEach(n => { if (n.type !== 'core') { n.x += (W / 2 - n.x) * 0.004; n.y += (H / 2 - n.y) * 0.004; } });
    collide(6); clamp();
  }
  for (let i = 0; i < 120; i++) { collide(8); clamp(); }
  N.forEach(n => S.pos[n.key] = {x: n.x / W, y: n.y / H});
  return E;
}
function draw2D() {
  const cv = $('#map2d'); const W = Math.max(280, cv.parentElement.clientWidth);
  const g = buildGraph();
  const H = Math.max(W < 600 ? 460 : 520, Math.min(1100, g.nodes.length * (W < 600 ? 34 : 18)));
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  cv.width = W * dpr; cv.height = H * dpr; cv.style.height = H + 'px';
  const ctx = cv.getContext('2d'); ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = '#d9d2c3'; for (let x = 12; x < W; x += 24) for (let y = 12; y < H; y += 24) { ctx.beginPath(); ctx.arc(x, y, 1, 0, 6.3); ctx.fill(); }
  const E = layout(g, W, H, ctx);
  const rc = window.rough ? rough.canvas(cv) : null;
  E.forEach(([a, b, s]) => {
    const o = {stroke: '#1d2030', strokeWidth: s === 'thin' ? 1 : 1.7, roughness: 1.3, seed: hash(a.key + b.key) % 1000 + 1};
    if (s === 'dash') o.strokeLineDash = [6, 6];
    if (rc) rc.line(a.x, a.y, b.x, b.y, o); else { ctx.strokeStyle = '#1d2030'; ctx.lineWidth = o.strokeWidth; ctx.setLineDash(s === 'dash' ? [6, 6] : []); ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke(); ctx.setLineDash([]); }
  });
  g.nodes.forEach(n => {
    const x = n.x - n.w / 2, y = n.y - n.h / 2;
    if (rc) {
      if (n.type === 'core' || n.type === 'hub') rc.ellipse(n.x, n.y, n.w, n.h, {fill: NFILL[n.type], fillStyle: 'solid', stroke: '#1d2030', strokeWidth: 2, roughness: 1.2, seed: hash(n.key) % 1000 + 1});
      else rc.rectangle(x, y, n.w, n.h, {fill: NFILL[n.type] || '#fff', fillStyle: 'solid', stroke: '#1d2030', strokeWidth: 1.5, roughness: 1.1, seed: hash(n.key) % 1000 + 1});
    } else { ctx.fillStyle = NFILL[n.type] || '#fff'; ctx.strokeStyle = '#1d2030'; ctx.lineWidth = 1.5; ctx.fillRect(x, y, n.w, n.h); ctx.strokeRect(x, y, n.w, n.h); }
    ctx.fillStyle = '#1d2030'; ctx.font = `${n.fw} ${n.fs}px Figtree, sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    let t = n.label; while (ctx.measureText(t).width > n.w - ((n.type === 'core' || n.type === 'hub') ? 28 : 14) && t.length > 3) t = t.slice(0, -2) + '…';
    ctx.fillText(t, n.x, n.y + 1);
  });
  const hubs = g.nodes.filter(n => n.type === 'hub').map(n => n.label);
  $('#wallCaption').textContent = g.draft
    ? (hubs.length ? `Your thought connects to themes already in your studio: ${hubs.join(', ')}. Dashed lines show the links.` : 'No overlap with your studio themes yet. That can mean new territory.')
    : `Your studio at a glance. Blue ovals are your recurring themes: ${hubs.join(', ') || 'none yet'}. White is journal, red is pins, yellow is sparks, green is concepts.`;
}

/* ---------- sketch wall: 3D ---------- */
let T = null;
function ensureThree() {
  if (T) return T;
  if (!window.THREE) { $('#wallCaption').textContent = '3D needs a library that did not load. Check your connection and reload the page.'; return null; }
  const box = $('#three');
  const renderer = new THREE.WebGLRenderer({antialias: true, alpha: true});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  box.appendChild(renderer.domElement);
  const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 200);
  const scene = new THREE.Scene();
  scene.add(new THREE.HemisphereLight(0xffffff, 0x8a6238, 0.95));
  const dl = new THREE.DirectionalLight(0xffffff, 0.75); dl.position.set(5, 10, 7); scene.add(dl);
  const root = new THREE.Group(); scene.add(root);
  T = {renderer, camera, scene, root, rotY: 0.5, rotX: 0.25, dist: 16, auto: true, mode: 'const', meshes: []};
  let down = null;
  const el = renderer.domElement;
  el.addEventListener('pointerdown', e => { down = {x: e.clientX, y: e.clientY, sx: e.clientX, sy: e.clientY}; try { el.setPointerCapture(e.pointerId); } catch (er) {} box.style.cursor = 'grabbing'; });
  el.addEventListener('pointermove', e => { if (!down) return; T.rotY += (e.clientX - down.x) * 0.008; T.rotX = Math.max(-1.2, Math.min(1.2, T.rotX + (e.clientY - down.y) * 0.005)); down.x = e.clientX; down.y = e.clientY; });
  el.addEventListener('pointerup', e => { box.style.cursor = 'grab'; if (down && Math.hypot(e.clientX - down.sx, e.clientY - down.sy) < 6) pick3D(e); else if (down && T.mode === 'const') { T.auto = false; $('#spinToggle').textContent = 'Resume spin'; } down = null; });
  el.addEventListener('wheel', e => { e.preventDefault(); T.dist = Math.max(5, Math.min(30, T.dist + Math.sign(e.deltaY))); }, {passive: false});
  new ResizeObserver(() => sizeThree()).observe(box);
  const tick = () => {
    requestAnimationFrame(tick);
    if (S.station !== 'wall' || S.wallMode === 'map2d') return;
    if (T.auto && T.mode === 'const' && !reduceMotion) T.rotY += 0.0025;
    if (T.mode === 'const') { T.root.rotation.set(T.rotX, T.rotY, 0); T.camera.position.set(0, 0, T.dist); T.camera.lookAt(0, 0, 0); }
    else { T.root.rotation.set(0, T.rotY, 0); T.camera.position.set(0, Math.max(1, T.dist * (0.35 + T.rotX * 0.5)), T.dist); T.camera.lookAt(0, 0.6, 0); }
    T.renderer.render(T.scene, T.camera);
  };
  tick();
  return T;
}
function sizeThree() { if (!T) return; const box = $('#three'); const w = box.clientWidth, h = box.clientHeight; if (!w || !h) return; T.renderer.setSize(w, h, false); T.camera.aspect = w / h; T.camera.updateProjectionMatrix(); }
function clearRoot() { while (T.root.children.length) { const c = T.root.children.pop(); c.traverse(o => { if (o.geometry) o.geometry.dispose(); if (o.material) o.material.dispose(); }); } T.meshes = []; }
function pick3D(e) {
  const r = T.renderer.domElement.getBoundingClientRect();
  const v = new THREE.Vector2(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
  const ray = new THREE.Raycaster(); ray.setFromCamera(v, T.camera);
  const hit = ray.intersectObjects(T.meshes, false)[0];
  if (T.mode === 'block') { S.block.sel = hit ? hit.object.userData.idx : -1; buildBlock(); return; }
  $('#wallCaption').textContent = hit ? hit.object.userData.info : 'Drag to spin. Tap a shape to see what it is. Big spheres are your themes; the small shapes are journal entries, pins, sparks and concepts.';
}
function buildConst() {
  if (!ensureThree()) return; clearRoot(); T.mode = 'const'; T.dist = 16; sizeThree();
  const fp = fingerprint().slice(0, 10); const hubs = {}; const n = fp.length || 1;
  fp.forEach(([th, c], i) => {
    const y = 1 - (i + 0.5) / n * 2, rr = Math.sqrt(1 - y * y), phi = i * 2.39996;
    const p = new THREE.Vector3(Math.cos(phi) * rr * 6, y * 4.5, Math.sin(phi) * rr * 6);
    const m = new THREE.Mesh(new THREE.SphereGeometry(0.35 + Math.min(c, 8) * 0.07, 24, 16), new THREE.MeshStandardMaterial({color: PAL[i % PAL.length], roughness: 0.55, flatShading: true}));
    m.position.copy(p); m.userData = {info: `Theme: “${th}”. It shows up in ${c} piece${c > 1 ? 's' : ''} in your studio.`};
    T.root.add(m); T.meshes.push(m); hubs[th] = p;
  });
  creative().slice(0, 70).forEach(it => {
    const ths = itemThemes(it).filter(x => hubs[x]); if (!ths.length) return;
    const c = new THREE.Vector3(); ths.forEach(x => c.add(hubs[x])); c.divideScalar(ths.length);
    const h = hash(it.id); c.add(new THREE.Vector3((h % 100 / 100 - 0.5) * 2.4, ((h >>> 7) % 100 / 100 - 0.5) * 2.4, ((h >>> 14) % 100 / 100 - 0.5) * 2.4));
    const geo = it.kind === 'pin' ? new THREE.OctahedronGeometry(0.22) : it.kind === 'concept' ? new THREE.BoxGeometry(0.34, 0.34, 0.34) : it.kind === 'spark' ? new THREE.TetrahedronGeometry(0.24) : new THREE.IcosahedronGeometry(0.2);
    const m = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({color: KCOL[it.kind], roughness: 0.6, flatShading: true}));
    m.position.copy(c); m.userData = {info: `${KNAME[it.kind]}: ${label(it)}`};
    m.add(new THREE.LineSegments(new THREE.EdgesGeometry(geo), new THREE.LineBasicMaterial({color: 0x1d2030})));
    T.root.add(m); T.meshes.push(m);
    ths.forEach(x => { const lg = new THREE.BufferGeometry().setFromPoints([c, hubs[x]]); T.root.add(new THREE.Line(lg, new THREE.LineBasicMaterial({color: 0x1d2030, transparent: true, opacity: 0.25}))); });
  });
  $('#wallCaption').textContent = 'Drag to spin. Tap a shape to see what it is. Big spheres are your themes; the small shapes are journal entries, pins, sparks and concepts.';
}
const STARTER = [{type: 'plane', x: 0, y: 0, z: 0, s: 1.6, ry: 0, color: '#c8955c'}, {type: 'cylinder', x: -0.8, y: 0.1, z: 0, s: 0.9, ry: 0, color: '#2f5bea'}, {type: 'sphere', x: 0.7, y: 0.1, z: 0.3, s: 0.8, ry: 0, color: '#ffc83a'}];
function makeShape(s) {
  const g = {box: () => new THREE.BoxGeometry(1, 1, 1), sphere: () => new THREE.SphereGeometry(0.6, 20, 14), cylinder: () => new THREE.CylinderGeometry(0.5, 0.5, 1, 20), cone: () => new THREE.ConeGeometry(0.55, 1.1, 20), torus: () => new THREE.TorusGeometry(0.5, 0.18, 12, 28), plane: () => new THREE.BoxGeometry(1.6, 0.08, 1.6)}[s.type] || (() => new THREE.BoxGeometry(1, 1, 1));
  const geo = g(); geo.computeBoundingBox(); const base = -geo.boundingBox.min.y;
  const m = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({color: s.color, roughness: 0.65, flatShading: true}));
  m.scale.setScalar(s.s); m.position.set(s.x, s.y + base * s.s, s.z); m.rotation.y = s.ry;
  m.add(new THREE.LineSegments(new THREE.EdgesGeometry(geo), new THREE.LineBasicMaterial({color: 0x1d2030})));
  return m;
}
function buildBlock() {
  if (!ensureThree()) return; clearRoot(); if (T.mode !== 'block') { T.dist = 9; T.rotX = 0.3; } T.mode = 'block'; sizeThree();
  T.root.add(new THREE.GridHelper(12, 12, 0x1d2030, 0xb08a5c));
  if (!S.block.shapes.length && !S.block.id) S.block.shapes = clean(STARTER);
  S.block.shapes.forEach((s, i) => { const m = makeShape(s); m.userData = {idx: i}; if (i === S.block.sel) { m.material.emissive = new THREE.Color(0x664400); } T.root.add(m); T.meshes.push(m); });
  const sel = S.block.shapes[S.block.sel];
  const con = find(S.block.conceptId);
  $('#wallCaption').textContent = (con ? `Blocking out “${con.title}”. ` : '') + (sel ? `Selected: ${sel.type === 'plane' ? 'slab' : sel.type === 'torus' ? 'ring' : sel.type}. Use the buttons to move, resize, turn or recolour it.` : 'Tap a shape to select it. Drag empty space to walk around the scene.');
}
function blockAct(a) {
  const sh = S.block.shapes, s = sh[S.block.sel];
  if (!s) return notice('Tap a shape in the 3D view to select it first.');
  const st = 0.5;
  ({left: () => s.x -= st, right: () => s.x += st, fwd: () => s.z -= st, back: () => s.z += st, up: () => s.y += st, down: () => s.y = Math.max(0, s.y - st),
    bigger: () => s.s = Math.min(6, s.s * 1.2), smaller: () => s.s = Math.max(0.2, s.s / 1.2), turn: () => s.ry += Math.PI / 8,
    colour: () => s.color = PAL[(PAL.indexOf(s.color) + 1) % PAL.length], copy: () => { sh.push({...s, x: s.x + 1}); S.block.sel = sh.length - 1; },
    remove: () => { sh.splice(S.block.sel, 1); S.block.sel = -1; }}[a] || (() => {}))();
  buildBlock();
}
function renderBlockSelects() {
  const cs = withEx('concept');
  $('#blockConcept').innerHTML = '<option value="">No concept yet</option>' + cs.map(c => `<option value="${esc(c.id)}">${esc(clip(c.title, 40))}${c.example ? ' (example)' : ''}</option>`).join('');
  $('#blockConcept').value = find(S.block.conceptId) ? S.block.conceptId : '';
  const bs = mine('blockout');
  $('#blockLoad').innerHTML = '<option value="">' + (bs.length ? 'Choose one' : 'None saved yet') + '</option>' + bs.map(b => `<option value="${esc(b.id)}">${esc(clip(b.name || 'Untitled blockout', 40))}</option>`).join('');
}
function setWallMode(m) {
  S.wallMode = m;
  $$('[data-wm]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.wm === m)));
  $('#map2d').hidden = m !== 'map2d'; $('#three').hidden = m === 'map2d';
  $('#wallThink').hidden = m !== 'map2d'; $('#blockTools').hidden = m !== 'block'; $('#zoomRow').hidden = m === 'map2d';
  $('#spinToggle').hidden = m !== 'const';
  if (m === 'map2d') (document.fonts ? document.fonts.ready : Promise.resolve()).then(draw2D);
  else if (m === 'const') buildConst();
  else { renderBlockSelects(); buildBlock(); }
}

/* ---------- mirror ---------- */
function drawMirror() {
  const fp = fingerprint().slice(0, 10);
  const cv = $('#fp'); const size = Math.max(200, cv.clientWidth || 300); const dpr = Math.min(2, window.devicePixelRatio || 1);
  cv.width = size * dpr; cv.height = size * dpr; const ctx = cv.getContext('2d'); ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, size, size);
  const c = size / 2, max = fp.length ? fp[0][1] : 1;
  fp.forEach(([t, n], i) => {
    const r = size * 0.08 + i * (size * 0.3 / Math.max(fp.length - 1, 1)); const sd = hash(t); const amp = 2 + (n / max) * 5;
    ctx.beginPath();
    for (let a = 0; a <= Math.PI * 2 + 0.05; a += 0.04) {
      const rr = r + Math.sin(a * (3 + sd % 4) + sd % 7) * amp * 0.6 + Math.sin(a * 7 + (sd >>> 4) % 9) * amp * 0.35;
      const x = c + Math.cos(a) * rr, y = c + Math.sin(a) * rr * 1.1;
      a === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.closePath(); ctx.strokeStyle = PAL[i % PAL.length]; ctx.lineWidth = 2 + (n / max) * 6; ctx.lineJoin = 'round'; ctx.stroke();
  });
  $('#fpLegend').innerHTML = fp.map(([t, n], i) => `<li><span class="sw" style="background:${PAL[i % PAL.length]}"></span><span class="nm">${esc(t)}<span class="bar" style="width:${Math.round(n / max * 100)}%;background:${PAL[i % PAL.length]}"></span></span><span class="ct">${n}</span></li>`).join('') || '<li>Add journal entries and pins to grow your fingerprint.</li>';
  const ents = withEx('entry'); const mc = {physical: 0, digital: 0, mixed: 0}; ents.forEach(e => { if (mc[e.medium] !== undefined) mc[e.medium]++; });
  const tot = (mc.physical + mc.digital + mc.mixed) || 1; const mcol = {physical: '#ffc83a', digital: '#2f5bea', mixed: '#ff8fc8'};
  $('#mix').innerHTML = `<div class="mix-bar" role="img" aria-label="Physical ${mc.physical}, digital ${mc.digital}, mixed ${mc.mixed}">${Object.keys(mc).map(k => `<span style="width:${mc[k] / tot * 100}%;background:${mcol[k]}"></span>`).join('')}</div><div class="row">${Object.keys(mc).map(k => `<span class="chip"><span class="sw" style="display:inline-block;width:10px;height:10px;border-radius:3px;background:${mcol[k]};border:1px solid #1d2030"></span>${cap(k)} ${Math.round(mc[k] / tot * 100)}%</span>`).join('')}</div>`;
  const sp = $('#spark'); const w = Math.max(200, sp.clientWidth || 300), h = 90; sp.width = w * dpr; sp.height = h * dpr; const sx = sp.getContext('2d'); sx.setTransform(dpr, 0, 0, dpr, 0, 0); sx.clearRect(0, 0, w, h);
  const es = ents.slice().sort((a, b) => a.created - b.created).filter(e => e.energy).slice(-30).map(e => e.energy);
  sx.strokeStyle = '#e6dccb'; sx.lineWidth = 1; [1, 3, 5].forEach(v => { const y = h - 8 - (v - 1) / 4 * (h - 16); sx.beginPath(); sx.moveTo(0, y); sx.lineTo(w, y); sx.stroke(); });
  if (es.length > 1) {
    const pts = es.map((v, i) => [8 + i / (es.length - 1) * (w - 16), h - 8 - (v - 1) / 4 * (h - 16)]);
    sx.beginPath(); pts.forEach((p, i) => i ? sx.lineTo(p[0], p[1]) : sx.moveTo(p[0], p[1])); sx.lineTo(pts[pts.length - 1][0], h); sx.lineTo(pts[0][0], h); sx.closePath(); sx.fillStyle = 'rgba(255,91,79,.15)'; sx.fill();
    sx.beginPath(); pts.forEach((p, i) => i ? sx.lineTo(p[0], p[1]) : sx.moveTo(p[0], p[1])); sx.strokeStyle = '#ff5b4f'; sx.lineWidth = 2.5; sx.stroke();
    const l = pts[pts.length - 1]; sx.beginPath(); sx.arc(l[0], l[1], 4.5, 0, 6.3); sx.fillStyle = '#1d2030'; sx.fill();
  }
  const cs = withEx('concept');
  $('#stageCounts').innerHTML = STAGES.map((s, i) => `<span class="chip">${s}: ${cs.filter(c => !c.composted && (c.stage || 0) === i).length}</span>`).join('') + `<span class="chip">Compost: ${cs.filter(c => c.composted).length}</span>`;
  renderReading(); renderCrit();
}
function renderReading() {
  const rs = mine('reading');
  const r = rs[0];
  if (!r) { $('#reading').innerHTML = '<p class="hint">No reading yet. Add a few entries and pins, then ask for one. Readings get sharper as your studio fills up.</p>'; }
  else {
    $('#reading').innerHTML = `${(r.threads || []).map(t => `<article class="card"><h3>${esc(t.name)}</h3><p>${esc(t.evidence)}</p></article>`).join('')}
      ${r.avoiding ? `<article class="card"><h3>What you might be avoiding</h3><p>${esc(r.avoiding)}</p></article>` : ''}
      ${r.tension ? `<article class="card"><h3>A useful tension</h3><p>${esc(r.tension)}</p></article>` : ''}
      ${r.stretch ? `<article class="card concept"><h3>Stretch experiment</h3><p>${esc(r.stretch)}</p></article>` : ''}`;
  }
  $('#statements').innerHTML = rs.filter(x => x.statement).map((x, i) => i === 0 ? `<li><div class="stack"><span class="date">${fmtDate(x.created)} · latest</span><p class="statement">${esc(x.statement)}</p></div></li>` : `<li><span class="date">${fmtDate(x.created)}</span> ${esc(x.statement)}</li>`).join('') || '<li class="hint">Your first artist statement will appear here after a reading.</li>';
}
async function readFingerprint() {
  const btn = $('#readBtn');
  const items = creative();
  if (!S.sample) {
    const fp = fingerprint().slice(0, 3).map(e => e[0]);
    put({id: nid('r'), kind: 'reading', created: Date.now(), local: true, threads: fp.map(t => ({name: cap(t), evidence: `“${t}” keeps returning across your journal and pins.`})), stretch: `Make one piece in a medium you have not used yet, about ${fp[0] || 'what you noticed today'}.`, statement: `I make work about ${fp.slice(0, 2).join(' and ') || 'small things people overlook'}, using play to slow people down.`});
    return notice('Claude is away, so this is a simple reading made from your theme counts.');
  }
  btn.disabled = true; btn.lastChild.textContent = 'Reading…';
  const opts = {modelTier: 'complex'};
  const imgs = items.filter(x => x.kind === 'pin' && x.ptype === 'image' && isImg(x.img)).slice(0, 4);
  if (imgs.length && S.imgOK) opts.images = imgs.map(x => toBlob(x.img));
  const prev = mine('reading').find(x => x.statement);
  try {
    const v = await S.sample.json(`You are a perceptive studio mentor helping Jed find his artistic voice. Read everything in his maker's studio below${opts.images ? ' (some of his image pins are attached)' : ''} and reflect back what you see. Be specific and point to his own material as evidence. Be honest, not flattering. Plain language, no em dashes.\n\nTheme counts: ${fingerprint().slice(0, 12).map(([t, n]) => t + ' ' + n).join(', ')}\n\nStudio contents (newest first):\n${items.slice(0, 40).map(x => `- (${KNAME[x.kind]}, ${fmtDate(x.created)}) ${clip(bodyText(x), 300)}`).join('\n')}\n${prev ? `\nHis previous artist statement: ${prev.statement}\n` : ''}\nReturn only JSON: {"threads":[{"name":"2 to 4 words","evidence":"one or two sentences pointing at his material"}] (exactly 3), "avoiding":"one or two sentences on what he seems to circle but not commit to", "tension":"one sentence on a productive contradiction in his work", "stretch":"one concrete experiment for the next two weeks", "statement":"a first-person artist statement in 2 or 3 sentences that sounds like a person, not a press release${prev ? ', evolved from the previous one' : ''}"}`, opts);
    if (v && (v.threads || v.statement)) {
      put({id: nid('r'), kind: 'reading', created: Date.now(), threads: (v.threads || []).slice(0, 3).map(t => ({name: String(t.name || ''), evidence: String(t.evidence || '')})), avoiding: String(v.avoiding || ''), tension: String(v.tension || ''), stretch: String(v.stretch || ''), statement: String(v.statement || '')});
    }
  } catch (e) { aiErr(e); }
  btn.disabled = false; btn.lastChild.textContent = 'Read my fingerprint';
}

/* ---------- v2: playground ---------- */
const DAILY = [
  'Build a tiny monument to something you lost this year, using only paper.',
  'Draw the same object five times, each with a different tool.',
  'Photograph ten things that are the same colour within five metres of you.',
  'Make a map of a place that only exists in a dream you remember.',
  'Write a game with exactly one rule and play it for two minutes.',
  'Make a mask from whatever packaging is in the bin.',
  'Record thirty seconds of sound and draw what it looks like.',
  'Make a portrait of someone using only shapes, no faces.',
  'Rearrange the objects on your desk into a small sculpture and photograph it.',
  'Write a six-word story and turn it into a tiny poster.',
  'Draw with your non-dominant hand for the full ten minutes.',
  'Make something that only makes sense when it is upside down.',
  'Fold a single sheet of paper into the most interesting object you can.',
  'Invent a new tarot-style card for a feeling you had this week.',
  'Collage a creature from torn magazine or screenshot scraps.',
  'Make a ten-frame flipbook in the corner of a notebook.',
  'Design a sign for a shop that sells something impossible.',
  'Trace shadows on paper and turn them into characters.',
  'Make a pattern from the shapes in a hawker centre menu.',
  'Build the smallest possible playground for an ant.',
  'Write instructions for an artwork that someone else would make.',
  'Draw the sound of rain using only dots.',
  'Make a costume piece for an object, then photograph it wearing it.',
  'Paint or draw a colour you cannot name.',
  'Make an artwork that has to be finished by the next person who sees it.',
  'Turn a receipt into a piece of art.',
  'Design a board game square that would change a player\'s life.',
  'Sketch the view from your window as if it were a hundred years from now.',
  'Make a stamp from an eraser or potato and print a pattern.',
  'Create a creature that lives inside a household appliance.',
  'Make a list poem of everything you touched today.'
];
const WHEEL = ['Sculpture','Zine','Drawing','Photo','Code art','Installation','Game','Performance','Textile','Sound','Collage','Clay'];
const WORSE_LOCAL = [
  {title: 'Make it huge and clumsy', how: 'Scale it up ten times and use the cheapest, floppiest material you can find.'},
  {title: 'Remove your favourite part', how: 'Take away the one element you love most and see what is left standing.'},
  {title: 'Make it for the wrong audience', how: 'Redesign it for someone who would hate the original. What changes?'},
  {title: 'Do it badly on purpose', how: 'Use your non-dominant hand and a timer of three minutes.'},
  {title: 'Make it beige', how: 'Strip out all colour and every bit of charm. Then notice what you miss most.'}
];
const CORPSE = {creature: ['head', 'body', 'legs'], object: ['top', 'middle', 'base'], story: ['beginning', 'middle', 'end'], place: ['sky', 'ground', 'underground']};
const CORPSE_LOCAL = {
  head: ['Its head is a lantern full of moths that hum old radio jingles.', 'A head shaped like a kettle, steam rising whenever it remembers something.'],
  body: ['The body is a wicker basket stitched with fishing line, holding a single warm egg.', 'A body made of stacked library books, spines cracking when it breathes.'],
  legs: ['It walks on six umbrella handles that open in the rain.', 'Two roller skates and one stubborn chopstick carry it everywhere.'],
  top: ['On top sits a tiny brass bell that only rings for strangers.', 'The top is a glass dome holding a single grain of rice.'],
  middle: ['The middle is a drawer that opens onto a different room each time.', 'In the middle, a clock face with the numbers rearranged by mood.'],
  base: ['The base is a block of salt slowly being licked away by the weather.', 'It rests on four dominoes that never quite fall.'],
  beginning: ['The night market closed, but one stall kept its lights on for someone who never came.', 'A boy found a key frozen inside an ice kacang.'],
  sky: ['The sky is stitched from bus tickets, fluttering whenever someone forgets their stop.', 'Above, clouds drift in the shape of handwriting.'],
  ground: ['The ground is soft as bread and keeps footprints for exactly one day.', 'Down here the pavement tiles hum when you step on the blue ones.'],
  underground: ['Underground, the roots of every tree spell out the names of people who planted them.', 'Beneath it all runs a river of lost buttons.'],
  end: ['In the end, the light stayed on, and that was enough.', 'They never found the door, but they built a window instead.']
};
const STICKERS = [
  {id: 'first', name: 'First mess', desc: 'Log any warm-up', test: d => d.plays.length >= 1},
  {id: 'timer', name: 'Beat the clock', desc: 'Finish a ten-minute timer and log it', test: d => d.plays.some(p => p.timed)},
  {id: 'roulette', name: 'Spun the wheel', desc: 'Log a roulette warm-up', test: d => d.plays.some(p => p.type === 'roulette')},
  {id: 'worse', name: 'Proudly worse', desc: 'Finish a Make It Worse', test: d => d.plays.some(p => p.type === 'worse')},
  {id: 'corpse', name: 'Folded friend', desc: 'Finish an exquisite corpse', test: d => d.plays.some(p => p.type === 'corpse')},
  {id: 'hopper', name: 'Medium hopper', desc: 'Warm up in 3 different media', test: d => new Set(d.plays.map(p => p.medium).filter(Boolean)).size >= 3},
  {id: 'ten', name: 'Ten tries', desc: 'Log 10 warm-ups', test: d => d.plays.length >= 10},
  {id: 'streak3', name: 'Three in a row', desc: 'Warm up 3 days running', test: d => d.streak >= 3},
  {id: 'streak7', name: 'Week of play', desc: 'Warm up 7 days running', test: d => d.streak >= 7},
  {id: 'compost', name: 'Let it go', desc: 'Compost an idea', test: d => d.composted >= 1},
  {id: 'revive', name: 'Second life', desc: 'Revive something from the compost', test: d => d.revived >= 1},
  {id: 'hung', name: 'On the wall', desc: 'Hang a piece in the gallery', test: d => d.pieces >= 1}
];
const dayKey = t => { const d = new Date(t); return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate(); };
function streakDays(plays) {
  const days = new Set(plays.map(p => dayKey(p.created))); let n = 0; const d = new Date();
  if (!days.has(dayKey(d))) d.setDate(d.getDate() - 1);
  while (days.has(dayKey(d))) { n++; d.setDate(d.getDate() - 1); }
  return n;
}
S.dailyOffset = 0; S.wheel = {ang: 0, spinning: false, result: ''}; S.log = null; S.logPhoto = ''; S.corpse = {mode: 'creature', parts: [], open: false, busy: false}; S.piecePhoto = '';
const dailyPrompt = () => { const d = new Date(); const n = Math.floor(new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime() / 864e5); return DAILY[(n + S.dailyOffset) % DAILY.length]; };

const TM = {total: 600, left: 600, run: false, at: 0, iv: 0, done: false, ac: null};
function drawTimer() {
  const cv = $('#timerRing'); const s = 120, dpr = Math.min(2, window.devicePixelRatio || 1);
  cv.width = s * dpr; cv.height = s * dpr; cv.style.width = s + 'px'; cv.style.height = s + 'px';
  const x = cv.getContext('2d'); x.setTransform(dpr, 0, 0, dpr, 0, 0); x.clearRect(0, 0, s, s);
  x.lineWidth = 12; x.strokeStyle = '#efe6d6'; x.beginPath(); x.arc(60, 60, 50, 0, 6.3); x.stroke();
  const f = TM.left / TM.total; x.strokeStyle = TM.left < 60 ? '#ff5b4f' : '#2f5bea'; x.lineCap = 'round';
  x.beginPath(); x.arc(60, 60, 50, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * f); x.stroke();
  x.fillStyle = '#ffc83a'; x.strokeStyle = '#1d2030'; x.lineWidth = 2; x.beginPath(); x.arc(60, 60, 18, 0, 6.3); x.fill(); x.stroke();
  const m = Math.floor(TM.left / 60), sec = Math.floor(TM.left % 60);
  $('#timerText').textContent = `${m}:${String(sec).padStart(2, '0')}`;
}
function chime() { try { const ac = TM.ac; if (!ac) return; [523, 659, 784].forEach((f, i) => { const o = ac.createOscillator(), g = ac.createGain(); o.frequency.value = f; o.type = 'triangle'; g.gain.setValueAtTime(0.0001, ac.currentTime + i * 0.18); g.gain.exponentialRampToValueAtTime(0.25, ac.currentTime + i * 0.18 + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + i * 0.18 + 0.5); o.connect(g).connect(ac.destination); o.start(ac.currentTime + i * 0.18); o.stop(ac.currentTime + i * 0.18 + 0.55); }); } catch (e) {} }
function timerToggle() {
  if (!TM.ac) { try { TM.ac = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) {} }
  if (TM.run) { TM.run = false; clearInterval(TM.iv); $('#timerStart').lastChild.textContent = 'Resume'; return; }
  if (TM.left <= 0) { TM.left = TM.total; TM.done = false; }
  TM.run = true; TM.at = Date.now(); $('#timerStart').lastChild.textContent = 'Pause';
  TM.iv = setInterval(() => {
    const now = Date.now(); TM.left = Math.max(0, TM.left - (now - TM.at) / 1000); TM.at = now; drawTimer();
    if (TM.left <= 0) { TM.run = false; TM.done = true; clearInterval(TM.iv); $('#timerStart').lastChild.textContent = 'Start again'; chime(); notice('Time. Log what you made, however rough.'); }
  }, 250);
}
function timerReset() { TM.run = false; clearInterval(TM.iv); TM.left = TM.total; TM.done = false; $('#timerStart').lastChild.textContent = 'Start'; drawTimer(); }

function drawWheel() {
  const cv = $('#wheel'); const s = Math.max(200, Math.min(300, cv.clientWidth || 280)); const dpr = Math.min(2, window.devicePixelRatio || 1);
  cv.width = s * dpr; cv.height = s * dpr; const x = cv.getContext('2d'); x.setTransform(dpr, 0, 0, dpr, 0, 0); x.clearRect(0, 0, s, s);
  const c = s / 2, r = s / 2 - 14, seg = Math.PI * 2 / WHEEL.length;
  WHEEL.forEach((w, i) => {
    const a0 = S.wheel.ang + i * seg;
    x.beginPath(); x.moveTo(c, c); x.arc(c, c, r, a0, a0 + seg); x.closePath();
    x.fillStyle = ['#2f5bea','#ffc83a','#ff5b4f','#1fae7a','#ff8fc8','#dde6ff'][i % 6]; x.fill(); x.strokeStyle = '#1d2030'; x.lineWidth = 2; x.stroke();
    x.save(); x.translate(c, c); x.rotate(a0 + seg / 2); x.textAlign = 'right'; x.textBaseline = 'middle';
    x.fillStyle = ['#ffffff','#1d2030','#1d2030','#1d2030','#1d2030','#1d2030'][i % 6]; x.font = `700 ${s < 260 ? 11 : 12.5}px Figtree, sans-serif`;
    x.fillText(w, r - 10, 0); x.restore();
  });
  x.beginPath(); x.arc(c, c, 20, 0, 6.3); x.fillStyle = '#fffdf7'; x.fill(); x.lineWidth = 2; x.stroke();
  x.beginPath(); x.moveTo(c - 11, 2); x.lineTo(c + 11, 2); x.lineTo(c, 26); x.closePath(); x.fillStyle = '#1d2030'; x.fill();
}
function spinWheel() {
  if (S.wheel.spinning) return; S.wheel.spinning = true; $('#spinBtn').disabled = true;
  const start = S.wheel.ang, target = start + Math.PI * 6 + Math.random() * Math.PI * 2, dur = reduceMotion ? 1 : 2600, t0 = performance.now();
  const step = now => {
    const k = Math.min(1, (now - t0) / dur); const e = 1 - Math.pow(1 - k, 3);
    S.wheel.ang = start + (target - start) * e; drawWheel();
    if (k < 1) return requestAnimationFrame(step);
    S.wheel.spinning = false; $('#spinBtn').disabled = false;
    const seg = Math.PI * 2 / WHEEL.length; const rel = (((-Math.PI / 2 - S.wheel.ang) % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
    const m = WHEEL[Math.floor(rel / seg)];
    const th = (fingerprint()[Math.floor(Math.random() * Math.min(5, fingerprint().length))] || ['something you noticed today'])[0];
    S.wheel.result = m;
    S.wheel.prompt = pick([`Make a ten-minute ${m.toLowerCase()} study about “${th}”.`, `Use ${m.toLowerCase()} to show “${th}” without using any words.`, `Make the smallest possible ${m.toLowerCase()} piece about “${th}”.`]);
    $('#wheelResult').textContent = `${m}. ${S.wheel.prompt}`; $('#logRoulette').disabled = false;
  };
  requestAnimationFrame(step);
}
function renderWorseSel() {
  const opts = [...withEx('concept').filter(c => !c.composted), ...withEx('entry'), ...withEx('pin')].slice(0, 40);
  const cur = $('#worseSel').value;
  $('#worseSel').innerHTML = opts.map(it => `<option value="${esc(it.id)}">${esc(KNAME[it.kind] + ': ' + clip(label(it), 50))}</option>`).join('');
  if (cur && find(cur)) $('#worseSel').value = cur;
}
async function makeWorse() {
  const it = find($('#worseSel').value); if (!it) return;
  const btn = $('#worseBtn'); btn.disabled = true; btn.textContent = 'Breaking it…';
  let vs = null;
  if (S.sample) {
    try { const v = await S.sample.json(`Jed is warming up in his maker's studio with a "make it worse" exercise, to loosen his grip on good taste. Here is something he cares about: ${bodyText(it)}\nGive 3 specific, funny, makeable ways to make it deliberately worse, each doable in ten minutes. Plain language, no em dashes. Return only JSON {"versions":[{"title":"3 to 6 words","how":"one sentence"}]}`, {modelTier: 'quick'}); vs = v && Array.isArray(v.versions) ? v.versions.filter(x => x && x.title).slice(0, 3) : null; } catch (e) { aiErr(e, true); }
  }
  if (!vs || !vs.length) vs = WORSE_LOCAL.slice().sort(() => Math.random() - 0.5).slice(0, 3);
  S.worse = {src: it.id, vs};
  $('#worseOut').innerHTML = vs.map((v, i) => `<article class="card"><h3>${esc(v.title)}</h3><p>${esc(v.how)}</p><div class="actions"><button class="btn btn-sm btn-yellow" type="button" data-worse="${i}">Try this one</button></div></article>`).join('');
  btn.disabled = false; btn.textContent = 'Make it worse again';
}
const lastLine = t => { const s = String(t || '').trim().split(/(?<=[.!?])\s+/).filter(Boolean); return s.length ? s[s.length - 1] : ''; };
function renderCorpse() {
  const c = S.corpse; const parts = CORPSE[c.mode]; const box = $('#corpseBox');
  $('#corpseMode').disabled = c.parts.length > 0;
  let h = '';
  if (c.open) {
    h += c.parts.map((p, i) => `<div class="strip"><span class="who">${esc(cap(parts[i]))} · by ${p.by === 'me' ? 'you' : 'Claude'}</span><p>${esc(p.text)}</p></div>`).join('');
    h += `<div class="row"><button class="btn btn-sm btn-blue" type="button" id="corpseSave">Save to the playground</button><button class="btn btn-sm" type="button" id="corpseSpark">Keep as spark</button><button class="btn btn-sm" type="button" id="corpseReset">Start over</button></div>`;
  } else {
    h += c.parts.map((p, i) => `<div class="strip folded"><span class="who">${esc(cap(parts[i]))} · folded · by ${p.by === 'me' ? 'you' : 'Claude'}</span><p class="hand">…${esc(lastLine(p.text))}</p></div>`).join('');
    const i = c.parts.length;
    if (i >= parts.length) h += `<div class="row"><button class="btn btn-yellow" type="button" id="corpseOpen">Unfold the paper</button></div>`;
    else if (i === 1) h += `<p class="caption">${c.busy ? 'Claude is writing the ' + parts[1] + ', seeing only your last line…' : 'Claude\'s turn.'}</p>`;
    else h += `<div class="field"><label for="corpseIn">Write the ${parts[i]} in a sentence or two${i ? '. You can only see the edge above' : ''}.</label><textarea id="corpseIn" rows="3"></textarea></div><div class="row"><button class="btn btn-blue" type="button" id="corpseFold">Fold it over</button></div>`;
  }
  box.innerHTML = h;
}
async function corpseClaude() {
  const c = S.corpse; const parts = CORPSE[c.mode]; c.busy = true; renderCorpse();
  const edge = lastLine(c.parts[0].text); let text = '';
  if (S.sample) { try { const r = await S.sample(`We are playing exquisite corpse to invent ${c.mode === 'story' ? 'a tiny story' : 'a ' + c.mode}. The previous player folded the paper so you can only see their last line: "${edge}". Write the ${parts[1]} in two vivid, concrete, surprising sentences that connect to that edge. No em dashes. Reply with only the two sentences.`, {modelTier: 'quick', cache: false}); text = (r && r.text || '').trim(); } catch (e) { aiErr(e, true); } }
  if (!text) text = pick(CORPSE_LOCAL[parts[1]] || CORPSE_LOCAL.middle);
  c.parts.push({by: 'claude', text}); c.busy = false; renderCorpse();
}
function openLog(type, prompt, medium) {
  S.log = {type, prompt, medium: medium || '', timed: type === 'challenge' && TM.done};
  const titles = {challenge: 'Log today\'s challenge', roulette: 'Log your roulette study', worse: 'Log your worse version', corpse: 'Log the corpse'};
  $('#logTitle').textContent = titles[type] || 'Log a warm-up'; $('#logPrompt').textContent = prompt;
  $('#logForm').hidden = false; $('#logMade').focus(); $('#logForm').scrollIntoView({behavior: reduceMotion ? 'auto' : 'smooth', block: 'center'});
}
function saveLog() {
  if (!S.log) return; const made = $('#logMade').value.trim();
  if (!made && !S.logPhoto) return notice('Say a word about what you made, or attach a photo.');
  const p = {id: nid('g'), kind: 'play', created: Date.now(), type: S.log.type, prompt: S.log.prompt, medium: S.log.medium, made, photo: S.logPhoto, feel: $('#logFeel').value, timed: !!S.log.timed};
  if (S.log.parts) p.parts = S.log.parts;
  p.themes = localThemes(made + ' ' + p.prompt, 3);
  const before = earned().length; put(p);
  $('#logMade').value = ''; S.logPhoto = ''; $('#logPhoto').value = ''; $('#logPhotoName').textContent = ''; $('#logForm').hidden = true; S.log = null;
  if (S.wheel.result && p.type === 'roulette') { $('#logRoulette').disabled = true; }
  if (p.type === 'challenge') timerReset();
  const now = earned(); notice(now.length > before ? `Logged. New sticker: ${now[now.length - 1].name}!` : 'Logged. That counts.');
  enrich(p.id);
}
function stickerData() {
  const plays = mine('play'); const cs = mine('concept');
  return {plays, streak: streakDays(plays), composted: cs.filter(c => c.composted || c.compostedAt).length, revived: cs.filter(c => c.revived).length, pieces: mine('piece').length};
}
const earned = () => { const d = stickerData(); return STICKERS.filter(s => s.test(d)); };
function renderPlayground() {
  const d = stickerData(); const got = new Set(earned().map(s => s.id));
  $('#streakRow').innerHTML = `<span class="chip ${d.streak ? 'ok' : ''}">${d.streak ? d.streak + '-day streak' : 'No streak yet. Today is a good day.'}</span><span class="chip">${got.size} of ${STICKERS.length} stickers</span>`;
  $('#stickers').innerHTML = STICKERS.map((s, i) => `<div class="sticker ${got.has(s.id) ? 'got' : ''}" style="--sc:${['#ffc83a','#dde6ff','#ffe4f2','#d6f5e9','#ffe1dd'][i % 5]};--rot:${((hash(s.id) % 7) - 3)}deg">${got.has(s.id) ? '<img src="assets/icons/party_popper.webp" alt="" width="34" height="34">' : '<span class="dot" aria-hidden="true"></span>'}<b>${esc(s.name)}</b><small>${esc(s.desc)}</small><span class="vh">${got.has(s.id) ? 'Earned' : 'Not earned yet'}</span></div>`).join('');
  const plays = mine('play').slice(0, 12);
  const TN = {challenge: 'Daily challenge', roulette: 'Roulette', worse: 'Made it worse', corpse: 'Exquisite corpse'};
  $('#playList').innerHTML = plays.length ? plays.map(p => `<article class="card" data-id="${esc(p.id)}"><div class="card-top"><span class="date">${fmtDate(p.created)}</span><span class="chip m-mixed">${esc(TN[p.type] || 'Warm-up')}</span>${p.medium ? `<span class="chip">${esc(p.medium)}</span>` : ''}<span class="chip">${esc(p.feel || '')}</span>${p.timed ? '<span class="chip ok">Beat the clock</span>' : ''}</div><p class="hand prompt-echo">${esc(p.prompt)}</p>${p.made ? `<p class="wrap-text">${esc(p.made)}</p>` : ''}${isImg(p.photo) ? `<img class="thumb" src="${esc(p.photo)}" alt="Photo of this warm-up">` : ''}<div class="actions">${actBtn('scrap', S.scraps.includes(p.id) ? 'In the Idea Machine' : 'Send to Idea Machine')}${actBtn('del', 'Delete')}</div></article>`).join('') : '<p class="hint">Your warm-ups land here. Try the daily challenge with the timer running.</p>';
  $('#dailyText').textContent = dailyPrompt();
  renderWorseSel();
}

/* ---------- v2: gallery + compost ---------- */
const EX2 = [
  {id: 'expc1', kind: 'piece', example: true, created: T0 - 0.3 * 864e5, title: 'Jar Study No. 1', medium: 'Photography', conceptId: 'exc1', shown: 'Shared with two friends', reflection: 'The street looked better upside down than the right way up.'},
  {id: 'exc2', kind: 'concept', example: true, composted: true, compostedAt: T0 - 12 * 864e5, created: T0 - 20 * 864e5, stage: 0, title: 'Silent Karaoke', premise: 'A karaoke booth with the sound off, where people perform songs only with their faces.', medium: 'Performance', themes: ['silence', 'play', 'performance']},
  {id: 'exc3', kind: 'concept', example: true, composted: true, compostedAt: T0 - 2 * 864e5, created: T0 - 4 * 864e5, stage: 0, title: 'Receipt Weather', premise: 'Weekly receipts cut into cloud shapes, hung as a mobile that shows how a week felt.', medium: 'Installation', themes: ['ritual', 'small worlds', 'paper']}
];
EX.push(...EX2);
function trailOf(piece) {
  const steps = []; const c = find(piece.conceptId);
  if (c) { steps.push(c); (c.sources || []).map(find).filter(Boolean).forEach(s => steps.push(s)); }
  return steps;
}
function frameArt(id) { const h = hash(id); const a = PAL[h % 6], b = PAL[(h >>> 3) % 6], c2 = PAL[(h >>> 6) % 6]; return `<div class="frame-art" aria-hidden="true" style="background:radial-gradient(circle at ${20 + h % 60}% ${20 + (h >>> 4) % 60}%, ${a} 0 18%, transparent 19%),conic-gradient(from ${h % 360}deg at 60% 55%, ${b}, ${c2}, ${b})"></div>`; }
function renderGallery() {
  const ps = withEx('piece');
  $('#galleryWall').innerHTML = ps.map(p => {
    const tr = trailOf(p);
    return `<article class="frame ${p.example ? 'is-ex' : ''}" data-id="${esc(p.id)}">
      ${isImg(p.photo) ? `<img src="${esc(p.photo)}" alt="${esc(p.title)}">` : frameArt(p.id)}
      ${p.example ? '<span class="chip chip-ex">Example</span>' : ''}
      <h3>${esc(p.title)}</h3>
      <p class="kv"><b>${esc(p.medium || '')}</b> · ${fmtDate(p.created)}${p.shown ? ' · ' + esc(p.shown) : ''}</p>
      ${p.reflection ? `<p class="hand">${esc(p.reflection)}</p>` : ''}
      ${tr.length ? `<div class="trail" aria-label="Where this piece came from"><span class="lbl">Trail</span>${tr.map((s, i) => `${i ? '<span class="arrow" aria-hidden="true">←</span>' : ''}<span class="tag">${esc(KNAME[s.kind] + ': ' + clip(label(s), 28))}</span>`).join('')}</div>` : ''}
      <div class="actions">${actBtn('talk', 'Talk about it')}${p.example ? '' : actBtn('del', 'Delete')}</div>
    </article>`;
  }).join('');
  const cs = withEx('concept');
  $('#pcConcept').innerHTML = '<option value="">Not from a concept</option>' + cs.map(c => `<option value="${esc(c.id)}">${esc(clip(c.title, 40))}${c.example ? ' (example)' : ''}</option>`).join('');
  renderCompost();
}
function openPieceForm(concept) {
  $('#pieceForm').hidden = false;
  $('#pcTitle').value = concept ? concept.title : ''; $('#pcConcept').value = concept ? concept.id : '';
  if (concept && concept.medium) { const m = MEDIA.slice(1).find(x => x.toLowerCase() === String(concept.medium).toLowerCase()); if (m) $('#pcMedium').value = m; }
  $('#pcTitle').focus();
}
function savePiece() {
  const title = $('#pcTitle').value.trim(); if (!title) return notice('Give the piece a title, even a working one.');
  const p = {id: nid('w'), kind: 'piece', created: Date.now(), title, medium: $('#pcMedium').value, conceptId: $('#pcConcept').value, shown: $('#pcShown').value.trim(), reflection: $('#pcReflect').value.trim(), photo: S.piecePhoto};
  p.themes = (find(p.conceptId) || {}).themes || localThemes(title + ' ' + p.reflection, 3);
  put(p);
  const c = find(p.conceptId); if (c && !c.example && (c.stage || 0) < 3) { c.stage = 3; put(c); }
  ['#pcTitle', '#pcShown', '#pcReflect'].forEach(s => $(s).value = ''); S.piecePhoto = ''; $('#pcPhoto').value = ''; $('#pcPhotoName').textContent = ''; $('#pieceForm').hidden = true;
  notice('Hung on the wall.');
}
function decay(c) { const days = (Date.now() - (c.compostedAt || c.created)) / 864e5; return days < 3 ? ['fresh', 'Fresh scraps'] : days < 14 ? ['breaking', 'Breaking down'] : ['soil', 'Rich soil']; }
const compostList = () => withEx('concept').filter(c => c.composted);
function renderCompost() {
  const list = compostList();
  $('#compostHeap').innerHTML = list.length ? list.map(c => { const [cls, nm] = decay(c); return `<article class="card ${cls} ${c.example ? 'is-ex' : ''}" data-id="${esc(c.id)}"><div class="card-top"><span class="chip">${nm}</span>${c.example ? '<span class="chip chip-ex">Example</span>' : ''}</div><h3>${esc(c.title)}</h3><p class="mini">${esc(clip(c.premise, 120))}</p><div class="actions">${actBtn('revive', 'Revive')}${actBtn('scrap', S.scraps.includes(c.id) ? 'In the Idea Machine' : 'Feed the Idea Machine')}${c.example ? '' : actBtn('del', 'Throw out')}</div></article>`; }).join('') : '<p class="caption">The heap is empty. Compost ideas from the concept board or the Idea Machine when they stop pulling at you.</p>';
}
async function turnCompost() {
  const list = compostList(); if (list.length < 1) return notice('Compost an idea or two first.');
  const ripe = list.slice().sort((a, b) => (a.compostedAt || 0) - (b.compostedAt || 0));
  const two = ripe.length > 2 ? [ripe[0], pick(ripe.slice(1))] : ripe.slice(0, 2);
  const btn = $('#turnCompost'); btn.disabled = true;
  let seed = null;
  if (S.sample) { try { const v = await S.sample.json(`Jed composted these abandoned art ideas in his maker's studio:\n${two.map(c => '- ' + bodyText(c)).join('\n')}\nGrow one new seedling idea from what is still alive in them. It should feel new, not a merge. Plain language, no em dashes. Return only JSON {"title":"2 to 5 words","premise":"one sentence","why":"one sentence on what it kept from the compost"}`, {modelTier: 'default'}); if (v && v.title) seed = v; } catch (e) { aiErr(e, true); } }
  if (!seed) { const th = [...new Set(two.flatMap(itemThemes))]; seed = {title: `${cap(th[0] || 'quiet')} Seedling`, premise: `Keep only the ${th[0] || 'core'} from “${two[0].title}”${two[1] ? ` and the ${th[1] || 'mood'} from “${two[1].title}”` : ''}, and make the smallest version you can this week.`, why: 'It keeps the part that still pulls at you and drops the rest.'}; }
  const sp = {id: nid('s'), kind: 'spark', created: Date.now(), text: `${seed.title}: ${seed.premise}`.slice(0, 220), themes: [...new Set(two.flatMap(itemThemes))].slice(0, 3), source: 'compost'};
  put(sp);
  $('#compostOut').innerHTML = `<article class="card concept"><div class="card-top"><img src="assets/icons/seedling.webp" alt="" width="28" height="28"><span class="chip ok">New seedling</span></div><h3>${esc(seed.title)}</h3><p>${esc(seed.premise)}</p><p class="mini">${esc(seed.why || '')}</p><div class="actions" data-id="${esc(sp.id)}">${actBtn('plant', 'Plant it in the Idea Machine', 'btn-blue')}</div></article>`;
  btn.disabled = false;
}

/* ---------- v2: monthly crit ---------- */
function critStatus() {
  const last = mine('crit')[0];
  const n = store.items.filter(x => ['entry','pin','play','concept','piece'].includes(x.kind)).length;
  if (!last) return n >= 5 ? {due: true, text: 'Your first crit is ready whenever you are.'} : {due: false, text: `Add ${5 - n} more thing${5 - n === 1 ? '' : 's'} to your studio to make your first crit worthwhile. You can still run one now.`};
  const days = Math.floor((Date.now() - last.created) / 864e5);
  return days >= 30 ? {due: true, text: `Your last crit was ${days} days ago. This month's is due.`} : {due: false, text: `Last crit ${days === 0 ? 'today' : days + ' day' + (days === 1 ? '' : 's') + ' ago'}. The next one is due in ${30 - days} days.`};
}
function renderCrit() {
  const st = critStatus(); $('#critDue').textContent = st.text;
  const cs = mine('crit'); const c = cs[0];
  $('#critOut').innerHTML = c ? [['What you made', c.made], ['What is working', c.working], ['Where you are stuck', c.stuck], ['The pattern this month', c.pattern], ['Next month\'s assignment', c.assignment], ['A question to sit with', c.question]].filter(x => x[1]).map(([h, t], i) => `<article class="card ${i === 4 ? 'concept' : ''}"><h3>${h}</h3><p>${esc(t)}</p></article>`).join('') : '<p class="hint">No crit yet. A crit looks back over the last 30 days of your studio, the way a tutor would in an art school review.</p>';
  $('#critHistory').innerHTML = cs.slice(1).map(x => `<li><span class="date">${fmtDate(x.created)}</span> Assignment: ${esc(x.assignment || '')}</li>`).join('') || '<li class="hint">Past crits will collect here.</li>';
}
async function runCrit() {
  const since = Date.now() - 30 * 864e5;
  const recent = store.items.filter(x => ['entry','pin','play','concept','piece','spark'].includes(x.kind) && (x.created || 0) >= since).sort((a, b) => a.created - b.created);
  const src = recent.length ? recent : creative();
  const btn = $('#critBtn'); btn.disabled = true; btn.lastChild.textContent = 'Running the crit…';
  const prev = mine('crit')[0];
  let v = null;
  if (S.sample) {
    try {
      v = await S.sample.json(`You are running Jed's monthly studio crit, like a thoughtful art-school tutor reviewing a month of work. Be honest and specific, warm but not flattering, and point to his actual material. Plain language, no em dashes.\nTheme counts: ${fingerprint().slice(0, 10).map(([t, n]) => t + ' ' + n).join(', ')}\nConcept stages: ${STAGES.map((s, i) => s + ' ' + mine('concept').filter(c => !c.composted && (c.stage || 0) === i).length).join(', ')}; composted ${mine('concept').filter(c => c.composted).length}\n${prev ? `Last month's assignment was: ${prev.assignment}\n` : ''}Last 30 days, oldest first:\n${src.slice(-50).map(x => `- (${KNAME[x.kind]}, ${fmtDate(x.created)}) ${clip(bodyText(x), 240)}`).join('\n')}\nReturn only JSON {"made":"one or two sentences summarising what he actually made and tried","working":"one or two sentences","stuck":"one or two sentences on where energy stalls or ideas stay safe","pattern":"one sentence on a pattern across the month${prev ? ', including how he did on last month\'s assignment' : ''}","assignment":"one concrete assignment for the next 30 days","question":"one question to sit with"}`, {modelTier: 'complex'});
    } catch (e) { aiErr(e); }
  }
  if (!v || !v.made) {
    const k = kk => src.filter(x => x.kind === kk).length;
    const th = fingerprint().slice(0, 2).map(e => e[0]);
    v = {made: `${k('entry')} journal entries, ${k('pin')} pins, ${k('play')} warm-ups, ${k('concept')} concepts and ${k('piece')} finished pieces this month.`, working: `“${th[0] || 'Your noticing'}” keeps coming back, which is a sign of a real interest.`, stuck: k('piece') ? 'Keep an eye on ideas that stay at Sketch for weeks.' : 'Nothing has reached the gallery yet. Ideas may be staying safe on paper.', pattern: `You return to ${th.join(' and ') || 'small details'} more than anything else.`, assignment: `Finish one small piece about ${th[0] || 'something you noticed'} and hang it in the gallery, however rough.`, question: 'What would you make if you knew nobody would ever judge it?', local: true};
  }
  put({id: nid('k'), kind: 'crit', created: Date.now(), made: String(v.made || ''), working: String(v.working || ''), stuck: String(v.stuck || ''), pattern: String(v.pattern || ''), assignment: String(v.assignment || ''), question: String(v.question || ''), local: !!v.local});
  if (v.local) notice('Claude is away, so this crit is a simple summary from your studio counts.');
  btn.disabled = false; btn.lastChild.textContent = 'Run this month\'s crit';
}

/* ---------- the room (diegetic 3D hub) ---------- */
const SNAME = {portfolio: 'Portfolio Wall', workbench: 'Workbench', pinboard: 'Pinboard', corner: 'Conversation Corner', machine: 'Idea Machine', playground: 'Playground', wall: 'Sketch Wall', gallery: 'Gallery and Compost Heap', mirror: 'Voice Mirror', thermostat: 'Room thermostat'};
const SDESC = {portfolio: 'your creative and AI work, one tap from the room.', workbench: 'the desk under the window, where your journal lives.', pinboard: 'the cork board. Pin what moves you.', corner: 'seats and a rug. Pull one up and talk it through.', machine: 'feed it scraps and pull the lever.', playground: 'the slide and ball pit. Ten-minute warm-ups live here.', wall: 'the sketch board. Map your thinking in 2D or 3D.', gallery: 'frames on the wall for finished pieces, and the compost crate below.', mirror: 'the standing mirror shows the fingerprint of your voice.', thermostat: 'change the look of everything, the weather outside and the light inside.'};
const PART_KEYS = ['walls','floor','winframe','desk','lamp','stool','pinboard','machine','mirror','board','frames','crate','rug','trim','table','seat1','seat2','slide','ladder','pit','bed'];
const PART_TYPES = {walls: ['pegboard','brick','plaster','wood panels'], floor: ['planks','tiles','carpet','concrete'], desk: ['wood','drafting','standing'], lamp: ['desk lamp','globe','candle'], machine: ['gumball','robot','arcade'], mirror: ['oval','round','arched'], board: ['chalkboard','whiteboard','easel'], rug: ['round','square','star'], seat1: ['stool','beanbag','armchair'], seat2: ['stool','beanbag','armchair']};
const PART_LABEL = {walls: 'Walls', floor: 'Floor', winframe: 'Window frames', desk: 'Desk', lamp: 'Lamp', stool: 'Desk stool', pinboard: 'Pinboard frame', machine: 'Idea Machine', mirror: 'Mirror', board: 'Sketch board', frames: 'Picture frames', crate: 'Compost crate', rug: 'Rug', trim: 'Rug trim', table: 'Corner table', seat1: 'Seat one', seat2: 'Seat two', slide: 'Slide', ladder: 'Slide ladder', pit: 'Ball pit', bed: 'Pet bed'};
const PART_GROUPS = [['The room', ['walls','floor','winframe']], ['Workbench', ['desk','lamp','stool']], ['Pinboard and machine', ['pinboard','machine']], ['Mirror and sketch board', ['mirror','board']], ['Gallery', ['frames','crate']], ['Conversation corner', ['rug','trim','table','seat1','seat2']], ['Playground', ['slide','ladder','pit','bed']]];
const PRESETS = {
  playground: {label: 'Playground', types: {walls: 'pegboard', floor: 'planks'}, c: ['#c8955c','#b98552','#fffdf7','#b47a45','#ffc83a','#2f5bea','#1d2030','#ff5b4f','#ffc83a','#8c6b4a','#1d2030','#8c6b4a','#ff8fc8','#ffc83a','#fffdf7','#2f5bea','#1fae7a','#ff5b4f','#2f5bea','#1fae7a','#7b5cff'], mood: 'cosy'},
  kopitiam: {label: 'Kopitiam', types: {walls: 'plaster', floor: 'tiles'}, c: ['#efe6cf','#5f8f6e','#2f8f6e','#7a4e2d','#2f8f6e','#c0392b','#4a3b2a','#2f8f6e','#c9a227','#4a3b2a','#4a3b2a','#7a4e2d','#c0392b','#efe6cf','#ffffff','#c0392b','#2f8f6e','#e67e22','#2f8f6e','#c0392b','#e67e22'], mood: 'cosy'},
  nightmarket: {label: 'Night market', types: {walls: 'brick', floor: 'concrete'}, c: ['#3a3155','#4a4460','#ff3ea5','#5b3a7a','#ff3ea5','#00e0ff','#00e0ff','#ff3ea5','#00e0ff','#5b3a7a','#ff3ea5','#5b3a7a','#00e0ff','#ff3ea5','#2a2340','#ff3ea5','#ffe14d','#ffe14d','#00e0ff','#ff3ea5','#00e0ff'], mood: 'neon', time: 'night'},
  pastel: {label: 'Pastel dream', types: {walls: 'plaster', floor: 'planks'}, c: ['#f6e7f2','#f2e2c9','#ffffff','#ffd6a5','#bde0fe','#cdb4db','#a2d2ff','#ffafcc','#bde0fe','#cdb4db','#ffafcc','#ffd6a5','#a2d2ff','#ffffff','#ffffff','#ffafcc','#caffbf','#ffafcc','#bde0fe','#caffbf','#cdb4db'], mood: 'bright'},
  forest: {label: 'Forest cabin', types: {walls: 'wood panels', floor: 'planks'}, c: ['#6b8f5e','#5a3e2b','#3e2a1c','#3e2a1c','#e9c46a','#264653','#3e2a1c','#e76f51','#e9c46a','#3e2a1c','#264653','#3e2a1c','#2a9d8f','#e9c46a','#f4f1de','#e76f51','#2a9d8f','#e76f51','#e9c46a','#2a9d8f','#264653'], mood: 'cosy'}
};
const PET_KINDS = {cat: {label: 'Cat', icon: 'assets/icons/cat_face.webp', name: 'Mochi', color: '#ff9a2f', speed: 0.6}, dog: {label: 'Dog', icon: 'assets/icons/dog_face.webp', name: 'Kaya', color: '#a0703f', speed: 0.9}, otter: {label: 'Otter', icon: 'assets/icons/otter.webp', name: 'Ollie', color: '#6b4a2b', speed: 0.7}, bunny: {label: 'Bunny', icon: 'assets/icons/rabbit_face.webp', name: 'Tofu', color: '#f3ead8', speed: 0.8}, robot: {label: 'Robot', icon: 'assets/icons/robot.webp', name: 'Bolt', color: '#9fb3c8', speed: 0.5}};
const PET_LINES = {cat: ['purrs and leans into your hand.', 'slow-blinks at you. That is cat for I love you.', 'headbutts your hand, then pretends it did not.'], dog: ['wags so hard its whole body wiggles.', 'rolls over for belly rubs.', 'gives you a happy little boof.'], otter: ['squeaks and does a tiny spin.', 'holds your hand the way otters do.', 'chitters happily and flops over.'], bunny: ['does a binky, a happy twist-jump.', 'wiggles its nose at top speed.', 'flops onto its side, totally content.'], robot: ['beeps a happy three-note tune.', 'spins its antenna and glows.', 'says: affection logged, thank you.']};
function defaultRoomCfg(preset) {
  const P = PRESETS[preset || 'playground'];
  const parts = {}; PART_KEYS.forEach((k, i) => { parts[k] = {color: P.c[i]}; if (PART_TYPES[k]) parts[k].type = PART_TYPES[k][0]; });
  Object.entries(P.types || {}).forEach(([k, t]) => parts[k].type = t);
  return {preset: preset || 'playground', parts, windows: {count: 3, style: 'square'}, weather: 'auto', time: P.time || 'auto', mood: P.mood || 'cosy', brightness: 100, lampColor: '#ffc98a', sound: true,
    pets: Object.entries(PET_KINDS).map(([k, d], i) => ({kind: k, name: d.name, color: d.color, on: i === 0, petted: 0}))};
}
function mergeRoomCfg(saved) {
  const d = defaultRoomCfg(); if (!saved || typeof saved !== 'object') return d;
  const out = Object.assign({}, d, saved); out.parts = {}; PART_KEYS.forEach(k => out.parts[k] = Object.assign({}, d.parts[k], (saved.parts || {})[k] || {}));
  out.windows = Object.assign({}, d.windows, saved.windows || {});
  out.pets = d.pets.map(p => Object.assign({}, p, ((saved.pets || []).find(x => x && x.kind === p.kind)) || {}));
  return out;
}

/* ---------- portfolio wall: links to Jed's creative and AI artifacts on claude.ai ---------- */
const WORKS = [
  ['games', 'Games and worlds', '#2f5bea', [
    ['Off the Hook Hub', '1WLXTYtDNpzHW7phqA33cT', 'Home base for the fishing game.'],
    ['Off the Hook Four Seas', 'SBuqdDudjqbFKqLf3Z4guN', 'Storyboard of four world versions, casts and endings.'],
    ['Off the Hook Story Map', 'DEBBS2oU4j8gshWWyuFhvq', 'The story laid out as a map.'],
    ['Off the Hook Arc', 'UqndUn1xXzsQmz1mH57Ksk', 'The narrative arc.'],
    ['Off the Hook Pitch', '5ercRE9j3RTWSEujNBNPnq', 'The pitch for the game.'],
    ["Off the Hook: The God's Island", 'HN5De2FEphA5wkGRRGe9XD', 'Design doc for the island.'],
    ['Pipes Direction Board', 'K4Y85PcwVf8Rubwu6f8odi', 'Directions, chronology, story and level mechanics.'],
    ['Tapping on the Pipes: Design Bible', '3EDEjQuJi4hUWU9A3Af6F3', 'Mouse Edition design bible.'],
    ['Odd Ocean Slice Options', 'RstHPVHNQWxER9viPHq3H3', 'Options for a vertical slice.'],
    ['Loss and Found Audio Desk', 'NvjWmLwtHjL4PspccKc1a4', 'Sound editor and mixer with WAV exports for Godot.'],
    ['Tidewell Scenario Card: The Hairline Crack', '9ofkQgKyq67t7wxDxQB3bK', 'A scenario card design.']]],
  ['studio', 'Studio and portfolio', '#ff8fc8', [
    ["Jed's Maker's Studio", 'FwPZtYECiRjrinzr7PJf7M', 'The original studio with its stations.'],
    ["Maker's Studio Room", 'KVUbh6VXGfWQUY1bjWdJAW', 'This room, the claude.ai version.'],
    ['Jedidiah Siah Portfolio', '6bgEYBTw6VEWaeD4CjQPqP', 'Game design portfolio with four case studies.'],
    ['Jedidiah Siah, Human Club', 'CJkHRguBchrS6ZTTifD7Yv', 'Card-table story of serious game and gamification work.'],
    ['Jed, Player One', 'PSZx4tTLyfkkXxHBv5tEEn', 'Animated player-select intro for workshops.'],
    ["Cameron's Gallery", 'SBBxDSH8NuqdUs6MVRFAXV', 'A gallery.']]],
  ['client', 'Game design for clients', '#ffc83a', [
    ['GovTech Game Hub', '2gz2PtNFZUmcEUYrcGTbvT', 'Hub for the GovTech culture and values game.'],
    ['Ground Truth', '7vZSqe7Dupef2YHYss4GgB', 'Scroll story pitching the game as a night-to-dawn survey.'],
    ['GovTech Culture Game Proposal', '4qK5m9gYLcDXcdtmwKv4Wz', 'The proposal deck.']]],
  ['ai', 'AI work', '#1fae7a', [
    ['AI Hub', 'X6YTBY2xnLYM36ioHXA7Kc', 'Learning and teaching hub for AI.'],
    ['Teaching Studio', '9NnHMvot1bgHjnUXVptfCr', 'Turning what you learn into lessons.'],
    ['Agent Roster', '1dDxTyAEMbmoQbB1NVz3RP', 'The agent teams under Anubis, with roles and tiers.'],
    ['Agent Standards 2026', 'Jtoc2mP1sWpFH4sFaLBAqL', 'Standards doc for the agents.'],
    ['Second Brain graph', 'Xv2TsesUR5NJTvxvoLFyBs', 'Graph view of the second brain.'],
    ['Second Brain Map', 'EQaSWebnLLPF29FudyVCWN', 'Map of the second brain.'],
    ['Tool shelf', 'DsRAUiFLwrDTPoNeD9GYro', 'Shelf of tools.'],
    ['Jed Command Centre', 'DBpKVbR84DzR47NZwiBFuz', 'Command centre dashboard.'],
    ['Bespoke AI Tools Pitch Deck', '35Ku4MKDaXM5r8opSixgm3', 'Fifteen-slide pitch for bespoke AI tools.'],
    ['The Window Pitch', '3jSZfcXVEHPTMZNZghGQHy', 'Scroll-driven pitch story with two laptop demos.'],
    ['Filos Front Door (demo)', 'UVFfaV1zeqtRtv8rEUE7HY', 'Referral drafting demo for Filos.'],
    ['Filos Front Door (film)', 'NAKWLVbh5xw4ncE1bb6uos', 'Film for the Filos pitch.'],
    ['Filos Safety Walkthrough', '9ofKm4JoEUWpqnL4EKXumi', 'Safety walkthrough for Filos.'],
    ['Pain Point Atlas', 'MpRHLyWyMhTGEnXhHvUyRd', 'Map of sourced pain points for small organisations.'],
    ['Logic Model Studio', 'J6xkrWRyZAQkc9F8vhJAA5', 'Logic model building tool.']]]
];
const workUrl = id => 'https://claude.ai/artifact/' + id;
function renderPortfolio() {
  const f = S.workFilter || 'all';
  $('#workFilters').innerHTML = [['all', 'Everything']].concat(WORKS.map(g => [g[0], g[1]])).map(([k, n]) => `<button class="btn btn-sm ${f === k ? 'btn-blue' : ''}" type="button" data-wf="${k}" aria-pressed="${f === k}">${esc(n)}</button>`).join('');
  $('#workList').innerHTML = WORKS.filter(g => f === 'all' || g[0] === f).map(([k, name, col, items]) => `<section class="work-group"><h3><span class="sw" style="background:${col}"></span>${esc(name)} <span class="hint">${items.length}</span></h3><div class="work-grid">${items.map(([t, id, d]) => `<a class="work-card" style="--wc:${col}" href="${workUrl(id)}" target="_blank" rel="noopener"><b>${esc(t)}</b><span>${esc(d)}</span><span class="work-open">Open <span aria-hidden="true">↗</span></span></a>`).join('')}</div></section>`).join('');
}
window.WORKS = WORKS;
const Room = (() => {
  let R = null; let CFG = defaultRoomCfg();
  const V = {
    room: {pos: [0, 3.7, 8.4], tgt: [0, 1.3, -0.6]},
    workbench: {pos: [-2.4, 2.2, 0.2], tgt: [-3.0, 1.1, -3.3]},
    pinboard: {pos: [0, 2.2, 0.4], tgt: [0, 2.1, -4]},
    machine: {pos: [1.5, 1.9, 0.2], tgt: [1.9, 1.25, -3.1]},
    mirror: {pos: [2.3, 1.8, -0.2], tgt: [3.8, 1.45, -3.0]},
    wall: {pos: [0.3, 2.0, -0.4], tgt: [5, 1.85, -0.4]},
    gallery: {pos: [-0.5, 2.0, 0.6], tgt: [-5, 1.6, 0.3]},
    corner: {pos: [2.0, 2.8, 5.6], tgt: [2.0, 0.6, 1.8]},
    playground: {pos: [-0.6, 2.6, 5.8], tgt: [-2.6, 0.5, 2.4]},
    thermostat: {pos: [-4.4, 2.5, -3.2], tgt: [-4.4, 2.5, -3.96]},
    portfolio: {pos: [-3.15, 2.4, 3.0], tgt: [-5, 2.4, 3.0]}
  };
  const SPOT = {portfolio: [-3.3, 1.2], workbench: [-2.6, -1.6], pinboard: [0, -2.5], machine: [1.9, -2.2], mirror: [3.1, -1.8], wall: [3.7, -0.4], gallery: [-3.8, -0.2], corner: [0.6, 2.4], playground: [-1.2, 1.4], thermostat: [-3.9, -1.6]};
  const WINS = [
    {p: [-3, 2.75, -3.97], ry: 0, w: 1.7, h: 1.15},
    {p: [4.97, 2.35, 2.4], ry: -Math.PI / 2, w: 1.5, h: 1.15},
    {p: [3.0, 3.2, -3.97], ry: 0, w: 1.4, h: 0.85},
    {p: [-4.97, 3.4, -0.75], ry: Math.PI / 2, w: 2.4, h: 0.62}
  ];
  const ease = t => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  const realPhase = () => { const hr = new Date().getHours() + new Date().getMinutes() / 60; return hr >= 7 && hr < 17 ? 'day' : hr >= 17 && hr < 19.5 ? 'dusk' : hr >= 5 && hr < 7 ? 'dawn' : 'night'; };
  const phase = () => CFG.time === 'auto' ? realPhase() : CFG.time;
  const autoWeather = (() => { const d = Math.floor(Date.now() / 864e5); const h = new Date().getHours(); const w = ['clear', 'cloudy', 'clear', 'rain', 'cloudy', 'thunderstorm', 'clear'][d % 7]; return h >= 14 && h < 19 && w === 'clear' ? 'cloudy' : w; })();
  const weather = () => CFG.weather === 'auto' ? autoWeather : CFG.weather;

  /* helpers */
  function mat(color, o) { return new THREE.MeshStandardMaterial(Object.assign({color, roughness: 0.72, metalness: 0.02, envMapIntensity: 0.22}, o || {}, {flatShading: false})); }
  function M(key, o) { const m = mat(CFG.parts[key].color, o); m.userData.part = key; return m; }
  const pm = (k, o) => (typeof k === 'string' && CFG.parts[k]) ? M(k, o) : mat(k, o);
  const INK = {}; 
  function outline(mesh) {
    const g = mesh.geometry; if (!g || mesh.userData.noOutline) return; g.computeBoundingSphere(); const r = g.boundingSphere.radius; if (r < 0.1) return;
    if (!INK.line) { INK.line = new THREE.LineBasicMaterial({color: 0x1d2030, transparent: true, opacity: 0.9}); INK.line.userData.shared = true; INK.hull = new THREE.MeshBasicMaterial({color: 0x1d2030, side: THREE.BackSide}); INK.hull.userData.shared = true; }
    if (g.type === 'BoxGeometry') { if (!R.petBuild && !mesh.userData.moving) { mesh.userData.wantEdges = true; return; } const e = new THREE.LineSegments(new THREE.EdgesGeometry(g, 25), INK.line); e.raycast = () => {}; mesh.add(e); }
    else { const h = new THREE.Mesh(g, INK.hull); h.scale.setScalar(1 + (R.petBuild ? 0.004 : 0.022) / r); h.raycast = () => {}; h.userData.hull = true; mesh.add(h); }
  }
  function add(mesh, parent, x, y, z) { mesh.position.set(x, y, z); mesh.castShadow = true; mesh.receiveShadow = true; if (parent && parent === R.lever) mesh.userData.moving = true; outline(mesh); (parent || R.scene).add(mesh); return mesh; }
  // one LineSegments per group for every static box edge: far fewer draw calls than a line object per box
  function mergeEdges(g) {
    if (!INK.line) return; g.updateMatrixWorld(true); const inv = new THREE.Matrix4().copy(g.matrixWorld).invert(); const m4 = new THREE.Matrix4(), v = new THREE.Vector3(); const arrs = []; let n = 0;
    g.traverse(o => { if (o.isMesh && o.userData.wantEdges) { const es = o.geometry.userData && o.geometry.userData.edgeSrc; const eg = new THREE.EdgesGeometry(es ? new THREE.BoxGeometry(...es) : o.geometry, 25); const pos = eg.attributes.position; m4.multiplyMatrices(inv, o.matrixWorld); const out = new Float32Array(pos.count * 3); for (let i = 0; i < pos.count; i++) { v.fromBufferAttribute(pos, i).applyMatrix4(m4); out[i * 3] = v.x; out[i * 3 + 1] = v.y; out[i * 3 + 2] = v.z; } arrs.push(out); n += out.length; eg.dispose(); } });
    if (!n) return; const all = new Float32Array(n); let off = 0; arrs.forEach(a => { all.set(a, off); off += a.length; });
    const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(all, 3)); const ls = new THREE.LineSegments(geo, INK.line); ls.raycast = () => {}; g.add(ls);
  }
  function box(w, h, d, k, x, y, z, parent, o) { const mn = Math.min(w, h, d); let geo; if (THREE.RoundedBoxGeometry && mn > 0.035 && !R.petBuild) { geo = new THREE.RoundedBoxGeometry(w, h, d, 2, Math.min(0.025, mn * 0.18)); geo.userData = {edgeSrc: [w, h, d]}; } else geo = new THREE.BoxGeometry(w, h, d); return add(new THREE.Mesh(geo, pm(k, o)), parent, x, y, z); }
  function cyl(rt, rb, h, k, x, y, z, parent, seg, o) { return add(new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, Math.max(seg || 28, 12)), pm(k, o)), parent, x, y, z); }
  function sph(r, k, x, y, z, parent, o) { return add(new THREE.Mesh(new THREE.SphereGeometry(r, 28, 20), pm(k, o)), parent, x, y, z); }
  function ctex(w, h, draw) { const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h, c); const t = new THREE.CanvasTexture(c); t.anisotropy = 4; return t; }
  function setMap(mesh, t) { const old = mesh.material.map; mesh.material.map = t; mesh.material.needsUpdate = true; if (old) old.dispose(); }
  function wrapText(x, text, maxW) { const ws = String(text || '').split(/\s+/); const lines = []; let line = ''; for (const w of ws) { const t = line ? line + ' ' + w : w; if (x.measureText(t).width > maxW && line) { lines.push(line); line = w; } else line = t; } if (line) lines.push(line); return lines; }
  function fitText(x, t, maxW) { t = String(t || ''); while (x.measureText(t).width > maxW && t.length > 2) t = t.slice(0, -2) + '…'; return t; }
  function clearGroup(g) { while (g.children.length) { const c = g.children.pop(); c.traverse(o => { if (o.geometry) o.geometry.dispose(); if (o.material) { const ms = Array.isArray(o.material) ? o.material : [o.material]; ms.forEach(m => { if (m.userData && m.userData.shared) return; if (m.map && m.map !== R.skyTex) m.map.dispose(); m.dispose(); }); } }); } }
  function group(st) { if (!R.groups[st]) { const g = new THREE.Group(); g.userData.station = st; R.scene.add(g); R.groups[st] = g; } const g = R.groups[st]; clearGroup(g); const d = new THREE.Group(); g.add(d); R.dyn[st] = d; return g; }
  function shade(hex, f) { const c = new THREE.Color(hex); const hsl = {}; c.getHSL(hsl); c.setHSL(hsl.h, hsl.s, Math.max(0, Math.min(1, hsl.l + f))); return '#' + c.getHexString(); }

  /* textures */
  function wallTex(type) {
    return ctex(256, 256, (x, w, h) => {
      x.fillStyle = '#ffffff'; x.fillRect(0, 0, w, h);
      if (type === 'pegboard') { x.fillStyle = 'rgba(40,20,0,.55)'; for (let i = 16; i < w; i += 32) for (let j = 16; j < h; j += 32) { x.beginPath(); x.arc(i, j, 3.6, 0, 6.3); x.fill(); } }
      else if (type === 'brick') { for (let r = 0; r < 8; r++) for (let c = -1; c < 5; c++) { const bx = c * 64 + (r % 2 ? 32 : 0); x.fillStyle = `rgba(0,0,0,${0.03 + ((r * 7 + c * 3) % 5) * 0.025})`; x.fillRect(bx + 2, r * 32 + 2, 60, 28); } x.fillStyle = 'rgba(255,255,255,.6)'; for (let r = 0; r <= 8; r++) x.fillRect(0, r * 32 - 1, w, 3); }
      else if (type === 'plaster') { for (let i = 0; i < 2200; i++) { x.fillStyle = `rgba(0,0,0,${Math.random() * 0.06})`; x.fillRect(Math.random() * w, Math.random() * h, 2, 2); } }
      else { for (let c = 0; c < 4; c++) { x.fillStyle = `rgba(0,0,0,${0.02 + (c % 2) * 0.04})`; x.fillRect(c * 64, 0, 64, h); x.fillStyle = 'rgba(0,0,0,.28)'; x.fillRect(c * 64, 0, 2, h); x.strokeStyle = 'rgba(0,0,0,.06)'; for (let g = 0; g < 6; g++) { x.beginPath(); x.moveTo(c * 64 + 8 + g * 9, 0); x.bezierCurveTo(c * 64 + 14 + g * 9, 80, c * 64 + 2 + g * 9, 170, c * 64 + 10 + g * 9, h); x.stroke(); } } }
    });
  }
  function floorTex(type) {
    return ctex(512, 512, (x, w, h) => {
      x.fillStyle = '#ffffff'; x.fillRect(0, 0, w, h);
      if (type === 'planks') { for (let i = 0; i < 8; i++) { x.fillStyle = `rgba(0,0,0,${[0, 0.06, 0.03, 0.09][i % 4]})`; x.fillRect(0, i * 64, w, 64); x.fillStyle = 'rgba(0,0,0,.22)'; x.fillRect(0, i * 64, w, 2); x.fillRect((i * 173) % w, i * 64, 2, 64); } }
      else if (type === 'tiles') { for (let i = 0; i < 8; i++) for (let j = 0; j < 8; j++) { x.fillStyle = (i + j) % 2 ? 'rgba(0,0,0,.12)' : 'rgba(255,255,255,.2)'; x.fillRect(i * 64, j * 64, 64, 64); for (let k = 0; k < 20; k++) { x.fillStyle = 'rgba(255,255,255,.35)'; x.fillRect(i * 64 + Math.random() * 60, j * 64 + Math.random() * 60, 3, 3); } } x.fillStyle = 'rgba(0,0,0,.25)'; for (let i = 0; i <= 8; i++) { x.fillRect(i * 64 - 1, 0, 2, h); x.fillRect(0, i * 64 - 1, w, 2); } }
      else if (type === 'carpet') { for (let i = 0; i < 9000; i++) { x.fillStyle = `rgba(0,0,0,${Math.random() * 0.08})`; x.fillRect(Math.random() * w, Math.random() * h, 2, 2); } }
      else { for (let i = 0; i < 3000; i++) { x.fillStyle = `rgba(0,0,0,${Math.random() * 0.1})`; x.fillRect(Math.random() * w, Math.random() * h, 3, 3); } x.strokeStyle = 'rgba(0,0,0,.15)'; x.lineWidth = 2; for (let i = 0; i < 4; i++) { x.beginPath(); let px = Math.random() * w, py = Math.random() * h; x.moveTo(px, py); for (let k = 0; k < 5; k++) { px += (Math.random() - 0.5) * 60; py += Math.random() * 40; x.lineTo(px, py); } x.stroke(); } x.fillStyle = 'rgba(0,0,0,.18)'; x.fillRect(0, h / 2 - 1, w, 2); x.fillRect(w / 2 - 1, 0, 2, h); }
    });
  }

  /* sky (animated, shared by every window) */
  function drawSky(now) {
    const x = R.skyCtx, w = 512, h = 360; const ph = phase(), we = weather();
    const G = {dawn: ['#7a8fd6', '#ffd2a8'], day: ['#7fc3ff', '#dff1ff'], dusk: ['#3b2a6b', '#ff9a5c'], night: ['#0b1030', '#26305e']}[ph];
    const g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, G[0]); g.addColorStop(1, G[1]); x.fillStyle = g; x.fillRect(0, 0, w, h);
    const grey = {clear: 0, cloudy: 0.25, rain: 0.45, thunderstorm: 0.62, snow: 0.2}[we] || 0;
    if (grey) { x.fillStyle = we === 'snow' ? `rgba(225,232,245,${grey})` : `rgba(80,92,112,${grey})`; x.fillRect(0, 0, w, h); }
    if (ph === 'night' && (we === 'clear' || we === 'cloudy')) { x.fillStyle = '#fff'; R.stars.forEach(([sx, sy, a]) => { x.globalAlpha = a * (0.6 + 0.4 * Math.sin(now / 700 + sx)); x.fillRect(sx, sy, 2, 2); }); x.globalAlpha = 1; x.fillStyle = '#fff6d8'; x.beginPath(); x.arc(400, 70, 24, 0, 6.3); x.fill(); }
    else if ((we === 'clear' || we === 'cloudy') && ph !== 'night') { x.fillStyle = ph === 'day' ? '#fff3b0' : '#ffd36b'; x.beginPath(); x.arc(ph === 'day' ? 120 : 380, ph === 'day' ? 70 : h - 130, 30, 0, 6.3); x.fill(); }
    const nC = {clear: 3, cloudy: 7, rain: 9, thunderstorm: 10, snow: 6}[we] || 3;
    R.clouds.slice(0, nC).forEach((c, i) => { const cx = ((c.x + now * c.v) % (w + 220)) - 110; x.fillStyle = we === 'clear' ? 'rgba(255,255,255,.85)' : we === 'snow' ? 'rgba(240,244,250,.9)' : `rgba(${150 - i * 6},${158 - i * 6},${172 - i * 6},.9)`; x.beginPath(); x.ellipse(cx, c.y, 60 * c.s, 18 * c.s, 0, 0, 6.3); x.ellipse(cx + 30 * c.s, c.y - 10 * c.s, 34 * c.s, 16 * c.s, 0, 0, 6.3); x.fill(); });
    const lit = ph === 'night' || ph === 'dusk' || we === 'thunderstorm';
    R.skyline.forEach(b => { x.fillStyle = lit ? '#1b1f3a' : '#9fb3c8'; x.fillRect(b.x, h - b.h, b.w, b.h); x.fillStyle = lit ? '#ffd98a' : '#c9d7e6'; b.win.forEach(([wx, wy, on]) => { if (!lit || on) x.fillRect(wx, wy, 5, 6); }); });
    if (we === 'rain' || we === 'thunderstorm') { x.strokeStyle = 'rgba(210,225,255,.6)'; x.lineWidth = 1.5; x.beginPath(); for (let i = 0; i < 130; i++) { const px = (i * 37.7) % w, py = ((i * 53.1) + now * 0.5) % (h + 20) - 20; x.moveTo(px, py); x.lineTo(px - 4, py + 14); } x.stroke(); }
    if (we === 'snow') { x.fillStyle = 'rgba(255,255,255,.95)'; for (let i = 0; i < 90; i++) { const px = ((i * 41.3) + Math.sin(now / 900 + i) * 10 + w) % w, py = ((i * 29.7) + now * 0.04) % h; x.beginPath(); x.arc(px, py, 2.2, 0, 6.3); x.fill(); } }
    R.flash = 0;
    if (we === 'thunderstorm') {
      if (now > R.nextBolt) { R.boltUntil = now + 200; R.nextBolt = now + 3500 + Math.random() * 6000; R.bolt = [[150 + Math.random() * 220, 0]]; for (let i = 0; i < 6; i++) { const [px, py] = R.bolt[R.bolt.length - 1]; R.bolt.push([px + (Math.random() - 0.5) * 50, py + 30 + Math.random() * 20]); } if (CFG.sound) thunder(); }
      if (now < R.boltUntil) { R.flash = 1; x.fillStyle = 'rgba(255,255,255,.55)'; x.fillRect(0, 0, w, h); x.strokeStyle = '#fffbe0'; x.lineWidth = 3; x.beginPath(); R.bolt.forEach(([px, py], i) => i ? x.lineTo(px, py) : x.moveTo(px, py)); x.stroke(); }
    }
    R.skyTex.needsUpdate = true;
  }

  /* lights */
  function applyLights() {
    const ph = phase(), we = weather(), b = CFG.brightness / 100;
    const base = {dawn: {h: 0.55, s: 0.7, sc: 0xffc9a0, bg: '#2a2230'}, day: {h: 0.75, s: 0.95, sc: 0xfff4e0, bg: '#2b2420'}, dusk: {h: 0.5, s: 0.7, sc: 0xffa36b, bg: '#241a22'}, night: {h: 0.35, s: 0.28, sc: 0x7c8be0, bg: '#16131a'}}[ph];
    const wm = {clear: 1, cloudy: 0.78, rain: 0.6, thunderstorm: 0.48, snow: 0.85}[we] || 1;
    let h = base.h * (0.6 + 0.4 * wm), s = base.s * wm, lamp = ph === 'day' ? 0.6 : 1.4, fill = ph === 'day' ? 0.3 : 0.6, neon = 0;
    if (CFG.mood === 'bright') { h *= 1.4; s *= 1.1; lamp = 0.7; fill = 1.0; }
    if (CFG.mood === 'neon') { h *= 0.45; s *= 0.35; lamp = 0.8; fill = 0.15; neon = 1.6; }
    if (CFG.mood === 'moody') { h *= 0.45; s *= 0.5; lamp = 1.7; fill = 0.1; }
    R.hemi.intensity = h * b * (R.scene.environment ? 0.55 : 1); R.baseSun = s * b; R.sun.intensity = R.baseSun; R.sun.color.setHex(we === 'rain' || we === 'thunderstorm' ? 0x9fb3d6 : we === 'snow' ? 0xdfe8ff : base.sc);
    R.lamp.intensity = lamp * b; R.lamp.color.set(CFG.lampColor); R.baseLamp = R.lamp.intensity; R.fill.intensity = fill * b; R.neon1.intensity = R.neon2.intensity = neon * b; R.neon1.visible = R.neon2.visible = neon > 0;
    const bg = new THREE.Color(CFG.mood === 'neon' ? '#140f22' : base.bg); R.scene.background = bg; R.scene.fog.color = bg;
    if (R.shadeMat) R.shadeMat.emissive = new THREE.Color(CFG.lampColor).multiplyScalar(ph === 'day' && CFG.mood !== 'moody' ? 0.15 : 0.45);
    drawThermo();
  }

  /* ---------- real 3D models (CC0, Poly Haven) with procedural fallback ---------- */
  const MODELS = {table: 'wooden_table_02', armlamp: 'desk_lamp_arm_01', stool: 'wooden_stool_01', plant: 'potted_plant_02', pens: 'stationery_supplies', spray: 'spray_paint_bottles', shelf: 'wooden_display_shelves_01', books: 'book_encyclopedia_set_01', radio: 'cassette_player', vase: 'ceramic_vase_01', chair: 'ArmChair_01', duck: 'rubber_duck_toy', ball: 'baseball_01'};
  const MDL = {}; let mdlT = 0;
  const MODEL_BASE = window.STUDIO_HOSTED ? 'assets/models/' : null; // the single-file claude.ai version keeps the hand-built pieces
  function model(key) {
    const id = MODELS[key]; const m = MDL[id]; if (m) return m.state === 'ok' ? m : null;
    if (!MODEL_BASE || !THREE.GLTFLoader) return null;
    MDL[id] = {state: 'loading'};
    new THREE.GLTFLoader().load(`${MODEL_BASE}${id}/${id}_1k.gltf`, gl => {
      const sc = gl.scene; sc.traverse(o => { if (!o.isMesh) return; o.castShadow = true; o.receiveShadow = true; const ms = Array.isArray(o.material) ? o.material : [o.material];
        ms.forEach(mt => { ['map', 'emissiveMap'].forEach(k => { if (mt[k]) { mt[k].encoding = THREE.LinearEncoding; mt[k].anisotropy = 4; mt[k].needsUpdate = true; } }); mt.envMapIntensity = 0.4; mt.needsUpdate = true; }); });
      const bb = new THREE.Box3().setFromObject(sc); MDL[id] = {state: 'ok', scene: sc, box: bb, size: bb.getSize(new THREE.Vector3())};
      clearTimeout(mdlT); mdlT = setTimeout(() => { if (R) rebuildAll(); }, 250);
    }, undefined, () => { MDL[id] = {state: 'fail'}; });
    return null;
  }
  // place a model so its footprint is centred on (x, z) and its base sits at y; fit by height (uniform) or to an exact size [w, h, d]
  function place(key, parent, o) {
    const m = model(key); if (!m) return null;
    const inner = m.scene.clone(true), c = m.box.getCenter(new THREE.Vector3()); inner.position.set(-c.x, -m.box.min.y, -c.z);
    const w = new THREE.Group(); w.add(inner);
    if (o.size) w.scale.set(o.size[0] / m.size.x, o.size[1] / m.size.y, o.size[2] / m.size.z); else { const s = o.h / m.size.y; w.scale.set(s, s, s); }
    w.position.set(o.x, o.y || 0, o.z); w.rotation.y = o.ry || 0;
    if (o.tint) { const col = new THREE.Color('#ffffff').lerp(new THREE.Color(CFG.parts[o.tint].color), 0.3); inner.traverse(n => { if (n.isMesh) { n.material = n.material.clone(); n.material.color.copy(col); n.material.userData.tintPart = o.tint; } }); }
    parent.add(w); return w;
  }

  /* builders */
  function buildShell() {
    const sh = R.shell; clearGroup(sh);
    const ft = floorTex(CFG.parts.floor.type); ft.wrapS = ft.wrapT = THREE.RepeatWrapping; ft.repeat.set(3, 3);
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(10, 8), M('floor', {map: ft, flatShading: false})); floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; sh.add(floor);
    const wt = CFG.parts.walls.type; const rep = {pegboard: 1.6, brick: 1.1, plaster: 0.5, 'wood panels': 1.2}[wt] || 1;
    const wall = (w, ry, px, pz) => { const t = wallTex(wt); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(w * rep, 4.2 * rep); const m = new THREE.Mesh(new THREE.PlaneGeometry(w, 4.2), M('walls', {map: t, flatShading: false})); m.rotation.y = ry; m.position.set(px, 2.1, pz); m.receiveShadow = true; sh.add(m); };
    wall(10, 0, 0, -4); wall(8, Math.PI / 2, -5, 0); wall(8, -Math.PI / 2, 5, 0);
    if (!R.aoTex) R.aoTex = ctex(8, 128, (x, w, h) => { const g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, 'rgba(0,0,0,0.55)'); g.addColorStop(0.35, 'rgba(0,0,0,0.18)'); g.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = g; x.fillRect(0, 0, w, h); });
    const aoM = new THREE.MeshBasicMaterial({map: R.aoTex, transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2});
    const ao = (w, hgt, px, py, pz, rx, ry, rz) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, hgt), aoM); m.position.set(px, py, pz); m.rotation.set(rx, ry, rz); m.renderOrder = 1; m.raycast = () => {}; sh.add(m); };
    ao(10, 0.7, 0, 0.004, -3.65, -Math.PI / 2, 0, 0); ao(8, 0.7, -4.65, 0.004, 0, -Math.PI / 2, 0, Math.PI / 2); ao(8, 0.7, 4.65, 0.004, 0, -Math.PI / 2, 0, -Math.PI / 2);   // floor along each wall
    ao(10, 0.9, 0, 0.45, -3.985, 0, 0, Math.PI); ao(8, 0.9, -4.985, 0.45, 0, 0, Math.PI / 2, Math.PI); ao(8, 0.9, 4.985, 0.45, 0, 0, -Math.PI / 2, Math.PI); // wall bottoms
    ao(4.2, 0.6, -4.7, 2.1, -3.985, 0, 0, Math.PI / 2); ao(4.2, 0.6, 4.7, 2.1, -3.985, 0, 0, -Math.PI / 2); ao(4.2, 0.6, -4.985, 2.1, -3.7, 0, Math.PI / 2, -Math.PI / 2); ao(4.2, 0.6, 4.985, 2.1, -3.7, 0, -Math.PI / 2, Math.PI / 2); // back corners
    box(10, 0.16, 0.06, '#1d2030', 0, 0.08, -3.97, sh); box(0.06, 0.16, 8, '#1d2030', -4.97, 0.08, 0, sh); box(0.06, 0.16, 8, '#1d2030', 4.97, 0.08, 0, sh);
    WINS.slice(0, Math.max(1, Math.min(4, CFG.windows.count))).forEach(W => {
      const st = CFG.windows.style === 'arched' && W.w / W.h > 1.8 ? 'square' : CFG.windows.style;
      const wg = new THREE.Group(); wg.position.set(...W.p); wg.rotation.y = W.ry; sh.add(wg);
      const r = Math.min(W.w, W.h) / 2;
      let glass;
      if (st === 'round') { glass = new THREE.Mesh(new THREE.CircleGeometry(r, 36), new THREE.MeshBasicMaterial({map: R.skyTex})); const ring = new THREE.Mesh(new THREE.TorusGeometry(r, 0.05, 8, 36), M('winframe')); ring.position.z = 0.03; wg.add(ring); box(0.06, r * 2, 0.04, 'winframe', 0, 0, 0.03, wg); box(r * 2, 0.06, 0.04, 'winframe', 0, 0, 0.03, wg); }
      else if (st === 'arched') {
        glass = new THREE.Mesh(new THREE.PlaneGeometry(W.w, W.h), new THREE.MeshBasicMaterial({map: R.skyTex, alphaMap: R.archMask, transparent: true, alphaTest: 0.5}));
        const rr = W.w / 2; const sideH = W.h - rr;
        box(0.08, sideH, 0.08, 'winframe', -W.w / 2, -W.h / 2 + sideH / 2, 0.02, wg); box(0.08, sideH, 0.08, 'winframe', W.w / 2, -W.h / 2 + sideH / 2, 0.02, wg); box(W.w + 0.08, 0.08, 0.08, 'winframe', 0, -W.h / 2, 0.02, wg);
        const arc = new THREE.Mesh(new THREE.TorusGeometry(rr, 0.04, 8, 30, Math.PI), M('winframe')); arc.position.set(0, W.h / 2 - rr, 0.02); wg.add(arc); box(0.05, W.h, 0.04, 'winframe', 0, 0, 0.02, wg);
      } else {
        glass = new THREE.Mesh(new THREE.PlaneGeometry(W.w, W.h), new THREE.MeshBasicMaterial({map: R.skyTex}));
        [[0, W.h / 2, W.w + 0.16, 0.08], [0, -W.h / 2, W.w + 0.16, 0.08], [-W.w / 2, 0, 0.08, W.h + 0.08], [W.w / 2, 0, 0.08, W.h + 0.08], [0, 0, 0.05, W.h]].forEach(([dx, dy, w, h]) => box(w, h, 0.08, 'winframe', dx, dy, 0.03, wg));
      }
      wg.add(glass);
      box(st === 'round' ? r * 2 + 0.2 : W.w + 0.25, 0.06, 0.2, 'winframe', 0, (st === 'round' ? -r : -W.h / 2) - 0.04, 0.1, wg);
    });
  }
  function buildThermostat() {
    const g = group('thermostat'); const cx = -4.4, cy = 2.5, z0 = -3.96;
    const base = cyl(0.21, 0.21, 0.05, '#fffdf7', cx, cy, z0, g, 32); base.rotation.x = Math.PI / 2;
    // the bezel is a real knob: a group that turns, with grip ridges so the turn is visible
    R.thermoRing = new THREE.Group(); R.thermoRing.position.set(cx, cy, -3.93); g.add(R.thermoRing);
    const rim = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.025, 8, 32), mat('#1d2030')); rim.userData.tpart = 'ring'; R.thermoRing.add(rim);
    for (let k = 0; k < 24; k++) { const a = k / 24 * Math.PI * 2; const r = box(0.012, 0.03, 0.02, k % 6 ? '#3a3f55' : '#ffc83a', Math.cos(a) * 0.2, Math.sin(a) * 0.2, 0.022, R.thermoRing); r.rotation.z = a; r.userData.tpart = 'ring'; }
    R.thermoRing.rotation.z = R.thermoTurn || 0;
    const cv = R.thermoCv || (R.thermoCv = Object.assign(document.createElement('canvas'), {width: 512, height: 512}));
    R.thermoTex = new THREE.CanvasTexture(cv); R.thermoTex.anisotropy = 4;
    R.thermo = new THREE.Mesh(new THREE.CircleGeometry(0.18, 48), new THREE.MeshBasicMaterial({color: 0xffffff, map: R.thermoTex})); R.thermo.position.set(cx, cy, -3.925); R.thermo.userData.tpart = 'screen'; g.add(R.thermo);
    // an invisible, wider grip so the ring is easy to catch with a finger or a pinch
    const grip = new THREE.Mesh(new THREE.TorusGeometry(0.205, 0.04, 6, 32), new THREE.MeshBasicMaterial({transparent: true, opacity: 0, depthWrite: false})); grip.userData.tpart = 'ring'; R.thermoRing.add(grip);
    drawThermo();
  }
  function drawThermo() {
    if (!R || !R.thermo || !R.thermoCv) return;
    const x = R.thermoCv.getContext('2d'), w = 512, h = 512; x.setTransform(1, 0, 0, 1, 0, 0); x.clearRect(0, 0, w, h);
    if (R.thermoOn && window.ThermoUI) ThermoUI.paint(x, w, h);
    else {
      const we = weather(), ph = phase(); const temp = {clear: 31, cloudy: 29, rain: 26, thunderstorm: 25, snow: -2}[we];
      x.scale(2, 2);
      const g = x.createRadialGradient(128, 128, 20, 128, 128, 128); g.addColorStop(0, '#2b3350'); g.addColorStop(1, '#141828'); x.fillStyle = g; x.fillRect(0, 0, 256, 256);
      x.strokeStyle = CFG.mood === 'neon' ? '#ff3ea5' : '#ffc83a'; x.lineWidth = 10; x.lineCap = 'round'; x.beginPath(); x.arc(128, 128, 100, Math.PI * 0.75, Math.PI * (0.75 + 1.5 * (CFG.brightness - 40) / 120)); x.stroke();
      x.fillStyle = '#fffdf7'; x.textAlign = 'center'; x.font = '800 64px Figtree, sans-serif'; x.fillText(temp + '°', 128, 140);
      x.font = '700 24px Figtree, sans-serif'; x.fillStyle = '#9fd8ff'; x.fillText(cap(we === 'thunderstorm' ? 'storm' : we), 128, 182);
      x.fillStyle = '#ffc83a'; x.font = '600 20px Figtree, sans-serif'; x.fillText(ph, 128, 84);
    }
    R.thermoTex.needsUpdate = true;
  }
  // what part of the thermostat sits under a screen point: the touch screen (with canvas coordinates), the turning ring, or a button
  function thermoHitAt(cx, cy) {
    const el = R.renderer.domElement, r = el.getBoundingClientRect(); const v2 = new THREE.Vector2(((cx - r.left) / r.width) * 2 - 1, -((cy - r.top) / r.height) * 2 + 1);
    const ray = new THREE.Raycaster(); ray.setFromCamera(v2, R.camera); const g = R.groups.thermostat; if (!g) return null;
    const hit = ray.intersectObject(g, true).find(h => h.object.userData.tpart); if (!hit) return null; const o = hit.object, tp = o.userData.tpart;
    if (tp === 'screen' && hit.uv) return {part: 'screen', x: hit.uv.x * 512, y: (1 - hit.uv.y) * 512};
    if (tp === 'ring') { const lx = hit.point.x - R.thermoRing.position.x; return {part: 'ring', side: lx < 0 ? -1 : 1}; }
    return {part: 'plate'};
  }
  function thermoPick(cx, cy, generous) {
    const h0 = thermoHitAt(cx, cy); if (h0 && h0.part !== 'plate') return h0; if (!generous) return h0;
    const rad = Math.max(22, Math.min(innerWidth, innerHeight) * 0.04);
    for (const f of [0.5, 1]) for (let k = 0; k < 8; k++) { const a = k / 8 * 6.283 + f; const h = thermoHitAt(cx + Math.cos(a) * rad * f, cy + Math.sin(a) * rad * f); if (h && h.part !== 'plate' && h.part !== 'screen') return h; }
    return h0;
  }
  function thermoTurn(dir) { if (!R || !R.thermoRing) return; R.thermoTurn = (R.thermoTurn || 0) - dir * Math.PI / 12; R.thermoSpin = {from: R.thermoRing.rotation.z, to: R.thermoTurn, t0: performance.now()}; if (CFG.sound) tick(); }
  function twist(d) { thermoTurn(d); if (window.ThermoUI) ThermoUI.turn(d); }
  function tick() { try { const ac = R.ac || (R.ac = new (window.AudioContext || window.webkitAudioContext)()); const o = ac.createOscillator(), gn = ac.createGain(); o.type = 'square'; o.frequency.value = 1800; gn.gain.setValueAtTime(0.03, ac.currentTime); gn.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + 0.04); o.connect(gn); gn.connect(ac.destination); o.start(); o.stop(ac.currentTime + 0.05); } catch (e) {} }
  function buildPortfolio() {
    const g = group('portfolio'); const x0 = -4.93, cz = 3.0, cy = 2.42, W = 1.7, H = 1.25;
    const fr = new THREE.Group(); fr.position.set(x0, cy, cz); fr.rotation.y = Math.PI / 2; g.add(fr);
    box(W + 0.12, H + 0.12, 0.05, 'frames', 0, 0, 0, fr);
    const works = window.WORKS || [];
    const tex = ctex(1360, 1000, (x, w, h) => {
      x.fillStyle = '#f6efe2'; x.fillRect(0, 0, w, h);
      for (let i = 0; i < 1400; i++) { x.fillStyle = Math.random() < 0.5 ? 'rgba(120,90,50,.06)' : 'rgba(255,255,255,.25)'; x.fillRect(Math.random() * w, Math.random() * h, 3, 3); }
      x.fillStyle = '#1d2030'; x.font = '800 54px Figtree, sans-serif'; x.textBaseline = 'middle'; x.fillText('Portfolio', 40, 56);
      const cols = works.length || 1, cw = (w - 60) / cols;
      works.forEach(([k, name, col, items], ci) => {
        const cx = 30 + ci * cw; x.fillStyle = col; x.fillRect(cx + 8, 110, cw - 16, 50); x.fillStyle = col === '#ffc83a' || col === '#ff8fc8' ? '#1d2030' : '#fff'; x.font = '800 24px Figtree, sans-serif'; x.fillText(name, cx + 20, 136, cw - 40);
        const rowH = Math.min(70, (h - 200) / items.length);
        items.forEach(([t], i) => { const y = 180 + i * rowH; x.fillStyle = '#fff'; x.fillRect(cx + 8, y, cw - 16, rowH - 8); x.fillStyle = col; x.fillRect(cx + 8, y, 8, rowH - 8); x.fillStyle = '#1d2030'; x.font = `700 ${Math.min(22, rowH * 0.42)}px Figtree, sans-serif`; x.fillText(t, cx + 26, y + (rowH - 8) / 2, cw - 44); });
      });
    });
    const face = new THREE.Mesh(new THREE.PlaneGeometry(W, H), new THREE.MeshStandardMaterial({map: tex, emissive: 0xffffff, emissiveMap: tex, emissiveIntensity: 0.55, roughness: 0.9, envMapIntensity: 0.2})); face.position.z = 0.03; face.receiveShadow = true; fr.add(face);
    // a little picture light above the board
    const bar = cyl(0.025, 0.025, 0.6, '#1d2030', 0, H / 2 + 0.16, 0.12, fr); bar.rotation.z = Math.PI / 2;
  }
  function buildWorkbench() {
    const g = group('workbench'); const t = CFG.parts.desk.type;
    let top = 0.92, tilt = 0;
    if (t === 'standing') { top = 1.22; box(2.4, 0.08, 1.0, 'desk', -3, top, -3.3, g); [-1.05, 1.05].forEach(dx => box(0.12, top - 0.04, 0.8, '#1d2030', -3 + dx, (top - 0.04) / 2, -3.3, g)); box(2.1, 0.06, 0.06, '#1d2030', -3, 0.25, -3.3, g); }
    else if (t === 'drafting') {
      const tp = new THREE.Group(); tp.position.set(-3.3, top, -3.3); tp.rotation.x = 0.3; g.add(tp); box(1.6, 0.06, 1.0, 'desk', 0, 0, 0, tp); box(1.6, 0.05, 0.05, '#1d2030', 0, 0.04, 0.5, tp);
      box(0.8, 0.06, 0.9, 'desk', -2.0, top - 0.06, -3.3, g); tilt = 0.3;
      [[-0.6, -1], [0.6, 1]].forEach(([dx, s]) => { const l1 = box(0.06, 1.1, 0.06, '#1d2030', -3.3 + dx, 0.45, -3.3, g); l1.rotation.x = 0.45; const l2 = box(0.06, 1.1, 0.06, '#1d2030', -3.3 + dx, 0.45, -3.3, g); l2.rotation.x = -0.45; });
      box(0.06, top - 0.1, 0.06, '#1d2030', -1.7, (top - 0.1) / 2, -3.0, g); box(0.06, top - 0.1, 0.06, '#1d2030', -1.7, (top - 0.1) / 2, -3.6, g);
    } else if (!place('table', g, {x: -3, z: -3.3, size: [2.1, top + 0.04, 1.0], tint: 'desk'})) { box(2.4, 0.08, 1.05, 'desk', -3, top, -3.3, g); [[-1.1, -0.45], [1.1, -0.45], [-1.1, 0.45], [1.1, 0.45]].forEach(([dx, dz]) => box(0.08, top - 0.04, 0.08, '#1d2030', -3 + dx, (top - 0.04) / 2, -3.3 + dz, g)); }
    const flatY = t === 'drafting' ? top - 0.03 : top + 0.04;
    R.bookG = new THREE.Group(); R.bookG.position.set(t === 'drafting' ? -3.3 : -3.05, top + 0.04 + (t === 'drafting' ? 0.02 : 0), t === 'drafting' ? -3.25 : -3.15); R.bookG.rotation.x = tilt; g.add(R.bookG);
    R.book = box(1.02, 0.04, 0.66, '#2f5bea', 0, 0, 0, R.bookG);
    R.pages = new THREE.Mesh(new THREE.PlaneGeometry(0.98, 0.62), mat('#ffffff', {flatShading: false, roughness: 0.95})); R.pages.rotation.x = -Math.PI / 2; R.pages.receiveShadow = true; R.bookG.add(R.pages);
    const lx = t === 'drafting' ? -2.2 : -3.85, lz = -3.5, lt = CFG.parts.lamp.type;
    if (lt === 'globe') { cyl(0.12, 0.14, 0.04, '#1d2030', lx, flatY + 0.02, lz, g); cyl(0.015, 0.015, 0.5, '#1d2030', lx, flatY + 0.27, lz, g, 6); const gl = sph(0.14, 'lamp', lx, flatY + 0.62, lz, g, {flatShading: false, roughness: 0.3}); R.shadeMat = gl.material; R.lamp.position.set(lx, flatY + 0.62, lz + 0.2); }
    else if (lt === 'candle') { cyl(0.09, 0.11, 0.03, '#1d2030', lx, flatY + 0.015, lz, g); cyl(0.05, 0.05, 0.22, 'lamp', lx, flatY + 0.14, lz, g, 12); const fl = new THREE.Mesh(new THREE.ConeGeometry(0.025, 0.07, 8), new THREE.MeshBasicMaterial({color: 0xffd36b})); fl.position.set(lx, flatY + 0.29, lz); g.add(fl); R.flame = fl; R.shadeMat = null; R.lamp.position.set(lx, flatY + 0.4, lz + 0.15); }
    else if (place('armlamp', g, {x: lx, y: flatY, z: lz, h: 0.62, ry: Math.PI * 0.75})) { R.shadeMat = null; R.lamp.position.set(lx + 0.18, flatY + 0.5, lz + 0.22); const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.035, 12, 10), new THREE.MeshBasicMaterial({color: 0xfff1cf})); bulb.position.copy(R.lamp.position).add(new THREE.Vector3(0, 0.02, 0)); bulb.raycast = () => {}; g.add(bulb); }
    else { cyl(0.14, 0.18, 0.05, '#1d2030', lx, flatY + 0.025, lz, g); cyl(0.025, 0.025, 0.65, '#1d2030', lx, flatY + 0.35, lz, g); const sh = cyl(0.08, 0.24, 0.24, 'lamp', lx + 0.1, flatY + 0.72, lz + 0.15, g, 20); R.shadeMat = sh.material; R.lamp.position.set(lx + 0.1, flatY + 0.62, lz + 0.2); }
    if (lt !== 'candle') R.flame = null;
    const cx = t === 'drafting' ? -1.8 : -2.0;
    if (!place('pens', g, {x: cx - 0.05, y: flatY, z: -3.55, h: 0.17, ry: -0.3})) { cyl(0.09, 0.07, 0.16, '#ff5b4f', cx, flatY + 0.08, -3.55, g);
    ['#2f5bea', '#ffc83a', '#1fae7a'].forEach((c, i) => { const p = cyl(0.012, 0.012, 0.3, c, cx - 0.02 + i * 0.03, flatY + 0.24, -3.55 + (i - 1) * 0.02, g, 6); p.rotation.z = (i - 1) * 0.15; }); }
    if (t !== 'drafting') place('spray', g, {x: -2.25, y: flatY, z: -2.98, h: 0.2, ry: 0.4});
    R.plantPos = [cx - 0.35, flatY, -3.62]; cyl(0.1, 0.08, 0.14, '#c46a3c', R.plantPos[0], flatY + 0.07, R.plantPos[2], g);
    if (t !== 'standing' && !place('stool', g, {x: -3, z: -2.4, h: 0.62, tint: 'stool'})) box(0.5, 0.45, 0.5, 'stool', -3, 0.5, -2.4, g);
    place('plant', g, {x: -4.5, z: -3.45, h: 0.95, ry: 0.6});
  }
  function buildPinboard() {
    const g = group('pinboard');
    const cork = ctex(512, 320, (x, w, h) => { x.fillStyle = '#d8a467'; x.fillRect(0, 0, w, h); for (let i = 0; i < 1600; i++) { x.fillStyle = Math.random() < 0.5 ? 'rgba(0,0,0,.12)' : 'rgba(255,255,255,.14)'; x.fillRect(Math.random() * w, Math.random() * h, 2, 2); } });
    box(2.6, 1.6, 0.05, '#ffffff', 0, 2.15, -3.95, g, {map: cork, flatShading: false});
    [[0, 0.82, 2.72, 0.08], [0, -0.82, 2.72, 0.08], [-1.32, 0, 0.08, 1.72], [1.32, 0, 0.08, 1.72]].forEach(([dx, dy, w, h]) => box(w, h, 0.08, 'pinboard', dx, 2.15 + dy, -3.93, g));
  }
  function buildMachine() {
    const g = group('machine'); const t = CFG.parts.machine.type;
    R.lever = new THREE.Group(); g.add(R.lever);
    const glassMat = () => new THREE.MeshStandardMaterial({color: 0xdff1ff, transparent: true, opacity: 0.22, roughness: 0.1, metalness: 0.1});
    if (t === 'robot') {
      box(0.8, 0.9, 0.6, 'machine', 1.9, 0.5, -3.1, g); const belly = new THREE.Mesh(new THREE.SphereGeometry(0.24, 24, 16), glassMat()); belly.position.set(1.9, 0.55, -2.8); g.add(belly);
      box(0.56, 0.42, 0.46, 'machine', 1.9, 1.17, -3.1, g); [-0.12, 0.12].forEach(dx => sph(0.06, '#00e0ff', 1.9 + dx, 1.22, -2.86, g, {emissive: 0x00a0c0})); box(0.2, 0.03, 0.02, '#1d2030', 1.9, 1.08, -2.865, g);
      cyl(0.015, 0.015, 0.22, '#1d2030', 1.9, 1.49, -3.1, g, 6); sph(0.05, '#ff5b4f', 1.9, 1.62, -3.1, g, {emissive: 0x551010});
      box(0.12, 0.5, 0.12, 'machine', 1.42, 0.65, -3.1, g); R.lever.position.set(2.38, 0.85, -3.1); const arm = box(0.12, 0.5, 0.12, 'machine', 0, -0.25, 0, R.lever); arm.position.y = -0.2; sph(0.08, '#ffc83a', 0, -0.48, 0, R.lever);
      box(0.22, 0.12, 0.3, '#1d2030', 1.75, 0.06, -3.1, g); box(0.22, 0.12, 0.3, '#1d2030', 2.05, 0.06, -3.1, g);
      R.ballSpot = {x: 1.9, y: 0.4, z: -2.8, r: 0.13, step: 0.07, sz: 0.05};
    } else if (t === 'arcade') {
      box(0.9, 1.9, 0.75, 'machine', 1.9, 0.95, -3.15, g); const marquee = box(0.92, 0.22, 0.2, '#ffc83a', 1.9, 1.95, -2.82, g, {emissive: 0x665000});
      box(0.86, 0.08, 0.35, '#1d2030', 1.9, 1.0, -2.65, g);
      const win = new THREE.Mesh(new THREE.BoxGeometry(0.66, 0.5, 0.16), glassMat()); win.position.set(1.9, 1.45, -2.74); g.add(win);
      R.lever.position.set(2.1, 1.05, -2.6); cyl(0.02, 0.02, 0.2, '#1d2030', 0, 0.1, 0, R.lever, 6); sph(0.05, '#ff5b4f', 0, 0.22, 0, R.lever);
      [1.7, 1.8].forEach(px => cyl(0.03, 0.03, 0.02, PAL[(px * 10) % 5 | 0], px, 1.05, -2.6, g, 12));
      box(0.3, 0.08, 0.04, '#1d2030', 1.9, 0.45, -2.76, g);
      R.ballSpot = {x: 1.9, y: 1.26, z: -2.74, r: 0.26, step: 0.1, sz: 0.06, flat: true};
    } else {
      box(0.9, 1.0, 0.7, 'machine', 1.9, 0.5, -3.1, g); box(0.94, 0.06, 0.74, '#1d2030', 1.9, 1.02, -3.1, g); cyl(0.3, 0.36, 0.12, '#1d2030', 1.9, 1.1, -3.1, g);
      box(0.24, 0.16, 0.04, '#1d2030', 1.9, 0.55, -2.74, g); box(0.1, 0.12, 0.03, '#ffc83a', 1.9, 0.78, -2.74, g);
      const dome = new THREE.Mesh(new THREE.SphereGeometry(0.44, 28, 18), glassMat()); dome.position.set(1.9, 1.52, -3.1); g.add(dome); cyl(0.06, 0.06, 0.08, '#ffc83a', 1.9, 1.98, -3.1, g);
      R.lever.position.set(2.37, 0.7, -3.1); cyl(0.03, 0.03, 0.55, '#1d2030', 0, 0.27, 0, R.lever, 8); sph(0.08, '#ffc83a', 0, 0.56, 0, R.lever);
      R.ballSpot = {x: 1.9, y: 1.2, z: -3.1, r: 0.28, step: 0.12, sz: 0.075};
    }
  }
  function buildMirror() {
    const g = group('mirror'); const t = CFG.parts.mirror.type;
    const mg = new THREE.Group(); mg.position.set(3.85, 0, -3.0); mg.rotation.y = -0.55; g.add(mg);
    box(0.06, 1.0, 0.06, '#1d2030', -0.35, 0.5, 0, mg); box(0.06, 1.0, 0.06, '#1d2030', 0.35, 0.5, 0, mg); box(0.8, 0.06, 0.3, '#1d2030', 0, 0.03, 0, mg);
    let gw = 1.0, gh = 1.55, cy = 1.45;
    if (t === 'round') { gh = 1.0; cy = 1.5; const ring = new THREE.Mesh(new THREE.TorusGeometry(0.52, 0.06, 10, 40), M('mirror')); ring.position.set(0, cy, 0); ring.castShadow = true; mg.add(ring); }
    else if (t === 'arched') { gw = 0.9; gh = 1.4; cy = 1.5; box(0.08, gh - 0.45, 0.08, 'mirror', -0.47, cy - 0.225, 0, mg); box(0.08, gh - 0.45, 0.08, 'mirror', 0.47, cy - 0.225, 0, mg); box(1.02, 0.08, 0.08, 'mirror', 0, cy - gh / 2, 0, mg); const arc = new THREE.Mesh(new THREE.TorusGeometry(0.47, 0.045, 8, 30, Math.PI), M('mirror')); arc.position.set(0, cy + gh / 2 - 0.45, 0); mg.add(arc); }
    else { const ring = new THREE.Mesh(new THREE.TorusGeometry(0.52, 0.05, 10, 40), M('mirror')); ring.scale.set(1, 1.55, 1); ring.position.set(0, cy, 0); ring.castShadow = true; mg.add(ring); }
    R.mirrorType = t; R.glass = new THREE.Mesh(new THREE.PlaneGeometry(gw, gh), new THREE.MeshStandardMaterial({color: 0xffffff, roughness: 0.2, metalness: 0.15, transparent: true, alphaTest: 0.5})); R.glass.position.set(0, cy, 0.01); mg.add(R.glass); R.glassSize = [gw, gh];
  }
  function buildBoard() {
    const g = group('wall'); const t = CFG.parts.board.type; R.boardType = t;
    if (t === 'easel') {
      const eg = new THREE.Group(); eg.position.set(4.2, 0, -0.4); eg.rotation.y = -Math.PI / 2; g.add(eg);
      [[-0.45, 0.25], [0.45, 0.25]].forEach(([dx, rz]) => { const l = box(0.06, 2.0, 0.06, 'board', dx, 1.0, 0, eg); l.rotation.z = dx < 0 ? -0.12 : 0.12; l.rotation.x = -0.12; });
      const back = box(0.06, 1.9, 0.06, 'board', 0, 0.95, -0.35, eg); back.rotation.x = 0.25; box(1.3, 0.05, 0.12, 'board', 0, 0.85, 0.02, eg);
      R.chalk = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 1.0), mat('#ffffff', {flatShading: false, roughness: 0.95})); R.chalk.position.set(0, 1.4, 0.06); R.chalk.rotation.x = -0.12; eg.add(R.chalk);
      box(0.05, 1.0, 0.05, '#fffdf7', 0, 1.4, 0.03, eg).visible = false;
    } else {
      box(0.06, 1.75, 2.95, 'board', 4.96, 2.0, -0.4, g);
      R.chalk = new THREE.Mesh(new THREE.PlaneGeometry(2.75, 1.58), mat('#ffffff', {flatShading: false, roughness: t === 'whiteboard' ? 0.35 : 0.95})); R.chalk.rotation.y = -Math.PI / 2; R.chalk.position.set(4.92, 2.0, -0.4); g.add(R.chalk);
      box(0.16, 0.05, 2.7, 'board', 4.86, 1.1, -0.4, g);
      [0, 1, 2].forEach(i => box(t === 'whiteboard' ? 0.04 : 0.03, 0.03, t === 'whiteboard' ? 0.16 : 0.12, t === 'whiteboard' ? ['#2f5bea', '#ff5b4f', '#1d2030'][i] : ['#ffffff', '#ffc83a', '#ff8fc8'][i], 4.86, 1.14, -1.2 + i * 0.25, g));
    }
  }
  function buildGallery() {
    const g = group('gallery');
    for (let i = 0; i < 4; i++) { box(0.62, 0.06, 0.06, 'crate', -4.62, 0.12 + i * 0.12, 1.78, g); box(0.62, 0.06, 0.06, 'crate', -4.62, 0.12 + i * 0.12, 2.42, g); box(0.06, 0.06, 0.62, 'crate', -4.92, 0.12 + i * 0.12, 2.1, g); box(0.06, 0.06, 0.62, 'crate', -4.32, 0.12 + i * 0.12, 2.1, g); }
  }
  function starShape(ro, ri, n) { const s = new THREE.Shape(); for (let i = 0; i < n * 2; i++) { const r = i % 2 ? ri : ro, a = i / (n * 2) * Math.PI * 2 + Math.PI / 2; const px = Math.cos(a) * r, py = Math.sin(a) * r; i ? s.lineTo(px, py) : s.moveTo(px, py); } s.closePath(); return s; }
  function seat(k, x, z, g) {
    const t = CFG.parts[k].type;
    if (t === 'beanbag') { const b = sph(0.36, k, x, 0.24, z, g, {flatShading: false}); b.scale.set(1, 0.65, 1); }
    else if (t === 'armchair') { box(0.7, 0.3, 0.7, k, x, 0.25, z, g); const bz = z + (z > 1.6 ? 0.3 : -0.3); box(0.7, 0.55, 0.14, k, x, 0.55, bz, g); box(0.14, 0.4, 0.7, k, x - 0.33, 0.45, z, g); box(0.14, 0.4, 0.7, k, x + 0.33, 0.45, z, g); }
    else { cyl(0.26, 0.24, 0.1, k, x, 0.48, z, g, 20); [[-0.15, -0.15], [0.15, -0.15], [-0.15, 0.15], [0.15, 0.15]].forEach(([dx, dz]) => cyl(0.025, 0.025, 0.44, '#1d2030', x + dx, 0.22, z + dz, g, 6)); }
  }
  function buildCorner() {
    const g = group('corner'); const rt = CFG.parts.rug.type;
    if (rt === 'square') { const rug = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 2.2), M('trim', {flatShading: false})); rug.rotation.x = -Math.PI / 2; rug.position.set(1.7, 0.012, 1.6); rug.receiveShadow = true; g.add(rug); const r2 = new THREE.Mesh(new THREE.PlaneGeometry(2.3, 1.9), M('rug', {flatShading: false})); r2.rotation.x = -Math.PI / 2; r2.position.set(1.7, 0.016, 1.6); r2.receiveShadow = true; g.add(r2); }
    else if (rt === 'star') { const rug = new THREE.Mesh(new THREE.ShapeGeometry(starShape(1.45, 0.75, 5)), M('rug', {flatShading: false})); rug.rotation.x = -Math.PI / 2; rug.position.set(1.7, 0.012, 1.6); rug.receiveShadow = true; g.add(rug); const r2 = new THREE.Mesh(new THREE.ShapeGeometry(starShape(0.7, 0.36, 5)), M('trim', {flatShading: false})); r2.rotation.x = -Math.PI / 2; r2.position.set(1.7, 0.016, 1.6); g.add(r2); }
    else { const rug = new THREE.Mesh(new THREE.CircleGeometry(1.3, 40), M('rug', {flatShading: false})); rug.rotation.x = -Math.PI / 2; rug.position.set(1.7, 0.012, 1.6); rug.receiveShadow = true; g.add(rug); const r2 = new THREE.Mesh(new THREE.RingGeometry(1.0, 1.1, 40), M('trim', {flatShading: false})); r2.rotation.x = -Math.PI / 2; r2.position.set(1.7, 0.016, 1.6); g.add(r2); }
    cyl(0.4, 0.4, 0.06, 'table', 1.7, 0.62, 1.6, g, 24); cyl(0.05, 0.05, 0.6, '#1d2030', 1.7, 0.31, 1.6, g); cyl(0.25, 0.25, 0.03, '#1d2030', 1.7, 0.02, 1.6, g);
    seat('seat1', 0.9, 1.15, g); seat('seat2', 2.5, 2.05, g);
    [[1.55, 1.5, '#ffc83a'], [1.88, 1.72, '#ff5b4f']].forEach(([x, z, c]) => cyl(0.06, 0.05, 0.1, c, x, 0.7, z, g, 12));
    place('chair', g, {x: 3.0, z: 0.75, h: 1.0, ry: -2.1, tint: 'seat2'});
    if (place('shelf', g, {x: 4.78, z: 2.35, h: 1.45, ry: -Math.PI / 2})) { place('books', g, {x: 4.78, y: 1.45, z: 2.33, h: 0.24, ry: -Math.PI / 2}); place('radio', g, {x: 4.8, y: 1.45, z: 1.95, h: 0.22, ry: -Math.PI / 2}); place('vase', g, {x: 4.78, y: 1.45, z: 2.73, h: 0.3}); }
    cyl(0.4, 0.42, 0.1, 'bed', 3.9, 0.05, 3.0, g, 24); const rim = new THREE.Mesh(new THREE.TorusGeometry(0.4, 0.08, 10, 28), M('bed')); rim.rotation.x = Math.PI / 2; rim.position.set(3.9, 0.12, 3.0); rim.castShadow = true; g.add(rim);
  }
  function buildPlayground() {
    const g = group('playground');
    const slideX = -3.6, slideZ = 3.0;
    [-0.22, 0.22].forEach(dz => box(0.05, 1.3, 0.05, 'ladder', slideX - 0.55, 0.65, slideZ + dz, g));
    for (let i = 0; i < 5; i++) box(0.05, 0.04, 0.44, 'ladder', slideX - 0.55, 0.2 + i * 0.25, slideZ, g);
    box(0.5, 0.06, 0.5, 'ladder', slideX - 0.32, 1.3, slideZ, g);
    const ramp = box(1.6, 0.05, 0.5, 'slide', slideX + 0.55, 0.7, slideZ, g); ramp.rotation.z = -0.62;
    [-0.27, 0.27].forEach(dz => { const r = box(1.6, 0.1, 0.03, 'slide', slideX + 0.55, 0.76, slideZ + dz, g); r.rotation.z = -0.62; });
    const pitX = -1.9, pitZ = 2.6;
    place('duck', g, {x: pitX + 0.3, y: 0.3, z: pitZ - 0.15, h: 0.22, ry: 0.8}); place('ball', g, {x: -2.95, y: 0, z: 1.55, h: 0.075});
    box(1.4, 0.36, 0.08, 'pit', pitX, 0.18, pitZ - 0.66, g); box(1.4, 0.36, 0.08, 'pit', pitX, 0.18, pitZ + 0.66, g); box(0.08, 0.36, 1.4, 'pit', pitX - 0.66, 0.18, pitZ, g); box(0.08, 0.36, 1.4, 'pit', pitX + 0.66, 0.18, pitZ, g);
    const inst = new THREE.InstancedMesh(new THREE.SphereGeometry(0.08, 10, 8), new THREE.MeshStandardMaterial({roughness: 0.5}), 90); const dm = new THREE.Object3D();
    for (let i = 0; i < 90; i++) { dm.position.set(pitX + ((i * 0.6180339) % 1 - 0.5) * 1.15, 0.08 + ((i * 0.3819) % 1) * 0.2, pitZ + ((i * 0.7548) % 1 - 0.5) * 1.15); dm.updateMatrix(); inst.setMatrixAt(i, dm.matrix); inst.setColorAt(i, new THREE.Color(PAL[i % 5])); }
    inst.castShadow = true; g.add(inst);
    R.stickerSheet = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.9), mat('#ffffff', {flatShading: false})); R.stickerSheet.rotation.y = Math.PI / 2; R.stickerSheet.position.set(-4.96, 1.55, 3.0); g.add(R.stickerSheet);
  }
  function rebuildAll() {
    if (!R) return;
    buildShell(); buildThermostat(); buildWorkbench(); buildPinboard(); buildMachine(); buildMirror(); buildBoard(); buildGallery(); buildCorner(); buildPlayground(); buildPortfolio();
    [R.shell, ...Object.values(R.groups)].forEach(mergeEdges);
    applyLights(); refreshDyn(); R.obstacles = obstacles();
  }
  function recolor(key) { const c = CFG.parts[key].color; R.scene.traverse(o => { if (o.material && o.material.userData && o.material.userData.part === key) o.material.color.set(c); else if (o.material && o.material.userData && o.material.userData.tintPart === key) o.material.color.set('#ffffff').lerp(new THREE.Color(c), 0.3); }); }

  /* dynamic, data-driven parts */
  function drawJournal() {
    const ents = withEx('entry'); const e = ents[0]; const th = CFG.parts.board.type;
    setMap(R.pages, ctex(1024, 648, (x, w, h) => {
      x.fillStyle = '#fffaf0'; x.fillRect(0, 0, w, h);
      const sp = x.createLinearGradient(w / 2 - 30, 0, w / 2 + 30, 0); sp.addColorStop(0, 'rgba(0,0,0,0)'); sp.addColorStop(0.5, 'rgba(0,0,0,.18)'); sp.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = sp; x.fillRect(w / 2 - 30, 0, 60, h);
      x.strokeStyle = 'rgba(47,91,234,.18)'; x.lineWidth = 2; for (let y = 120; y < h - 30; y += 44) { x.beginPath(); x.moveTo(40, y); x.lineTo(w / 2 - 40, y); x.moveTo(w / 2 + 40, y); x.lineTo(w - 40, y); x.stroke(); }
      x.fillStyle = '#1d2030'; x.font = '700 46px Caveat, cursive'; x.fillText(e ? fmtDate(e.created) : 'My journal', 60, 80);
      x.font = '500 34px Caveat, cursive'; x.fillStyle = '#585d70';
      wrapText(x, e && e.prompt ? e.prompt : `${mine('entry').length} entries so far. Keep going.`, w / 2 - 110).slice(0, 7).forEach((l, i) => x.fillText(l, 60, 150 + i * 44));
      x.fillStyle = '#1d2030'; x.font = '500 36px Caveat, cursive';
      wrapText(x, e ? e.text : 'Write something today.', w / 2 - 110).slice(0, 11).forEach((l, i) => x.fillText(l, w / 2 + 60, 110 + i * 44));
    }));
    const s = 1 + Math.min(mine('entry').length, 40) / 8; R.book.scale.y = s; R.book.position.y = 0.02 * s; R.pages.position.y = 0.04 * s + 0.004;
  }
  function pinTexture(p) {
    if (p.ptype === 'image' && isImg(p.img)) return new THREE.TextureLoader().load(p.img);
    return ctex(256, 220, (x, w, h) => {
      if (p.ptype === 'swatch') { const cs = p.colors || []; cs.forEach((c, i) => { x.fillStyle = /^#[0-9a-f]{3,8}$/i.test(c) ? c : '#ccc'; x.fillRect(i * w / cs.length, 0, w / cs.length + 1, h); }); return; }
      x.fillStyle = p.ptype === 'quote' ? '#fff2c9' : '#ffffff'; x.fillRect(0, 0, w, h);
      x.fillStyle = '#1d2030'; x.font = p.ptype === 'quote' ? '600 30px Caveat, cursive' : '700 24px Figtree, sans-serif';
      wrapText(x, p.ptype === 'quote' ? '“' + p.quote + '”' : (p.title || p.url || 'Link'), w - 30).slice(0, 6).forEach((l, i) => x.fillText(l, 15, 40 + i * 32));
      if (p.ptype === 'link') { x.fillStyle = '#2f5bea'; x.font = '600 18px Figtree, sans-serif'; x.fillText(fitText(x, (p.url || '').replace(/^https?:\/\//, ''), w - 30), 15, h - 20); }
    });
  }
  function drawPins() {
    const d = R.dyn.pinboard; clearGroup(d);
    withEx('pin').slice(0, 9).forEach((p, i) => {
      const col = i % 3, row = Math.floor(i / 3); const x = -0.8 + col * 0.8 + ((hash(p.id) % 10) - 5) * 0.012, y = 2.62 - row * 0.48;
      const back = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.42), mat('#ffffff', {flatShading: false})); back.position.set(x, y, -3.915); back.rotation.z = ((hash(p.id) % 9) - 4) * 0.02; back.castShadow = true; d.add(back);
      const face = new THREE.Mesh(new THREE.PlaneGeometry(0.44, 0.36), new THREE.MeshStandardMaterial({map: pinTexture(p), roughness: 0.9})); face.position.set(0, 0, 0.003); back.add(face);
      const pin = new THREE.Mesh(new THREE.SphereGeometry(0.03, 10, 8), mat(PAL[hash(p.id) % 5])); pin.position.set(0, 0.17, 0.03); back.add(pin);
    });
  }
  function drawMachine() {
    const d = R.dyn.machine; clearGroup(d); const B = R.ballSpot;
    const n = Math.max(5, Math.min(B.flat ? 18 : 26, withEx('concept').filter(c => !c.composted).length * 3 + withEx('spark').length * 2));
    R.balls = new THREE.Group(); d.add(R.balls);
    for (let i = 0; i < n; i++) { const b = new THREE.Mesh(new THREE.SphereGeometry(B.sz, 12, 10), mat(PAL[i % 6], {flatShading: false, roughness: 0.4})); const a = (i * 2.399) % 6.283, r = ((i * 0.618) % 1) * B.r; b.userData.y = B.y + Math.floor(i / 7) * B.step * 0.8 + ((i * 0.37) % 1) * 0.03; b.position.set(B.x + Math.cos(a) * r, b.userData.y, B.z + Math.sin(a) * r * (B.flat ? 0.15 : 1)); R.balls.add(b); }
  }
  function maskPath(x, w, h, t) { x.beginPath(); if (t === 'round') x.arc(w / 2, h / 2, Math.min(w, h) / 2 - 2, 0, 6.3); else if (t === 'arched') { const r = w / 2 - 2; x.moveTo(2, h - 2); x.lineTo(2, r); x.arc(w / 2, r, r, Math.PI, 0); x.lineTo(w - 2, h - 2); x.closePath(); } else x.ellipse(w / 2, h / 2, w / 2 - 2, h / 2 - 2, 0, 0, 6.3); }
  function drawMirror2() {
    const fp = fingerprint().slice(0, 9); const [gw, gh] = R.glassSize; const W = 400, H = Math.round(400 * gh / gw);
    setMap(R.glass, ctex(W, H, (x, w, h) => {
      x.clearRect(0, 0, w, h); x.save(); maskPath(x, w, h, R.mirrorType); x.clip();
      const g = x.createRadialGradient(w / 2, h / 2, 10, w / 2, h / 2, Math.max(w, h) / 2); g.addColorStop(0, '#f7fbff'); g.addColorStop(1, '#b9c7d6'); x.fillStyle = g; x.fillRect(0, 0, w, h);
      const c = w / 2, cyy = h / 2, max = fp.length ? fp[0][1] : 1;
      fp.forEach(([t, n], i) => { const r = 30 + i * (150 / Math.max(fp.length - 1, 1)); const sd = hash(t); x.beginPath(); for (let a = 0; a <= 6.33; a += 0.04) { const rr = r + Math.sin(a * (3 + sd % 4) + sd % 7) * 4 + Math.sin(a * 7) * 2; const px = c + Math.cos(a) * rr, py = cyy + Math.sin(a) * rr * (h / w); a === 0 ? x.moveTo(px, py) : x.lineTo(px, py); } x.closePath(); x.strokeStyle = PAL[i % PAL.length]; x.globalAlpha = 0.85; x.lineWidth = 3 + (n / max) * 8; x.stroke(); x.globalAlpha = 1; });
      x.restore();
    }));
  }
  function drawChalk() {
    const fp = fingerprint().slice(0, 8); const t = R.boardType;
    const pal = t === 'whiteboard' ? {bg: '#fbfbf8', ink: '#1d2030', line: 'rgba(29,32,48,.45)', rings: ['#2f5bea', '#ff5b4f', '#1fae7a', '#1d2030'], core: '#ff5b4f', font: '700 40px Figtree, sans-serif'} : t === 'easel' ? {bg: '#f3ead8', ink: '#3a2a1a', line: 'rgba(58,42,26,.5)', rings: ['#e76f51', '#2a9d8f', '#e9c46a', '#264653'], core: '#e76f51', font: '700 44px Caveat, cursive'} : {bg: '#23372e', ink: '#f4f1e8', line: 'rgba(255,255,255,.55)', rings: ['#ffffff', '#ffc83a', '#ff8fc8', '#9fd8ff'], core: '#ffc83a', font: '700 40px Caveat, cursive'};
    const W = t === 'easel' ? 840 : 1024, H = t === 'easel' ? 600 : 588;
    setMap(R.chalk, ctex(W, H, (x, w, h, cv) => {
      x.fillStyle = pal.bg; x.fillRect(0, 0, w, h);
      if (t !== 'whiteboard') for (let i = 0; i < 40; i++) { x.fillStyle = t === 'easel' ? 'rgba(0,0,0,.025)' : 'rgba(255,255,255,.03)'; x.beginPath(); x.ellipse(Math.random() * w, Math.random() * h, 80 + Math.random() * 120, 20 + Math.random() * 30, Math.random(), 0, 6.3); x.fill(); }
      const rc = window.rough ? rough.canvas(cv) : null; const cx = w / 2, cy = h / 2 + 10; const rx = w * 0.35, ry = h * 0.35;
      x.textAlign = 'center'; x.textBaseline = 'middle';
      fp.forEach(([tt], i) => { const a = -Math.PI / 2 + i * (Math.PI * 2 / Math.max(fp.length, 1)); const px = cx + Math.cos(a) * rx, py = cy + Math.sin(a) * ry; if (rc) rc.line(cx, cy, px, py, {stroke: pal.line, strokeWidth: 2, roughness: 1.6, seed: i + 1}); });
      fp.forEach(([tt], i) => { const a = -Math.PI / 2 + i * (Math.PI * 2 / Math.max(fp.length, 1)); const px = cx + Math.cos(a) * rx, py = cy + Math.sin(a) * ry; x.font = pal.font; const lab = fitText(x, tt, w * 0.2); const tw = x.measureText(lab).width; if (rc) rc.ellipse(px, py, tw + 40, 64, {stroke: pal.rings[i % 4], strokeWidth: 2.4, roughness: 1.5, seed: i + 10, fill: t === 'whiteboard' ? '#fbfbf8' : t === 'easel' ? '#f3ead8' : '#23372e', fillStyle: 'solid'}); x.fillStyle = pal.ink; x.fillText(lab, px, py + 2); });
      x.font = pal.font.replace(/\d+px/, '50px'); const core = 'your studio'; const tw = x.measureText(core).width; if (rc) rc.ellipse(cx, cy, tw + 50, 80, {stroke: pal.core, strokeWidth: 3, roughness: 1.4, seed: 99, fill: pal.bg, fillStyle: 'solid'}); x.fillStyle = pal.core; x.fillText(core, cx, cy + 2);
    }));
  }
  function artTex(id) { return ctex(256, 192, (x, w, h) => { const hh = hash(id); const g = x.createLinearGradient(0, 0, w, h); g.addColorStop(0, PAL[hh % 6]); g.addColorStop(1, PAL[(hh >>> 3) % 6]); x.fillStyle = g; x.fillRect(0, 0, w, h); x.fillStyle = PAL[(hh >>> 6) % 6]; x.beginPath(); x.arc(40 + hh % 170, 40 + (hh >>> 4) % 110, 36, 0, 6.3); x.fill(); x.strokeStyle = '#1d2030'; x.lineWidth = 6; x.beginPath(); x.moveTo(0, h * 0.7); x.bezierCurveTo(w * 0.3, h * 0.4, w * 0.6, h, w, h * 0.6); x.stroke(); }); }
  function drawGallery() {
    const d = R.dyn.gallery; clearGroup(d);
    const ps = withEx('piece'); const zs = [-1.9, -0.75, 0.4];
    zs.forEach((z, i) => {
      const p = ps[i]; const fr = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.82, 1.02), M('frames')); fr.position.set(-4.95, 1.95, z); fr.castShadow = true; d.add(fr);
      const matb = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.7), mat('#fffdf7', {flatShading: false})); matb.rotation.y = Math.PI / 2; matb.position.set(-4.915, 1.95, z); d.add(matb);
      let t; if (p && isImg(p.photo)) t = new THREE.TextureLoader().load(p.photo); else if (p) t = artTex(p.id); else t = ctex(256, 192, (x, w, h) => { x.fillStyle = '#f3ead8'; x.fillRect(0, 0, w, h); x.setLineDash([10, 8]); x.strokeStyle = '#8c6b4a'; x.lineWidth = 4; x.strokeRect(12, 12, w - 24, h - 24); x.fillStyle = '#8c6b4a'; x.font = '700 30px Caveat, cursive'; x.textAlign = 'center'; x.fillText('your next piece', w / 2, h / 2 + 8); });
      const art = new THREE.Mesh(new THREE.PlaneGeometry(0.72, 0.54), new THREE.MeshStandardMaterial({map: t, roughness: 0.85})); art.rotation.y = Math.PI / 2; art.position.set(-4.91, 1.95, z); d.add(art);
    });
    const cl = compostList(); const n = Math.min(44, cl.length * 7 + (cl.length ? 3 : 0));
    for (let i = 0; i < n; i++) { const l = new THREE.Mesh(new THREE.CircleGeometry(0.06 + ((i * 0.37) % 1) * 0.04, 5), mat(['#8a5a2b', '#c4762f', '#6b8f3a', '#a0522d'][i % 4], {side: THREE.DoubleSide})); l.position.set(-4.62 + ((i * 0.618) % 1 - 0.5) * 0.5, 0.2 + ((i * 0.29) % 1) * 0.3, 2.1 + ((i * 0.77) % 1 - 0.5) * 0.5); l.rotation.set(i, i * 2, i * 3); d.add(l); }
    if (mine('spark').some(s => s.source === 'compost')) { cyl(0.012, 0.012, 0.3, '#1fae7a', -4.62, 0.62, 2.1, d, 6); const lf = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 6), mat('#1fae7a')); lf.scale.set(1.4, 0.4, 0.8); lf.position.set(-4.58, 0.76, 2.1); d.add(lf); }
  }
  function drawPlay() {
    const sd = stickerData(); const got = new Set(earned().map(s => s.id));
    setMap(R.stickerSheet, ctex(512, 512, (x, w, h) => {
      x.fillStyle = '#ffffff'; x.fillRect(0, 0, w, h); x.fillStyle = '#1d2030'; x.font = '700 30px Figtree, sans-serif'; x.textAlign = 'center'; x.fillText('Stickers', w / 2, 44);
      STICKERS.forEach((s, i) => { const cx = 90 + (i % 3) * 166, cy = 120 + Math.floor(i / 3) * 100; x.beginPath(); x.arc(cx, cy - 8, 30, 0, 6.3); if (got.has(s.id)) { x.fillStyle = ['#ffc83a', '#2f5bea', '#ff8fc8', '#1fae7a', '#ff5b4f'][i % 5]; x.fill(); x.lineWidth = 3; x.strokeStyle = '#1d2030'; x.stroke(); } else { x.setLineDash([6, 6]); x.lineWidth = 3; x.strokeStyle = '#b6b9c4'; x.stroke(); x.setLineDash([]); } x.fillStyle = got.has(s.id) ? '#1d2030' : '#9a9fb0'; x.font = '600 17px Figtree, sans-serif'; x.fillText(fitText(x, s.name, 150), cx, cy + 40); });
    }));
    const d = R.dyn.workbench; clearGroup(d); const [px, py, pz] = R.plantPos;
    const n = Math.min(sd.streak, 10); const hgt = 0.1 + n * 0.045;
    cyl(0.012, 0.014, hgt, '#1fae7a', px, py + 0.14 + hgt / 2, pz, d, 6);
    for (let i = 0; i <= n; i++) { const lf = new THREE.Mesh(new THREE.SphereGeometry(0.045, 8, 6), mat('#1fae7a')); lf.scale.set(1.5, 0.35, 0.8); lf.position.set(px + (i % 2 ? 0.05 : -0.05), py + 0.18 + i * (hgt / (n + 1)), pz); lf.rotation.z = i % 2 ? -0.5 : 0.5; d.add(lf); }
    if (sd.streak >= 3) { const fl = new THREE.Mesh(new THREE.SphereGeometry(0.05, 10, 8), mat('#ff8fc8')); fl.position.set(px, py + 0.16 + hgt, pz); d.add(fl); }
  }
  function refreshDyn() { try { drawJournal(); drawPins(); drawMachine(); drawMirror2(); drawChalk(); drawGallery(); drawPlay(); } catch (e) { console.warn(e); } }

  /* pets */
  function obstacles() {
    const o = [[-4.35, -1.65, -4, -1.95], [1.3, 2.6, -3.7, -2.5], [3.25, 4.5, -3.6, -2.35], [1.2, 2.2, 1.1, 2.1], [0.45, 1.35, 0.7, 1.6], [2.05, 2.95, 1.6, 2.5], [-4.35, -2.45, 2.55, 3.45], [-2.7, -1.1, 1.85, 3.35, 'pit'], [-5, -4.2, 1.7, 2.5], [2.55, 3.45, 0.35, 1.2], [4.5, 5, 1.75, 2.95], [-5, -4.05, -3.9, -3.0]];
    if (CFG.parts.board.type === 'easel') o.push([3.7, 4.9, -1.2, 0.4]);
    return o;
  }
  function free(x, z, P) { if (x < -4.6 || x > 4.6 || z < -3.6 || z > 3.6) return false; return !R.obstacles.some(([x0, x1, z0, z1, tag]) => x > x0 - 0.12 && x < x1 + 0.12 && z > z0 - 0.12 && z < z1 + 0.12 && !(tag === 'pit' && P && P.cfg.kind === 'otter')); }
  function clearLine(x0, z0, x1, z1, P) { const d = Math.hypot(x1 - x0, z1 - z0); const n = Math.ceil(d / 0.15); for (let i = 1; i <= n; i++) { const t = i / n; if (!free(x0 + (x1 - x0) * t, z0 + (z1 - z0) * t, P)) return false; } return true; }
  function randFree(P) { let fb = null; for (let i = 0; i < 40; i++) { const x = (Math.random() - 0.5) * 9, z = (Math.random() - 0.5) * 7; if (!free(x, z, P)) continue; if (!fb) fb = [x, z]; if (!(R.pets || []).some(Q => Q !== P && Math.hypot(Q.x - x, Q.z - z) < 0.7)) return [x, z]; } return fb || [0.5, 0]; }
  function petMesh(cfg) {
    const am = animPetMesh(cfg); if (am) return am;
    R.petBuild = true;
    const k = cfg.kind, c = cfg.color, acc = shade(c, 0.18), dark = shade(c, -0.2);
    const root = new THREE.Group(); const body = new THREE.Group(); root.add(body);
    const P = {root, body, legs: [], tail: null, head: null, eyes: [], ears: [], wheel: null};
    const eye = (x, y, z, par) => { const e = sph(0.018, '#1d2030', x, y, z, par, {roughness: 0.3}); P.eyes.push(e); };
    if (k === 'robot') {
      box(0.28, 0.22, 0.32, c, 0, 0.24, 0, body, {metalness: 0.4, roughness: 0.4}); P.head = new THREE.Group(); P.head.position.set(0, 0.43, 0.02); body.add(P.head);
      box(0.24, 0.16, 0.2, c, 0, 0, 0, P.head, {metalness: 0.4, roughness: 0.4}); box(0.18, 0.08, 0.01, '#1d2030', 0, 0.01, 0.105, P.head);
      [-0.045, 0.045].forEach(dx => { const e = sph(0.02, '#00e0ff', dx, 0.01, 0.112, P.head, {emissive: 0x00c0e0}); P.eyes.push(e); });
      cyl(0.01, 0.01, 0.1, '#1d2030', 0, 0.12, 0, P.head, 6); sph(0.03, '#ff5b4f', 0, 0.18, 0, P.head, {emissive: 0x661010});
      P.wheel = cyl(0.08, 0.08, 0.22, '#1d2030', 0, 0.08, 0, body, 16); P.wheel.rotation.z = Math.PI / 2;
      [-0.17, 0.17].forEach(dx => { const a = box(0.05, 0.14, 0.05, dark, dx, 0.22, 0.02, body); P.legs.push(a); });
    } else if (k === 'otter') {
      const b = sph(0.13, c, 0, 0.13, 0, body); b.scale.set(0.9, 0.75, 2.0);
      P.head = new THREE.Group(); P.head.position.set(0, 0.2, 0.3); body.add(P.head); sph(0.095, c, 0, 0, 0, P.head); const face = sph(0.06, acc, 0, -0.02, 0.06, P.head); face.scale.set(1.1, 0.8, 0.8);
      [-0.06, 0.06].forEach(dx => sph(0.025, dark, dx, 0.07, -0.01, P.head)); eye(-0.04, 0.02, 0.085, P.head); eye(0.04, 0.02, 0.085, P.head); sph(0.018, '#1d2030', 0, -0.01, 0.11, P.head);
      P.tail = new THREE.Group(); P.tail.position.set(0, 0.1, -0.24); body.add(P.tail); const tl = add(new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.32, 10), mat(c)), P.tail, 0, 0, -0.15); tl.rotation.x = -Math.PI / 2;
      [[-0.08, 0.15], [0.08, 0.15], [-0.08, -0.15], [0.08, -0.15]].forEach(([dx, dz]) => P.legs.push(sph(0.035, dark, dx, 0.035, dz, body)));
    } else if (k === 'bunny') {
      const b = sph(0.15, c, 0, 0.16, 0, body); b.scale.set(1, 1, 1.2); sph(0.05, '#ffffff', 0, 0.2, -0.18, body);
      P.head = new THREE.Group(); P.head.position.set(0, 0.32, 0.14); body.add(P.head); sph(0.105, c, 0, 0, 0, P.head);
      [-0.045, 0.045].forEach(dx => { const ear = new THREE.Group(); ear.position.set(dx, 0.08, -0.02); P.head.add(ear); const e = sph(0.05, c, 0, 0.1, 0, ear); e.scale.set(0.45, 2.0, 0.3); const ei = sph(0.035, '#ff8fc8', 0, 0.1, 0.012, ear); ei.scale.set(0.4, 1.8, 0.2); P.ears.push(ear); });
      eye(-0.05, 0.02, 0.085, P.head); eye(0.05, 0.02, 0.085, P.head); sph(0.015, '#ff8fc8', 0, -0.015, 0.1, P.head);
      [[-0.08, -0.06], [0.08, -0.06]].forEach(([dx, dz]) => { const f = box(0.06, 0.04, 0.16, acc, dx, 0.02, dz, body); P.legs.push(f); });
      [[-0.05, 0.12], [0.05, 0.12]].forEach(([dx, dz]) => P.legs.push(sph(0.03, acc, dx, 0.03, dz, body)));
    } else {
      const dog = k === 'dog'; const s = dog ? 1.12 : 1;
      const b = sph(0.15 * s, c, 0, 0.21 * s, 0, body); b.scale.set(1, 0.85, 1.55); const belly = sph(0.11 * s, acc, 0, 0.17 * s, 0.02, body); belly.scale.set(0.9, 0.7, 1.4);
      P.head = new THREE.Group(); P.head.position.set(0, 0.34 * s, 0.22 * s); body.add(P.head); sph(0.12 * s, c, 0, 0, 0, P.head);
      if (dog) { const sn = box(0.1, 0.08, 0.1, acc, 0, -0.03, 0.12, P.head); sph(0.025, '#1d2030', 0, 0.0, 0.17, P.head); [-1, 1].forEach(sx => { const ear = new THREE.Group(); ear.position.set(sx * 0.13, 0.07, -0.01); ear.rotation.z = sx * 0.22; ear.userData.base = sx * 0.22; ear.userData.sx = sx; P.head.add(ear); box(0.03, 0.15, 0.09, dark, sx * 0.018, -0.07, 0, ear); P.ears.push(ear); }); }
      else { [-0.06, 0.06].forEach(dx => { const ear = new THREE.Group(); ear.position.set(dx, 0.1, 0); ear.userData.sx = -Math.sign(dx); P.head.add(ear); add(new THREE.Mesh(new THREE.ConeGeometry(0.045, 0.09, 4), mat(c)), ear, 0, 0.03, 0); add(new THREE.Mesh(new THREE.ConeGeometry(0.025, 0.05, 4), mat('#ff8fc8')), ear, 0, 0.025, 0.012); P.ears.push(ear); }); sph(0.016, '#ff8fc8', 0, -0.02, 0.118, P.head); }
      eye(-0.045, 0.025, 0.105 * s, P.head); eye(0.045, 0.025, 0.105 * s, P.head);
      P.tail = new THREE.Group(); P.tail.position.set(0, 0.25 * s, -0.2 * s); body.add(P.tail); const tl = cyl(0.022, dog ? 0.03 : 0.018, dog ? 0.16 : 0.3, c, 0, (dog ? 0.08 : 0.15), 0, P.tail, 8); P.tail.rotation.x = dog ? -0.6 : -1.0;
      [[-0.07, 0.12], [0.07, 0.12], [-0.07, -0.12], [0.07, -0.12]].forEach(([dx, dz]) => { const lg = new THREE.Group(); lg.position.set(dx * s, 0.16 * s, dz * s); body.add(lg); cyl(0.03, 0.028, 0.16 * s, dark, 0, -0.08 * s, 0, lg, 8); P.legs.push(lg); });
    }
    R.petBuild = false;
    root.scale.setScalar(1.25);
    root.traverse(o => { o.castShadow = true; });
    return P;
  }
  /* ---------- animated pet models (CC0): skeletal clips blended with an AnimationMixer ---------- */
  const PET_MODELS = {
    cat: {file: 'cat.glb', h: 0.42, hide: ['cat_LOD1'], tint: 0.4, clips: {idle: 'idle', idle2: 'idle_alt', walk: 'walk', run: 'run', jump: 'jump', sit: 'sit', sleep: 'sleep', sniff: 'eat', death: 'death', play: 'call', petting: 'idle_alt'}},
    dog: {file: 'dog.glb', h: 0.5, tint: 0.22, clips: {idle: 'Idle', idle2: 'Idle_2', walk: 'Walk', run: 'Gallop', jump: 'Jump_ToIdle', sit: 'Idle_2_HeadLow', sleep: 'Idle_2_HeadLow', sniff: 'Eating', death: 'Death', play: 'Gallop_Jump', petting: 'Idle_2'}},
    bunny: {file: 'bunny/rabbit.fbx', fbx: true, h: 0.38, tint: 0.15, clips: {idle: 'Basic', walk: 'Running', run: 'Running', jump: 'Jump', sit: 'Sitting.000', sleep: 'Dead', sniff: 'Guarding', death: 'Dying.000', play: 'Jump', petting: 'Guarding'}, walkSpeed: 0.6},
    robot: {file: 'robot.glb', h: 0.55, clips: {idle: 'Idle', walk: 'Walking', run: 'Running', jump: 'Jump', sit: 'Sitting', sleep: 'Sitting', sniff: 'Yes', death: 'Death', play: 'Dance', petting: 'Wave', happy: 'ThumbsUp'}}
  };
  const ONCE = new Set(['death', 'jump']); const CLAMP = new Set(['death']);
  const PETM = {};
  function petModel(kind) {
    const spec = PET_MODELS[kind]; if (!spec || !MODEL_BASE) return null; const m = PETM[kind]; if (m) return m.state === 'ok' ? m : null;
    const L = spec.fbx ? THREE.FBXLoader : THREE.GLTFLoader; if (!L || !THREE.SkeletonUtils) return null;
    PETM[kind] = {state: 'loading'};
    new L().load('assets/pets/' + spec.file, res => {
      const scene = spec.fbx ? res : res.scene, clips = spec.fbx ? res.animations : res.animations;
      (spec.hide || []).forEach(n => { const o = scene.getObjectByName(n); if (o) o.visible = false; });
      scene.traverse(o => { if (!o.isMesh) return; o.castShadow = true; o.receiveShadow = true; o.frustumCulled = false; const ms = Array.isArray(o.material) ? o.material : [o.material]; ms.forEach(mt => { if (mt.map) mt.map.encoding = THREE.LinearEncoding; if (mt.isMeshPhongMaterial) mt.shininess = 8; mt.envMapIntensity = 0.4; if (spec.fbx) { mt.opacity = 1; mt.transparent = false; if (/fur/i.test(o.name)) { mt.alphaTest = 0.45; mt.side = THREE.DoubleSide; o.castShadow = false; } } mt.needsUpdate = true; }); });
      scene.updateMatrixWorld(true); const bb = new THREE.Box3(); scene.traverse(o => { if (o.isMesh && o.visible) bb.expandByObject(o); });
      PETM[kind] = {state: 'ok', scene, clips, box: bb, size: bb.getSize(new THREE.Vector3())};
      if (R && R.pets) R.pets.forEach(P => { if (P.cfg.kind === kind) swapPetMesh(P); });
    }, undefined, err => { PETM[kind] = {state: 'fail'}; console.warn('pet model failed', kind, err); });
    return null;
  }
  const findClip = (clips, name) => clips.find(c => c.name === name) || clips.find(c => c.name.endsWith('|' + name)) || clips.find(c => c.name.toLowerCase().includes(String(name).toLowerCase()));
  function animPetMesh(cfg) {
    const spec = PET_MODELS[cfg.kind], src = petModel(cfg.kind); if (!src) return null;
    const root = new THREE.Group(), body = new THREE.Group(); root.add(body);
    const inst = THREE.SkeletonUtils.clone(src.scene); const c = src.box.getCenter(new THREE.Vector3()); const s = spec.h / src.size.y;
    const wrap = new THREE.Group(); wrap.scale.setScalar(s); inst.position.set(-c.x, -src.box.min.y, -c.z); wrap.add(inst); body.add(wrap);
    if (spec.tint) { const col = new THREE.Color('#ffffff').lerp(new THREE.Color(cfg.color), spec.tint); inst.traverse(o => { if (!o.isMesh) return; o.material = Array.isArray(o.material) ? o.material.map(mt => { const n = mt.clone(); n.color.multiply(col); return n; }) : (() => { const n = o.material.clone(); n.color.multiply(col); return n; })(); }); }
    const mixer = new THREE.AnimationMixer(inst), acts = {};
    const act = key => { const nm = spec.clips[key]; if (!nm) return null; if (acts[key] !== undefined) return acts[key]; const clip = findClip(src.clips, nm); const a = clip ? mixer.clipAction(clip) : null; if (a && (ONCE.has(key) || (cfg.kind === 'robot' && key === 'sit'))) { a.setLoop(THREE.LoopOnce); a.clampWhenFinished = CLAMP.has(key) || key === 'sit'; } acts[key] = a; return a; };
    const dummy = () => new THREE.Group();
    const m = {root, body, head: dummy(), tail: null, legs: [], ears: [], eyes: [], anim: {mixer, act, cur: null, key: null, spec}};
    return m;
  }
  // choose a clip for what the pet is doing and cross-fade to it
  function playPet(P, key, now) {
    const A = P.m.anim; if (!A) return; let a = A.act(key); if (!a && key !== 'idle') { key = 'idle'; a = A.act('idle'); } if (!a || A.key === key) return;
    a.reset(); a.enabled = true; a.setEffectiveWeight(1); a.setEffectiveTimeScale(key === 'walk' && A.spec.walkSpeed ? A.spec.walkSpeed : 1); a.play();
    if (A.cur) A.cur.crossFadeTo(a, key === 'death' ? 0.2 : 0.3, false); A.cur = a; A.key = key;
  }
  function petClipFor(P, now) {
    if (P.deadT) return 'death';
    if (P.trickT0) return 'jump';
    if (P.state === 'walk') return 'walk';
    if (P.state === 'inter' && P.inter) { const t = P.inter.type; if (t === 'chase') return 'run'; if (P.moving) return 'walk'; return t === 'dance' || t === 'bounce' ? (P.cfg.kind === 'robot' ? 'play' : 'jump') : 'sniff'; }
    if (P.state === 'sleep') return 'sleep';
    if (P.state === 'sit') return 'sit';
    if (P.state === 'happy') return P.cfg.kind === 'robot' ? 'happy' : 'jump';
    if (P.state === 'play') return 'play';
    if (P.state === 'petting') return 'petting';
    return (Math.floor(now / 7000 + P.x * 3) % 3 === 0 && P.m.anim.spec.clips.idle2) ? 'idle2' : 'idle';
  }
  function swapPetMesh(P) {
    const i = R.pets.indexOf(P); if (i < 0) return; const m = animPetMesh(P.cfg); if (!m) return;
    R.petsG.remove(P.m.root); m.root.userData.pet = i; m.root.traverse(o => o.userData.pet = i); R.petsG.add(m.root); P.m = m;
  }
  function rebuildPets() {
    if (!R) return; clearGroup(R.petsG); R.pets = []; R.pairs = {};
    CFG.pets.filter(p => p.on).slice(0, 3).forEach((cfg, i) => {
      const m = petMesh(cfg); m.deadLift = rollLift(m.root); m.root.userData.pet = i; m.root.traverse(o => o.userData.pet = i); R.petsG.add(m.root);
      const [x, z] = randFree({cfg}); R.pets.push({cfg, m, x, z, heading: Math.random() * 6, state: 'idle', until: performance.now() + 1500 + i * 800, tx: x, tz: z, after: 'idle', blinkAt: performance.now() + 2000, t0: 0, way: null});
    });
  }
  // how high a pet must be raised so no part of it dips below the floor when rolled onto its side by angle a
  function rollLift(root) {
    root.updateMatrixWorld(true); const inv = new THREE.Matrix4().copy(root.matrixWorld).invert(), mtx = new THREE.Matrix4(), v = new THREE.Vector3(), pts = [];
    root.traverse(o => { if (!o.isMesh || !o.geometry || !o.geometry.attributes.position) return; mtx.multiplyMatrices(inv, o.matrixWorld); const a = o.geometry.attributes.position; const step = Math.max(1, Math.floor(a.count / 60)); for (let k = 0; k < a.count; k += step) { v.fromBufferAttribute(a, k).applyMatrix4(mtx); pts.push(v.x, v.y); } });
    const N = 24, MAX = 1.8, tab = [];
    for (let s = 0; s <= N; s++) { const th = s / N * MAX, sn = Math.sin(th), cs = Math.cos(th); let lo = 0; for (let k = 0; k < pts.length; k += 2) lo = Math.min(lo, pts[k] * sn + pts[k + 1] * cs); tab.push(-lo + 0.005); }
    return a => { const f = Math.max(0, Math.min(N, a / MAX * N)), i0 = Math.floor(f), i1 = Math.min(N, i0 + 1); return tab[i0] + (tab[i1] - tab[i0]) * (f - i0); };
  }
  function favSpot(P) { const k = P.cfg.kind; if (k === 'otter') return [-1.9 + (Math.random() - 0.5) * 0.8, 2.6 + (Math.random() - 0.5) * 0.8]; if (k === 'dog') return [-1.9 + (Math.random() - 0.5), 1.45]; if (k === 'robot') return [1.9 + (Math.random() - 0.5) * 0.6, -2.25]; const a = Math.random() * 6.28; return [1.7 + Math.cos(a) * 0.95, 1.6 + Math.sin(a) * 0.95]; }
  function walkTo(P, x, z, after, now) {
    if (!free(x, z, P)) { const r = randFree(P); x = r[0]; z = r[1]; }
    P.way = null;
    if (!clearLine(P.x, P.z, x, z, P)) { for (let i = 0; i < 16; i++) { const w = randFree(P); if (clearLine(P.x, P.z, w[0], w[1], P) && clearLine(w[0], w[1], x, z, P)) { P.way = [x, z]; x = w[0]; z = w[1]; break; } } if (!P.way && !clearLine(P.x, P.z, x, z, P)) { const w = randFree(P); if (clearLine(P.x, P.z, w[0], w[1], P)) { x = w[0]; z = w[1]; } else { P.state = 'idle'; P.until = now + 1500; return; } } }
    P.tx = x; P.tz = z; P.after = after; P.state = 'walk';
  }
  function nextAction(P, now) {
    const night = phase() === 'night' || CFG.mood === 'moody'; const r = Math.random();
    if (r < (night ? 0.35 : 0.1)) walkTo(P, 3.9 + (Math.random() - 0.5) * 0.2, 3.0, 'sleep', now);
    else if (r < 0.42) walkTo(P, ...favSpot(P), Math.random() < 0.5 ? 'play' : 'sit', now);
    else if (r < 0.82) walkTo(P, ...randFree(P), 'idle', now);
    else { P.state = 'idle'; P.until = now + 2000 + Math.random() * 2000; }
  }
  function arrive(P, now) { const dur = {sit: 4000 + Math.random() * 4000, sleep: 10000 + Math.random() * 8000, play: 3000 + Math.random() * 2000, idle: 1500 + Math.random() * 2000}[P.after] || 2000; P.state = P.after; P.until = now + dur; if (P.after === 'sleep') P.heading += Math.PI; }
  function updatePets(dt, now) {
    if (!R.pets) return;
    R.pets.forEach((P, i) => {
      const m = P.m; const sp = PET_KINDS[P.cfg.kind].speed;
      if (P.state === 'walk') {
        const dx = P.tx - P.x, dz = P.tz - P.z, d = Math.hypot(dx, dz);
        const blocker = d < 0.6 && !P.way && R.pets.find(Q => Q !== P && Q.state !== 'walk' && Math.hypot(Q.x - P.tx, Q.z - P.tz) < petR(P) + petR(Q) + 0.05);
        if (!P.stuckT || d < P.stuckD - 0.05) { P.stuckT = now; P.stuckD = d; } else if (now - P.stuckT > 1500) { P.stuckT = 0; walkTo(P, ...randFree(P), P.after === 'sleep' ? 'sleep' : 'idle', now); }
        if (d < 0.06 || (blocker && d < Math.hypot(blocker.x - P.tx, blocker.z - P.tz) + 0.2)) { P.stuckT = 0; if (P.way) { const [wx, wz] = P.way; P.way = null; P.tx = wx; P.tz = wz; } else arrive(P, now); }
        else { const step = Math.min(d, sp * dt); const nx = P.x + dx / d * step, nz = P.z + dz / d * step; if (free(nx, nz, P)) { P.x = nx; P.z = nz; } else { walkTo(P, ...randFree(P), 'idle', now); } const want = Math.atan2(dx, dz); let dh = want - P.heading; dh = Math.atan2(Math.sin(dh), Math.cos(dh)); P.heading += dh * Math.min(1, dt * 8); }
      } else if (P.state === 'inter' && now <= P.until) { interMove(P, i, dt, now); } else if (now > P.until) { if (P.state === 'happy' && P.resume) { P.resume = false; } if (P.inter) { P.inter = null; P.state = 'idle'; P.until = now + 800 + Math.random() * 1200; } else nextAction(P, now); }
      const walking = P.state === 'walk', t = now / 1000;
      let y = (P.cfg.kind === 'otter' && P.x > -2.7 && P.x < -1.1 && P.z > 1.85 && P.z < 3.35) ? 0.08 : 0;
      const sw = walking ? Math.sin(t * 10 * sp) * 0.6 : 0;
      if (P.cfg.kind === 'robot') { if (m.wheel) m.wheel.rotation.x += walking ? dt * sp * 12 : 0; m.body.rotation.z = walking ? Math.sin(t * 6) * 0.04 : 0; m.legs.forEach((a, j) => a.rotation.x = walking ? (j ? -sw : sw) * 0.5 : Math.sin(t * 2 + j) * 0.1); }
      else if (P.cfg.kind === 'bunny') { if (walking) y += Math.abs(Math.sin(t * 7)) * 0.12; m.ears.forEach((e, j) => e.rotation.z = Math.sin(t * 3 + j) * 0.12 + (j ? -0.15 : 0.15)); }
      else if (P.cfg.kind === 'otter') { m.body.rotation.y = walking ? Math.sin(t * 8) * 0.18 : 0; m.legs.forEach((l, j) => l.position.y = 0.035 + (walking ? Math.max(0, Math.sin(t * 12 + j * 1.6)) * 0.03 : 0)); }
      else { m.legs.forEach((l, j) => l.rotation.x = (j % 2 === (j < 2 ? 0 : 1) ? sw : -sw)); if (walking) y += Math.abs(Math.sin(t * 10 * sp)) * 0.02; }
      if (m.tail) { const wagF = P.cfg.kind === 'dog' ? (P.state === 'happy' || walking ? 18 : 6) : 2.5; m.tail.rotation.y = Math.sin(t * wagF) * (P.cfg.kind === 'dog' ? 0.6 : 0.35); }
      // states
      m.body.scale.y = 1; m.head.rotation.x = 0; if (P.state !== 'petting') { m.head.rotation.z = 0; m.body.rotation.z = P.cfg.kind === 'robot' ? m.body.rotation.z : 0; }
      if (P.state === 'petting') {
        const cp = R.camera.position; const want = Math.atan2(cp.x - P.x, cp.z - P.z); let dh = want - P.heading; dh = Math.atan2(Math.sin(dh), Math.cos(dh)); P.heading += dh * Math.min(1, dt * 6);
        const Pt = R.petting; const amt = Pt ? Pt.rubAmt : 0; if (Pt) Pt.rubAmt = Math.max(0, Pt.rubAmt - dt * 1.4);
        m.head.rotation.z = Math.sin(t * 7) * 0.18 * amt; m.head.rotation.x = -0.15 * amt; m.body.rotation.z = Math.sin(t * 5) * 0.06 * amt;
        y += Math.abs(Math.sin(t * 9)) * 0.03 * amt;
        if (P.cfg.kind !== 'robot') m.eyes.forEach(e => e.scale.y = amt > 0.2 ? 0.25 : 1);
        if (m.tail) m.tail.rotation.y = Math.sin(t * (6 + 14 * amt)) * 0.5;
        m.ears.forEach(e => e.rotation.z = (e.userData.base || 0) + (e.userData.sx || 0) * 0.25 * amt);
      }
      else if (P.state === 'inter' && P.inter) { interPose(P, m, t, now, (v) => { y += v; }); }
      else if (P.state === 'sleep') { m.body.scale.y = 0.82; m.head.rotation.x = 0.45; m.eyes.forEach(e => e.scale.y = 0.15); if (!reduceMotion && now > (P.bub || 0)) { P.bub = now + 1400; spawnFx('bubble', P.x, 0.5, P.z); } }
      else if (P.state === 'happy') { const k = (now - P.t0) / 1200; y += Math.abs(Math.sin(k * Math.PI * 3)) * 0.18 * (1 - Math.min(1, k)); if (P.cfg.kind === 'dog' || P.cfg.kind === 'robot') P.heading += dt * 7 * (1 - Math.min(1, k)); m.eyes.forEach(e => e.scale.y = P.cfg.kind === 'robot' ? 1 : 0.4); }
      else if (P.state === 'play') { const k = now / 1000; if (P.cfg.kind === 'otter') P.heading += dt * 3; else if (P.cfg.kind === 'bunny') { y += Math.abs(Math.sin(k * 5)) * 0.2; m.body.rotation.y = Math.sin(k * 5) * 0.6; } else if (P.cfg.kind === 'cat') { y += Math.max(0, Math.sin(k * 3)) * 0.12; } else P.heading += dt * 2.5; }
      else { if (now > P.blinkAt) { P.blinkAt = now + 2500 + Math.random() * 3000; P.blinkEnd = now + 130; } m.eyes.forEach(e => e.scale.y = now < (P.blinkEnd || 0) && P.cfg.kind !== 'robot' ? 0.15 : 1); if (P.state === 'idle' || P.state === 'sit') m.head.rotation.y = Math.sin(t * 0.7 + i) * 0.5; }
      if (P.state === 'sit' && P.cfg.kind !== 'robot') { m.body.rotation.x = -0.25; } else m.body.rotation.x = 0;
      if (P.state !== 'play' || P.cfg.kind !== 'bunny') if (P.cfg.kind !== 'otter') m.body.rotation.y = 0;
      if (P.stand && !P.deadT) { const kk = Math.min(1, (now - P.standT) / 300); m.body.rotation.x = -0.95 * kk; m.body.position.set(0, 0.13 * kk, -0.06 * kk); m.head.rotation.x = 0.7 * kk; if (P.cfg.kind === 'cat' || P.cfg.kind === 'dog') m.legs.slice(0, 2).forEach((l, j) => l.rotation.x = -1.1 * kk + Math.sin(t * 6 + j) * 0.15); if (P.cfg.kind === 'robot') m.legs.forEach(a => a.rotation.x = -2.6 * kk); }
      else if (!P.deadT) { m.body.position.set(0, 0, 0); }
      let roll = 0; if (P.deadT) { const e = now - P.deadT; const ki = Math.min(1, e / 420), inK = ki < 1 ? 1 - Math.pow(1 - ki, 3) + Math.sin(ki * Math.PI) * 0.12 : 1, ko = e > 3000 ? Math.min(1, (e - 3000) / 400) : 0, outK = ko * ko * (3 - 2 * ko); roll = (Math.PI / 2) * (inK - outK); m.body.position.set(0, 0, 0); m.body.rotation.x = 0; m.head.rotation.x = 0; m.eyes.forEach(ey => ey.scale.y = outK > 0 ? 1 : 0.12); m.legs.forEach(l => l.rotation.x = 0); if (e > 3400) { P.deadT = 0; P.trickT0 = now; for (let j = 0; j < 5; j++) setTimeout(() => spawnFx('heart', P.x, 0.7, P.z), j * 90); $('#roomCaption').textContent = `${P.cfg.name} springs back up!`; if (CFG.sound) petSound(P.cfg.kind); } }
      let spin = 0; if (P.trickT0) { const k = (now - P.trickT0) / 1200; if (k < 1) { y += Math.sin(k * Math.PI) * 0.55; spin = k * Math.PI * 2; if (P.cfg.kind === 'otter') m.body.rotation.z = k * Math.PI * 2; if (P.cfg.kind === 'bunny') m.body.rotation.x = -Math.sin(k * Math.PI) * 0.6; } else { P.trickT0 = 0; m.body.rotation.z = 0; } }
      if (m.anim) {
        // real skeletal animation does the moving; the procedural layer only keeps the stand-up lean and the trick arc
        playPet(P, petClipFor(P, now), now); m.anim.mixer.update(dt * (P.state === 'walk' ? Math.min(1.6, 0.7 + sp) : 1));
        if (!(P.stand && !P.deadT)) { m.body.rotation.set(0, 0, 0); m.body.position.set(0, 0, 0); } m.body.scale.set(1, 1, 1);
        y = P.trickT0 ? Math.sin(Math.min(1, (now - P.trickT0) / 1200) * Math.PI) * 0.35 : 0; roll = 0;
      }
      m.root.position.set(P.x, y + (roll && m.deadLift ? m.deadLift(Math.abs(roll)) : 0), P.z); m.root.rotation.set(0, P.heading + spin, roll);
    });
    separatePets(); meetPets(now);
  }
  // --- pets share the floor: they never overlap, and meeting another pet usually starts something ---
  const PET_R = {cat: 0.2, dog: 0.24, otter: 0.22, bunny: 0.18, robot: 0.22};
  function petR(P) { return PET_R[P.cfg.kind] || 0.2; }
  function pinned(P, i) { return (R.petting && R.petting.i === i) || P.deadT || P.stand; }
  function separatePets() {
    const L = R.pets; if (!L || L.length < 2) return;
    for (let pass = 0; pass < 2; pass++) for (let i = 0; i < L.length; i++) for (let j = i + 1; j < L.length; j++) {
      const A = L[i], B = L[j]; let dx = B.x - A.x, dz = B.z - A.z, d = Math.hypot(dx, dz); const min = petR(A) + petR(B);
      if (d >= min) continue; if (d < 1e-4) { const a = Math.random() * 6.28; dx = Math.cos(a); dz = Math.sin(a); d = 1; } const o = min - d, nx = dx / d, nz = dz / d;
      const mob = (P, k) => pinned(P, k) ? 0 : (P.state === 'walk' || P.state === 'inter' ? 1 : 0.35);
      let wa = mob(A, i), wb = mob(B, j); if (!wa && !wb) continue; const s = wa + wb; wa /= s; wb /= s;
      const ax = A.x - nx * o * wa, az = A.z - nz * o * wa, bx = B.x + nx * o * wb, bz = B.z + nz * o * wb;
      const okA = !wa || free(ax, az, A), okB = !wb || free(bx, bz, B);
      if (okA && okB) { A.x = ax; A.z = az; B.x = bx; B.z = bz; }
      else if (okA && wa) { A.x -= nx * o; A.z -= nz * o; if (!free(A.x, A.z, A)) { A.x += nx * o; A.z += nz * o; } }
      else if (okB && wb) { B.x += nx * o; B.z += nz * o; if (!free(B.x, B.z, B)) { B.x -= nx * o; B.z -= nz * o; } }
    }
  }
  const INTER = {
    sniff: {dur: 3200, say: (a, b) => `${a} and ${b} sniff hello.`},
    nuzzle: {dur: 3000, say: (a, b) => `${a} nuzzles up to ${b}.`},
    chase: {dur: 4800, say: (a, b) => `${b} chases ${a} around!`},
    dance: {dur: 4200, say: (a, b) => `${a} and ${b} do a little happy dance.`},
    bounce: {dur: 3200, say: (a, b) => `${a} and ${b} hop about together.`}
  };
  const KIND_SAY = {robot: (a, b) => `${a} scans ${b}. Result: friend.`, otter: (a, b) => `${a} shows ${b} a very good pebble.`};
  const available = (P, i) => ['idle', 'sit', 'play', 'walk'].includes(P.state) && P.after !== 'sleep' && !pinned(P, i) && !P.trickT0 && !P.inter;
  function meetPets(now) {
    const L = R.pets; if (!L || L.length < 2) return; R.pairs = R.pairs || {};
    for (let i = 0; i < L.length; i++) for (let j = i + 1; j < L.length; j++) {
      const A = L[i], B = L[j], key = i + '-' + j, pr = R.pairs[key] || (R.pairs[key] = {met: false, cool: 0}); const d = Math.hypot(B.x - A.x, B.z - A.z);
      if (d > 1.4) { pr.met = false; continue; }
      if (d > 0.9 || pr.met || now < pr.cool) continue;
      if (!available(A, i) || !available(B, j)) continue;
      pr.met = true; // one roll per meeting: walk apart and back to roll again
      if (Math.random() < 0.7) startInter(A, B, now, pr);
    }
  }
  function circleFree(cx, cz, r, P) { for (let k = 0; k < 10; k++) { const a = k / 10 * 6.283; if (!free(cx + Math.cos(a) * r, cz + Math.sin(a) * r, P)) return false; } return true; }
  function startInter(A, B, now, pr) {
    const kinds = Object.keys(INTER); let type = kinds[Math.floor(Math.random() * kinds.length)];
    const mx = (A.x + B.x) / 2, mz = (A.z + B.z) / 2, r = type === 'chase' ? 0.7 : 0.36;
    if ((type === 'chase' || type === 'dance') && !(circleFree(mx, mz, r, A) && circleFree(mx, mz, r, B))) type = Math.random() < 0.5 ? 'sniff' : 'bounce';
    if (Math.random() < 0.5) { const t = A; A = B; B = t; }
    const dur = INTER[type].dur, a0 = Math.atan2(A.z - mz, A.x - mx);
    [[A, B, 'a'], [B, A, 'b']].forEach(([P, Q, role]) => { P.inter = {type, other: Q, role, t0: now, mid: [mx, mz], r, a0}; P.state = 'inter'; P.until = now + dur; P.way = null; P.stuckT = 0; });
    pr.cool = now + dur + 12000;
    const ks = KIND_SAY[A.cfg.kind]; const line = (ks && Math.random() < 0.5 && type === 'sniff') ? ks(A.cfg.name, B.cfg.name) : INTER[type].say(A.cfg.name, B.cfg.name);
    if (!R.petting) { const c = $('#roomCaption'); if (c) c.textContent = line; }
    if (type === 'nuzzle' || type === 'dance') for (let k = 0; k < 3; k++) setTimeout(() => spawnFx('heart', mx, 0.6, mz), 300 + k * 260);
    if (CFG.sound && (type === 'chase' || type === 'bounce')) petSound(A.cfg.kind);
  }
  function stepTo(P, x, z, speed, dt, face) {
    const dx = x - P.x, dz = z - P.z, d = Math.hypot(dx, dz);
    if (d > 0.01) { const st = Math.min(d, speed * dt), nx = P.x + dx / d * st, nz = P.z + dz / d * st; if (free(nx, nz, P)) { P.x = nx; P.z = nz; } }
    const want = face !== undefined ? face : Math.atan2(dx, dz); let dh = want - P.heading; dh = Math.atan2(Math.sin(dh), Math.cos(dh)); P.heading += dh * Math.min(1, dt * 8);
    return d;
  }
  function interMove(P, i, dt, now) {
    const I = P.inter, Q = I.other; if (!Q || Q.state !== 'inter' || !Q.inter || Q.inter.other !== P) { P.until = now; return; } // partner got picked up or called away
    const sp = PET_KINDS[P.cfg.kind].speed, k = (now - I.t0) / 1000, face = Math.atan2(Q.x - P.x, Q.z - P.z);
    if (I.type === 'chase' || I.type === 'dance') {
      const w = I.type === 'chase' ? 2.1 : 1.5, lag = I.type === 'chase' ? (I.role === 'a' ? 0 : -1.1) : (I.role === 'a' ? 0 : Math.PI);
      const ang = I.a0 + w * k + lag, tx = I.mid[0] + Math.cos(ang) * I.r, tz = I.mid[1] + Math.sin(ang) * I.r;
      stepTo(P, tx, tz, Math.max(1.4, sp * 2.4), dt, I.type === 'dance' ? face : undefined); P.moving = true;
    } else {
      const gap = petR(P) + petR(Q) + (I.type === 'nuzzle' ? 0.02 : 0.1), d = Math.hypot(Q.x - P.x, Q.z - P.z);
      if (d > gap + 0.03) { stepTo(P, P.x + (Q.x - P.x) * (1 - gap / d), P.z + (Q.z - P.z) * (1 - gap / d), sp, dt, face); P.moving = true; }
      else { stepTo(P, P.x, P.z, 0, dt, face); P.moving = false; }
    }
  }
  function interPose(P, m, t, now, addY) {
    const I = P.inter, k = (now - I.t0) / 1000, ph = I.role === 'a' ? 0 : Math.PI;
    if (P.moving && P.cfg.kind !== 'robot' && P.cfg.kind !== 'otter') { const sw = Math.sin(t * 16) * 0.7; m.legs.forEach((l, j) => l.rotation.x = (j % 2 === (j < 2 ? 0 : 1) ? sw : -sw)); }
    if (I.type === 'sniff') { m.head.rotation.x = 0.2 + Math.sin(t * 9) * 0.12; if (P.cfg.kind === 'robot') m.head.rotation.y = Math.sin(t * 4) * 0.6; }
    else if (I.type === 'nuzzle') { m.head.rotation.z = Math.sin(t * 5 + ph) * 0.25; m.head.rotation.x = 0.1; if (P.cfg.kind !== 'robot') m.eyes.forEach(e => e.scale.y = 0.3); }
    else if (I.type === 'chase') { addY(Math.abs(Math.sin(t * 11)) * 0.06); }
    else if (I.type === 'dance') { addY(Math.abs(Math.sin(k * 6 + ph)) * 0.14); m.body.rotation.z = Math.sin(k * 6 + ph) * 0.12; }
    else if (I.type === 'bounce') { addY(Math.max(0, Math.sin(k * 5 + ph)) * 0.22); m.head.rotation.x = -0.15; }
    if (m.tail) m.tail.rotation.y = Math.sin(t * 16) * 0.55;
  }

  function petIt(i) { startPetting(i); }
  function startPetting(i) {
    const P = R.pets[i]; if (!P) return; if (R.petting && R.petting.i === i) return; if (R.petting) endPetting(true);
    const now = performance.now();
    R.petting = {i, rubs: 0, rubAmt: 0, dir: 0, start: 0, lastX: null, done: false, back: R.focusSt || null, t0: now};
    P.state = 'petting'; P.until = Infinity; P.way = null;
    const cp = R.camera.position; const dx = cp.x - P.x, dz = cp.z - P.z, d = Math.hypot(dx, dz) || 1;
    const tgt = new THREE.Vector3(P.x, 0.35, P.z), pos = new THREE.Vector3(P.x + dx / d * 1.35, 0.95, P.z + dz / d * 1.35);
    R.tw = {from: {pos: R.cur.pos.clone(), tgt: R.cur.tgt.clone()}, to: {pos, tgt}, t0: now, dur: reduceMotion ? 1 : 900}; R.yaw = 0; R.pitch = 0; R.zoomF = 1;
    $('#roomCaption').textContent = window.HAND_CONTROL_ON ? `Rub ${P.cfg.name}: move the big hand over ${P.cfg.kind === 'robot' ? 'it' : 'them'} and rub side to side. Clap for a trick. Lower your hand for 3 seconds to step back.` : `Give ${P.cfg.name} a rub: move your cursor back and forth over ${P.cfg.kind === 'robot' ? 'it' : 'them'}. Click anywhere else to stop.`;
  }
  function endPetting(silent) {
    const Pt = R.petting; if (!Pt) return; R.petting = null;
    const P = R.pets[Pt.i]; const now = performance.now();
    if (P) { P.state = 'happy'; P.t0 = now; P.until = now + 1200; P.stand = false; }
    if (!silent) Room.focus(Pt.back, true);
  }
  function rubbed() {
    const Pt = R.petting; if (!Pt || Pt.done) return; const P = R.pets[Pt.i]; if (!P) return;
    Pt.rubs++; Pt.rubAmt = 1;
    spawnFx('heart', P.x + (Math.random() - 0.5) * 0.25, 0.6, P.z + (Math.random() - 0.5) * 0.25);
    if (CFG.sound && Pt.rubs % 2 === 1) petSound(P.cfg.kind);
    if (Pt.rubs === 3) $('#roomCaption').textContent = `${P.cfg.name} is loving this. Keep going.`;
    if (Pt.rubs >= 6) {
      Pt.done = true;
      for (let k = 0; k < 9; k++) setTimeout(() => spawnFx('heart', P.x + (Math.random() - 0.5) * 0.5, 0.5 + Math.random() * 0.3, P.z + (Math.random() - 0.5) * 0.5), k * 90);
      $('#roomCaption').textContent = `${P.cfg.name} ${pick(PET_LINES[P.cfg.kind])}`;
      const pc = CFG.pets.find(p => p.kind === P.cfg.kind); if (pc) { pc.petted = (pc.petted || 0) + 1; P.cfg.petted = pc.petted; scheduleSave(); }
      setTimeout(() => { if (R.petting === Pt) { Pt.done = false; Pt.rubs = 0; } }, 1800);
    }
  }
  function trickTargets() { return R.petting ? [R.pets[R.petting.i]].filter(Boolean) : R.pets; }
  function stand(on) { const now = performance.now(); trickTargets().forEach(P => { if (P.deadT) return; if (on && !P.stand) { P.stand = true; P.standT = now; } else if (!on && P.stand) { P.stand = false; } }); const P0 = trickTargets()[0]; if (on && P0) $('#roomCaption').textContent = `${P0.cfg.name} stands up on ${P0.cfg.kind === 'robot' ? 'its' : 'their'} hind legs…`; }
  function playDead() { const now = performance.now(); const list = trickTargets(); list.forEach(P => { if (P.deadT) return; P.stand = false; P.deadT = now; }); if (list[0]) { $('#roomCaption').textContent = `Bang! ${list[0].cfg.name} plays dead.`; if (CFG.sound) { tone('square', 900, 120, 0.12, 0.08); tone('sine', 300, 140, 0.4, 0.05, 0.12); } } }
  const TRICKS = {cat: 'does a spinning leap!', dog: 'jumps and spins for you!', otter: 'does a barrel roll!', bunny: 'pulls off a huge binky!', robot: 'does a 360 hover spin!'};
  function trick() {
    const now = performance.now(); const list = R.petting ? [R.pets[R.petting.i]] : R.pets;
    list.forEach((P, k) => { if (!P || (P.trickT0 && now - P.trickT0 < 1200)) return; P.trickT0 = now + k * 150; for (let j = 0; j < 5; j++) setTimeout(() => spawnFx('heart', P.x + (Math.random() - 0.5) * 0.4, 0.8, P.z + (Math.random() - 0.5) * 0.4), 300 + j * 80); });
    if (CFG.sound && list[0]) { petSound(list[0].cfg.kind); tone('sine', 400, 1200, 0.35, 0.06, 0.1); }
    if (list[0]) $('#roomCaption').textContent = `${list[0].cfg.name} ${TRICKS[list[0].cfg.kind]}`;

  }
  function rubInput(x, isHand) {
    const Pt = R.petting; if (!Pt || Pt.done) return; const Pd = R.pets[Pt.i]; if (Pd && Pd.deadT) return;
    if (Pt.lastX === null) { Pt.lastX = x; return; }
    const prevX = Pt.lastX; Pt.lastX = x; const dx = x - prevX; if (Math.abs(dx) < 0.5) return; const d = Math.sign(dx);
    if (!Pt.dir) { Pt.dir = d; Pt.start = prevX; return; }
    if (d !== Pt.dir) { if (Math.abs(prevX - Pt.start) > (isHand ? 30 : 22)) rubbed(); Pt.start = prevX; Pt.dir = d; }
  }
  function heartTex() { return ctex(64, 64, (x) => { x.fillStyle = '#ff5b8a'; x.beginPath(); x.moveTo(32, 54); x.bezierCurveTo(4, 34, 6, 10, 22, 10); x.bezierCurveTo(28, 10, 32, 16, 32, 20); x.bezierCurveTo(32, 16, 36, 10, 42, 10); x.bezierCurveTo(58, 10, 60, 34, 32, 54); x.fill(); x.strokeStyle = '#1d2030'; x.lineWidth = 3; x.stroke(); }); }
  function spawnFx(kind, x, y, z) {
    if (!R) return; const mt = kind === 'heart' ? new THREE.SpriteMaterial({map: R.heartTex, transparent: true, depthWrite: false}) : new THREE.SpriteMaterial({color: 0xdff1ff, transparent: true, opacity: 0.8, depthWrite: false});
    const s = new THREE.Sprite(mt); s.scale.setScalar(kind === 'heart' ? 0.16 : 0.06); s.position.set(x, y, z); R.scene.add(s); R.fx.push({s, kind, life: 0, vx: (Math.random() - 0.5) * 0.15});
  }
  function updateFx(dt) { R.fx = R.fx.filter(f => { f.life += dt; const L = f.kind === 'heart' ? 1.3 : 2.4; f.s.position.y += dt * (f.kind === 'heart' ? 0.5 : 0.22); f.s.position.x += f.vx * dt; if (f.kind === 'bubble') f.s.scale.setScalar(0.04 + f.life * 0.04); f.s.material.opacity = Math.max(0, 1 - f.life / L); if (f.life > L) { R.scene.remove(f.s); f.s.material.dispose(); return false; } return true; }); }

  /* sound */
  function ac() { if (!R.ac) { try { R.ac = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { return null; } } return R.ac; }
  function tone(type, f0, f1, dur, vol, delay) { const a = ac(); if (!a) return; const t = a.currentTime + (delay || 0); const o = a.createOscillator(), g = a.createGain(); o.type = type; o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(f1, t + dur); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t + dur); o.connect(g).connect(a.destination); o.start(t); o.stop(t + dur + 0.05); }
  function petSound(k) {
    if (k === 'cat') { const a = ac(); if (!a) return; const t = a.currentTime; const o = a.createOscillator(), g = a.createGain(), lfo = a.createOscillator(), lg = a.createGain(); o.type = 'sawtooth'; o.frequency.value = 48; lfo.frequency.value = 24; lg.gain.value = 0.05; lfo.connect(lg).connect(g.gain); g.gain.value = 0.05; const f = a.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 300; o.connect(f).connect(g).connect(a.destination); o.start(t); lfo.start(t); g.gain.setTargetAtTime(0, t + 0.9, 0.15); o.stop(t + 1.4); lfo.stop(t + 1.4); }
    else if (k === 'dog') { tone('square', 220, 130, 0.14, 0.08); tone('square', 230, 140, 0.12, 0.07, 0.2); }
    else if (k === 'otter') { tone('sine', 1100, 1700, 0.12, 0.08); tone('sine', 1300, 1900, 0.1, 0.07, 0.14); }
    else if (k === 'bunny') tone('sine', 500, 900, 0.08, 0.08);
    else { [660, 880, 1046].forEach((f, i) => tone('triangle', f, f, 0.12, 0.07, i * 0.13)); }
  }
  function thunder() { const a = ac(); if (!a || a.state !== 'running') return; const n = a.sampleRate * 1.6; const buf = a.createBuffer(1, n, a.sampleRate); const d = buf.getChannelData(0); for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, 2); const s = a.createBufferSource(); s.buffer = buf; const f = a.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 180; const g = a.createGain(); g.gain.value = 0.25; s.connect(f).connect(g).connect(a.destination); s.start(a.currentTime + 0.4); }

  /* save cfg */
  let saveT = 0;
  function scheduleSave() { R.pending = true; clearTimeout(saveT); saveT = setTimeout(() => { R.pending = false; const c = clean(CFG); R.applied = JSON.stringify(c); const ex = store.items.find(x => x.id === 'roomcfg'); put({id: 'roomcfg', kind: 'roomcfg', created: ex ? ex.created : Date.now(), cfg: c}); }, 800); }

  /* main */
  function build() {
    const stage = $('#roomStage'); let renderer;
    try { renderer = new THREE.WebGLRenderer({antialias: true}); } catch (e) { return false; }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5)); renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.domElement.id = 'roomCanvas'; renderer.domElement.setAttribute('role', 'img'); renderer.domElement.setAttribute('aria-label', 'A 3D workshop with a desk, cork board, idea machine, slide, sketch board, gallery wall, mirror, thermostat and pets');
    stage.appendChild(renderer.domElement);
    const scene = new THREE.Scene(); scene.background = new THREE.Color('#2b2420'); scene.fog = new THREE.Fog(scene.background, 12, 22);
    const camera = new THREE.PerspectiveCamera(46, 1, 0.1, 60);
    R = {renderer, scene, camera, groups: {}, dyn: {}, hover: null, yaw: 0, pitch: 0, cur: {pos: new THREE.Vector3(...V.room.pos), tgt: new THREE.Vector3(...V.room.tgt)}, tw: null, leverT: -1e9, fx: [], pets: [], nextBolt: performance.now() + 2500, boltUntil: 0, applied: ''};
    R.hemi = new THREE.HemisphereLight(0xfff3e0, 0x5a4030, 0.7); scene.add(R.hemi);
    R.sun = new THREE.DirectionalLight(0xfff4e0, 0.9); R.sun.position.set(-3, 7, 4); R.sun.castShadow = true; R.sun.shadow.mapSize.set(2048, 2048); R.sun.shadow.bias = -0.0004; R.sun.shadow.normalBias = 0.02; R.sun.shadow.radius = 3; Object.assign(R.sun.shadow.camera, {left: -7, right: 7, top: 7, bottom: -7, near: 1, far: 20}); scene.add(R.sun);
    R.lamp = new THREE.PointLight(0xffc98a, 1, 7, 1.6); scene.add(R.lamp);
    R.fill = new THREE.PointLight(0xffe2b8, 0.5, 10, 2); R.fill.position.set(1.5, 3.4, 1.5); scene.add(R.fill);
    R.neon1 = new THREE.PointLight(0xff3ea5, 0, 9, 1.5); R.neon1.position.set(-3, 2.5, 1); scene.add(R.neon1);
    R.neon2 = new THREE.PointLight(0x00e0ff, 0, 9, 1.5); R.neon2.position.set(3.5, 2.5, -1); scene.add(R.neon2);
    if (THREE.RoomEnvironment) { try { const pg = new THREE.PMREMGenerator(renderer); scene.environment = pg.fromScene(new THREE.RoomEnvironment(), 0.04).texture; pg.dispose(); } catch (e) {} }
    R.shell = new THREE.Group(); scene.add(R.shell); R.petsG = new THREE.Group(); scene.add(R.petsG);
    R.skyCanvas = document.createElement('canvas'); R.skyCanvas.width = 512; R.skyCanvas.height = 360; R.skyCtx = R.skyCanvas.getContext('2d'); R.skyTex = new THREE.CanvasTexture(R.skyCanvas);
    R.archMask = ctex(256, 256, (x, w, h) => { x.fillStyle = '#000'; x.fillRect(0, 0, w, h); x.fillStyle = '#fff'; const r = w / 2; x.beginPath(); x.moveTo(0, h); x.lineTo(0, r * (h / w) * 1); x.ellipse(w / 2, r * (h / w), r, r * (h / w), 0, Math.PI, 0); x.lineTo(w, h); x.closePath(); x.fill(); });
    R.heartTex = heartTex();
    R.stars = Array.from({length: 60}, () => [Math.random() * 512, Math.random() * 200, 0.3 + Math.random() * 0.7]);
    R.clouds = Array.from({length: 10}, (_, i) => ({x: Math.random() * 700, y: 30 + Math.random() * 140, s: 0.7 + Math.random() * 0.8, v: 0.004 + Math.random() * 0.008}));
    R.skyline = []; let bx = 0; while (bx < 512) { const bw = 50 + Math.random() * 40, bh = 90 + Math.random() * 120; const win = []; for (let wy = 360 - bh + 10; wy < 354; wy += 12) for (let wx = bx + 6; wx < bx + bw - 6; wx += 10) win.push([wx, wy, Math.random() < 0.45]); R.skyline.push({x: bx, w: bw, h: bh, win}); bx += bw + 6; }
    rebuildAll(); rebuildPets(); drawSky(0);
    const el = renderer.domElement; let down = null; const ray = new THREE.Raycaster(); const v2 = new THREE.Vector2();
    const pickAt = R.pickAt = (cx, cy) => { const r = el.getBoundingClientRect(); v2.set(((cx - r.left) / r.width) * 2 - 1, -((cy - r.top) / r.height) * 2 + 1); ray.setFromCamera(v2, camera); const ph = ray.intersectObjects(R.petsG.children, true)[0]; if (ph && ph.object.userData.pet !== undefined) return {pet: ph.object.userData.pet}; const hits = ray.intersectObjects(Object.values(R.groups), true); for (const h of hits) { let o = h.object; while (o && !o.userData.station) o = o.parent; if (o) return {st: o.userData.station}; } return null; };
    const HAND_ID = 77; const handRad = () => Math.max(22, Math.min(innerWidth, innerHeight) * 0.04);
    const pickNear = R.pickNear = (cx, cy, rad, n) => { const h0 = pickAt(cx, cy); if (h0) return h0; n = n || 8; for (const f of [0.5, 1]) for (let k = 0; k < n; k++) { const a = k / n * 6.283 + f; const h = pickAt(cx + Math.cos(a) * rad * f, cy + Math.sin(a) * rad * f); if (h) return h; } return null; };
    const pickFor = (e, n) => e.pointerId === HAND_ID ? pickNear(e.clientX, e.clientY, handRad(), n) : pickAt(e.clientX, e.clientY);
    const devOn = () => R.thermoOn && R.focusSt === 'thermostat' && !R.petting;
    let knob = null, devDown = null;
    const dialC = () => { const v = new THREE.Vector3(-4.4, 2.5, -3.925).project(R.camera); const r = el.getBoundingClientRect(); return {x: r.left + (v.x + 1) / 2 * r.width, y: r.top + (1 - v.y) / 2 * r.height}; };
    const angAt = e => { const c = dialC(); return Math.atan2(e.clientY - c.y, e.clientX - c.x); };
    el.addEventListener('wheel', e => { if (!devOn() || !thermoHitAt(e.clientX, e.clientY)) return; e.preventDefault(); R.wheelAcc = (R.wheelAcc || 0) + e.deltaY; if (Math.abs(R.wheelAcc) >= 60) { const d = Math.sign(R.wheelAcc); R.wheelAcc = 0; twist(d); } }, {passive: false});
    el.addEventListener('pointerdown', e => { if (devOn()) { const h = thermoPick(e.clientX, e.clientY, e.pointerId === HAND_ID); if (h && h.part !== 'plate') { devDown = {h, sx: e.clientX, sy: e.clientY}; knob = e.pointerId === HAND_ID ? null : {a: angAt(e), acc: 0, turned: false}; try { el.setPointerCapture(e.pointerId); } catch (er) {} ac(); return; } }
      down = {x: e.clientX, y: e.clientY, sx: e.clientX, sy: e.clientY}; try { el.setPointerCapture(e.pointerId); } catch (er) {} ac(); if (R.ac && R.ac.state === 'suspended') R.ac.resume(); });
    el.addEventListener('pointermove', e => {
      if (knob) { const a = angAt(e); let da = a - knob.a; da = Math.atan2(Math.sin(da), Math.cos(da)); knob.a = a; if (Math.hypot(e.clientX - devDown.sx, e.clientY - devDown.sy) > 10) { knob.acc += da; window.ThermoUI && ThermoUI.grip(true); } while (Math.abs(knob.acc) >= 0.32) { const d = Math.sign(knob.acc); knob.acc -= d * 0.32; knob.turned = true; twist(d); } return; }
      if (devOn() && !down) { const t = performance.now(); if (t - (R.hoverT || 0) < 40) return; R.hoverT = t; const h = thermoPick(e.clientX, e.clientY, e.pointerId === HAND_ID); el.style.cursor = h && h.part !== 'plate' ? 'pointer' : 'grab'; window.ThermoUI && ThermoUI.hover(h, e.pointerId === HAND_ID); if (h) return; }
      if (R.petting) { const h = pickAt(e.clientX, e.clientY); if (h && h.pet === R.petting.i) rubInput(e.clientX, false); return; } if (down) { const ym = R.camera.aspect < 0.8 ? 0.75 : 0.45; R.yaw = Math.max(-ym, Math.min(ym, R.yaw - (e.clientX - down.x) * 0.003)); R.pitch = Math.max(-0.2, Math.min(0.25, R.pitch + (e.clientY - down.y) * 0.002)); down.x = e.clientX; down.y = e.clientY; return; } if (e.pointerType === 'mouse') { const t = performance.now(); if (t - (R.hoverT || 0) < 50) return; R.hoverT = t; setHover(pickFor(e, 6)); } });
    el.addEventListener('pointerup', e => {
      if (devDown) { const dd = devDown, k = knob; devDown = null; knob = null; window.ThermoUI && ThermoUI.grip(false); if (Math.hypot(e.clientX - dd.sx, e.clientY - dd.sy) < 8 && !(k && k.turned)) { const h = dd.h; if (h.part === 'ring') twist(h.side); else if (h.part === 'screen') { window.ThermoUI && ThermoUI.tap(h.x, h.y, e.pointerId === HAND_ID); } } return; }
      const moved = down ? Math.hypot(e.clientX - down.sx, e.clientY - down.sy) : 99; down = null; if (moved < 6) { const h = pickFor(e); if (R.petting && !(h && h.pet === R.petting.i)) { endPetting(!(h && h.st)); if (!h || !h.st) return; } if (h && h.pet !== undefined) petIt(h.pet); else if (h && h.st) { Room.pulse(h.st); goto(h.st); } } });
    el.addEventListener('pointerleave', () => setHover(null));
    new ResizeObserver(resize).observe(stage); resize();
    let last = performance.now(), skyT = 0;
    const loop = now => {
      requestAnimationFrame(loop); if (document.hidden) { last = now; return; }
      const dt = Math.min(0.05, (now - last) / 1000); last = now;
      if (R.tw) { const k = Math.min(1, (now - R.tw.t0) / R.tw.dur); const e = ease(k); R.cur.pos.lerpVectors(R.tw.from.pos, R.tw.to.pos, e); R.cur.tgt.lerpVectors(R.tw.from.tgt, R.tw.to.tgt, e); if (k >= 1) R.tw = null; }
      const c = R.camera; const off = new THREE.Vector3().subVectors(R.cur.pos, R.cur.tgt).multiplyScalar(R.zoomF || 1); off.applyAxisAngle(new THREE.Vector3(0, 1, 0), R.yaw); off.y += R.pitch * off.length(); c.position.copy(R.cur.tgt).add(off); c.lookAt(R.cur.tgt);
      const lt = (now - R.leverT) / 700; if (R.lever) R.lever.rotation.z = lt >= 0 && lt <= 1 ? -Math.sin(lt * Math.PI) * 0.9 : 0;
      const wx = weather(); if (now - skyT > (wx === 'rain' || wx === 'thunderstorm' || wx === 'snow' ? 66 : 400)) { skyT = now; drawSky(now); }
      R.sun.intensity = R.baseSun + (R.flash ? 2.2 : 0);
      if (R.flame) { const f = 1 + Math.sin(now / 70) * 0.08 + Math.sin(now / 37) * 0.05; R.flame.scale.set(1, f, 1); R.lamp.intensity = R.baseLamp * (0.92 + Math.sin(now / 53) * 0.08); }
      if (!reduceMotion) { const a = R.dust.geometry.attributes.position; for (let i = 0; i < a.count; i++) { let y = a.getY(i) + 0.0012 + Math.sin(now / 1300 + i) * 0.0006; if (y > 3.8) y = 0.2; a.setY(i, y); } a.needsUpdate = true;
        if (R.balls) R.balls.children.forEach((b, i) => { b.position.y = b.userData.y + (lt >= 0 && lt <= 1.5 ? Math.abs(Math.sin(now / 90 + i)) * 0.05 : 0); }); }
      if (R.thermoSpin && R.thermoRing) { const k = Math.min(1, (now - R.thermoSpin.t0) / 160); R.thermoRing.rotation.z = R.thermoSpin.from + (R.thermoSpin.to - R.thermoSpin.from) * (1 - Math.pow(1 - k, 3)); if (k >= 1) R.thermoSpin = null; }
      updatePets(dt, now); updateFx(dt);
      R.fpsN = (R.fpsN || 0) + 1; if (now - (R.fpsT || 0) > 1000) { const fc = document.getElementById('fpsChip'); if (fc) fc.textContent = Math.round(R.fpsN * 1000 / (now - (R.fpsT || now - 1000))) + ' fps'; R.fpsN = 0; R.fpsT = now; }
      const pn = document.getElementById('panel'); if (pn && !pn.hidden && innerWidth <= 760 && !document.body.classList.contains('panel-thermo')) return;
      R.renderer.render(R.scene, c);
    };
    const dn = 140, dpos = new Float32Array(dn * 3); for (let i = 0; i < dn; i++) { dpos[i * 3] = (Math.random() - 0.5) * 9; dpos[i * 3 + 1] = Math.random() * 3.6; dpos[i * 3 + 2] = (Math.random() - 0.5) * 7; }
    const dgeo = new THREE.BufferGeometry(); dgeo.setAttribute('position', new THREE.BufferAttribute(dpos, 3));
    R.dust = new THREE.Points(dgeo, new THREE.PointsMaterial({color: 0xffe9c4, size: 0.035, transparent: true, opacity: 0.4, depthWrite: false})); scene.add(R.dust);
    requestAnimationFrame(loop);
    return true;
  }
  function setHover(h) {
    if (R.petting) return;
    const key = h ? (h.pet !== undefined ? 'pet' + h.pet : h.st) : null; if (R.hover === key) return; R.hover = key;
    const st = h && h.st;
    Object.entries(R.groups).forEach(([k, g]) => g.traverse(o => { if (o.material && o.material.emissive && o.material.userData) { if (o.userData.baseE === undefined) o.userData.baseE = o.material.emissive.getHex(); o.material.emissive.setHex(k === st ? 0x2a1a00 : o.userData.baseE); } }));
    R.renderer.domElement.style.cursor = h ? 'pointer' : 'grab';
    if (h && h.pet !== undefined) { const P = R.pets[h.pet]; $('#roomCaption').textContent = P ? `${P.cfg.name} the ${PET_KINDS[P.cfg.kind].label.toLowerCase()}. Click to give ${P.cfg.kind === 'robot' ? 'it' : 'them'} a pat.` : defaultCaption(); }
    else $('#roomCaption').textContent = st ? `${SNAME[st]}: ${SDESC[st]} Click to use it.` : defaultCaption();
  }
  const defaultCaption = () => { const pets = R && R.pets && R.pets.length ? ` ${R.pets.map(p => p.cfg.name).join(', ').replace(/, ([^,]*)$/, ' and $1')} ${R.pets.length > 1 ? 'are' : 'is'} wandering about.` : ''; return `Drag to look around. Tap anything in the room to use it.${pets}`; };
  function resize() { const st = $('#roomStage'); const w = st.clientWidth, h = st.clientHeight; if (!w || !h) return; R.renderer.setSize(w, h, false); R.camera.aspect = w / h; R.camera.fov = w / h < 0.8 ? 66 : w / h < 1.2 ? 56 : 46; if (R.focusSt === 'thermostat') setTimeout(() => { if (R.focusSt !== 'thermostat') return; const v = viewFor('thermostat'); if (R.tw) R.tw.to = v; else { R.cur.pos.copy(v.pos); R.cur.tgt.copy(v.tgt); } }); R.camera.updateProjectionMatrix(); }
  function viewFor(st) { const v = V[st || 'room']; const p = new THREE.Vector3(...v.pos), t = new THREE.Vector3(...v.tgt); if (!st && R.camera.aspect < 0.8) { p.set(0, 4.0, 7.4); t.set(0, 1.0, -1.2); } if (st === 'thermostat') { const th = Math.tan(R.camera.fov * Math.PI / 360), fitH = th * 0.72, fitW = th * R.camera.aspect * 0.94; const d = 0.232 / Math.min(fitH, fitW); const lift = th * d * (R.camera.aspect < 0.8 ? 0.06 : 0.12); p.set(-4.4, 2.5 - lift, -3.93 + d); t.set(-4.4, 2.5 - lift, -3.96); } return {pos: p, tgt: t}; }
  let rT = 0;
  return {
    init() { if (!window.THREE) return false; const ok = build(); if (!ok) return false; (document.fonts ? document.fonts.ready : Promise.resolve()).then(() => { refreshDyn(); drawThermo(); }); return true; },
    refresh() {
      if (!R) return;
      const doc = store.items.find(x => x.id === 'roomcfg');
      if (doc && doc.cfg && !R.pending) { const j = JSON.stringify(doc.cfg); if (j !== R.applied) { R.applied = j; CFG = mergeRoomCfg(doc.cfg); rebuildAll(); rebuildPets(); renderRoomCfg(); return; } }
      clearTimeout(rT); rT = setTimeout(refreshDyn, 250);
    },
    focus(st, fromPet) { if (!R) return; if (R.petting && !fromPet) endPetting(true); R.focusSt = st || null; R.tw = {from: {pos: R.cur.pos.clone(), tgt: R.cur.tgt.clone()}, to: viewFor(st), t0: performance.now(), dur: reduceMotion ? 1 : 1100}; R.yaw = 0; R.pitch = 0; R.zoomF = 1; if (fromPet) R.hover = null; else setHover(null); if (st && SPOT[st] && R.pets.length && Math.random() < 0.7) { const P = R.pets[0]; if (P.state !== 'sleep') walkTo(P, SPOT[st][0], SPOT[st][1], 'sit', performance.now()); } },
    pulse(st) { if (R && st === 'machine') R.leverT = performance.now(); },
    isPetting() { return !!(R && R.petting); },
    overPet(x, y) { if (!R || !R.petting || !R.pickNear) return false; const h = R.pickNear(x, y, Math.max(30, Math.min(innerWidth, innerHeight) * 0.06), 6); return !!(h && h.pet === R.petting.i); },
    trick() { if (R) trick(); },
    stand(on) { if (R) stand(on); },
    playDead() { if (R) playDead(); },
    isThermo() { return !!(R && R.thermoOn && R.focusSt === 'thermostat' && !R.petting); },
    thermoOver(x, y) { if (!R || !R.thermoOn) return false; const h = thermoPick(x, y, true); if (!h || h.part === 'plate') return false; return h.part === 'ring' || !!(window.ThermoUI && ThermoUI.zoneAt(h.x, h.y, true)); },
    thermoDial() { if (!R || !R.thermoOn) return null; const r = R.renderer.domElement.getBoundingClientRect(); const pr = v => { v.project(R.camera); return {x: r.left + (v.x + 1) / 2 * r.width, y: r.top + (1 - v.y) / 2 * r.height}; }; const c = pr(new THREE.Vector3(-4.4, 2.5, -3.925)), e = pr(new THREE.Vector3(-4.4 + 0.225, 2.5, -3.925)); return {x: c.x, y: c.y, r: Math.hypot(e.x - c.x, e.y - c.y)}; },
    thermoTwist(d) { if (R && R.thermoOn) twist(d); },
    thermoGrip(on) { if (window.ThermoUI) ThermoUI.grip(!!on); },
    thermoMode(on) { if (!R) return; on = !!on; if (R.thermoOn === on) return; R.thermoOn = on; if (on) setHover(null); drawThermo(); },
    thermoRedraw() { drawThermo(); },
    thermoScreen(px, py, part) { if (!R || !R.thermo) return null; const v = part === 'ring' ? new THREE.Vector3(-4.4 + px * 0.2, 2.5, -3.9) : new THREE.Vector3(-4.4 + (px / 512 * 2 - 1) * 0.18, 2.5 - (py / 512 * 2 - 1) * 0.18, -3.925); v.project(R.camera); const r = R.renderer.domElement.getBoundingClientRect(); return {x: r.left + (v.x + 1) / 2 * r.width, y: r.top + (1 - v.y) / 2 * r.height}; },
    petPlace(i, x, z) { const P = R && R.pets[i]; if (P) { P.x = x; P.z = z; P.tx = x; P.tz = z; P.state = 'idle'; P.until = performance.now() + 4000; } },
    petDebug() { return (R && R.pets || []).map(P => { const b = new THREE.Box3().setFromObject(P.m.root); const k = P.cfg.kind; return {k, anim: !!P.m.anim, src: PETM[k] && PETM[k].size ? PETM[k].size.toArray().map(v => +v.toFixed(3)) : PETM[k] && PETM[k].state, world: b.getSize(new THREE.Vector3()).toArray().map(v => +v.toFixed(3)), clips: PETM[k] && PETM[k].clips ? PETM[k].clips.map(c => c.name).slice(0, 12) : null}; }); },
    petsInfo() { return R && R.pets ? R.pets.map(P => ({k: P.cfg.kind, x: +P.x.toFixed(2), z: +P.z.toFixed(2), s: P.state, t: P.inter ? P.inter.type : ''})) : []; },
    petScreen(i) { if (!R || !R.pets[i]) return null; const P = R.pets[i]; const v = new THREE.Vector3(P.x, 0.3, P.z).project(R.camera); const r = R.renderer.domElement.getBoundingClientRect(); return {x: r.left + (v.x + 1) / 2 * r.width, y: r.top + (1 - v.y) / 2 * r.height}; },
    rubInput(x, isHand) { if (R) rubInput(x, isHand); },
    stopPetting() { if (R && R.petting) endPetting(); },
    zoom(f) { if (!R || !isFinite(f)) return; R.zoomF = Math.max(0.45, Math.min(1.6, (R.zoomF || 1) * Math.max(0.85, Math.min(1.18, f)))); },
    look(dx, dy) { if (!R) return; const ym = R.camera.aspect < 0.8 ? 0.75 : 0.45; R.yaw = Math.max(-ym, Math.min(ym, R.yaw - dx * 0.003)); R.pitch = Math.max(-0.2, Math.min(0.25, R.pitch + dy * 0.002)); },
    cheer() { if (!R) return; const now = performance.now(); R.pets.forEach(P => { if (P.state !== 'sleep') { P.state = 'happy'; P.t0 = now; P.until = now + 1200; spawnFx('heart', P.x, 0.55, P.z); } }); },
    caption: () => R ? defaultCaption() : '',
    cfg: () => CFG,
    set(fn, kind, key) { fn(CFG); if (!R) return; if (kind === 'color') recolor(key); else if (kind === 'light') applyLights(); else if (kind === 'pets') { rebuildPets(); } else if (kind === 'petcolor') rebuildPets(); else if (kind === 'quiet') {} else { rebuildAll(); } scheduleSave(); },
    replace(c) { CFG = mergeRoomCfg(c); if (R) { rebuildAll(); rebuildPets(); } scheduleSave(); }
  };
})();

/* thermostat panel UI */
function renderRoomCfg() {
  const C = Room.cfg();
  $('#cfgPresets').innerHTML = Object.entries(PRESETS).map(([k, p]) => `<button class="btn btn-sm ${C.preset === k ? 'btn-yellow' : ''}" type="button" data-preset="${k}" aria-pressed="${C.preset === k}"><span class="pre-sw" aria-hidden="true">${[0, 3, 7, 12].map(i => `<span style="background:${p.c[i]}"></span>`).join('')}</span>${esc(p.label)}</button>`).join('');
  $('#cfgWeather').value = C.weather; $('#cfgTime').value = C.time; $('#cfgMood').value = C.mood; $('#cfgBright').value = C.brightness; $('#cfgLamp').value = C.lampColor;
  $('#cfgWinCount').value = String(C.windows.count); $('#cfgWinStyle').value = C.windows.style; $('#cfgSound').checked = !!C.sound;
  $('#partCfg').innerHTML = PART_GROUPS.map(([g, keys]) => `<div class="part-group"><h4>${esc(g)}</h4>${keys.map(k => `<div class="part-row"><label for="pc-${k}">${esc(PART_LABEL[k])}</label>${PART_TYPES[k] ? `<select data-cfgtype="${k}" aria-label="${esc(PART_LABEL[k])} style">${PART_TYPES[k].map(t => `<option value="${esc(t)}" ${C.parts[k].type === t ? 'selected' : ''}>${esc(cap(t))}</option>`).join('')}</select>` : '<span></span>'}<input type="color" id="pc-${k}" class="sw-in" data-cfgcolor="${k}" value="${esc(C.parts[k].color)}"></div>`).join('')}</div>`).join('');
  $('#petCfg').innerHTML = C.pets.map((p, i) => `<div class="pet-card ${p.on ? 'on' : ''}"><img src="${PET_KINDS[p.kind].icon}" alt="" width="44" height="44"><div class="stack-tight"><div class="row"><label class="pick"><input type="checkbox" data-peton="${i}" id="pet-on-${i}" ${p.on ? 'checked' : ''}><span>${p.on ? 'In the room' : 'Invite in'}</span></label><span class="hint">${esc(PET_KINDS[p.kind].label)}${p.petted ? ` · petted ${p.petted} time${p.petted === 1 ? '' : 's'}` : ''}</span></div><div class="row"><label class="vh" for="pet-name-${i}">Name</label><input type="text" id="pet-name-${i}" data-petname="${i}" value="${esc(p.name)}" maxlength="20"><label class="vh" for="pet-col-${i}">Colour</label><input type="color" id="pet-col-${i}" class="sw-in" data-petcolor="${i}" value="${esc(p.color)}"></div></div></div>`).join('');
}
function randomRoom() {
  const C = Room.cfg(); const h0 = Math.random() * 360;
  const hsl = (h, s, l) => { const c = new THREE.Color(); c.setHSL(((h % 360) + 360) % 360 / 360, s, l); return '#' + c.getHexString(); };
  Room.set(c => {
    c.preset = 'custom';
    PART_KEYS.forEach((k, i) => { if (PART_TYPES[k]) c.parts[k].type = pick(PART_TYPES[k]); c.parts[k].color = k === 'walls' ? hsl(h0, 0.25, 0.72) : k === 'floor' ? hsl(h0 + 30, 0.3, 0.5) : hsl(h0 + [0, 150, 210, 60][i % 4] + Math.random() * 30, 0.55 + Math.random() * 0.25, 0.45 + Math.random() * 0.2); });
    c.windows.style = pick(['square', 'arched', 'round']);
  });
  renderRoomCfg();
}

/* ---------- render all + routing ---------- */
function renderAll() {
  renderTally(); renderJournal(); renderPins(); renderAttach(); renderTray(); renderBoard(); renderPlayground(); renderGallery();
  if (S.station === 'mirror') drawMirror();
  if (S.station === 'wall') { if (S.wallMode === 'map2d') draw2D(); else if (S.wallMode === 'const' && T) buildConst(); else if (S.wallMode === 'block') renderBlockSelects(); }
  setAI();
  Room.refresh();
}
const STATIONS = ['workbench', 'pinboard', 'corner', 'machine', 'playground', 'wall', 'gallery', 'mirror', 'portfolio', 'thermostat'];
function route() {
  const h = location.hash.slice(1); const st = STATIONS.includes(h) ? h : null; S.station = st || 'room';
  if (st !== 'thermostat') S.thermoList = false; const device = st === 'thermostat' && !S.thermoList; const pst = device ? null : st;
  const panel = $('#panel'); const wasHidden = panel.hidden; panel.hidden = !pst; document.body.classList.toggle('panel-open', !!pst); document.body.classList.toggle('panel-thermo', pst === 'thermostat'); document.body.classList.toggle('thermo-device', device);
  $('#thermoBar').hidden = !device; Room.thermoMode(device); if (!device && window.ThermoUI) ThermoUI.stopEdit();
  $$('.station').forEach(s => { s.hidden = s.dataset.name !== pst; });
  $$('.stations a').forEach(a => a.setAttribute('aria-current', a.dataset.st === st ? 'page' : 'false'));
  if (device) $('#roomCaption').textContent = 'Thermostat: tap a row on the screen, turn the ring or tap its sides to change it. Blue button goes back.';
  else if (st) { $('#panelTitle').textContent = SNAME[st]; const ic = $(`.stations a[data-st="${st}"] img`); if (ic) $('#panelIcon').src = ic.src; if (wasHidden) { $('.panel-body').scrollTop = 0; $('#backRoom').focus({preventScroll: true}); } }
  else $('#roomCaption').textContent = Room.caption();
  Room.focus(st);
  if (st === 'wall') setWallMode(S.wallMode);
  if (st === 'mirror') drawMirror();
  if (st === 'portfolio') renderPortfolio();
  if (st === 'corner') renderChat();
  if (st === 'playground') { drawTimer(); drawWheel(); renderCorpse(); }
  if (st === 'thermostat') renderRoomCfg();
}

/* ---------- events ---------- */
function goto(st) { if (location.hash.slice(1) === st) route(); else location.hash = st; }
const ACTS = {
  talk: it => { S.attach = it.id; renderAttach(); goto('corner'); if (!$('#chatInput').value) $('#chatInput').value = 'Help me dig into this.'; $('#chatInput').focus(); },
  scrap: it => { if (S.scraps.includes(it.id)) S.scraps = S.scraps.filter(x => x !== it.id); else { S.scraps.push(it.id); if (S.scraps.length > 3) S.scraps.shift(); notice('Added to the Idea Machine tray.'); } renderAll(); },
  del: (it, b) => { if (!b.dataset.armed) { b.dataset.armed = '1'; b.textContent = 'Tap again to delete'; b.classList.add('btn-red'); setTimeout(() => { if (b.isConnected) { delete b.dataset.armed; b.textContent = 'Delete'; b.classList.remove('btn-red'); } }, 3500); return; } remove(it.id); },
  why: (it, b) => whyPin(it, b),
  stage: (it, b) => { it.stage = Math.max(0, Math.min(4, (it.stage || 0) + (+b.dataset.dir))); put(it); },
  hang: it => { goto('gallery'); openPieceForm(it); },
  compost: it => { it.composted = true; it.compostedAt = Date.now(); put(it); notice('Composted. It will break down into something useful.'); },
  revive: it => { it.composted = false; it.stage = 0; it.revived = (it.revived || 0) + 1; put(it); notice('Revived. It is back on the concept board as a Spark.'); },
  plant: it => { if (!S.scraps.includes(it.id)) { S.scraps.push(it.id); if (S.scraps.length > 3) S.scraps.shift(); } goto('machine'); renderAll(); },
  edit: it => { S.editing = it.id; renderJournal(); },
  editcancel: () => { S.editing = null; renderJournal(); },
  editsave: it => { const ta = document.getElementById('edit-' + it.id); const t = ta ? ta.value.trim() : ''; if (!t && !it.photo) return notice('An entry needs some words or a photo.'); it.text = t; it.themes = localThemes(t, 4); S.editing = null; put(it); notice('Entry updated.'); enrich(it.id); },
  hideex: () => { setHideEx(true); },
  sketch: it => { S.block = {id: '', shapes: clean(STARTER), sel: -1, conceptId: it.id}; $('#blockName').value = it.title + ', first pass'; S.wallMode = 'block'; goto('wall'); }
};
document.addEventListener('click', ev => {
  const b = ev.target.closest('[data-act]');
  if (b) { const card = b.closest('[data-id]'); const it = card && find(card.dataset.id); if (it && ACTS[b.dataset.act]) ACTS[b.dataset.act](it, b, ev); return; }
  const sc = ev.target.closest('[data-scrap]'); if (sc) { const id = sc.dataset.scrap; if (S.scraps.includes(id)) S.scraps = S.scraps.filter(x => x !== id); else { S.scraps.push(id); if (S.scraps.length > 3) S.scraps.shift(); } renderTray(); return; }
  const kp = ev.target.closest('[data-keep]'); if (kp && S.out) { const c = S.out.concepts[+kp.dataset.keep]; const srcThemes = [...new Set(S.out.sources.map(find).filter(Boolean).flatMap(itemThemes))].slice(0, 4); put({id: nid('c'), kind: 'concept', created: Date.now(), stage: 0, title: String(c.title), premise: String(c.premise || ''), medium: String(c.medium || ''), materials: (c.materials || []).map(String).slice(0, 6), experiment: String(c.experiment || ''), stretch: String(c.stretch || ''), sources: S.out.sources, constraint: S.out.constraint, audience: S.out.audience, themes: srcThemes.length ? srcThemes : localThemes(c.title + ' ' + c.premise, 3), ...(kp.dataset.compostout ? {composted: true, compostedAt: Date.now()} : {})}); $$('[data-keep="' + kp.dataset.keep + '"]').forEach(b => b.disabled = true); kp.textContent = kp.dataset.compostout ? 'In the compost' : 'Kept on the board'; return; }
  const ms = ev.target.closest('[data-msgspark]'); if (ms && S.thread) { const m = S.thread.messages[+ms.dataset.msgspark]; if (m) { const first = (m.content.match(/[^.!?]+[.!?]?/) || [m.content])[0]; put({id: nid('s'), kind: 'spark', created: Date.now(), text: clip(first, 180), themes: localThemes(m.content, 3), source: S.thread.id}); ms.disabled = true; ms.textContent = 'Kept'; } return; }
  const pf = ev.target.closest('[data-filter]'); if (pf) { S.pinFilter = pf.dataset.filter; renderPins(); return; }
  const pt = ev.target.closest('[data-ptype]'); if (pt) { setPinType(pt.dataset.ptype); return; }
  const wm = ev.target.closest('[data-wm]'); if (wm) { setWallMode(wm.dataset.wm); return; }
  const ad = ev.target.closest('[data-add]'); if (ad) { const sh = S.block.shapes; sh.push({type: ad.dataset.add, x: ((sh.length % 5) - 2) * 0.6, y: 0, z: 0.6, s: 1, ry: 0, color: PAL[sh.length % PAL.length]}); S.block.sel = sh.length - 1; buildBlock(); return; }
  const bt = ev.target.closest('[data-bt]'); if (bt) { blockAct(bt.dataset.bt); return; }
  const zm = ev.target.closest('[data-zoom]'); if (zm && T) { T.dist = Math.max(4, Math.min(30, T.dist + (+zm.dataset.zoom) * 2)); return; }
});
$('#drawPrompt').addEventListener('click', () => {
  let p; do { p = pick(PROMPTS); } while (p === S.prompt && PROMPTS.length > 1);
  S.prompt = p; $('#promptText').textContent = p; const c = $('#promptCard'); c.classList.remove('flip'); void c.offsetWidth; c.classList.add('flip');
});
$('#entryPhoto').addEventListener('change', async e => { const f = e.target.files[0]; if (!f) return; try { S.entryPhoto = await fileToDataURL(f, 900); $('#photoName').textContent = 'Photo ready: ' + clip(f.name, 30); } catch (er) { notice('That photo could not be read. Try a JPG or PNG.'); } });
/* the bench is modular: each part of an entry can be removed or added back, and the layout is remembered */
const BLOCKS = [['prompt', 'Prompt card'], ['title', 'Title'], ['text', 'Writing'], ['medium', 'Medium'], ['energy', 'Energy'], ['tags', 'Tags'], ['link', 'Link'], ['photo', 'Photo']];
const BLK_DEFAULT = ['prompt', 'text', 'medium', 'energy', 'photo'];
let benchOn = (() => { try { const v = JSON.parse(localStorage.getItem('studio-bench-layout')); if (Array.isArray(v) && v.every(k => BLOCKS.some(b => b[0] === k))) return v; } catch (e) {} return BLK_DEFAULT.slice(); })();
function renderBench(focusKey) {
  $$('#benchBlocks [data-blk]').forEach(el => { el.hidden = !benchOn.includes(el.dataset.blk); });
  const off = BLOCKS.filter(([k]) => !benchOn.includes(k));
  $('#blkAdd').innerHTML = off.length ? off.map(([k, n]) => `<button class="btn btn-sm" type="button" data-blkadd="${k}"><span aria-hidden="true">+</span> ${esc(n)}</button>`).join('') : '<span class="hint">Everything is on the bench.</span>';
  $('#saveEntry').disabled = !benchOn.length;
  if (focusKey) { const el = $(`#benchBlocks [data-blk="${focusKey}"]`); const f = el && el.querySelector('input:not([type=file]):not([type=radio]), textarea, button'); if (f) f.focus(); }
}
function setBench(list, focusKey) { benchOn = BLOCKS.map(b => b[0]).filter(k => list.includes(k)); try { localStorage.setItem('studio-bench-layout', JSON.stringify(benchOn)); } catch (e) {} renderBench(focusKey); }
$('#benchBlocks').addEventListener('click', e => { const x = e.target.closest('[data-blkx]'); if (!x) return; const k = x.dataset.blkx; setBench(benchOn.filter(b => b !== k)); const nxt = $('#blkAdd [data-blkadd="' + k + '"]'); if (nxt) nxt.focus(); });
$('#blkAdd').addEventListener('click', e => { const a = e.target.closest('[data-blkadd]'); if (!a) return; setBench(benchOn.concat(a.dataset.blkadd), a.dataset.blkadd); });
renderBench();
$('#saveEntry').addEventListener('click', () => {
  const on = k => benchOn.includes(k);
  const text = on('text') ? $('#entryText').value.trim() : '', title = on('title') ? $('#entryTitle').value.trim() : '';
  const tags = on('tags') ? $('#entryTags').value.split(',').map(t => t.trim().toLowerCase()).filter(Boolean).slice(0, 8) : [];
  let link = on('link') ? $('#entryLink').value.trim() : ''; if (link && !/^https?:\/\//i.test(link)) link = 'https://' + link;
  const photo = on('photo') ? S.entryPhoto : '';
  if (!text && !photo && !title && !tags.length && !link) return notice('Add something first: words, a title, tags, a link or a photo.');
  const it = {id: nid('e'), kind: 'entry', created: Date.now(), text, prompt: on('prompt') ? S.prompt : '', photo, themes: tags.concat(localThemes([title, text].join(' '), 4)).filter((t, i, a) => a.indexOf(t) === i).slice(0, 6)};
  if (title) it.title = title; if (tags.length) it.tags = tags; if (link) it.link = link;
  if (on('medium')) it.medium = val('medium') || 'mixed'; if (on('energy')) it.energy = +(val('energy') || 3);
  put(it);
  $('#entryText').value = ''; $('#entryTitle').value = ''; $('#entryTags').value = ''; $('#entryLink').value = ''; S.entryPhoto = ''; $('#entryPhoto').value = ''; $('#photoName').textContent = ''; S.prompt = ''; $('#promptText').textContent = 'Draw a card when you don\'t know where to start.';
  notice('Pinned to the bench.');
  enrich(it.id);
});
$('#journalSearch').addEventListener('input', renderJournal);
$('#workFilters').addEventListener('click', e => { const b = e.target.closest('[data-wf]'); if (!b) return; S.workFilter = b.dataset.wf; renderPortfolio(); });
$('#pinImage').addEventListener('change', e => takePinImage(e.target.files[0]));
const dz = $('#dropZone');
['dragenter', 'dragover'].forEach(t => dz.addEventListener(t, e => { e.preventDefault(); dz.classList.add('over'); }));
['dragleave', 'drop'].forEach(t => dz.addEventListener(t, e => { e.preventDefault(); dz.classList.remove('over'); }));
dz.addEventListener('drop', e => takePinImage(e.dataTransfer.files[0]));
document.addEventListener('paste', e => { if (S.station !== 'pinboard') return; const f = [...(e.clipboardData && e.clipboardData.files || [])].find(x => x.type.startsWith('image/')); if (f) { e.preventDefault(); takePinImage(f); } });
$('#savePin').addEventListener('click', savePin);
$('#personaPicks').addEventListener('change', e => { if (e.target.name === 'persona') { S.persona = e.target.value; if (!S.thread || !S.thread.messages.length) renderChat(); } });
$('#attachSel').addEventListener('change', e => { S.attach = e.target.value; renderAttach(); });
$('#threadSel').addEventListener('change', e => { const t = find(e.target.value); if (t) { S.thread = clean(t); renderChat(); } });
$('#newThread').addEventListener('click', () => { newThread(); $('#chatInput').focus(); });
$('#chatForm').addEventListener('submit', e => { e.preventDefault(); const t = $('#chatInput').value.trim(); if (!t) return; $('#chatInput').value = ''; sendChat(t); });
$('#chatInput').addEventListener('keydown', e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); $('#chatForm').requestSubmit(); } });
$('#catchSpark').addEventListener('click', catchSpark);
$('#rollDie').addEventListener('click', () => { let c; do { c = pick(CONSTRAINTS); } while (c === S.constraint); S.constraint = c; $('#constraint').textContent = c; });
$('#lever').addEventListener('click', pullLever);
let thinkT; $('#thinkInput').addEventListener('input', () => { clearTimeout(thinkT); thinkT = setTimeout(draw2D, 180); });
$('#spinToggle').addEventListener('click', () => { if (!T) return; T.auto = !T.auto; $('#spinToggle').textContent = T.auto ? 'Pause spin' : 'Resume spin'; });
$('#blockConcept').addEventListener('change', e => { S.block.conceptId = e.target.value; buildBlock(); });
$('#blockLoad').addEventListener('change', e => { const b = find(e.target.value); if (b) { S.block = {id: b.id, shapes: clean(b.shapes || []), sel: -1, conceptId: b.conceptId || ''}; $('#blockName').value = b.name || ''; renderBlockSelects(); buildBlock(); } });
$('#blockSave').addEventListener('click', () => { const id = S.block.id || nid('b'); S.block.id = id; put({id, kind: 'blockout', created: (find(id) || {}).created || Date.now(), name: $('#blockName').value.trim() || 'Untitled blockout', conceptId: S.block.conceptId, shapes: clean(S.block.shapes)}); notice('Blockout saved.'); });
$('#blockNew').addEventListener('click', () => { S.block = {id: '', shapes: clean(STARTER), sel: -1, conceptId: ''}; $('#blockName').value = ''; renderBlockSelects(); buildBlock(); });
$('#readBtn').addEventListener('click', readFingerprint);

const thermoSec = $('[data-name="thermostat"]');
thermoSec.addEventListener('input', e => {
  const t = e.target;
  if (t.dataset.cfgcolor) { const k = t.dataset.cfgcolor; Room.set(c => { c.parts[k].color = t.value; c.preset = 'custom'; }, 'color', k); return; }
  if (t.id === 'cfgBright') { Room.set(c => { c.brightness = +t.value; }, 'light'); return; }
  if (t.id === 'cfgLamp') { Room.set(c => { c.lampColor = t.value; }, 'light'); return; }
  if (t.dataset.petname !== undefined) { Room.set(c => { c.pets[+t.dataset.petname].name = t.value.slice(0, 20) || 'Pet'; }, 'quiet'); }
});
thermoSec.addEventListener('change', e => {
  const t = e.target;
  if (t.dataset.cfgtype) { Room.set(c => { c.parts[t.dataset.cfgtype].type = t.value; c.preset = 'custom'; }, 'type'); return; }
  if (t.id === 'cfgWeather') Room.set(c => { c.weather = t.value; }, 'light');
  else if (t.id === 'cfgTime') Room.set(c => { c.time = t.value; }, 'light');
  else if (t.id === 'cfgMood') Room.set(c => { c.mood = t.value; }, 'light');
  else if (t.id === 'cfgWinCount') Room.set(c => { c.windows.count = +t.value; }, 'type');
  else if (t.id === 'cfgWinStyle') Room.set(c => { c.windows.style = t.value; }, 'type');
  else if (t.id === 'cfgSound') Room.set(c => { c.sound = t.checked; }, 'quiet');
  else if (t.dataset.peton !== undefined) { const i = +t.dataset.peton; if (t.checked && Room.cfg().pets.filter(p => p.on).length >= 3) { t.checked = false; notice('Three pets is the limit, or they start a union. Send one out first.'); return; } Room.set(c => { c.pets[i].on = t.checked; }, 'pets'); renderRoomCfg(); }
  else if (t.dataset.petcolor !== undefined) Room.set(c => { c.pets[+t.dataset.petcolor].color = t.value; }, 'petcolor');
});
thermoSec.addEventListener('click', e => {
  const pr = e.target.closest('[data-preset]'); if (pr) { const C = Room.cfg(); Room.replace(Object.assign(defaultRoomCfg(pr.dataset.preset), {pets: C.pets, windows: C.windows, sound: C.sound, weather: C.weather, brightness: C.brightness})); renderRoomCfg(); return; }
  if (e.target.closest('#cfgSurprise')) { randomRoom(); return; }
  if (e.target.closest('#cfgReset')) { Room.replace(Object.assign(defaultRoomCfg(), {pets: Room.cfg().pets})); renderRoomCfg(); }
});
/* ---------- diegetic thermostat: the dial on the wall is the control surface ---------- */
const ThermoUI = window.ThermoUI = (() => {
  const SW = ['#ff5b4f', '#ff9a2f', '#ffc83a', '#ffe14d', '#caffbf', '#1fae7a', '#2a9d8f', '#00e0ff', '#a2d2ff', '#2f5bea', '#7b5cff', '#cdb4db', '#ff3ea5', '#ff8fc8', '#fffdf7', '#efe6cf', '#c8955c', '#8c6b4a', '#5a3e2b', '#4a4460', '#1d2030'];
  const LAMPS = [['#ffc98a', 'Warm'], ['#ffe7b0', 'Soft gold'], ['#fff4e6', 'Daylight'], ['#ffd1dc', 'Rose'], ['#c8e1ff', 'Cool blue'], ['#b8ffd9', 'Mint'], ['#ff9a5c', 'Sunset'], ['#e0c3ff', 'Lilac']];
  const NAMES = ['Mochi', 'Kaya', 'Ollie', 'Tofu', 'Bolt', 'Pixel', 'Biscuit', 'Nori', 'Pepper', 'Kopi', 'Sago', 'Bao', 'Muffin', 'Zuzu', 'Sprocket', 'Chendol'];
  const WEATHER = [['auto', 'Singapore auto'], ['clear', 'Clear'], ['cloudy', 'Cloudy'], ['rain', 'Rain'], ['thunderstorm', 'Thunderstorm'], ['snow', 'Snow (pretend)']];
  const TIMES = [['auto', 'Match my clock'], ['dawn', 'Dawn'], ['day', 'Day'], ['dusk', 'Dusk'], ['night', 'Night']];
  const MOODS = [['cosy', 'Cosy lamp'], ['bright', 'Bright studio'], ['neon', 'Neon night'], ['moody', 'Moody']];
  const STYLES = [['square', 'Square panes'], ['arched', 'Arched'], ['round', 'Round porthole']];
  const ICON = {theme: 'assets/icons/artist_palette.webp', weather: 'assets/icons/sun_cloud.webp', light: 'assets/icons/light_bulb.webp', windows: 'assets/icons/window.webp', pets: 'assets/icons/paw_prints.webp', parts: 'assets/icons/couch_lamp.webp', sound: 'assets/icons/speaker.webp'};
  const U = {cat: 0, sub: 0, part: 0, pet: 0, hover: null, editing: false, gripping: false};
  const cyc = (list, cur, d) => { const i = Math.max(0, list.findIndex(v => (Array.isArray(v) ? v[0] : v) === cur)); const n = list[(i + d + list.length * 10) % list.length]; return Array.isArray(n) ? n[0] : n; };
  const lab = (list, cur) => (list.find(v => v[0] === cur) || [cur, cur])[1];
  const near = hex => { const c = new THREE.Color(hex); let bi = 0, bd = 9; SW.forEach((s, i) => { const d = new THREE.Color(s); const dd = Math.abs(d.r - c.r) + Math.abs(d.g - c.g) + Math.abs(d.b - c.b); if (dd < bd) { bd = dd; bi = i; } }); return bi; };
  const set = (fn, kind, key) => { Room.set(fn, kind, key); redraw(); };
  const say = t => notice(t);
  function cats() {
    const C = Room.cfg(); const pk = Object.keys(PRESETS); const P = C.pets[U.pet] || C.pets[0]; const part = PART_KEYS[U.part]; const pc = C.parts[part];
    return [
      {id: 'theme', title: 'Theme', subs: [
        {label: 'Room theme', value: C.preset === 'custom' ? 'Custom' : PRESETS[C.preset].label, dots: C.preset === 'custom' ? null : [0, 3, 7, 12].map(i => PRESETS[C.preset].c[i]), step: d => { const cur = C.preset === 'custom' ? pk[d > 0 ? pk.length - 1 : 0] : C.preset; Room.replace(Object.assign(defaultRoomCfg(cyc(pk, cur, d)), {pets: C.pets, windows: C.windows, sound: C.sound, weather: C.weather, brightness: C.brightness})); redraw(); }}]},
      {id: 'weather', title: 'Weather', subs: [
        {label: 'Outside', value: lab(WEATHER, C.weather), step: d => set(c => { c.weather = cyc(WEATHER, c.weather, d); }, 'light')},
        {label: 'Time of day', value: lab(TIMES, C.time), step: d => set(c => { c.time = cyc(TIMES, c.time, d); }, 'light')}]},
      {id: 'light', title: 'Light', subs: [
        {label: 'Mood', value: lab(MOODS, C.mood), step: d => set(c => { c.mood = cyc(MOODS, c.mood, d); }, 'light')},
        {label: 'Brightness', value: C.brightness + '%', bar: (C.brightness - 40) / 120, step: d => set(c => { c.brightness = Math.max(40, Math.min(160, c.brightness + d * 10)); }, 'light')},
        {label: 'Lamp colour', value: (LAMPS.find(l => l[0] === C.lampColor) || ['', 'Custom'])[1], swatch: C.lampColor, step: d => set(c => { c.lampColor = cyc(LAMPS, c.lampColor, d); }, 'light')}]},
      {id: 'windows', title: 'Windows', subs: [
        {label: 'How many', value: String(C.windows.count), step: d => set(c => { c.windows.count = Math.max(1, Math.min(4, c.windows.count + d)); }, 'type')},
        {label: 'Style', value: lab(STYLES, C.windows.style), step: d => set(c => { c.windows.style = cyc(STYLES, c.windows.style, d); }, 'type')}]},
      {id: 'pets', title: 'Pets', subs: [
        {label: 'Which pet', value: P.name, icon: P.kind, step: d => { U.pet = (U.pet + d + C.pets.length) % C.pets.length; redraw(); }},
        {label: P.name + ' in the room', value: P.on ? 'Yes' : 'No', toggle: P.on, step: () => { if (!P.on && C.pets.filter(p => p.on).length >= 3) { say('Three pets is the limit, or they start a union. Send one out first.'); return; } set(c => { c.pets[U.pet].on = !c.pets[U.pet].on; }, 'pets'); }},
        {label: 'Name', value: U.editing ? P.name + (Math.floor(performance.now() / 450) % 2 ? '|' : ' ') : P.name, name: true, step: d => set(c => { c.pets[U.pet].name = cyc(NAMES, c.pets[U.pet].name, d); }, 'quiet')},
        {label: P.name + "'s colour", swatch: P.color, strip: true, step: d => set(c => { c.pets[U.pet].color = SW[(near(c.pets[U.pet].color) + d + SW.length) % SW.length]; }, 'petcolor')}]},
      {id: 'parts', title: 'Room parts', subs: [
        {label: 'Part', value: PART_LABEL[part], step: d => { U.part = (U.part + d + PART_KEYS.length) % PART_KEYS.length; redraw(); }},
        PART_TYPES[part] ? {label: PART_LABEL[part] + ' style', value: cap(pc.type), step: d => set(c => { c.parts[part].type = cyc(PART_TYPES[part], c.parts[part].type, d); c.preset = 'custom'; }, 'type')} : {label: PART_LABEL[part] + ' style', value: 'Only one style', dim: true, step: () => {}},
        {label: PART_LABEL[part] + ' colour', swatch: pc.color, strip: true, step: d => set(c => { c.parts[part].color = SW[(near(c.parts[part].color) + d + SW.length) % SW.length]; c.preset = 'custom'; }, 'color', part)}]},
      {id: 'sound', title: 'Sound', subs: [
        {label: 'Room sounds', value: C.sound ? 'On' : 'Off', toggle: C.sound, step: () => set(c => { c.sound = !c.sound; }, 'quiet')}]}
    ];
  }
  // layout on the 512 px round screen: category buttons around the edge, the setting in the middle
  const BR = 186, BS = 42, CR = 128;
  const catPos = (i, n) => { const a = -Math.PI / 2 + i / n * Math.PI * 2; return {x: 256 + Math.cos(a) * BR, y: 256 + Math.sin(a) * BR}; };
  function zones() {
    const all = cats(), z = all.map((c, i) => Object.assign({id: 'cat', i, r: BS + 4}, catPos(i, all.length)));
    const s = all[U.cat].subs[U.sub]; if (s && s.name) z.push({id: 'type', x: 256, y: 332, r: 32});
    z.push({id: 'center', x: 256, y: 256, r: CR}); return z;
  }
  const IMGS = {}; const img = src => { if (!IMGS[src]) { const im = new Image(); im.onload = redraw; im.src = src; IMGS[src] = im; } const im = IMGS[src]; return im.complete && im.naturalWidth ? im : null; };
  function fit(x, t, max, size, weight) { let s = size; do { x.font = `${weight} ${s}px Figtree, sans-serif`; s -= 2; } while (x.measureText(t).width > max && s > 12); }
  function rr(x, a, b, w, h, r) { x.beginPath(); x.moveTo(a + r, b); x.arcTo(a + w, b, a + w, b + h, r); x.arcTo(a + w, b + h, a, b + h, r); x.arcTo(a, b + h, a, b, r); x.arcTo(a, b, a + w, b, r); x.closePath(); }
  function twistIcon(x, cx, cy, col) { x.save(); x.strokeStyle = x.fillStyle = col; x.lineWidth = 3; x.lineCap = 'round'; x.beginPath(); x.arc(cx, cy, 10, Math.PI * 0.15, Math.PI * 1.7); x.stroke(); const a = Math.PI * 1.7; x.beginPath(); x.moveTo(cx + Math.cos(a) * 10 + 5, cy + Math.sin(a) * 10 - 1); x.lineTo(cx + Math.cos(a) * 10 - 2, cy + Math.sin(a) * 10 - 6); x.lineTo(cx + Math.cos(a) * 10 - 1, cy + Math.sin(a) * 10 + 4); x.closePath(); x.fill(); x.restore(); }
  function paint(x, w, h) {
    const C = Room.cfg(); const all = cats(); U.cat = Math.min(U.cat, all.length - 1); const cat = all[U.cat]; U.sub = Math.min(U.sub, cat.subs.length - 1); const s = cat.subs[U.sub]; const hv = U.hover;
    const g = x.createRadialGradient(256, 256, 40, 256, 256, 256); g.addColorStop(0, '#2b3350'); g.addColorStop(1, '#121626'); x.fillStyle = g; x.fillRect(0, 0, w, h);
    // brightness arc around the very edge
    x.lineCap = 'round'; x.lineWidth = 8; x.strokeStyle = 'rgba(255,255,255,.07)'; x.beginPath(); x.arc(256, 256, 244, Math.PI * 0.75, Math.PI * 2.25); x.stroke();
    x.strokeStyle = C.mood === 'neon' ? '#ff3ea5' : '#ffc83a'; x.beginPath(); x.arc(256, 256, 244, Math.PI * 0.75, Math.PI * (0.75 + 1.5 * (C.brightness - 40) / 120)); x.stroke();
    // category buttons
    all.forEach((c, i) => { const p = catPos(i, all.length), on = i === U.cat, hov = hv && hv.id === 'cat' && hv.i === i;
      x.beginPath(); x.arc(p.x, p.y, BS, 0, 6.3); x.fillStyle = on ? '#ffc83a' : hov ? 'rgba(255,255,255,.42)' : 'rgba(255,255,255,.24)'; x.fill(); if (on) { x.lineWidth = 4; x.strokeStyle = '#fffdf7'; x.stroke(); }
      const im = img(ICON[c.id]); if (im) x.drawImage(im, p.x - 26, p.y - 26, 52, 52); });
    // the setting in the middle
    const hc = hv && hv.id === 'center'; x.beginPath(); x.arc(256, 256, CR, 0, 6.3); x.fillStyle = U.gripping ? 'rgba(255,200,58,.18)' : hc ? 'rgba(255,255,255,.1)' : 'rgba(255,255,255,.04)'; x.fill();
    x.lineWidth = 3; x.strokeStyle = U.gripping ? '#ffc83a' : 'rgba(255,255,255,.12)'; x.stroke();
    x.textAlign = 'center'; x.textBaseline = 'middle';
    x.fillStyle = '#9fd8ff'; fit(x, cat.title.toUpperCase(), 200, 18, 800); x.fillText(cat.title.toUpperCase(), 256, 168);
    x.fillStyle = 'rgba(255,253,247,.8)'; fit(x, s.label, 210, 21, 700); x.fillText(s.label, 256, 200);
    const vy = 250;
    if (s.strip) { const ci = near(s.swatch); for (let k = -2; k <= 2; k++) { x.fillStyle = SW[(ci + k + SW.length) % SW.length]; x.beginPath(); x.arc(256 + k * 42, vy, k ? 14 : 22, 0, 6.3); x.fill(); x.lineWidth = k ? 2 : 5; x.strokeStyle = k ? '#1d2030' : '#fffdf7'; x.stroke(); } }
    else if (s.toggle !== undefined) { rr(x, 256 - 46, vy - 20, 92, 40, 20); x.fillStyle = s.toggle ? '#1fae7a' : 'rgba(255,255,255,.2)'; x.fill(); x.fillStyle = '#fffdf7'; x.beginPath(); x.arc(s.toggle ? 256 + 26 : 256 - 26, vy, 15, 0, 6.3); x.fill(); }
    else {
      let vx = 256, room = 220; const im = s.icon ? img(PET_KINDS[s.icon].icon) : null; if (s.swatch || im) { vx += 22; room -= 46; }
      x.fillStyle = s.dim ? 'rgba(255,255,255,.45)' : '#fffdf7'; fit(x, s.value, room, 34, 800); const tw = x.measureText(s.value).width; x.fillText(s.value, vx, vy);
      if (s.swatch) { x.fillStyle = s.swatch; x.beginPath(); x.arc(vx - tw / 2 - 24, vy, 15, 0, 6.3); x.fill(); x.lineWidth = 3; x.strokeStyle = '#fffdf7'; x.stroke(); }
      if (im) x.drawImage(im, vx - tw / 2 - 46, vy - 20, 40, 40);
      if (s.dots) s.dots.forEach((c, k) => { x.fillStyle = c; x.beginPath(); x.arc(256 + (k - 1.5) * 22, vy + 32, 8, 0, 6.3); x.fill(); x.lineWidth = 2; x.strokeStyle = '#1d2030'; x.stroke(); });
      if (s.bar !== undefined) { rr(x, 166, vy + 26, 180, 10, 5); x.fillStyle = 'rgba(255,255,255,.15)'; x.fill(); rr(x, 166, vy + 26, Math.max(10, 180 * s.bar), 10, 5); x.fillStyle = '#ffc83a'; x.fill(); }
    }
    if (s.name) { const ht = hv && hv.id === 'type'; x.beginPath(); x.arc(256, 332, 30, 0, 6.3); x.fillStyle = ht || U.editing ? '#ffc83a' : 'rgba(255,255,255,.16)'; x.fill(); x.save(); x.translate(256, 332); x.rotate(-Math.PI / 4); x.strokeStyle = x.fillStyle = ht || U.editing ? '#1d2030' : '#fffdf7'; x.lineWidth = 3; x.strokeRect(-11, -4, 17, 8); x.beginPath(); x.moveTo(6, -4); x.lineTo(12, 0); x.lineTo(6, 4); x.closePath(); x.fill(); x.restore(); }
    else {
      if (cat.subs.length > 1) cat.subs.forEach((_, k) => { x.fillStyle = k === U.sub ? '#ffc83a' : 'rgba(255,255,255,.3)'; x.beginPath(); x.arc(256 + (k - (cat.subs.length - 1) / 2) * 16, 300, k === U.sub ? 5.5 : 4, 0, 6.3); x.fill(); });
      x.fillStyle = 'rgba(255,255,255,.62)'; x.font = '600 16px Figtree, sans-serif'; const hint = cat.subs.length > 1 ? 'Twist to adjust · tap for next' : 'Twist to adjust'; x.fillText(hint, 256 + 12, 330); twistIcon(x, 256 - x.measureText(hint).width / 2 - 8, 330, 'rgba(255,255,255,.62)');
    }
    if (U.editing) { x.fillStyle = 'rgba(255,255,255,.7)'; x.font = '600 15px Figtree, sans-serif'; x.fillText('Type a name, Enter to finish', 256, 368); }
  }
  function redraw() { Room.thermoRedraw(); }
  function zoneAt(px, py, hand) {
    const z = zones(); const inside = z.find(r => Math.hypot(px - r.x, py - r.y) <= r.r); if (inside || !hand) return inside || null;
    let best = null, bd = 34; z.forEach(r => { const d = Math.hypot(px - r.x, py - r.y) - r.r; if (d < bd) { bd = d; best = r; } }); return best;
  }
  function pickCat(i) { if (U.cat === i) return; stopEdit(); U.cat = i; U.sub = 0; redraw(); }
  function tap(px, py, hand) {
    const z = zoneAt(px, py, hand); if (!z) return;
    if (z.id === 'cat') { pickCat(z.i); return; }
    if (z.id === 'type') { editName(); return; }
    const cat = cats()[U.cat]; stopEdit(); if (cat.subs.length > 1) { U.sub = (U.sub + 1) % cat.subs.length; redraw(); } else turn(1);
  }
  function turn(d) { const s = cats()[U.cat].subs[U.sub]; if (s) s.step(d); }
  function grip(on) { if (U.gripping === on) return; U.gripping = on; redraw(); }
  function button(id) { if (id === 'back') { stopEdit(); location.hash = 'room'; } else if (id === 'dice') { randomRoom(); redraw(); say('Fresh room, rolled at random.'); } else if (id === 'list') openList(); }
  function hover(h, hand) { const z = h && h.part === 'screen' ? zoneAt(h.x, h.y, hand) : null; const key = z ? z.id + (z.i ?? '') : null; if ((U.hover && U.hover.key) === key) return; U.hover = z ? Object.assign({key}, z) : null; redraw(); }
  // names are typed into a real (hidden) text field and shown on the dial
  let blink = 0;
  function editName() { const inp = $('#thermoName'); U.editing = true; inp.value = Room.cfg().pets[U.pet].name; inp.focus({preventScroll: true}); inp.select(); clearInterval(blink); blink = setInterval(redraw, 450); redraw(); }
  function stopEdit() { if (!U.editing) return; U.editing = false; clearInterval(blink); const inp = $('#thermoName'); if (document.activeElement === inp) inp.blur(); redraw(); }
  function openList() { stopEdit(); S.thermoList = true; route(); }
  function key(e) {
    const all = cats(), cat = all[U.cat];
    if (e.key === 'ArrowLeft') { Room.thermoTwist(-1); } else if (e.key === 'ArrowRight') { Room.thermoTwist(1); }
    else if (e.key === 'ArrowUp') { U.sub = (U.sub - 1 + cat.subs.length) % cat.subs.length; redraw(); } else if (e.key === 'ArrowDown') { U.sub = (U.sub + 1) % cat.subs.length; redraw(); }
    else if (e.key === 'PageUp' || e.key === '[') pickCat((U.cat - 1 + all.length) % all.length); else if (e.key === 'PageDown' || e.key === ']') pickCat((U.cat + 1) % all.length);
    else if (/^[1-7]$/.test(e.key)) pickCat(+e.key - 1);
    else if (e.key === 'Enter' && cat.subs[U.sub].name) editName();
    else return false; return true;
  }
  return {paint, tap, turn, grip, button, hover, key, zoneAt, stopEdit, editing: () => U.editing, setName: v => { Room.set(c => { c.pets[U.pet].name = v.slice(0, 20) || 'Pet'; }, 'quiet'); redraw(); }};
})();
const thermoName = $('#thermoName');
thermoName.addEventListener('input', () => ThermoUI.setName(thermoName.value));
thermoName.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); ThermoUI.stopEdit(); } });
thermoName.addEventListener('blur', () => ThermoUI.stopEdit());
document.addEventListener('keydown', e => {
  if (S.station !== 'thermostat' || S.thermoList || ThermoUI.editing()) return; const t = e.target; if (t && t.matches && t.matches('input, textarea, select, button, a')) return;
  if (ThermoUI.key(e)) e.preventDefault();
});
$('#thermoBar').addEventListener('click', e => { const b = e.target.closest('[data-tb]'); if (b) ThermoUI.button(b.dataset.tb); });
$('#cfgDial').addEventListener('click', () => { S.thermoList = false; route(); });
Room.thermoRedraw();
$('#backRoom').addEventListener('click', () => { location.hash = 'room'; });
document.addEventListener('keydown', e => { if (e.key !== 'Escape') return; if (Room.isPetting()) { Room.stopPetting(); return; } if (!$('#panel').hidden || S.station === 'thermostat') location.hash = 'room'; });
$('#skipDaily').addEventListener('click', () => { S.dailyOffset++; $('#dailyText').textContent = dailyPrompt(); });
$('#timerStart').addEventListener('click', timerToggle);
$('#timerReset').addEventListener('click', timerReset);
$('#spinBtn').addEventListener('click', spinWheel);
$('#worseBtn').addEventListener('click', makeWorse);
$('#corpseMode').addEventListener('change', e => { S.corpse.mode = e.target.value; renderCorpse(); });
$('#corpseBox').addEventListener('click', e => {
  const c = S.corpse;
  if (e.target.closest('#corpseFold')) { const t = $('#corpseIn').value.trim(); if (!t) return notice('Write a sentence or two first.'); c.parts.push({by: 'me', text: t}); renderCorpse(); if (c.parts.length === 1) corpseClaude(); return; }
  if (e.target.closest('#corpseOpen')) { c.open = true; renderCorpse(); return; }
  if (e.target.closest('#corpseReset')) { S.corpse = {mode: c.mode, parts: [], open: false, busy: false}; renderCorpse(); return; }
  const full = c.parts.map(p => p.text).join(' ');
  if (e.target.closest('#corpseSpark')) { put({id: nid('s'), kind: 'spark', created: Date.now(), text: clip(full, 200), themes: localThemes(full, 3), source: 'corpse'}); notice('Kept as a spark in the Idea Machine tray.'); return; }
  if (e.target.closest('#corpseSave')) { S.log = {type: 'corpse', prompt: 'Exquisite corpse: ' + (c.mode === 'story' ? 'a tiny story' : 'a ' + c.mode), medium: 'Writing', parts: c.parts.map(p => ({by: p.by, text: p.text}))}; $('#logMade').value = full; $('#logTitle').textContent = 'Log the corpse'; $('#logPrompt').textContent = S.log.prompt; $('#logForm').hidden = false; $('#logForm').scrollIntoView({behavior: reduceMotion ? 'auto' : 'smooth', block: 'center'}); }
});
document.addEventListener('click', e => {
  const lg = e.target.closest('[data-log]'); if (lg) { if (lg.dataset.log === 'challenge') openLog('challenge', dailyPrompt(), ''); else openLog('roulette', `${S.wheel.result}: ${S.wheel.prompt}`, S.wheel.result); return; }
  const wv = e.target.closest('[data-worse]'); if (wv && S.worse) { const v = S.worse.vs[+wv.dataset.worse]; const src = find(S.worse.src); openLog('worse', `${v.title} (${label(src)}): ${v.how}`, ''); }
});
$('#logPhoto').addEventListener('change', async e => { const f = e.target.files[0]; if (!f) return; try { S.logPhoto = await fileToDataURL(f, 900); $('#logPhotoName').textContent = 'Photo ready'; } catch (er) { notice('That photo could not be read.'); } });
$('#logSave').addEventListener('click', saveLog);
$('#logCancel').addEventListener('click', () => { $('#logForm').hidden = true; S.log = null; });
$('#addPieceBtn').addEventListener('click', () => openPieceForm(null));
$('#pcPhoto').addEventListener('change', async e => { const f = e.target.files[0]; if (!f) return; try { S.piecePhoto = await fileToDataURL(f, 1000); $('#pcPhotoName').textContent = 'Photo ready'; } catch (er) { notice('That photo could not be read.'); } });
$('#pcSave').addEventListener('click', savePiece);
$('#pcCancel').addEventListener('click', () => { $('#pieceForm').hidden = true; });
$('#turnCompost').addEventListener('click', turnCompost);
$('#critBtn').addEventListener('click', runCrit);
fillSelect('#pcMedium', MEDIA.slice(1));

addEventListener('hashchange', route);
let rzT; new ResizeObserver(() => { clearTimeout(rzT); rzT = setTimeout(() => { if (S.station === 'wall' && S.wallMode === 'map2d') draw2D(); if (S.station === 'mirror') drawMirror(); if (S.station === 'playground') drawWheel(); }, 150); }).observe(document.querySelector('main'));


function setHideEx(v) { S.hideEx = v; try { localStorage.setItem('makers-hide-examples', v ? '1' : '0'); } catch (e) {} renderAll(); notice(v ? 'Examples hidden. Bring them back from the bottom of any station.' : 'Examples are back.'); const b = $('#exToggle'); if (b) b.textContent = v ? 'Show examples' : 'Hide examples'; }
/* ---------- export / import ---------- */
async function exportStudio() {
  const items = store.items.filter(x => !x.example);
  const data = JSON.stringify({app: 'makers-studio', format: 1, exported: new Date().toISOString(), from: document.title, items});
  const fn = 'makers-studio-' + new Date().toISOString().slice(0, 10) + '.json';
  try { const dl = window.claude && typeof window.claude.use === 'function' ? await window.claude.use('downloads') : null; if (dl) { await dl.save({filename: fn, data}); notice(`Exported ${items.length} item${items.length === 1 ? '' : 's'}.`); return; } }
  catch (e) { if (e && e.code === 'declined') return notice('Export cancelled.'); }
  try { await navigator.clipboard.writeText(data); notice('Your studio was copied as text. Paste it into a file named ' + fn + '.'); } catch (e) { notice('The export did not go through. Try again.'); }
}
async function importStudio(file) {
  let j; try { j = JSON.parse(await file.text()); } catch (e) { return notice('That file is not a studio export.'); }
  const items = (j && Array.isArray(j.items) ? j.items : []).filter(x => x && typeof x.id === 'string' && typeof x.kind === 'string');
  let n = 0;
  for (const it of items) {
    const cur = store.items.find(x => x.id === it.id); if (cur && (cur.updated || 0) >= (it.updated || 0)) continue;
    if (store.col) { try { await store.col.doc(it.id).set(clean(it)); } catch (e) { dbErr(e); break; } } else { const i = store.items.findIndex(x => x.id === it.id); if (i >= 0) store.items[i] = it; else store.items.push(it); }
    n++;
  }
  if (!store.col) { saveLocal(); renderAll(); }
  notice(n ? `Imported ${n} item${n === 1 ? '' : 's'}.` : 'Everything in that file is already here.');
}
$('#exportBtn').addEventListener('click', exportStudio);
$('#exToggle').addEventListener('click', () => setHideEx(!S.hideEx));
$('#exToggle').textContent = S.hideEx ? 'Show examples' : 'Hide examples';
$('#importFile').addEventListener('change', e => { const f = e.target.files[0]; if (f) importStudio(f); e.target.value = ''; });
if (window.STUDIO_HOSTED) $('#importLbl').hidden = false;


/* floating messages fade after a few seconds */
(() => { const m = $('#hudMsgs'); let t; const wake = () => { m.classList.remove('fade'); clearTimeout(t); t = setTimeout(() => m.classList.add('fade'), 6000); }; new MutationObserver(wake).observe(m, {subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ['hidden']}); m.addEventListener('pointerenter', wake); wake(); })();
/* minimal dock: icons only, label slides out on hover or hand-cursor hover, collapsible */
(() => {
  const btn = $('#dockToggle');
  const set = min => { document.body.classList.toggle('dock-min', min); btn.setAttribute('aria-expanded', String(!min)); btn.setAttribute('aria-label', min ? 'Show the station bar' : 'Hide the station bar'); try { localStorage.setItem('studio-dock-min', min ? '1' : '0'); } catch (e) {} };
  let min = false; try { min = localStorage.getItem('studio-dock-min') === '1'; } catch (e) {}
  set(min); btn.addEventListener('click', () => set(!document.body.classList.contains('dock-min')));
  let peek = null;
  document.addEventListener('pointermove', e => { const a = e.target && e.target.closest ? e.target.closest('.room-bottom .stations a') : null; if (a === peek) return; if (peek) peek.classList.remove('peek'); peek = a; if (a) a.classList.add('peek'); });
})();
window.StudioHooks = {_petDebug: () => Room.petDebug(), thermoDial: () => Room.thermoDial(), thermoTwist: d => Room.thermoTwist(d), thermoGrip: on => Room.thermoGrip(on), isThermo: () => Room.isThermo(), thermoOver: (x, y) => Room.thermoOver(x, y), thermoScreen: (a, b, c) => Room.thermoScreen(a, b, c), petsInfo: () => Room.petsInfo(), _petPlace: (i, x, z) => Room.petPlace(i, x, z), look: (dx, dy) => Room.look(dx, dy), zoom: f => Room.zoom(f), isPetting: () => Room.isPetting(), rubInput: (x, h) => Room.rubInput(x, h), stopPetting: () => Room.stopPetting(), stand: on => Room.stand(on), playDead: () => Room.playDead(), overPet: (x, y) => Room.overPet(x, y), trick: () => Room.trick(), petScreen: i => Room.petScreen(i || 0), notice, stations: STATIONS};
/* ---------- boot ---------- */
async function migrate() {
  const local = S.localItems.filter(x => !store.items.find(y => y.id === x.id));
  for (const it of local) { try { await store.col.doc(it.id).set(clean(it)); } catch (e) { dbErr(e); return; } }
  if (local.length) notice(`Moved ${local.length} item${local.length > 1 ? 's' : ''} from this browser into your studio.`);
  try { localStorage.removeItem(LK); } catch (e) {}
}
async function connect() {
  setSave('local');
  if (!(window.claude && typeof window.claude.use === 'function')) { setAI(); return; }
  setSave('connecting');
  claude.use('sample').then(s => { S.sample = s || null; setAI(); renderPins(); if (s && s.limits) s.limits().then(l => { S.imgOK = !!(l && l.images); }).catch(() => {}); }).catch(() => setAI());
  const timer = setTimeout(() => { if (store.mode !== 'cloud' && !window.STUDIO_HOSTED) { setSave('local'); notice('Your studio storage is slow to answer, so changes are saving in this browser for now.'); } }, 10000);
  try {
    const [db, user] = await Promise.all([claude.use('db'), claude.use('user')]);
    if (!db || !user) { clearTimeout(timer); setSave('local'); return; }
    const id = await user.id();
    if (!id) { clearTimeout(timer); setSave('local'); return; }
    store.col = db.collection('data/users/' + id);
    store.col.limit(1000).onSnapshot(snap => {
      const items = snap.docs.map(d => ({...d.data(), id: d.id}));
      store.items = items; store.mode = 'cloud';
      if (!snap.metadata.fromCache) { clearTimeout(timer); setSave('cloud'); if (!store.migrated) { store.migrated = true; migrate(); } } else setSave('cache');
      renderAll();
    }, () => { clearTimeout(timer); store.col = null; store.mode = 'local'; loadLocal(); setSave('local'); renderAll(); notice('Your studio storage could not be reached, so this visit saves in this browser.'); });
  } catch (e) { clearTimeout(timer); setSave('local'); }
}
fillSelect('#dMedium', MEDIA); fillSelect('#dAudience', AUDIENCES);
$('#constraint').textContent = S.constraint;
if (!Room.init()) { $('#roomFallback').hidden = false; }
renderRoomCfg();
renderPersonas(); loadLocal(); renderOut(); renderAll(); route(); renderChat(); setAI();
connect();
})();
