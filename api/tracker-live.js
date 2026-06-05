export const config = { runtime: 'edge' };

export default async function handler() {
  try {
    const resp = await fetch('https://httpbin.org/get');
    const data = await resp.json();
    return new Response(JSON.stringify({ ok: true, status: resp.status, url: data.url }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err), type: err?.constructor?.name }), {
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
