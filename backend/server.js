require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

const allowedOrigins = [
  'http://localhost:4200',
  ...((process.env.FRONTEND_URL || '').split(',').filter(Boolean)),
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin) || /\.vercel\.app$/.test(origin)) {
      return callback(null, true);
    }
    callback(null, false);
  },
  credentials: true,
}));

app.use(express.json());

app.use('/api/auth',     require('./routes/auth'));
app.use('/api/bookings', require('./routes/bookings'));
app.use('/api/cart',     require('./routes/cart'));
app.use('/api/tracker',  require('./routes/tracker'));
app.use('/api/chat',     require('./routes/chat'));

app.get('/api/health', (_req, res) => res.json({ status: 'ok', time: new Date() }));

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Flight Booking API running at http://localhost:${PORT}`);
  });
}

module.exports = app;
