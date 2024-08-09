const Card = require('../models/card.model');

const createCards = async () => {
  const cardsData = [
    {
      image: '/uploads/image29.svg',
      cardName: 'Sample Card 1',
      owner: 'John Doe',
      price: {
        initialPrice: 1000,
        currentPrice: 1000,
      },
      views: 0,
      attributes: {
        background: '#CED4D9',
        type: 'magic',
      },
    },
    {
      image: '/uploads/image35.svg',
      saleEndDate: new Date('2024-11-30'),
      cardName: 'Sample Card 2',
      owner: 'Jane Smith',
      price: {
        lastPrice: 2000,
        currentPrice: 1800,
        priceHistory: [2000, 1900, 1800],
      },
      views: 0,
      favorites: ['Dave', 'Eva'],
      attributes: {
        background: '#FCB5DB',
        type: 'fire',
        wing: 'phoenix',
      },
      offers: [
        {
          price: 1700,
          expired: false,
          proposer: 'Frank',
          transactionCompleted: false,
        },
      ],
    },
    // 필요한 만큼 추가
  ];

  try {
    const savedCards = await Card.insertMany(cardsData);
    console.log('Cards saved successfully:', savedCards);
  } catch (err) {
    console.error('Error saving cards:', err);
  }
};

module.exports = createCards;
