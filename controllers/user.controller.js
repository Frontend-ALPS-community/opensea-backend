require('dotenv').config();
const User = require('../models/user.model');
const Card = require('../models/card.model');

const getFavorites = async (req, res) => {
  try {
    const { userId } = req.body;
    const user = await User.findById(userId).populate('favorites');
    if (user.favorites.length > 0) {
      res.status(200).json(user.favorites);
    } else {
      res.status(400).json({ message: 'invalid Favorites' });
    }
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const getOffers = async (req, res) => {
  try {
    const { userId } = req.body;
    const user = await User.findById(userId).populate('offers.cardId');
    res.status(200).json(user.offers);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const getCollectedCards = async (req, res) => {
  try {
    const { userId } = req.body;
    const user = await User.findById(userId).populate('collectedCards');
    if (user.collectedCards.length > 0) {
      res.status(200).json(user.collectedCards);
    } else {
      res.status(400).json({ message: 'invalid Favorites' });
    }
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

module.exports = {
  getFavorites,
  getOffers,
  getCollectedCards,
};
