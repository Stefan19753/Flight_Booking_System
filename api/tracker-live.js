export const config = { runtime: 'edge' };

async function fetchRegion(url) {
  try {
    const resp = await fetch(url);
    if (!resp.ok) return [];
    const ct = resp.headers.get('content-type') ?? '';
    if (!ct.includes('application/json')) return [];
    const data = await resp.json();
    return data.ac ?? [];
  } catch {
    return [];
  }
}

export default async function handler() {
  try {
    const [na, eu, as] = await Promise.all([
      fetchRegion('https://api.airplanes.live/v2/point/45/-90/2500'),
      fetchRegion('https://api.airplanes.live/v2/point/50/15/2500'),
      fetchRegion('https://api.airplanes.live/v2/point/30/100/2500'),
    ]);

    const seen = new Set();
    const flights = [];

    for (const a of [...na, ...eu, ...as]) {
      if (!a.flight?.trim() || a.lon == null || a.lat == null || a.ground) continue;
      if (seen.has(a.hex)) continue;
      seen.add(a.hex);
      flights.push({
        icao24:        a.hex,
        callsign:      a.flight.trim(),
        originCountry: a.r ?? '',
        longitude:     a.lon,
        latitude:      a.lat,
        altitude:      a.alt_baro ? Math.round(a.alt_baro) : 0,
        onGround:      false,
        velocity:      a.gs ? Math.round(a.gs) : 0,
        heading:       a.track ?? 0,
        verticalRate:  a.baro_rate ?? 0,
      });
      if (flights.length >= 500) break;
    }

    return new Response(JSON.stringify(flights), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
