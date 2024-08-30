const express = require('express');
const router = express.Router();
const {
  getAllCards,
  getCard,
  createCardOffer,
  getPrice,
  Favorites,
  purchaseCard,
  sellStart,
} = require('../controllers/card.controller');

router.get('/', getAllCards);

router.get('/priceInfo', getPrice);

router.get('/:id', getCard);

router.post('/:id/offers', createCardOffer);

router.post('/:id/favorites', Favorites);

router.post('/:id/purchaseCard', purchaseCard);

router.post('/:id/sellSetting', sellStart);

module.exports = router;
