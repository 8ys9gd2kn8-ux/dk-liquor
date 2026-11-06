/* D&K Beverages service worker: push notifications only.
 * It does NOT cache anything, so shop updates are never stale.
 * Alerts carry no message text (messages are end-to-end encrypted): only who/which chat. */
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));

self.addEventListener('push', e => {
  let d = {};
  try { d = e.data ? e.data.json() : {}; } catch (_) {}
  e.waitUntil((async () => {
    const wins = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    if (wins.some(c => c.visibilityState === 'visible' && c.focused)) return;   // app is open: it shows its own banner
    await self.registration.showNotification(String(d.title || 'D&K Beverages').slice(0, 80), {
      body: String(d.body || 'New message').slice(0, 140),
      tag: d.cid || 'dk-chat',
      renotify: true,
      icon: 'dk-icon-192.png',
      badge: 'dk-icon-192.png',
      data: { cid: d.cid || null },
    });
  })());
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  const cid = e.notification.data && e.notification.data.cid;
  e.waitUntil((async () => {
    const wins = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    if (wins.length) { const c = wins[0]; await c.focus(); c.postMessage({ type: 'pp-open', cid }); return; }
    await self.clients.openWindow('./' + (cid ? '#chat=' + cid : ''));
  })());
});
