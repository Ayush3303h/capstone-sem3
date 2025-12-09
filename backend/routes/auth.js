const express = require('express');
const router = express.Router();
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');
const Restaurant = require('../models/Restaurant');
const jwt = require('jsonwebtoken');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

router.post('/oauth/google', async (req, res) => {
  const { id_token, restaurantSlug } = req.body;

  if (!id_token) {
    return res.status(400).json({ error: 'id_token required' });
  }

  try {
    // 1) Verify Google ID token
    const ticket = await client.verifyIdToken({
      idToken: id_token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const email = (payload.email || '').toLowerCase().trim();
    const name = payload.name || payload.email;

    // 2) Find restaurant by slug
    const restaurant = await Restaurant.findOne({ slug: restaurantSlug });

    if (!restaurant) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }

    const adminEmails = Array.isArray(restaurant.adminEmails)
      ? restaurant.adminEmails.map((e) => (e || '').toLowerCase().trim())
      : [];

    const isAdminForRestaurant = adminEmails.includes(email);

    // 3) If this email is NOT an admin for this restaurant → reject
    if (!isAdminForRestaurant) {
      return res
        .status(403)
        .json({ error: 'You are not an admin for this restaurant' });
    }

    // 4) Create / update user as ADMIN for this restaurant
    let user = await User.findOne({ email });
    if (!user) {
      user = new User({
        email,
        name,
        oauthProvider: 'google',
        role: 'admin',
        restaurantId: restaurant._id,
        googleId: payload.sub, // keep googleId if your schema has it
      });
    } else {
      user.role = 'admin';
      user.restaurantId = restaurant._id;
      if (!user.googleId && payload.sub) {
        user.googleId = payload.sub;
      }
    }

    await user.save();

    // 5) Issue JWT
    const token = jwt.sign(
      {
        sub: user._id.toString(),
        email: user.email,
        role: user.role,
        restaurantId: user.restaurantId,
      },
      process.env.JWT_SECRET,
      { expiresIn: '12h' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        restaurantId: user.restaurantId,
      },
    });
  } catch (err) {
    console.error('OAuth verify error', err);
    res.status(400).json({ error: 'Invalid id_token' });
  }
});

module.exports = router;