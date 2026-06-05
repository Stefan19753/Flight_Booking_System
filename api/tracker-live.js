export const config = { runtime: 'edge' };

export default async function handler() {
  try {
    const regions = [
      'https://api.airplanes.live/v2/point/45/-90/2500',
      'https://api.airplanes.live/v2/point/50/15/2500',
      'https://api.airplanes.live/v2/point/30/100/2500',
    ];

    const responses = await Promise.all(regions.map(url => fetch(url)));
    const jsons = await Promise.all(responses.map(r => r.json()));

    const seen = new Set();
    const flights = [];

    for (const data of jsons) {
      for (const a of (data.ac ?? [])) {
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
