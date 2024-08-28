const dayjs = require('dayjs');
const Card = require('../models/card.model');
const User = require('../models/user.model');
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
    const { price, lowerLimitPrice, userId } = req.body;
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

    // 사용자 찾기
    const user = await User.findById(userId);
    if (!user) {
      return res.status(400).json({ message: '사용자를 찾을 수 없습니다.' });
    }

    const userOffer = {
      cardId: card._id,
      owner: card.owner,
      price: price,
      lastPrice: card.price.lastPrice,
    };

    user.offers.push(userOffer);
    await user.save();

    res.status(200).json({ card, user });
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
    const { username, userId } = req.body;
    const card = await Card.findById(id);
    const user = await User.findById(userId);
    const isFavorites = card.favorites.includes(username);
    const isFavoritesUser = user.favorites.includes(id);
    if (isFavorites && isFavoritesUser) {
      // 즐겨찾기 제거
      card.favorites = card.favorites.filter((item) => item !== username);
      user.favorites = user.favorites.filter((item) => item.toString() !== id);
    } else {
      // 즐겨찾기 추가
      card.favorites.push(username);
      user.favorites.push(id);
    }
    await card.save();
    await user.save();

    res.status(200).json({
      message: isFavorites ? 'delete' : 'add',
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const buyCard = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, username } = req.body;

    // 카드 정보 가져오기
    const card = await Card.findById(id);
    if (!card) {
      return res.status(404).json({ message: 'Card not found' });
    }

    const sellerName = card.owner;

    // 판매자 정보 가져오기
    const seller = await User.findOne({ username: sellerName });
    if (!seller) {
      return res.status(404).json({ message: 'Seller not found' });
    }

    const buyer = await User.findById(userId);
    if (!buyer) {
      return res.status(404).json({ message: 'Buyer not found' });
    }

    // 카드의 소유자 변경
    card.owner = username;

    // 판매자의 collectedCards 배열에서 카드 제거
    seller.collectedCards = seller.collectedCards.filter((cardId) => cardId.toString() !== id);

    // 구매자의 collectedCards 배열에 카드 추가
    buyer.collectedCards.push(card._id);

    await card.save();
    await seller.save();
    await buyer.save();

    res.status(200).json({ message: 'Card purchased successfully', card });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const purchaseCard = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    // 카드 정보 가져오기
    const card = await Card.findById(id);
    if (!card) {
      return res.status(404).json({ message: '카드를 찾을 수 없습니다.' });
    }

    const currentOwner = await User.findOne({ username: card.owner });
    if (!currentOwner) {
      return res.status(404).json({ message: '기존 소유자를 찾을 수 없습니다.' });
    }

    const newOwner = await User.findById(userId);
    if (!newOwner) {
      return res.status(404).json({ message: '새로운 소유자를 찾을 수 없습니다.' });
    }

    const price = card.price.currentPrice;

    // 기존 소유자의 wallet에 금액 추가 및 collectedCards에서 카드 제거
    currentOwner.wallet += price;
    currentOwner.collectedCards.pull(card._id);

    // 새 소유자의 wallet에서 금액 차감 및 collectedCards에 카드 추가
    if (newOwner.wallet < price) {
      return res.status(400).json({ message: '잔액이 부족합니다.' });
    }

    newOwner.wallet -= price;
    newOwner.collectedCards.push(card._id);

    // 카드의 가격 정보 업데이트
    card.price.lastPrice = price; // 기존 가격을 lastPrice로 저장
    card.price.currentPrice = null; // currentPrice 초기화
    card.price.priceHistory.push(price); // 거래된 가격을 priceHistory에 추가

    // 카드의 소유자를 새 소유자로 변경
    card.owner = newOwner.username;

    // 거래 내역 추가
    const transaction = {
      price: price,
      from: currentOwner.username,
      to: newOwner.username,
      date: dayjs().toDate(),
    };
    card.transaction.push(transaction);

    // offers 배열 초기화 (제안들 초기화)
    card.offers = [];

    // 모든 변경사항 저장
    await card.save();
    await currentOwner.save();
    await newOwner.save();

    res.status(200).json({ message: '카드가 성공적으로 구매되었습니다.', card });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getAllCards,
  getCard,
  createCardOffer,
  getPrice,
  Favorites,
  buyCard,
  purchaseCard,
};
