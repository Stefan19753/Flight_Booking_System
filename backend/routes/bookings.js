const router = require('express').Router();
const db = require('../db/connection');
const requireAuth = require('../middleware/auth');

router.get('/', requireAuth, async (req, res) => {
  const { rows } = await db.query(
    'SELECT * FROM bookings WHERE user_id = $1 ORDER BY booked_at DESC',
    [req.user.id]
  );
  res.json(rows);
});

router.post('/', requireAuth, async (req, res) => {
  const { flightNumber, airline, originCode, originCity, destinationCode,
          destinationCity, departureTime, arrivalTime, duration, price, passengers } = req.body;
  const seats = ['12A','14C','22B','31F','8D','5A','18E','25C','3B','7F'];
  const seat = seats[Math.floor(Math.random() * seats.length)];

  const { rows } = await db.query(
    `INSERT INTO bookings (user_id, flight_number, airline, origin_code, origin_city,
       destination_code, destination_city, departure_time, arrival_time, duration,
       price, passengers, seat) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) RETURNING id`,
    [req.user.id, flightNumber, airline, originCode, originCity,
     destinationCode, destinationCity, departureTime, arrivalTime, duration,
     price, passengers, seat]
  );
  res.json({ id: rows[0].id, seat });
});

router.put('/:id/cancel', requireAuth, async (req, res) => {
  await db.query(
    "UPDATE bookings SET status = 'cancelled' WHERE id = $1 AND user_id = $2",
    [req.params.id, req.user.id]
  );
  res.json({ success: true });
});

module.exports = router;
