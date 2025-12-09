require('dotenv').config();
const admin = require('firebase-admin');
const { connectDB } = require('../config/db');
const Restaurant = require('../models/Restaurant');
const MenuItem = require('../models/MenuItem');
const Order = require('../models/Order');
const User = require('../models/User');

const serviceAccount = require(process.env.FIREBASE_SERVICE_ACCOUNT_PATH);

admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const firestore = admin.firestore();

async function migrate() {
  await connectDB(process.env.MONGODB_URI);
  console.log('Starting migration...');

  const restSnap = await firestore.collection('restaurants').get();
  for (const rDoc of restSnap.docs) {
    const r = rDoc.data();
    const restaurant = await Restaurant.create({
      slug: rDoc.id,
      name: r.name || rDoc.id,
      adminEmails: r.adminEmails || [],
      settings: r.settings || {}
    });
    console.log('Migrated restaurant', restaurant.slug);

    // menu
    const menuSnap = await firestore.collection('restaurants').doc(rDoc.id).collection('menu').get();
    for (const m of menuSnap.docs) {
      const md = m.data();
      await MenuItem.create({
        restaurantId: restaurant._id,
        name: md.name,
        description: md.description,
        price: md.price,
        category: md.category,
        imageURL: md.imageURL,
        veg: md.veg,
        spicy: md.spicy,
        createdAt: md.createdAt ? md.createdAt.toDate() : new Date()
      });
    }
    console.log('Menu migrated for', restaurant.slug);

    // orders
    const ordersSnap = await firestore.collection('restaurants').doc(rDoc.id).collection('orders').get();
    for (const o of ordersSnap.docs) {
      const od = o.data();
      await Order.create({
        restaurantId: restaurant._id,
        tableId: od.tableId || null,
        items: od.items || [],
        subtotal: od.subtotal,
        tax: od.tax,
        total: od.total,
        status: od.status || 'pending',
        completionTime: od.completionTime,
        startTime: od.startTime ? od.startTime.toDate() : undefined,
        createdAt: od.createdAt ? od.createdAt.toDate() : new Date()
      });
    }
    console.log('Orders migrated for', restaurant.slug);
  }

  // migrate users collection if exists
  const usersSnap = await firestore.collection('users').get();
  for (const u of usersSnap.docs) {
    const ud = u.data();
    await User.create({
      name: ud.name,
      email: ud.email,
      role: ud.role || 'user',
      createdAt: ud.createdAt ? ud.createdAt.toDate() : new Date()
    });
  }
  console.log('Users migrated');
  process.exit(0);
}

migrate().catch(err => { console.error(err); process.exit(1); });
