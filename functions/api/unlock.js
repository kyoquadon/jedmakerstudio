// POST /api/unlock {passcode} -> sets an HttpOnly cookie that unlocks /api/* for a year.
import {expectedToken, safeEqual} from '../../lib/lock.js';
export async function onRequestPost({request, env}) {
  if (!env.STUDIO_PASSCODE) return json({error: 'No passcode is set for this studio.'}, 503);
  let body = {}; try { body = await request.json(); } catch (e) {}
  const given = typeof body.passcode === 'string' ? body.passcode : '';
  await new Promise(r => setTimeout(r, 400)); // slows down guessing
  if (!safeEqual(await expectedToken(given), await expectedToken(env.STUDIO_PASSCODE))) return json({error: 'That passcode does not match.'}, 401);
  const tok = await expectedToken(env.STUDIO_PASSCODE);
  return new Response(JSON.stringify({ok: true}), {headers: {'content-type': 'application/json', 'set-cookie': `studio_key=${tok}; Path=/api; Max-Age=31536000; HttpOnly; Secure; SameSite=Strict`}});
}
const json = (o, status) => new Response(JSON.stringify(o), {status, headers: {'content-type': 'application/json'}});
