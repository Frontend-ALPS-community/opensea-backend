const Card = require('../models/card.model');

function getRandomColor(arr) {
  const randomIndex = Math.floor(Math.random() * arr.length);
  return arr[randomIndex];
}
const colorArr = ['#CED4D9', '#95DBAD', '#FCB5DB', '#F5CD71', '#ABA3FF', '#99CEFF'];

const createCards = async (type, num) => {
  const randomNumber = Math.floor(Math.random() * (5000 - 100 + 1)) + 100;
  const randomColor = getRandomColor(colorArr);
  const cardsData = [
    {
      image: `/uploads/${type}${num}.svg`,
      cardName: `Monsterz #${randomNumber}`,
      owner: `Happy${randomNumber}`,
      price: {
        lastPrice: 0.035,
        currentPrice: 0.027,
      },
      views: 0,
      attributes: {
        background: randomColor,
        type: type,
      },
    },
    /*     {
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
          expiryDate: new Date(),
          proposer: 'Frank',
          transactionCompleted: false,
        },
      ],
    }, */
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
