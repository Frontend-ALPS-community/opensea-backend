require('dotenv').config();
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const User = require('./models/user.model');
const authMiddleware = require('./middleware/authMiddleware');
const port = 3001;

app.use(express.json());
app.use(cookieParser());

app.post('/api/register', async (req, res) => {
  try {
    const user = await User.create(req.body);
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ message: 'Invalid username or password' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid username or password' });
    }

    const token = jwt.sign({ userId: user._id }, 'your_jwt_secret', { expiresIn: '1h' });
    res.cookie('token', token, { httpOnly: true });

    res.status(200).json({ message: 'Login successful' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.post('/api/logout', (req, res) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(400).json({ message: 'No token found in cookies' });
  }

  res.clearCookie('token');
  res.status(200).json({ message: 'Logout successful' });
});

app.post('/api/my-page', authMiddleware, (req, res) => {
  console.log(req.user);
  res.status(200).json({ message: 'welcome to your page!', user: req.user });
});

mongoose
  .connect(process.env.MONGODB_URL)
  .then(() => {
    console.log('Connected to Database');
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  })
  .catch(() => {
    console.log('Connection Failed');
  });
