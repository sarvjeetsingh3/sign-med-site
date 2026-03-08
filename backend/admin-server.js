const express = require('express');
const mongoose = require('mongoose');
const cors    = require('cors');
const path    = require('path');
require('dotenv').config();

const app = express();
app.use(cors({
  origin: ['http://localhost:5000', 'http://localhost:5001'],
  credentials: true
}));
app.use(express.json());

// Admin API routes
app.use('/api/admin', require('./routes/admin'));

// Serve admin frontend
app.use(express.static(path.join(__dirname, '../admin')));
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../admin', 'index.html'));
});

// Connect DB + start on port 5001
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    app.listen(5001, () =>
      console.log('🛡️  Admin dashboard running on http://localhost:5001')
    );
  })
  .catch(err => console.error('❌ DB Error:', err));