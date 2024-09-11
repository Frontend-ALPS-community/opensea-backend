const express = require('express');
const router = express.Router();
const {
  register,
  login,
  logout,
  status,
  refreshAccessToken,
} = require('../controllers/auth.controller');
const {
  getFavorites,
  updateUserOffers,
  getOffers,
  getCollectedCards,
} = require('../controllers/user.controller');

router.post('/register', register);

router.post('/login', login);

router.post('/logout', logout);

router.get('/status', status);

router.post('/refreshAccessToken', refreshAccessToken);

router.post('/favorites', getFavorites);

router.post('/offers', getOffers);

router.post('/getCollectedCards', getCollectedCards);

module.exports = router;
