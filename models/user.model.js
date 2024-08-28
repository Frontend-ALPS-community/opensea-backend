const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const dayjs = require('dayjs');

const UserSchema = mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Please enter user name'],
    unique: true,
  },
  email: {
    type: String,
    required: [true, 'Please enter email'],
    unique: true,
  },
  password: {
    type: String,
    required: [true, 'Please enter password'],
  },
  favorites: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Card',
    },
  ], // 사용자가 좋아요 누른 카드들
  collectedCards: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Card',
    },
  ], // 사용자가 수집한 카드들
  wallet: {
    type: Number,
    default: 1,
  },
  offers: [
    {
      cardId: { type: mongoose.Schema.Types.ObjectId, ref: 'Card' },
      date: { type: Date, default: dayjs().toDate() }, // 제안 날짜
      owner: { type: String }, // 기존 소유자
      price: { type: Number }, // 가격
      lastPrice: { type: Number }, // 마지막 가격
    },
  ],
  transaction: [
    {
      price: { type: Number },
      from: { type: String },
      to: { type: String },
      date: { type: Date },
    },
  ],
});

UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

UserSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', UserSchema);

module.exports = User;
