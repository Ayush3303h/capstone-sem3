require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const { connectDB, mongoose } = require('./config/db');
const authRoutes = require('./routes/auth');
const restRoutes = require('./routes/restaurants');
const menuRoutes = require('./routes/menu');
const ordersRoutes = require('./routes/orders');

const app = express();
const server = http.createServer(app);

const { Server } = require('socket.io');
const io = new Server(server, { cors: { origin: '*' } });

// store io instance for routes
app.set('io', io);

io.on('connection', (socket) => {
  // join restaurant room after client sends join event w/ token or restaurantId
  socket.on('join', ({ restaurantId }) => {
    if (restaurantId) socket.join(`restaurant:${restaurantId}`);
  });
});

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/restaurants', restRoutes);
app.use('/api/v1/restaurants', menuRoutes);    // /:slug/menu
app.use('/api/v1/restaurants', ordersRoutes);  // /:slug/orders

const start = async () => {
  await connectDB(process.env.MONGODB_URI);
  const port = process.env.PORT || 4000;
  server.listen(port, () => console.log(`Server running on ${port}`));
};
start();