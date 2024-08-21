const express = require('express');
const router = express.Router();
const {
  register,
  login,
  logout,
  status,
  refreshAccessToken,
} = require('../controllers/auth.controller');

router.post('/register', register);

router.post('/login', login);

router.post('/logout', logout);

router.get('/status', status);

router.post('/refreshAccessToken', refreshAccessToken);

module.exports = router;
