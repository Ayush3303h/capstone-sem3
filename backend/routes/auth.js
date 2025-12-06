// const express = require('express');
// const router = express.Router();
// const { OAuth2Client } = require('google-auth-library');
// const User = require('../models/User');
// const Restaurant = require('../models/Restaurant');
// const jwt = require('jsonwebtoken');

// const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// router.post('/oauth/google', async (req,res) => {
//   const { id_token, restaurantSlug } = req.body;
//   if (!id_token) return res.status(400).json({ error: 'id_token required' });
//   try {
//     const ticket = await client.verifyIdToken({ idToken: id_token, audience: process.env.GOOGLE_CLIENT_ID });
//     const payload = ticket.getPayload();
//     const email = (payload.email || '').toLowerCase();
//     const name = payload.name || payload.email;
//     // find restaurant
//     const restaurant = await Restaurant.findOne({ slug: restaurantSlug });
//     // find/create user
//     let user = await User.findOne({ email });
//     if (!user) {
//       user = new User({ email, name, oauthProvider: 'google', role: 'user' });
//     }
//     // if restaurant adminEmails contains this email, set role=admin and link restaurantId
//     if (restaurant && Array.isArray(restaurant.adminEmails) && restaurant.adminEmails.map(e=>e.toLowerCase()).includes(email)) {
//       user.role = 'admin';
//       user.restaurantId = restaurant._id;
//     }
//     await user.save();
//     const token = jwt.sign({ sub: user._id.toString(), email: user.email, role: user.role, restaurantId: user.restaurantId }, process.env.JWT_SECRET, { expiresIn: '12h' });
//     res.json({ token, user: { id: user._id, email: user.email, role: user.role, restaurantId: user.restaurantId }});
//   } catch (err) {
//     console.error('OAuth verify error', err);
//     res.status(400).json({ error: 'Invalid id_token' });
//   }
// });

// module.exports = router;



// // backend/routes/auth.js
// const express = require("express");
// const jwt = require("jsonwebtoken");
// const { OAuth2Client } = require("google-auth-library");
// const User = require("../models/User");
// const Restaurant = require("../models/Restaurant");

// const router = express.Router();

// const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
// const JWT_SECRET = process.env.JWT_SECRET || "dev_secret";

// // POST /api/v1/auth/oauth/google
// router.post("/oauth/google", async (req, res) => {
//   try {
//     const { id_token, restaurantSlug } = req.body;

//     if (!id_token) {
//       return res.status(400).json({ error: "id_token required" });
//     }

//     // 1) Verify token with Google
//     const ticket = await client.verifyIdToken({
//       idToken: id_token,
//       audience: process.env.GOOGLE_CLIENT_ID,
//     });

//     const payload = ticket.getPayload();
//     // Google always puts the unique user id in `sub`
//     const googleId = payload.sub;
//     const email = payload.email;
//     const name = payload.name;
//     const picture = payload.picture;

//     if (!googleId || !email) {
//       return res.status(400).json({ error: "Invalid Google user payload" });
//     }

//     // 2) Find restaurant (by slug coming from frontend)
//     const restaurant = await Restaurant.findOne({ slug: restaurantSlug });
//     if (!restaurant) {
//       return res.status(404).json({ error: "Restaurant not found" });
//     }

//     // 3) Ensure this user exists in DB
//     let user = await User.findOne({ googleId });

//     if (!user) {
//       user = await User.create({
//         googleId,              // <-- IMPORTANT: this was missing before
//         email,
//         name,
//         picture,
//         role: "admin",         // or decide role based on email list
//         restaurantId: restaurant._id,
//       });
//     } else {
//       // optional: keep user info up to date
//       user.name = name;
//       user.picture = picture;
//       user.email = email;
//       user.restaurantId = restaurant._id;
//       await user.save();
//     }

//     // 4) Create JWT
//     const token = jwt.sign(
//       {
//         userId: user._id.toString(),
//         role: user.role,
//         restaurantId: restaurant._id.toString(),
//         email: user.email,
//       },
//       JWT_SECRET,
//       { expiresIn: "7d" }
//     );

//     return res.json({
//       token,
//       user: {
//         id: user._id,
//         name: user.name,
//         email: user.email,
//         picture: user.picture,
//         role: user.role,
//         restaurantId: restaurant._id,
//       },
//     });
//   } catch (err) {
//     console.error("OAuth verify error", err);
//     return res.status(400).json({ error: "Google authentication failed" });
//   }
// });

// module.exports = router;





// // backend/routes/auth.js
// const express = require("express");
// const jwt = require("jsonwebtoken");
// const { OAuth2Client } = require("google-auth-library");

// const User = require("../models/User");
// const Restaurant = require("../models/Restaurant");

// const router = express.Router();

// const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
// const JWT_SECRET = process.env.JWT_SECRET || "dev_secret";

// // ---------------- GOOGLE OAUTH LOGIN ----------------
// router.post("/oauth/google", async (req, res) => {
//   try {
//     const { id_token, restaurantSlug } = req.body;
//     if (!id_token) return res.status(400).json({ error: "id_token required" });

//     // 1) Verify Google token
//     const ticket = await client.verifyIdToken({
//       idToken: id_token,
//       audience: process.env.GOOGLE_CLIENT_ID,
//     });
//     const payload = ticket.getPayload();

//     // Google fields
//     const googleId = payload.sub;
//     const email = payload.email;
//     const name = payload.name;
//     const picture = payload.picture;

//     if (!googleId || !email) {
//       return res.status(400).json({ error: "Invalid Google user payload" });
//     }

//     // 2) Find restaurant using slug
//     const restaurant = await Restaurant.findOne({ slug: restaurantSlug });
//     if (!restaurant) {
//       return res.status(404).json({ error: "Restaurant not found" });
//     }

//     // 3) Check admin authorization (IMPORTANT)
//     if (!restaurant.adminEmails.includes(email)) {
//       return res.status(403).json({
//         error: `This restaurant admin is allowed only for ${restaurant.adminEmails.join(
//           ", "
//         )}`,
//       });
//     }

//     // 4) Find or create user
//     let user = await User.findOne({ googleId });

//     if (!user) {
//       user = await User.create({
//         googleId,
//         email,
//         name,
//         picture,
//         role: "admin",
//         restaurantId: restaurant._id,
//       });
//     } else {
//       // Update user info (optional)
//       user.name = name;
//       user.picture = picture;
//       user.email = email;
//       user.restaurantId = restaurant._id;
//       await user.save();
//     }

//     // 5) Create JWT
//     const token = jwt.sign(
//       {
//         userId: user._id.toString(),
//         role: user.role,
//         restaurantId: restaurant._id.toString(),
//         email: user.email,
//       },
//       JWT_SECRET,
//       { expiresIn: "7d" }
//     );

//     // 6) Send response
//     return res.json({
//       token,
//       user: {
//         id: user._id,
//         name: user.name,
//         email: user.email,
//         picture: user.picture,
//         role: user.role,
//         restaurantId: restaurant._id,
//       },
//     });
//   } catch (err) {
//     console.error("OAuth verify error", err);
//     return res.status(400).json({ error: "Google authentication failed" });
//   }
// });

// module.exports = router;







// backend/routes/auth.js
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
