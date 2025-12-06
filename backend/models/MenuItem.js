const { Schema, model } = require('mongoose');

const MenuItemSchema = new Schema({
  restaurantId: { type: Schema.Types.ObjectId, ref: 'Restaurant', required: true },
  name: String,
  description: String,
  price: Number,
  category: String,
  imageURL: String,
  veg: { type: Boolean, default: true },
  spicy: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = model('MenuItem', MenuItemSchema);
