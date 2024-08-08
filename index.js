require('dotenv').config();
const express = require('express');
const app = express();
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

mongoose
  .connect(process.env.MONGODB_URL)
  .then(() => {
    createCards();
    console.log('Connected to Database');
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  })
  .catch(() => {
    console.log('Connection Failed');
  });
