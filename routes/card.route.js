const express = require('express');
const router = express.Router();
const {
  getAllCards,
  getCard,
  createCardOffer,
  getPrice,
  Favorites,
  buyCard,
  purchaseCard,
} = require('../controllers/card.controller');

router.get('/', getAllCards);

router.get('/priceInfo', getPrice);

router.get('/:id', getCard);

router.post('/:id/offers', createCardOffer);

router.post('/:id/favorites', Favorites);

router.post('/:id/buy', buyCard);

router.post('/:id/purchaseCard', purchaseCard);

module.exports = router;
