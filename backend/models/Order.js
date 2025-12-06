const { Schema, model } = require('mongoose');

const OrderItemSchema = new Schema({
  menuItemId: { type: Schema.Types.ObjectId, ref: 'MenuItem' },
  name: String,
  price: Number,
  quantity: Number,
  modifiers: Schema.Types.Mixed
}, { _id: false });

const OrderSchema = new Schema({
  restaurantId: { type: Schema.Types.ObjectId, ref: 'Restaurant', required: true },
  tableId: String,
  items: [OrderItemSchema],
  subtotal: Number,
  tax: Number,
  total: Number,
  status: { type: String, default: 'pending' }, // pending / approved / completed / rejected
  completionTime: Number, // minutes
  startTime: Date,
  createdAt: { type: Date, default: Date.now }
});

module.exports = model('Order', OrderSchema);
