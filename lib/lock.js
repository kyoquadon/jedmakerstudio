// Helpers for the passcode lock. The cookie holds an HMAC of the passcode, never the passcode itself.
export async function expectedToken(passcode) {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(passcode), {name: 'HMAC', hash: 'SHA-256'}, false, ['sign']);
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode('makers-studio-unlock-v1'));
  return [...new Uint8Array(sig)].map(b => b.toString(16).padStart(2, '0')).join('');
}
export function readCookie(request, name) {
  const c = request.headers.get('cookie') || '';
  const m = c.split(/;\s*/).find(p => p.startsWith(name + '='));
  return m ? decodeURIComponent(m.slice(name.length + 1)) : '';
}
export function safeEqual(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string' || a.length !== b.length) return false;
  let d = 0; for (let i = 0; i < a.length; i++) d |= a.charCodeAt(i) ^ b.charCodeAt(i); return d === 0;
}
