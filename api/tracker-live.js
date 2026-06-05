export const config = { runtime: 'edge' };

export default async function handler() {
  try {
    const resp = await fetch('https://data.vatsim.net/v3/vatsim-data.json');
    if (!resp.ok) return new Response('[]', { headers: { 'Content-Type': 'application/json' } });

    const data = await resp.json();
    const pilots = data.pilots ?? [];

    const flights = pilots
      .filter(p => p.callsign && p.groundspeed > 50)
      .slice(0, 500)
      .map(p => ({
        icao24:        p.callsign.toLowerCase(),
        callsign:      p.callsign,
        originCountry: p.flight_plan?.departure?.slice(0, 2) ?? '',
        longitude:     p.longitude,
        latitude:      p.latitude,
        altitude:      p.altitude,
        onGround:      false,
        velocity:      p.groundspeed,
        heading:       p.heading,
        verticalRate:  0,
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
