const mongoose = require('mongoose');

async function connectDB(uri) {
  if (!uri) throw new Error('MONGODB_URI required');
  await mongoose.connect(uri, { dbName: process.env.MONGO_DBNAME || undefined });
  console.log('✅ MongoDB connected');
}

module.exports = { connectDB, mongoose };
