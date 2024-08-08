const express = require('express');
const router = express.Router();
const { getAllCards } = require('../controllers/card.controller');

router.get('/', getAllCards);

module.exports = router;
