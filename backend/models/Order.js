const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  name:     { type: String, required: true },
  price:    { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },
  category: { type: String }
}, { _id: false });

const orderSchema = new mongoose.Schema({
  // Customer info
  userId:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  username: { type: String, default: 'Guest' },
  email:    { type: String, required: true },
  phone:    { type: String, default: '' },

  // Delivery
  address:  { type: String, required: true },
  city:     { type: String, required: true },
  pincode:  { type: String, required: true },

  // Items
  items:    [orderItemSchema],
  total:    { type: Number, required: true },

  // Status
  status:   { type: String, enum: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'], default: 'pending' },

  // Payment
  paymentId: { type: String, default: '' },
  paymentMethod: { type: String, default: 'razorpay' },

  placedAt:  { type: Date, default: Date.now }
}, { timestamps: true });

orderSchema.index({ status: 1 });
orderSchema.index({ email: 1 });
orderSchema.index({ placedAt: -1 });

module.exports = mongoose.models.Order || mongoose.model('Order', orderSchema);