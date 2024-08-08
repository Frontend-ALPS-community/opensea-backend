const Card = require('../models/card.model');

const getAllCards = async (req, res) => {
  try {
    const cards = await Card.find({});
    res.status(200).json(cards);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

module.exports = {
  getAllCards,
};
