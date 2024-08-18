const mongoose = require('mongoose');

const cardSchema = mongoose.Schema({
  image: { type: String, required: true }, // 이미지 URL 또는 경로
  saleEndDate: { type: Date, default: null }, // 판매 종료일
  cardName: { type: String, required: true, unique: true }, // 카드 이름
  owner: { type: String, default: null }, // 소유자 이름
  price: {
    currentPrice: { type: Number, default: null }, // 현재 가격
    lastPrice: { type: Number }, // 마지막 가격
    priceHistory: { type: [Number], default: [] }, // 가격 기록
  },
  views: { type: Number, default: 0 }, // 조회수
  favorites: { type: [String], default: [] }, // 즐겨찾기한 유저들 이름
  attributes: {
    // 카드의 특성
    background: { type: String, default: null },
    type: { type: String, default: null },
    wing: { type: String, default: null },
    // 추가 특성이 있다면 여기 추가
  },
  offers: [
    {
      // 제안 리스트
      price: { type: Number }, // 제안 가격
      usdPrice: { type: Number },
      expired: { type: Boolean }, // 만료 여부
      expiryDate: { type: Date, default: Date.now }, // 만료 날짜/시간
      priceDifference: { type: String },
      proposer: { type: String }, // 제안자 이름
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

const Card = mongoose.model('Card', cardSchema);

module.exports = Card;
