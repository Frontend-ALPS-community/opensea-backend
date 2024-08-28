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
    const user = await User.findById(userId);
    res.status(200).json(user);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

module.exports = {
  getFavorites,
  getOffers
};
