const mongoose = require('mongoose');
const Card = require('../models/card.model'); // Card 모델 가져오기
const dayjs = require('dayjs');

const removeExpiredOffers = async () => {
  try {
    const now = dayjs().toDate();

    // 만료된 오퍼를 제거하는 쿼리
    await Card.updateMany(
      { 'offers.expiryDate': { $lt: now } },
      { $pull: { offers: { expiryDate: { $lt: now } } } } // 현재 시간보다 이전이면 삭제
    );

    console.log('만료된 오퍼가 성공적으로 제거되었습니다.');
  } catch (error) {
    console.error('만료된 오퍼 제거 중 오류 발생:', error);
  }
};

module.exports = removeExpiredOffers;
