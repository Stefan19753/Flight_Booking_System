const router = require('express').Router();
const db = require('../db/connection');
const requireAuth = require('../middleware/auth');

router.get('/', requireAuth, async (req, res) => {
  const { rows } = await db.query(
    'SELECT * FROM cart_items WHERE user_id = $1 ORDER BY added_at DESC',
    [req.user.id]
  );
  res.json(rows);
});

router.post('/', requireAuth, async (req, res) => {
  const { flightNumber, airline, originCode, originCity, destinationCode,
          destinationCity, departureTime, arrivalTime, duration, price, passengers } = req.body;

  const { rows } = await db.query(
    `INSERT INTO cart_items (user_id, flight_number, airline, origin_code, origin_city,
       destination_code, destination_city, departure_time, arrival_time, duration,
       price, passengers) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING id`,
    [req.user.id, flightNumber, airline, originCode, originCity,
     destinationCode, destinationCity, departureTime, arrivalTime, duration,
     price, passengers]
  );
  res.json({ id: rows[0].id });
});

router.delete('/:id', requireAuth, async (req, res) => {
  await db.query(
    'DELETE FROM cart_items WHERE id = $1 AND user_id = $2',
    [req.params.id, req.user.id]
  );
  res.json({ success: true });
});

router.post('/checkout', requireAuth, async (req, res) => {
  const { rows: items } = await db.query(
    'SELECT * FROM cart_items WHERE user_id = $1',
    [req.user.id]
  );
  if (items.length === 0) return res.status(400).json({ error: 'Cart is empty' });

  const seats = ['12A','14C','22B','31F','8D','5A','18E','25C','3B','7F'];
  const bookingIds = [];

  for (const item of items) {
    const seat = seats[Math.floor(Math.random() * seats.length)];
    const { rows } = await db.query(
      `INSERT INTO bookings (user_id, flight_number, airline, origin_code, origin_city,
         destination_code, destination_city, departure_time, arrival_time, duration,
         price, passengers, seat) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) RETURNING id`,
      [req.user.id, item.flight_number, item.airline, item.origin_code, item.origin_city,
       item.destination_code, item.destination_city, item.departure_time, item.arrival_time,
       item.duration, item.price, item.passengers, seat]
    );
    bookingIds.push(rows[0].id);
  }

  await db.query('DELETE FROM cart_items WHERE user_id = $1', [req.user.id]);
  res.json({ success: true, bookingIds });
});

module.exports = router;
