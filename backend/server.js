const express = require('express');
const cors    = require('cors');
const path    = require('path');
require('dotenv').config();

const connectDB      = require('./config/db');
const logger         = require('./utils/logger');
const { apiLimiter } = require('./middleware/rateLimit');

const app = express();

// ── Middleware ────────────────────────────────────────────────────────
app.use(cors({ origin: ['http://localhost:5000'], credentials: true }));
app.use(express.json());
app.use(apiLimiter);

// Request logger
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => logger.request(req.method, req.originalUrl, res.statusCode, Date.now() - start));
  next();
});

// ── API Routes ────────────────────────────────────────────────────────
app.use('/api/auth',        require('./routes/auth'));
app.use('/api/scores',      require('./routes/scores'));
app.use('/api/leaderboard', require('./routes/leaderboard'));
app.use('/api/admin',       require('./routes/admin'));
app.use('/api/ai',          require('./routes/ai'));

// ── Serve Admin Panel → http://localhost:5000/admin ───────────────────
app.use('/admin', express.static(path.join(__dirname, '../admin')));
app.get('/admin', (req, res) =>
  res.sendFile(path.join(__dirname, '../admin', 'index.html'))
);
app.get('/admin/*', (req, res) =>
  res.sendFile(path.join(__dirname, '../admin', 'index.html'))
);

// ── Serve Main Frontend → http://localhost:5000 ───────────────────────
app.use(express.static(path.join(__dirname, '../frontend')));
app.get('*', (req, res) =>
  res.sendFile(path.join(__dirname, '../frontend', 'health-sign-learn.html'))
);
// ── Global Error Handler ──────────────────────────────────────────────
app.use((err, req, res, next) => {
  logger.error(`Unhandled error: ${err.message}`);
  res.status(500).json({ error: 'Internal server error.' });
});

// ── 404 Handler ───────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.originalUrl} not found.` });
});

// ── Start ─────────────────────────────────────────────────────────────
if (require.main === module) {
  connectDB().then(() => {
    app.listen(process.env.PORT, () => {
      logger.success(`Server running → http://localhost:${process.env.PORT}`);
      logger.success(`Admin panel  → http://localhost:${process.env.PORT}/admin`);
    });
  });
} else {
  connectDB();
}

module.exports = app;