// D&K Party Planner: account helper (Supabase Edge Function, Deno).
// Lets people sign in or reset their password with their USERNAME without ever exposing anyone's email address.
// The browser sends a username; only this server-side code (with the service role key) can look up the email.
//   action "login"   { username, password }                -> { access_token, refresh_token }
//   action "recover" { username }                           -> { ok: true }   (emails a 6-digit code; same answer whether or not the user exists)
//   action "reset"   { username, token, password }          -> { access_token, refresh_token }
import { createClient } from 'npm:@supabase/supabase-js@2'

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Type': 'application/json',
}
const reply = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: cors })

const URL_ = Deno.env.get('SUPABASE_URL')!
const admin = createClient(URL_, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, { auth: { persistSession: false } })
const anon = () => createClient(URL_, Deno.env.get('SUPABASE_ANON_KEY')!, { auth: { persistSession: false } })

// Best-effort brute-force brake: 8 attempts per username per 10 minutes (per function instance).
const tries = new Map<string, { n: number; t: number }>()
function limited(key: string): boolean {
  const now = Date.now(), e = tries.get(key)
  if (!e || now - e.t > 600_000) { tries.set(key, { n: 1, t: now }); return false }
  e.n++; return e.n > 8
}

async function emailFor(username: string): Promise<{ id: string; email: string } | null> {
  const { data: prof } = await admin.from('pp_profiles').select('id').eq('username', username).maybeSingle()
  if (!prof) return null
  const { data } = await admin.auth.admin.getUserById(prof.id)
  const email = data?.user?.email
  return email ? { id: prof.id, email } : null
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })
  if (req.method !== 'POST') return reply({ error: 'Not allowed' }, 405)
  let b: any
  try { b = await req.json() } catch { return reply({ error: 'Bad request' }, 400) }
  const username = String(b.username ?? '').toLowerCase()
  if (!/^[a-z0-9_]{3,20}$/.test(username)) return reply({ error: 'Wrong username or password' }, 401)
  if (limited(username + ':' + b.action)) return reply({ error: 'Too many attempts. Please wait a few minutes.' }, 429)

  const u = await emailFor(username)

  if (b.action === 'login') {
    if (!u || typeof b.password !== 'string') return reply({ error: 'Wrong username or password' }, 401)
    const { data, error } = await anon().auth.signInWithPassword({ email: u.email, password: b.password })
    if (error || !data.session) return reply({ error: 'Wrong username or password' }, 401)
    return reply({ access_token: data.session.access_token, refresh_token: data.session.refresh_token })
  }

  if (b.action === 'recover') {
    if (u) await anon().auth.resetPasswordForEmail(u.email)   // ignore errors: never reveal whether the user exists
    return reply({ ok: true })
  }

  if (b.action === 'reset') {
    if (!u || typeof b.password !== 'string' || b.password.length < 8 || !/^\d{6}$/.test(String(b.token))) return reply({ error: 'Invalid or expired code' }, 400)
    const c = anon()
    const { error } = await c.auth.verifyOtp({ email: u.email, token: String(b.token), type: 'recovery' })
    if (error) return reply({ error: 'Invalid or expired code' }, 400)
    const { error: e2 } = await admin.auth.admin.updateUserById(u.id, { password: b.password })
    if (e2) return reply({ error: 'Could not set the new password' }, 400)
    const { data, error: e3 } = await anon().auth.signInWithPassword({ email: u.email, password: b.password })
    if (e3 || !data.session) return reply({ error: 'Password changed. Please sign in.' }, 400)
    return reply({ access_token: data.session.access_token, refresh_token: data.session.refresh_token })
  }
  return reply({ error: 'Unknown action' }, 400)
})
