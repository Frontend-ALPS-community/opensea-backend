const express = require('express');
const router = express.Router();
const { getAllCards, getCard } = require('../controllers/card.controller');

router.get('/', getAllCards);

router.get('/:id', getCard);

module.exports = router;
