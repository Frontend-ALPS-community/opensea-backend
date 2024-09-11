const dayjs = require('dayjs');
const Card = require('../models/card.model');
const User = require('../models/user.model');
const calcPriceDiffer = require('../util/calcPriceDiffer');
const calcUsdPrice = require('../util/calcUsdPrice');

const colorObj = {
  gray: '#CED4D9',
  green: '#95DBAD',
  pink: '#FCB5DB',
  yellow: '#F5CD71',
  purple: '#ABA3FF',
  blue: '#99CEFF',
};

// 색상 이름을 색상 코드로 변환하는 함수
const getColorCode = (colorName) => {
  return colorObj[colorName] || colorName; // colorObj에 없는 경우 색상 이름을 그대로 반환
};

const getAllCards = async (req, res) => {
  try {
    const { sort, colors } = req.query;

    // 색상 필터를 위한 쿼리 조건 생성
    const colorFilter = colors
      ? { 'attributes.background': { $in: colors.split(',').map(getColorCode) } }
      : {};

    // 카드 데이터 조회 및 정렬
    let cardsQuery = Card.find(colorFilter);

    if (sort === 'price_asc') {
      cardsQuery = cardsQuery.sort({ 'price.currentPrice': 1 }); // 낮은 가격 순
    } else if (sort === 'price_desc') {
      cardsQuery = cardsQuery.sort({ 'price.currentPrice': -1 }); // 높은 가격 순
    } else {
      // 기본 정렬 (낮은 가격 순)
      cardsQuery = cardsQuery.sort({ 'price.currentPrice': 1 });
    }

    const cards = await cardsQuery;

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
    const validPrices = cards
      .map((item) => item.price.currentPrice)
      .filter((price) => price != null && price > 0);
    const total = parseFloat(validPrices.reduce((acc, curr) => acc + curr, 0).toFixed(3));

    const min = validPrices.length > 0 ? Math.min(...validPrices) : null;
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
    card.saleEndDate = null;

    // 모든 변경사항 저장
    await card.save();
    await currentOwner.save();
    await newOwner.save();

    res.status(200).json({ message: '카드가 성공적으로 구매되었습니다.', card });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const acceptOffer = async (req, res) => {
  try {
    const { cardId } = req.params;
    const { username, offerId } = req.body; // 현재 소유자(userId) 정보를 받아옴

    // 카드 정보 가져오기
    const card = await Card.findById(cardId);
    if (!card) {
      return res.status(404).json({ message: '카드를 찾을 수 없습니다.' });
    }

    // 제안 정보 가져오기
    const offer = card.offers.id(offerId);
    if (!offer) {
      return res.status(404).json({ message: '제안을 찾을 수 없습니다.' });
    }

    const proposer = await User.findOne({ username: offer.proposer }); // 제안한 사람 정보
    const currentOwner = await User.findOne({ username }); // 현재 소유자 정보

    if (!proposer) {
      return res.status(404).json({ message: '제안자를 찾을 수 없습니다.' });
    }
    if (!currentOwner) {
      return res.status(404).json({ message: '기존 소유자를 찾을 수 없습니다.' });
    }

    const offerPrice = offer.price;

    // 제안자의 잔액 확인
    if (proposer.wallet < offerPrice) {
      return res.status(400).json({ message: '잔액이 부족합니다.' });
    }

    // 기존 소유자의 wallet에 금액 추가 및 제안자의 wallet에서 금액 차감
    proposer.wallet -= offerPrice;
    currentOwner.wallet += offerPrice;

    // 카드의 소유자를 제안자로 변경
    card.owner = proposer.username;

    // 카드의 가격 정보 업데이트
    card.price.lastPrice = offerPrice; // 현재 거래 가격을 lastPrice로 저장
    card.price.currentPrice = null; // currentPrice 초기화
    card.price.priceHistory.push(offerPrice); // 가격 히스토리에 추가

    // 거래 기록 추가
    const transaction = {
      price: offerPrice,
      from: currentOwner.username,
      to: proposer.username,
      date: dayjs().toDate(),
    };
    card.transaction.push(transaction);

    // 카드의 제안 리스트 초기화
    card.offers = [];

    // 모든 변경사항 저장
    await card.save();
    await proposer.save();
    await currentOwner.save();

    res.status(200).json({ message: '거래가 성공적으로 완료되었습니다.', card });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const sellStart = async (req, res) => {
  try {
    const { id } = req.params;
    const { price } = req.body;

    // 카드 정보 가져오기
    const card = await Card.findById(id);
    if (!card) {
      return res.status(404).json({ message: '카드를 찾을 수 없습니다.' });
    }

    // 현재 날짜에 7일 더하기
    const saleEndDate = dayjs().add(7, 'day').toDate();

    // saleEndDate와 currentPrice 업데이트
    card.saleEndDate = saleEndDate;
    card.price.currentPrice = price;

    // 변경사항 저장
    await card.save();

    res.status(200).json({ message: '카드 판매가 시작되었습니다.', card });
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
  purchaseCard,
  sellStart,
  acceptOffer,
};
