const router = require('express').Router();
const axios = require('axios');

// Cache OpenSky responses for 60s to respect rate limits
let cache = { data: null, ts: 0 };
const CACHE_TTL = 60_000;

router.get('/live', async (req, res) => {
  const now = Date.now();
  if (cache.data && now - cache.ts < CACHE_TTL) {
    return res.json(cache.data);
  }
  try {
    const resp = await axios.get('https://opensky-network.org/api/states/all', {
      timeout: 15_000,
    });
    const states = resp.data.states ?? [];

    const flights = states
      .filter(s => s[1]?.trim() && s[5] !== null && s[6] !== null && !s[8])
      .slice(0, 300)
      .map(s => ({
        icao24:        s[0],
        callsign:      s[1].trim(),
        originCountry: s[2],
        longitude:     s[5],
        latitude:      s[6],
        altitude:      s[7]  ? Math.round(s[7]  * 3.281) : 0,
        onGround:      s[8],
        velocity:      s[9]  ? Math.round(s[9]  * 1.944) : 0,
        heading:       s[10] ?? 0,
        verticalRate:  s[11] ?? 0,
      }));

    cache = { data: flights, ts: now };
    res.json(flights);
  } catch (err) {
    console.error('OpenSky error:', err.message);
    // Return stale cache if available
    if (cache.data) return res.json(cache.data);
    res.json([]);
  }
});

router.get('/search/:callsign', async (req, res) => {
  const callsign = req.params.callsign.toUpperCase().trim();
  try {
    // Search in cached data first
    if (cache.data) {
      const found = cache.data.filter(f =>
        f.callsign.toUpperCase().includes(callsign)
      );
      if (found.length > 0) return res.json(found);
    }
    res.json([]);
  } catch {
    res.json([]);
  }
});

module.exports = router;
