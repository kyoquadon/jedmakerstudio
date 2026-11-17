// Your studio's saved items (journal entries, pins, concepts, room settings...) in Cloudflare D1.
// GET  /api/items                      -> {items: [...]}
// POST /api/items {items: [], deletes: []} -> upserts and deletes in one batch
const json = (o, status = 200) => new Response(JSON.stringify(o), {status, headers: {'content-type': 'application/json'}});

export async function onRequestGet({env, data}) {
  if (!env.DB) return json({error: 'No D1 database is bound as DB yet.'}, 503);
  const {results} = await env.DB.prepare('SELECT body FROM items WHERE owner = ?').bind(data.owner).all();
  return json({items: results.map(r => { try { return JSON.parse(r.body); } catch (e) { return null; } }).filter(Boolean)});
}

export async function onRequestPost({request, env, data}) {
  if (!env.DB) return json({error: 'No D1 database is bound as DB yet.'}, 503);
  let body; try { body = await request.json(); } catch (e) { return json({error: 'Bad JSON'}, 400); }
  const items = Array.isArray(body.items) ? body.items : [], deletes = Array.isArray(body.deletes) ? body.deletes : [];
  if (items.length + deletes.length > 500) return json({error: 'Too many changes in one go.'}, 413);
  const stmts = [];
  for (const it of items) {
    if (!it || typeof it.id !== 'string' || it.id.length > 200 || typeof it.kind !== 'string') continue;
    const s = JSON.stringify(it); if (s.length > 1800000) continue;
    stmts.push(env.DB.prepare('INSERT INTO items (owner, id, kind, body, updated) VALUES (?, ?, ?, ?, ?) ON CONFLICT(owner, id) DO UPDATE SET kind = excluded.kind, body = excluded.body, updated = excluded.updated')
      .bind(data.owner, it.id, it.kind, s, Number(it.updated) || Date.now()));
  }
  for (const id of deletes) if (typeof id === 'string') stmts.push(env.DB.prepare('DELETE FROM items WHERE owner = ? AND id = ?').bind(data.owner, id));
  if (stmts.length) await env.DB.batch(stmts);
  return json({ok: true, saved: stmts.length});
}
