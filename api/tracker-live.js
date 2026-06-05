export const config = { runtime: 'edge' };

export default async function handler() {
  const username = process.env.OPENSKY_USERNAME;
  const password = process.env.OPENSKY_PASSWORD;

  try {
    const resp = await fetch('https://opensky-network.org/api/states/all', {
      headers: {
        Authorization: 'Basic ' + btoa(`${username}:${password}`),
      },
      signal: AbortSignal.timeout(20000),
    });

    if (!resp.ok) {
      return new Response('[]', { headers: { 'Content-Type': 'application/json' } });
    }

    const data = await resp.json();
    const states = data.states ?? [];

    const flights = states
      .filter(s => s[1]?.trim() && s[5] !== null && s[6] !== null && !s[8])
      .slice(0, 300)
      .map(s => ({
        icao24:        s[0],
        callsign:      s[1].trim(),
        originCountry: s[2],
        longitude:     s[5],
        latitude:      s[6],
        altitude:      s[7] ? Math.round(s[7] * 3.281) : 0,
        onGround:      s[8],
        velocity:      s[9] ? Math.round(s[9] * 1.944) : 0,
        heading:       s[10] ?? 0,
        verticalRate:  s[11] ?? 0,
      }));

    return new Response(JSON.stringify(flights), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch {
    return new Response('[]', { headers: { 'Content-Type': 'application/json' } });
  }
}
