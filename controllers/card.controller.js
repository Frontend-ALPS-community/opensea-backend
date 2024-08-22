const Card = require('../models/card.model');
const calcPriceDiffer = require('../util/calcPriceDiffer');
const calcUsdPrice = require('../util/calcUsdPrice');

const getAllCards = async (req, res) => {
  try {
    const cards = await Card.find({});
    res.status(200).json(cards);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const getCard = async (req, res) => {
  try {
    const { id } = req.params;
    const card = await Card.findById(id);
    card.views += 1;
    await card.save();
    res.status(200).json(card);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const createCardOffer = async (req, res) => {
  try {
    const { id } = req.params;
    const { price, lowerLimitPrice } = req.body;
    const priceDifference = calcPriceDiffer(price, lowerLimitPrice);
    const usdPrice = calcUsdPrice(price);
    req.body.usdPrice = usdPrice;
    req.body.priceDifference = priceDifference;

    const card = await Card.findById(id);

    if (!card) {
      return res.status(400).json({ message: '카드를 찾을 수 없습니다.' });
    }

    card.offers.push(req.body);
    await card.save();
    res.status(200).json(card);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const getPrice = async (req, res) => {
  try {
    const cards = await Card.find({});
    const total = parseFloat(
      cards
        .map((item) => item.price.currentPrice)
        .reduce((acc, curr) => acc + curr)
        .toFixed(3)
    );
    const min = Math.min(...cards.map((item) => item.price.currentPrice));
    res.status(200).json({ total, min });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const Favorites = async (req, res) => {
  try {
    const { id } = req.params;
    const { username } = req.body;
    const card = await Card.findById(id);
    const isFavorites = card.favorites.includes(username);
    if (isFavorites) {
      // 즐겨찾기 제거
      card.favorites = card.favorites.filter((item) => item !== username);
    } else {
      // 즐겨찾기 추가
      card.favorites.push(username);
    }
    await card.save();
    res.status(200).json({
      message: isFavorites ? '즐겨찾기에서 제거되었습니다.' : '즐겨찾기에 추가되었습니다.',
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

module.exports = {
  getAllCards,
  getCard,
  createCardOffer,
  getPrice,
  Favorites,
};
