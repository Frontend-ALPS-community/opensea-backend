require('dotenv').config();
const express = require('express');
const app = express();
const cron = require('node-cron');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const User = require('./models/user.model');
const createCards = require('./create/cards');
const cors = require('cors');
const authMiddleware = require('./middleware/authMiddleware');
const Card = require('./models/card.model');
const userRoute = require('./routes/user.route');
const cardRoute = require('./routes/card.route');
const removeExpiredOffers = require('./util/removeExpiredOffer');
const dayjs = require('dayjs');
const port = 3001;

// middleware
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());
app.use('/api/uploads', express.static('uploads'));

// routes
app.use('/api/auth', userRoute);
app.use('/api/cards', cardRoute);

app.use((err, req, res, next) => {
  console.error(err); // 서버 콘솔에 에러 로그
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ message: 'Token expired' });
  }
  // 다른 에러 처리
  return res.status(500).json({ message: 'Internal Server Error' });
});

cron.schedule('0 * * * *', async () => {
  await removeExpiredOffers();
});

cron.schedule('0 * * * *', async () => {
  try {
    const now = dayjs().toDate();
    // saleEndDate가 현재 시각보다 이전인 카드를 찾아서 업데이트
    await Card.updateMany(
      { saleEndDate: { $lt: now } }, // saleEndDate가 현재 시각보다 이전인 조건
      { $set: { 'price.currentPrice': null, saleEndDate: null } }
    );
    console.log('Expired cards updated successfully');
  } catch (error) {
    console.error('Failed to update expired cards:', error);
  }
});

mongoose
  .connect(process.env.MONGODB_URL)
  .then(() => {
    // for (let i = 0; i < 4; i++) {
    //   createCards('water', i + 1);
    // }
    console.log('Connected to Database');
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  })
  .catch(() => {
    console.log('Connection Failed');
  });
