// Runs before every /api/* request. Only lets requests through when Cloudflare Access
// has signed the visitor in (or when running locally with ALLOW_LOCAL=1 in .dev.vars).
export async function onRequest(context) {
  const {request, env, data} = context;
  const email = request.headers.get('cf-access-authenticated-user-email');
  const local = env.ALLOW_LOCAL === '1';
  if (!email && !local) return json({error: 'Sign in through Cloudflare Access first.'}, 401);
  if (email && env.ALLOWED_EMAIL && email.toLowerCase() !== env.ALLOWED_EMAIL.toLowerCase()) return json({error: 'This studio belongs to someone else.'}, 403);
  data.owner = (email || 'local').toLowerCase();
  return context.next();
}
const json = (o, status) => new Response(JSON.stringify(o), {status, headers: {'content-type': 'application/json'}});
