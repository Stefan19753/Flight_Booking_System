const router = require('express').Router();
const sql = require('../db/connection');
const requireAuth = require('../middleware/auth');

router.get('/', requireAuth, async (req, res) => {
  try {
    const rows = await sql`SELECT * FROM cart_items WHERE user_id = ${req.user.id} ORDER BY added_at DESC`;
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not load cart' });
  }
});

router.post('/', requireAuth, async (req, res) => {
  try {
    const { flightNumber, airline, originCode, originCity, destinationCode,
            destinationCity, departureTime, arrivalTime, duration, price, passengers } = req.body;

    const rows = await sql`
      INSERT INTO cart_items
        (user_id, flight_number, airline, origin_code, origin_city,
         destination_code, destination_city, departure_time, arrival_time,
         duration, price, passengers)
      VALUES
        (${req.user.id}, ${flightNumber}, ${airline}, ${originCode}, ${originCity},
         ${destinationCode}, ${destinationCity}, ${departureTime}, ${arrivalTime},
         ${duration}, ${price}, ${passengers})
      RETURNING id`;
    res.json({ id: rows[0].id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not add to cart' });
  }
});

router.delete('/:id', requireAuth, async (req, res) => {
  try {
    await sql`DELETE FROM cart_items WHERE id = ${req.params.id} AND user_id = ${req.user.id}`;
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not remove item' });
  }
});

router.post('/checkout', requireAuth, async (req, res) => {
  try {
    const items = await sql`SELECT * FROM cart_items WHERE user_id = ${req.user.id}`;
    if (items.length === 0) return res.status(400).json({ error: 'Cart is empty' });

    const seats = ['12A','14C','22B','31F','8D','5A','18E','25C','3B','7F'];
    const bookingIds = [];

    for (const item of items) {
      const seat = seats[Math.floor(Math.random() * seats.length)];
      const rows = await sql`
        INSERT INTO bookings
          (user_id, flight_number, airline, origin_code, origin_city,
           destination_code, destination_city, departure_time, arrival_time,
           duration, price, passengers, seat)
        VALUES
          (${req.user.id}, ${item.flight_number}, ${item.airline}, ${item.origin_code}, ${item.origin_city},
           ${item.destination_code}, ${item.destination_city}, ${item.departure_time}, ${item.arrival_time},
           ${item.duration}, ${item.price}, ${item.passengers}, ${seat})
        RETURNING id`;
      bookingIds.push(rows[0].id);
    }

    await sql`DELETE FROM cart_items WHERE user_id = ${req.user.id}`;
    res.json({ success: true, bookingIds });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Checkout failed' });
  }
});

module.exports = router;
