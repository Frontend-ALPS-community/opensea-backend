const mongoose = require('mongoose');

const offerSchema = mongoose.Schema({
  cardId: { type: mongoose.Schema.ObjectId, ref: 'Card' },
  userId: { type: mongoose.Schema.ObjectId, ref: 'User' },
  price: { type: Number },
  createdAt: { type: Date },
  isAccepted: { type: Boolean },
});

const Offer = mongoose.model('Offer', offerSchema);

module.exports = Offer;
