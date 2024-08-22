require('dotenv').config();
const User = require('../models/user.model');
const jwt = require('jsonwebtoken');

const register = async (req, res) => {
  try {
    const user = await User.create(req.body);
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const token = jwt.sign({ userId: user._id, username: user.username }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });

    const refreshToken = jwt.sign(
      { userId: user._id, username: user.username },
      process.env.JWT_SECRET,
      {
        expiresIn: '7d',
      }
    );

    res.cookie('token', token, { httpOnly: true });
    res.cookie('refreshToken', refreshToken, { httpOnly: true });

    res.status(200).json({ message: 'Login successful' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const refreshAccessToken = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) {
    return res.status(400).json({ message: 'Refresh token not found, login again' });
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
    const accessToken = jwt.sign(
      { userId: decoded.userId, username: decoded.username },
      process.env.JWT_SECRET,
      {
        expiresIn: '1h',
      }
    );

    res.cookie('token', accessToken, { httpOnly: true });
    res.status(200).json({ accessToken });
  } catch (err) {
    return res.status(403).json({ message: 'Invalid refresh token, login again' });
  }
};

const logout = async (req, res) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(400).json({ message: 'No token found in cookies' });
  }

  res.clearCookie('token');
  res.clearCookie('refreshToken');
  res.status(200).json({ message: 'Logout successful' });
};

const status = async (req, res) => {
  const token = req.cookies.token;

  if (!token) {
    return res.json({ loggedIn: false });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return res.status(200).json({ loggedIn: true, decoded });
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired', loggedIn: false });
    } else {
      return res.status(400).json({ message: 'Token is not valid', loggedIn: false });
    }
  }
};

module.exports = {
  register,
  login,
  logout,
  status,
  refreshAccessToken,
};
