const { Schema, model } = require('mongoose');

const RestaurantSchema = new Schema({
  slug: { type: String, required: true, unique: true },
  name: String,
  adminEmails: [String],
  settings: Schema.Types.Mixed,
  createdAt: { type: Date, default: Date.now }
});

module.exports = model('Restaurant', RestaurantSchema);
