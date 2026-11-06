// D&K Party Planner: sends a "new message" push alert to the other members of a chat.
// Triggered by a Database Webhook on INSERT into public.pp_messages (see README-PLANNER.md).
// The alert never contains message text: messages are end-to-end encrypted, so the server cannot read them.
import { createClient } from 'npm:@supabase/supabase-js@2'
import webpush from 'npm:web-push@3.6.7'

const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, { auth: { persistSession: false } })
webpush.setVapidDetails(Deno.env.get('VAPID_SUBJECT')!, Deno.env.get('VAPID_PUBLIC_KEY')!, Deno.env.get('VAPID_PRIVATE_KEY')!)

Deno.serve(async (req) => {
  let p: any
  try { p = await req.json() } catch { return new Response('bad request', { status: 400 }) }
  const m = p?.record
  if (p?.type !== 'INSERT' || !m || m.kind === 'sys') return new Response('skipped')

  const { data: conv } = await admin.from('pp_conversations').select('id,type,name').eq('id', m.conversation_id).maybeSingle()
  const { data: sender } = await admin.from('pp_profiles').select('name').eq('id', m.sender_id).maybeSingle()
  const { data: members } = await admin.from('pp_members').select('user_id').eq('conversation_id', m.conversation_id).eq('muted', false).neq('user_id', m.sender_id)
  const ids = (members ?? []).map((x: any) => x.user_id)
  if (!conv || !ids.length) return new Response('no recipients')

  const { data: subs } = await admin.from('pp_push_subs').select('id,endpoint,p256dh,auth').in('user_id', ids)
  const full = String(sender?.name ?? 'Someone'), first = full.split(' ')[0]
  const what = m.kind === 'prod' || m.kind === 'share' ? 'shared a product' : m.kind === 'poll' ? 'made a proposal' : 'sent a message'
  const dm = conv.type === 'dm'
  const payload = JSON.stringify({
    cid: conv.id,
    title: dm ? full : (conv.name ?? 'D&K Beverages'),
    body: dm ? (m.kind === 'text' ? 'New message' : 'Shared a product') : `${first} ${what}`,
  })

  await Promise.all((subs ?? []).map(async (s: any) => {
    try {
      await webpush.sendNotification({ endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } }, payload, { TTL: 3600, urgency: 'normal' })
    } catch (e: any) {
      if (e?.statusCode === 404 || e?.statusCode === 410) await admin.from('pp_push_subs').delete().eq('id', s.id)   // device unsubscribed
    }
  }))
  return new Response('ok')
})
