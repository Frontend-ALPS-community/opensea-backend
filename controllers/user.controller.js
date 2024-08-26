require('dotenv').config();
const User = require('../models/user.model');
const Card = require('../models/card.model');

const addFavorite = async (req, res) => {
  try {
    const { id } = req.params;
    const user = User.findById();
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  addFavorite,
};
