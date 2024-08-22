const express = require('express');
const router = express.Router();
const {
  getAllCards,
  getCard,
  createCardOffer,
  getPrice,
  Favorites,
} = require('../controllers/card.controller');

router.get('/', getAllCards);

router.get('/priceInfo', getPrice);

router.get('/:id', getCard);

router.post('/:id/offers', createCardOffer);

router.post('/:id/favorites', Favorites);

module.exports = router;
