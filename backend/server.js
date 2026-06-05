require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:4200').split(',');
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));

app.use(express.json());

app.use('/api/auth',     require('./routes/auth'));
app.use('/api/bookings', require('./routes/bookings'));
app.use('/api/cart',     require('./routes/cart'));
app.use('/api/tracker',  require('./routes/tracker'));

app.get('/api/health', (_req, res) => res.json({ status: 'ok', time: new Date() }));

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Flight Booking API running at http://localhost:${PORT}`);
  });
}

module.exports = app;
