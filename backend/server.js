// server.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const authRoutes = require('./routes/auth');

const app = express();
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI;

app.use(cors());
app.use(express.json());

app.get('/', (req, res)=>{
    res.send("Backend is Live")
})

// mount routes
app.use('/', authRoutes);

(async function start() {
  try {
    if (!MONGO_URI) throw new Error('MONGO_URI not set in .env');
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB connected');
    app.listen(PORT, () => console.log(`Server started on ${PORT}`));
  } catch (err) {
    console.error('Start error:', err);
    process.exit(1);
  }
})();