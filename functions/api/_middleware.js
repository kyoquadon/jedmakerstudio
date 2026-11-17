// Runs before every /api/* request. A request gets through when any one of these is true:
//  - Cloudflare Access signed the visitor in (optional; needs Zero Trust),
//  - the browser holds the unlock cookie from /api/unlock (STUDIO_PASSCODE),
//  - you are testing locally with ALLOW_LOCAL=1 in .dev.vars.
import {expectedToken, readCookie, safeEqual} from '../../lib/lock.js';

export async function onRequest(context) {
  const {request, env, data} = context;
  const url = new URL(request.url);
  data.owner = 'owner'; // single-person studio: every way in sees the same data
  if (url.pathname === '/api/unlock') return context.next();
  if (env.ALLOW_LOCAL === '1') return context.next();
  const email = request.headers.get('cf-access-authenticated-user-email');
  if (email) {
    if (env.ALLOWED_EMAIL && email.toLowerCase() !== env.ALLOWED_EMAIL.toLowerCase()) return json({error: 'This studio belongs to someone else.'}, 403);
    return context.next();
  }
  if (env.STUDIO_PASSCODE) {
    const tok = readCookie(request, 'studio_key');
    if (tok && safeEqual(tok, await expectedToken(env.STUDIO_PASSCODE))) return context.next();
    return json({error: 'locked', passcode: true}, 401);
  }
  return json({error: 'No lock is set up. Add STUDIO_PASSCODE in the project settings.'}, 401);
}
const json = (o, status) => new Response(JSON.stringify(o), {status, headers: {'content-type': 'application/json'}});
