const mongoose = require('mongoose');
const offerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  discountType: {
    type: String,
    enum: ['percentage', 'fixed_amount'],
    required: true
  },
  discountValue: {
    type: Number,
    required: true
  },
  products: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Categories',
    required: true
  }]
});

module.exports = mongoose.model('Offer', offerSchema);
