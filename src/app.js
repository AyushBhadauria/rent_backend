const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth.routes');
const productsRoutes = require('./routes/products.routes');
const enquiriesRoutes = require('./routes/enquiries.routes');

const app = express();

const allowedOrigins = (process.env.CORS_ORIGINS || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: allowedOrigins.length ? allowedOrigins : true,
  })
);
app.use(express.json());

app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.use('/api/auth', authRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/enquiries', enquiriesRoutes);

app.use((req, res) => {
  res.status(404).json({ message: 'Not found' });
});

// Central error handler: routes/controllers are async and unhandled
// rejections are forwarded here via the wrapper in server.js.
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ message: err.message || 'Internal server error' });
});

module.exports = app;
