export default async function handler(req, res) {
  try {
    const upstream = await fetch('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.112.4/dist/umd/supabase.js', {
      headers: { 'user-agent': 'SELLB2-Vercel-Proxy/1.0' },
    });
    if (!upstream.ok) throw new Error(`Supabase SDK upstream returned ${upstream.status}`);
    const body = await upstream.text();
    res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800');
    res.status(200).send(body);
  } catch (err) {
    res.status(502).json({ error: 'Unable to load Supabase browser SDK', detail: String(err?.message || err) });
  }
}
