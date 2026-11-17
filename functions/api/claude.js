// Passes the studio's requests on to Claude. The API key stays here on the server.
// POST /api/claude {messages, tier: 'quick'|'default'|'complex', stream, system?}
const json = (o, status = 200) => new Response(JSON.stringify(o), {status, headers: {'content-type': 'application/json'}});

export async function onRequestPost({request, env}) {
  if (!env.ANTHROPIC_API_KEY) return json({error: 'ANTHROPIC_API_KEY is not set for this project.'}, 503);
  const raw = await request.text();
  if (raw.length > 8_000_000) return json({error: 'Request too large'}, 413);
  let body; try { body = JSON.parse(raw); } catch (e) { return json({error: 'Bad JSON'}, 400); }
  if (!Array.isArray(body.messages) || !body.messages.length) return json({error: 'messages required'}, 400);
  const models = {quick: env.MODEL_QUICK || 'claude-haiku-5-5', default: env.MODEL_DEFAULT || 'claude-sonnet-5-5', complex: env.MODEL_COMPLEX || 'claude-opus-5-5'};
  const tier = models[body.tier] ? body.tier : 'default';
  const payload = {model: models[tier], max_tokens: tier === 'complex' ? 2500 : 1500, messages: body.messages.slice(-40), stream: !!body.stream};
  if (typeof body.system === 'string' && body.system) payload.system = body.system.slice(0, 20000);
  const r = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {'x-api-key': env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01', 'content-type': 'application/json'},
    body: JSON.stringify(payload)
  });
  if (r.status === 401) return json({error: 'Anthropic rejected the API key. Check ANTHROPIC_API_KEY in the project settings.'}, 502);
  if (payload.stream && r.ok) return new Response(r.body, {headers: {'content-type': 'text/event-stream', 'cache-control': 'no-cache'}});
  return new Response(await r.text(), {status: r.status, headers: {'content-type': 'application/json'}});
}
