export const config = { runtime: 'edge' };

export default async function handler() {
  try {
    const resp = await fetch('https://api.adsb.lol/v2/ladd');
    if (!resp.ok) return new Response('[]', { headers: { 'Content-Type': 'application/json' } });

    const data = await resp.json();
    const aircraft = data.ac ?? [];

    const flights = aircraft
      .filter(a => a.flight?.trim() && a.lon != null && a.lat != null && !a.ground)
      .slice(0, 300)
      .map(a => ({
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
      }));

    return new Response(JSON.stringify(flights), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
